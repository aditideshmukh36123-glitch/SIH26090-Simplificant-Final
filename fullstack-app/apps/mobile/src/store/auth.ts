import { create } from "zustand";
import { setTokenCache, storage } from "../api/client";
import { apiLogin, apiLogout, apiMe, apiRegister } from "../api/auth";
import type { LoginInput, PublicUser, RegisterInput } from "../types";

interface AuthState {
  user: PublicUser | null;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapping: true,
  login: async (input) => {
    const data = await apiLogin(input);
    setTokenCache({ accessToken: data.accessToken, refreshToken: data.refreshToken, expiresIn: data.expiresIn });
    set({ user: data.user });
  },
  register: async (input) => {
    const data = await apiRegister(input);
    setTokenCache({ accessToken: data.accessToken, refreshToken: data.refreshToken, expiresIn: data.expiresIn });
    set({ user: data.user });
  },
  logout: async () => {
    const tokens = await storage.getTokens();
    if (tokens?.refreshToken) {
      try {
        await apiLogout(tokens.refreshToken);
      } catch {
        // Revocation failure is non-fatal on the client.
      }
    }
    setTokenCache(null);
    set({ user: null });
  },
  refreshMe: async () => {
    try {
      const user = await apiMe();
      set({ user });
    } catch {
      setTokenCache(null);
      set({ user: null });
    }
  },
}));

export async function bootstrapAuth(): Promise<void> {
  try {
    const tokens = await storage.getTokens();
    if (!tokens) {
      useAuthStore.setState({ user: null, isBootstrapping: false });
      return;
    }
    setTokenCache(tokens);
    try {
      const user = await apiMe();
      useAuthStore.setState({ user, isBootstrapping: false });
    } catch {
      setTokenCache(null);
      useAuthStore.setState({ user: null, isBootstrapping: false });
    }
  } catch (err) {
    console.warn("bootstrapAuth failed", err);
    useAuthStore.setState({ user: null, isBootstrapping: false });
  }
}