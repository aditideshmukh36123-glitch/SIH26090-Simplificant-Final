import type {
  ApiResponse,
  AuthResponseData,
  LoginInput,
  PublicUser,
  RegisterInput,
  TokenPair,
} from "../types";
import { coreClient } from "./client";

export async function apiRegister(input: RegisterInput): Promise<AuthResponseData> {
  const res = await coreClient.post<ApiResponse<AuthResponseData>>("/auth/register", input);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiLogin(input: LoginInput): Promise<AuthResponseData> {
  const res = await coreClient.post<ApiResponse<AuthResponseData>>("/auth/login", input);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiRefresh(refreshToken: string): Promise<TokenPair> {
  const res = await coreClient.post<ApiResponse<TokenPair>>("/auth/refresh", { refreshToken });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiLogout(refreshToken: string): Promise<void> {
  await coreClient.post("/auth/logout", { refreshToken });
}

export async function apiMe(): Promise<PublicUser> {
  const res = await coreClient.get<ApiResponse<PublicUser>>("/auth/me");
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}