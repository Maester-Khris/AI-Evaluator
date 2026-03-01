import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import { ChatDAO } from "../api/chat/chat.service.js";
import { corsConfig } from "../config/security.js";
import type { StreamMessageRequest } from "../types/streaming.contract.js";
import { redisStream } from "./redis-streaming.js";
import { AuthService } from "../api/auth/auth.service.js";

let io: Server;
export const initSocketManager = (httpServer: any) => {
	io = new Server(httpServer, {
		cors: corsConfig,
	});

	io.use(async (socket, next) => {
		const token = socket.handshake.auth.token;
		if (!token) return next(new Error("Authentication error"));

		try {
			const decoded = await AuthService.verifyToken(token);
			socket.data.user = {
				id: decoded.userId,
				role: decoded.role,
				isGuest: (decoded as any).isGuest === true
			};
			next();
		} catch (err) {
			next(new Error("Authentication error"));
		}
	});

	io.on("connection", (socket: Socket) => {
		console.log("client connected", socket.id);

		socket.on("chat_message", async (payload, ack: any) => {
			try {
				// 1. Unique Hook for this specific interaction + DB save
				const correlationId = randomUUID();
				const { id, sender, content, conversationId, tempId } = payload;
				const { id: userId, isGuest } = socket.data.user;
				console.log("User:", userId, "Guest retrieved from auth middleware:", isGuest);

				const savedMessage = await ChatDAO.saveMessage(
					sender,
					content,
					conversationId,
					userId,
					correlationId,
					isGuest,
					id,
				);

				// 2. Push to Redis for the Python Worker
				redisStream.eventEmitter.emit("ai_request", {
					roomId: savedMessage.conversationId,
					correlationId: correlationId as any, // Cast if UUID type mismatch
					userId: userId as any,
					conversationId: savedMessage.conversationId as any,
					message: content.text || "",
					context: [],
					isGuest: isGuest,
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

		socket.on("response_evaluation", async (payload: any, ack: any) => {
			try {
				const { message_id, rating, comment } = payload;
				console.log(`Received evaluation for message ${message_id}: ${rating} stars`);

				const result = await ChatDAO.updateMessageEvaluation(message_id, {
					rating,
					evaluationComment: comment,
				});

				if (result) {
					ack({ success: true, messageId: message_id });
				} else {
					ack({ error: "Message not found" });
				}
			} catch (error) {
				console.error("Socket response_evaluation error:", error);
				ack({ error: "Failed to process evaluation" });
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
