import React, { useState, useRef } from "react"
import { Product, CraftCategory, LanguageCode } from "../types"
import { makeSimpleLoc } from "../utils/mockData"

interface AddCraftOrMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLanguage: LanguageCode
  onProductPublished: (product: Product) => void
  showToast: (msg: string) => void
}

interface HandmadeCraftPreset {
  name: string
  category: CraftCategory
  technique: string
  price: number
  b2b_price: number
  stockQuantity: number
  artisan: string
  location: string
  image: string
  description: string
  materials: string[]
  dimensions: string
  laborHours: number
}

const CURATED_HANDMADE_PRESETS: HandmadeCraftPreset[] = [
  {
    name: "Kashmir Hand-Spun Pashmina Embroidered Shawl",
    category: "Textile",
    technique: "Handloom Weaving & Hand Sozni Needlework",
    price: 9800,
    b2b_price: 7200,
    stockQuantity: 10,
    artisan: "Ghulam Hassan & Family Weavers",
    location: "Old Srinagar GI Cluster, Jammu & Kashmir",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop&auto=format",
    description:
      "Handcrafted from genuine Changthangi goat underfleece. Spun on traditional wooden Charkha and delicately embroidered with botanical needlework.",
    materials: [
      "100% Pure Ladakhi Pashmina Wool",
      "Organic Silk Embroidery Floss",
    ],
    dimensions: "200 cm x 100 cm (Full Stole)",
    laborHours: 120,
  },
  {
    name: "Bastar Dokra Lost-Wax Bell Metal Elephant Figurine",
    category: "Metalcraft",
    technique: "Cire Perdue Lost-Wax Bell Metal Casting",
    price: 2450,
    b2b_price: 1750,
    stockQuantity: 18,
    artisan: "Budhram Ghadwa",
    location: "Kondagaon Tribal GI Cluster, Bastar, Chhattisgarh",
    image:
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format",
    description:
      "Sculpted with forest beeswax wires over alluvial clay core and molten bell-metal alloy. 4,000-year-old unbroken tribal bronze metallurgy tradition.",
    materials: ["Recycled Brass Alloy", "Forest Beeswax", "Riverbed Clay"],
    dimensions: '8" H x 6" L x 4" W (Weight: 1.4 kg)',
    laborHours: 24,
  },
  {
    name: "Jaipur Hand-Turned Cobalt Floral Blue Pottery Vase",
    category: "Pottery",
    technique: "Non-Clay Quartz Dough Hand Molding & Brush Glazing",
    price: 1250,
    b2b_price: 890,
    stockQuantity: 24,
    artisan: "Mohan Lal Kumhar",
    location: "Sanganer GI Craft Guild, Jaipur, Rajasthan",
    image:
      "https://images.unsplash.com/photo-1699371830139-cb02e94878f1?w=800&h=800&fit=crop&auto=format",
    description:
      "Crafted without ordinary clay using crushed quartz stone and copper minerals. Hand-brushed with vivid cobalt blue motifs and kiln fired at 850°C.",
    materials: [
      "Natural Quartz Powder",
      "Katira Resin Gum",
      "Cobalt Oxide Minerals",
    ],
    dimensions: '10" Height x 4.5" Rim Diameter',
    laborHours: 16,
  },
  {
    name: "Thanjavur 22K Gold Foil Sacred Temple Painting",
    category: "Painting",
    technique: "Embossed Gesso Work & 22-Karat Gold Leaf Inlay",
    price: 12500,
    b2b_price: 9400,
    stockQuantity: 6,
    artisan: "K. Ranganathan Master Craftsman",
    location: "Thanjavur Heritage Guild, Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=800&fit=crop&auto=format",
    description:
      "Traditional South Indian temple artwork mounted on water-resistant teakwood board. Features sculpted limestone gesso relief adorned with pure 22K gold leaves and Jaipur glass gemstones.",
    materials: [
      "22-Karat Pure Gold Foil",
      "Seasoned Teakwood Board",
      "Jaipur Cut Gemstones",
    ],
    dimensions: '18" x 14" Framed Relief Panel',
    laborHours: 90,
  },
  {
    name: "Saharanpur Hand-Carved Sheesham Floral Wall Mirror",
    category: "Woodwork",
    technique: "Jali Openwork Piercing & Hand Gouge Chiseling",
    price: 3600,
    b2b_price: 2650,
    stockQuantity: 14,
    artisan: "Mohammad Irfan Chishti",
    location: "Saharanpur Wood Carving Hub, Uttar Pradesh",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop&auto=format",
    description:
      "Solid plantation Sheesham rosewood frame chiseled with intricate Mughal lattice filigree and finished with natural beeswax nourishment polish.",
    materials: ["Sustainable Sheesham Rosewood", "Natural Beeswax Polish"],
    dimensions: '24" x 16" Architectural Arch Mirror',
    laborHours: 32,
  },
  {
    name: "Patan Patola Double-Ikat Pure Silk Saree",
    category: "Textile",
    technique: "Geometric Resist-Dyeing & Double-Ikat Hand Weave",
    price: 24000,
    b2b_price: 18500,
    stockQuantity: 4,
    artisan: "Salvi Brothers Master Weavers",
    location: "Patan Heritage Guild, Gujarat",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop&auto=format",
    description:
      "Legendary double-ikat pure mulberry silk weave where warp and weft are tie-dyed in exact mathematical symmetry prior to handloom weaving.",
    materials: ["Silk Mark Certified Mulberry Silk", "Herbal Vegetable Dyes"],
    dimensions: "6.3 Meters (Including Blouse Piece)",
    laborHours: 320,
  },
  {
    name: "Bidriware Pure Silver Inlay Decanter Flask",
    category: "Metalcraft",
    technique: "Zinc-Copper Alloy Etching & Silver Wire Inlay",
    price: 4900,
    b2b_price: 3700,
    stockQuantity: 12,
    artisan: "Rasheed Ahmed Qadri",
    location: "Bidar GI Cluster, Karnataka",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=800&fit=crop&auto=format",
    description:
      "Pure silver wires embedded into blackened zinc-copper alloy vessel, treated with historic Bidar fort clay to yield permanent jet-black contrast.",
    materials: ["99.9% Pure Silver Wire", "Zinc-Copper Alloy Metal"],
    dimensions: '11" Height x 5" Base (Weight: 850g)',
    laborHours: 40,
  },
  {
    name: "Channapatna Organic Lacquer Wooden Toy Stacker",
    category: "Woodwork",
    technique: "Lathe Wood Turning & Natural Shellac Polish",
    price: 780,
    b2b_price: 540,
    stockQuantity: 45,
    artisan: "Nagaraju Channapatna Guild",
    location: "Channapatna Craft Town, Karnataka",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop&auto=format",
    description:
      "Child-safe wooden sensory stacker turned on traditional lathes from ivory wood (Hale mara) and coated with edible vegetable dyes and natural tree shellac.",
    materials: [
      "Wrightia Tinctoria Ivory Wood",
      "Turmeric & Kumkum Vegetable Dyes",
      "Natural Shellac",
    ],
    dimensions: '8" Height x 3.5" Diameter Base',
    laborHours: 8,
  },
]

