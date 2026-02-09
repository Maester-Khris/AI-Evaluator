import { useState, useCallback, useEffect } from 'react';
import { type Conversation, type Message } from '../types';
import { useApi } from './useApi';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useChat = (initialConversations: Conversation[] = []) => {
  const { user, isLoading } = useAuth();
  const api = useApi();

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeId);

  // 1. Hydrate conversations on mount or when user changes
  useEffect(() => {
    // 1. Guard: Don't fetch if there's no ID OR if we are still loading Auth
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

  const sendMessage = async (text: string) => {
  if (!user?.id || !text.trim()) return;

  // 1. Determine if we are creating a brand new conversation
  const isNewChat = !activeId || activeId.startsWith('temp-');
  
  // Use 'guest' sender string if the ID contains 'guest'
  const senderRole = user.id.includes('guest') ? 'guest' : 'user';

  // 2. Local message for immediate feedback
  const userMsg: Message = {
    id: crypto.randomUUID(),
    content: { text, language: 'none' },
    sender: senderRole as any,
    createdAt: new Date().toISOString(),
    conversationId: activeId || 'temp-id'
  };

  // Add message to UI immediately
  setConversations(prev => {
    if (isNewChat) {
      return [{
        id: 'temp-id',
        userId: user.id,
        title: text.substring(0, 30),
        messages: [userMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, ...prev];
    }
    return prev.map(c => c.id === activeId 
      ? { ...c, messages: [...c.messages, userMsg] } : c
    );
  });

  try {
    // 3. API Call
    const result = await api.sendMessage({
      sender: senderRole,
      content: { text, language: 'none' },
      userId: user.id,
      // If it was a new chat, send undefined so backend creates one
      conversationId: isNewChat ? undefined : activeId 
    });

    // 4. RECONCILIATION: Use the backend's fully formed object
    const serverConv = result; // This is the full conversation object

    setConversations(prev => {
      // If it was a new chat, replace the 'temp-id' entry with the real server object
      if (isNewChat) {
        return prev.map(c => c.id === 'temp-id' ? serverConv : c);
      }
      // Otherwise, just sync the specific conversation to ensure messages match
      return prev.map(c => c.id === serverConv.id ? serverConv : c);
    });

    // Set the active ID to the real one from the server
    if (activeId !== serverConv.id) {
      setActiveId(serverConv.id);
    }

  } catch (error) {
    console.error("Failed to sync message:", error);
    // Remove the failed message/temp conversation from state
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