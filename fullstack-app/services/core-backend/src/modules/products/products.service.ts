import type { CraftCategory, Product } from "@prisma/client";
import { Prisma, Role } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../errors/ApiError";
import type { createProductSchema } from "./products.schemas";

export type CreateProductInput = z.infer<typeof createProductSchema>;

export async function createProduct(
  user: { id: string; role: Role },
  input: CreateProductInput
): Promise<ProductSummary> {
  if (user.role !== Role.ARTISAN && user.role !== Role.PRODUCER && user.role !== Role.ADMIN) {
    throw ApiError.forbidden("Only artisans, producers, and admins may publish products");
  }

  const product = await prisma.product.create({
    data: {
      artisanId: user.id,
      title: input.title,
      titleHi: input.titleHi ?? null,
      description: input.description as Prisma.InputJsonValue,
      category: input.category,
      price: new Prisma.Decimal(input.price),
      ...(input.b2bPrice !== undefined && { b2bPrice: new Prisma.Decimal(input.b2bPrice) }),
      ...(input.rawMaterialCost !== undefined && {
        rawMaterialCost: new Prisma.Decimal(input.rawMaterialCost),
      }),
      ...(input.laborHours !== undefined && { laborHours: new Prisma.Decimal(input.laborHours) }),
      ...(input.hourlyWage !== undefined && { hourlyWage: new Prisma.Decimal(input.hourlyWage) }),
      ...(input.retailMiddlemanEst !== undefined && {
        retailMiddlemanEst: new Prisma.Decimal(input.retailMiddlemanEst),
      }),
      authenticityGrade: input.authenticityGrade ?? null,
      lineageGI: input.lineageGI ?? null,
      giTagged: input.giTagged ?? false,
      cleanImageUrl: input.cleanImageUrl,
      rawWorkshopImageUrl: input.rawWorkshopImageUrl ?? null,
      originalAudioUrl: input.originalAudioUrl ?? null,
      materials: input.materials,
      tags: input.tags,
      stockQuantity: input.stockQuantity,
      isPublished: input.isPublished,
    },
    include: { artisan: { select: { name: true, giCluster: true } } },
  });

  return serializeProduct(product);
}

export interface ListProductsQuery {
  category?: CraftCategory;
  search?: string;
  artisanId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest";
  page: number;
  limit: number;
}

export interface PaginatedProducts {
  items: ProductSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductSummary {
  id: string;
  title: string;
  titleHi: string | null;
  description: Record<string, string>;
  category: CraftCategory;
  price: string;
  cleanImageUrl: string;
  materials: string[];
  tags: string[];
  artisanName: string;
  artisanGiCluster: string | null;
  authenticityGrade: string | null;
  lineageGI: string | null;
  giTagged: boolean;
  stockQuantity: number;
  createdAt: Date;
}

export interface ProductDetail extends ProductSummary {
  artisanId: string;
  rawWorkshopImageUrl: string | null;
  originalAudioUrl: string | null;
  rawMaterialCost: string | null;
  laborHours: string | null;
  hourlyWage: string | null;
  retailMiddlemanEst: string | null;
  b2bPrice: string | null;
  reviews: { rating: number; comment: string | null; userName: string; createdAt: Date }[];
  averageRating: number | null;
}

function serializeProduct(product: Product & { artisan: { name: string; giCluster: string | null } }): ProductSummary {
  return {
    id: product.id,
    title: product.title,
    titleHi: product.titleHi,
    description: product.description as Record<string, string>,
    category: product.category,
    price: product.price.toString(),
    cleanImageUrl: product.cleanImageUrl,
    materials: product.materials,
    tags: product.tags,
    artisanName: product.artisan.name,
    artisanGiCluster: product.artisan.giCluster,
    authenticityGrade: product.authenticityGrade,
    lineageGI: product.lineageGI,
    giTagged: product.giTagged,
    stockQuantity: product.stockQuantity,
    createdAt: product.createdAt,
  };
}

export async function listProducts(query: ListProductsQuery): Promise<PaginatedProducts> {
  const { category, search, artisanId, minPrice, maxPrice, sortBy, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(category && { category }),
    ...(artisanId && { artisanId }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { materials: { has: search } },
            { tags: { has: search } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortBy === "price_asc"
      ? { price: "asc" }
      : sortBy === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { artisan: { select: { name: true, giCluster: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products.map(serializeProduct),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(productId: string): Promise<ProductDetail> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      artisan: { select: { name: true, giCluster: true } },
      reviews: {
        select: { rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const reviews = product.reviews.map((r) => ({
    rating: r.rating,
    comment: r.comment,
    userName: r.user.name,
    createdAt: r.createdAt,
  }));

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return {
    ...serializeProduct(product),
    artisanId: product.artisanId,
    rawWorkshopImageUrl: product.rawWorkshopImageUrl,
    originalAudioUrl: product.originalAudioUrl,
    rawMaterialCost: product.rawMaterialCost?.toString() ?? null,
    laborHours: product.laborHours?.toString() ?? null,
    hourlyWage: product.hourlyWage?.toString() ?? null,
    retailMiddlemanEst: product.retailMiddlemanEst?.toString() ?? null,
    b2bPrice: product.b2bPrice?.toString() ?? null,
    reviews,
    averageRating,
  };
}
