// src/api/chat/chat.service.ts
import { prisma } from '../../config/prisma.js';

const GUEST_STORAGE: Record<string, any> = {};

export const ChatDAO = {
  async saveMessage(sender: string, content: any, conversationId?: string, userId?: string) {
    if (userId?.includes('guest')) {
      const cid = conversationId || `guest-conv-${Date.now()}`;
      if (!GUEST_STORAGE[cid]) {
        GUEST_STORAGE[cid] = {
          id: cid,
          userId,
          title: content.text.substring(0, 30),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      const newMessage = {
        id: Date.now().toString(),
        role: sender, // <--- CHANGE THIS FROM 'sender' TO 'role'
        content,
        createdAt: new Date()
      };

      GUEST_STORAGE[cid].messages.push(newMessage);
      GUEST_STORAGE[cid].updatedAt = new Date();
      return GUEST_STORAGE[cid];
    }

    // 1. New Conversation Flow (Nested Write)
    if (!conversationId) {
      if (!userId) throw new Error("userId is required for new conversations");

      const titleText = content.text || "New Conversation";

      return await prisma.conversation.create({
        data: {
          userId,
          title: titleText.substring(0, 50),
          updatedAt: new Date(),
          // Nested Create: Saves the message and the conversation in ONE go
          messages: {
            create: {
              sender,
              content
            }
          }
          // updatedAt is automatically set to 'now' by the DB on creation
        },
        include: { messages: true } // Return the full object
      });
    }

    // 2. Existing Conversation Flow
    // We use a transaction to ensure both operations succeed together
    const [newMessage, updatedConversation] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId, sender, content }
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() } // Manual touch for sorting
      })
    ]);

    return newMessage;
  },

  // You might also want a method to fetch a single message to verify the update


  async getMessageById(id: string) {
    return await prisma.message.findUnique({
      where: { id }
    });
  },

  async updateMessageEvaluation(
    messageId: string,
    evaluation: {
      rating: number;
      evaluationComment?: string;
    }
  ) {
    // 1. Create the base update object
    const updateData: any = {
      rating: evaluation.rating,
      evaluationAt: new Date(),
    };

    // 2. Only add the comment if it's not undefined
    if (evaluation.evaluationComment !== undefined) {
      updateData.evaluationComment = evaluation.evaluationComment;
    }

    return await prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });
  },

  async getConversationHistory(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  },

  async getConversationsByUser(userId: string) {
    // 1. Guest Case: Filter the in-memory store
    if (userId.includes('guest')) {
      return Object.values(GUEST_STORAGE)
        .filter((conv: any) => conv.userId === userId)
        .sort((a, b) => b.updatedAt - a.updatedAt); // Sort by most recent
    }

    // 2. Persistent Case: Hit the DB
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' } // Usually better to sort by last activity
    });
    // return await prisma.conversation.findMany({
    //   where: { userId },
    //   include: {
    //     messages: {
    //       orderBy: { createdAt: 'asc' } // Ensure messages flow chronologically
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' } // Most recent conversations first
    // });
  },

  async getSidebarHistory(userId: string) {
    return await prisma.conversation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        // We only take the LATEST message to show a "preview" in the sidebar
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true }
        }
      },
      orderBy: { updatedAt: 'desc' } // Extremely fast if updatedAt is indexed
    });
  },

  async getFullConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });
  }
};