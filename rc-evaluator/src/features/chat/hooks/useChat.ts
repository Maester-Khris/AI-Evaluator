import { useState, useCallback } from 'react';
import { type Conversation, type Message, type NewMessageDTO } from '../types';

export const useChat = (initialConversations: Conversation[]) => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id || null);
    const activeConversation = conversations.find(c => c.id === activeId);

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

    const sendMessage  = async (text: string) => {
        if (!activeId) return;

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

        // Logic for calling backend api
        console.log("Sending to backend:", text);
    };

    return {
    conversations,
    activeConversation,
    sendMessage,
    createNewConversation,
    setActiveId
  };
};