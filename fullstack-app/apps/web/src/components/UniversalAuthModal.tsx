import React, { useState } from "react"
import { User, Role, LanguageCode } from "../types"
import { DEFAULT_USERS } from "../utils/mockData"
import { translate } from "../utils/translations"
import BuyerAuthModal from "./BuyerAuthModal"

interface UniversalAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: User, role: Role) => void
  onRegisterUser?: (newUser: User) => void
  currentUser: User | null
  selectedLanguage: LanguageCode
  allUsers?: User[] | Record<string, User>
  targetRoleHint?: Role | null
}

const ROLE_ICONS: Record<Role, string> = {
  admin: "🛡️",
  artisan: "🏺",
  producer: "🏭",
  delivery: "🛵",
  buyer: "🛍️",
  b2b_gov: "🏛️",
}

const ROLE_BADGE_COLORS: Record<Role, {
  bg: string
  text: string
  border: string
  label: string
}> = {
  admin: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Super Admin",
  },
  artisan: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Artisan / Craftsman",
  },
  producer: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    label: "Workshop Producer",
  },
  delivery: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "Delivery Partner",
  },
  buyer: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Buyer / Customer",
  },
  b2b_gov: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    label: "B2B / GeM Officer",
  },
}

export default function UniversalAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterUser,
  currentUser,
  selectedLanguage,
  allUsers = DEFAULT_USERS,
  targetRoleHint,
}: UniversalAuthModalProps) {
  const usersList: User[] = Array.isArray(allUsers)
    ? allUsers
    : Object.values(allUsers)

  const [authMode, setAuthMode] =
    useState<"quick" | "otp" | "manual" | "register">("quick")

  // Manual form
  const [identifier, setIdentifier] = useState("")
  const [secret, setSecret] = useState("")

  // OTP Login form
  const [otpPhone, setOtpPhone] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [enteredOtp, setEnteredOtp] = useState("")

  // Registration form
  const [regName, setRegName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regRole, setRegRole] = useState<Role>("buyer")
  const [regCity, setRegCity] = useState("Jaipur")
  const [regPin, setRegPin] = useState("1234")
  const [regPassword, setRegPassword] = useState("pass123")

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  if (targetRoleHint === "buyer") {
    return (
      <BuyerAuthModal
        isOpen={isOpen}
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
        onRegisterUser={onRegisterUser}
        allUsers={allUsers}
      />
    )
  }

  // 1. Quick Select
  const handleQuickSelect = (user: User) => {
    setErrorMessage(null)
    setSuccessMessage(
      `Authenticated as ${user.name} (${user.role.toUpperCase()})`,
    )
    setTimeout(() => {
      onLoginSuccess(user, user.role)
      onClose()
    }, 350)
  }

  // 2. Manual Login with Email/Mobile & Password/PIN
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanId = identifier.trim().toLowerCase()
    const cleanSecret = secret.trim()

    if (!cleanId) {
      setErrorMessage("Please enter an official Email or Mobile number.")
      return
    }
    if (!cleanSecret) {
      setErrorMessage("Please enter your Password or Security PIN.")
      return
    }

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password: cleanSecret }),
      })
      const json = await res.json().catch(() => null)
      
      if (!res.ok || !json || !json.success) {
        // Check local users list as fallback
        const matched = usersList.find(
          (u) =>
            u.email.toLowerCase() === cleanId ||
            u.mobile.replace(/\s+/g, "") === cleanId.replace(/\s+/g, ""),
        )
        if (
          matched &&
          (matched.password === cleanSecret || matched.pin === cleanSecret)
        ) {
          setSuccessMessage(
            `Welcome back, ${matched.name}! (${matched.role.toUpperCase()})`,
          )
          setTimeout(() => {
            onLoginSuccess(matched, matched.role)
            onClose()
          }, 500)
          return
        }

        setErrorMessage(
          json?.error?.message ||
            "Invalid credentials. Please verify your Email/Mobile and Password/PIN.",
        )
        return
      }

      const { user, accessToken, refreshToken } = json.data
      
      // Store token safely
      localStorage.setItem("simplificant_access_token", accessToken)
      if (refreshToken) {
        localStorage.setItem("simplificant_refresh_token", refreshToken)
      }

      setSuccessMessage(`Welcome back, ${user.name}! (${user.role.toUpperCase()})`)
      setTimeout(() => {
        onLoginSuccess({
          ...usersList[0], // fallback shape filler for frontend type
          id: user.id,
          name: user.name,
          email: user.email || cleanId,
          role: user.role.toLowerCase() as Role,
          giCluster: user.giCluster
        }, user.role.toLowerCase() as Role)
        onClose()
      }, 500)
    } catch (err) {
      console.error(err)
      setErrorMessage("Failed to connect to the authentication server.")
    }
  }

  // 3. Mobile OTP Login
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!otpPhone.trim() || otpPhone.trim().length < 8) {
      setErrorMessage("Please enter a valid 10-digit mobile number.")
      return
    }

    // Generate random 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOtp(code)
    setOtpSent(true)
    setSuccessMessage(
      `OTP sent successfully to ${otpPhone}! (Test Verification Code: ${code})`,
    )
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage(
        `Invalid OTP entered. Please use the simulated OTP: ${generatedOtp}`,
      )
      return
    }

    // Find if user already exists with this phone
    const cleanP = otpPhone.replace(/\s+/g, "")
    let matched = usersList.find((u) => u.mobile.replace(/\s+/g, "") === cleanP)

    if (!matched) {
      // Create new buyer account automatically for this phone number
      matched = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: `User ${cleanP.slice(-4)}`,
        mobile: otpPhone,
        email: `user${cleanP.slice(-4)}@craft.in`,
        password: "user123",
        pin: "1234",
        role: "buyer",
        preferredLanguage: selectedLanguage,
        status: "active",
        joinedDate: "Today",
      }
      if (onRegisterUser) onRegisterUser(matched)
    }

    setSuccessMessage(`OTP Verified! Logging in as ${matched.name}...`)
    setTimeout(() => {
      onLoginSuccess(matched!, matched!.role)
      onClose()
    }, 450)
  }

  // 4. Register New Account
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!regName.trim()) {
      setErrorMessage("Please enter your full personal name.")
      return
    }
    if (!regPhone.trim()) {
      setErrorMessage("Please enter your mobile phone number.")
      return
    }

    const newUser: User = {
      id: `${regRole.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      name: regName.trim(),
      mobile: regPhone.trim(),
      email:
        regEmail.trim() ||
        `${regName.toLowerCase().replace(/\s+/g, "")}@craft.in`,
      password: regPassword || "pass123",
      pin: regPin || "1234",
      role: regRole,
      preferredLanguage: selectedLanguage,
      status: "active",
      joinedDate: "Today",
      address: {
        fullName: regName.trim(),
        phone: regPhone.trim(),
        streetAddress: `Crafts Colony, Cluster Zone`,
        city: regCity,
        state: "India",
        pincode: "302001",
        isDefault: true,
      },
    }

    if (onRegisterUser) {
      onRegisterUser(newUser)
    }

    setSuccessMessage(
      `Account created successfully! Welcome, ${newUser.name} (${newUser.role.toUpperCase()})`,
    )
    setTimeout(() => {
      onLoginSuccess(newUser, newUser.role)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#E8DFC9] overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A1412] via-[#2A1E17] to-[#1A1412] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9922E]/20 text-[#E6C687] border border-[#C9922E]/40">
              🇮🇳 MoSJE Official Digital Artisan OS
            </span>
            <span className="text-xs text-stone-300">
              Personal Account Authentication
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
            {translate("particularLoginTitle", selectedLanguage) ||
              "Personal Account Login"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-lg">
            Access your personalized role portal with individual credentials,
            phone OTP, or registered account.
          </p>

          {currentUser && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 text-xs border border-white/10">
              <span className="text-stone-300">Currently logged in as:</span>
              <span className="font-bold text-[#E6C687]">
                {currentUser.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] uppercase font-mono tracking-wider text-amber-200">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 pt-3 overflow-x-auto scrollbar-none gap-2">
          {[
            {
              id: "quick" as const,
              label: "⚡ Quick Profiles",
              badge: `${usersList.length}`,
            },
            { id: "otp" as const, label: "📱 Mobile OTP Login" },
            { id: "manual" as const, label: "🔐 Email / PIN" },
            { id: "register" as const, label: "📝 Register New User" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setAuthMode(tab.id)
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
              className={`pb-3 px-3.5 font-semibold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                authMode === tab.id
                  ? "border-[#B7592F] text-[#B7592F]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-stone-200 px-1.5 py-0.2 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Target Role Hint Alert */}
          {targetRoleHint && (
            <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-900">
              <span className="text-base">⚠️</span>
              <span>
                To access the <strong>{targetRoleHint.toUpperCase()}</strong>{" "}
                section, please sign in with an authorized {targetRoleHint}{" "}
                identity below.
              </span>
            </div>
          )}

          {/* Feedback banners */}
          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2 animate-in fade-in">
              <span className="text-base">❌</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <span className="text-base">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: QUICK 1-CLICK PROFILES */}
          {authMode === "quick" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Select your personal identity to switch:
                </span>
                <span className="text-[11px] text-stone-400">
                  Instant 1-Click Login
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {usersList.map((user) => {
                  const colors = ROLE_BADGE_COLORS[user.role] || {
                    bg: "bg-stone-50",
                    text: "text-stone-800",
                    border: "border-stone-200",
                    label: user.role,
                  }
                  const isCurrent = currentUser?.id === user.id
                  const isTarget = targetRoleHint === user.role

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleQuickSelect(user)}
                      className={`group relative rounded-2xl border p-3.5 text-left cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.01] ${
                        isCurrent
                          ? "bg-[#FFF9EE] border-[#C9922E] ring-2 ring-[#C9922E]/30"
                          : isTarget
                            ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-300"
                            : "bg-white border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl sm:text-3xl">
                            {ROLE_ICONS[user.role]}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-stone-900 group-hover:text-[#B7592F]">
                                {user.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#C9922E] text-white">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 font-mono mt-0.5">
                              {user.mobile}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {colors.label}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <div className="flex items-center gap-2 font-mono">
                          <span>
                            PIN:{" "}
                            <strong className="text-stone-800">
                              {user.pin}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>{user.email}</span>
                        </div>
                        <span className="font-semibold text-[#B7592F] group-hover:underline">
                          Login →
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE OTP LOGIN */}
          {authMode === "otp" && (
            <div className="max-w-md mx-auto py-3 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-3xl">📱</span>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Login with Personal Phone Number
                </h3>
                <p className="text-xs text-stone-500">
                  Receive an instant verification OTP to log in securely without
                  passwords.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      10-Digit Mobile Number
                    </label>
                    <div className="flex items-center rounded-2xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 focus-within:border-[#B7592F] focus-within:ring-2 focus-within:ring-[#B7592F]/20">
                      <span className="text-xs font-bold text-stone-600 mr-2">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-transparent text-sm text-stone-900 outline-none font-mono"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-stone-500">
                        Quick fill test phone:
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpPhone("99112 33445")}
                        className="text-[11px] text-[#B7592F] hover:underline font-bold"
                      >
                        Buyer (9911233445)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpPhone("98290 12345")}
                        className="text-[11px] text-[#B7592F] hover:underline font-bold"
                      >
                        Artisan (9829012345)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#B7592F] hover:bg-[#964724] text-white py-3 text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Send One-Time Password (OTP) →
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-4 animate-in fade-in"
                >
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
                    <p className="text-xs text-amber-900 font-medium">
                      Simulated SMS sent to: <strong>+91 {otpPhone}</strong>
                    </p>
                    <p className="text-sm font-bold font-mono text-[#B7592F]">
                      Your OTP: {generatedOtp}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      Enter 4-Digit OTP Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder={generatedOtp}
                        className="w-full rounded-2xl border border-stone-300 px-4 py-2.5 text-center text-xl font-bold font-mono tracking-widest text-stone-900 outline-none focus:border-[#B7592F] focus:ring-2 focus:ring-[#B7592F]/20"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(generatedOtp)}
                        className="shrink-0 px-3 py-2.5 rounded-2xl bg-[#EFE8D8] hover:bg-[#E4DAC8] text-[#241C15] text-xs font-bold transition-colors cursor-pointer"
                        title="Auto-fill OTP"
                      >
                        Paste OTP
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#241C15] hover:bg-[#3A2C20] text-white py-3 text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Verify OTP & Log In →
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setEnteredOtp("")
                      }}
                      className="text-xs text-[#B7592F] hover:underline font-bold"
                    >
                      ← Change Mobile Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CREDENTIALS LOGIN */}
          {authMode === "manual" && (
            <form
              onSubmit={handleManualLogin}
              className="space-y-4 max-w-md mx-auto py-2"
            >
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Official Email or Mobile Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g., admin@simplificant.gov.in or 99112 33445"
                  className="w-full rounded-2xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-[#B7592F] focus:ring-2 focus:ring-[#B7592F]/20 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Password or 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="e.g., admin2026 or 9988"
                  className="w-full rounded-2xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-[#B7592F] focus:ring-2 focus:ring-[#B7592F]/20 transition-all font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#B7592F] to-[#964724] text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔐 Authenticate & Enter Portal</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: REGISTER NEW PERSONAL USER */}
          {authMode === "register" && (
            <form
              onSubmit={handleRegister}
              className="space-y-4 max-w-lg mx-auto py-1"
            >
              <div className="text-center space-y-0.5 mb-2">
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Register Your Personal Identity
                </h3>
                <p className="text-xs text-stone-500">
                  Create a dedicated account for buying, artisan crafting, or
                  delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Sunita Verma"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Personal Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Account Role *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F] bg-white font-bold"
                  >
                    <option value="buyer">🛒 Buyer / Customer</option>
                    <option value="artisan">🏺 Artisan / Craftsman</option>
                    <option value="producer">🏭 Workshop Producer</option>
                    <option value="delivery">🛵 Delivery Partner</option>
                    <option value="b2b_gov">🏛️ B2B / GeM Officer</option>
                    <option value="admin">🛡️ Platform Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    City / Craft Cluster
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g., Jaipur, Srinagar, Varanasi"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    4-Digit Security PIN *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="1234"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F] font-mono text-center font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#B7592F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#241C15] hover:bg-[#3A2C20] text-white py-3 text-xs font-bold shadow-md transition-colors cursor-pointer mt-2"
              >
                Create Personal Account & Log In →
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-3 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>
              Direct Benefit Transfer (DBT) • Ministry of Social Justice &
              Empowerment
            </span>
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            Simplificant v5.5
          </span>
        </div>
      </div>
    </div>
  )
}
