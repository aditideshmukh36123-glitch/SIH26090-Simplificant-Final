import { useState, useEffect } from "react"
import { CustomerOrder, LanguageCode } from "../types"
import { translate } from "../utils/translations"

interface CustomerOrdersTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  customer: { name: string; phone: string; isVerified: boolean } | null
  orders: CustomerOrder[]
  onOpenLogin: () => void
  onReorder: (order: CustomerOrder) => void
  onCancelOrder?: (orderId: string) => void
  onSubmitReview?: (orderId: string, rating: number, comment: string) => void
  onOpenSupportChat?: (orderId?: string) => void
  onAdvanceOrderStage?: (orderId: string) => void
  initialOrderId?: string | null
  showToast: (msg: string) => void
  selectedLanguage?: LanguageCode
}

export default function CustomerOrdersTrackingModal({
  isOpen,
  onClose,
  customer,
  orders,
  onOpenLogin,
  onReorder,
  onCancelOrder,
  onSubmitReview,
  onOpenSupportChat,
  onAdvanceOrderStage,
  initialOrderId,
  showToast,
  selectedLanguage = "en",
}: CustomerOrdersTrackingModalProps) {
  const [selectedTrackingOrder, setSelectedTrackingOrder] =
    useState<CustomerOrder | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Review & Rating State
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState<string>("")
  const [reviewSubmitting, setReviewSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (initialOrderId) {
      const match = orders.find((o) => o.id === initialOrderId)
      if (match) setSelectedTrackingOrder(match)
    }
  }, [initialOrderId, orders])

  useEffect(() => {
    if (selectedTrackingOrder) {
      const updated = orders.find((o) => o.id === selectedTrackingOrder.id)
      if (updated) setSelectedTrackingOrder(updated)
    }
  }, [orders])

  if (!isOpen) return null

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      o.productTitle.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.sellerShopName.toLowerCase().includes(q) ||
      o.artisanName.toLowerCase().includes(q) ||
      (o.trackingAwb && o.trackingAwb.toLowerCase().includes(q)) ||
      (o.carrierName && o.carrierName.toLowerCase().includes(q)) ||
      (o.buyerPhone && o.buyerPhone.includes(q)) ||
      (o.deliveryAgentName && o.deliveryAgentName.toLowerCase().includes(q)) ||
      o.status.toLowerCase().includes(q)
    )
  })

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  const handleDownloadInvoice = (order: CustomerOrder) => {
    const invoiceContent = `=====================================================
SIMPLIFICANT - MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT (MoSJE)
OFFICIAL GI HANDICRAFT TAX INVOICE & PROVENANCE CERTIFICATE
=====================================================
Order Number: ${order.id}
Order Date: ${order.orderDate}
Fulfillment Mode: 100% Direct Artisan Model (Zero Middleman)
Buyer Name: ${order.buyerName}
Buyer Phone: ${order.buyerPhone}
Delivery Address: ${order.shippingAddress}

-----------------------------------------------------
ORDER ORIGIN & CRAFT PROVENANCE:
-----------------------------------------------------
Artisan Creator: ${order.artisanName}
Workshop: ${order.workshopName || order.sellerShopName}
GI Cluster / Location: ${order.giCluster}
Production Hub: ${order.workshopLocation || order.giCluster}
Dispatch Terminal: ${order.dispatchLocation || "Regional Postal Hub"}

-----------------------------------------------------
PRODUCT DETAILS:
-----------------------------------------------------
Item: ${order.productTitle}
Category: ${order.category}
Quantity: ${order.quantity}
Unit Price: ${fmt(order.pricePaid)}
Total Amount: ${fmt(order.totalAmount)}
Payment Mode: ${
      order.paymentMethod
        ? order.paymentMethod.toUpperCase()
        : "UPI Direct Benefit Transfer"
    }
Payment Status: ${order.paymentStatus || "Successful"}
Transaction Ref: ${order.paymentTransactionId || "DBT-VERIFIED-TXN"}

-----------------------------------------------------
LOGISTICS & CARRIER DETAILS:
-----------------------------------------------------
Carrier / Courier: ${order.carrierName}
AWB Tracking ID: ${order.trackingAwb}
Assigned Delivery Agent: ${order.deliveryAgentName || "Assigned Postal Logistics Agent"}
Current Status: ${order.status}
=====================================================
Thank you for directly supporting indigenous Indian artisans!
`
    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Invoice_${order.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`📄 Invoice for ${order.id} downloaded!`)
  }

  const handleReviewSubmit = (orderId: string) => {
    if (!reviewComment.trim()) {
      showToast("Please enter a short review comment.")
      return
    }
    if (onSubmitReview) {
      onSubmitReview(orderId, reviewRating, reviewComment)
    }
    setReviewSubmitting(null)
    setReviewComment("")
    showToast("🌟 Thank you! Your review has been recorded.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140F0B]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl border border-[#E0D5C1] shadow-2xl p-4 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-9 h-9 rounded-full bg-white border border-[#E4DAC8] flex items-center justify-center transition-all cursor-pointer shadow-xs z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4DAC8] pb-4 pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F] bg-[#B7592F]/10 px-2.5 py-0.5 rounded-full">
                Customer Account Hub
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {translate("valPropOtp", selectedLanguage)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#241C15] mt-1">
              {translate("trackingTitle", selectedLanguage)}
            </h2>
          </div>

          {customer ? (
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-[#E4DAC8]">
              <div className="w-9 h-9 rounded-full bg-[#C9922E]/20 text-[#241C15] font-bold flex items-center justify-center text-sm">
                {customer.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#241C15]">{customer.name}</p>
                <p className="text-[11px] text-[#6B6255]">
                  {customer.phone} (Verified)
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
            >
              🔑 Sign In / Login with OTP
            </button>
          )}
        </div>

        {/* ─── LIVE TRACKING MODAL VIEW (If single order selected) ─── */}
        {selectedTrackingOrder ? (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedTrackingOrder(null)}
              className="text-xs text-[#6B6255] hover:text-[#241C15] font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back to All Orders
            </button>

            {/* High-Priority Handover OTP Card (When Out for Delivery) */}
            {selectedTrackingOrder.status === "Out for Delivery" && (
              <div className="bg-gradient-to-r from-[#C9922E]/25 via-[#C9922E]/15 to-[#FAF7F2] border-2 border-[#C9922E] rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F] bg-[#B7592F]/15 px-2.5 py-0.5 rounded-full">
                    🔐 Doorstep Delivery Handover OTP
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#241C15]">
                    Share this OTP with Delivery Agent{" "}
                    {selectedTrackingOrder.deliveryAgentName || "Vikram Singh"}
                  </h3>
                  <p className="text-xs text-[#6B6255]">
                    Do not share this code until the package is physically in
                    your hands and inspected.
                  </p>
                </div>

                <div className="bg-white border-2 border-[#C9922E] rounded-2xl px-6 py-3 text-center shadow-sm shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D] block">
                    Your Secure OTP
                  </span>
                  <span className="text-3xl font-mono font-bold tracking-widest text-[#241C15] block my-0.5">
                    {selectedTrackingOrder.deliveryOtp || "4921"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const otp = selectedTrackingOrder.deliveryOtp || "4921"
                      navigator.clipboard?.writeText(otp)
                      showToast(`📋 Copied Handover OTP: ${otp}`)
                    }}
                    className="text-[11px] font-bold text-[#8B3214] hover:underline cursor-pointer inline-flex items-center gap-1 mt-1"
                  >
                    <span>📋</span>
                    <span>Copy Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Delivery Agent & Transit Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-white to-amber-50/50 border border-[#E4DAC8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#C9922E]/20 border border-[#C9922E]/40 text-[#241C15] flex items-center justify-center text-2xl font-bold shadow-xs shrink-0">
                  {selectedTrackingOrder.status === "Delivered"
                    ? "✅"
                    : selectedTrackingOrder.status === "Out for Delivery"
                      ? "🛵"
                      : "✈️"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-[#241C15]">
                      {selectedTrackingOrder.deliveryAgentName ||
                        "Vikram Singh (Logistics Partner)"}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ MoSJE Verified Carrier
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6255] mt-0.5">
                    Carrier:{" "}
                    <strong>{selectedTrackingOrder.carrierName}</strong> • AWB:{" "}
                    <span className="font-mono font-bold text-[#241C15]">
                      {selectedTrackingOrder.trackingAwb}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8C7E6D]">
                    Current Status:{" "}
                    <strong
                      className={
                        selectedTrackingOrder.status === "Delivered"
                          ? "text-emerald-700 font-bold"
                          : "text-[#B7592F] font-bold"
                      }
                    >
                      {selectedTrackingOrder.currentLocation ||
                        selectedTrackingOrder.status}
                    </strong>{" "}
                    • ETA: {selectedTrackingOrder.deliveryDateEstimated}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const phone =
                      selectedTrackingOrder.deliveryAgentPhone ||
                      "+91 98711 54321"
                    showToast(
                      `📞 Calling Delivery Agent ${selectedTrackingOrder.deliveryAgentName || "Vikram Singh"} (${phone})...`,
                    )
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#E4DAC8] text-xs font-bold text-[#241C15] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📞</span>
                  <span>Call Agent</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const phone =
                      selectedTrackingOrder.deliveryAgentPhone ||
                      "+91 98711 54321"
                    showToast(
                      `💬 Opening WhatsApp support channel for order #${selectedTrackingOrder.id}`,
                    )
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Delivery Simulator Button */}
            {onAdvanceOrderStage &&
              selectedTrackingOrder.status !== "Delivered" &&
              selectedTrackingOrder.status !== "Cancelled" && (
                <div className="p-3.5 bg-[#FFF9EE] rounded-2xl border border-[#C9922E]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#241C15]">
                    <span className="text-base">⚡</span>
                    <div>
                      <span className="font-bold block">
                        Live Interactive Delivery Simulator:
                      </span>
                      <span className="text-[11px] text-[#6B6255]">
                        Advance this shipment to its next delivery stage in
                        real-time.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onAdvanceOrderStage(selectedTrackingOrder.id)
                    }
                    className="px-3.5 py-2 rounded-xl bg-[#8B3214] hover:bg-[#6D270F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <span>🚀 Advance Delivery Stage</span>
                    <span>➔</span>
                  </button>
                </div>
              )}

            {/* Order Origin & Journey Card */}
            <div className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DAC8] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9C9182]">
                    Order #{selectedTrackingOrder.id} • Placed on{" "}
                    {selectedTrackingOrder.orderDate}
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#241C15] mt-0.5">
                    {selectedTrackingOrder.productTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-serif text-[#241C15]">
                    {fmt(selectedTrackingOrder.totalAmount)}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold block">
                    ✓ Paid via{" "}
                    {selectedTrackingOrder.paymentMethod
                      ? selectedTrackingOrder.paymentMethod.toUpperCase()
                      : "UPI"}
                  </span>
                </div>
              </div>

              {/* Origin Route Breakdown */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B7592F]">
                  📍 Order Origin & Provenance Route
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#8C7E6D] text-[10px] block">
                      Artisan Creator:
                    </span>
                    <strong className="text-[#241C15]">
                      {selectedTrackingOrder.artisanName}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      {selectedTrackingOrder.giCluster}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] text-[10px] block">
                      Workshop / Guild:
                    </span>
                    <strong className="text-[#241C15]">
                      {selectedTrackingOrder.workshopName ||
                        selectedTrackingOrder.sellerShopName}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      {selectedTrackingOrder.workshopLocation ||
                        "Regional Cluster"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] text-[10px] block">
                      Dispatch Terminal:
                    </span>
                    <strong className="text-[#241C15]">
                      {selectedTrackingOrder.dispatchLocation ||
                        "Central Postal Terminal"}
                    </strong>
                    <p className="text-[11px] text-[#6B6255]">
                      {selectedTrackingOrder.carrierName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] text-[10px] block">
                      Destination:
                    </span>
                    <strong className="text-[#241C15]">
                      {selectedTrackingOrder.buyerName}
                    </strong>
                    <p className="text-[11px] text-[#6B6255] truncate">
                      {selectedTrackingOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Milestone Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E6D]">
                  Visual Delivery Progression
                </h4>

                <div className="space-y-4 pl-2">
                  {selectedTrackingOrder.milestones.map((m, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Vertical line connecting nodes */}
                      {idx < selectedTrackingOrder.milestones.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                            m.completed ? "bg-emerald-600" : "bg-[#E4DAC8]"
                          }`}
                        />
                      )}

                      {/* Icon Bubble */}
                      <div
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          m.completed
                            ? "bg-emerald-700 text-white ring-4 ring-emerald-100"
                            : "bg-[#EFE8D8] text-[#8C7E6D]"
                        }`}
                      >
                        {m.completed ? "✓" : idx + 1}
                      </div>

                      {/* Milestone Text */}
                      <div className="flex-1 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5
                            className={`text-xs font-bold ${
                              m.completed ? "text-[#241C15]" : "text-[#8C7E6D]"
                            }`}
                          >
                            {m.title}
                          </h5>
                          <span className="text-[10px] font-mono text-[#8C7E6D]">
                            {m.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6255] mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E4DAC8]">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(selectedTrackingOrder)}
                    className="bg-white hover:bg-[#FAF7F2] border border-[#E4DAC8] text-[#241C15] font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    📄 Download Tax Invoice
                  </button>

                  <button
                    onClick={() =>
                      onOpenSupportChat?.(selectedTrackingOrder.id)
                    }
                    className="bg-white hover:bg-[#FAF7F2] border border-[#E4DAC8] text-[#35415E] font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Order Support Chat</span>
                  </button>
                </div>

                {/* Cancel option if order is still in early stage */}
                {selectedTrackingOrder.status !== "Delivered" &&
                  selectedTrackingOrder.status !== "Cancelled" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this order?",
                          )
                        ) {
                          onCancelOrder?.(selectedTrackingOrder.id)
                          showToast(
                            `Order #${selectedTrackingOrder.id} cancelled.`,
                          )
                          setSelectedTrackingOrder(null)
                        }
                      }}
                      className="text-xs text-red-700 hover:text-red-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── ORDERS LIST VIEW ─── */
          <div className="space-y-4">
            {/* Live Track & Search Banner */}
            <div className="p-4 bg-gradient-to-r from-white via-[#FFF9EE] to-white rounded-3xl border border-[#C9922E]/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#241C15] flex items-center gap-1.5">
                  <span>🚚</span>
                  <span>Instant Package Track & Trace</span>
                </span>
                <span className="text-[11px] text-[#8C7E6D]">
                  Search across {orders.length} shipments
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!searchQuery.trim()) return
                  const match =
                    orders.find(
                      (o) =>
                        o.id.toLowerCase() ===
                          searchQuery.toLowerCase().trim() ||
                        o.trackingAwb.toLowerCase() ===
                          searchQuery.toLowerCase().trim(),
                    ) || filteredOrders[0]
                  if (match) {
                    setSelectedTrackingOrder(match)
                    showToast(`📍 Tracking Order #${match.id}`)
                  } else {
                    showToast("No order matched that search.")
                  }
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-sm text-[#8C7E6D]">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Order ID (e.g., OD-2026-8891) or India Post AWB (e.g., IN994018247IP)..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#E4DAC8] bg-white text-xs text-[#241C15] outline-none focus:border-[#C9922E] shadow-2xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] font-bold text-xs rounded-2xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>Track Parcel</span>
                  <span>➔</span>
                </button>
              </form>

              {/* Quick Shipment Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 text-[11px]">
                <span className="text-[#8C7E6D] font-bold shrink-0">
                  Recent Shipments:
                </span>
                {orders.slice(0, 4).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSelectedTrackingOrder(o)
                      showToast(`📍 Tracking Order #${o.id}`)
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-[#E4DAC8] text-[#241C15] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                  >
                    <span>
                      {o.status === "Delivered"
                        ? "✅"
                        : o.status === "Out for Delivery"
                          ? "🛵"
                          : "✈️"}
                    </span>
                    <span>{o.id}</span>
                    <span className="text-[10px] text-[#8C7E6D]">
                      ({o.status})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#E4DAC8] space-y-3">
                <span className="text-3xl block">📦</span>
                <p className="text-sm font-bold font-serif text-[#241C15]">
                  No orders found
                </p>
                <p className="text-xs text-[#6B6255]">
                  Your direct artisan orders and package tracking will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 hover:border-[#C9922E]/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DAC8] pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                          Order #{order.id} • {order.orderDate}
                        </span>
                        <h4 className="text-base font-bold font-serif text-[#241C15]">
                          {order.productTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "Out for Delivery"
                                ? "bg-[#C9922E]/20 text-[#B7592F] animate-pulse"
                                : "bg-[#EFE8D8] text-[#241C15]"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-base font-bold font-serif text-[#241C15]">
                          {fmt(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.productImage}
                          alt={order.productTitle}
                          className="w-16 h-16 rounded-2xl object-cover border border-[#E4DAC8] shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                          }}
                        />
                        <div className="text-xs space-y-0.5">
                          <p className="text-[#6B6255]">
                            Artisan:{" "}
                            <strong className="text-[#241C15]">
                              {order.artisanName}
                            </strong>
                          </p>
                          <p className="text-[#6B6255]">
                            Workshop:{" "}
                            <strong className="text-[#241C15]">
                              {order.workshopName || order.sellerShopName}
                            </strong>
                          </p>
                          <p className="text-[11px] text-[#8C7E6D]">
                            AWB: {order.trackingAwb} ({order.carrierName})
                          </p>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          📍 Track Order & OTP
                        </button>

                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          📄 Invoice
                        </button>

                        <button
                          onClick={() => onReorder(order)}
                          className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Buy Again
                        </button>
                      </div>
                    </div>

                    {/* Review Form (If Delivered) */}
                    {order.status === "Delivered" && (
                      <div className="border-t border-[#E4DAC8] pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="font-bold text-[#241C15] block">
                            {order.buyerRating
                              ? "✓ Your Rating & Review:"
                              : "Rate this artisan craft:"}
                          </span>
                          {order.buyerRating ? (
                            <p className="text-[#6B6255] text-[11px] mt-0.5">
                              {"★".repeat(order.buyerRating)} - "
                              {order.buyerReview}"
                            </p>
                          ) : (
                            <span className="text-[11px] text-[#8C7E6D]">
                              Help other buyers discover authentic GI quality
                            </span>
                          )}
                        </div>

                        {!order.buyerRating && (
                          <div className="flex items-center gap-2">
                            {reviewSubmitting === order.id ? (
                              <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E4DAC8]">
                                <select
                                  value={reviewRating}
                                  onChange={(e) =>
                                    setReviewRating(Number(e.target.value))
                                  }
                                  className="text-xs font-bold border border-[#E4DAC8] rounded-lg p-1 bg-white"
                                >
                                  <option value={5}>5 ★ - Outstanding</option>
                                  <option value={4}>4 ★ - Very Good</option>
                                  <option value={3}>3 ★ - Average</option>
                                </select>
                                <input
                                  type="text"
                                  value={reviewComment}
                                  onChange={(e) =>
                                    setReviewComment(e.target.value)
                                  }
                                  placeholder="Review comment..."
                                  className="text-xs p-1 border border-[#E4DAC8] rounded-lg bg-white"
                                />
                                <button
                                  onClick={() => handleReviewSubmit(order.id)}
                                  className="bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                                >
                                  Submit
                                </button>
                                <button
                                  onClick={() => setReviewSubmitting(null)}
                                  className="text-xs text-[#8C7E6D] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewSubmitting(order.id)}
                                className="bg-white hover:bg-[#FAF7F2] border border-[#E4DAC8] text-[#B7592F] font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                              >
                                ★ Write a Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
