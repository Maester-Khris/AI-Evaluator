export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  content: string;
  role: Role;
  createdAt: string; // ISO string to match Prisma DateTime
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}

// Helper for optimistic updates
export type NewMessageDTO = Pick<Message, 'content' | 'role'>;