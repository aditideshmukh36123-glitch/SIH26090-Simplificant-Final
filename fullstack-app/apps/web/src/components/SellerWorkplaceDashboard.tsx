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
  activeTab?: "studio" | "crafts" | "orders"
  onTabChange?: (tab: "studio" | "crafts" | "orders") => void
}

type StudioTab = "studio" | "crafts" | "orders"

export default function SellerWorkplaceDashboard({
  seller,
  products,
  orders,
  onOpenUploadModal,
  onOpenEditProfile,
  onUpdateOrderStatus,
  onSwitchToBuyer,
  showToast,
  activeTab: activeTabProp,
  onTabChange,
}: SellerWorkplaceDashboardProps) {
  const [internalTab, setInternalTab] = useState<StudioTab>("studio")
  const activeTab = activeTabProp || internalTab

  const handleTabChange = (t: StudioTab) => {
    setInternalTab(t)
    if (onTabChange) onTabChange(t)
  }

  const [orderFilter, setOrderFilter] = useState<"all" | "In Workshop" | "Shipped" | "Delivered">("all")

  // Filter products that belong to this artisan
  const artistProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    const sName = (seller.name || "").toLowerCase().trim()
    const sShop = (seller.shopName || "").toLowerCase().trim()
    const sId = String(seller.id || "")

    const matched = products.filter((p) => {
      const artName = (p.artisan || "").toLowerCase().trim()
      const artId = String(p.artisan_id || "")
      const matchName = sName && (artName.includes(sName) || sName.includes(artName))
      const matchShop = sShop && p.description?.en?.toLowerCase().includes(sShop)
      const matchId = sId && (artId === sId || sId.includes(artId))
      return matchName || matchShop || matchId
    })

    if (matched.length > 0) return matched

    // Fallback: search for "Mohan Lal" in products if default artisan
    const mohanProducts = products.filter((p) =>
      (p.artisan || "").toLowerCase().includes("mohan lal"),
    )
    if (mohanProducts.length > 0) return mohanProducts

    return products.slice(0, 6)
  }, [products, seller])

  // Filter orders for this artisan
  const artistOrders = useMemo(() => {
    if (!orders || orders.length === 0) return []
    const sName = (seller.name || "").toLowerCase().trim()
    const sShop = (seller.shopName || "").toLowerCase().trim()

    const matched = orders.filter((o) => {
      const art = (o.artisanName || "").toLowerCase()
      const shop = (o.sellerShopName || "").toLowerCase()
      return (sName && art.includes(sName)) || (sShop && shop.includes(sShop))
    })

    return matched.length > 0 ? matched : orders
  }, [orders, seller])

  // Calculate Available Pieces (sum of stockQuantity across artist's crafts)
  const availablePiecesCount = useMemo(() => {
    return artistProducts.reduce((sum, p) => {
      const qty = typeof p.stockQuantity === "number" ? p.stockQuantity : 10
      return sum + Math.max(0, qty)
    }, 0)
  }, [artistProducts])

  // Filtered orders by status
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return artistOrders
    if (orderFilter === "In Workshop") {
      return artistOrders.filter(
        (o) =>
          o.status === "In Workshop" ||
          o.status === "Confirmed" ||
          o.status === "Quality Passed" ||
          o.status === "Ready for Pickup",
      )
    }
    if (orderFilter === "Shipped") {
      return artistOrders.filter(
        (o) =>
          o.status === "Shipped" ||
          o.status === "In Transit" ||
          o.status === "Out for Delivery",
      )
    }
    return artistOrders.filter((o) => o.status === "Delivered")
  }, [artistOrders, orderFilter])

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  const artisanPhone = seller.phone || "8830070893"
  const artisanGuild = seller.clusterGI || "Sanganer GI Craft Guild · Jaipur, Rajasthan"
  const artisanHub = seller.shopName || "Sanganer Heritage Blue Pottery Hub"

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 font-sans text-[#241C15] animate-in fade-in">
      {/* ─── 2. LARGE ARTISAN STUDIO HERO ─────────────────────────────────── */}
      <section className="relative bg-[#FAF7F2] border border-[#E4DAC8] rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12">
          {/* Large Artisan Photo: 40–50% of the visual area on desktop */}
          <div className="w-full lg:w-5/12 xl:w-1/2 shrink-0">
            <div className="relative w-full h-80 sm:h-96 lg:h-full min-h-[340px] rounded-2xl overflow-hidden border border-[#E4DAC8] shadow-sm bg-[#EFE8D8]">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800"
                alt="Artisan in workshop"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 bg-[#FDFBF7]/95 backdrop-blur-xs px-3.5 py-1 rounded-full border border-[#E4DAC8] text-xs font-sans font-medium text-[#241C15] shadow-xs">
                GI Verified Master Maker
              </div>
            </div>
          </div>

          {/* Text & Actions Beside Image (Editorial Composition) */}
          <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between py-1 lg:py-3 space-y-8">
            <div className="space-y-4">
              {/* Category / Workshop Label & Guild */}
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B7592F] font-sans block">
                  ARTISAN WORKSHOP
                </span>
                <p className="text-sm text-[#6B6255] font-sans font-normal">
                  {artisanGuild}
                </p>
              </div>

              {/* Main H1 Heading (Upright Fraunces, NO ITALIC) */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#241C15] font-normal tracking-tight leading-[1.08]">
                My Craft Studio
              </h1>

              {/* Phone Number & Studio Hub */}
              <div className="space-y-1 pt-1 font-sans">
                <p className="text-base sm:text-lg font-medium text-[#241C15] tracking-tight">
                  {artisanPhone}
                </p>
                <p className="text-sm sm:text-base text-[#6B6255] font-normal">
                  {artisanHub}
                </p>
              </div>
            </div>

            {/* Actions: ONLY "+ Add Craft" and "Edit Studio" */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenUploadModal}
                className="bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-2 font-sans"
              >
                <span className="text-base leading-none font-normal">+</span>
                <span>Add Craft</span>
              </button>

              <button
                onClick={onOpenEditProfile}
                className="border border-[#E4DAC8] bg-white hover:bg-[#FAF7F2] text-[#241C15] px-6 py-3 rounded-full text-xs font-medium transition-colors cursor-pointer font-sans shadow-xs"
              >
                Edit Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. SIMPLE STUDIO NAVIGATION ───────────────────────────────────── */}
      {/* Clean navigation: Studio, My Crafts, Orders, and one clear action: + Add Craft */}
      <nav className="flex items-center justify-between border-b border-[#E4DAC8] pb-1 text-sm font-sans">
        <div className="flex items-center gap-8 sm:gap-12">
          <button
            onClick={() => handleTabChange("studio")}
            className={`pb-3 transition-colors cursor-pointer border-b-2 font-medium ${
              activeTab === "studio"
                ? "border-[#B7592F] text-[#241C15] font-semibold"
                : "border-transparent text-[#8C7E6D] hover:text-[#241C15]"
            }`}
          >
            Studio
          </button>

          <button
            onClick={() => handleTabChange("crafts")}
            className={`pb-3 transition-colors cursor-pointer border-b-2 font-medium ${
              activeTab === "crafts"
                ? "border-[#B7592F] text-[#241C15] font-semibold"
                : "border-transparent text-[#8C7E6D] hover:text-[#241C15]"
            }`}
          >
            My Crafts
          </button>

          <button
            onClick={() => handleTabChange("orders")}
            className={`pb-3 transition-colors cursor-pointer border-b-2 font-medium ${
              activeTab === "orders"
                ? "border-[#B7592F] text-[#241C15] font-semibold"
                : "border-transparent text-[#8C7E6D] hover:text-[#241C15]"
            }`}
          >
            Orders
          </button>
        </div>

        {/* One clear action: + Add Craft */}
        <button
          onClick={onOpenUploadModal}
          className="pb-3 text-xs font-semibold text-[#B7592F] hover:text-[#964724] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="text-base leading-none font-normal">+</span>
          <span>Add Craft</span>
        </button>
      </nav>

      {/* ─── TAB 1: STUDIO (OVERVIEW) ──────────────────────────────────────── */}
      {activeTab === "studio" && (
        <div className="space-y-12">
          {/* Restrained Studio Summary */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE8D8] shadow-xs">
            <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block mb-6">
              STUDIO SUMMARY
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              <div className="space-y-1.5">
                <span className="font-serif text-4xl sm:text-5xl text-[#241C15] font-normal block leading-tight">
                  {artistProducts.length}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block font-sans font-medium">
                  My Crafts
                </span>
                <span className="text-xs text-[#6B6255] font-sans font-light">
                  Active handcrafted listings
                </span>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#EFE8D8] pt-6 sm:pt-0 sm:pl-10">
                <span className="font-serif text-4xl sm:text-5xl text-[#241C15] font-normal block leading-tight">
                  {artistOrders.length}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block font-sans font-medium">
                  Orders
                </span>
                <span className="text-xs text-[#6B6255] font-sans font-light">
                  Direct buyer purchases
                </span>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#EFE8D8] pt-6 sm:pt-0 sm:pl-10">
                <span className="font-serif text-4xl sm:text-5xl text-[#B7592F] font-normal block leading-tight">
                  {availablePiecesCount}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#8C7E6D] block font-sans font-medium">
                  Available Pieces
                </span>
                <span className="text-xs text-[#6B6255] font-sans font-light">
                  Ready in workshop for buyers
                </span>
              </div>
            </div>
          </section>

          {/* Workshop Heritage Note */}
          <section className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E4DAC8] space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block">
              WORKSHOP HERITAGE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
              Hand-turned in Sanganer with Natural Earth Minerals
            </h2>
            <p className="text-sm text-[#5B5750] font-sans font-light leading-relaxed max-w-3xl">
              Each piece is formed using traditional quartz stone powder, Fuller's earth, and plant gum, 
              then hand-painted with cobalt oxide and fired once in traditional kilns. Verified under 
              the Sanganer GI Craft Guild registration for authentic craft preservation.
            </p>
          </section>

          {/* Featured Crafts (2-Column Large Editorial Cards) */}
          <section className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block mb-1">
                  WORKSHOP CREATIONS
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#241C15] font-normal tracking-tight">
                  Crafts in Studio
                </h2>
              </div>

              <button
                onClick={() => setActiveTab("crafts")}
                className="text-xs font-semibold text-[#B7592F] hover:text-[#964724] transition-colors cursor-pointer"
              >
                View all crafts ({artistProducts.length}) →
              </button>
            </div>

            {/* Spacious 2-Column Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {artistProducts.slice(0, 4).map((craft) => {
                const title = craft.name.en || craft.name.hi || "Handcrafted Craft"
                const qty = typeof craft.stockQuantity === "number" ? craft.stockQuantity : 10
                const desc = craft.description?.en || craft.description?.hi || ""

                return (
                  <div
                    key={craft.id}
                    className="group bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E4DAC8] transition-all duration-300 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Large Product Image */}
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#E4DAC8] mb-6">
                        <img
                          src={craft.image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                          }}
                        />
                        {craft.gi_tagged && (
                          <span className="absolute top-4 left-4 bg-[#FDFBF7]/95 backdrop-blur-xs text-[#241C15] text-xs font-sans font-medium px-3 py-1 rounded-full border border-[#E4DAC8] shadow-xs">
                            GI Certified
                          </span>
                        )}
                        <span className="absolute bottom-4 left-4 bg-[#241C15]/85 backdrop-blur-xs text-[#FDFBF7] text-xs font-sans px-3 py-1 rounded-md">
                          {craft.category}
                        </span>
                      </div>

                      {/* Craft Information */}
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal leading-tight tracking-tight">
                          {title}
                        </h3>

                        {desc && (
                          <p className="text-sm sm:text-base text-[#5B5750] font-sans font-light leading-relaxed line-clamp-2">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subtle Price & Stock Line */}
                    <div className="pt-5 mt-6 border-t border-[#E4DAC8]">
                      <div className="flex items-baseline justify-between">
                        <span className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal">
                          {fmt(craft.price)}
                        </span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#B7592F] font-sans">
                          Available · {qty} pieces
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Recent Orders Overview */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block mb-1">
                  DISPATCH QUEUE
                </span>
                <h2 className="font-serif text-3xl text-[#241C15] font-normal tracking-tight">
                  Recent Orders
                </h2>
              </div>

              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs font-semibold text-[#B7592F] hover:text-[#964724] transition-colors cursor-pointer"
              >
                View all orders ({artistOrders.length}) →
              </button>
            </div>

            {artistOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#EFE8D8]">
                <p className="text-xs text-[#6B6255] font-sans">
                  No orders yet. As soon as buyers purchase your crafts, their orders will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {artistOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E4DAC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E4DAC8] shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#8C7E6D] font-sans">
                          <span className="font-mono font-medium text-[#241C15]">{order.id}</span>
                          <span>·</span>
                          <span>{order.orderDate}</span>
                        </div>
                        <h4 className="font-serif text-lg text-[#241C15] font-normal leading-snug">
                          {order.productTitle}
                        </h4>
                        <p className="text-xs text-[#6B6255] font-sans">
                          Buyer: <strong>{order.buyerName}</strong> · Quantity: {order.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EFE8D8]">
                      <div className="text-left sm:text-right font-sans">
                        <span className="font-serif text-xl text-[#241C15] font-normal block">
                          {fmt(order.totalAmount)}
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">
                          Direct Payout
                        </span>
                      </div>

                      <span className="text-xs text-[#5B5750] px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E4DAC8] font-sans font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── TAB 2: MY CRAFTS (LARGE 2-COLUMN GRID) ─────────────────────────── */}
      {activeTab === "crafts" && (
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block">
              WORKSHOP INVENTORY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241C15] font-normal tracking-tight">
              My Crafts
            </h2>
            <p className="text-sm text-[#6B6255] font-sans font-light max-w-2xl leading-relaxed">
              Every handcrafted piece registered to your workshop studio. Available stock reflects 
              ready-to-dispatch inventory.
            </p>
          </div>

          {/* 6. Spacious 2-Column Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {artistProducts.map((craft) => {
              const title = craft.name.en || craft.name.hi || "Handcrafted Craft"
              const qty = typeof craft.stockQuantity === "number" ? craft.stockQuantity : 10
              const desc = craft.description?.en || craft.description?.hi || ""

              return (
                <div
                  key={craft.id}
                  className="group bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E4DAC8] transition-all duration-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Large Product Image */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#E4DAC8] mb-6">
                      <img
                        src={craft.image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                        }}
                      />

                      {craft.gi_tagged && (
                        <span className="absolute top-4 left-4 bg-[#FDFBF7]/95 backdrop-blur-xs text-[#241C15] text-xs font-sans font-medium px-3 py-1 rounded-full border border-[#E4DAC8] shadow-xs">
                          GI Certified
                        </span>
                      )}

                      <span className="absolute bottom-4 left-4 bg-[#241C15]/85 backdrop-blur-xs text-[#FDFBF7] text-xs font-sans px-3 py-1 rounded-md">
                        {craft.category}
                      </span>
                    </div>

                    {/* Craft Name & Description */}
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal leading-tight tracking-tight">
                        {title}
                      </h3>

                      {desc && (
                        <p className="text-sm sm:text-base text-[#5B5750] font-sans font-light leading-relaxed line-clamp-3">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtle Price & Stock Line */}
                  <div className="pt-6 mt-6 border-t border-[#E4DAC8]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal">
                        {fmt(craft.price)}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#B7592F] font-sans">
                        Available · {qty} pieces
                      </span>
                    </div>

                    {/* Restrained Actions */}
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#EFE8D8] text-xs font-sans text-[#6B6255]">
                      <button
                        onClick={onOpenUploadModal}
                        className="hover:text-[#241C15] transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          showToast(`Craft "${title}" details ready for sharing.`)
                        }}
                        className="hover:text-[#B7592F] transition-colors cursor-pointer"
                      >
                        Share Craft
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ─── TAB 3: ORDERS ─────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#B7592F] font-semibold font-sans block">
                BUYER PURCHASES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#241C15] font-normal tracking-tight">
                Orders
              </h2>
              <p className="text-sm text-[#6B6255] font-sans font-light max-w-xl">
                Orders placed directly by buyers. Pack the items securely and mark shipped for 
                India Post or courier pickup.
              </p>
            </div>

            {/* Understated Filter Links */}
            <div className="flex items-center gap-4 text-xs font-sans">
              {(["all", "In Workshop", "Shipped", "Delivered"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`pb-1 transition-colors cursor-pointer border-b ${
                    orderFilter === st
                      ? "border-[#B7592F] text-[#241C15] font-semibold"
                      : "border-transparent text-[#8C7E6D] hover:text-[#241C15]"
                  }`}
                >
                  {st === "all" ? "All" : st}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#EFE8D8]">
              <p className="text-sm text-[#6B6255] font-sans">
                No orders matching filter "{orderFilter}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const canMarkShipped =
                  order.status === "In Workshop" ||
                  order.status === "Confirmed" ||
                  order.status === "Quality Passed" ||
                  order.status === "Ready for Pickup"

                return (
                  <div
                    key={order.id}
                    className="p-6 bg-white rounded-3xl border border-[#E4DAC8] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs"
                  >
                    <div className="flex items-center gap-5">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#E4DAC8] shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                        }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[#8C7E6D] font-sans">
                          <span className="font-mono font-medium text-[#241C15]">{order.id}</span>
                          <span>·</span>
                          <span>{order.orderDate}</span>
                        </div>
                        <h4 className="font-serif text-xl text-[#241C15] font-normal leading-snug">
                          {order.productTitle}
                        </h4>
                        <p className="text-xs text-[#6B6255] font-sans">
                          Buyer: <strong>{order.buyerName}</strong> ({order.deliveryAddress?.city || "Jaipur"}) · Quantity: {order.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#EFE8D8]">
                      <div className="text-left md:text-right font-sans">
                        <span className="font-serif text-2xl text-[#241C15] font-normal block">
                          {fmt(order.totalAmount)}
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">
                          Direct Payout
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#5B5750] px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E4DAC8] font-sans font-medium">
                          {order.status}
                        </span>

                        {canMarkShipped && (
                          <button
                            onClick={() => {
                              onUpdateOrderStatus(order.id, "Shipped")
                              showToast(`Order #${order.id} marked as Shipped! India Post notified.`)
                            }}
                            className="bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] text-xs font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer font-sans"
                          >
                            Mark Shipped
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
