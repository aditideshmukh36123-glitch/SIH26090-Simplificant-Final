import { Router } from "express";
import { Role } from "@prisma/client";
import type { OrderStatus } from "@prisma/client";
import { asyncHandler } from "../../middleware/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";
import { validate, validateAll } from "../../middleware/validate";
import {
  createOrder,
  getOrderById,
  listOrders,
  serializeOrder,
  transitionOrderStatus,
  updateOrderLocation,
} from "./orders.service";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateLocationSchema,
  updateOrderStatusSchema,
} from "./orders.schemas";

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post(
  "/",
  requireRole(Role.BUYER),
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const { order, secretOtp } = await createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, data: serializeOrder(order, { secretOtp }) });
  })
);

ordersRouter.get(
  "/",
  validateAll({ query: listOrdersQuerySchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const orders = await listOrders(req.user, req.query.status as OrderStatus | undefined);
    res.json({ success: true, data: orders });
  })
);

ordersRouter.get(
  "/:orderId",
  validateAll({ params: orderIdParamSchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const order = await getOrderById(req.user, req.params.orderId as string);
    res.json({ success: true, data: order });
  })
);

ordersRouter.patch(
  "/:orderId/status",
  validateAll({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const order = await transitionOrderStatus(req.user, req.params.orderId as string, req.body);
    res.json({ success: true, data: order });
  })
);

ordersRouter.patch(
  "/:orderId/location",
  requireRole(Role.DELIVERY),
  validateAll({ params: orderIdParamSchema, body: updateLocationSchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const location = await updateOrderLocation(req.user, req.params.orderId as string, req.body.currentLocation);
    res.json({ success: true, data: location });
  })
);