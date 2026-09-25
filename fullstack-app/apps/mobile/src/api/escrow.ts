import type {
  ApiResponse,
  DisputeResolution,
  EscrowTransaction,
  HandoverVerification,
} from "../types";
import { coreClient } from "./client";

export async function apiAuthorizeEscrow(
  orderId: string,
  paymentGatewayRef?: string
): Promise<EscrowTransaction> {
  const res = await coreClient.post<ApiResponse<EscrowTransaction>>("/escrow/authorize", {
    orderId,
    ...(paymentGatewayRef ? { paymentGatewayRef } : {}),
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiConfirmEscrowHold(orderId: string): Promise<EscrowTransaction> {
  const res = await coreClient.post<ApiResponse<EscrowTransaction>>("/escrow/confirm-hold", {
    orderId,
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiVerifyHandoverOtp(
  orderId: string,
  enteredOtp: string
): Promise<HandoverVerification> {
  const res = await coreClient.post<ApiResponse<HandoverVerification>>("/escrow/verify-otp", {
    orderId,
    enteredOtp,
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiResolveDispute(
  orderId: string,
  outcome: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER"
): Promise<DisputeResolution> {
  const res = await coreClient.post<ApiResponse<DisputeResolution>>("/escrow/resolve", {
    orderId,
    outcome,
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}