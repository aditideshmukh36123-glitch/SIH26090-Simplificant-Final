import { EscrowStatus, OrderStatus, Role } from "@prisma/client";

export const LOGISTICS_STAGES: readonly OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.IN_WORKSHOP,
  OrderStatus.QUALITY_PASSED,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.SHIPPED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_WORKSHOP, OrderStatus.CANCELLED],
  [OrderStatus.IN_WORKSHOP]: [OrderStatus.QUALITY_PASSED, OrderStatus.CANCELLED],
  [OrderStatus.QUALITY_PASSED]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.IN_TRANSIT, OrderStatus.DISPUTED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DISPUTED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DISPUTED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.DISPUTED]: [],
};

export const TRANSITION_ROLES: Record<OrderStatus, readonly Role[]> = {
  [OrderStatus.CONFIRMED]: [],
  [OrderStatus.IN_WORKSHOP]: [Role.ARTISAN],
  [OrderStatus.QUALITY_PASSED]: [Role.ARTISAN],
  [OrderStatus.READY_FOR_PICKUP]: [Role.ARTISAN],
  [OrderStatus.SHIPPED]: [Role.DELIVERY],
  [OrderStatus.IN_TRANSIT]: [Role.DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [Role.DELIVERY],
  [OrderStatus.DELIVERED]: [Role.DELIVERY],
  [OrderStatus.CANCELLED]: [Role.BUYER, Role.ARTISAN, Role.ADMIN],
  [OrderStatus.DISPUTED]: [Role.BUYER, Role.DELIVERY, Role.ADMIN],
};

/**
 * Escrow target coupled to each logistics target. `null` means the escrow
 * status is not changed by the logistics transition.
 */
export const ESCROW_TARGET: Record<OrderStatus, EscrowStatus | null> = {
  [OrderStatus.CONFIRMED]: null,
  [OrderStatus.IN_WORKSHOP]: null,
  [OrderStatus.QUALITY_PASSED]: null,
  [OrderStatus.READY_FOR_PICKUP]: null,
  [OrderStatus.SHIPPED]: EscrowStatus.SHIPPED_PENDING_RELEASE,
  [OrderStatus.IN_TRANSIT]: null,
  [OrderStatus.OUT_FOR_DELIVERY]: EscrowStatus.DELIVERED_PENDING_CONFIRMATION,
  [OrderStatus.DELIVERED]: EscrowStatus.RELEASED_TO_SELLER,
  [OrderStatus.CANCELLED]: EscrowStatus.REFUNDED_TO_BUYER,
  [OrderStatus.DISPUTED]: null,
};

export function assertTransitionAllowed(from: OrderStatus, to: OrderStatus): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new Error(`Illegal logistics transition ${from} -> ${to}`);
  }
}