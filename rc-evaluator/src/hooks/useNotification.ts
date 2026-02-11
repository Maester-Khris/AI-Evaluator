import { create } from 'zustand'; // Or use a simple React Context

type NotificationType = 'error' | 'success' | 'info' | 'offline';

interface NotificationState {
  message: string | null;
  type: NotificationType;
  show: (message: string, type?: NotificationType) => void;
  clear: () => void;
}

export const useNotification = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  clear: () => set({ message: null }),
}));