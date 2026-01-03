import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      
      updateUser: (newData) => set((state) => ({ 
        user: state.user ? { ...state.user, ...newData } : null
      })),
      
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);