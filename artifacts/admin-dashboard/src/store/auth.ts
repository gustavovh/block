import { create } from "zustand";
import type { AdminUser } from "@workspace/admin-sdk";

interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  logout: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({
      user: null,
      token: null,
      refreshToken: null,
    });
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    if (token) {
      set({ token, refreshToken });
    }
  },
}));
