import { useState, useCallback, useEffect } from 'react';
import { type Conversation, type Message, type NewMessageDTO } from '../types';
// import { useAuthStore } from '@/store/useAuthStore';

const API_HOST = import.meta.env.VITE_API_HOST;

export const useChat = (initialConversations: Conversation[]) => {
    // 1. Hook into the Auth Store
    // Select only what you need for better performance (selectors)
    // const token = useAuthStore((state) => state.token);
    // const userId = useAuthStore((state) => state.userId);

    const token = "";
    const userId = "";

    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id || null);
    const activeConversation = conversations.find(c => c.id === activeId);

    // 2. Hydrate conversations from backend on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_HOST}/chat/history/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setConversations(data); // Rehydrate the sidebar
                if (data.length > 0) setActiveId(data[0].id); // Auto-select latest
            } catch (error) {
                console.error("Hydration failed", error);
            }
        };
        fetchHistory();
    }, [userId]);

    const createNewConversation = useCallback(() => {
        const newConv: Conversation = {
            id: crypto.randomUUID(),
            title: 'New Conversation',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setConversations(prev => [...prev, newConv]);
        setActiveId(newConv.id);
    }, [conversations]);

    const sendMessage = async (text: string) => {
        if (!activeId) return;
        if (!token || !userId) {
            console.error("Auth missing: User must be logged in.");
            return;
        }

        const userMsg: Message = {
            id: crypto.randomUUID(),
            content: text,
            role: 'user',
            createdAt: new Date().toISOString(),
            conversationId: activeId
        };

        // Update UI
        setConversations(prev => prev.map(c => c.id === activeId ? {
            ...c,
            messages: [...c.messages, userMsg]
        } : c));

        const saveRes = await fetch(`${API_HOST}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                sender: 'user',
                content: { text, language: 'none' },
                userId: userId // Use the ID from the store
            })
        });

        const {conversationId: realId } = await saveRes.json();
  
        // 3. Trigger the Stream (The Python Bridge)
        // startStreamingInference(text, realId);
    };

    return {
        conversations,
        activeConversation,
        sendMessage,
        createNewConversation,
        setActiveId
    };
};