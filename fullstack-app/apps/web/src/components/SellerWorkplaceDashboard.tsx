import { useState, useMemo } from "react"
import { Product, SellerProfile, CustomerOrder } from "../types"

interface SellerWorkplaceDashboardProps {
  seller: SellerProfile
  products: Product[]
  orders: CustomerOrder[]
  onOpenUploadModal: () => void
  onOpenEditProfile: () => void
  onUpdateOrderStatus: (
    orderId: string,
    nextStatus: CustomerOrder["status"],
  ) => void
  onSwitchToBuyer: () => void
  showToast: (msg: string) => void
}

type TimePeriod = "year" | "month" | "week" | "custom_date"
type StudioSection = "all" | "crafts" | "orders" | "earnings" | "story"

export default function SellerWorkplaceDashboard({
  seller,
  products,
  orders,
  onOpenUploadModal,
  onOpenEditProfile,
  onUpdateOrderStatus,
  onSwitchToBuyer,
  showToast,
}: SellerWorkplaceDashboardProps) {
  const [activeSection, setActiveSection] = useState<StudioSection>("all")
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month")
  const [selectedCustomDate, setSelectedCustomDate] =
    useState<string>("2026-09-06")
  const [orderFilter, setOrderFilter] =
    useState<"all" | "In Workshop" | "Shipped" | "Delivered">("all")

  // Dynamic sales data based on selected time period
  const salesGraphData = useMemo(() => {
    if (timePeriod === "year") {
      return [
        { label: "Jan", revenue: 24500, orders: 18 },
        { label: "Feb", revenue: 28900, orders: 22 },
        { label: "Mar", revenue: 35400, orders: 29 },
        { label: "Apr", revenue: 31200, orders: 24 },
        { label: "May", revenue: 42000, orders: 36 },
        { label: "Jun", revenue: 38700, orders: 31 },
        { label: "Jul", revenue: 46500, orders: 39 },
        { label: "Aug", revenue: 52100, orders: 44 },
        { label: "Sep (MTD)", revenue: 34800, orders: 28 },
        { label: "Oct (Est)", revenue: 48000, orders: 40 },
        { label: "Nov (Est)", revenue: 59000, orders: 52 },
        { label: "Dec (Est)", revenue: 64000, orders: 58 },
      ]
    } else if (timePeriod === "month") {
      return [
        { label: "Sep 01", revenue: 4600, orders: 4 },
        { label: "Sep 02", revenue: 6200, orders: 5 },
        { label: "Sep 03", revenue: 3800, orders: 3 },
        { label: "Sep 04", revenue: 7400, orders: 6 },
        { label: "Sep 05", revenue: 5900, orders: 5 },
        { label: "Sep 06 (Today)", revenue: 6900, orders: 5 },
        { label: "Sep 07 (Est)", revenue: 4200, orders: 3 },
        { label: "Sep 08 (Est)", revenue: 5800, orders: 4 },
      ]
    } else if (timePeriod === "week") {
      return [
        { label: "Mon", revenue: 3400, orders: 3 },
        { label: "Tue", revenue: 4600, orders: 4 },
        { label: "Wed", revenue: 6200, orders: 5 },
        { label: "Thu", revenue: 3800, orders: 3 },
        { label: "Fri", revenue: 7400, orders: 6 },
        { label: "Sat", revenue: 5900, orders: 5 },
        { label: "Sun", revenue: 6900, orders: 5 },
      ]
    } else {
      return [
        { label: "09:00 AM", revenue: 1150, orders: 1 },
        { label: "11:30 AM", revenue: 2400, orders: 2 },
        { label: "02:15 PM", revenue: 1650, orders: 1 },
        { label: "04:45 PM", revenue: 1700, orders: 1 },
        { label: "06:00 PM", revenue: 0, orders: 0 },
      ]
    }
  }, [timePeriod, selectedCustomDate])

  const currentTotalRevenue = useMemo(() => {
    return salesGraphData.reduce((sum, d) => sum + d.revenue, 0)
  }, [salesGraphData])

  const currentTotalOrders = useMemo(() => {
    return salesGraphData.reduce((sum, d) => sum + d.orders, 0)
  }, [salesGraphData])

  const maxRevenue = useMemo(() => {
    return Math.max(...salesGraphData.map((d) => d.revenue), 1000)
  }, [salesGraphData])

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders
    if (orderFilter === "In Workshop") {
      return orders.filter(
        (o) =>
          o.status === "In Workshop" ||
          o.status === "Confirmed" ||
          o.status === "Quality Passed" ||
          o.status === "Ready for Pickup",
      )
    }
    if (orderFilter === "Shipped") {
      return orders.filter(
        (o) =>
          o.status === "Shipped" ||
          o.status === "In Transit" ||
          o.status === "Out for Delivery",
      )
    }
    return orders.filter((o) => o.status === "Delivered")
  }, [orders, orderFilter])

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 font-sans text-[#241C15] animate-in fade-in">
      {/* ─── 1. ARTIST SHOPFRONT HEADER ────────────────────────────────────── */}
      <section className="relative bg-[#FDFBF7] border-b border-[#EFE8D8] pb-10 sm:pb-12 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left: Artisan Profile & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Artisan Portrait / Craft Studio Image */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#E4DAC8] shadow-md bg-[#EFE8D8]">
                <img
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400"
                  alt={seller.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#C9922E] text-[#241C15] rounded-full flex items-center justify-center text-[10px] shadow-xs" title="Verified Master Maker">
                ✦
              </span>
            </div>

            {/* Artisan Titles & Location */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#B7592F]">
                  <span className="w-2 h-2 rounded-full bg-[#B7592F]" />
                  Verified GI Artisan
                </span>
                <span className="text-[#8C7E6D] text-xs">·</span>
                <span className="text-xs text-[#6B6255] font-light">
                  {seller.websiteOrHandle || "@mohanlal_bluepottery"}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#241C15] tracking-tight leading-tight">
                {seller.name}
              </h1>

              <p className="text-sm text-[#5B5750] font-light">
                5th Generation Potter · {seller.clusterGI || "Sanganer Craft Guild · Jaipur"}
              </p>

              {/* Gentle Direct Payout Note */}
              <p className="text-xs text-[#8C7E6D] font-light">
                Registered account: <span className="font-mono text-[#241C15] font-medium">{seller.upiId}</span> · 100% direct payouts
              </p>
            </div>
          </div>

          {/* Right: Studio Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] px-6 py-3 rounded-full text-xs font-medium tracking-wide transition-all shadow-sm hover:scale-[1.01] cursor-pointer flex items-center gap-2"
            >
              <span>+</span>
              <span>Add a Craft</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="border border-[#241C15]/30 hover:border-[#241C15] text-[#241C15] px-5 py-3 rounded-full text-xs font-medium tracking-wide transition-colors hover:bg-[#FAF7F2] cursor-pointer"
            >
              Edit Shop Details
            </button>

            <button
              onClick={onSwitchToBuyer}
              className="text-xs text-[#8C7E6D] hover:text-[#241C15] px-2 py-3 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>←</span>
              <span>Marketplace</span>
            </button>
          </div>
        </div>

        {/* Editorial Metadata Strip (Unboxed Typography & Spacing, NO KPI cards) */}
        <div className="mt-8 pt-6 border-t border-[#EFE8D8] flex flex-wrap items-center justify-between gap-6 text-xs text-[#5B5750]">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#241C15] block">
                {products.length}
              </span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#8C7E6D]">
                Crafts in Studio
              </span>
            </div>

            <div className="h-8 w-px bg-[#EFE8D8] hidden sm:block" />

            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#241C15] block">
                {orders.length}
              </span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#8C7E6D]">
                Active Orders
              </span>
            </div>

            <div className="h-8 w-px bg-[#EFE8D8] hidden sm:block" />

            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#241C15] block">
                100%
              </span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#8C7E6D]">
                Direct Bank Payout
              </span>
            </div>

            <div className="h-8 w-px bg-[#EFE8D8] hidden sm:block" />

            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#241C15] block">
                {seller.rating || 4.92} ★
              </span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#8C7E6D]">
                Guild Rating
              </span>
            </div>
          </div>

          {/* Provenance note */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#8C7E6D]">
            <span className="text-[#C9922E]">✦</span>
            <span>Zero Middlemen Deductions · Insured India Post GI Express</span>
          </div>
        </div>
      </section>

      {/* ─── 2. QUIET PROVENANCE & CERTIFICATION STRIP ─────────────────────── */}
      <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EFE8D8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7E6D] block">
              GI Heritage Verified
            </span>
            <p className="font-medium text-[#241C15]">
              {seller.associatedGuild || "Sanganer Blue Pottery Artisans Society"}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7E6D] block">
              Direct Benefit Transfer
            </span>
            <p className="font-medium text-[#241C15]">
              100% credited to {seller.upiId}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7E6D] block">
              Fair Pricing Engine
            </span>
            <p className="font-medium text-[#241C15]">
              Raw materials + skilled hourly wage formula
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7E6D] block">
              Workshop Location
            </span>
            <p className="font-medium text-[#241C15] truncate">
              {seller.workshopAddress || "Kumhar Mohalla, Sanganer, Jaipur"}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. DIGITAL CRAFT STUDIO NAVIGATION ────────────────────────────── */}
      <div className="flex border-b border-[#EFE8D8] gap-4 sm:gap-8 text-xs tracking-wider uppercase font-medium text-[#8C7E6D] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSection("all")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "all"
              ? "border-[#241C15] text-[#241C15] font-semibold"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          Studio Overview
        </button>

        <button
          onClick={() => setActiveSection("crafts")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "crafts"
              ? "border-[#241C15] text-[#241C15] font-semibold"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          My Crafts ({products.length})
        </button>

        <button
          onClick={() => setActiveSection("orders")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === "orders"
              ? "border-[#241C15] text-[#241C15] font-semibold"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          <span>In the Workshop ({orders.length})</span>
          {orders.some((o) => o.status === "In Workshop") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7592F]" />
          )}
        </button>

        <button
          onClick={() => setActiveSection("earnings")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "earnings"
              ? "border-[#241C15] text-[#241C15] font-semibold"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          Earnings & Timeline
        </button>

        <button
          onClick={() => setActiveSection("story")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "story"
              ? "border-[#241C15] text-[#241C15] font-semibold"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          Story & Lineage
        </button>
      </div>

      {/* ─── 4. SECTION: FROM THE STUDIO (ARTISAN SHOPFRONT) ────────────────── */}
      {(activeSection === "all" || activeSection === "crafts") && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B7592F] font-semibold block">
                SHOPFRONT
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
                From the Studio
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6255] font-light">
                Handmade pieces shaped, glazed, and available for collectors.
              </p>
            </div>

            <button
              onClick={onOpenUploadModal}
              className="text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <span>+ Add another craft</span>
              <span>→</span>
            </button>
          </div>

          {/* E-Commerce Editorial Craft Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* The Main Action Tile: Add a New Craft */}
            <div
              onClick={onOpenUploadModal}
              className="group border border-dashed border-[#C9922E]/60 hover:border-[#B7592F] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 cursor-pointer min-h-[340px]"
            >
              <div className="w-14 h-14 rounded-full bg-[#EFE8D8] group-hover:bg-[#E4DAC8] text-[#241C15] flex items-center justify-center text-2xl transition-colors">
                +
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#241C15] block">
                  Add a New Craft
                </span>
                <p className="text-xs text-[#6B6255] font-light max-w-[200px] leading-relaxed">
                  Photograph it with your camera. Tell its material story and calculate fair wages.
                </p>
              </div>
              <span className="text-[11px] text-[#B7592F] font-medium group-hover:underline pt-2">
                Open Camera Listing Studio →
              </span>
            </div>

            {/* Existing Crafts in Studio */}
            {products.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between bg-[#FDFBF7] rounded-3xl p-4 border border-[#EFE8D8] hover:border-[#E4DAC8] hover:shadow-md transition-all duration-300"
              >
                <div>
                  {/* Craft Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFE8D8] mb-4">
                    <img
                      src={prod.image}
                      alt={prod.name.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                      }}
                    />

                    {/* Quiet Provenance Label */}
                    {prod.gi_tagged && (
                      <span className="absolute top-3 left-3 bg-[#FDFBF7]/95 backdrop-blur-xs text-[#241C15] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#E4DAC8]">
                        GI Certified
                      </span>
                    )}

                    <span className="absolute bottom-3 left-3 bg-[#241C15]/70 backdrop-blur-xs text-[#FDFBF7] text-[9.5px] font-light px-2 py-0.5 rounded-md">
                      In Stock
                    </span>
                  </div>

                  {/* Craft Info */}
                  <div className="space-y-1 px-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#8C7E6D]">
                      {prod.category} · {prod.location.en.split(",")[0]}
                    </p>
                    <h3 className="font-serif text-lg text-[#241C15] font-normal leading-snug group-hover:text-[#B7592F] transition-colors truncate">
                      {prod.name.en}
                    </h3>
                    <p className="text-xs text-[#6B6255] font-light line-clamp-2 leading-relaxed">
                      {prod.description.en}
                    </p>
                  </div>
                </div>

                {/* Price and Details */}
                <div className="pt-4 mt-3 border-t border-[#EFE8D8] flex items-center justify-between px-1">
                  <span className="font-serif text-lg font-medium text-[#241C15]">
                    {fmt(prod.price)}
                  </span>
                  <button
                    onClick={onOpenUploadModal}
                    className="text-[11px] text-[#8C7E6D] hover:text-[#241C15] transition-colors cursor-pointer"
                  >
                    Manage Craft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. SECTION: IN THE WORKSHOP (ORDERS QUEUE) ────────────────────── */}
      {(activeSection === "all" || activeSection === "orders") && (
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B7592F] font-semibold block">
                FULFILLMENT
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
                In the Workshop
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6255] font-light">
                Pieces awaiting shaping, inspection, packing, or dispatch.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              {(["all", "In Workshop", "Shipped", "Delivered"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                      orderFilter === filter
                        ? "bg-[#241C15] text-[#FDFBF7]"
                        : "bg-[#FAF7F2] text-[#6B6255] hover:bg-[#EFE8D8]"
                    }`}
                  >
                    {filter === "all" ? "All Orders" : filter}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF7F2] rounded-3xl border border-[#EFE8D8] space-y-2">
              <span className="text-3xl">🏺</span>
              <h4 className="font-serif text-lg font-medium text-[#241C15]">
                Workshop queue is clear
              </h4>
              <p className="text-xs text-[#6B6255] font-light max-w-sm mx-auto">
                No orders in this status right now. When buyers purchase your crafts, their orders will appear here ready to craft and pack.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 bg-[#FDFBF7] rounded-3xl border border-[#EFE8D8] hover:border-[#E4DAC8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                >
                  {/* Left: Product & Buyer Context */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#EFE8D8] shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                      }}
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C7E6D]">
                        <span className="font-mono font-medium text-[#241C15]">
                          {order.id}
                        </span>
                        <span>·</span>
                        <span>Placed on {order.orderDate}</span>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg font-normal text-[#241C15]">
                        {order.productTitle}
                      </h4>

                      <p className="text-xs text-[#5B5750] font-light">
                        For <strong>{order.buyerName}</strong> ({order.buyerPhone}) · {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Right: Payment Transparency & Dispatch Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#EFE8D8]">
                    <div className="text-left md:text-right">
                      <span className="font-serif text-xl font-medium text-[#241C15] block">
                        {fmt(order.totalAmount)}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        ✓ Direct Bank Payout Approved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "In Workshop" && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(order.id, "Shipped")
                            showToast(
                              `📦 Order ${order.id} marked as Shipped via India Post!`,
                            )
                          }}
                          className="bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-colors cursor-pointer"
                        >
                          Mark Shipped
                        </button>
                      )}

                      {order.status === "Shipped" && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(order.id, "Delivered")
                            showToast(
                              `🎉 Order ${order.id} marked as Delivered!`,
                            )
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-colors cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}

                      <span className="text-xs text-[#5B5750] px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EFE8D8]">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── 6. SECTION: YOUR CRAFT, YOUR EARNINGS & STUDIO TIMELINE ────────── */}
      {(activeSection === "all" || activeSection === "earnings") && (
        <section className="space-y-8 pt-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B7592F] font-semibold block">
              TRANSPARENCY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
              Your Craft, Your Earnings
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6255] font-light">
              Fair-wage earnings and 100% direct bank transfers without middlemen deductions.
            </p>
          </div>

          {/* Numbers in Typography & Whitespace (NO corporate dashboard cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-6 border-y border-[#EFE8D8]">
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#241C15] block">
                {fmt(currentTotalRevenue)}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block">
                Direct Craft Revenue
              </span>
              <span className="text-[11px] text-[#5B5750] font-light">
                {currentTotalOrders} pieces ordered
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#B7592F] block">
                {fmt(Math.round(currentTotalRevenue * 0.76))}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block">
                Artisan Earnings
              </span>
              <span className="text-[11px] text-[#5B5750] font-light">
                Direct wages + material reimbursement
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-emerald-800 block">
                {fmt(Math.round(currentTotalRevenue * 1.65))}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block">
                Middleman Cut Saved
              </span>
              <span className="text-[11px] text-emerald-700 font-light">
                Zero agent commissions
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#241C15] block">
                100%
              </span>
              <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block">
                Direct Benefit Transfer
              </span>
              <span className="text-[11px] text-[#5B5750] font-light truncate block">
                Linked to {seller.upiId}
              </span>
            </div>
          </div>

          {/* Editorial Visual Timeline ("Your Month in the Studio") */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#EFE8D8] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-[#241C15] font-normal">
                  Your Timeline in the Studio
                </h3>
                <p className="text-xs text-[#6B6255] font-light">
                  A quiet view of your pieces finding homes over time.
                </p>
              </div>

              {/* Time Switcher */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-full border border-[#EFE8D8]">
                <button
                  onClick={() => setTimePeriod("year")}
                  className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    timePeriod === "year"
                      ? "bg-[#241C15] text-white font-medium"
                      : "text-[#6B6255] hover:text-[#241C15]"
                  }`}
                >
                  Yearly (2026)
                </button>
                <button
                  onClick={() => setTimePeriod("month")}
                  className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    timePeriod === "month"
                      ? "bg-[#241C15] text-white font-medium"
                      : "text-[#6B6255] hover:text-[#241C15]"
                  }`}
                >
                  Monthly (Sep)
                </button>
                <button
                  onClick={() => setTimePeriod("week")}
                  className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    timePeriod === "week"
                      ? "bg-[#241C15] text-white font-medium"
                      : "text-[#6B6255] hover:text-[#241C15]"
                  }`}
                >
                  Daily (7 Days)
                </button>

                <div className="flex items-center gap-1 px-2 text-xs text-[#6B6255]">
                  <span>Date:</span>
                  <input
                    type="date"
                    value={selectedCustomDate}
                    onChange={(e) => {
                      setSelectedCustomDate(e.target.value)
                      setTimePeriod("custom_date")
                    }}
                    className="text-xs bg-transparent text-[#241C15] outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Minimal, Thin, Elegant Timeline Visualization */}
            <div className="pt-4 space-y-3">
              <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 border-b border-[#E4DAC8] pb-1 px-2">
                {salesGraphData.map((item, idx) => {
                  const barHeight = Math.max(
                    14,
                    Math.round((item.revenue / maxRevenue) * 160),
                  )
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                    >
                      {/* Quiet Hover Tooltip */}
                      <div className="absolute -top-10 bg-[#241C15] text-[#FDFBF7] text-[10px] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-sm">
                        <span>{fmt(item.revenue)} · {item.orders} orders</span>
                      </div>

                      {/* Thin Warm Bar */}
                      <div
                        style={{ height: `${barHeight}px` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-[#B7592F] to-[#C9922E] rounded-t-sm group-hover:brightness-110 transition-all shadow-2xs"
                      />

                      {/* Label */}
                      <span className="text-[10px] text-[#8C7E6D] font-light truncate max-w-[48px] text-center">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Quiet Scale Reference */}
              <div className="flex justify-between text-[11px] text-[#8C7E6D] font-light px-2">
                <span>Base: ₹0</span>
                <span>
                  Average: {fmt(Math.round(currentTotalRevenue / salesGraphData.length))}
                </span>
                <span>Peak: {fmt(maxRevenue)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 7. SECTION: THE HANDS BEHIND THE CRAFT (STORY & PROFILE) ───────── */}
      {(activeSection === "all" || activeSection === "story") && (
        <section className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#EFE8D8] space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Story Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#EFE8D8] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1000&auto=format&fit=crop&q=80"
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-[#B7592F] font-semibold block">
                THE HANDS BEHIND THE CRAFT
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
                {seller.name}
              </h2>

              <p className="text-sm text-[#5B5750] leading-relaxed font-light">
                {seller.name} is a fifth-generation potter practicing within the renowned {seller.clusterGI || "Sanganer Craft Guild, Jaipur"}. Working with crushed quartz, fuller's earth, and natural cobalt oxides, each piece is hand-shaped, painted with squirrel-hair brushes, and kiln-fired to 850°C.
              </p>

              <p className="font-serif text-base text-[#241C15] font-normal border-l-2 border-[#B7592F] pl-4 my-2">
                "Every piece carries the memory of the hands that shaped it, the clay of the earth, and the fire of the kiln."
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#6B6255]">
                <div>
                  <span className="text-[#8C7E6D] block">Associated Guild:</span>
                  <span className="font-medium text-[#241C15]">{seller.associatedGuild || "Sanganer Blue Pottery Artisans Society"}</span>
                </div>
                <div>
                  <span className="text-[#8C7E6D] block">Workshop Address:</span>
                  <span className="font-medium text-[#241C15]">{seller.workshopAddress || "Kumhar Mohalla, Sanganer, Jaipur 302029"}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenEditProfile}
                  className="text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Update Studio & Story Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 8. STUDIO QUIET FOOTER ────────────────────────────────────────── */}
      <footer className="pt-8 border-t border-[#EFE8D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7E6D]">
        <p>
          {seller.shopName} · Digital Craft Studio · Supported by MoSJE Direct Payout
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenUploadModal}
            className="hover:text-[#241C15] cursor-pointer"
          >
            + Add Craft
          </button>
          <span>·</span>
          <button
            onClick={onOpenEditProfile}
            className="hover:text-[#241C15] cursor-pointer"
          >
            Studio Settings
          </button>
          <span>·</span>
          <button
            onClick={onSwitchToBuyer}
            className="hover:text-[#241C15] cursor-pointer"
          >
            Buyer Marketplace
          </button>
        </div>
      </footer>
    </div>
  )
}
