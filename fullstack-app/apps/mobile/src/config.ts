export const CORE_API_URL = process.env.EXPO_PUBLIC_CORE_API_URL ?? "http://localhost:4000/api/v1";
export const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? "http://localhost:5000/api";

export const SUPPORTED_LANGUAGES = [
  "en",
  "hi",
  "mr",
  "bn",
  "ta",
  "te",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
  "as",
  "ur",
  "sa",
  "brx",
  "sat",
] as const;

export const CRAFT_CATEGORIES = [
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
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  IN_WORKSHOP: "In Workshop",
  QUALITY_PASSED: "Quality Passed",
  READY_FOR_PICKUP: "Ready for Pickup",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export const ESCROW_STATUS_LABELS: Record<string, string> = {
  INITIATED: "Initiated",
  AUTHORIZED: "Authorized",
  HELD_IN_ESCROW: "Held in Escrow",
  SHIPPED_PENDING_RELEASE: "Pending Release on Shipment",
  DELIVERED_PENDING_CONFIRMATION: "Awaiting OTP Confirmation",
  RELEASED_TO_SELLER: "Released to Artisan",
  REFUNDED_TO_BUYER: "Refunded to Buyer",
};