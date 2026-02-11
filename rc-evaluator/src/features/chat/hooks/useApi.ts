// hooks/useApi.ts
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useCallback } from 'react';// Assuming useAuth is exported

const API_BASE = import.meta.env.VITE_API_HOST;

export const useApi = () => {
  const { token } = useAuth(); // Get token from context

  const showNotification = useNotification.getState().show;

  const fetchWithAuth = async (endpoint: string, options: any = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);

      if (!response.ok) {
        if (response.status === 503 || response.status === 502) {
          showNotification("Server is currently under maintenance. Please try again later.", "error");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      // This catches "Failed to fetch" (Network errors / Backend offline)
      if (error.message === 'Failed to fetch') {
        showNotification("Unable to connect to the server. Check your connection or backend status.", "error");
      }
      throw error;
    }
  };

  // const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     ...(token && { 'Authorization': `Bearer ${token}` }),
  //     ...options.headers,
  //   };

  //   const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  //   if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  //   return response.json();
  // }, [token]);

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