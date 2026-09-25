import React, { useState } from "react"
import {
  Product,
  CustomerOrder,
  User,
  Role,
  CraftCategory,
  LanguageCode,
} from "../types"
import { translate } from "../utils/translations"

export interface SiteSettings {
  maintenanceMode: boolean
  minWage: number
  zeroFeeDbt: boolean
}

interface AdminDashboardProps {
  products: Product[]
  orders: CustomerOrder[]
  users: Record<string, User>
  onToggleProductStatus: (productId: number) => void
  onUpdateOrderStatus: (
    orderId: string,
    nextStatus: CustomerOrder["status"],
  ) => void
  showToast: (msg: string) => void
  onUpdateProduct?: (product: Product) => void
  onDeleteProduct?: (productId: number) => void
  onAddProduct?: (product: Product) => void
  onUpdateOrderFull?: (order: CustomerOrder) => void
  onUpdateUser?: (user: User) => void
  onAddUser?: (user: User) => void
  announcementText?: string
  onUpdateAnnouncement?: (text: string) => void
  siteSettings?: SiteSettings
  onUpdateSiteSettings?: (settings: SiteSettings) => void
  selectedLanguage?: LanguageCode
}

type AdminTab = "overview" | "products" | "orders" | "users" | "settings" | "dbt_payments" | "analytics"

