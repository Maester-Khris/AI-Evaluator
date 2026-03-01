import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import type { MessageEnvelope, MessageStatus } from "../chat.contract.js";

const GUEST_STORAGE: Record<string, any> = {};

export const getGuestStorage = () => GUEST_STORAGE;

export const ChatDAO = {
	// ======================================= Helper methods ======================================
	handleGuestSave(
		sender: string,
		content: any,
		userId: string,
		conversationId?: string,
		correlationId?: string,
		id?: string,
	): MessageEnvelope {
		const cid = conversationId || randomUUID();

		if (!GUEST_STORAGE[cid]) {
			GUEST_STORAGE[cid] = {
				id: cid,
				userId,
				title: (content.text || "New Guest Chat").substring(0, 50),
				messages: [],
				createdAt: new Date(),
			};
		}

		const newMessage = {
			id: id || randomUUID(),
			sender,
			content,
			correlationId,
			createdAt: new Date(),
			status: "completed" as MessageStatus,
		};

		GUEST_STORAGE[cid].messages.push(newMessage);

		// Debug: Log the state of the In-Memory DB for this guest
		const userConvs = Object.values(GUEST_STORAGE).filter(
			(c: any) => c.userId === userId,
		);
		console.log(
			`[GUEST STORAGE STATE] User: ${userId} | Count: ${userConvs.length} convs`,
		);
		for (const c of userConvs) {
			console.log(`  -> Conv ${c.id}: ${c.messages.length} messages`);
		}

		return this.normalize(newMessage, GUEST_STORAGE[cid]);
	},

	async handleDatabaseSave(
		sender: string,
		content: any,
		userId: string,
		conversationId?: string,
		correlationId?: string,
		id?: string,
	): Promise<MessageEnvelope> {
		// 1. New Conversation Flow (Transaction)
		if (!conversationId) {
			const result = await prisma.conversation.create({
				data: {
					userId,
					title: (content.text || "New Chat").substring(0, 50),
					updatedAt: new Date(),
					messages: {
						create: {
							...(id && { id }),
							sender,
							content,
							correlationId: correlationId || "",
						},
					},
				},
				include: { messages: true },
			});
			return this.normalize(result.messages[0], result);
		}

		// 2. Existing Conversation Flow (Transaction)
		// We update the conversation's updatedAt and create the message in one go
		const [newMessage, updatedConv] = await prisma.$transaction([
			prisma.message.create({
				data: {
					...(id && { id }),
					conversationId,
					sender,
					content,
					correlationId: correlationId || "",
				},
			}),
			prisma.conversation.update({
				where: { id: conversationId },
				data: { updatedAt: new Date() },
			}),
		]);

		return this.normalize(newMessage, updatedConv);
	},

	normalize(msg: any, conv: any): MessageEnvelope {
		return {
			id: msg.id,
			correlationId: msg.correlationId || "",
			conversationId: conv.id,
			userId: conv.userId,
			title: conv.title,
			sender: msg.sender as "user" | "assistant",
			status: (msg.status || "completed") as MessageStatus,
			content: {
				text: msg.content.text || "",
				language: msg.content.language || "none",
				metadata: msg.content.metadata || {},
			},
			rating: msg.rating,
			evaluationComment: msg.evaluationComment,
			createdAt: msg.createdAt,
		};
	},

	// ======================================= Main methods ======================================

	async saveMessage(
		sender: "user" | "assistant",
		content: any,
		conversationId?: string,
		userId?: string,
		correlationId?: string,
		isGuest: boolean = false,
		id?: string,
	): Promise<MessageEnvelope> {
		if (isGuest) {
			return this.handleGuestSave(
				sender,
				content,
				userId!,
				conversationId,
				correlationId,
				id,
			);
		}

		return this.handleDatabaseSave(
			sender,
			content,
			userId!,
			conversationId,
			correlationId,
			id,
		);
	},

	async getMessageById(id: string) {
		return await prisma.message.findUnique({
			where: { id },
		});
	},

	async updateMessageEvaluation(
		messageId: string,
		evaluation: {
			rating: number;
			evaluationComment?: string;
		},
	) {
		// 1. Check Guest Storage (In-Memory)
		for (const convId in GUEST_STORAGE) {
			const conv = GUEST_STORAGE[convId];
			const msg = conv.messages.find((m: any) => m.id === messageId);

			if (msg) {
				msg.rating = evaluation.rating;
				msg.evaluationAt = new Date();
				if (evaluation.evaluationComment !== undefined) {
					msg.evaluationComment = evaluation.evaluationComment;
				}
				return msg;
			}
		}

		// 2. Create the base update object for Database
		const updateData: any = {
			rating: evaluation.rating,
			evaluationAt: new Date(),
		};

		// 3. Only add the comment if it's not undefined
		if (evaluation.evaluationComment !== undefined) {
			updateData.evaluationComment = evaluation.evaluationComment;
		}

		try {
			return await prisma.message.update({
				where: { id: messageId },
				data: updateData,
			});
		} catch (error) {
			// If message not found in DB, standard Prisma error
			console.error(`Message ${messageId} not found in DB for evaluation update.`);
			return null;
		}
	},

	async getConversationHistory(conversationId: string) {
		return await prisma.conversation.findUnique({
			where: { id: conversationId },
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
				},
			},
		});
	},

	async getConversationsByUser(userId: string) {
		// 1. Guest Case: Filter the in-memory store
		if (userId.includes("guest")) {
			const conversations = Object.values(GUEST_STORAGE)
				.filter((conv: any) => conv.userId === userId)
				.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

			// LOGGING RESULTS FOR GUEST
			console.log(`\n[ChatDAO] --- Guest Storage Audit for User: ${userId} ---`);
			console.log(`Total Guest Conversations: ${conversations.length}`);

			conversations.forEach((conv, cIdx) => {
				const evaluatedMessages = conv.messages.filter((m: any) => m.rating !== null && m.rating !== undefined);
				console.log(
					`[${cIdx}] Guest Conv: ${conv.id.slice(0, 8)}... | "${conv.title}" | Messages: ${conv.messages.length}`
				);
				if (evaluatedMessages.length > 0) {
					evaluatedMessages.forEach((msg: any) => {
						console.log(
							`Review Found (MEMORY): [Msg: ${msg.id.slice(0, 8)}] ` +
							`Rating: ${msg.rating}/5 | ` +
							`Comment: ${msg.evaluationComment || 'No comment'}`
						);
					});
				}
			});
			console.log(`[ChatDAO] --- Guest Audit Complete ---\n`);

			return conversations;
		}

		// 2. Persistent Case: Hit the DB
		// return await prisma.conversation.findMany({
		// 	where: { userId },
		// 	include: {
		// 		messages: {
		// 			orderBy: { createdAt: "asc" },
		// 		},
		// 	},
		// 	orderBy: { updatedAt: "desc" }, // Usually better to sort by last activity
		// });
		// 2. Persistent Case: Hit the DB
		const conversations = await prisma.conversation.findMany({
			where: { userId },
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		// LOGGING RESULTS
		console.log(`\n[ChatDAO] --- Persistence Audit for User: ${userId} ---`);
		console.log(`Total Conversations: ${conversations.length}`);

		conversations.forEach((conv, cIdx) => {
			// Calculate evaluation stats for this conversation
			const evaluatedMessages = conv.messages.filter(m => m.rating !== null && m.rating !== undefined);

			console.log(
				`[${cIdx}] Conv: ${conv.id.slice(0, 8)}... | "${conv.title}" | Messages: ${conv.messages.length}`
			);

			if (evaluatedMessages.length > 0) {
				evaluatedMessages.forEach(msg => {
					console.log(
						`Review Found: [Msg: ${msg.id.slice(0, 8)}] ` +
						`Rating: ${msg.rating}/5 | ` +
						`Comment: ${msg.evaluationComment || 'No comment'}`
					);
				});
			}
		});
		console.log(`[ChatDAO] --- Audit Complete ---\n`);

		return conversations;
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
					orderBy: { createdAt: "desc" },
					take: 1,
					select: { content: true, createdAt: true },
				},
			},
			orderBy: { updatedAt: "desc" }, // Extremely fast if updatedAt is indexed
		});
	},

	async getFullConversation(conversationId: string) {
		return await prisma.conversation.findUnique({
			where: { id: conversationId },
			include: {
				messages: { orderBy: { createdAt: "asc" } },
			},
		});
	},
};

