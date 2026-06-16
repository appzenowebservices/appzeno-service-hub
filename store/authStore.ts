"use client";

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "../types";

interface AuthState {
  user: { id: string; mobile: string; role: UserRole; fullName: string; email?: string; isVerified: boolean; isActive: boolean; createdAt: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: string) => void;
  login: (user: AuthState["user"], token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "addies-auth",
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export function useUserRole(): UserRole {
  return useAuthStore((s) => s.user?.role ?? "guest");
}