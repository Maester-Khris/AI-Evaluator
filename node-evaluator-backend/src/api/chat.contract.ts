export type MessageStatus = "pending" | "streaming" | "completed" | "failed";

export interface MessageEnvelope {
	// Identification
	id: string;
	correlationId: string;
	conversationId: string;
	userId: string;

	// Metadata
	title: string;
	sender: "user" | "assistant";
	status: MessageStatus;

	// Content
	content: {
		text: string;
		language?: string;
		metadata?: any;
	};

	createdAt: Date;
	rating?: number;
	evaluationComment?: string;
}
