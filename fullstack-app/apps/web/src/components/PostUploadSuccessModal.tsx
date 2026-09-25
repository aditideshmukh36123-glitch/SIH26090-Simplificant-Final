import { useState } from "react"
import { Product, LanguageCode } from "../types"

interface PostUploadSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  selectedLanguage: LanguageCode
  onViewInStorefront: () => void
  onAddAnother: () => void
  showToast: (msg: string) => void
}

export default function PostUploadSuccessModal({
  isOpen,
  onClose,
  product,
  selectedLanguage,
  onViewInStorefront,
  onAddAnother,
  showToast,
}: PostUploadSuccessModalProps) {
  const [activeTab, setActiveTab] = useState<"certificate" | "share" | "slip">(
    "certificate",
  )
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isOpen || !product) return null

  const pName = product.name[selectedLanguage] || product.name.en
  const pLoc = product.location[selectedLanguage] || product.location.en
  const fmt = (n?: number) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`
  const certId =
    product.batch_id || `MOSJE-GI-${product.id}-${new Date().getFullYear()}`

  const productUrl = `${window.location.origin}#craft-${product.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl)
    setCopiedLink(true)
    showToast("🔗 Product storefront link copied!")
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      ` Namaste! I have published my authentic handcrafted piece on SIMPLIFICANT (MoSJE Digital Samagam):

*${pName}*
 Artisanal Direct Price: ${fmt(product.price)}
 Location: ${pLoc}
 GI Tagged: ${
   product.gi_tagged ? "Yes (Certified Authenticity)" : "Traditional Craft"
 }

Explore & Buy directly with 100% payout to artisan:
${productUrl}`,
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
    showToast("💬 Opening WhatsApp to share listing!")
  }

  const handlePrintSlip = () => {
    window.print()
    showToast("🖨️ Printing GI provenance tag & dispatch slip...")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#241C15]/85 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E4DAC8] p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9C9182] hover:text-[#241C15] font-bold text-sm w-8 h-8 rounded-full bg-[#FBF8F1] hover:bg-[#EFE8D8] flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 text-3xl shadow-sm animate-bounce">
            🎉
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F] bg-[#B7592F]/10 px-3 py-0.5 rounded-full">
              Digital Storefront Listing Active
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#241C15] mt-1">
              Craft Successfully Published!
            </h3>
            <p className="text-xs text-[#6B6255] max-w-md mx-auto">
              Your handcrafted masterpiece is now live in the national catalog
              with instant 100% direct bank payout enablement.
            </p>
          </div>
        </div>

        {/* Live Product Card Snapshot */}
        <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DAC8] flex gap-4 items-center">
          <img
            src={product.image}
            alt={pName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#E4DAC8] shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#241C15] text-[#F7F2E9] text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.gi_tagged && (
                <span className="bg-[#C9922E] text-[#241C15] text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                  ✓ GI Tagged
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold font-serif text-[#241C15] truncate">
              {pName}
            </h4>
            <p className="text-xs text-[#6B6255] truncate">
              By <strong className="text-[#241C15]">{product.artisan}</strong> •{" "}
              {pLoc}
            </p>
            <div className="flex items-baseline gap-3 pt-0.5">
              <span className="text-base font-bold font-serif text-[#241C15]">
                {fmt(product.price)}
              </span>
              {product.b2b_price && (
                <span className="text-xs text-[#35415E] font-semibold">
                  Bulk: {fmt(product.b2b_price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post-Upload Convenient Action Tabs */}
        <div className="space-y-3">
          <div className="flex border-b border-[#E4DAC8] text-xs font-semibold">
            <button
              onClick={() => setActiveTab("certificate")}
              className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === "certificate"
                  ? "border-[#C9922E] text-[#241C15] font-bold"
                  : "border-transparent text-[#9C9182] hover:text-[#241C15]"
              }`}
            >
              📜 GI Provenance Certificate
            </button>
            <button
              onClick={() => setActiveTab("share")}
              className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === "share"
                  ? "border-[#C9922E] text-[#241C15] font-bold"
                  : "border-transparent text-[#9C9182] hover:text-[#241C15]"
              }`}
            >
              💬 WhatsApp & Social Share
            </button>
            <button
              onClick={() => setActiveTab("slip")}
              className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === "slip"
                  ? "border-[#C9922E] text-[#241C15] font-bold"
                  : "border-transparent text-[#9C9182] hover:text-[#241C15]"
              }`}
            >
              🏷️ Packing Tag & GeM Slip
            </button>
          </div>

          {/* TAB 1: Certificate & QR */}
          {activeTab === "certificate" && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-white border border-[#C9922E]/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Visual QR Code Representation */}
                <div className="p-3 bg-white rounded-2xl border border-[#E4DAC8] shadow-xs text-center shrink-0">
                  <div className="w-24 h-24 bg-[#241C15] p-2 rounded-xl flex items-center justify-center text-white">
                    {/* Simulated Clean SVG QR Grid */}
                    <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-white rounded-lg">
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-white" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-white" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-white" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-white" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-[#241C15] rounded-xs" />
                      <div className="bg-white" />
                      <div className="bg-[#241C15] rounded-xs" />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#9C9182] block mt-1">
                    SCAN PROVENANCE
                  </span>
                </div>

                {/* Certificate Details */}
                <div className="text-xs space-y-1 text-[#241C15] min-w-0">
                  <span className="text-[10px] font-mono font-bold text-[#C9922E] uppercase">
                    Certificate ID: {certId}
                  </span>
                  <h5 className="font-bold font-serif text-sm">
                    Ministry of Social Justice & Empowerment Registry
                  </h5>
                  <p className="text-[#6B6255] text-[11px] leading-relaxed">
                    Certified authentic under National Beneficiary
                    Micro-Enterprise Framework. Direct banking registry
                    verified.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handlePrintSlip}
                      className="bg-[#241C15] text-[#F7F2E9] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#3A2C20] cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>🖨️ Print Box Certificate</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="bg-white border border-[#E4DAC8] text-[#241C15] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FBF8F1] cursor-pointer"
                    >
                      {copiedLink ? "✓ Link Copied!" : "📋 Copy URL"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WhatsApp & Social Share */}
          {activeTab === "share" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E4DAC8] space-y-3 text-xs">
              <p className="text-[#6B6255]">
                Share your new craft directly with customers, family, or trade
                buyer groups on WhatsApp with pre-filled product details:
              </p>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-mono text-[11px] space-y-1">
                <p className="font-bold font-sans">Preview WhatsApp Message:</p>
                <p className="italic">
                  "🎨 Namaste! Check out my authentic {pName} at{" "}
                  {fmt(product.price)} on Simplificant..."
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>💬 Share on WhatsApp</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#FBF8F1] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {copiedLink ? "✓ Copied" : "📋 Copy Link"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GeM Slip & Box Tag */}
          {activeTab === "slip" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E4DAC8] space-y-3 text-xs">
              <div className="p-3 bg-[#FBF8F1] rounded-xl border border-[#E4DAC8] font-mono text-[11px] space-y-1">
                <div className="flex justify-between border-b border-[#E4DAC8] pb-1">
                  <span>ITEM CODE: IN-{product.id}</span>
                  <span>CATEGORY: {product.category.toUpperCase()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>DISPATCH CLUSTER: {pLoc}</span>
                  <span>VALUATION: {fmt(product.price)}</span>
                </div>
              </div>

              <button
                onClick={handlePrintSlip}
                className="w-full bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>🖨️ Print Dispatch Shipping Label & GeM Barcode</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#E4DAC8]">
          <button
            onClick={() => {
              onClose()
              onViewInStorefront()
            }}
            className="w-full bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🛍️ View on Live Storefront</span>
            <span>→</span>
          </button>

          <button
            onClick={() => {
              onClose()
              onAddAnother()
            }}
            className="w-full bg-[#FBF8F1] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📸 + Add Another Craft</span>
          </button>
        </div>
      </div>
    </div>
  )
}
