import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light', // 'light' or 'dark'

      setUser: (userData) => set({ user: userData }),

      updateUser: (newData) => set((state) => ({
        user: state.user ? { ...state.user, ...newData } : null
      })),

      clearUser: () => set({ user: null }),

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
    }),
    {
      name: 'user-storage',
    }
  )
);