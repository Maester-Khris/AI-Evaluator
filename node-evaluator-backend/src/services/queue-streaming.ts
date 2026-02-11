// src/services/redis-stream.service.ts
import { Socket } from 'node:dgram';
import { createClient, type RedisClientType } from 'redis';

const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379'});

client.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  if (!client.isOpen) await client.connect();
};

export { client };

type StreamMessage = {
  id: string;
  message: Record<string, string>;
};

type StreamResponse = {
  name: string;
  messages: StreamMessage[];
}[];

export class RedisStreamService {
  private readonly REQ_QUEUE = 'queue:requests';
  private readonly RES_QUEUE = 'queue:results';

//   private client: RedisClientType;
//   constructor() {
//     this.client = createClient({
//       url: `redis://${process.env.REDIS_URL}`,
//     });
//   }

//   async init() {
//     await this.client.connect();
//   }

  // Push to Request Queue
  async pushRequest<T>(payload: T) {
    return client.xAdd(this.REQ_QUEUE, '*', {
      data: JSON.stringify(payload),
      timestamp: Date.now().toString(),
    });
  }

  // Listen for Results (Blocking Read)
  async listenForResults(callback: (data: any) => void) {
    let lastId = '0'; // start from beginning (or store externally)

    while (true) {
      const response = (await client.xRead(
        [{ key: this.RES_QUEUE, id: '$' }],
        { BLOCK: 0, COUNT: 1 }
      )) as StreamResponse | null;

      if (!response) continue;

      for (const stream of response) {
        for (const message of stream.messages) {
          lastId = message.id;

          if (message.message?.data) {
            const parsed = JSON.parse(message.message.data);
            callback(parsed);
          }
        }
      }
    }
  }
}
