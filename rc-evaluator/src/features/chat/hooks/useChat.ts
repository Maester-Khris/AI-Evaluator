import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Conversation, Message } from "../types";
import { useApi } from "./useApi";
import { useSocket } from "./useSocket";

export const useChat = (initialConversations: Conversation[] = []) => {
	const { user, isLoading } = useAuth();
	const api = useApi();
	const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
	const [activeId, setActiveId] = useState<string | null>(null);
	const { socket, isConnected } = useSocket();

	const activeConversation = conversations.find((c) => c.id === activeId);



	// =========================== SIDE EFFECTS =====================================
	// 1. Hydrate conversations on mount or when user changes
	useEffect(() => {
		if (!user?.id || isLoading) return;
		const hydrate = async () => {
			try {
				const history = await api.getHistory(user.id);
				setConversations(history);
				if (history.length > 0 && !activeId) {
					setActiveId(history[0].id);
				}
			} catch (error) {
				console.error("Hydration failed:", error);
			}
		};

		hydrate();
	}, [user?.id, isLoading]);

	// 2. SOCKET STREAM LISTENER 
	useEffect(() => {
		if (!socket) return;

		// Listen for AI response chunks from Redis via Node
		socket.on('ai_chunk', ({ conversationId, chunk, isDone }) => {
			setConversations(prev => prev.map(conv => {
				if (conv.id === conversationId) {
					const msgs = [...conv.messages];
					const lastMsg = msgs[msgs.length - 1];

					// If last message is assistant, append. If not, create assistant msg.
					// message content can either be string or object
					if (lastMsg && lastMsg.sender === 'assistant') {
						if (typeof lastMsg.content === 'object') {
							lastMsg.content = {
								...lastMsg.content,
								text: lastMsg.content.text + chunk
							};
						} else {
							lastMsg.content = {
								text: lastMsg.content + chunk,
								language: 'none'
							};
						}
					} else {
						msgs.push({
							id: `ai-${Date.now()}`,
							sender: 'assistant',
							content: { text: chunk, language: 'none' },
							createdAt: new Date().toISOString(),
							conversationId
						});
					}
					return { ...conv, messages: msgs };
				}
				return conv;
			}));
		});

		return () => { socket.off('ai_chunk'); };
	}, [socket]);


	// =================================================================================

	// 2. Local creation (Optimistic)
	const createNewConversation = useCallback(() => {
		const newConv: Conversation = {
			id: `temp-${crypto.randomUUID()}`,
			title: "New Conversation",
			messages: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setConversations((prev) => [newConv, ...prev]);
		setActiveId(newConv.id);
	}, []);

	const sendMessage = async (text: string) => {
		if (!user?.id || !text.trim()) return;

		// 1. Identify "temp" state
		const isNewChat = !activeId || activeId.startsWith("temp-");
		const tempId = activeId || `temp-${crypto.randomUUID()}`;
		const senderRole = user.id.includes("guest") ? "guest" : "user";

		// 2. Optimistic UI Update (Keep the user feeling fast)
		const optimisticMsg: Message = {
			id: crypto.randomUUID(),
			content: { text, language: "none" },
			sender: senderRole as any,
			createdAt: new Date().toISOString(),
			conversationId: tempId,
		};

		setConversations((prev) => {
			if (isNewChat) {
				return [{
					id: tempId,
					userId: user.id,
					title: text.substring(0, 30),
					messages: [optimisticMsg],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}, ...prev];
			}
			return prev.map((c) =>
				c.id === activeId ? { ...c, messages: [...c.messages, optimisticMsg] } : c
			);
		});

		try {
			// 3. API Call - Returns MessageEnvelope now!
			const envelope = await api.sendMessage({
				sender: senderRole,
				content: { text, language: "none" },
				userId: user.id,
				conversationId: isNewChat ? undefined : activeId,
			});

			// 4. RECONCILIATION: Align local state with MessageEnvelope
			setConversations((prev) => {
				return prev.map((conv) => {
					// If this is the conversation we just interacted with
					if (conv.id === tempId || conv.id === activeId) {
						return {
							...conv,
							id: envelope.conversationId, // Swap temp ID for real ID
							title: envelope.title,       // Sync title (important for new chats)
							messages: conv.messages.map(m =>
								// Replace our optimistic message with the real one from DB
								m.id === optimisticMsg.id ? {
									...m,
									id: envelope.id,
									correlationId: envelope.correlationId
								} : m
							)
						};
					}
					return conv;
				});
			});

			// 5. Update Active ID to the real UUID from DB
			setActiveId(envelope.conversationId);

		} catch (error) {
			console.error("Failed to sync message:", error);
			// Optional: Implement a 'failed' state on the message here
		}
	};

	const sendMessageToSocket = async (text: string) => {
		if (!user?.id || !text.trim() || !isConnected) return;
		const isNewChat = !activeId || activeId.startsWith("temp-");
		const tempId = activeId || `temp-${crypto.randomUUID()}`;
		const senderRole = user.id.includes("guest") ? "guest" : "user";

		// 2. Optimistic UI Update (Keep the user feeling fast)
		const optimisticMsg: Message = {
			id: crypto.randomUUID(),
			content: { text, language: "none" },
			sender: senderRole as any,
			createdAt: new Date().toISOString(),
			conversationId: tempId,
		};
		setConversations((prev) => {
			if (isNewChat) {
				return [{
					id: tempId,
					userId: user.id,
					title: text.substring(0, 30),
					messages: [optimisticMsg],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}, ...prev];
			}
			return prev.map((c) =>
				c.id === activeId ? { ...c, messages: [...c.messages, optimisticMsg] } : c
			);
		});

		// we send the message and wait for the "message_received" ack
		socket?.emit('chat_message', {
			sender: senderRole,
			content: { text, language: "none" },
			userId: user.id,
			conversationId: isNewChat ? undefined : activeId,
			tempId: tempId
		}, (ack: any) => {
			const realId = ack.conversationId;
			setConversations((prev) => prev.map((conv) => {
				// If it's the temp conversation we just created OR the existing one
				if (conv.id === tempId) {
					return {
						...conv,
						id: realId,
						// Replace the optimistic message ID with the real DB ID if provided
						messages: conv.messages.map(m =>
							m.id === optimisticMsg.id ? { ...m, id: ack.messageId || m.id } : m
						)
					};
				}
				return conv;
			}));

			setActiveId(realId);
		});
	}

	return {
		conversations,
		activeConversation,
		sendMessage,
		sendMessageToSocket,
		createNewConversation,
		setActiveId,
	};
};

// const sendMessage = async (text: string) => {
// 	console.log("Send Message", text);
// 	if (!user?.id || !text.trim()) {
// 		console.error("Send Message: User not logged in or no message text");
// 		return;
// 	}

// 	// 1. Determine if we are creating a brand new conversation
// 	const isNewChat = !activeId || activeId.startsWith("temp-");

// 	// Use 'guest' sender string if the ID contains 'guest'
// 	const senderRole = user.id.includes("guest") ? "guest" : "user";

// 	// 2. Local message for immediate feedback
// 	const userMsg: Message = {
// 		id: crypto.randomUUID(),
// 		content: { text, language: "none" },
// 		sender: senderRole as any,
// 		createdAt: new Date().toISOString(),
// 		conversationId: activeId || "temp-id",
// 	};

// 	// Add message to UI immediately
// 	setConversations((prev) => {
// 		if (isNewChat) {
// 			return [
// 				{
// 					id: "temp-id",
// 					userId: user.id,
// 					title: text.substring(0, 30),
// 					messages: [userMsg],
// 					createdAt: new Date().toISOString(),
// 					updatedAt: new Date().toISOString(),
// 				},
// 				...prev,
// 			];
// 		}
// 		return prev.map((c) =>
// 			c.id === activeId ? { ...c, messages: [...c.messages, userMsg] } : c,
// 		);
// 	});

// 	try {
// 		// 3. API Call
// 		const result = await api.sendMessage({
// 			sender: senderRole,
// 			content: { text, language: "none" },
// 			userId: user.id,
// 			// If it was a new chat, send undefined so backend creates one
// 			conversationId: isNewChat ? undefined : activeId,
// 		});

// 		// 4. RECONCILIATION: Use the backend's fully formed object
// 		const serverConv = result; // This is the full conversation object

// 		setConversations((prev) => {
// 			// If it was a new chat, replace the 'temp-id' entry with the real server object
// 			if (isNewChat) {
// 				return prev.map((c) => (c.id === "temp-id" ? serverConv : c));
// 			}
// 			// Otherwise, just sync the specific conversation to ensure messages match
// 			return prev.map((c) => (c.id === serverConv.id ? serverConv : c));
// 		});

// 		// Set the active ID to the real one from the server
// 		if (activeId !== serverConv.id) {
// 			setActiveId(serverConv.id);
// 		}
// 	} catch (error) {
// 		console.error("Failed to sync message:", error);
// 		// Remove the failed message/temp conversation from state
// 	}
// };