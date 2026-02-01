// src/api/chat/chat.service.ts
import { prisma } from '../../config/prisma.js';

export const ChatDAO = {
  // async saveMessage(sender: string, content: any, conversationId?: string, userId?: string) {
  //   let targetId = conversationId;

  //   // 1. If no conversationId, create a new Conversation
  //   if (!targetId) {
  //     if (!userId) throw new Error("userId is required to start a new conversation");
  //     const titleText = content.text || JSON.stringify(content).substring(0, 30);
      
  //     const newConversation = await prisma.conversation.create({
  //       data: {
  //         userId,
  //         title: titleText.substring(0, 50) + "...",
  //         updatedAt: new Date()
  //       }
  //     });
  //     targetId = newConversation.id;
  //   }

  //   // 2. Save the message to the (new or existing) conversation
  //    await prisma.message.create({
  //     data: {
  //       conversationId: targetId,
  //       sender,
  //       content // JsonB handles objects automatically
  //     }
  //   });
  //   return await prisma.conversation.update({
  //     where: { id: targetId },
  //     data: { updatedAt: new Date() } // "Touch" the conversation to bring it to the top
  //   });
  // },

  async saveMessage(sender: string, content: any, conversationId?: string, userId?: string) {
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
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' } // Ensure messages flow chronologically
        }
      },
      orderBy: { createdAt: 'desc' } // Most recent conversations first
    });
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