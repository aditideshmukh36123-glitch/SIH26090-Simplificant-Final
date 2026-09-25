import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "At least one item is required")
    .max(50),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(200),
    line1: z.string().trim().min(3).max(255),
    line2: z.string().trim().max(255).optional(),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    postalCode: z.string().trim().regex(/^\d{6}$/, "Invalid 6-digit PIN code"),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Invalid phone number"),
    landmark: z.string().trim().max(255).optional(),
  }),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum([
      "IN_WORKSHOP",
      "QUALITY_PASSED",
      "READY_FOR_PICKUP",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "CANCELLED",
      "DISPUTED",
    ]),
    carrierName: z.string().trim().max(120).optional(),
    currentLocation: z.string().trim().max(255).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "SHIPPED" && !value.carrierName) {
      ctx.addIssue({
        code: "custom",
        path: ["carrierName"],
        message: "carrierName is required when transitioning to SHIPPED",
      });
    }
  });

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid(),
});

export const updateLocationSchema = z.object({
  currentLocation: z.string().trim().min(1).max(255),
});

export const listOrdersQuerySchema = z.object({
  status: z
    .enum([
      "CONFIRMED",
      "IN_WORKSHOP",
      "QUALITY_PASSED",
      "READY_FOR_PICKUP",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "DISPUTED",
    ])
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;