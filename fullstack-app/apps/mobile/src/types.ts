export type Role = "BUYER" | "ARTISAN" | "PRODUCER" | "DELIVERY" | "ADMIN";

export type CraftCategory =
  | "POTTERY"
  | "TEXTILE"
  | "WOODWORK"
  | "METALWARE"
  | "PAINTING"
  | "LEATHERWORK"
  | "JEWELLERY"
  | "STONEWORK"
  | "CANE_BAMBOO"
  | "OTHER";

export type OrderStatus =
  | "CONFIRMED"
  | "IN_WORKSHOP"
  | "QUALITY_PASSED"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "DISPUTED";

export type EscrowStatus =
  | "INITIATED"
  | "AUTHORIZED"
  | "HELD_IN_ESCROW"
  | "SHIPPED_PENDING_RELEASE"
  | "DELIVERED_PENDING_CONFIRMATION"
  | "RELEASED_TO_SELLER"
  | "REFUNDED_TO_BUYER";

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = { success: true; data: T } | ApiErrorBody;

export interface PublicUser {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  role: Role;
  avatarUrl: string | null;
  giCluster: string | null;
  bankAccount: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type AuthResponseData = { user: PublicUser } & TokenPair;

export interface RegisterInput {
  phone: string;
  email?: string;
  password: string;
  name: string;
  role: Role;
  giCluster?: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface ProductSummary {
  id: string;
  title: string;
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
  createdAt: string;
}

export interface ProductReview {
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: string;
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
  reviews: ProductReview[];
  averageRating: number | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListProductsParams {
  category?: CraftCategory;
  search?: string;
  artisanId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  landmark?: string;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItem[];
  shippingAddress: ShippingAddress;
}

export interface DeliveryAgentBrief {
  id: string;
  name: string;
  phone: string;
}

export interface OrderItemProduct {
  id: string;
  title: string;
  cleanImageUrl: string;
  category: CraftCategory;
  artisanId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: OrderItemProduct;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  amount: string;
  status: EscrowStatus;
  paymentGatewayRef: string | null;
  heldAt: string | null;
  otpVerifiedAt: string | null;
  releasedAt: string | null;
  disputedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: { id: string; displayId: string; status: OrderStatus };
}

export interface Order {
  id: string;
  displayId: string;
  buyerId: string;
  deliveryAgentId: string | null;
  totalAmount: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  carrierName: string | null;
  trackingAwb: string | null;
  currentLocation: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  escrowTransaction: EscrowTransaction | null;
  deliveryAgent: DeliveryAgentBrief | null;
  secretOtp?: string;
}

export type LocationUpdate = {
  id: string;
  currentLocation: string;
  updatedAt: string;
};

export type HandoverVerification = {
  orderId: string;
  orderStatus: OrderStatus;
  escrowStatus: EscrowStatus;
  otpVerifiedAt: string;
  releasedAt: string;
};

export type DisputeResolution = {
  orderId: string;
  orderStatus: OrderStatus;
  escrowStatus: EscrowStatus;
  resolvedAt: string;
};

// ---- AI microservice contracts (Python snake_case, port 5000) ----

export interface EnhanceImageResult {
  status: "success";
  clean_image_url: string;
  raw_workshop_image_url: string;
  detected_features: string[];
}

export interface CatalogSpec {
  title: string;
  description: Record<string, string>;
  suggested_category: CraftCategory;
  materials: string[];
  tags: string[];
  authenticity_grade: string;
  lineage_gi: string | null;
  detected_features: string[];
}

export interface CatalogResult {
  status: "success";
  catalog: CatalogSpec;
  original_audio_url: string | null;
}

export interface MaterialCostLineInput {
  material: string;
  unit_cost: number;
  quantity_used: number;
}

export interface FairPriceRequest {
  raw_material_cost: number;
  labor_hours: number;
  hourly_wage: number;
  authenticity_grade?: string | null;
  materials?: MaterialCostLineInput[] | null;
}

export interface MaterialCostLine extends MaterialCostLineInput {
  total_cost: number;
}

export interface PriceLineItem {
  label: string;
  amount: number;
}

export interface FairPriceBand {
  min_price: number;
  recommended_price: number;
  max_price: number;
}

export interface FairPriceResult {
  status: "success";
  base_cost: number;
  complexity_multiplier: number;
  fair_artisan_price: number;
  retail_middleman_price: number;
  middleman_cut_saved: number;
  artisan_net_earnings: number;
  authenticity_grade: string;
  breakdown: PriceLineItem[];
  material_allocations: MaterialCostLine[] | null;
  fair_price_band: FairPriceBand;
  currency: "INR";
}