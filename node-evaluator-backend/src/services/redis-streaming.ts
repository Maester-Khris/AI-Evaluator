import EventEmitter from "node:events";
import { ChatDAO } from "../api/chat/chat.service.js";
import { redisConfig } from "../config/redis.js";
import type {
	StreamMessageRequest,
	StreamMessageResponse,
	StreamResponse,
} from "../types/streaming.contract.js";

// We won't export 'client' directly anymore to avoid confusion, or export the shared one
export const client = redisConfig.getClient();
const streamBuffers: Record<string, string> = {};

class RedisStreamService {
	private readonly REQ_QUEUE = "queue:requests";
	private readonly RES_QUEUE = "stream:results";
	public eventEmitter: EventEmitter;

	constructor() {
		this.eventEmitter = new EventEmitter();
		console.log("RedisStreamService Initialized (Singleton)");
	}

	/**
	 * Enforces MessageRequest type.
	 * Note: Redis XADD values must be strings.
	 * Use shared client for pushing
	 */
	async pushToInferenceQueue(payload: StreamMessageRequest) {
		const sharedClient = redisConfig.getClient();
		const entryId = await sharedClient.xAdd(this.REQ_QUEUE, "*", {
			correlationId: String(payload.correlationId),
			userId: String(payload.userId),
			conversationId: String(payload.conversationId),
			message: payload.message,
			context: JSON.stringify(payload.context || []),
			roomId: payload.roomId || "",
		});

		console.log(
			`Redis XADD Success. ID: ${entryId} | Queue: ${this.REQ_QUEUE}`,
		);
		return entryId;
	}

	/**
	 * Listens to Python's result stream and dispatches to UI/DB
	 * Listen for Results (Blocking Read)
	 * Use dedicated blocking client for listening
	 * Lastid switch to '0' / '$' to listen for previous results or only new
	 */
	async listenForLLMResults() {
		let lastId = "0";
		const blockingClient = await redisConfig.getBlockingClient();

		while (true) {
			try {
				const response = (await blockingClient.xRead(
					[{ key: this.RES_QUEUE, id: lastId }],
					{ BLOCK: 0, COUNT: 5 },
				)) as StreamResponse | null;

				if (!response) continue;

				if (response) {
					console.log(
						`Received ${JSON.stringify(response[0]?.messages)} data chunk from Python`,
					);
				}

				for (const stream of response) {
					for (const message of stream.messages) {
						const data = message.message as unknown as StreamMessageResponse;
						const {
							correlationId,
							userId,
							conversationId,
							roomId,
							content,
							status,
						} = data;

						// 1. Accumulate chunks in memory for the final DB save
						if (status === "streaming") {
							streamBuffers[correlationId] =
								(streamBuffers[correlationId] || "") + content;
						}

						// 2. Emit event for UI to display chunk
						this.eventEmitter.emit("chunk_received", {
							roomId,
							conversationId,
							content,
							isDone: status === "done",
						});

						// 3. Handle End of Stream
						if (status === "done" || status === "error") {
							const fullContent = streamBuffers[correlationId] || "";

							if (status === "done" && fullContent) {
								console.log(`Finalizing message ${correlationId} for DB...`);
								console.log(`Full Content: ${fullContent}`);
								console.log(`User ID: ${userId}`);

								// DATA OWNER: Save the Assistant's response to Postgres/Guest Storage
								await ChatDAO.saveMessage(
									"assistant",
									{ text: fullContent, language: "none" },
									conversationId,
									userId,
									correlationId,
								);
							}

							// Cleanup memory buffer
							delete streamBuffers[correlationId];
						}

						// 3. Update the offset key in Redis immediately
						lastId = message.id;

						// delete current entry in redis
						await blockingClient.xDel(this.RES_QUEUE, message.id);
					}
				}
			} catch (err) {
				console.error("Stream processing error:", err);
				await new Promise((res) => setTimeout(res, 2000)); // Cool down
			}
		}
	}
}

export const redisStream = new RedisStreamService();

// delete current entry in redis
// await blockingClient.xDel(this.RES_QUEUE, message.id);
