import { randomUUID } from "crypto";
import { OrderStatus, Prisma, Role } from "@prisma/client";
import { ApiError } from "../../errors/ApiError";
import { prisma } from "../../lib/prisma";
import { encryptSecret, generateHandoverOtp, hashPassword, decryptSecret } from "../../utils/crypto";
import { generateAwb, generateDisplayId } from "../../utils/ids";
import { ESCROW_TARGET, TRANSITION_ROLES, ALLOWED_TRANSITIONS } from "./state-machine";
import type { CreateOrderInput, UpdateOrderStatusInput } from "./orders.schemas";

interface RequestUser {
  id: string;
  role: Role;
}

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          cleanImageUrl: true,
          category: true,
          artisanId: true,
        },
      },
    },
  },
  escrowTransaction: true,
  deliveryAgent: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.OrderInclude;

type OrderWithIncludes = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export async function createOrder(buyerId: string, input: CreateOrderInput) {
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, stockQuantity: true, isPublished: true, title: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  let totalAmount = new Prisma.Decimal(0);
  const orderItemData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of input.items) {
    const product = productById.get(item.productId);
    if (!product) {
      throw ApiError.badRequest(`Unknown product: ${item.productId}`);
    }
    if (!product.isPublished) {
      throw ApiError.badRequest(`Product ${product.title} is no longer available`);
    }
    if (product.stockQuantity < item.quantity) {
      throw ApiError.conflict(`Insufficient stock for "${product.title}"`);
    }
    totalAmount = totalAmount.plus(product.price.times(item.quantity));
    orderItemData.push({
      product: { connect: { id: product.id } },
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  if (totalAmount.lte(0)) {
    throw ApiError.badRequest("Order total must be greater than zero");
  }

  const otp = generateHandoverOtp();
  const [otpHashed, otpEncrypted] = await Promise.all([
    hashPassword(otp),
    Promise.resolve(encryptSecret(otp)),
  ]);

  const orderId = randomUUID();
  const displayId = generateDisplayId();

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const guard = await tx.product.updateMany({
        where: {
          id: item.productId,
          isPublished: true,
          stockQuantity: { gte: item.quantity },
        },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (guard.count !== 1) {
        throw ApiError.conflict(`Insufficient stock for product ${item.productId}`);
      }
    }

    return tx.order.create({
      data: {
        id: orderId,
        displayId,
        buyerId,
        totalAmount,
        status: OrderStatus.CONFIRMED,
        shippingAddress: input.shippingAddress,
        deliveryOtpHashed: otpHashed,
        deliveryOtpEncrypted: otpEncrypted,
        items: { create: orderItemData },
        escrowTransaction: { create: { amount: totalAmount } },
      },
      include: orderInclude,
    });
  });

  return { order, secretOtp: otp };
}

export async function listOrders(user: RequestUser, status?: OrderStatus) {
  const where: Prisma.OrderWhereInput = status ? { status } : {};

  switch (user.role) {
    case Role.BUYER:
      where.buyerId = user.id;
      break;
    case Role.ARTISAN:
      where.items = { some: { product: { artisanId: user.id } } };
      break;
    case Role.DELIVERY:
      where.deliveryAgentId = user.id;
      break;
    case Role.ADMIN:
      break;
    default:
      throw ApiError.forbidden("Your role has no order access");
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });

  return orders.map((order) => serializeOrder(order));
}

export async function getOrderById(user: RequestUser, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw ApiError.notFound(`Order ${orderId} not found`);
  }
  assertOrderAccess(user, order);

  const canSeeOtp =
    user.role === Role.BUYER &&
    order.buyerId === user.id &&
    order.status !== OrderStatus.DELIVERED &&
    order.status !== OrderStatus.CANCELLED;

  return serializeOrder(order, { secretOtp: canSeeOtp ? decryptSecret(order.deliveryOtpEncrypted) : undefined });
}

