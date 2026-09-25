export type LanguageCode = "en" | "hi" | "mr" | "bn" | "ta" | "te" | "gu" | "kn" | "ml" | "pa" | "or" | "es" | "fr" | "de" | "ja" | "ar"

export interface LanguageInfo {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
}

export type Role = "buyer" | "artisan" | "producer" | "delivery" | "admin" | "b2b_gov"

export type CraftCategory = "Pottery" | "Textile" | "Woodwork" | "Metalwork" | "Jewelry" | "Handicrafts" | "Folk & Tribal Art" | "Bamboo & Cane" | "Stone Craft" | "Glass & Paper" | "Craft Materials"

export interface Address {
  id?: string
  fullName: string
  phone: string
  streetAddress: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export interface ProductReview {
  id: string
  buyerName: string
  rating: number // 1 to 5
  date: string
  comment: string
  verifiedPurchase: boolean
}

export interface Product {
  id: number | string
  artisan_id?: number | string
  name: Record<LanguageCode, string>
  artisan: string
  location: Record<LanguageCode, string>
  price: number
  b2b_price?: number
  raw_material_cost?: number
  labor_hours?: number
  hourly_wage?: number
  rating: number
  reviews: number
  category: CraftCategory
  image: string
  raw_workshop_image?: string
  description: Record<LanguageCode, string>
  tags: string[]
  gi_tagged?: boolean
  scheme?: string
  materials?: string[]
  dimensions?: string
  batch_id?: string
  stockQuantity?: number
  workshopId?: string
  producerName?: string
  originState?: string
  highlights?: string[]
  reviewsList?: ProductReview[]
  isActive?: boolean
  isMaterial?: boolean
  materialType?: string
  materialUnit?: string
}

export interface CartItem
  extends Omit<Product, "name" | "description" | "location"> {
  name: string
  description: string
  location: string
  qty: number
}

export interface OrderClaim {
  id: number
  product_id?: number
  product_title: string
  image_url?: string
  artisan_name: string
  buyer_name: string
  buyer_phone: string
  buyer_type?: string
  shipping_address: string
  total_amount: number
  status: string
  created_at: string
}

export interface AIValuationResult {
  craftName: string
  category: CraftCategory
  estimatedFairPrice: number
  minPrice: number
  maxPrice: number
  retailMiddlemanPrice: number
  confidence: number // e.g. 97.4
  materialsDetected: Array<{ name: string; cost: number; percentage: number }>
  laborHours: number
  hourlyRate: number
  lineageGI: string
  region: string
  dimensions: string
  artisanWageEarnings: number
  middlemanCutSaved: number
  authenticityGrade: "A+ Master GI" | "Artisanal Premium" | "Traditional Handloom" | "Heritage Collector"
  featuresDetected: string[]
  aiProviderUsed?: string
  aiAnalysisNotes?: string
}

export interface PublishedProductMeta {
  product: Product
  qrCodeData: string
  certificateId: string
  timestamp: string
  shareLink: string
}

export interface User {
  id: string
  name: string
  mobile: string
  email?: string
  password?: string
  pin?: string
  role: Role
  avatar?: string
  preferredLanguage: LanguageCode
  status: "active" | "suspended" | "pending_verification"
  joinedDate: string
  address?: Address
}

export interface BuyerProfile extends User {
  role: "buyer"
  savedAddresses: Address[]
  wishlist: number[]
  totalOrdersCount: number
}

export interface SellerProfile {
  id: string
  name: string
  shopName: string
  websiteOrHandle: string
  clusterGI: string
  phone: string
  email: string
  upiId: string
  joinedDate: string
  rating: number
  totalSalesCount: number
  totalRevenue: number
  workshopAddress?: string
  associatedGuild?: string
  verifiedStatus?: "verified" | "pending" | "none"
}

export interface ProducerProfile {
  id: string
  workshopName: string
  headArtisanName: string
  clusterGI: string
  location: string
  phone: string
  email: string
  capacityPerMonth: number
  activeArtisansCount: number
  joinedDate: string
  upiId: string
  rating: number
  activeBatches: number
}

export interface DeliveryAgent {
  id: string
  name: string
  phone: string
  vehicleType: "Bike" | "Electric Scooter" | "Van" | "Cargo Auto"
  vehicleNumber: string
  serviceZone: string
  rating: number
  activeDeliveriesCount: number
  completedDeliveriesCount: number
  status: "available" | "on_delivery" | "offline"
}

export interface DeliveryMilestone {
  stage: "ordered" | "crafted" | "verified" | "shipped" | "delivered"
  title: string
  description: string
  timestamp: string
  completed: boolean
}

export interface TrackingMilestone extends DeliveryMilestone {}

export type OrderStatus = "Confirmed" | "In Workshop" | "Quality Passed" | "Ready for Pickup" | "Shipped" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled"

export interface PaymentDetails {
  method: "upi" | "card" | "netbanking" | "cod"
  upiProvider?: "phonepe" | "paytm" | "gpay" | "bharat_upi"
  cardLast4?: string
  status: "Pending" | "Processing" | "Successful" | "Failed" | "Refunded"
  transactionId: string
  paidAt?: string
  amount: number
}

export interface CustomerOrder {
  id: string // e.g. "OD-2026-8891"
  productId: number
  productTitle: string
  productImage: string
  category: CraftCategory
  pricePaid: number
  quantity: number
  totalAmount: number
  sellerShopName: string
  artisanName: string
  giCluster: string
  orderDate: string
  deliveryDateEstimated: string
  status: OrderStatus
  carrierName: string
  trackingAwb: string
  currentLocation: string
  buyerName: string
  buyerPhone: string
  shippingAddress: string
  milestones: TrackingMilestone[]
  // Multi-role extended properties
  buyerId?: string
  sellerId?: string
  producerId?: string
  workshopName?: string
  workshopLocation?: string
  deliveryAgentId?: string
  deliveryAgentName?: string
  deliveryAgentPhone?: string
  deliveryOtp?: string // 4 or 6-digit handover OTP
  otpAttempts?: number
  paymentMethod?: "upi" | "card" | "netbanking" | "cod"
  paymentStatus?: "Pending" | "Successful" | "Failed"
  paymentTransactionId?: string
  buyerRating?: number
  buyerReview?: string
  dispatchLocation?: string
}

export interface ChatMessage {
  id: string
  senderRole: "buyer" | "support" | "artisan" | "admin"
  senderName: string
  text: string
  timestamp: string
  orderId?: string
  /** Playable voice note recorded by the native mobile shell. */
  voiceUrl?: string
}

export interface SupportTicket {
  id: string
  buyerName: string
  buyerPhone: string
  orderId?: string
  subject: string
  status: "open" | "in_progress" | "resolved"
  createdAt: string
  messages: ChatMessage[]
}

export interface RoleNotification {
  id: string
  recipientRole: Role
  title: string
  message: string
  timestamp: string
  read: boolean
  orderId?: string
  actionUrl?: string
  type: "order" | "payment" | "delivery" | "support" | "system"
}

export interface InventoryItem {
  productId: number
  stockCount: number
  reservedCount: number
  reorderLevel: number
  batchNumber: string
  lastRestocked: string
}

export interface SocialShareContent {
  title: string
  caption: string
  priceText: string
  hashtags: string[]
  shareUrl: string
  imageUrl: string
  craftLocation: string
}
