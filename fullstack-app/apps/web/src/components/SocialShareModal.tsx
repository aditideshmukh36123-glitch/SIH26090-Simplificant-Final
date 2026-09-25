import { useState, useEffect } from "react"
import { Product, LanguageCode, AIValuationResult } from "../types"

interface SocialShareModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  valuation?: AIValuationResult | null
  imageUrl?: string | null
  selectedLanguage: LanguageCode
  showToast: (msg: string) => void
}

export default function SocialShareModal({
  isOpen,
  onClose,
  product,
  valuation,
  imageUrl,
  selectedLanguage,
  showToast,
}: SocialShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [activePlatform, setActivePlatform] =
    useState<"whatsapp" | "telegram" | "instagram" | "facebook">("whatsapp")

  // Editable fields for promotional content
  const [customTitle, setCustomTitle] = useState("")
  const [customPrice, setCustomPrice] = useState<number>(0)
  const [customHighlights, setCustomHighlights] = useState<string>("")
  const [customDescription, setCustomDescription] = useState("")
  const [customHashtags, setCustomHashtags] = useState("")

  const fmt = (n?: number) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`

  useEffect(() => {
    if (product) {
      const pTitle = product.name[selectedLanguage] || product.name.en
      const pDesc =
        product.description[selectedLanguage] || product.description.en
      setCustomTitle(pTitle)
      setCustomPrice(product.price)
      setCustomDescription(pDesc)
      setCustomHighlights(
        product.highlights?.join(" • ") ||
          "100% Handcrafted • Zero Middleman Cut • Certified GI Provenance",
      )
      setCustomHashtags(
        `#Simplificant #IndianHandicrafts #VocalForLocal #${product.category} #MakeInIndia #Handmade`,
      )
    } else if (valuation) {
      setCustomTitle(valuation.craftName)
      setCustomPrice(valuation.estimatedFairPrice)
      setCustomDescription(
        valuation.aiAnalysisNotes ||
          `Authentic ${valuation.craftName} evaluated by MoSJE GI Guild.`,
      )
      setCustomHighlights(
        valuation.featuresDetected.join(" • ") ||
          "Ancestral Technique • Master GI Grade",
      )
      setCustomHashtags(
        `#Simplificant #GIHandicrafts #${valuation.category} #FairPrice #MoSJE`,
      )
    }
  }, [product, valuation, selectedLanguage, isOpen])

  if (!isOpen || (!product && !valuation)) return null

  const artisanName =
    product?.artisan || valuation?.lineageGI || "Master Indian Craftsman"
  const location = product
    ? product.location[selectedLanguage] || product.location.en
    : valuation?.region || "India"
  const category = product?.category || valuation?.category || "Handicraft"
  const img =
    product?.image ||
    imageUrl ||
    "https://images.unsplash.com/photo-1699371830139-cb02e94878f1?w=700&h=700&fit=crop"
  const shareUrl = `${window.location.origin}${
    product ? `#craft-${product.id}` : ""
  }`

  // Assembled Promotional Message
  const fullPromoText = `🎨 Handcrafted Heritage on SIMPLIFICANT (MoSJE Digital Marketplace):

*${customTitle}*
🏷️ Direct Artisan Price: ${fmt(customPrice)} (100% Direct to Maker)
📍 Origin: ${location} | By: ${artisanName}
✨ Highlights: ${customHighlights}

"${customDescription}"

🔗 Buy & Support Indigenous Artisans:
${shareUrl}