export async function transitionOrderStatus(
  user: RequestUser,
  orderId: string,
  input: UpdateOrderStatusInput
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw ApiError.notFound(`Order ${orderId} not found`);
  }
  assertOrderAccess(user, order);

  const from = order.status;
  const to = input.status;

  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw ApiError.conflict(`Illegal logistics transition ${from} -> ${to}`);
  }
  if (user.role !== Role.ADMIN && !TRANSITION_ROLES[to].includes(user.role)) {
    throw ApiError.forbidden(`Role ${user.role} cannot perform transition to ${to}`);
  }

  if (from === OrderStatus.CANCELLED || from === OrderStatus.DELIVERED) {
    throw ApiError.conflict(`Order is already ${from}; further transitions are not permitted`);
  }

  const artisanOwned = order.items.some(
    (item) => item.product.artisanId === user.id
  );
  if (
    user.role === Role.ARTISAN &&
    !artisanOwned
  ) {
    throw ApiError.forbidden("You do not own any product on this order");
  }
  if (user.role === Role.DELIVERY && order.deliveryAgentId && order.deliveryAgentId !== user.id) {
    throw ApiError.forbidden("This order is assigned to a different delivery agent");
  }

  const isShippingStep =
    to === OrderStatus.IN_TRANSIT || to === OrderStatus.OUT_FOR_DELIVERY;
  if (
    user.role === Role.DELIVERY &&
    isShippingStep &&
    !order.deliveryAgentId
  ) {
    throw ApiError.conflict("Order must first be picked up (SHIPPED) before this step");
  }

  const shouldAssignDelivery = to === OrderStatus.SHIPPED && user.role === Role.DELIVERY && !order.deliveryAgentId;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: from },
      data: {
        status: to,
        ...(to === OrderStatus.SHIPPED
          ? {
              trackingAwb: order.trackingAwb ?? generateAwb(),
              carrierName: input.carrierName ?? null,
            }
          : {}),
        ...(input.currentLocation ? { currentLocation: input.currentLocation } : {}),
        ...(shouldAssignDelivery ? { deliveryAgentId: user.id } : {}),
      },
    });
    if (updated.count !== 1) {
      throw ApiError.conflict("Order state changed concurrently; retry");
    }

    const escrowTarget = ESCROW_TARGET[to];
    if (escrowTarget && order.escrowTransaction) {
      const escrowUpdated = await tx.escrowTransaction.updateMany({
        where: { orderId: order.id, status: order.escrowTransaction.status },
        data: {
          status: escrowTarget,
          ...(to === OrderStatus.CANCELLED ? { releasedAt: new Date() } : {}),
        },
      });
      if (escrowUpdated.count !== 1) {
        throw ApiError.conflict("Escrow state changed concurrently; retry");
      }
    }

    if (to === OrderStatus.DISPUTED) {
      await tx.escrowTransaction.updateMany({
        where: { orderId: order.id, disputedAt: null },
        data: { disputedAt: new Date() },
      });
    }
  });

  const fresh = await prisma.order.findUnique({
    where: { id: order.id },
    include: orderInclude,
  });
  if (!fresh) {
    throw ApiError.notFound(`Order ${order.id} not found after transition`);
  }
  return serializeOrder(fresh);
}

export async function updateOrderLocation(
  user: RequestUser,
  orderId: string,
  currentLocation: string
) {
  if (user.role !== Role.DELIVERY && user.role !== Role.ADMIN) {
    throw ApiError.forbidden("Only delivery agents may update location");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      deliveryAgentId: true,
      buyerId: true,
    },
  });
  if (!order) {
    throw ApiError.notFound(`Order ${orderId} not found`);
  }
  if (user.role === Role.DELIVERY && order.deliveryAgentId !== user.id) {
    throw ApiError.forbidden("This order is assigned to a different delivery agent");
  }
  if (
    order.status !== OrderStatus.SHIPPED &&
    order.status !== OrderStatus.IN_TRANSIT &&
    order.status !== OrderStatus.OUT_FOR_DELIVERY
  ) {
    throw ApiError.conflict("Location can only be updated while the order is in transit");
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { currentLocation },
    select: { id: true, currentLocation: true, updatedAt: true },
  });
  return updated;
}

function assertOrderAccess(user: RequestUser, order: OrderWithIncludes): void {
  switch (user.role) {
    case Role.BUYER:
      if (order.buyerId !== user.id) {
        throw ApiError.forbidden("You can only access your own orders");
      }
      break;
    case Role.ARTISAN:
      if (!order.items.some((item) => item.product.artisanId === user.id)) {
        throw ApiError.forbidden("You can only access orders containing your products");
      }
      break;
    case Role.DELIVERY:
      if (order.deliveryAgentId !== user.id) {
        throw ApiError.forbidden("This order is assigned to a different delivery agent");
      }
      break;
    case Role.ADMIN:
      break;
    default:
      throw ApiError.forbidden("Your role has no order access");
  }
}

export function serializeOrder(
  order: OrderWithIncludes,
  opts: { secretOtp?: string } = {}
) {
  const { deliveryOtpHashed, deliveryOtpEncrypted, ...safe } = order;
  return {
    ...safe,
    ...(opts.secretOtp !== undefined ? { secretOtp: opts.secretOtp } : {}),
  };
}