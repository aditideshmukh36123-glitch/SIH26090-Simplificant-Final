import { z } from "zod";

const orderId = z.string().uuid();

const fourDigitOtp = z.union([
  z.string().regex(/^\d{4}$/, "OTP must be exactly 4 digits"),
  z
    .number()
    .int()
    .min(0)
    .max(9999)
    .transform((value) => String(value).padStart(4, "0")),
]);

export const authorizeEscrowSchema = z.object({
  orderId,
  paymentGatewayRef: z.string().trim().max(200).optional(),
});

export const confirmHoldEscrowSchema = z.object({
  orderId,
});

export const verifyOtpSchema = z.object({
  orderId,
  enteredOtp: fourDigitOtp,
});

export const resolveDisputeSchema = z.object({
  orderId,
  outcome: z.enum(["RELEASE_TO_SELLER", "REFUND_TO_BUYER"]),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type AuthorizeEscrowInput = z.infer<typeof authorizeEscrowSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;