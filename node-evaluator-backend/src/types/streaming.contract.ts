import type { UUID } from "node:crypto";

type MessageStreamingStatus = "streaming" | "done" | "error";

// ====== types used for redis streams objects =========
export type StreamMessage = {
	id: string;
	message: Record<string, string>;
};

export type StreamResponse = {
	name: string;
	messages: StreamMessage[];
}[];

// =========== types used for data exchange: DTO ===========
export interface StreamMessageRequest {
	correlationId: UUID;
	userId: UUID;
	conversationId: UUID;
	roomId: string;
	message: string;
	context: [];
}
export interface StreamMessageResponse {
	correlationId: UUID;
	userId: UUID;
	conversationId: UUID;
	roomId: string;
	content: string;
	status: MessageStreamingStatus;
}
