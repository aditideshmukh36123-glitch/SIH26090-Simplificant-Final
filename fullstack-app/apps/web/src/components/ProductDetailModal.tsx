import React, { useState } from "react"
import { Product, LanguageCode } from "../types"
import { translate } from "../utils/translations"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  selectedLanguage: LanguageCode
  onAddToCart: (product: Product) => void
  onBuyNow: (product: Product) => void
  onShare: (product: Product) => void
  showToast: (msg: string) => void
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  selectedLanguage,
  onAddToCart,
  onBuyNow,
  onShare,
  showToast,
}: ProductDetailModalProps) {
  const [selectedImageTab, setSelectedImageTab] = useState<"clean" | "raw">("clean")
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [detailLang, setDetailLang] = useState<"en" | "hi">("en")

  if (!isOpen || !product) return null

  const title = product.name[detailLang] || product.name.en
  const description = product.description[detailLang] || product.description.en
  const location = product.location[selectedLanguage] || product.location.en
  const fmt = (n?: number) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`

  const displayImage =
    selectedImageTab === "raw" && product.raw_workshop_image
      ? product.raw_workshop_image
      : product.image

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140F0B]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl border border-[#E0D5C1] shadow-2xl p-5 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-9 h-9 rounded-full bg-white border border-[#E4DAC8] flex items-center justify-center transition-all cursor-pointer shadow-xs z-10"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Image Gallery & Workshop Proof */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-white border border-[#E4DAC8] shadow-sm">
              <img
                src={displayImage}
                alt={title}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {product.gi_tagged && (
                <span className="absolute top-3 left-3 bg-[#C9922E] text-[#241C15] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  ✓ GI Provenance Verified
                </span>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  setIsWishlisted(!isWishlisted)
                  showToast(
                    isWishlisted
                      ? "Removed from wishlist."
                      : "❤️ Added to your artisan wishlist!",
                  )
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E4DAC8] flex items-center justify-center text-sm transition-colors cursor-pointer shadow-xs"
              >
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Gallery Tabs (Enhanced Studio vs Raw Workshop) */}
            {product.raw_workshop_image && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImageTab("clean")}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedImageTab === "clean"
                      ? "bg-white border-[#C9922E] text-[#241C15] shadow-xs"
                      : "bg-[#FAF7F2] border-[#E4DAC8] text-[#6B6255]"
                  }`}
                >
                  <img
                    src={product.image}
                    alt="Studio view"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                    }}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="text-left">
                    <span className="block font-bold">Studio View</span>
                    <span className="text-[10px] text-[#8C7E6D]">
                      Enhanced photo
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedImageTab("raw")}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedImageTab === "raw"
                      ? "bg-white border-[#C9922E] text-[#241C15] shadow-xs"
                      : "bg-[#FAF7F2] border-[#E4DAC8] text-[#6B6255]"
                  }`}
                >
                  <img
                    src={product.raw_workshop_image}
                    alt="Workshop view"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                    }}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="text-left">
                    <span className="block font-bold">Workshop Proof</span>
                    <span className="text-[10px] text-[#8C7E6D]">
                      Raw workbench photo
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Provenance Card */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#B7592F] font-bold">
                <span>🏛️</span>
                <span>Indigenous Heritage Provenance</span>
              </div>
              <p className="text-[#6B6255] leading-relaxed">
                Handcrafted by master artisan{" "}
                <strong className="text-[#241C15]">{product.artisan}</strong> at{" "}
                <strong className="text-[#241C15]">
                  {product.producerName || "Guild Workshop"}
                </strong>
                , located in{" "}
                <strong className="text-[#241C15]">{location}</strong>.
                Supported under MoSJE direct artisan welfare.
              </p>
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Actions */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    product.isMaterial
                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                      : "bg-[#B7592F]/10 text-[#B7592F]"
                  }`}
                >
                  {product.isMaterial
                    ? "🧵 Raw Craft Material"
                    : product.category}
                </span>
                {product.materialUnit && (
                  <span className="text-[10px] font-bold bg-[#EFE8D8] text-[#241C15] px-2 py-0.5 rounded-full">
                    📦 {product.materialUnit}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-[#8C7E6D]">
                  Cluster: {location}
                </span>
              </div>

              {/* Title & Language Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#241C15] leading-tight flex-1">
                  {title}
                </h1>
                
                {product.name.hi && (
                  <div className="flex bg-[#EFE8D8] rounded-lg p-1 text-xs shrink-0 h-fit">
                    <button
                      onClick={() => setDetailLang("en")}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        detailLang === "en" ? "bg-white shadow-sm text-[#241C15]" : "text-[#8C7E6D]"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setDetailLang("hi")}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        detailLang === "hi" ? "bg-white shadow-sm text-[#241C15]" : "text-[#8C7E6D]"
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                )}
              </div>

              {/* Price Block & Inventory Stock */}
              <div className="flex flex-wrap items-baseline justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E4DAC8]">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-serif text-[#241C15]">
                      {fmt(product.price)}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold">
                      (0% Middleman Margin)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C7E6D] block mt-0.5">
                    100% Direct Benefit Transfer (DBT) to Artisan Account
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    ✓ {product.stockQuantity || 12} in Stock
                  </span>
                  <span className="text-[10px] text-[#8C7E6D] block mt-1">
                    Dispatches in 24-48 hrs
                  </span>
                </div>
              </div>

              {/* Transparent Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[#EFE8D8]/50 border border-[#E4DAC8] text-xs space-y-1.5">
                <span className="font-bold text-[#241C15] block">
                  ⚖️ {translate("valProp3Title", selectedLanguage)}:
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[#8C7E6D] block">
                      {translate("catPottery", selectedLanguage).split(" ")[0]}{" "}
                      Material:
                    </span>
                    <strong className="text-[#241C15]">
                      {fmt(product.raw_material_cost || 260)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] block">
                      Artisan Labor ({product.labor_hours || 14}h):
                    </span>
                    <strong className="text-emerald-800 font-bold">
                      100% Direct Wage
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8C7E6D] block">Middleman Fee:</span>
                    <strong className="text-emerald-800 font-bold">
                      ₹0 Saved
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#241C15] uppercase tracking-wider">
                  {translate("byArtisan", selectedLanguage)} {product.artisan}
                </h4>
                <p className="text-xs sm:text-sm text-[#6B6255] leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Materials & Specs */}
              {product.materials && product.materials.length > 0 && (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-[#241C15] uppercase tracking-wider text-[11px]">
                    Natural Materials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.materials.map((m, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-[#E4DAC8] px-2.5 py-0.5 rounded-full text-[11px] text-[#241C15]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-[#241C15] uppercase tracking-wider text-[11px]">
                    Craft Highlights
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-[#6B6255] text-xs">
                    {product.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Purchase CTA Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#E4DAC8]">
              <div className="flex gap-3">
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-1 bg-white hover:bg-[#FAF7F2] text-[#241C15] border border-[#E4DAC8] py-3 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <span>🛍️</span>
                  <span>{translate("addToBag", selectedLanguage)}</span>
                </button>

                <button
                  onClick={() => onBuyNow(product)}
                  className="flex-1 bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] py-3 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>
                    {translate("buyNow", selectedLanguage)} (
                    {fmt(product.price)})
                  </span>
                </button>

                <button
                  onClick={() => onShare(product)}
                  title="Share craft on WhatsApp, Telegram, etc."
                  className="w-12 h-12 rounded-full border border-[#E4DAC8] bg-white hover:bg-emerald-50 text-emerald-800 flex items-center justify-center text-base shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  💬
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-[#8C7E6D]">
                  {translate("freeShippingDirect", selectedLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
