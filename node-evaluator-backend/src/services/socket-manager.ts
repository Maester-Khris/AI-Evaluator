import { Server, Socket } from 'socket.io';
import { redisStream } from './redis-streaming.js';
import { ChatDAO } from '../api/chat/chat.service.js';
import type { StreamMessageRequest } from '../types/streaming.contract.js';
import { randomUUID } from 'node:crypto';

let io: Server;
export const initSocketManager = (httpServer: any) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            // credentials: true
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('client connected', socket.id);

        socket.on('chat_message', async (payload, ack: any) => {
            try {
                // console.log('chat_message', payload);
                // 1. Unique Hook for this specific interaction
                const correlationId = randomUUID();

                const { sender, content, userId, conversationId, tempId } = payload;
                // 1. Persist the User message to Postgres/Guest storage first
                // Reuse your existing logic!
                const savedMessage = await ChatDAO.saveMessage(sender, content, conversationId, userId, correlationId);
                // console.log("1. Saved Message:", savedMessage);

                // 4. Push to Redis for the Python Worker
                // We include the conversationId so RedisStream knows where to send results
                redisStream.eventEmitter.emit('ai_request', {
                    roomId: savedMessage.conversationId,
                    correlationId: correlationId as any, // Cast if UUID type mismatch
                    userId: userId as any,
                    conversationId: savedMessage.conversationId as any,
                    message: content.text || "",
                    context: [] // Future: Add last 2-3 messages for context here
                });
                // const resultId = await redisStream.pushToInferenceQueue({
                //     roomId: savedMessage.conversationId,
                //     correlationId: correlationId as any, // Cast if UUID type mismatch
                //     userId: userId as any,
                //     conversationId: savedMessage.conversationId as any,
                //     message: content.text || "",
                //     context: [] // Future: Add last 2-3 messages for context here
                // });
                // console.log("3. Redis Push Result ID:", resultId);

                // 2. ACK back to React immediately so it can flip tempId -> realId
                ack({
                    conversationId: savedMessage.conversationId,
                    messageId: savedMessage.id,
                    tempId: tempId
                });

                // 3. Join a 'room' for this conversation to isolate streaming
                socket.join(savedMessage.conversationId);


                // console.log('Pushed to Redis');
            } catch (error) {
                console.error("Socket chat_message error:", error);
                ack({ error: 'Failed to process message' });
                socket.emit('error', 'Failed to process message');
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};

export const emitToRoom = (roomId: string, event: string, data: any) => {
    if (io) io.to(roomId).emit(event, data);
};