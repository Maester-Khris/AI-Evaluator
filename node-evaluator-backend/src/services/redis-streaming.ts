// src/services/redis-stream.service.ts
import { Socket } from 'node:dgram';
import { createClient, type RedisClientType, } from 'redis';
import type { Server } from 'socket.io';
import type { StreamMessageRequest, StreamMessageResponse, StreamResponse } from '../types/streaming.contract.js';
import { ChatDAO } from '../api/chat/chat.service.js';

// ======== export for gloabl used ================
const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.on('error', (err) => console.error('Redis Client Error', err));
export const connectRedis = async () => {
  if (!client.isOpen) await client.connect();
};
export { client };


const streamBuffers: Record<string, string> = {};

class RedisStreamService {
  private readonly REQ_QUEUE = 'queue:requests';
  private readonly RES_QUEUE = 'stream:results';

  private static instance: RedisStreamService;
  private isListening: boolean = false;

  constructor() {
    // Private-ish: Node caches the first execution of this file
    console.log("🚀 RedisStreamService Initialized (Singleton)");
  }

  /**
   * Enforces MessageRequest type. 
   * Note: Redis XADD values must be strings.
   */
  async pushRequest(payload: StreamMessageRequest) {
    return client.xAdd(this.REQ_QUEUE, '*', {
      correlationId: payload.correlationId,
      userId: payload.userId,
      conversationId: payload.conversationId,
      message: payload.message,
      context: JSON.stringify(payload.context),
    }, {
      TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: 1000 },
    });
  }

  // Listen for Results (Blocking Read)
  /**
   * Listens to Python's result stream and dispatches to UI/DB
   */
  async listenForLLMResults() {
    // switch to '0' / '$' to listen for previous results or only new
    // instead of fixed check if we haeve a saved offsets
    let lastId = '0'; 
    // let lastId = await client.get('stream:results:offset') || '$';

    while (true) {
      try {
        const response = (await client.xRead(
          [{ key: this.RES_QUEUE, id: lastId }],
          { BLOCK: 0, COUNT: 5 },
        )) as StreamResponse | null;

        if (!response) continue;

        if(response){
          console.log(`Received ${response[0]?.messages} data chunk from Python`);
        }

        for (const stream of response) {
          for (const message of stream.messages) {
            // Type-cast the flat string record from Redis to our Response Interface
            const data = message.message as unknown as StreamMessageResponse;
            const { correlationId, userId, conversationId, content, status } = data;

            // 1. Accumulate chunks in memory for the final DB save
            if (status === 'streaming') {
              streamBuffers[correlationId] = (streamBuffers[correlationId] || '') + content;
            }

            // 2. UI: Immediate Push (The "Typewriter" effect)
            // io.to(`room:user:${userId}`).emit('ai_chunk', {
            //   correlationId,
            //   conversationId,
            //   content,
            //   status
            // });

            // 3. Handle End of Stream
            if (status === 'done' || status === 'error') {
              const fullContent = streamBuffers[correlationId] || "";
              
              if (status === 'done' && fullContent) {
                console.log(`Finalizing message ${correlationId} for DB...`);
                console.log(`Full Content: ${fullContent}`);
                
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
            await client.xDel(this.RES_QUEUE, message.id);

            // 3. Update the offset key in Redis immediately
            lastId = message.id;
            // await client.set('stream:results:offset', lastId);
            // delete current entry in redis
                await client.xDel(this.RES_QUEUE, message.id);
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