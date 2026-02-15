import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import { ChatDAO } from "../api/chat/chat.service.js";
import { corsConfig } from "../config/security.js";
import type { StreamMessageRequest } from "../types/streaming.contract.js";
import { redisStream } from "./redis-streaming.js";

let io: Server;
export const initSocketManager = (httpServer: any) => {
	io = new Server(httpServer, {
		cors: corsConfig,
	});

	io.on("connection", (socket: Socket) => {
		console.log("client connected", socket.id);

		socket.on("chat_message", async (payload, ack: any) => {
			try {
				// 1. Unique Hook for this specific interaction + DB save
				const correlationId = randomUUID();
				const { sender, content, userId, conversationId, tempId } = payload;
				const savedMessage = await ChatDAO.saveMessage(
					sender,
					content,
					conversationId,
					userId,
					correlationId,
				);

				// 2. Push to Redis for the Python Worker
				redisStream.eventEmitter.emit("ai_request", {
					roomId: savedMessage.conversationId,
					correlationId: correlationId as any, // Cast if UUID type mismatch
					userId: userId as any,
					conversationId: savedMessage.conversationId as any,
					message: content.text || "",
					context: [], // Future: Add last 2-3 messages for context here
				});

				// 3. ACK back to Client immediately so it can flip tempId -> realId
				ack({
					conversationId: savedMessage.conversationId,
					messageId: savedMessage.id,
					tempId: tempId,
				});

				// 4. Join a 'room' for this conversation to isolate streaming
				socket.join(savedMessage.conversationId);
			} catch (error) {
				console.error("Socket chat_message error:", error);
				ack({ error: "Failed to process message" });
				socket.emit("error", "Failed to process message");
			}
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.id}`);
		});
	});
	return io;
};

export const emitToRoom = (roomId: string, event: string, data: any) => {
	if (io) io.to(roomId).emit(event, data);
};
