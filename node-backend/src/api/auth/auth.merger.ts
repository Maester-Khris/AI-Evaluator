import { prisma } from "../../config/prisma.js";
import { getGuestStorage } from "../chat/chat.service.js";

export const AuthMerger = {
    async mergeGuestSession(realUserId: string, guestId: string) {
        console.log(`Merging guest session ${guestId} into user ${realUserId}`);

        const guestStorage = getGuestStorage();
        const guestConversations = Object.values(guestStorage).filter(
            (conv: any) => conv.userId === guestId,
        );

        if (guestConversations.length === 0) {
            console.log("No guest conversations to merge.");
            return;
        }

        console.log(`Found ${guestConversations.length} conversations to merge.`);

        const idMapping: Record<string, string> = {};

        try {
            await prisma.$transaction(async (tx) => {
                for (const guestConv of guestConversations) {
                    // 1. Create the persistent conversation
                    const newConv = await tx.conversation.create({
                        data: {
                            userId: realUserId,
                            title: guestConv.title,
                            createdAt: guestConv.createdAt,
                            updatedAt: new Date(),
                        },
                    });

                    idMapping[guestConv.id] = newConv.id;

                    if (guestConv.messages && guestConv.messages.length > 0) {
                        const messageData = guestConv.messages.map((msg: any) => ({
                            id: msg.id, // PERSIST THE ID
                            conversationId: newConv.id,
                            sender: msg.sender,
                            content: msg.content,
                            correlationId: msg.correlationId || null,
                            rating: msg.rating || null,
                            evaluationAt: msg.evaluationAt || null,
                            evaluationComment: msg.evaluationComment || null,
                            createdAt: msg.createdAt,
                        }));

                        await tx.message.createMany({
                            data: messageData,
                            skipDuplicates: true,
                        });
                    }
                }
            });

            console.log("Merge transaction successful. Clearing guest memory.");

            // 3. Cleanup Memory (Only if transaction succeeded)
            for (const guestConv of guestConversations) {
                delete guestStorage[guestConv.id];
            }

            return idMapping;
        } catch (error) {
            console.error("Failed to merge guest session:", error);
            // We do NOT clear the memory if it failed, so the user can try again or at least not lose data
            throw error;
        }
    },
};