export default function AdminDashboard({
  products,
  orders,
  users,
  onToggleProductStatus,
  onUpdateOrderStatus,
  showToast,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onUpdateOrderFull,
  onUpdateUser,
  onAddUser,
  announcementText = "Certified 100% Handmade Indian Heritage Crafts • 0% Middleman Fee • Direct Benefit Transfer (DBT) to Artisans",
  onUpdateAnnouncement,
  siteSettings = { maintenanceMode: false, minWage: 140, zeroFeeDbt: true },
  onUpdateSiteSettings,
  selectedLanguage = "en",
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all")
  const [productSearch, setProductSearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [editStock, setEditStock] = useState<number>(0)
  const [editGiTagged, setEditGiTagged] = useState<boolean>(true)

  // Add Product Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProdName, setNewProdName] = useState("")
  const [newProdCategory, setNewProdCategory] =
    useState<CraftCategory>("Pottery")
  const [newProdPrice, setNewProdPrice] = useState(1200)
  const [newProdStock, setNewProdStock] = useState(20)
  const [newProdArtisan, setNewProdArtisan] = useState("Master Craftsman")
  const [newProdLocation, setNewProdLocation] = useState("Jaipur, Rajasthan")
  const [newProdImage, setNewProdImage] = useState(
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&h=700&fit=crop&auto=format",
  )
  const [newProdGiTagged, setNewProdGiTagged] = useState<boolean>(true)
  const [newProdMaterials, setNewProdMaterials] = useState<string>(
    "All-Natural Organic Materials",
  )
  const [newProdLaborHours, setNewProdLaborHours] = useState<number>(14)
  const [newProdDescription, setNewProdDescription] = useState<string>("")

  // Order OTP / Logistics Edit Modal State
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null)
  const [editOtp, setEditOtp] = useState("")
  const [editCarrier, setEditCarrier] = useState("")
  const [editAgentName, setEditAgentName] = useState("")

  // User Edit / Add Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserPin, setEditUserPin] = useState("")
  const [editUserStatus, setEditUserStatus] = useState<"active" | "suspended">(
    "active",
  )

  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserMobile, setNewUserMobile] = useState("")
  const [newUserRole, setNewUserRole] = useState<Role>("artisan")
  const [newUserPin, setNewUserPin] = useState("1234")

  // Announcement Banner Draft
  const [bannerDraft, setBannerDraft] = useState(announcementText)

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  // Platform Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length
  const pendingOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled",
  ).length
  const totalProductsCount = products.length
  const middlemanSavedTotal = Math.round(totalRevenue * 0.45)

  // Handlers for Product
  const openEditProduct = (p: Product) => {
    setEditingProduct(p)
    setEditPrice(p.price)
    setEditStock(p.stockQuantity || 10)
    setEditGiTagged(Boolean(p.gi_tagged))
  }

  const saveProductChanges = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    const updated: Product = {
      ...editingProduct,
      price: editPrice,
      stockQuantity: editStock,
      gi_tagged: editGiTagged,
    }
    if (onUpdateProduct) {
      onUpdateProduct(updated)
    }
    showToast(
      `Updated "${editingProduct.name.en || editingProduct.name.hi}" successfully!`,
    )
    setEditingProduct(null)
  }

  const handleDeleteProduct = (p: Product) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${p.name.en}" from the master catalog?`,
      )
    ) {
      if (onDeleteProduct) {
        onDeleteProduct(p.id)
      }
      showToast(`Removed product #${p.id} from catalog.`)
    }
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProdName.trim()) return

    const newProd: Product = {
      id: Date.now(),
      artisan_id: 99,
      name: {
        en: newProdName,
        hi: newProdName,
        mr: newProdName,
        bn: newProdName,
        ta: newProdName,
        te: newProdName,
        gu: newProdName,
        kn: newProdName,
        ml: newProdName,
        pa: newProdName,
        or: newProdName,
        es: newProdName,
        fr: newProdName,
        de: newProdName,
        ja: newProdName,
        ar: newProdName,
      },
      artisan: newProdArtisan,
      location: {
        en: newProdLocation,
        hi: newProdLocation,
        mr: newProdLocation,
        bn: newProdLocation,
        ta: newProdLocation,
        te: newProdLocation,
        gu: newProdLocation,
        kn: newProdLocation,
        ml: newProdLocation,
        pa: newProdLocation,
        or: newProdLocation,
        es: newProdLocation,
        fr: newProdLocation,
        de: newProdLocation,
        ja: newProdLocation,
        ar: newProdLocation,
      },
      price: newProdPrice,
      b2b_price: Math.round(newProdPrice * 0.75),
      raw_material_cost: Math.round(newProdPrice * 0.35),
      labor_hours: newProdLaborHours || 14,
      hourly_wage: 150,
      rating: 5.0,
      reviews: 1,
      category: newProdCategory,
      image:
        newProdImage ||
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&h=700&fit=crop&auto=format",
      description: {
        en:
          newProdDescription ||
          "Handcrafted with authentic traditional indigenous techniques. 100% natural and certified by MoSJE.",
        hi:
          newProdDescription ||
          "पारंपरिक शिल्प कौशल से हस्तनिर्मित। 100% प्राकृतिक और प्रमाणित।",
        mr:
          newProdDescription ||
          "पारंपारिक कौशल्याने हस्तनिर्मित. १००% नैसर्गिक आणि प्रमाणित.",
        bn: newProdDescription || "ঐতিহ্যবাহী দক্ষতায় হাতে তৈরি। ১০০% খাঁটি।",
        ta:
          newProdDescription ||
          "பாரம்பரிய முறையில் கையால் செய்யப்பட்டது. 100% இயற்கையானது.",
        te:
          newProdDescription || "సాంప్రదాయ నైపుణ్యంతో చేతితో రూపొందించబడింది. 100% సహజమైనది.",
        gu: newProdDescription || "પરંપરાગત કારીગરીથી હાથબનાવટ. ૧૦૦% કુદરતી.",
        kn:
          newProdDescription ||
          "ಸಾಂಪ್ರದಾಯಿಕ ಕೌಶಲ್ಯದಿಂದ ಕೈಯಲ್ಲೇ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ. ೧೦೦% ನೈಸರ್ಗಿಕ.",
        ml:
          newProdDescription || "പരമ്പരാഗതമായി കൈകൊണ്ട് നിർമ്മിച്ചത്. 100% പ്രകൃതിദത്തം.",
        pa: newProdDescription || "ਰਵਾਇਤੀ ਹੱਥੀਂ ਬਣਾਇਆ ਗਿਆ। 100% ਕੁਦਰਤੀ।",
        or: newProdDescription || "ପାରମ୍ପରିକ ଦକ୍ଷତାରେ ହାତତିଆରି। ୧୦୦% ପ୍ରାକୃତିକ।",
        es:
          newProdDescription ||
          "Hecho a mano con técnicas tradicionales indígenas. 100% natural.",
        fr:
          newProdDescription ||
          "Fabriqué à la main selon les techniques traditionnelles.",
        de:
          newProdDescription ||
          "Handgefertigt mit traditionellen indischen Techniken.",
        ja:
          newProdDescription ||
          "伝統の技法で手作りされた100%本物の手仕事工芸品。",
        ar:
          newProdDescription ||
          "مصنوع يدوياً بالتقنيات التقليدية الأصيلة. 100٪ طبيعي ومعتمد.",
      },
      tags: [
        "#HandmadeHeritage",
        `#${newProdCategory.replace(/\s+/g, "")}`,
        "#GIHeritage",
      ],
      gi_tagged: newProdGiTagged,
      scheme: "MoSJE National Artisan Cluster",
      materials: newProdMaterials
        ? newProdMaterials.split(",").map((m) => m.trim())
        : ["All-Natural Organic Materials"],
      dimensions: "Standard Artisan Craft Dimensions",
      stockQuantity: newProdStock,
      workshopId: "PROD-201",
      producerName: "National Craft Cooperative",
      originState: "India",
      highlights: [
        "100% authentic handmade item",
        "Direct DBT payment to artisan",
        "GI lineage certified",
      ],
      isActive: true,
    }

    if (onAddProduct) {
      onAddProduct(newProd)
    }
    showToast(`Added new pure handmade craft "${newProdName}"!`)
    setIsAddingProduct(false)
    setNewProdName("")
    setNewProdDescription("")
  }

  // Handlers for Orders
  const openEditOrder = (o: CustomerOrder) => {
    setEditingOrder(o)
    setEditOtp(o.deliveryOtp || "4921")
    setEditCarrier(o.carrierName || "India Post GI Express")
    setEditAgentName(o.deliveryAgentName || "Vikram Singh")
  }

  const saveOrderLogistics = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return
    const updated: CustomerOrder = {
      ...editingOrder,
      deliveryOtp: editOtp,
      carrierName: editCarrier,
      deliveryAgentName: editAgentName,
    }
    if (onUpdateOrderFull) {
      onUpdateOrderFull(updated)
    }
    showToast(`Updated logistics & OTP for Order #${editingOrder.id}`)
    setEditingOrder(null)
  }

  // Handlers for Users
  const toggleUserSuspension = (user: User) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended"
    const updated: User = { ...user, status: nextStatus }
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    showToast(`${user.name} is now ${nextStatus.toUpperCase()}`)
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserName(user.name)
    setEditUserPin(user.pin || "1234")
    setEditUserStatus(user.status === "suspended" ? "suspended" : "active")
  }

  const saveUserChanges = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    const updated: User = {
      ...editingUser,
      name: editUserName,
      pin: editUserPin,
      status: editUserStatus,
    }
    if (onUpdateUser) {
      onUpdateUser(updated)
    }
    showToast(`Updated user account: ${editUserName}`)
    setEditingUser(null)
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserMobile.trim()) return

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: newUserName,
      email:
        newUserEmail ||
        `${newUserName.toLowerCase().replace(/\s+/g, ".")}@simplificant.in`,
      mobile: newUserMobile,
      role: newUserRole,
      pin: newUserPin,
      password: `${newUserRole}123`,
      preferredLanguage: selectedLanguage,
      status: "active",
      joinedDate: "Today",
    }

    if (onAddUser) {
      onAddUser(newUser)
    }
    showToast(
      `Created new particular ${newUserRole.toUpperCase()} account for ${newUserName}`,
    )
    setIsAddingUser(false)
    setNewUserName("")
    setNewUserEmail("")
    setNewUserMobile("")
  }

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const term = productSearch.toLowerCase().trim()
    if (!term) return true
    const nameEn = p.name.en.toLowerCase()
    const nameHi = (p.name.hi || "").toLowerCase()
    const artisan = p.artisan.toLowerCase()
    const category = p.category.toLowerCase()
    return (
      nameEn.includes(term) ||
      nameHi.includes(term) ||
      artisan.includes(term) ||
      category.includes(term)
    )
  })

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase().trim()
    if (!term) return true
    return (
      o.id.toLowerCase().includes(term) ||
      o.productTitle.toLowerCase().includes(term) ||
      o.buyerName.toLowerCase().includes(term) ||
      o.artisanName.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
    )
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* ─── ADMIN BANNER WITH LIVE MASTER STATUS ─── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E1714] via-[#2A1E18] to-[#1E1714] text-[#F7F2E9] p-6 sm:p-8 border border-[#C9922E]/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C9922E] text-[#241C15] px-2.5 py-0.5 rounded-full">
                🛡️ Super Admin Master Console
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Full Website Command Center
              </span>
              {siteSettings.maintenanceMode && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2.5 py-0.5 rounded-full animate-pulse">
                  ⚠️ Maintenance Mode Active
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#F7F2E9] mt-2">
              National Artisan Marketplace Operations
            </h1>
            <p className="text-xs text-[#E4DAC8]/80 font-light max-w-2xl mt-1">
              End-to-end command over product catalog, order statuses, delivery
              OTPs, user credentials, and platform announcement broadcast.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
              <span className="text-[10px] text-[#C9922E] font-bold uppercase tracking-wider block">
                Total GMV Disbursed
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#F7F2E9]">
                {fmt(totalRevenue)}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
                ✓ 100% Direct DBT Settled
              </span>
            </div>
          </div>
        </div>

        {/* Live Top Announcement Bar Quick Preview */}
        <div className="bg-black/30 rounded-xl p-3 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-[#E6C687] shrink-0">
              📢 Live Announcement:
            </span>
            <span className="text-stone-300 italic truncate">
              "{announcementText}"
            </span>
          </div>
          <button
            onClick={() => setActiveTab("settings")}
            className="text-[11px] font-bold text-[#E6C687] hover:underline cursor-pointer shrink-0"
          >
            Edit Banner Text ➔
          </button>
        </div>
      </div>

      {/* ─── PLATFORM KPI CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Total Orders
          </span>
          <p className="text-2xl font-bold font-serif text-[#241C15] mt-1">
            {totalOrders}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            {deliveredOrders} Delivered • {pendingOrders} Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Middleman Eliminated
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-800 mt-1">
            {fmt(middlemanSavedTotal)}
          </p>
          <span className="text-[11px] text-emerald-800 font-semibold">
            100% to Artisans
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Pure Craft Listings
          </span>
          <p className="text-2xl font-bold font-serif text-[#C9922E] mt-1">
            {totalProductsCount}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            Pottery, Textiles, Woodwork
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Particular Accounts
          </span>
          <p className="text-2xl font-bold font-serif text-[#35415E] mt-1">
            {Object.keys(users).length}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            All 6 Roles Unified
          </span>
        </div>
      </div>

      {/* ─── ADMIN NAVIGATION TABS ─── */}
      <div className="flex bg-[#EFE8D8] p-1.5 rounded-2xl overflow-x-auto scrollbar-none text-xs font-semibold gap-1">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "products", label: "🏺 Product Catalog & Control" },
          { id: "orders", label: "📦 Orders & Logistics Override" },
          { id: "users", label: "👥 User Accounts & Access" },
          { id: "settings", label: "⚙️ Master Website Settings" },
          { id: "dbt_payments", label: "💳 DBT Settlements Audit" },
          { id: "analytics", label: "📈 Growth Analytics" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? "bg-white text-[#241C15] shadow-xs font-bold"
                : "text-[#6B6255] hover:text-[#241C15]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: OVERVIEW & KPIS                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setIsAddingProduct(true)}
              className="p-4 rounded-2xl bg-white border border-[#E4DAC8] hover:border-[#8B3214] text-left transition-all hover:shadow-md cursor-pointer flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl font-bold shrink-0">
                +
              </span>
              <div>
                <strong className="block text-sm text-[#241C15]">
                  Add Handmade Craft
                </strong>
                <span className="text-xs text-[#6B6255]">
                  List new pottery, weave or carving
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsAddingUser(true)}
              className="p-4 rounded-2xl bg-white border border-[#E4DAC8] hover:border-[#8B3214] text-left transition-all hover:shadow-md cursor-pointer flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center text-xl font-bold shrink-0">
                👤
              </span>
              <div>
                <strong className="block text-sm text-[#241C15]">
                  Create User Account
                </strong>
                <span className="text-xs text-[#6B6255]">
                  Add particular role identity
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className="p-4 rounded-2xl bg-white border border-[#E4DAC8] hover:border-[#8B3214] text-left transition-all hover:shadow-md cursor-pointer flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
                📢
              </span>
              <div>
                <strong className="block text-sm text-[#241C15]">
                  Site Broadcast & Banner
                </strong>
                <span className="text-xs text-[#6B6255]">
                  Update top announcement live
                </span>
              </div>
            </button>
          </div>

          {/* Recent Orders Stream */}
          <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DAC8] pb-3">
              <h3 className="text-sm font-bold font-serif text-[#241C15]">
                Recent Platform Orders Stream
              </h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs text-[#B7592F] font-bold hover:underline cursor-pointer"
              >
                Supervise All Orders →
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#241C15]">#{o.id}</strong>
                      <span className="text-[#8C7E6D]">({o.orderDate})</span>
                      <span className="font-mono text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">
                        OTP: {o.deliveryOtp || "4921"}
                      </span>
                    </div>
                    <p className="font-semibold text-[#241C15] mt-0.5">
                      {o.productTitle}
                    </p>
                    <p className="text-[11px] text-[#6B6255]">
                      {o.artisanName} ➔ {o.buyerName} (
                      {o.shippingAddress.split(",").slice(-2).join(",")})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold font-serif text-[#241C15]">
                      {fmt(o.totalAmount)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        o.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#EFE8D8] text-[#241C15]"
                      }`}
                    >
                      {o.status}
                    </span>
                    <button
                      onClick={() => openEditOrder(o)}
                      className="px-2 py-1 rounded-lg bg-white border border-[#E4DAC8] hover:border-[#8B3214] text-[10px] font-bold"
                    >
                      Override
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographical Cluster Coverage */}
          <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold font-serif text-[#241C15]">
              Active Pure Handmade GI Clusters (Ministry of Social Justice &
              Empowerment)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  name: "Sanganer Blue Pottery",
                  state: "Rajasthan",
                  discipline: "🏺 Pottery & Clay",
                  status: "Active",
                },
                {
                  name: "Kotwa Banarasi Silk",
                  state: "Uttar Pradesh",
                  discipline: "🧵 Textiles & Weaves",
                  status: "Active",
                },
                {
                  name: "Kashmir Walnut Wood",
                  state: "Jammu & Kashmir",
                  discipline: "🪵 Wood Carving",
                  status: "Active",
                },
                {
                  name: "Channapatna Lacquer",
                  state: "Karnataka",
                  discipline: "🪵 Wood Carving",
                  status: "Active",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]"
                >
                  <strong className="text-[#241C15] block">{c.name}</strong>
                  <span className="text-[#8C7E6D] text-[11px]">{c.state}</span>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E4DAC8]/60 text-[10.5px]">
                    <span className="text-[#6B6255] font-semibold">
                      {c.discipline}
                    </span>
                    <span className="text-emerald-800 font-bold">
                      ● {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: PRODUCT CATALOG & CONTROL                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 animate-in fade-in text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DAC8] pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#241C15]">
                Master Craft Catalog Moderation ({products.length} Products)
              </h3>
              <p className="text-[11px] text-[#6B6255]">
                Strictly authentic handmade Pottery, Clay, Textiles, and Wood
                Carvings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter craft by name, artisan..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs outline-none focus:border-[#8B3214]"
              />
              <button
                onClick={() => setIsAddingProduct(true)}
                className="px-3 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold text-xs hover:bg-[#6D270F] transition-all flex items-center gap-1 shrink-0"
              >
                <span>+ Add Handmade Craft</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] flex gap-3 items-center"
              >
                <img
                  src={p.image}
                  alt={p.name.en}
                  className="w-20 h-20 rounded-xl object-cover border border-[#E4DAC8] shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#B7592F] uppercase bg-amber-100/70 px-1.5 py-0.2 rounded">
                      {p.category === "Pottery"
                        ? "🏺 Pottery"
                        : p.category === "Textile"
                          ? "🧵 Textile"
                          : "🪵 Woodwork"}
                    </span>
                    {p.gi_tagged && (
                      <span className="text-[9.5px] bg-[#C9922E] text-[#241C15] font-bold px-1.5 rounded">
                        GI Tagged
                      </span>
                    )}
                    <span
                      className={`text-[9.5px] font-bold px-1.5 rounded ${
                        p.isActive !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {p.isActive !== false ? "Active" : "Paused"}
                    </span>
                  </div>

                  <h4 className="font-bold font-serif text-[#241C15] truncate text-sm">
                    {p.name.en}
                  </h4>
                  <p className="text-[11px] text-[#6B6255] truncate">
                    {p.artisan} • {p.location.en}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="font-bold text-[#241C15]">
                      {fmt(p.price)}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-[#6B6255]">
                      Stock: <strong>{p.stockQuantity ?? 12}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditProduct(p)}
                    className="bg-white border border-[#E4DAC8] hover:border-[#C9922E] text-[#241C15] px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      onToggleProductStatus(p.id)
                      showToast(`Toggled listing status for ${p.name.en}`)
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer border ${
                      p.isActive !== false
                        ? "bg-stone-100 text-stone-700 border-stone-300"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {p.isActive !== false ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: ORDERS & LOGISTICS SUPERVISION                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 animate-in fade-in text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DAC8] pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#241C15]">
                Global Order Supervision & Logistics Override ({orders.length}{" "}
                Orders)
              </h3>
              <p className="text-[11px] text-[#6B6255]">
                Super Admin can override any order stage, inspect/change
                Handover OTP, and reassign delivery carrier.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search by order ID, buyer, artisan..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs outline-none focus:border-[#8B3214]"
            />
          </div>

          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DAC8] pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#241C15]">
                        Order #{o.id}
                      </span>
                      <span className="text-[#8C7E6D] text-[11px]">
                        ({o.orderDate})
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#8B3214]/10 text-[#8B3214]">
                        OTP: {o.deliveryOtp || "4921"}
                      </span>
                    </div>
                    <p className="font-serif text-[#241C15] font-semibold mt-0.5">
                      {o.productTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-serif text-sm text-[#241C15]">
                      {fmt(o.totalAmount)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        o.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#C9922E]/20 text-[#B7592F]"
                      }`}
                    >
                      {o.status}
                    </span>
                    <button
                      onClick={() => openEditOrder(o)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#8B3214] text-[#8B3214] font-bold text-[11px] hover:bg-[#8B3214] hover:text-white transition-colors"
                    >
                      ⚙️ Logistics & OTP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#8C7E6D] block">
                      Artisan & Origin:
                    </span>
                    <strong>{o.artisanName}</strong> ({o.giCluster})
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] block">
                      Buyer & Destination:
                    </span>
                    <strong>{o.buyerName}</strong> ({o.shippingAddress})
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] block">
                      Carrier & Agent:
                    </span>
                    <strong>{o.carrierName}</strong> (Agent:{" "}
                    {o.deliveryAgentName || "Vikram Singh"})
                  </div>
                </div>

                {/* Super Admin Direct Status Override */}
                <div className="pt-2 border-t border-[#E4DAC8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-stone-700">
                    ⚡ Override Status:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      "In Workshop",
                      "Quality Passed",
                      "Ready for Pickup",
                      "Shipped",
                      "Out for Delivery",
                      "Delivered",
                      "Cancelled",
                    ].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateOrderStatus(o.id, st as any)
                          showToast(
                            `Super Admin updated #${o.id} status to: ${st}`,
                          )
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          o.status === st
                            ? "bg-[#241C15] text-white shadow-xs"
                            : "bg-white text-[#6B6255] border border-[#E4DAC8] hover:border-stone-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 4: USER DIRECTORY & ACCESS CONTROL                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 animate-in fade-in text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DAC8] pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#241C15]">
                Particular User Accounts Directory ({Object.keys(users).length}{" "}
                Registered Accounts)
              </h3>
              <p className="text-[11px] text-[#6B6255]">
                Manage role-based logins, view credentials/PINs, suspend or
                activate accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingUser(true)}
                className="px-3 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold text-xs hover:bg-[#6D270F] transition-all flex items-center gap-1"
              >
                <span>+ Add Particular User</span>
              </button>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "admin",
              "artisan",
              "producer",
              "delivery",
              "buyer",
              "b2b_gov",
            ].map((r) => (
              <button
                key={r}
                onClick={() => setUserRoleFilter(r)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  userRoleFilter === r
                    ? "bg-[#241C15] text-white"
                    : "bg-[#FAF7F2] text-[#6B6255] border border-[#E4DAC8] hover:border-stone-400"
                }`}
              >
                {r === "b2b_gov" ? "B2B / GeM" : r.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E4DAC8] text-[#8C7E6D] text-[11px]">
                  <th className="pb-2">User Identity</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Email / Login ID</th>
                  <th className="pb-2">Mobile</th>
                  <th className="pb-2">Security PIN</th>
                  <th className="pb-2">Account Status</th>
                  <th className="pb-2 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DAC8]/60">
                {Object.values(users)
                  .filter(
                    (u) =>
                      userRoleFilter === "all" || u.role === userRoleFilter,
                  )
                  .map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#FAF7F2] transition-colors"
                    >
                      <td className="py-3 font-bold text-[#241C15]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {u.role === "admin"
                              ? "🛡️"
                              : u.role === "artisan"
                                ? "🏺"
                                : u.role === "producer"
                                  ? "🏭"
                                  : u.role === "delivery"
                                    ? "🚚"
                                    : u.role === "buyer"
                                      ? "🛍️"
                                      : "🏛️"}
                          </span>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-[#EFE8D8] text-[#241C15] px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">
                          {u.role === "b2b_gov" ? "B2B / GeM" : u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#6B6255] text-[11px]">
                        {u.email || "—"}
                      </td>
                      <td className="py-3 font-mono text-[#6B6255]">
                        {u.mobile}
                      </td>
                      <td className="py-3 font-mono font-bold text-stone-800">
                        {u.pin || "—"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {u.status === "suspended"
                            ? "⛔ Suspended"
                            : "✓ Active"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditUser(u)}
                            className="px-2 py-1 rounded bg-white border border-[#E4DAC8] hover:border-[#8B3214] text-[11px] font-bold"
                          >
                            Edit
                          </button>
                          {u.role !== "admin" && (
                            <button
                              onClick={() => toggleUserSuspension(u)}
                              className={`px-2 py-1 rounded text-[11px] font-bold ${
                                u.status === "suspended"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                              }`}
                            >
                              {u.status === "suspended"
                                ? "Unsuspend"
                                : "Suspend"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 5: MASTER SITE SETTINGS & LIVE BROADCAST                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-[#E4DAC8] p-6 shadow-xs space-y-6 animate-in fade-in text-xs">
          <div className="border-b border-[#E4DAC8] pb-4">
            <h3 className="text-base font-bold font-serif text-[#241C15]">
              Master Site Parameters & Live Broadcast Center
            </h3>
            <p className="text-[#6B6255] text-xs mt-0.5">
              Super Admin controls affecting live user display, policy rules,
              and system behavior.
            </p>
          </div>

          {/* 1. Live MoSJE Announcement Banner Broadcast */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm font-bold text-[#241C15] block">
                  📢 Top Platform Announcement Banner (Live Broadcast)
                </strong>
                <span className="text-[11px] text-[#6B6255]">
                  Updates the marquee ribbon banner shown at the very top of the
                  website for all visitors.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                LIVE BROADCAST
              </span>
            </div>

            <textarea
              rows={2}
              value={bannerDraft}
              onChange={(e) => setBannerDraft(e.target.value)}
              className="w-full rounded-xl border border-[#E4DAC8] bg-white p-3 text-xs text-[#241C15] font-medium outline-none focus:border-[#8B3214]"
              placeholder="Enter announcement text to broadcast to all visitors..."
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-stone-500">
                Current text length: {bannerDraft.length} characters
              </span>
              <button
                onClick={() => {
                  if (onUpdateAnnouncement) {
                    onUpdateAnnouncement(bannerDraft)
                  }
                  showToast(
                    "Live announcement banner updated across entire website!",
                  )
                }}
                className="px-4 py-2 rounded-xl bg-[#8B3214] text-white font-bold text-xs hover:bg-[#6D270F] transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>🚀 Broadcast Banner to Website</span>
              </button>
            </div>
          </div>

          {/* 2. Platform Policies & Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maintenance Mode */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-[#241C15]">
                  ⚠️ Site Maintenance Mode
                </strong>
                <input
                  type="checkbox"
                  checked={siteSettings.maintenanceMode}
                  onChange={(e) => {
                    const next = {
                      ...siteSettings,
                      maintenanceMode: e.target.checked,
                    }
                    if (onUpdateSiteSettings) onUpdateSiteSettings(next)
                    showToast(
                      e.target.checked
                        ? "Maintenance mode activated"
                        : "Site returned to normal mode",
                    )
                  }}
                  className="h-5 w-5 accent-[#8B3214] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#6B6255]">
                When enabled, displays an official maintenance advisory ribbon
                while allowing admins full testing capabilities.
              </p>
            </div>

            {/* Direct DBT Zero-Commission Rule */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-[#241C15]">
                  💸 0% Commission Policy Lock
                </strong>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  GOV LOCKED
                </span>
              </div>
              <p className="text-[11px] text-[#6B6255]">
                MoSJE mandate: Platform takes 0% cut from artisans. 100% of
                purchase price reaches artisan bank accounts via Direct Benefit
                Transfer.
              </p>
            </div>

            {/* Minimum Fair Hourly Wage Rate */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm text-[#241C15]">
                    ⚖️ Minimum Fair Wage Benchmark: ₹{siteSettings.minWage} /
                    hour
                  </strong>
                  <span className="block text-[11px] text-[#6B6255]">
                    Enforced by the Fair Price AI valuation engine to protect
                    artisan living standards.
                  </span>
                </div>
                <span className="font-bold text-sm text-[#8B3214]">
                  ₹{siteSettings.minWage}/hr
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="250"
                step="5"
                value={siteSettings.minWage}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  const next = { ...siteSettings, minWage: val }
                  if (onUpdateSiteSettings) onUpdateSiteSettings(next)
                }}
                className="w-full accent-[#8B3214] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C7E6D]">
                <span>₹100/hr (Base rural)</span>
                <span>₹140/hr (Current National MoSJE standard)</span>
                <span>₹250/hr (Master artisan tier)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 6: DBT SETTLEMENTS                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "dbt_payments" && (
        <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-[#E4DAC8] pb-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#241C15]">
                Direct Benefit Transfer (DBT) Payout Audit
              </h3>
              <p className="text-[11px] text-[#6B6255]">
                Full audit trail showing direct payout settlement to master
                artisans.
              </p>
            </div>
            <span className="text-emerald-800 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ 100% Zero Middleman Leakage Verified
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#241C15]">Order #{o.id}</strong>
                    <span className="text-xs text-[#8C7E6D] font-mono">
                      {o.paymentTransactionId || "DBT-UPI-SETTLED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6255]">
                    Artisan Payee:{" "}
                    <strong className="text-[#241C15]">{o.artisanName}</strong>{" "}
                    (Bank Account Linked via Aadhaar / UPI)
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Order Title: {o.productTitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-serif text-[#241C15]">
                    {fmt(o.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold block">
                    ✓ Direct DBT Credited
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 7: GROWTH & IMPACT ANALYTICS                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4 animate-in fade-in text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E4DAC8] shadow-xs space-y-3">
              <h4 className="font-bold font-serif text-[#241C15] text-sm">
                Craft Discipline Share
              </h4>
              <div className="space-y-2">
                {[
                  { name: "🏺 Pottery & Clay", pct: 38, color: "bg-[#B7592F]" },
                  {
                    name: "🧵 Textiles & Handloom Weaves",
                    pct: 37,
                    color: "bg-[#35415E]",
                  },
                  {
                    name: "🪵 Wood Carving & Lacquer",
                    pct: 25,
                    color: "bg-[#7A4A28]",
                  },
                ].map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{c.name}</span>
                      <strong className="text-[#241C15]">{c.pct}%</strong>
                    </div>
                    <div className="w-full bg-[#EFE8D8] h-2 rounded-full overflow-hidden">
                      <div
                        className={`${c.color} h-full rounded-full`}
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E4DAC8] shadow-xs space-y-3">
              <h4 className="font-bold font-serif text-[#241C15] text-sm">
                Artisan Income Uplift
              </h4>
              <p className="text-[11px] text-[#6B6255] leading-relaxed">
                By bypassing traditional multi-tier middleman supply chains,
                artisans on Simplificant receive an average of{" "}
                <strong>2.6x higher direct earnings</strong> per craft hour.
              </p>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-center">
                +162% Higher Artisan Net Take-Home
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E4DAC8] shadow-xs space-y-3">
              <h4 className="font-bold font-serif text-[#241C15] text-sm">
                Logistics Performance
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span>Average Handover Time:</span>
                  <strong>1.8 Days</strong>
                </div>
                <div className="flex justify-between">
                  <span>Doorstep OTP Verification:</span>
                  <strong className="text-emerald-800">100% Rate</strong>
                </div>
                <div className="flex justify-between">
                  <span>Customer Satisfaction:</span>
                  <strong>4.94 / 5.0 ★</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT PRODUCT                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DAC8] p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-[#E4DAC8] pb-3">
              <h3 className="font-bold font-serif text-sm text-[#241C15]">
                Edit Craft Listing #{editingProduct.id}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-800 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveProductChanges} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  disabled
                  value={editingProduct.name.en}
                  className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] p-2 text-[#241C15] opacity-80"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="giTagged"
                  checked={editGiTagged}
                  onChange={(e) => setEditGiTagged(e.target.checked)}
                  className="h-4 w-4 accent-[#8B3214]"
                />
                <label
                  htmlFor="giTagged"
                  className="font-bold text-[#241C15] cursor-pointer"
                >
                  GI Certified Authenticity Badge
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4DAC8]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] text-[#6B6255] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold hover:bg-[#6D270F]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD NEW HANDMADE CRAFT                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E4DAC8] p-6 shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E4DAC8] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C9922E] text-[#241C15] px-2 py-0.5 rounded-full">
                    Super Admin Console
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Direct Marketplace Listing
                  </span>
                </div>
                <h3 className="font-bold font-serif text-lg text-[#241C15] mt-1">
                  Add Authentic Pure Handmade Craft
                </h3>
              </div>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Preset Buttons for Super Admin */}
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E4DAC8] space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D] block">
                ⚡ 1-Click Heritage Craft Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: "Kashmir Hand-Spun Pashmina Shawl",
                    category: "Textile" as CraftCategory,
                    price: 14500,
                    artisan: "Ghulam Hassan Wani",
                    location: "Srinagar, Jammu & Kashmir",
                    image:
                      "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=700&h=700&fit=crop&auto=format",
                    materials: "100% Changthangi Goat Pashm, Natural Dyes",
                    labor: 48,
                  },
                  {
                    name: "Bastar Dokra Bell Metal Sculpture",
                    category: "Metalwork" as CraftCategory,
                    price: 1850,
                    artisan: "Budhram Ghadwa",
                    location: "Kondagaon, Bastar, Chhattisgarh",
                    image:
                      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=700&h=700&fit=crop&auto=format",
                    materials: "Pure Brass & Copper Alloy, Beeswax Cords",
                    labor: 22,
                  },
                  {
                    name: "Thanjavur 22K Gold Foil Painting",
                    category: "Handicrafts" as CraftCategory,
                    price: 5200,
                    artisan: "S. Rajagopalan Achary",
                    location: "Thanjavur, Tamil Nadu",
                    image:
                      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=700&h=700&fit=crop&auto=format",
                    materials: "22K Gold Foil, Teakwood Frame, Gesso",
                    labor: 36,
                  },
                  {
                    name: "Bidriware Silver Inlay Decanter",
                    category: "Metalwork" as CraftCategory,
                    price: 3400,
                    artisan: "Shah Rasheed Ahmed Quadri",
                    location: "Bidar, Karnataka",
                    image:
                      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&h=700&fit=crop&auto=format",
                    materials: "Zinc-Copper Alloy, 99.9% Silver Wire",
                    labor: 28,
                  },
                  {
                    name: "Saharanpur Sheesham Carved Mirror",
                    category: "Woodwork" as CraftCategory,
                    price: 2650,
                    artisan: "Mohammad Irfan Qureshi",
                    location: "Saharanpur, Uttar Pradesh",
                    image:
                      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&h=700&fit=crop&auto=format",
                    materials: "Seasoned Sheesham Wood, High-definition Mirror",
                    labor: 26,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewProdName(preset.name)
                      setNewProdCategory(preset.category)
                      setNewProdPrice(preset.price)
                      setNewProdArtisan(preset.artisan)
                      setNewProdLocation(preset.location)
                      setNewProdImage(preset.image)
                      setNewProdMaterials(preset.materials)
                      setNewProdLaborHours(preset.labor)
                    }}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-[#E4DAC8] text-[10.5px] font-semibold text-[#241C15] transition-colors cursor-pointer"
                  >
                    + {preset.name.split(" ")[0]} {preset.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleCreateProduct}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Craft Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kashmir Hand-Spun Pure Pashmina Shawl"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2.5 text-[#241C15] outline-none focus:border-[#8B3214] font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Craft Discipline *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) =>
                      setNewProdCategory(e.target.value as CraftCategory)
                    }
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214] bg-white"
                  >
                    <option value="Pottery">🏺 Pottery & Clay</option>
                    <option value="Textile">
                      🧵 Handloom Textiles & Weaves
                    </option>
                    <option value="Woodwork">🪵 Authentic Wood Carving</option>
                    <option value="Metalwork">⚒️ Metalwork & Bell Metal</option>
                    <option value="Jewelry">✨ Traditional Jewelry</option>
                    <option value="Handicrafts">
                      🪆 Indigenous Handicrafts & Leather
                    </option>
                    <option value="Folk & Tribal Art">
                      🎨 Folk & Tribal Art
                    </option>
                    <option value="Bamboo & Cane">
                      🎋 Bamboo & Cane Craft
                    </option>
                    <option value="Stone Craft">🏛️ Stone Craft & Inlay</option>
                    <option value="Glass & Paper">
                      📜 Glass & Papier-Mâché
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Buyer Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Master Artisan Name *
                  </label>
                  <input
                    type="text"
                    value={newProdArtisan}
                    onChange={(e) => setNewProdArtisan(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Origin Cluster & State *
                  </label>
                  <input
                    type="text"
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Labor Hours
                  </label>
                  <input
                    type="number"
                    value={newProdLaborHours}
                    onChange={(e) =>
                      setNewProdLaborHours(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdGiTagged}
                      onChange={(e) => setNewProdGiTagged(e.target.checked)}
                      className="rounded text-[#8B3214] focus:ring-[#8B3214]"
                    />
                    <span className="font-bold text-[#241C15]">GI Tagged</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Raw Materials (comma-separated)
                </label>
                <input
                  type="text"
                  value={newProdMaterials}
                  onChange={(e) => setNewProdMaterials(e.target.value)}
                  placeholder="e.g., Pure Mulberry Silk, Natural Dyes, Gold Zari"
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                />
              </div>

              {/* Proper Image Section: Live Preview, Upload from Computer & URL */}
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DAC8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[#8C7E6D] font-bold">
                    Authentic Craft Photo (Proper HD Image) *
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                    ✓ Live Preview
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#E4DAC8] bg-white shrink-0 shadow-xs relative">
                    <img
                      src={newProdImage}
                      alt="Craft Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=700&h=700&fit=crop&auto=format"
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214] font-mono text-[11px]"
                      required
                    />

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#8B3214] bg-[#8B3214]/10 hover:bg-[#8B3214]/20 text-[#8B3214] font-bold text-[11px] transition-colors">
                        <span>📁</span>
                        <span>Upload File from PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setNewProdImage(ev.target.result as string)
                                  showToast("✓ Craft photo loaded from file!")
                                }
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-stone-500">
                        Supports PNG, JPG, WebP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Heritage Description & Technique
                </label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Describe the artisan lineage, traditional tools, and cultural significance..."
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4DAC8]">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4DAC8] text-[#6B6255] font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B3214] text-white font-bold hover:bg-[#6D270F] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Publish to Website Catalog</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT ORDER LOGISTICS & OTP                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DAC8] p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-[#E4DAC8] pb-3">
              <h3 className="font-bold font-serif text-sm text-[#241C15]">
                Logistics & OTP Override #{editingOrder.id}
              </h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-stone-400 hover:text-stone-800 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveOrderLogistics} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Handover Delivery OTP
                </label>
                <input
                  type="text"
                  value={editOtp}
                  onChange={(e) => setEditOtp(e.target.value)}
                  placeholder="e.g. 4921"
                  className="w-full rounded-xl border border-[#E4DAC8] p-2.5 text-[#241C15] font-mono font-bold text-base outline-none focus:border-[#8B3214]"
                  required
                />
                <span className="text-[10px] text-stone-500">
                  Buyer provides this code to the delivery agent at doorstep.
                </span>
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Carrier Partner
                </label>
                <select
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                >
                  <option value="India Post GI Express">
                    🇮🇳 India Post GI Express
                  </option>
                  <option value="India Post Speed Post">
                    🇮🇳 India Post Speed Post
                  </option>
                  <option value="Blue Dart GI Express">
                    🚚 Blue Dart GI Express
                  </option>
                  <option value="DTDC Express">📦 DTDC Express</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Assigned Delivery Agent
                </label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4DAC8]">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] text-[#6B6255] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold hover:bg-[#6D270F]"
                >
                  Update Order Logistics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT USER ACCOUNT                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DAC8] p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-[#E4DAC8] pb-3">
              <h3 className="font-bold font-serif text-sm text-[#241C15]">
                Edit User Identity: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-stone-400 hover:text-stone-800 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveUserChanges} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] outline-none focus:border-[#8B3214]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Security PIN
                  </label>
                  <input
                    type="text"
                    value={editUserPin}
                    onChange={(e) => setEditUserPin(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-mono font-bold outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Account Status
                  </label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4DAC8]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] text-[#6B6255] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold hover:bg-[#6D270F]"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD NEW USER ACCOUNT                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4DAC8] p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-[#E4DAC8] pb-3">
              <h3 className="font-bold font-serif text-sm text-[#241C15]">
                Register New Particular Account
              </h3>
              <button
                onClick={() => setIsAddingUser(false)}
                className="text-stone-400 hover:text-stone-800 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ram Gopal Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2.5 text-[#241C15] outline-none focus:border-[#8B3214]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-bold outline-none focus:border-[#8B3214]"
                  >
                    <option value="artisan">🏺 Master Artisan</option>
                    <option value="producer">🏭 Workshop Producer</option>
                    <option value="delivery">🚚 Delivery Fleet</option>
                    <option value="buyer">🛍️ Craft Buyer</option>
                    <option value="b2b_gov">🏛️ B2B / GeM Officer</option>
                    <option value="admin">🛡️ Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8C7E6D] font-bold mb-1">
                    Security PIN *
                  </label>
                  <input
                    type="text"
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-mono font-bold outline-none focus:border-[#8B3214]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newUserMobile}
                  onChange={(e) => setNewUserMobile(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-mono outline-none focus:border-[#8B3214]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8C7E6D] font-bold mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="name@simplificant.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DAC8] p-2 text-[#241C15] font-mono outline-none focus:border-[#8B3214]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4DAC8]">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E4DAC8] text-[#6B6255] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#8B3214] text-white font-bold hover:bg-[#6D270F]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
