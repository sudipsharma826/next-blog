import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  roles: string[];
}

interface UserState {
  user: User | null;
  setUser: (data: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (data) => set({ user: data }),
        clearUser: () => set({ user: null }),
      }),
      {
        name: 'user-info',
      },
    ),
  ),
);
