import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../middleware/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  authorizeEscrow,
  confirmEscrowHold,
  resolveDispute,
  verifyHandoverOtp,
} from "./escrow.service";
import {
  authorizeEscrowSchema,
  confirmHoldEscrowSchema,
  resolveDisputeSchema,
  verifyOtpSchema,
} from "./escrow.schemas";

export const escrowRouter = Router();

escrowRouter.use(authenticate);

escrowRouter.post(
  "/authorize",
  requireRole(Role.BUYER),
  validate(authorizeEscrowSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const escrow = await authorizeEscrow(
      req.user.id,
      req.body.orderId,
      req.body.paymentGatewayRef
    );
    res.json({ success: true, data: escrow });
  })
);

escrowRouter.post(
  "/confirm-hold",
  requireRole(Role.BUYER),
  validate(confirmHoldEscrowSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const escrow = await confirmEscrowHold(req.user.id, req.body.orderId);
    res.json({ success: true, data: escrow });
  })
);

escrowRouter.post(
  "/verify-otp",
  requireRole(Role.DELIVERY),
  validate(verifyOtpSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const result = await verifyHandoverOtp(req.user.id, req.body.orderId, req.body.enteredOtp);
    res.json({ success: true, data: result });
  })
);

escrowRouter.post(
  "/resolve",
  requireRole(Role.ADMIN),
  validate(resolveDisputeSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const result = await resolveDispute(req.user, req.body);
    res.json({ success: true, data: result });
  })
);