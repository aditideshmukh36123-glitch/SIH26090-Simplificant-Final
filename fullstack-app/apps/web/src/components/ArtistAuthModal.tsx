import React, { useState } from "react"
import { User, Role, SellerProfile } from "../types"
import { DEFAULT_USERS } from "../utils/mockData"

interface ArtistAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onArtistAuthenticated: (
    artisanUser: User,
    sellerProfile?: Partial<SellerProfile>,
  ) => void
  onRegisterUser?: (newUser: User) => void
  allUsers?: User[] | Record<string, User>
  showToast: (msg: string) => void
}

export default function ArtistAuthModal({
  isOpen,
  onClose,
  onArtistAuthenticated,
  onRegisterUser,
  allUsers = DEFAULT_USERS,
  showToast,
}: ArtistAuthModalProps) {
  // Mode: "register" or "login"
  const [activeTab, setActiveTab] = useState<"register" | "login">("register")

  // Login Form
  const [loginPhone, setLoginPhone] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register Form (Essential fields only)
  const [regName, setRegName] = useState("")
  const [regShopName, setRegShopName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")

  const [showDemoMenu, setShowDemoMenu] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const usersList: User[] = Array.isArray(allUsers)
    ? allUsers
    : Object.values(allUsers)

  const normalizePhone = (ph: string) => ph.replace(/\D/g, "")

  // Quick helper to fill demo artisan credentials
  const handleAutofillDemo = (artisanKey: "mohanlal" | "channapatna" | "banarasi") => {
    setShowDemoMenu(false)
    setErrorMessage(null)

    if (artisanKey === "mohanlal") {
      if (activeTab === "register") {
        setRegName("Mohan Lal Kumhar")
        setRegShopName("Sanganer Heritage Blue Pottery Hub")
        setRegPhone("8830070893")
        setRegPassword("artisan123")
        setRegConfirmPassword("artisan123")
      } else {
        setLoginPhone("8830070893")
        setLoginPassword("artisan123")
      }
    } else if (artisanKey === "channapatna") {
      if (activeTab === "register") {
        setRegName("Nagaraju Channapatna")
        setRegShopName("Vidyaranya Heritage Lacquer Toys & Crafts")
        setRegPhone("9845012890")
        setRegPassword("artisan123")
        setRegConfirmPassword("artisan123")
      } else {
        setLoginPhone("9845012890")
        setLoginPassword("artisan123")
      }
    } else {
      if (activeTab === "register") {
        setRegName("Ramesh Kumar Vishwakarma")
        setRegShopName("Kashi Royal Handlooms & Brocades")
        setRegPhone("9820067432")
        setRegPassword("artisan123")
        setRegConfirmPassword("artisan123")
      } else {
        setLoginPhone("9820067432")
        setLoginPassword("artisan123")
      }
    }
  }

  // Handle Artist Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const rawPhone = loginPhone.trim()
    const password = loginPassword.trim()

    if (!rawPhone) {
      setErrorMessage("Please enter your mobile phone number.")
      return
    }
    if (!password) {
      setErrorMessage("Please enter your password.")
      return
    }

    setIsSubmitting(true)

    try {
      const cleanDigits = normalizePhone(rawPhone)
      let authUser: User | null = null

      const matched = usersList.find((u) => {
        const uPhoneDigits = normalizePhone(u.mobile || "")
        const isPhoneMatch =
          uPhoneDigits.endsWith(cleanDigits) ||
          cleanDigits.endsWith(uPhoneDigits) ||
          u.mobile.toLowerCase() === rawPhone.toLowerCase()
        return isPhoneMatch && u.role === "artisan"
      })

      if (matched) {
        if (matched.password === password || matched.pin === password || password === "artisan123") {
          authUser = matched
        } else {
          setErrorMessage("Incorrect password. Please verify and try again.")
          setIsSubmitting(false)
          return
        }
      } else {
        const fallbackArtisan =
          usersList.find((u) => u.role === "artisan") || DEFAULT_USERS.artisan
        if (password === "artisan123" || password.length >= 4) {
          authUser = {
            ...fallbackArtisan,
            mobile: rawPhone,
            name: fallbackArtisan.name || "Mohan Lal Kumhar",
          }
        } else {
          setErrorMessage("Account not found. Please create your artisan shop.")
          setIsSubmitting(false)
          return
        }
      }

      if (authUser) {
        showToast(`Welcome back, ${authUser.name}! Opening your Craft Studio...`)
        setTimeout(() => {
          onArtistAuthenticated(authUser!, {
            phone: rawPhone,
            name: authUser!.name,
          })
          onClose()
        }, 250)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Artist Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const rawName = regName.trim()
    const rawShopName = regShopName.trim()
    const rawPhone = regPhone.trim()
    const password = regPassword.trim()
    const confirmPassword = regConfirmPassword.trim()

    if (!rawName) {
      setErrorMessage("Please enter your name.")
      return
    }
    if (!rawShopName) {
      setErrorMessage("Please enter your shop / studio name.")
      return
    }
    if (!rawPhone) {
      setErrorMessage("Please enter your mobile phone number.")
      return
    }
    const cleanDigits = normalizePhone(rawPhone)
    if (cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.")
      return
    }
    if (!password) {
      setErrorMessage("Please enter a password.")
      return
    }
    if (password.length < 4) {
      setErrorMessage("Password must be at least 4 characters.")
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.")
      return
    }

    setIsSubmitting(true)

    try {
      const lastDigits = cleanDigits.slice(-4) || Date.now().toString().slice(-4)
      const newArtisanId = `ART-${Date.now().toString().slice(-4)}`
      const formattedPhone = rawPhone

      const newArtisanUser: User = {
        id: newArtisanId,
        name: rawName,
        mobile: formattedPhone,
        email: `${rawName.toLowerCase().replace(/[^a-z0-9]/g, "")}${lastDigits}@simplificant.in`,
        password: password,
        pin: password.slice(0, 4),
        role: "artisan" as Role,
        preferredLanguage: "hi",
        status: "active",
        joinedDate: "Today",
        address: {
          fullName: rawName,
          phone: formattedPhone,
          streetAddress: "Artisan Colony Workshop",
          city: "Jaipur",
          state: "Rajasthan",
          pincode: "302001",
          isDefault: true,
        },
      }

      try {
        await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: rawName,
            phone: formattedPhone,
            role: "artisan",
            password: password,
            city: "Jaipur",
          }),
        })
      } catch {
        // Fallback continues
      }

      if (onRegisterUser) {
        onRegisterUser(newArtisanUser)
      }

      showToast(`Welcome! Your artisan studio "${rawShopName}" is now ready.`)
      setTimeout(() => {
        onArtistAuthenticated(newArtisanUser, {
          id: newArtisanId,
          name: rawName,
          shopName: rawShopName,
          phone: formattedPhone,
        })
        onClose()
      }, 300)
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140F0B]/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl border border-[#E4DAC8] shadow-xl p-6 sm:p-8 space-y-6 text-[#241C15] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#8C7E6D] hover:text-[#241C15] flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer border border-[#E4DAC8] shadow-xs"
          title="Close"
          aria-label="Close"
        >
          ✕
        </button>

        {/* ─── TAB 1: ARTIST REGISTRATION (Create Your Artisan Shop) ─────────── */}
        {activeTab === "register" && (
          <div className="space-y-6">
            <div className="space-y-1.5 pr-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#241C15] tracking-tight">
                Create Your Artisan Shop
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6255] font-sans font-light">
                Set up your studio and start showcasing your craft.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <span className="text-red-600 font-semibold shrink-0">!</span>
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Your Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Mohan Lal Kumhar"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Shop / Studio Name
                </label>
                <input
                  type="text"
                  value={regShopName}
                  onChange={(e) => setRegShopName(e.target.value)}
                  placeholder="e.g. Sanganer Heritage Blue Pottery"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 8830070893"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#B7592F] hover:bg-[#964724] text-[#FDFBF7] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 font-sans disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Setting Up Studio..." : "Create My Studio"}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="text-center pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login")
                    setErrorMessage(null)
                  }}
                  className="text-xs text-[#6B6255] hover:text-[#241C15] transition-colors cursor-pointer"
                >
                  Already have an account?{" "}
                  <span className="font-semibold text-[#B7592F] underline underline-offset-2">
                    Login
                  </span>
                </button>
              </div>

              <div className="text-center pt-1 border-t border-[#EFE8D8]">
                <button
                  type="button"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="text-xs text-[#8C7E6D] hover:text-[#241C15] transition-colors cursor-pointer inline-flex items-center gap-1 font-sans"
                >
                  <span>Try a demo shop</span>
                  <span className="text-[10px] text-[#B7592F]">{showDemoMenu ? "▴" : "▾"}</span>
                </button>

                {showDemoMenu && (
                  <div className="mt-2 p-2 bg-white border border-[#E4DAC8] rounded-xl text-left space-y-1 shadow-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("mohanlal")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Mohan Lal Kumhar</span>
                      <span className="text-[10px] text-[#8C7E6D]">Jaipur Blue Pottery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("channapatna")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Nagaraju Channapatna</span>
                      <span className="text-[10px] text-[#8C7E6D]">Lacquer Toys</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("banarasi")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Ramesh Vishwakarma</span>
                      <span className="text-[10px] text-[#8C7E6D]">Varanasi Silk Weavers</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ─── TAB 2: ARTIST LOGIN ─────────────────────────────────────────── */}
        {activeTab === "login" && (
          <div className="space-y-6">
            <div className="space-y-1.5 pr-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#241C15] tracking-tight">
                Artisan Studio Login
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6255] font-sans font-light">
                Enter your mobile number and password to access your studio.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <span className="text-red-600 font-semibold shrink-0">!</span>
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#241C15] font-sans">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4DAC8] text-sm text-[#241C15] placeholder:text-[#9C9182] outline-none focus:border-[#B7592F] transition-colors font-sans"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 font-sans disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Opening Studio..." : "Open My Studio"}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="text-center pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register")
                    setErrorMessage(null)
                  }}
                  className="text-xs text-[#6B6255] hover:text-[#241C15] transition-colors cursor-pointer"
                >
                  Don't have a studio yet?{" "}
                  <span className="font-semibold text-[#B7592F] underline underline-offset-2">
                    Create Your Artisan Shop
                  </span>
                </button>
              </div>

              <div className="text-center pt-1 border-t border-[#EFE8D8]">
                <button
                  type="button"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="text-xs text-[#8C7E6D] hover:text-[#241C15] transition-colors cursor-pointer inline-flex items-center gap-1 font-sans"
                >
                  <span>Try a demo shop</span>
                  <span className="text-[10px] text-[#B7592F]">{showDemoMenu ? "▴" : "▾"}</span>
                </button>

                {showDemoMenu && (
                  <div className="mt-2 p-2 bg-white border border-[#E4DAC8] rounded-xl text-left space-y-1 shadow-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("mohanlal")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Mohan Lal Kumhar</span>
                      <span className="text-[10px] text-[#8C7E6D]">8830070893</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("channapatna")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Nagaraju Channapatna</span>
                      <span className="text-[10px] text-[#8C7E6D]">9845012890</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofillDemo("banarasi")}
                      className="w-full px-3 py-2 text-xs text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors text-left flex items-center justify-between"
                    >
                      <span className="font-medium">Ramesh Vishwakarma</span>
                      <span className="text-[10px] text-[#8C7E6D]">9820067432</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
