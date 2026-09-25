import React, { useState } from "react"
import { ProducerProfile, Product, CustomerOrder } from "../types"

interface ProducerDashboardProps {
  producer: ProducerProfile
  products: Product[]
  orders: CustomerOrder[]
  onUpdateOrderStatus: (
    orderId: string,
    nextStatus: CustomerOrder["status"],
  ) => void
  onOpenAddProduct: () => void
  showToast: (msg: string) => void
}

export default function ProducerDashboard({
  producer,
  products,
  orders,
  onUpdateOrderStatus,
  onOpenAddProduct,
  showToast,
}: ProducerDashboardProps) {
  const [activeTab, setActiveTab] =
    useState<"pipeline" | "inventory" | "profile">("pipeline")
  const [stageFilter, setStageFilter] =
    useState<"all" | "In Workshop" | "Quality Passed" | "Ready for Pickup" | "Shipped">(
      "all",
    )

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  // Orders relevant to workshop production
  const workshopOrders = orders.filter((o) =>
    stageFilter === "all" ? true : o.status === stageFilter,
  )

  const activeInProduction = orders.filter(
    (o) => o.status === "In Workshop",
  ).length
  const readyForPickupCount = orders.filter(
    (o) => o.status === "Ready for Pickup" || o.status === "Quality Passed",
  ).length
  const dispatchedCount = orders.filter(
    (o) =>
      o.status === "Shipped" ||
      o.status === "In Transit" ||
      o.status === "Out for Delivery" ||
      o.status === "Delivered",
  ).length

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* ─── WORKSHOP PROFILE HEADER ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#241C15] via-[#2F231B] to-[#1E1712] text-[#F7F2E9] p-6 sm:p-8 border border-[#C9922E]/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#C9922E] text-[#241C15] px-3 py-0.5 rounded-full shadow-xs">
                🏭 Certified Guild Workshop
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Active Cluster: {producer.clusterGI}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#F7F2E9]">
              {producer.workshopName}
            </h1>

            <p className="text-xs text-[#E4DAC8]/80 max-w-2xl font-light">
              Master Craftsman Head: <strong>{producer.headArtisanName}</strong>{" "}
              • {producer.activeArtisansCount} Affiliated Artisans • Production
              Capacity: {producer.capacityPerMonth} units/mo
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenAddProduct}
              className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>📸</span>
              <span>Upload Craft from Workshop</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── WORKSHOP STATS STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            In Production
          </span>
          <p className="text-2xl font-bold font-serif text-[#B7592F] mt-1">
            {activeInProduction}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            Handcrafting & Drying
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Ready for Pickup
          </span>
          <p className="text-2xl font-bold font-serif text-[#C9922E] mt-1">
            {readyForPickupCount}
          </p>
          <span className="text-[11px] text-[#6B6255]">Inspected & Boxed</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Dispatched & Delivered
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-800 mt-1">
            {dispatchedCount}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            Handed to Logistics
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
            Active Craft Batches
          </span>
          <p className="text-2xl font-bold font-serif text-[#35415E] mt-1">
            {producer.activeBatches}
          </p>
          <span className="text-[11px] text-[#6B6255]">
            Certified GI Artisans
          </span>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <div className="flex bg-[#EFE8D8] p-1.5 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "pipeline"
              ? "bg-white text-[#241C15] shadow-xs font-bold"
              : "text-[#6B6255]"
          }`}
        >
          📦 Production & Pickup Pipeline ({workshopOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "inventory"
              ? "bg-white text-[#241C15] shadow-xs font-bold"
              : "text-[#6B6255]"
          }`}
        >
          🏺 Workshop Catalog & Stock ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white text-[#241C15] shadow-xs font-bold"
              : "text-[#6B6255]"
          }`}
        >
          🏛️ Workshop Profile
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: PRODUCTION & PICKUP PIPELINE                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Stage Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#8C7E6D] font-bold">Stage:</span>
            {[
              { id: "all", label: "All Workshop Orders" },
              { id: "In Workshop", label: "🔨 In Production" },
              { id: "Quality Passed", label: "✓ Quality Passed" },
              { id: "Ready for Pickup", label: "🚚 Ready for Pickup" },
              { id: "Shipped", label: "🛵 Dispatched" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStageFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  stageFilter === st.id
                    ? "bg-[#241C15] text-[#F7F2E9] border-[#241C15] font-bold shadow-xs"
                    : "bg-white text-[#6B6255] border-[#E4DAC8] hover:border-[#C9922E]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {workshopOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DAC8] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                      Order #{order.id} • Assigned to Workshop{" "}
                      {order.workshopName || producer.workshopName}
                    </span>
                    <h3 className="text-base font-bold font-serif text-[#241C15]">
                      {order.productTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-serif text-[#241C15]">
                      {fmt(order.totalAmount)}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "Ready for Pickup"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : "bg-[#EFE8D8] text-[#241C15]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Workflow Progress Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]">
                    <span className="text-[10px] font-bold uppercase text-[#8C7E6D] block">
                      1. Artisan Maker
                    </span>
                    <strong className="text-[#241C15]">
                      {order.artisanName}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      {order.giCluster}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]">
                    <span className="text-[10px] font-bold uppercase text-[#8C7E6D] block">
                      2. Buyer Recipient
                    </span>
                    <strong className="text-[#241C15]">
                      {order.buyerName}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      {order.buyerPhone}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]">
                    <span className="text-[10px] font-bold uppercase text-[#8C7E6D] block">
                      3. Delivery Agent
                    </span>
                    <strong className="text-[#241C15]">
                      {order.deliveryAgentName || "Vikram Singh"}
                    </strong>
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      {order.carrierName}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]">
                    <span className="text-[10px] font-bold uppercase text-[#8C7E6D] block">
                      4. Est. Delivery
                    </span>
                    <strong className="text-[#241C15]">
                      {order.deliveryDateEstimated}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      Tracking: {order.trackingAwb}
                    </p>
                  </div>
                </div>

                {/* Stage Advancement Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4DAC8]">
                  <div className="text-xs text-[#6B6255]">
                    Current Pipeline Status:{" "}
                    <strong className="text-[#241C15]">{order.status}</strong>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === "Confirmed" && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(order.id, "In Workshop")
                          showToast(
                            `Order #${order.id} started workshop crafting!`,
                          )
                        }}
                        className="bg-[#241C15] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3A2C20] cursor-pointer"
                      >
                        🔨 Start Workshop Preparation
                      </button>
                    )}

                    {order.status === "In Workshop" && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(order.id, "Quality Passed")
                          showToast(
                            `Quality Passed seal verified for #${order.id}!`,
                          )
                        }}
                        className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                      >
                        <span>✓</span>
                        <span>Pass Quality Inspection & GI Tag</span>
                      </button>
                    )}

                    {order.status === "Quality Passed" && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(order.id, "Ready for Pickup")
                          showToast(
                            `Order #${order.id} marked Ready for Pickup! Delivery Agent notified.`,
                          )
                        }}
                        className="bg-[#C9922E] text-[#241C15] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#DCA33C] cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🚚</span>
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {order.status === "Ready for Pickup" && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(order.id, "Shipped")
                          showToast(
                            `Package handed over to Delivery Agent ${order.deliveryAgentName || "Vikram"}!`,
                          )
                        }}
                        className="bg-[#241C15] text-[#F7F2E9] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3A2C20] cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📦</span>
                        <span>Handover Package to Delivery Agent</span>
                      </button>
                    )}

                    {(order.status === "Shipped" ||
                      order.status === "In Transit" ||
                      order.status === "Out for Delivery") && (
                      <span className="text-xs text-blue-800 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                        🚚 Package with Delivery Agent ({order.status})
                      </span>
                    )}

                    {order.status === "Delivered" && (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        ✓ Delivery Complete (OTP Verified)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: INVENTORY & CATALOG                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-3xl border border-[#E4DAC8] shadow-xs flex gap-4"
            >
              <img
                src={p.image}
                alt={p.name.en}
                className="w-20 h-20 rounded-2xl object-cover border border-[#E4DAC8] shrink-0"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                }}
              />
              <div className="flex-1 min-w-0 text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#B7592F] uppercase">
                  {p.category} GI Tagged
                </span>
                <h4 className="font-bold font-serif text-[#241C15] text-sm truncate">
                  {p.name.en}
                </h4>
                <p className="text-[#6B6255]">{p.location.en}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold font-serif text-[#241C15]">
                    {fmt(p.price)}
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    {p.stockQuantity || 12} in Stock
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: WORKSHOP PROFILE DETAILS                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-3xl border border-[#E4DAC8] shadow-xs space-y-4 animate-in fade-in text-xs">
          <h3 className="text-base font-bold font-serif text-[#241C15]">
            Workshop Registration & Facilities Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#8C7E6D] font-bold block mb-1">
                Workshop Name
              </label>
              <p className="p-3 rounded-xl bg-[#FAF7F2] font-semibold text-[#241C15]">
                {producer.workshopName}
              </p>
            </div>
            <div>
              <label className="text-[#8C7E6D] font-bold block mb-1">
                Master Head Artisan
              </label>
              <p className="p-3 rounded-xl bg-[#FAF7F2] font-semibold text-[#241C15]">
                {producer.headArtisanName}
              </p>
            </div>
            <div>
              <label className="text-[#8C7E6D] font-bold block mb-1">
                GI Cluster Provenance
              </label>
              <p className="p-3 rounded-xl bg-[#FAF7F2] font-semibold text-[#241C15]">
                {producer.clusterGI}
              </p>
            </div>
            <div>
              <label className="text-[#8C7E6D] font-bold block mb-1">
                Direct UPI Settlement ID
              </label>
              <p className="p-3 rounded-xl bg-[#FAF7F2] font-semibold text-[#241C15]">
                {producer.upiId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