// async saveMessage(sender: string, content: any, conversationId?: string, userId?: string) {
//   if (userId?.includes('guest')) {
//     const cid = conversationId || `guest-conv-${Date.now()}`;
//     if (!GUEST_STORAGE[cid]) {
//       GUEST_STORAGE[cid] = {
//         id: cid,
//         userId,
//         title: content.text.substring(0, 30),
//         messages: [],
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
//     }

//     const newMessage = {
//       id: Date.now().toString(),
//       role: sender, // <--- CHANGE THIS FROM 'sender' TO 'role'
//       content,
//       createdAt: new Date()
//     };

//     GUEST_STORAGE[cid].messages.push(newMessage);
//     GUEST_STORAGE[cid].updatedAt = new Date();
//     return GUEST_STORAGE[cid];
//   }

//   // 1. New Conversation Flow (Nested Write)
//   if (!conversationId) {
//     if (!userId) throw new Error("userId is required for new conversations");

//     const titleText = content.text || "New Conversation";

//     return await prisma.conversation.create({
//       data: {
//         userId,
//         title: titleText.substring(0, 50),
//         updatedAt: new Date(),
//         // Nested Create: Saves the message and the conversation in ONE go
//         messages: {
//           create: {
//             sender,
//             content
//           }
//         }
//         // updatedAt is automatically set to 'now' by the DB on creation
//       },
//       include: { messages: true } // Return the full object
//     });
//   }