${customHashtags}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    showToast("🔗 Product link copied to clipboard!")
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullPromoText)
    setCopiedCaption(true)
    showToast("📋 Promotional text & hashtags copied!")
    setTimeout(() => setCopiedCaption(false), 2500)
  }

  // 1. WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(fullPromoText)
    window.open(`https://wa.me/?text=${encoded}`, "_blank")
    showToast("💬 Opening WhatsApp to share!")
  }

  // 2. Telegram
  const handleShareTelegram = () => {
    const encodedText = encodeURIComponent(fullPromoText)
    const encodedUrl = encodeURIComponent(shareUrl)
    window.open(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      "_blank",
    )
    showToast("✈️ Opening Telegram to share!")
  }

  // 3. Facebook
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullPromoText)}`
    window.open(fbUrl, "_blank", "width=600,height=500")
    showToast("📘 Opening Facebook share dialog!")
  }

  // 4. Instagram / Copy Helper
  const handleShareInstagram = () => {
    navigator.clipboard.writeText(fullPromoText)
    setCopiedCaption(true)
    showToast(
      "📸 Instagram caption copied! Ready to paste into your Instagram post or story.",
    )
    setTimeout(() => setCopiedCaption(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140F0B]/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl border border-[#E0D5C1] shadow-2xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-9 h-9 rounded-full bg-white border border-[#E4DAC8] flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F] bg-[#B7592F]/10 px-2.5 py-0.5 rounded-full border border-[#B7592F]/20">
              Social Media Studio
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Editable Multi-Platform Sharing
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#241C15]">
            Share Handcrafted Heritage
          </h2>
          <p className="text-xs text-[#6B6255]">
            Edit promotional content below and preview before sharing to
            WhatsApp, Telegram, Instagram, or Facebook.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-[#EFE8D8] p-1.5 rounded-2xl text-xs font-semibold">
          {[
            { id: "whatsapp", label: "WhatsApp", icon: "💬" },
            { id: "telegram", label: "Telegram", icon: "✈️" },
            { id: "instagram", label: "Instagram", icon: "📸" },
            { id: "facebook", label: "Facebook", icon: "📘" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id as any)}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === p.id
                  ? "bg-white text-[#241C15] shadow-xs font-bold"
                  : "text-[#6B6255] hover:text-[#241C15]"
              }`}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Editable Promotional Editor & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Editor Inputs */}
          <div className="space-y-3 text-xs bg-white p-4 rounded-2xl border border-[#E4DAC8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
              Edit Before Sharing
            </span>

            <div>
              <label className="block font-bold text-[#241C15] mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#241C15] font-semibold outline-none focus:border-[#C9922E]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#241C15] mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#241C15] font-bold font-serif outline-none focus:border-[#C9922E]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#241C15] mb-1">
                Highlights
              </label>
              <input
                type="text"
                value={customHighlights}
                onChange={(e) => setCustomHighlights(e.target.value)}
                placeholder="Key craft highlights"
                className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#241C15] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#241C15] outline-none focus:border-[#C9922E] resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#241C15] mb-1">
                Hashtags
              </label>
              <input
                type="text"
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
                className="w-full rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#241C15] font-mono outline-none focus:border-[#C9922E]"
              />
            </div>
          </div>

          {/* Right: Live Share Preview Card */}
          <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E4DAC8] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B7592F]">
                  Post Live Preview ({activePlatform.toUpperCase()})
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Ready to Share
                </span>
              </div>

              {/* Mock Social Card */}
              <div className="bg-white rounded-2xl border border-[#E4DAC8] overflow-hidden shadow-xs space-y-2.5 p-3 text-xs">
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-black/5">
                  <img
                    src={img}
                    alt={customTitle}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-[#241C15]/80 text-[#F7F2E9] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {category}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold font-serif text-[#241C15] text-sm leading-snug">
                    {customTitle}
                  </h4>
                  <p className="text-[#C9922E] font-bold font-serif text-base mt-0.5">
                    {fmt(customPrice)}
                  </p>
                </div>

                <p className="text-[11px] text-[#6B6255] line-clamp-3 leading-relaxed">
                  {customDescription}
                </p>

                <div className="text-[10px] text-[#8C7E6D] font-mono line-clamp-1 border-t border-[#E4DAC8] pt-1.5">
                  {customHashtags}
                </div>
              </div>
            </div>

            {/* Quick Action Button for Active Platform */}
            <div className="pt-2 space-y-2">
              {activePlatform === "whatsapp" && (
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Confirm & Share to WhatsApp</span>
                </button>
              )}

              {activePlatform === "telegram" && (
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✈️</span>
                  <span>Confirm & Share to Telegram</span>
                </button>
              )}

              {activePlatform === "facebook" && (
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📘</span>
                  <span>Confirm & Share to Facebook</span>
                </button>
              )}

              {activePlatform === "instagram" && (
                <button
                  type="button"
                  onClick={handleShareInstagram}
                  className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📸</span>
                  <span>Copy Caption & Open Instagram</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="flex-1 bg-white hover:bg-[#FAF7F2] border border-[#E4DAC8] text-[#241C15] font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {copiedCaption ? "✓ Text Copied!" : "📋 Copy Full Text"}
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 bg-white hover:bg-[#FAF7F2] border border-[#E4DAC8] text-[#241C15] font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {copiedLink ? "✓ Link Copied!" : "🔗 Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
