// @ts-ignore - zustand types will be available after npm install
import { create } from 'zustand';
// @ts-ignore
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;

export const useAuthStore = create<AuthState>()(
  persist(
    (set: SetState<AuthState>) => ({
      user: null,
      token: null,
      setAuth: (user: User, token: string) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null });
      },
      updateUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({ user: state.user, token: state.token }),
    }
  )
);

