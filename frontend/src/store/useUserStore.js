
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// useUserStore with persist
export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light',

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