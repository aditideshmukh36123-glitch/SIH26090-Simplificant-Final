import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required (Neon pooled connection string)"),
  DATABASE_DIRECT_URL: z
    .string()
    .min(1, "DATABASE_DIRECT_URL is required (Neon direct/unpooled connection string for transactions)"),
  CORS_ORIGIN: z.string().default("*"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be at least 32 characters"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = parsed.error.flatten().fieldErrors;
  console.error("Invalid environment configuration: " + JSON.stringify(fields, null, 2));
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;