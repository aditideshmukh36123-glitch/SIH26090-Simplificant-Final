import type {
  ApiResponse,
  CreateOrderInput,
  LocationUpdate,
  Order,
  OrderStatus,
} from "../types";
import { coreClient } from "./client";

export async function apiCreateOrder(input: CreateOrderInput): Promise<Order> {
  const res = await coreClient.post<ApiResponse<Order>>("/orders", input);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiListOrders(status?: OrderStatus): Promise<Order[]> {
  const res = await coreClient.get<ApiResponse<Order[]>>("/orders", {
    params: status ? { status } : {},
  });
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiGetOrder(orderId: string): Promise<Order> {
  const res = await coreClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  carrierName?: string;
  currentLocation?: string;
}

export async function apiUpdateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput
): Promise<Order> {
  const res = await coreClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, input);
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}

export async function apiUpdateOrderLocation(
  orderId: string,
  currentLocation: string
): Promise<LocationUpdate> {
  const res = await coreClient.patch<ApiResponse<LocationUpdate>>(
    `/orders/${orderId}/location`,
    { currentLocation }
  );
  if (!res.data.success) {
    throw new Error(res.data.error.message);
  }
  return res.data.data;
}