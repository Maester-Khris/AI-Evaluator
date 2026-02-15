import { createClient, type RedisClientType, } from 'redis';
import EventEmitter from 'node:events';
import type { StreamMessageRequest, StreamMessageResponse, StreamResponse } from '../types/streaming.contract.js';
import { ChatDAO } from '../api/chat/chat.service.js';

// ======== export for gloabl used ================
import { redisConfig } from '../config/redis.js';

// Get the existing client from singleton
// Legacy export if needed, or better to remove it if unused elsewhere, 
// but keeping it compatible with existing imports just in case, 
// though `connectRedis` is now redundant.
// export const connectRedis = async () => {
//   await redisConfig.connect();
// };


// We won't export 'client' directly anymore to avoid confusion, or export the shared one
export const client = redisConfig.getClient();
const streamBuffers: Record<string, string> = {};

class RedisStreamService {
  private readonly REQ_QUEUE = 'queue:requests';
  private readonly RES_QUEUE = 'stream:results';
  public eventEmitter: EventEmitter;

  // Private-ish: Node caches the first execution of this file
  constructor() {
    this.eventEmitter = new EventEmitter();
    console.log("RedisStreamService Initialized (Singleton)");
  }

  /**
   * Enforces MessageRequest type. 
   * Note: Redis XADD values must be strings.
   */

  async pushToInferenceQueue(payload: StreamMessageRequest) {
    // Use shared client for pushing
    const sharedClient = redisConfig.getClient();
    const entryId = await sharedClient.xAdd(this.REQ_QUEUE, '*', {
      correlationId: String(payload.correlationId),
      userId: String(payload.userId),
      conversationId: String(payload.conversationId),
      message: payload.message,
      context: JSON.stringify(payload.context || []),
      roomId: payload.roomId || '',
    });

    console.log(`Redis XADD Success. ID: ${entryId} | Queue: ${this.REQ_QUEUE}`);
    return entryId;
  }



  /**
   * Listens to Python's result stream and dispatches to UI/DB
   * Listen for Results (Blocking Read)
   * Use dedicated blocking client for listening
   */
  async listenForLLMResults() {
    // switch to '0' / '$' to listen for previous results or only new
    // instead of fixed check if we haeve a saved offsets
    let lastId = '0';
    const blockingClient = await redisConfig.getBlockingClient();

    while (true) {
      try {
        const response = (await blockingClient.xRead(
          [{ key: this.RES_QUEUE, id: lastId }],
          { BLOCK: 0, COUNT: 5 },
        )) as StreamResponse | null;

        if (!response) continue;

        if (response) {
          console.log(`Received ${JSON.stringify(response[0]?.messages)} data chunk from Python`);
        }

        for (const stream of response) {
          for (const message of stream.messages) {
            const data = message.message as unknown as StreamMessageResponse;
            const { correlationId, userId, conversationId, roomId, content, status } = data;

            // 1. Accumulate chunks in memory for the final DB save
            if (status === 'streaming') {
              streamBuffers[correlationId] = (streamBuffers[correlationId] || '') + content;
            }

            // 2. Emit event for UI to display chunk
            this.eventEmitter.emit('chunk_received', {
              roomId,
              conversationId,
              content,
              isDone: status === 'done'
            });

            // 3. Handle End of Stream
            if (status === 'done' || status === 'error') {
              const fullContent = streamBuffers[correlationId] || "";

              if (status === 'done' && fullContent) {
                console.log(`Finalizing message ${correlationId} for DB...`);
                console.log(`Full Content: ${fullContent}`);
                console.log(`User ID: ${userId}`);

                // DATA OWNER: Save the Assistant's response to Postgres/Guest Storage
                await ChatDAO.saveMessage(
                  'assistant',
                  { text: fullContent, language: 'none' },
                  conversationId,
                  userId,
                  correlationId
                );
              }

              // Cleanup memory buffer
              delete streamBuffers[correlationId];
            }

            // delete current entry in redis
            await blockingClient.xDel(this.RES_QUEUE, message.id);

            // 3. Update the offset key in Redis immediately
            lastId = message.id;
            // await client.set('stream:results:offset', lastId);
            // delete current entry in redis
            await blockingClient.xDel(this.RES_QUEUE, message.id);
          }
        }
      } catch (err) {
        console.error('Stream processing error:', err);
        await new Promise(res => setTimeout(res, 2000)); // Cool down
      }
    }
  }
}

export const redisStream = new RedisStreamService();

// async pushToInferenceQueue(payload: StreamMessageRequest) {
//   // console.log('Redis queuer pushed:', payload);
//   console.log(`client.isOpen: ${client.isOpen}`);
//   console.log(`client.isReady: ${client.isReady}`);
//   try {
//     const entryId = await client.xAdd(this.REQ_QUEUE, '*', {
//       correlationId: String(payload.correlationId),
//       userId: String(payload.userId),
//       conversationId: String(payload.conversationId),
//       message: payload.message,
//       context: JSON.stringify(payload.context || []),
//       roomId: payload.roomId || '',
//     });

//     console.log(`Redis XADD Success. ID: ${entryId} | Queue: ${this.REQ_QUEUE}`);
//     return entryId;
//   } catch (error) {
//     console.error('Redis XADD Failed:', error);
//     throw error;
//   }
// }

// return client.xAdd(this.REQ_QUEUE, '*', {
//   correlationId: payload.correlationId,
//   userId: payload.userId,
//   conversationId: payload.conversationId,
//   message: payload.message,
//   context: JSON.stringify(payload.context),
//   roomId: payload.roomId,
// }, {
//   TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: 1000 },
// });


// 2. UI: Immediate Push (The "Typewriter" effect)
// Push the chunk to the specific conversation room
// part of the code that caused the dependency on socket-manager.ts
// emitToRoom(conversationId, 'ai_chunk', {
//   conversationId: conversationId,
//   chunk: content,
//   isDone: status === 'done'
// });
// io.to(`room:user:${userId}`).emit('ai_chunk', {
//   correlationId,
//   conversationId,
//   content,
//   status
// });