//   // 2. Existing Conversation Flow
//   // We use a transaction to ensure both operations succeed together
//   const [newMessage, updatedConversation] = await prisma.$transaction([
//     prisma.message.create({
//       data: { conversationId, sender, content }
//     }),
//     prisma.conversation.update({
//       where: { id: conversationId },
//       data: { updatedAt: new Date() } // Manual touch for sorting
//     })
//   ]);

//   return newMessage;
// },

// You might also want a method to fetch a single message to verify the update

// async saveMessage(sender: string, content: any, conversationId?: string, userId?: string, correlationId?: string) {

//   // Helper to normalize the return object
//   const normalize = (msg: any, conv: any) => ({
//     id: msg.id,
//     conversationId: typeof conv === 'string' ? conv : conv.id,
//     title: conv.title || null, // Capture the title here!
//     sender: msg.sender || msg.role,
//     content: msg.content,
//     correlationId: msg.correlationId,
//     createdAt: msg.createdAt
//   });

//   // --- GUEST FLOW ---
//   if (userId?.includes('guest')) {
//     const cid = conversationId || `guest-conv-${Date.now()}`;
//     if (!GUEST_STORAGE[cid]) {
//       GUEST_STORAGE[cid] = { id: cid, userId, messages: [], createdAt: new Date() };
//     }

//     const newMessage = {
//       id: crypto.randomUUID(), // Use UUID even for guests for consistency
//       role: sender,
//       content,
//       correlationId, // Store it in mem too!
//       createdAt: new Date()
//     };

//     GUEST_STORAGE[cid].messages.push(newMessage);
//     return normalize(newMessage, cid);
//   }

//   // --- LOGGED IN FLOW ---
//   if (!conversationId) {
//     if (!userId) throw new Error("userId required");
//     const result = await prisma.conversation.create({
//       data: {
//         userId,
//         title: (content.text || "New Chat").substring(0, 50),
//         updatedAt: new Date(),
//         messages: { create: { sender, content, correlationId:(correlationId || "") } }
//       },
//       include: { messages: true }
//     });
//     // Return the specific message just created
//     return normalize(result.messages[0], result);
//   }

//   const newMessage = await prisma.message.create({
//     data: { conversationId, sender, content, correlationId:(correlationId || "")  }
//   });
//   // We update conv updatedAt in background, don't block the AI queue
//   prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }).catch(console.error);

//   return normalize(newMessage, conversationId);
// },