export default function AddCraftOrMaterialModal({
  isOpen,
  onClose,
  selectedLanguage,
  onProductPublished,
  showToast,
}: AddCraftOrMaterialModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form Fields - strictly handmade crafts
  const [title, setTitle] = useState(
    "Jaipur Hand-Turned Cobalt Floral Blue Pottery Vase",
  )
  const [category, setCategory] = useState<CraftCategory>("Pottery")
  const [craftTechnique, setCraftTechnique] = useState(
    "Non-Clay Quartz Dough Hand Molding & Brush Glazing",
  )
  const [price, setPrice] = useState<number>(1250)
  const [b2bPrice, setB2bPrice] = useState<number>(890)
  const [stockQuantity, setStockQuantity] = useState<number>(20)
  const [artisanName, setArtisanName] = useState("Mohan Lal Kumhar")
  const [location, setLocation] = useState(
    "Sanganer GI Craft Guild, Jaipur, Rajasthan",
  )
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1699371830139-cb02e94878f1?w=800&h=800&fit=crop&auto=format",
  )
  const [description, setDescription] = useState(
    "Crafted without ordinary clay using crushed quartz stone and copper minerals. Hand-brushed with vivid cobalt blue motifs and kiln fired at 850°C.",
  )
  const [materialsList, setMaterialsList] = useState<string>(
    "Natural Quartz Powder, Katira Resin Gum, Cobalt Minerals",
  )
  const [dimensions, setDimensions] = useState('10" Height x 4.5" Rim Diameter')
  const [isGiTagged, setIsGiTagged] = useState(true)
  const [laborHours, setLaborHours] = useState<number>(16)
  const [hourlyWage, setHourlyWage] = useState<number>(140)

  // Image Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  if (!isOpen) return null

  // Handle Preset Selection
  const handleApplyPreset = (preset: HandmadeCraftPreset) => {
    setTitle(preset.name)
    setCategory(preset.category)
    setCraftTechnique(preset.technique)
    setPrice(preset.price)
    setB2bPrice(preset.b2b_price)
    setStockQuantity(preset.stockQuantity)
    setArtisanName(preset.artisan)
    setLocation(preset.location)
    setImageUrl(preset.image)
    setDescription(preset.description)
    setMaterialsList(preset.materials.join(", "))
    setDimensions(preset.dimensions)
    setLaborHours(preset.laborHours)
    showToast(`✓ Applied handmade craft preset: "${preset.name}"`)
  }

  // Handle Local File Upload (FileReader Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be under 5 MB.")
      return
    }

    setIsUploadingImage(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setImageUrl(dataUrl)
        showToast("✓ Authentic craft photo uploaded successfully!")
      }
      setIsUploadingImage(false)
    }
    reader.onerror = () => {
      showToast("Error reading image file.")
      setIsUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast("Please enter a craft title.")
      return
    }
    if (!imageUrl.trim()) {
      showToast("Please provide an authentic photograph of the craft.")
      return
    }

    const newProduct: Product = {
      id: Date.now(),
      artisan_id: 101,
      name: makeSimpleLoc(title.trim()),
      artisan: artisanName.trim() || "Master Artisan",
      location: makeSimpleLoc(location.trim() || "Heritage Cluster, India"),
      price: Math.max(10, Number(price) || 500),
      b2b_price: Math.max(
        10,
        Number(b2bPrice) || Math.round(Number(price) * 0.75),
      ),
      raw_material_cost: Math.round(Number(price) * 0.3),
      labor_hours: Math.max(1, Number(laborHours) || 8),
      hourly_wage: Math.max(50, Number(hourlyWage) || 140),
      rating: 5.0,
      reviews: 1,
      category: category,
      image: imageUrl.trim(),
      description: makeSimpleLoc(description.trim()),
      materials: materialsList
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      dimensions: dimensions.trim() || "Handmade specifications",
      stockQuantity: Math.max(1, Number(stockQuantity) || 10),
      gi_tagged: isGiTagged,
      isMaterial: false, // STRICTLY HANDMADE CRAFTS ONLY
      tags: [
        category,
        "Handmade",
        "Certified Artisan",
        isGiTagged ? "GI Tagged" : "Heritage",
      ],
      authenticityCertificateId: `GI-MOSJE-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    onProductPublished(newProduct)
    showToast(`✓ Published "${title}" to the handmade crafts marketplace!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241C15]/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#E4DAC8] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#241C15] text-[#F7F2E9] p-6 relative border-b border-[#3A2C20]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#8C7E6D] hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#C9922E] text-[#241C15] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              100% Certified Handmade
            </span>
            <span className="text-xs text-[#E4DAC8]/80 font-medium">
              Direct Benefit Transfer (DBT) Protected
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#F7F2E9]">
            Add Authentic Handmade Craft
          </h2>
          <p className="text-xs text-[#E4DAC8]/70 mt-0.5">
            Publish an authentic handcrafted piece made by traditional Indian
            artisans, weavers, and craft guilds.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
        >
          {/* Quick-Fill 1-Click Curated Presets */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#241C15] flex items-center gap-1.5">
                <span>⚡</span>
                <span>1-Click Curated Heritage Craft Presets:</span>
              </span>
              <span className="text-[10px] text-[#8C7E6D]">
                Auto-fills HD image, pricing & materials
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CURATED_HANDMADE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1 hover:border-[#C9922E]"
                >
                  <span>
                    {preset.category === "Textile"
                      ? "🧵"
                      : preset.category === "Pottery"
                        ? "🏺"
                        : preset.category === "Woodwork"
                          ? "🪵"
                          : preset.category === "Metalcraft"
                            ? "⚔️"
                            : "🎨"}
                  </span>
                  <span>{preset.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-[#8C7E6D]">
                    ₹{preset.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Craft Basic Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B7592F] border-b border-[#E4DAC8] pb-1">
              1. Craft Description & Heritage Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Handmade Craft Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kashmir Pashmina Shawl or Bastar Dokra Figurine"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Craft Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CraftCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-white text-xs text-[#241C15] outline-none focus:border-[#C9922E] font-bold"
                >
                  <option value="Pottery">🏺 Pottery & Ceramics</option>
                  <option value="Textile">🧵 Handloom Textiles & Weaves</option>
                  <option value="Woodwork">🪵 Carved Wood & Lacquerware</option>
                  <option value="Metalcraft">⚔️ Tribal & Bell Metalcraft</option>
                  <option value="Painting">🎨 Heritage Temple Paintings</option>
                  <option value="Stonework">🏛️ Marble Inlay & Stonework</option>
                  <option value="Leathercraft">👞 Handcrafted Leather</option>
                  <option value="Jewelry">💍 Silver Filigree & Jewelry</option>
                  <option value="Bamboo">🎋 Bamboo & Cane Weave</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241C15] mb-1">
                Authentic Craft Technique / Method *
              </label>
              <input
                type="text"
                value={craftTechnique}
                onChange={(e) => setCraftTechnique(e.target.value)}
                placeholder="e.g. Lost-Wax Bell Metal Casting, Handloom Double-Ikat Weave"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241C15] mb-1">
                Detailed Handcraft Story & Artisan Technique
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Describe how this piece is created by hand..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
              />
            </div>
          </div>

          {/* Section 2: Image Proper (Upload & Live Preview) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B7592F] border-b border-[#E4DAC8] pb-1 flex items-center justify-between">
              <span>2. Authentic Craft Photograph (Proper HD Image)</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Live Preview Enabled
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Image Preview Box */}
              <div className="relative aspect-square sm:aspect-4/3 rounded-2xl border-2 border-dashed border-[#C9922E]/40 overflow-hidden bg-[#FAF7F2] flex items-center justify-center group shadow-xs">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={title || "Craft Preview"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-[#241C15]/80 text-white text-[9.5px] px-2 py-0.5 rounded-full font-bold backdrop-blur-xs">
                      100% Handmade
                    </div>
                    {isGiTagged && (
                      <div className="absolute bottom-2 right-2 bg-[#C9922E] text-[#241C15] text-[9.5px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                        ✓ GI Tagged
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl block">🖼️</span>
                    <span className="text-xs text-[#8C7E6D]">
                      Upload or enter photo URL
                    </span>
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#241C15] mb-1">
                    Upload Photograph from Your Device
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#C9922E] bg-[#C9922E]/10 hover:bg-[#C9922E]/20 text-[#241C15] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>📁</span>
                      <span>
                        {isUploadingImage
                          ? "Uploading Craft Photo..."
                          : "Choose Image File from Computer"}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8C7E6D] mt-1">
                    Accepts PNG, JPG, JPEG or WebP up to 5 MB.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241C15] mb-1">
                    Or Direct Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E] font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Artisan & Cluster GI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B7592F] border-b border-[#E4DAC8] pb-1">
              3. Artisan Master & Geographical Origin
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Master Artisan / Weaver Name *
                </label>
                <input
                  type="text"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder="e.g. Mohan Lal Kumhar"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Heritage Craft Cluster / City *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sanganer GI Guild, Jaipur, Rajasthan"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <input
                type="checkbox"
                id="gi-toggle"
                checked={isGiTagged}
                onChange={(e) => setIsGiTagged(e.target.checked)}
                className="w-4 h-4 text-[#C9922E] rounded cursor-pointer"
              />
              <label
                htmlFor="gi-toggle"
                className="text-xs text-[#241C15] font-medium cursor-pointer"
              >
                <strong>
                  Government Geographical Indication (GI) Certified
                </strong>{" "}
                - This craft holds an authentic GI tag recognized by the
                Government of India.
              </label>
            </div>
          </div>

          {/* Section 4: Fair Pricing, Inventory & Labor Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B7592F] border-b border-[#E4DAC8] pb-1">
              4. Fair Transparent Pricing & Artisan Labor
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Retail Price (₹) *
                </label>
                <input
                  type="number"
                  min="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] font-bold font-mono outline-none focus:border-[#C9922E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  B2B / GeM Bulk (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  value={b2bPrice}
                  onChange={(e) => setB2bPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] font-mono outline-none focus:border-[#C9922E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Handmade Pieces (Stock)
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] font-mono outline-none focus:border-[#C9922E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Human Labor (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={laborHours}
                  onChange={(e) => setLaborHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] font-mono outline-none focus:border-[#C9922E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Natural Materials Used
                </label>
                <input
                  type="text"
                  value={materialsList}
                  onChange={(e) => setMaterialsList(e.target.value)}
                  placeholder="e.g. Pure Mulberry Silk, Natural Indigo Dyes"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241C15] mb-1">
                  Product Dimensions / Weight
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder='e.g. 10" Height x 4.5" Diameter'
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[#E4DAC8] pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E4DAC8] text-[#241C15] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>Publish Certified Handmade Craft</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
