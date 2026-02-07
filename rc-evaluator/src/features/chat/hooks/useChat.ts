import { useState, useCallback, useEffect } from 'react';
import { type Conversation, type Message, type NewMessageDTO } from '../types';
import { useApi } from './useApi';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useChat = (initialConversations: Conversation[] = []) => {
  const { user, token } = useAuth();
  const api = useApi();

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const activeConversation = conversations.find(c => c.id === activeId);

  // 1. Hydrate conversations on mount or when user changes
  useEffect(() => {
    if (!user?.id) return;

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
  }, [user?.id, api.getHistory]);

  // 2. Local creation (Optimistic)
  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `temp-${crypto.randomUUID()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
  }, []);

  // 3. Orchestrated Send Message
  const sendMessage = async (text: string) => {
    if (!activeId || !user?.id || !token) return;

    const currentIdBeforeSave = activeId;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: text,
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: currentIdBeforeSave
    };

    // Optimistic UI Update
    setConversations(prev => prev.map(c => 
      c.id === currentIdBeforeSave 
        ? { ...c, messages: [...c.messages, userMsg] } 
        : c
    ));

    try {
      // Use the API service instead of raw fetch
      const result = await api.sendMessage({
        sender: 'user',
        content: { text, language: 'none' },
        userId: user.id,
        conversationId: currentIdBeforeSave.startsWith('temp-') ? undefined : currentIdBeforeSave
      });

      const { conversationId: realId } = result;

      // RECONCILIATION: If the backend created a new ID, update our local state
      if (currentIdBeforeSave !== realId) {
        setConversations(prev => prev.map(c => 
          c.id === currentIdBeforeSave ? { ...c, id: realId } : c
        ));
        setActiveId(realId);
      }

      // 4. TODO: startStreamingInference(text, realId);
    } catch (error) {
      console.error("Failed to sync message:", error);
      // Logic for rolling back optimistic update could go here
      setConversations(prev => prev.map(c => 
        c.id === currentIdBeforeSave ? { ...c, messages: c.messages.filter(m => m.id !== userMsg.id) } : c
      ));
    }
  };

  return {
    conversations,
    activeConversation,
    sendMessage,
    createNewConversation,
    setActiveId
  };
};