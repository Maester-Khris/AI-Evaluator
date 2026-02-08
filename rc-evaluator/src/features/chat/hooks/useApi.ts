// hooks/useApi.ts
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCallback } from 'react';// Assuming useAuth is exported

const API_BASE = import.meta.env.VITE_API_HOST;

export const useApi = () => {
  const { token } = useAuth(); // Get token from context

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    console.log("fetchWithAuth called with endpoint:", endpoint);
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }, [token]);

  // GET /api/chat/conversation/:id
  const getMessages = (id: string) => fetchWithAuth(`/chat/conversation/${id}`);

  // GET /api/chat/history/:userId
  const getHistory = (userId: string) => fetchWithAuth(`/chat/history/${userId}`);

  // POST /chat/message
  const sendMessage = (payload: any) => fetchWithAuth('/chat/message', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // PATCH /chat/message/:id/evaluate
  const evaluateMessage = (messageId: string, rating: number, comment: string) => 
    fetchWithAuth(`/chat/message/${messageId}/evaluate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, evaluationComment: comment }),
    });

  return { getMessages, getHistory, sendMessage, evaluateMessage };
};