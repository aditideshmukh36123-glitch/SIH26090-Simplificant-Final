import React, { useState } from "react"
import { DeliveryAgent, CustomerOrder } from "../types"

interface DeliveryAgentDashboardProps {
  agent: DeliveryAgent
  orders: CustomerOrder[]
  onUpdateOrderStatus: (
    orderId: string,
    nextStatus: CustomerOrder["status"],
    completionTimestamp?: string,
  ) => void
  showToast: (msg: string) => void
}

export default function DeliveryAgentDashboard({
  agent,
  orders,
  onUpdateOrderStatus,
  showToast,
}: DeliveryAgentDashboardProps) {
  const [activeTab, setActiveTab] =
    useState<"assigned" | "completed" | "profile">("assigned")
  const [selectedOrderForOtp, setSelectedOrderForOtp] =
    useState<CustomerOrder | null>(null)
  const [otpInput, setOtpInput] = useState<string>("")
  const [otpError, setOtpError] = useState<string>("")
  const [isVerifying, setIsVerifying] = useState(false)

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  // Orders assigned to delivery network
  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled",
  )
  const completedOrders = orders.filter((o) => o.status === "Delivered")

  // Advance Order Status Flow
  const handleAdvanceStatus = (order: CustomerOrder) => {
    if (
      order.status === "Ready for Pickup" ||
      order.status === "In Workshop" ||
      order.status === "Quality Passed"
    ) {
      onUpdateOrderStatus(order.id, "Shipped")
      showToast(`📦 Order #${order.id} marked Picked Up from Workshop!`)
    } else if (order.status === "Shipped") {
      onUpdateOrderStatus(order.id, "In Transit")
      showToast(`🚚 Order #${order.id} is now In Transit!`)
    } else if (order.status === "In Transit") {
      onUpdateOrderStatus(order.id, "Out for Delivery")
      showToast(
        `🛵 Order #${order.id} is Out for Delivery! Handover OTP sent to buyer.`,
      )
    } else if (order.status === "Out for Delivery") {
      // Prompt OTP Verification Modal
      setSelectedOrderForOtp(order)
      setOtpInput("")
      setOtpError("")
    }
  }

  // Handle OTP Submission
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderForOtp) return

    setOtpError("")
    setIsVerifying(true)

    setTimeout(() => {
      setIsVerifying(false)
      const cleanEntered = otpInput.trim()
      const correctOtp = selectedOrderForOtp.deliveryOtp || "4921"

      if (
        cleanEntered === correctOtp ||
        cleanEntered === "1234" ||
        cleanEntered === "4921"
      ) {
        const nowStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        onUpdateOrderStatus(
          selectedOrderForOtp.id,
          "Delivered",
          `Today, ${nowStr}`,
        )
        showToast(
          `🎉 OTP Verified! Order #${selectedOrderForOtp.id} marked DELIVERED.`,
        )
        setSelectedOrderForOtp(null)
      } else {
        setOtpError(
          `Invalid OTP entered. Please verify with ${selectedOrderForOtp.buyerName}.`,
        )
      }
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* ─── AGENT PROFILE & FLEET STATUS HEADER ─── */}
      <div className="rounded-3xl bg-[#241C15] text-[#F7F2E9] p-5 sm:p-7 border border-[#C9922E]/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#C9922E] text-[#241C15] flex items-center justify-center text-2xl font-bold shadow-md">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Active On Duty
                </span>
                <span className="text-xs text-[#E4DAC8]">
                  {agent.serviceZone}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#F7F2E9] mt-0.5">
                {agent.name}
              </h1>
              <p className="text-xs text-[#9C9182]">
                Vehicle: {agent.vehicleNumber} ({agent.vehicleType}) • Rating: ★{" "}
                {agent.rating}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-white/10 px-4 py-2 rounded-2xl text-center">
              <span className="text-[10px] text-[#DCA33C] uppercase block">
                Active
              </span>
              <strong className="text-lg font-bold">
                {activeOrders.length}
              </strong>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl text-center">
              <span className="text-[10px] text-emerald-400 uppercase block">
                Completed
              </span>
              <strong className="text-lg font-bold">
                {completedOrders.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex bg-[#EFE8D8] p-1.5 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "assigned"
              ? "bg-white text-[#241C15] shadow-xs font-bold"
              : "text-[#6B6255]"
          }`}
        >
          🛵 Active Deliveries ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-white text-[#241C15] shadow-xs font-bold"
              : "text-[#6B6255]"
          }`}
        >
          ✓ Completed ({completedOrders.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: ACTIVE DELIVERIES                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "assigned" && (
        <div className="space-y-4 animate-in fade-in">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E4DAC8] space-y-2">
              <span className="text-3xl block">✨</span>
              <h3 className="text-base font-bold font-serif text-[#241C15]">
                All Deliveries Completed
              </h3>
              <p className="text-xs text-[#6B6255]">
                No pending packages in your queue right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E4DAC8] p-5 shadow-xs space-y-4 hover:border-[#C9922E]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DAC8] pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                        Order #{order.id} • AWB: {order.trackingAwb}
                      </span>
                      <h3 className="text-base font-bold font-serif text-[#241C15]">
                        {order.productTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          order.status === "Out for Delivery"
                            ? "bg-[#C9922E]/20 text-[#B7592F] animate-pulse"
                            : "bg-[#EFE8D8] text-[#241C15]"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-bold font-serif text-[#241C15]">
                        {fmt(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Pickup & Drop Addresses Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Pickup: Workshop */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B7592F] block">
                        📍 1. Pickup from Workshop
                      </span>
                      <strong className="text-[#241C15]">
                        {order.workshopName || order.sellerShopName}
                      </strong>
                      <p className="text-[#6B6255]">
                        {order.workshopLocation || order.giCluster}
                      </p>
                      <button
                        onClick={() =>
                          showToast(`Calling Workshop: +91 98200 67432`)
                        }
                        className="text-[11px] text-[#35415E] font-bold hover:underline cursor-pointer mt-1 block"
                      >
                        📞 Call Workshop Head
                      </button>
                    </div>

                    {/* Drop: Buyer Destination */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        🏠 2. Deliver to Buyer Doorstep
                      </span>
                      <strong className="text-[#241C15]">
                        {order.buyerName}
                      </strong>
                      <p className="text-[#6B6255]">{order.shippingAddress}</p>
                      <button
                        onClick={() =>
                          showToast(`Calling Buyer: ${order.buyerPhone}`)
                        }
                        className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer mt-1 block"
                      >
                        📞 Call Buyer ({order.buyerPhone})
                      </button>
                    </div>
                  </div>

                  {/* Action Step Advancement Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4DAC8]">
                    <div className="text-xs text-[#6B6255]">
                      Payment:{" "}
                      <strong className="text-emerald-800 font-bold">
                        {order.paymentMethod
                          ? order.paymentMethod.toUpperCase()
                          : "UPI"}{" "}
                        (Paid)
                      </strong>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.status !== "Out for Delivery" ? (
                        <button
                          onClick={() => handleAdvanceStatus(order)}
                          className="bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <span>
                            {order.status === "In Workshop" ||
                            order.status === "Quality Passed"
                              ? "📦 Mark Picked Up"
                              : order.status === "Shipped"
                                ? "🚚 Mark In Transit"
                                : "🛵 Mark Out for Delivery"}
                          </span>
                          <span>→</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrderForOtp(order)
                            setOtpInput("")
                            setOtpError("")
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5 animate-pulse"
                        >
                          <span>🔐</span>
                          <span>Enter Buyer Handover OTP</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: COMPLETED DELIVERIES                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "completed" && (
        <div className="space-y-4 animate-in fade-in">
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#E4DAC8] p-4 shadow-xs flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#241C15] text-sm block">
                  {order.productTitle}
                </span>
                <p className="text-[#6B6255]">
                  Delivered to {order.buyerName} • {order.shippingAddress}
                </p>
                <span className="text-[10px] text-emerald-800 font-bold">
                  ✓ OTP Verified ({order.deliveryOtp})
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                Delivered
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL: DOORSTEP OTP COMPLETION KEYPAD ─── */}
      {selectedOrderForOtp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#140F0B]/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E4DAC8] p-6 shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setSelectedOrderForOtp(null)}
              className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-3xl block">🔐</span>
              <h3 className="text-lg font-bold font-serif text-[#241C15]">
                Enter Buyer Handover OTP
              </h3>
              <p className="text-xs text-[#6B6255]">
                Ask {selectedOrderForOtp.buyerName} for the 4-digit code
                displayed in their app.
              </p>
            </div>

            {/* Prototype Hint Helper */}
            <div className="bg-[#FAF7F2] border border-[#C9922E]/30 p-2.5 rounded-xl text-[11px] text-[#241C15]">
              <span className="font-bold text-[#B7592F]">Demo Safe Code: </span>
              <span className="font-mono font-bold text-base">
                {selectedOrderForOtp.deliveryOtp || "4921"}
              </span>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 4-digit OTP"
                autoFocus
                className="w-48 mx-auto text-center text-3xl font-mono font-bold tracking-widest p-3 rounded-2xl border-2 border-[#241C15] bg-[#FAF7F2] outline-none"
              />

              {otpError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-xl border border-red-200">
                  ⚠️ {otpError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForOtp(null)}
                  className="flex-1 bg-[#FAF7F2] hover:bg-[#EFE8D8] text-[#241C15] py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={otpInput.length < 4 || isVerifying}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>
                    {isVerifying ? "Verifying..." : "Confirm & Deliver"}
                  </span>
                  <span>✓</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
