export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'failed';

export interface MessageEnvelope {
    // Identification
  id: string;               // Database UUID
  correlationId: string;    // The Async Hook
  conversationId: string;
  userId: string;

  // Metadata
  title: string;            // Always returned, even if unchanged
  sender: 'user' | 'assistant';
  status: MessageStatus;

  // Content
  content: {
    text: string;
    language?: string;
    metadata?: any;
  };

  createdAt: Date;
};