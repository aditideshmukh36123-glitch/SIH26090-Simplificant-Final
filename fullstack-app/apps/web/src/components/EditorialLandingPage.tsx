import React, { useState } from "react"
import { Product, LanguageCode, Role, User } from "../types"
import { LANGUAGES } from "../utils/translations"

interface EditorialLandingPageProps {
  products: Product[]
  selectedLanguage: LanguageCode
  onSelectLanguage: (lang: LanguageCode) => void
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
  onEnterAsBuyer: () => void
  onEnterAsArtist: () => void
  onOpenSearch: () => void
  onOpenCart: () => void
  onOpenLogin: () => void
  onOpenBuyerLogin?: () => void
  onOpenArtistLogin?: () => void
  onOpenWishlist?: () => void
  cartCount: number
  wishlistCount: number
  currentUser: User
  isLoggedIn?: boolean
  onLogout?: () => void
  onSwitchRole: (role: Role) => void
  onPerformSearchQuery?: (query: string) => void
}

export default function EditorialLandingPage({
  products,
  selectedLanguage,
  onSelectLanguage,
  onSelectProduct,
  onAddToCart,
  onEnterAsBuyer,
  onEnterAsArtist,
  onOpenSearch,
  onOpenCart,
  onOpenLogin,
  onOpenBuyerLogin,
  onOpenArtistLogin,
  onOpenWishlist,
  cartCount,
  wishlistCount,
  currentUser,
  isLoggedIn,
  onLogout,
  onSwitchRole,
  onPerformSearchQuery,
}: EditorialLandingPageProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleBuyerLoginClick = () => {
    if (onOpenBuyerLogin) {
      onOpenBuyerLogin()
    } else {
      onOpenLogin()
    }
  }

  const handleArtistLoginClick = () => {
    if (onOpenArtistLogin) {
      onOpenArtistLogin()
    } else {
      onEnterAsArtist()
    }
  }

  // Select 6 distinctive authentic crafts for the discovery grid
  const featuredCrafts = React.useMemo(() => {
    if (!products || products.length === 0) return []
    // Pick diverse categories: Pottery, Textile, Woodwork, Metalwork, etc.
    const uniqueByCat: Product[] = []
    const seenCat = new Set<string>()
    for (const p of products) {
      if (!p.isMaterial && !seenCat.has(p.category) && uniqueByCat.length < 6) {
        seenCat.add(p.category)
        uniqueByCat.push(p)
      }
    }
    // Fill remaining up to 6 if needed
    for (const p of products) {
      if (uniqueByCat.length >= 6) break
      if (!p.isMaterial && !uniqueByCat.some((item) => item.id === p.id)) {
        uniqueByCat.push(p)
      }
    }
    return uniqueByCat.length > 0 ? uniqueByCat : products.slice(0, 6)
  }, [products])

  // Filtered crafts in search overlay
  const searchResults = React.useMemo(() => {
    if (!searchInput.trim()) return []
    const q = searchInput.toLowerCase()
    return products
      .filter((p) => {
        const enName = p.name.en?.toLowerCase() || ""
        const locName = p.location.en?.toLowerCase() || ""
        const artisan = p.artisan?.toLowerCase() || ""
        const cat = p.category?.toLowerCase() || ""
        return (
          enName.includes(q) ||
          locName.includes(q) ||
          artisan.includes(q) ||
          cat.includes(q)
        )
      })
      .slice(0, 5)
  }, [products, searchInput])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setSearchOverlayOpen(false)
    if (onPerformSearchQuery) {
      onPerformSearchQuery(searchInput.trim())
    } else {
      onEnterAsBuyer()
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241C15] flex flex-col font-sans selection:bg-[#C9922E]/20">
      {/* ─── ELEGANT MINIMAL HEADER ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EFE8D8]/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl sm:text-[26px] tracking-[0.08em] font-semibold text-[#241C15] group-hover:text-[#B7592F] transition-colors">
                SIMPLIFICANT
              </span>
            </button>
          </div>

          {/* Center: Clean Editorial Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-wide text-[#5B5750]">
            <button
              onClick={() => scrollToSection("discover")}
              className="hover:text-[#241C15] transition-colors cursor-pointer"
            >
              Discover
            </button>
            <span className="text-[#DACBB8] text-xs select-none">·</span>
            <button
              onClick={onEnterAsBuyer}
              className="hover:text-[#241C15] transition-colors cursor-pointer"
            >
              Crafts
            </button>
            <span className="text-[#DACBB8] text-xs select-none">·</span>
            <button
              onClick={() => scrollToSection("stories")}
              className="hover:text-[#241C15] transition-colors cursor-pointer"
            >
              Stories
            </button>
          </nav>

          {/* Right: Actions (Search, Wishlist, Bag, Lang, Login Options) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="w-8.5 h-8.5 rounded-full hover:bg-[#F7F2E9] text-[#241C15] flex items-center justify-center transition-colors cursor-pointer"
              title="Search crafts and artisans"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => {
                if (onOpenWishlist) onOpenWishlist()
                else onEnterAsBuyer()
              }}
              className="relative w-8.5 h-8.5 rounded-full hover:bg-[#F7F2E9] text-[#241C15] flex items-center justify-center transition-colors cursor-pointer"
              title="Saved crafts"
              aria-label="Wishlist"
            >
              <svg
                className="w-4 h-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B7592F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Bag / Cart Icon */}
            <button
              onClick={onOpenCart}
              className="relative w-8.5 h-8.5 rounded-full hover:bg-[#F7F2E9] text-[#241C15] flex items-center justify-center transition-colors cursor-pointer"
              title="Shopping bag"
              aria-label="Shopping Bag"
            >
              <svg
                className="w-4 h-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#241C15] text-[#F7F2E9] text-[9.5px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Minimal Trigger */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 py-1 text-[11.5px] font-medium text-[#5B5750] hover:text-[#241C15] rounded-full hover:bg-[#F7F2E9] transition-colors cursor-pointer flex items-center gap-1"
                title="Select language"
              >
                <span>
                  {LANGUAGES.find((l) => l.code === selectedLanguage)?.code.toUpperCase() ||
                    "EN"}
                </span>
                <span className="text-[8px] opacity-60">▾</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4DAC8] rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-0.5">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onSelectLanguage(l.code)
                          setLangDropdownOpen(false)
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                          selectedLanguage === l.code
                            ? "bg-[#FAF7F2] text-[#B7592F] font-bold"
                            : "hover:bg-[#FAF7F2] text-[#5B5750]"
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span className="truncate">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-[#EFE8D8] hidden sm:block mx-0.5" />

            {/* Login Options (Shown for visitors) */}
            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleBuyerLoginClick}
                  className="px-2.5 py-1 text-xs font-medium text-[#5B5750] hover:text-[#241C15] hover:bg-[#F7F2E9] rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Login as Buyer
                </button>

                <button
                  onClick={handleArtistLoginClick}
                  className="px-3 py-1 text-xs font-medium text-[#B7592F] hover:text-[#964724] border border-[#B7592F]/40 hover:border-[#B7592F] bg-[#B7592F]/5 hover:bg-[#B7592F]/10 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Login as Artist
                </button>
              </div>
            ) : (
              /* Profile / M Trigger for Logged In User */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#EFE8D8] hover:bg-[#E4DAC8] text-[#241C15] flex items-center justify-center text-xs font-serif font-bold transition-all cursor-pointer border border-[#E4DAC8] hover:scale-105"
                  title={`${currentUser?.name || "Account"} (${currentUser?.role || "buyer"})`}
                  aria-label="Account"
                >
                  {currentUser?.name?.charAt(0) || "M"}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] transition-opacity"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#FDFBF7] border border-[#E4DAC8] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 text-xs">
                      <div className="pb-2 border-b border-[#EFE8D8]">
                        <p className="font-serif text-sm font-medium text-[#241C15] truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-[#8C7E6D] uppercase tracking-wider">
                          Signed in as {currentUser.role}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          if (currentUser.role === "artisan") onEnterAsArtist()
                          else onEnterAsBuyer()
                        }}
                        className="w-full text-left py-1 text-[#241C15] hover:text-[#B7592F] font-medium transition-colors cursor-pointer"
                      >
                        {currentUser.role === "artisan" ? "Enter Studio →" : "View My Orders & Bag →"}
                      </button>

                      <div className="pt-2 border-t border-[#EFE8D8] flex items-center justify-between">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            onOpenLogin()
                          }}
                          className="text-[#5B5750] hover:text-[#241C15] transition-colors cursor-pointer"
                        >
                          Switch Identity
                        </button>
                        {onLogout && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false)
                              onLogout()
                            }}
                            className="text-[#B7592F] hover:text-[#964724] font-medium transition-colors cursor-pointer"
                          >
                            Sign Out
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8.5 h-8.5 rounded-full hover:bg-[#F7F2E9] text-[#241C15] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EFE8D8] bg-[#FDFBF7] px-6 py-5 space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  scrollToSection("discover")
                }}
                className="block w-full text-left py-1.5 text-sm font-medium text-[#241C15]"
              >
                Discover
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onEnterAsBuyer()
                }}
                className="block w-full text-left py-1.5 text-sm font-medium text-[#241C15]"
              >
                Crafts
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  scrollToSection("stories")
                }}
                className="block w-full text-left py-1.5 text-sm font-medium text-[#241C15]"
              >
                Stories
              </button>
            </div>

            {/* Mobile Login Actions */}
            <div className="pt-3 border-t border-[#EFE8D8] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleBuyerLoginClick()
                }}
                className="w-full text-center py-2.5 rounded-full text-xs font-medium text-[#241C15] bg-[#FAF7F2] border border-[#E4DAC8]"
              >
                Login as Buyer
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleArtistLoginClick()
                }}
                className="w-full text-center py-2.5 rounded-full text-xs font-medium text-[#B7592F] border border-[#B7592F]/40 bg-[#B7592F]/5"
              >
                Login as Artist
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── SEARCH OVERLAY MODAL ──────────────────────────────────────────── */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#241C15]/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-[#FDFBF7] rounded-3xl border border-[#E4DAC8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8D8]">
              <span className="font-serif text-lg font-medium text-[#241C15]">
                Search the Collection
              </span>
              <button
                onClick={() => setSearchOverlayOpen(false)}
                className="w-7 h-7 rounded-full text-[#8C7E6D] hover:text-[#241C15] text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Jaipur pottery, Banarasi silk, woodwork..."
                className="w-full bg-white border border-[#E4DAC8] focus:border-[#B7592F] rounded-2xl px-4 py-3 text-sm text-[#241C15] outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#241C15] text-[#FDFBF7] text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#3A2C20]"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                  Craft Matches
                </span>
                <div className="divide-y divide-[#EFE8D8]">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchOverlayOpen(false)
                        onSelectProduct(item)
                      }}
                      className="py-2.5 flex items-center gap-3 hover:bg-[#F7F2E9] rounded-xl px-2 cursor-pointer transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name.en}
                        className="w-10 h-10 rounded-lg object-cover border border-[#E4DAC8]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#241C15] truncate">
                          {item.name[selectedLanguage] || item.name.en}
                        </p>
                        <p className="text-[10px] text-[#8C7E6D]">
                          {item.artisan} • {item.location.en.split(",")[0]}
                        </p>
                      </div>
                      <span className="text-xs font-serif font-bold text-[#B7592F]">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. HERO SECTION (FULL IMMERSIVE BACKGROUND) ────────────────────── */}
      <section className="relative w-full min-h-[85vh] sm:min-h-[88vh] lg:min-h-[90vh] flex items-center overflow-hidden">
        {/* Immersive Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-[center_right_15%] lg:bg-right transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1600')`,
          }}
          aria-hidden="true"
        />

        {/* Soft Warm Editorial Blending Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/95 via-45% to-transparent sm:via-[#FDFBF7]/90 sm:via-40% sm:to-[#FDFBF7]/20 lg:via-[#FDFBF7]/85 lg:via-35% lg:to-transparent pointer-events-none" />

        {/* Mobile vertical gradient: soft top-to-bottom so text at top is crystal clear and artisan wheel below is visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/95 via-[#FDFBF7]/70 to-[#FDFBF7]/30 sm:hidden pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-7 text-left">
            {/* Small Refined Label */}
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7592F]" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#B7592F] uppercase">
                CRAFTED IN INDIA
              </span>
            </div>

            {/* Main Heading - Upright Editorial Fraunces (NO italics) */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#241C15] font-normal leading-[1.12] tracking-tight">
              Made by hands. <br />
              <span>Found with meaning.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#3A2C20] leading-relaxed max-w-lg font-light">
              Discover crafts shaped by tradition, place and the people who keep
              them alive.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterAsBuyer}
                className="bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] px-7 py-3.5 rounded-full text-sm font-medium tracking-wide shadow-xs hover:shadow transition-all hover:scale-[1.01] cursor-pointer"
              >
                Explore Crafts
              </button>

              <button
                onClick={onEnterAsArtist}
                className="border border-[#241C15]/40 hover:border-[#241C15] bg-[#FDFBF7]/40 hover:bg-[#FDFBF7]/80 backdrop-blur-xs text-[#241C15] px-6 py-3.5 rounded-full text-sm font-medium tracking-wide transition-all cursor-pointer"
              >
                I'm an Artist
              </button>
            </div>

            {/* Discrete Provenance Reassurance */}
            <div className="pt-6 sm:pt-8 border-t border-[#241C15]/10 flex flex-wrap items-center gap-6 text-[12px] text-[#5B5750]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#B7592F]">✦</span>
                <span>Verified GI Heritage Crafts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#B7592F]">✦</span>
                <span>100% Direct Payout to Artisans</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#B7592F]">✦</span>
                <span>Zero Middlemen Markups</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. DISCOVERY SECTION ─────────────────────────────────────────── */}
      <section
        id="discover"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-14">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#B7592F] uppercase block">
              THE COLLECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241C15] font-normal tracking-tight">
              Discover the craft
            </h2>
            <p className="text-sm text-[#6B6255] font-light max-w-lg">
              Every piece is a unique encounter with material, patience, and
              generational technique.
            </p>
          </div>

          <button
            onClick={onEnterAsBuyer}
            className="text-xs font-medium text-[#241C15] hover:text-[#B7592F] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 pb-1"
          >
            <span>View all crafts</span>
            <span>→</span>
          </button>
        </div>

        {/* Editorial E-Commerce Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCrafts.map((product) => {
            const title =
              product.name[selectedLanguage] || product.name.en
            const region =
              product.location[selectedLanguage] || product.location.en
            const desc =
              product.description[selectedLanguage] || product.description.en

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group flex flex-col justify-between bg-[#FDFBF7] rounded-3xl p-4 border border-[#EFE8D8] hover:border-[#E4DAC8] hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F2E9] mb-4">
                    <img
                      src={product.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                      }}
                    />

                    {/* GI Badge */}
                    {product.gi_tagged && (
                      <span className="absolute top-3 left-3 bg-[#FDFBF7]/90 backdrop-blur-xs text-[#241C15] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#E4DAC8]">
                        GI Certified
                      </span>
                    )}

                    {/* Quick Add Overlay on Hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToCart(product)
                        }}
                        className="bg-[#241C15] hover:bg-[#3A2C20] text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md transition-colors"
                        title="Add to shopping bag"
                      >
                        + Bag
                      </button>
                    </div>
                  </div>

                  {/* Craft Info */}
                  <div className="space-y-1.5 px-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#8C7E6D]">
                      {region.split(",")[0]} • {product.category}
                    </p>
                    <h3 className="font-serif text-lg text-[#241C15] font-medium leading-snug group-hover:text-[#B7592F] transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-[#6B6255] font-light line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Price and Artisan */}
                <div className="pt-4 mt-3 border-t border-[#EFE8D8] flex items-center justify-between px-1">
                  <span className="text-[11px] text-[#8C7E6D]">
                    by {product.artisan}
                  </span>
                  <span className="font-serif text-base font-semibold text-[#241C15]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Discovery CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={onEnterAsBuyer}
            className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] px-8 py-3.5 rounded-full text-xs font-medium tracking-wide transition-all shadow-xs cursor-pointer"
          >
            <span>Explore all {products.length} crafts in the catalog</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ─── 5. ARTISAN STORY SECTION ──────────────────────────────────────── */}
      <section
        id="stories"
        className="bg-[#F7F2E9] py-16 sm:py-24 border-t border-[#EFE8D8]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Story Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden bg-[#EFE8D8] shadow-lg border border-[#E4DAC8]">
                <img
                  src="https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1000&auto=format&fit=crop&q=80"
                  alt="Traditional Indian potter at pottery kiln in Rajasthan"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241C15]/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="font-serif text-sm italic text-[#FDFBF7]">
                    "When you touch a blue pottery bowl, you are not touching
                    painted mud. You are touching crushed quartz stone from the
                    Aravalli hills, painted with cobalt that only reveals its true
                    blue inside the woodfire kiln."
                  </p>
                  <p className="text-[11px] text-[#E4DAC8] mt-2 font-medium">
                    — Mohan Lal Kumhar, 5th Generation Blue Pottery Master
                  </p>
                </div>
              </div>
            </div>

            {/* Story Narrative */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7592F]" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#B7592F] uppercase">
                  THE HUMAN SIDE
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#241C15] font-normal leading-tight tracking-tight">
                Behind every craft <br />
                <span className="italic font-light">is a maker.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#5B5750] leading-relaxed font-light">
                Meet the hands, places and traditions behind the pieces you
                discover. In an age of mass-produced sameness, Indian crafts
                embody patience, living memory, and a sacred relationship with
                clay, wood, yarn, and metal.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E4DAC8]">
                  <p className="text-xl font-serif font-bold text-[#B7592F]">
                    100%
                  </p>
                  <p className="text-xs font-semibold text-[#241C15] mt-1">
                    Direct Benefit Transfer
                  </p>
                  <p className="text-[11px] text-[#8C7E6D] mt-0.5 font-light">
                    Every rupee reaches the artisan's registered bank account.
                  </p>
                </div>

                <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E4DAC8]">
                  <p className="text-xl font-serif font-bold text-[#C9922E]">
                    GI
                  </p>
                  <p className="text-xs font-semibold text-[#241C15] mt-1">
                    Geographical Indication
                  </p>
                  <p className="text-[11px] text-[#8C7E6D] mt-0.5 font-light">
                    Preserving hereditary intellectual property and heritage.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onEnterAsBuyer}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
                >
                  <span>Explore stories from living craft clusters</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. HERITAGE PROMISES (QUIET LUXURY) ───────────────────────────── */}
      <section className="py-14 sm:py-20 border-t border-[#EFE8D8] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          <div className="space-y-1.5">
            <span className="text-base">🪙</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241C15]">
              Direct Benefit Transfer
            </h4>
            <p className="text-xs text-[#6B6255] font-light leading-relaxed">
              Zero middlemen deductions. 100% of fair craft wages reach artisan
              accounts directly.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-base">📜</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241C15]">
              Certified Provenance
            </h4>
            <p className="text-xs text-[#6B6255] font-light leading-relaxed">
              Every item is certified through official Geographical Indication
              guild registries.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-base">🌿</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241C15]">
              Natural & Sustainable
            </h4>
            <p className="text-xs text-[#6B6255] font-light leading-relaxed">
              Quartz stone, river clays, natural vegetable lacquers, and pure
              mulberry silks.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-base">📦</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241C15]">
              Insured White-Glove Transit
            </h4>
            <p className="text-xs text-[#6B6255] font-light leading-relaxed">
              Carefully packed for fragile ceramic and handloom transit with
              milestone tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 7. EDITORIAL FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[#EFE8D8] bg-[#FAF7F2] py-12 sm:py-16 text-xs text-[#6B6255]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <span className="font-serif text-xl tracking-wider font-semibold text-[#241C15] block">
                SIMPLIFICANT
              </span>
              <p className="font-light text-[#5B5750] leading-relaxed max-w-sm">
                A digital marketplace connecting traditional Indian artisans,
                Geographical Indication craft guilds, and conscious collectors
                worldwide.
              </p>
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#241C15] block">
                Explore
              </span>
              <ul className="space-y-1.5 font-light">
                <li>
                  <button
                    onClick={onEnterAsBuyer}
                    className="hover:text-[#241C15] cursor-pointer"
                  >
                    All Crafts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("discover")}
                    className="hover:text-[#241C15] cursor-pointer"
                  >
                    Curated Collection
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("stories")}
                    className="hover:text-[#241C15] cursor-pointer"
                  >
                    Artisan Stories
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#241C15] block">
                Artisans
              </span>
              <ul className="space-y-1.5 font-light">
                <li>
                  <button
                    onClick={onEnterAsArtist}
                    className="hover:text-[#241C15] cursor-pointer"
                  >
                    Artist Workplace
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenLogin}
                    className="hover:text-[#241C15] cursor-pointer"
                  >
                    Guild Login
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#241C15] block">
                Protected Lineages
              </span>
              <p className="font-light text-[#8C7E6D] leading-relaxed">
                Jaipur Blue Pottery · Banarasi Silk Weaves · Saharanpur Woodwork ·
                Molela Terracotta · Bastar Dhokra · Channapatna Toys
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#EFE8D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C7E6D]">
            <p>© 2026 Simplificant. Handcrafted in India with pride.</p>
            <div className="flex items-center gap-4">
              <span>Zero-Commission Direct Benefit Transfer</span>
              <span>•</span>
              <button
                onClick={() => onSwitchRole("admin")}
                className="hover:text-[#241C15] cursor-pointer"
              >
                Platform Administration
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
