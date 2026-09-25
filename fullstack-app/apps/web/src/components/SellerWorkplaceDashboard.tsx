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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month")
  const [selectedCustomDate, setSelectedCustomDate] =
    useState<string>("2026-09-06")
  const [activeTab, setActiveTab] =
    useState<"analytics" | "orders" | "inventory">("analytics")
  const [orderFilter, setOrderFilter] =
    useState<"all" | "In Workshop" | "Shipped" | "Delivered">("all")

  // Generate dynamic sales data according to time period
  const salesGraphData = useMemo(() => {
    if (timePeriod === "year") {
      // 12 months data
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
      // 30 days of September grouped in 5-day intervals
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
      // Last 7 days
      return [
        { label: "Mon (Aug 31)", revenue: 3400, orders: 3 },
        { label: "Tue (Sep 01)", revenue: 4600, orders: 4 },
        { label: "Wed (Sep 02)", revenue: 6200, orders: 5 },
        { label: "Thu (Sep 03)", revenue: 3800, orders: 3 },
        { label: "Fri (Sep 04)", revenue: 7400, orders: 6 },
        { label: "Sat (Sep 05)", revenue: 5900, orders: 5 },
        { label: "Sun (Sep 06)", revenue: 6900, orders: 5 },
      ]
    } else {
      // Custom Date - Hour-by-hour breakdown
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
    return orders.filter((o) => o.status === orderFilter)
  }, [orders, orderFilter])

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* ─── 1. SELLER SHOP BRAND PROFILE BANNER ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#241C15] via-[#35271D] to-[#1E1712] text-[#F7F2E9] p-6 sm:p-8 border border-[#C9922E]/40 shadow-xl">
        {/* Background ambient glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C9922E]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#C9922E] text-[#241C15] px-3 py-0.5 rounded-full shadow-xs">
                🏬 Verified Artisan Shopfront
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Direct DBT Bank Payouts
              </span>
              <span className="text-xs text-[#E4DAC8] font-mono">
                {seller.clusterGI}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-2">
              <span>{seller.shopName}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#DACBB8]">
              <span>
                👤 <strong>Artisan:</strong> {seller.name}
              </span>
              <span>
                🌐 <strong>Web:</strong>{" "}
                <span className="text-[#F3C769] underline cursor-pointer">
                  {seller.websiteOrHandle}
                </span>
              </span>
              <span>
                📱 <strong>Phone:</strong> {seller.phone}
              </span>
              <span>
                💳 <strong>UPI:</strong>{" "}
                <span className="font-mono text-emerald-300">
                  {seller.upiId}
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons on Banner */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📸</span>
              <span>+ List / Upload Craft</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="bg-white/10 hover:bg-white/20 text-[#F7F2E9] border border-white/20 font-medium px-4 py-2 rounded-full text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Edit Shop & Web Details</span>
            </button>

            <button
              onClick={onSwitchToBuyer}
              className="text-[#E4DAC8]/80 hover:text-white text-[11px] underline text-center cursor-pointer pt-0.5"
            >
              ← Back to Buyer Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. WORKPLACE NAVIGATION TABS ─── */}
      <div className="flex border-b border-[#E4DAC8] gap-4 sm:gap-8 text-sm font-bold text-[#8C7E6D]">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "analytics"
              ? "border-[#C9922E] text-[#241C15] font-extrabold text-base"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          <span>📈</span>
          <span>Sales Telemetry & Graph</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-[#C9922E] text-[#241C15] font-extrabold text-base"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          <span>📦</span>
          <span>Orders & Dispatch Queue ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "inventory"
              ? "border-[#C9922E] text-[#241C15] font-extrabold text-base"
              : "border-transparent hover:text-[#241C15]"
          }`}
        >
          <span>🏺</span>
          <span>Shop Inventory ({products.length})</span>
        </button>
      </div>

      {/* ─── 3. TAB CONTENT: SALES ANALYTICS & INTERACTIVE GRAPH ─── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Time Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9182] block">
                Sales Analysis Period
              </span>
              <span className="text-xs font-bold text-[#241C15]">
                {timePeriod === "year" && "📅 Full Year 2026 Monthly Breakdown"}
                {timePeriod === "month" &&
                  "📅 September 2026 Day-by-Day Performance"}
                {timePeriod === "week" && "📅 Last 7 Days Rolling Telemetry"}
                {timePeriod === "custom_date" &&
                  `📅 Exact Date Audit: ${selectedCustomDate}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setTimePeriod("year")}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  timePeriod === "year"
                    ? "bg-[#241C15] text-[#F3C769] border-[#241C15] shadow-xs font-bold"
                    : "bg-[#FBF8F1] text-[#6B6255] border-[#E4DAC8] hover:bg-white"
                }`}
              >
                Yearly (2026)
              </button>

              <button
                onClick={() => setTimePeriod("month")}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  timePeriod === "month"
                    ? "bg-[#241C15] text-[#F3C769] border-[#241C15] shadow-xs font-bold"
                    : "bg-[#FBF8F1] text-[#6B6255] border-[#E4DAC8] hover:bg-white"
                }`}
              >
                Monthly (Sep)
              </button>

              <button
                onClick={() => setTimePeriod("week")}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  timePeriod === "week"
                    ? "bg-[#241C15] text-[#F3C769] border-[#241C15] shadow-xs font-bold"
                    : "bg-[#FBF8F1] text-[#6B6255] border-[#E4DAC8] hover:bg-white"
                }`}
              >
                Daily (7 Days)
              </button>

              <div className="flex items-center gap-1 bg-[#FBF8F1] px-2 py-1 rounded-xl border border-[#E4DAC8]">
                <span className="text-[11px] text-[#6B6255]">Date:</span>
                <input
                  type="date"
                  value={selectedCustomDate}
                  onChange={(e) => {
                    setSelectedCustomDate(e.target.value)
                    setTimePeriod("custom_date")
                  }}
                  className="text-xs bg-transparent text-[#241C15] font-semibold outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Key Metric Highlights Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9C9182]">
                Total Direct Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#241C15]">
                {fmt(currentTotalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                ↑ +18.4% vs last period
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9C9182]">
                Total Craft Orders
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#241C15]">
                {currentTotalOrders}{" "}
                <span className="text-sm font-normal text-[#8C7E6D]">
                  units
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                100% verified buyers
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9C9182]">
                Artisan Wage & Margin
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#B7592F]">
                {fmt(Math.round(currentTotalRevenue * 0.76))}
              </div>
              <span className="text-[11px] text-[#8C7E6D] block">
                Direct to artisan bank
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9C9182]">
                Middleman Cut Saved
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-700">
                {fmt(Math.round(currentTotalRevenue * 1.65))}
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold block">
                Zero agent commissions
              </span>
            </div>
          </div>

          {/* Interactive SVG Sales Graph */}
          <div className="p-6 bg-white rounded-3xl border border-[#E4DAC8] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DAC8] pb-3">
              <div>
                <h3 className="text-base font-bold font-serif text-[#241C15] flex items-center gap-2">
                  <span>📊</span>
                  <span>Artisan Revenue & Volume Curve</span>
                </h3>
                <p className="text-xs text-[#6B6255]">
                  Visual representation of verified craft sales across{" "}
                  {timePeriod === "year"
                    ? "months"
                    : timePeriod === "month"
                      ? "dates in month"
                      : "time slots"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#241C15]">
                  <span className="w-3 h-3 rounded-xs bg-[#C9922E]" />
                  <span>Revenue (₹)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#6B6255]">
                  <span className="w-2 h-2 rounded-full bg-[#B7592F]" />
                  <span>Orders (Units)</span>
                </span>
              </div>
            </div>

            {/* SVG Visual Bars / Line chart */}
            <div className="h-64 sm:h-72 w-full pt-4 flex flex-col justify-end">
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-52 border-b border-[#E4DAC8] px-2 pb-1">
                {salesGraphData.map((item, idx) => {
                  const barHeight = Math.max(
                    12,
                    Math.round((item.revenue / maxRevenue) * 180),
                  )
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 bg-[#241C15] text-[#F7F2E9] text-[10.5px] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-md whitespace-nowrap">
                        <p className="font-bold text-[#F3C769]">
                          {fmt(item.revenue)}
                        </p>
                        <p className="text-[9.5px] text-[#DACBB8]">
                          {item.orders} orders ({item.label})
                        </p>
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${barHeight}px` }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#C9922E] to-[#F3C769] rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-xs flex items-center justify-center"
                      >
                        <span className="text-[9px] font-bold text-[#241C15] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.orders}
                        </span>
                      </div>

                      {/* X-axis Label */}
                      <span className="text-[10px] text-[#8C7E6D] font-medium text-center truncate max-w-[50px]">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Baseline scale */}
              <div className="flex justify-between text-[10px] text-[#9C9182] font-mono pt-2 px-2">
                <span>Min: ₹0</span>
                <span>
                  Average:{" "}
                  {fmt(Math.round(currentTotalRevenue / salesGraphData.length))}
                </span>
                <span>Peak: {fmt(maxRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. TAB CONTENT: ORDERS & DISPATCH QUEUE ─── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E4DAC8]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#241C15]">
                Filter by Dispatch Status:
              </span>
              <div className="flex gap-1">
                {(["all", "In Workshop", "Shipped", "Delivered"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                        orderFilter === f
                          ? "bg-[#241C15] text-[#F3C769] border-[#241C15] font-bold"
                          : "bg-[#FBF8F1] text-[#6B6255] border-[#E4DAC8] hover:bg-white"
                      }`}
                    >
                      {f === "all" ? "All Orders" : f}
                    </button>
                  ),
                )}
              </div>
            </div>

            <span className="text-xs text-[#8C7E6D]">
              Showing {filteredOrders.length} customer orders
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E4DAC8] space-y-2">
              <span className="text-4xl">📦</span>
              <h4 className="text-base font-bold text-[#241C15]">
                No orders in this status
              </h4>
              <p className="text-xs text-[#6B6255]">
                When customers purchase your crafts, their orders will appear
                here for dispatch.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-[#EFE8D8] text-[#241C15] px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-xs text-[#8C7E6D]">
                          Placed on: {order.orderDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#241C15]">
                        {order.productTitle}
                      </h4>
                      <p className="text-xs text-[#6B6255]">
                        Buyer: <strong>{order.buyerName}</strong> (
                        {order.buyerPhone}) • {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E4DAC8]">
                    <div className="text-left md:text-right">
                      <div className="text-lg font-bold font-serif text-[#241C15]">
                        {fmt(order.totalAmount)}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block mt-0.5">
                        ✓ DBT Payout Approved
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
                          className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold px-3 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}

                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. TAB CONTENT: SHOP INVENTORY ─── */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E4DAC8]">
            <h3 className="text-sm font-bold text-[#241C15]">
              Active Products in {seller.shopName} ({products.length} Items)
            </h3>
            <button
              onClick={onOpenUploadModal}
              className="bg-[#241C15] text-[#F3C769] font-bold text-xs px-4 py-2 rounded-full cursor-pointer hover:bg-[#382B21] transition-all"
            >
              + Add Another Craft
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs space-y-3"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#EFE8D8]">
                  <img
                    src={prod.image}
                    alt={prod.name.en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                    }}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B7592F]">
                    {prod.category} • GI Tagged
                  </span>
                  <h4 className="text-sm font-bold text-[#241C15] truncate">
                    {prod.name.en}
                  </h4>
                  <p className="text-xs text-[#6B6255] truncate">
                    {prod.location.en}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E4DAC8]">
                  <span className="text-base font-bold font-serif text-[#241C15]">
                    {fmt(prod.price)}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
