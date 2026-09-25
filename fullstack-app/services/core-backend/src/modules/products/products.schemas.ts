import { z } from "zod";

export const CraftCategory = z.enum([
  "POTTERY",
  "TEXTILE",
  "WOODWORK",
  "METALWARE",
  "PAINTING",
  "LEATHERWORK",
  "JEWELLERY",
  "STONEWORK",
  "CANE_BAMBOO",
  "OTHER",
]);

export const listProductsQuerySchema = z.object({
  category: CraftCategory.optional(),
  search: z.string().min(1).max(200).optional(),
  artisanId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const productIdParamSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

const descriptionSchema = z.record(z.string(), z.string().min(1).max(2000));

export const createProductSchema = z.object({
  title: z.string().trim().min(3).max(200),
  titleHi: z.string().trim().max(200).optional(),
  description: descriptionSchema,
  category: CraftCategory,
  price: z.coerce.number().positive().max(10_000_000),
  b2bPrice: z.coerce.number().positive().max(10_000_000).optional(),
  rawMaterialCost: z.coerce.number().positive().max(10_000_000).optional(),
  laborHours: z.coerce.number().nonnegative().max(10_000).optional(),
  hourlyWage: z.coerce.number().positive().max(100_000).optional(),
  retailMiddlemanEst: z.coerce.number().positive().max(10_000_000).optional(),
  authenticityGrade: z.string().trim().max(50).optional(),
  lineageGI: z.string().trim().max(200).optional(),
  giTagged: z.boolean().default(false),
  cleanImageUrl: z.string().url(),
  rawWorkshopImageUrl: z.string().url().optional(),
  originalAudioUrl: z.string().url().optional(),
  materials: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
  tags: z.array(z.string().trim().min(1).max(50)).max(50).default([]),
  stockQuantity: z.coerce.number().int().min(0).max(10_000).default(1),
  isPublished: z.boolean().default(true),
});
