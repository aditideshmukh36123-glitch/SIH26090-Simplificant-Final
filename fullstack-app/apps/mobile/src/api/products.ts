import type { ApiResponse, ListProductsParams, Paginated, ProductDetail, ProductSummary } from "../types";
import { coreClient } from "./client";

export async function apiListProducts(
  params: ListProductsParams = {}
): Promise<Paginated<ProductSummary>> {
  const res = await coreClient.get<ApiResponse<Paginated<ProductSummary>>>("/products", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.category ? { category: params.category } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.artisanId ? { artisanId: params.artisanId } : {}),
      ...(params.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
      ...(params.sortBy ? { sortBy: params.sortBy } : {}),
    },
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiGetProduct(productId: string): Promise<ProductDetail> {
  const res = await coreClient.get<ApiResponse<ProductDetail>>(`/products/${productId}`);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export interface CreateProductPayload {
  title: string;
  description: Record<string, string>;
  category: string;
  price: number;
  b2bPrice?: number;
  rawMaterialCost?: number;
  laborHours?: number;
  hourlyWage?: number;
  retailMiddlemanEst?: number;
  authenticityGrade?: string;
  lineageGI?: string;
  giTagged?: boolean;
  cleanImageUrl: string;
  rawWorkshopImageUrl?: string;
  originalAudioUrl?: string;
  materials: string[];
  tags: string[];
  stockQuantity: number;
}

export async function apiCreateProduct(input: CreateProductPayload): Promise<ProductSummary> {
  const res = await coreClient.post<ApiResponse<ProductSummary>>("/products", input);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}