import { z } from "zod";

const phoneSchema = z
  .string()
  .regex(/^\+?\d{10,15}$/, "Invalid phone number");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

const selfRegisterableRoles = z.enum(["BUYER", "ARTISAN", "PRODUCER", "DELIVERY"]);

export const registerSchema = z.object({
  phone: phoneSchema,
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: passwordSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  role: selfRegisterableRoles.default("BUYER"),
  giCluster: z.string().trim().max(200).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(5).max(200),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;