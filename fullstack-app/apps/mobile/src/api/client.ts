import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { AI_API_URL, CORE_API_URL } from "../config";
import type { ApiResponse, TokenPair } from "../types";

const ACCESS_KEY = "sih.accessToken";
const REFRESH_KEY = "sih.refreshToken";

export const storage = {
  async getTokens(): Promise<TokenPair | null> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken, expiresIn: 0 };
  },
  async storeTokens(pair: TokenPair): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_KEY, pair.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, pair.refreshToken);
  },
  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

export const coreClient = axios.create({
  baseURL: CORE_API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export const aiClient = axios.create({
  baseURL: AI_API_URL,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setTokenCache(pair: TokenPair | null): void {
  accessToken = pair?.accessToken ?? null;
  refreshToken = pair?.refreshToken ?? null;
  if (pair) {
    void storage.storeTokens(pair).catch(() => undefined);
  } else {
    void storage.clearTokens().catch(() => undefined);
  }
}

async function doRefresh(): Promise<string> {
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const res = await axios.post<ApiResponse<TokenPair>>(`${CORE_API_URL}/auth/refresh`, {
    refreshToken,
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  setTokenCache(res.data.data);
  return res.data.data.accessToken;
}

function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}

coreClient.interceptors.request.use(attachAuth);
aiClient.interceptors.request.use(attachAuth);

coreClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    if (error.response?.status !== 401 || !original || original._retried) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshPromise = refreshPromise ?? doRefresh().finally(() => {
        refreshPromise = null;
      });
      const newAccess = await refreshPromise;
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return coreClient(original);
    } catch {
      setTokenCache(null);
      return Promise.reject(error);
    }
  }
);

export function resetApi(): void {
  setTokenCache(null);
}