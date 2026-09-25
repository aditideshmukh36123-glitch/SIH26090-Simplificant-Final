import { useState } from "react"
import { SellerProfile } from "../types"

interface SellerAuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentSeller: SellerProfile | null
  onSaveSeller: (seller: SellerProfile) => void
  showToast: (msg: string) => void
}

export default function SellerAuthModal({
  isOpen,
  onClose,
  currentSeller,
  onSaveSeller,
  showToast,
}: SellerAuthModalProps) {
  const [name, setName] = useState(currentSeller?.name || "")
  const [shopName, setShopName] = useState(currentSeller?.shopName || "")
  const [websiteOrHandle, setWebsiteOrHandle] = useState(
    currentSeller?.websiteOrHandle || "",
  )
  const [clusterGI, setClusterGI] = useState(
    currentSeller?.clusterGI ||
      "Channapatna Lacquerware Artisans Guild, Ramanagara",
  )
  const [phone, setPhone] = useState(currentSeller?.phone || "")
  const [email, setEmail] = useState(currentSeller?.email || "")
  const [upiId, setUpiId] = useState(currentSeller?.upiId || "")

  if (!isOpen) return null

  const handleQuickDemo = (role: "channapatna" | "banarasi") => {
    if (role === "channapatna") {
      setName("Nagaraju Channapatna")
      setShopName("Vidyaranya Heritage Lacquer Toys & Crafts")
      setWebsiteOrHandle("channapatna-heritage.art")
      setClusterGI("Channapatna Lacquerware Artisans Guild, Karnataka")
      setPhone("+91 98450 12890")
      setEmail("nagaraju.craft@gmail.com")
      setUpiId("nagaraju.artisan@okaxis")
    } else {
      setName("Ramesh Kumar Vishwakarma")
      setShopName("Kashi Royal Handlooms & Brocades")
      setWebsiteOrHandle("kashisilk.artisan.in")
      setClusterGI("Kotwa Handloom Weavers Guild, Varanasi")
      setPhone("+91 98200 67432")
      setEmail("ramesh.weavers@varanasi.org")
      setUpiId("rameshkumar@icici")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast("Please enter artisan / seller name.")
      return
    }
    if (!shopName.trim()) {
      showToast("Please enter your Shop or Brand name.")
      return
    }

    const updatedSeller: SellerProfile = {
      id: currentSeller?.id || `ART-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      shopName: shopName.trim(),
      websiteOrHandle:
        websiteOrHandle.trim() ||
        `${shopName.toLowerCase().replace(/\s+/g, "")}.craft.in`,
      clusterGI: clusterGI.trim() || "National Craft Council Verified Artisan",
      phone: phone.trim() || "+91 98765 43210",
      email: email.trim() || "artisan@simplificant.gov.in",
      upiId: upiId.trim() || "artisan.dbt@upi",
      joinedDate: currentSeller?.joinedDate || "March 2024",
      rating: currentSeller?.rating || 4.9,
      totalSalesCount: currentSeller?.totalSalesCount || 284,
      totalRevenue: currentSeller?.totalRevenue || 342600,
    }

    onSaveSeller(updatedSeller)
    showToast(
      `🎉 Welcome, ${updatedSeller.shopName}! Seller Workplace activated.`,
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140F0B]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#E0D5C1] shadow-2xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-[#E4DAC8] flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F] bg-[#B7592F]/10 px-2.5 py-0.5 rounded-full border border-[#B7592F]/20">
              Artisan & Seller Workplace
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              0% Middleman Commission
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#241C15]">
            {currentSeller
              ? "Manage Your Artisan Shop"
              : "Artisan Seller Registration & Login"}
          </h3>
          <p className="text-xs text-[#6B6255] leading-relaxed">
            Register your craft store or personal website to list authentic
            handmade products, monitor daily/monthly sales graphs, manage
            customer dispatches, and receive direct DBT bank payouts.
          </p>
        </div>

        {/* Quick Demo Pre-fills */}
        <div className="p-3 bg-white rounded-2xl border border-[#E4DAC8] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#8C7E6D]">
              ⚡ Quick test with demo artisan shop:
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("channapatna")}
              className="flex-1 text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border border-[#E4DAC8] hover:border-[#C9922E] bg-[#FBF8F1] hover:bg-white text-[#241C15] transition-all cursor-pointer truncate text-left"
            >
              🧸 Channapatna Toys Shop
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("banarasi")}
              className="flex-1 text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border border-[#E4DAC8] hover:border-[#C9922E] bg-[#FBF8F1] hover:bg-white text-[#241C15] transition-all cursor-pointer truncate text-left"
            >
              🧵 Varanasi Silk Weavers
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                Master Artisan / Seller Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                Shop / Store / Website Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kashi Royal Handlooms"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                Website Link or Social Handle
              </label>
              <input
                type="text"
                value={websiteOrHandle}
                onChange={(e) => setWebsiteOrHandle(e.target.value)}
                placeholder="e.g. kashisilk.craft.in or @kashisilk"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                GI Guild Cluster / Location
              </label>
              <select
                value={clusterGI}
                onChange={(e) => setClusterGI(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              >
                <option value="Channapatna Lacquerware Artisans Guild, Karnataka">
                  Channapatna Lacquerware Artisans Guild, Karnataka
                </option>
                <option value="Kotwa Handloom Weavers Guild, Varanasi">
                  Kotwa Handloom Weavers Guild, Varanasi
                </option>
                <option value="Sanganer GI Craft Guild, Rajasthan">
                  Sanganer GI Craft Guild, Rajasthan
                </option>
                <option value="Chamarajanagar Wood Guild, Karnataka">
                  Chamarajanagar Wood Guild, Karnataka
                </option>
                <option value="Kondagaon Tribal Artisans Cooperative, Bastar">
                  Kondagaon Tribal Artisans Cooperative, Bastar
                </option>
                <option value="Hupari Silver Artisan Cluster, Kolhapur">
                  Hupari Silver Artisan Cluster, Kolhapur
                </option>
                <option value="Panchmura Kumbhakar Terracotta Guild, Bankura">
                  Panchmura Kumbhakar Terracotta Guild, Bankura
                </option>
                <option value="Moradabad Brassware Artisans Cluster, UP">
                  Moradabad Brassware Artisans Cluster, UP
                </option>
                <option value="Mithila Women Artisans Guild, Madhubani">
                  Mithila Women Artisans Guild, Madhubani
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                Mobile / WhatsApp Number (For Orders)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#241C15] block">
                Direct Bank UPI ID (100% Direct Payout)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="artisan@okhdfcbank"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E4DAC8] rounded-xl text-[#241C15] outline-none focus:border-[#B7592F]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#241C15] hover:bg-[#382B21] text-[#F3C769] font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🏬</span>
              <span>
                {currentSeller
                  ? "Update & Enter Seller Workplace"
                  : "Activate Shop & Launch Seller Dashboard"}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-[#8C7E6D] text-center">
            🔒 Backed by Ministry of Social Justice & Empowerment (MoSJE) Direct
            Benefit Transfer (DBT) security.
          </p>
        </form>
      </div>
    </div>
  )
}
