import { EscrowStatus, OrderStatus, Role } from "@prisma/client";
import { ApiError } from "../../errors/ApiError";
import { prisma } from "../../lib/prisma";
import { verifyPassword } from "../../utils/crypto";

interface Actor {
  id: string;
  role: Role;
}

export async function authorizeEscrow(
  buyerId: string,
  orderId: string,
  paymentGatewayRef?: string
) {
  const escrow = await requireBuyerOwnedEscrow(buyerId, orderId);

  if (escrow.status !== EscrowStatus.INITIATED) {
    throw ApiError.conflict(`Escrow is already ${escrow.status}`);
  }
  if (escrow.order.status !== OrderStatus.CONFIRMED) {
    throw ApiError.conflict("Order must be CONFIRMED before escrow authorization");
  }

  const updated = await prisma.escrowTransaction.updateMany({
    where: { id: escrow.id, status: EscrowStatus.INITIATED },
    data: { status: EscrowStatus.AUTHORIZED, paymentGatewayRef: paymentGatewayRef ?? null },
  });
  if (updated.count !== 1) {
    throw ApiError.conflict("Escrow state changed concurrently; retry");
  }

  return prisma.escrowTransaction.findUniqueOrThrow({
    where: { id: escrow.id },
    include: { order: { select: { id: true, displayId: true, status: true } } },
  });
}

export async function confirmEscrowHold(buyerId: string, orderId: string) {
  const escrow = await requireBuyerOwnedEscrow(buyerId, orderId);

  if (escrow.status !== EscrowStatus.AUTHORIZED) {
    throw ApiError.conflict(`Escrow must be AUTHORIZED before funds are held, got ${escrow.status}`);
  }

  const updated = await prisma.escrowTransaction.updateMany({
    where: { id: escrow.id, status: EscrowStatus.AUTHORIZED },
    data: { status: EscrowStatus.HELD_IN_ESCROW, heldAt: new Date() },
  });
  if (updated.count !== 1) {
    throw ApiError.conflict("Escrow state changed concurrently; retry");
  }

  return prisma.escrowTransaction.findUniqueOrThrow({
    where: { id: escrow.id },
    include: { order: { select: { id: true, displayId: true, status: true } } },
  });
}

export async function verifyHandoverOtp(
  agentId: string,
  orderId: string,
  enteredOtp: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { escrowTransaction: true },
  });
  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  if (order.deliveryAgentId !== agentId) {
    throw ApiError.forbidden("This order is assigned to a different delivery agent");
  }
  if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
    throw ApiError.conflict("Order must be OUT_FOR_DELIVERY before OTP verification");
  }

  const otpMatches = await verifyPassword(enteredOtp, order.deliveryOtpHashed);
  if (!otpMatches) {
    throw ApiError.badRequest("Invalid Handover OTP");
  }

  const escrow = order.escrowTransaction;
  if (!escrow) {
    throw ApiError.notFound("Escrow transaction not found for this order");
  }
  if (escrow.status !== EscrowStatus.DELIVERED_PENDING_CONFIRMATION) {
    throw ApiError.conflict(
      `Escrow must be DELIVERED_PENDING_CONFIRMATION, got ${escrow.status}`
    );
  }

  await prisma.$transaction(async (tx) => {
    const orderUpdated = await tx.order.updateMany({
      where: { id: order.id, status: OrderStatus.OUT_FOR_DELIVERY },
      data: { status: OrderStatus.DELIVERED },
    });
    if (orderUpdated.count !== 1) {
      throw ApiError.conflict("Order state changed concurrently; retry");
    }

    const escrowUpdated = await tx.escrowTransaction.updateMany({
      where: { id: escrow.id, status: EscrowStatus.DELIVERED_PENDING_CONFIRMATION },
      data: {
        status: EscrowStatus.RELEASED_TO_SELLER,
        otpVerifiedAt: new Date(),
        releasedAt: new Date(),
      },
    });
    if (escrowUpdated.count !== 1) {
      throw ApiError.conflict("Escrow state changed concurrently; retry");
    }
  });

  const now = new Date();
  // DBT payout to the artisan's bank account is triggered here once the
  // payment-provider webhook integration is wired (escrow → payout).
  return {
    orderId: order.id,
    orderStatus: OrderStatus.DELIVERED,
    escrowStatus: EscrowStatus.RELEASED_TO_SELLER,
    otpVerifiedAt: now.toISOString(),
    releasedAt: now.toISOString(),
  };
}

export async function resolveDispute(admin: Actor, input: {
  orderId: string;
  outcome: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER";
}) {
  if (admin.role !== Role.ADMIN) {
    throw ApiError.forbidden("Only an admin may resolve disputes");
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { escrowTransaction: true },
  });
  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  if (order.status !== OrderStatus.DISPUTED) {
    throw ApiError.conflict("Only DISPUTED orders can be resolved");
  }

  const now = new Date();
  const escrowStatus =
    input.outcome === "RELEASE_TO_SELLER"
      ? EscrowStatus.RELEASED_TO_SELLER
      : EscrowStatus.REFUNDED_TO_BUYER;
  const orderStatus =
    input.outcome === "RELEASE_TO_SELLER" ? OrderStatus.DELIVERED : OrderStatus.CANCELLED;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: OrderStatus.DISPUTED },
      data: { status: orderStatus },
    });
    if (updated.count !== 1) {
      throw ApiError.conflict("Order state changed concurrently; retry");
    }
    if (order.escrowTransaction) {
      await tx.escrowTransaction.updateMany({
        where: { id: order.escrowTransaction.id },
        data: {
          status: escrowStatus,
          ...(input.outcome === "RELEASE_TO_SELLER" ? { releasedAt: now } : {}),
          otpVerifiedAt: order.escrowTransaction.otpVerifiedAt ?? now,
        },
      });
    }
  });

  return { orderId: order.id, orderStatus, escrowStatus, resolvedAt: now.toISOString() };
}

async function requireBuyerOwnedEscrow(buyerId: string, orderId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { orderId },
    include: { order: { select: { id: true, displayId: true, status: true, buyerId: true } } },
  });
  if (!escrow) {
    throw ApiError.notFound("Escrow transaction not found for this order");
  }
  if (escrow.order.buyerId !== buyerId) {
    throw ApiError.forbidden("Only the buyer can manage this escrow");
  }
  return escrow;
}