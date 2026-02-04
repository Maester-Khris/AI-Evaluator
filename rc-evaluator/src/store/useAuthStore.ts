// // src/store/useAuthStore.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// interface AuthState {
//   token: string | null;
//   userId: string | null;
//   setAuth: (token: string, userId: string) => void;
//   logout: () => void;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       token: "sample-token",
//       userId: "user-123",
//       setAuth: (token, userId) => set({ token, userId }),
//       logout: () => set({ token: null, userId: null }),
//     }),
//     { name: 'auth-storage' } // This automatically syncs with LocalStorage
//   )
// );