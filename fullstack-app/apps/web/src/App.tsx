import { useState, useEffect, useMemo, useRef } from "react"
import CameraPriceScannerModal from "./components/CameraPriceScannerModal"
import SellerCameraUploadModal from "./components/SellerCameraUploadModal"
import PostUploadSuccessModal from "./components/PostUploadSuccessModal"
import CustomerOtpLoginModal from "./components/CustomerOtpLoginModal"
import SocialShareModal from "./components/SocialShareModal"
import SellerAuthModal from "./components/SellerAuthModal"
import SellerWorkplaceDashboard from "./components/SellerWorkplaceDashboard"
import CustomerOrdersTrackingModal from "./components/CustomerOrdersTrackingModal"
import ProductDetailModal from "./components/ProductDetailModal"
import CheckoutModal from "./components/CheckoutModal"
import ProducerDashboard from "./components/ProducerDashboard"
import DeliveryAgentDashboard from "./components/DeliveryAgentDashboard"
import AdminDashboard, { SiteSettings } from "./components/AdminDashboard"
import BuyerSupportChatModal from "./components/BuyerSupportChatModal"
import NotificationPanel from "./components/NotificationPanel"
import AddCraftOrMaterialModal from "./components/AddCraftOrMaterialModal"
import UniversalAuthModal from "./components/UniversalAuthModal"
import ArtistAuthModal from "./components/ArtistAuthModal"
import BuyerAuthModal from "./components/BuyerAuthModal"
import EditorialLandingPage from "./components/EditorialLandingPage"

import {
  AIValuationResult,
  CraftCategory,
  SellerProfile,
  ProducerProfile,
  DeliveryAgent,
  CustomerOrder,
  Product,
  CartItem,
  Role,
  LanguageCode,
  RoleNotification,
  User,
  Address,
} from "./types"

import {
  DEFAULT_USERS,
  INITIAL_SELLER_PROFILE,
  INITIAL_PRODUCER_PROFILE,
  INITIAL_DELIVERY_AGENT,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMER_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SAVED_ADDRESSES,
} from "./utils/mockData"

import { LANGUAGES, translate } from "./utils/translations"
import { speechService, speakText, stopSpeaking } from "./utils/speechService"
import type { NativeVoicePayload } from "./utils/speechService"

function generateSahayakReply(userQuery: string, lang: LanguageCode): string {
  const q = userQuery.toLowerCase()
  if (
    q.includes("pottery") ||
    q.includes("clay") ||
    q.includes("मिट्टी") ||
    q.includes("पॉटरी") ||
    q.includes("vase") ||
    q.includes("matka") ||
    q.includes("फूलदान") ||
    q.includes("മൺപാത്രം")
  ) {
    if (lang === "hi")
      return "जयपुर की प्रसिद्ध नीली मिट्टी (Blue Pottery) बिना साधारण मिट्टी के प्राकृतिक क्वार्ट्ज पत्थर और तांबे के खनिजों से 850°C पर पकाई जाती है। इसमें लेड-फ्री मिनरल ग्लेजिंग होती है जो पीढ़ियों तक चमक बनाए रखती है।"
    if (lang === "mr")
      return "जयपूरची ब्लू पॉटरी मातीशिवाय क्वार्ट्झ खनिजांपासून ८५०°C वर भाजली जाते. तर बांकुरा टेराकोटा हा नदीच्या सुपीक मातीपासून बनवला जातो. दोन्ही १००% शुद्ध हस्तनिर्मित आहेत."
    if (lang === "bn")
      return "জয়পুরের ঐতিহ্যবাহী ব্লু পটারি মাটি ছাড়াই কোয়ার্টজ খনিজ দিয়ে ৮৫০°C তাপে কাঠের চুল্লিতে পোড়ানো হয়। এতে কোনো কৃত্রিম বিষাক্ত রাসায়নিক ব্যবহার করা হয় না।"
    if (lang === "ta")
      return "ஜெய்ப்பூர் நீல மண்பாண்டம் களிமண் இன்றி குவார்ட்ஸ் தாதுக்கள் மூலம் 850°C-ல் பாரம்பரிய சூளையில் சுடப்பட்டு இயற்கையான கோபால்ட் நீல நிறத்தால் அலங்கரிக்கப்படுகிறது."
    if (lang === "es")
      return "La cerámica azul de Jaipur no usa arcilla común; se elabora con cuarzo molido y minerales de cobalto horneados a 850°C, completamente hecha a mano."
    if (lang === "fr")
      return "La poterie bleue de Jaipur est fabriquée sans argile traditionnelle, avec de la poudre de quartz et du cobalt naturel cuits à 850°C par des maîtres potiers."
    if (lang === "de")
      return "Die Jaipur Blaue Keramik wird ohne Ton aus natürlichem Quarzstein und Kobaltglasur bei 850°C gebrannt – 100% schadstofffreie Handarbeit."
    if (lang === "ja")
      return "ジャイプール伝統ブルーポタリーは粘土を一切使わず、天然石英粉とコバルト鉱物釉薬を850度の薪窯で焼き上げた400年の歴史を持つ世界無二の工芸品です。"
    if (lang === "ar")
      return "فخار جايبور الأزرق التراثي فريد من نوعه، حيث يصنع بدون طين من بودرة الكوارتز الطبيعية والنحاس الأزرق ويحرق عند 850 درجة مئوية."
    return "Authentic Jaipur Blue Pottery uses non-clay quartz stone fired at 850°C with natural cobalt mineral glaze. Each piece is individually hand-thrown and painted by master guild potters."
  }

  if (
    q.includes("textile") ||
    q.includes("silk") ||
    q.includes("weave") ||
    q.includes("banarasi") ||
    q.includes("chanderi") ||
    q.includes("रेशम") ||
    q.includes("साड़ी") ||
    q.includes("हथकरघा") ||
    q.includes("பட்டு") ||
    q.includes("বয়ন")
  ) {
    if (lang === "hi")
      return "हमारे कैटलॉग में शुद्ध बनारसी शहतूत रेशम, प्रानपुर चंदेरी और पोचमपल्ली डबल-इकत शॉल शामिल हैं। प्रत्येक वस्त्र 18 से 35 दिनों की निरंतर हथकरघा बुनाई से तैयार होता है और सिल्क मार्क प्रमाणित है।"
    if (lang === "mr")
      return "सर्व वस्त्रे अस्सल हातमागावर १८ ते ३५ दिवस सलग विणून तयार होतात. शुद्ध बनारसी सिल्क, चंदेरी आणि पोचमपल्ली इकत हे शासकीय सिल्क मार्क प्रमाणित आहेत."
    if (lang === "bn")
      return "আমাদের টেক্সটাইল সম্ভারে রয়েছে খাঁটি বেনারসি সিল্ক, চান্দেরী এবং তেলঙ্গানা পোচমপলি ইক্কত। প্রতিটি শাড়ি ও শাল খাঁটি সিল্ক মার্ক এবং হ্যান্ডলুম মার্ক প্রত্যয়িত।"
    if (lang === "ta")
      return "எங்கள் கைத்தறி ஆடைகள் 18 முதல் 35 நாட்கள் கைத்தறியில் தூய பட்டு மற்றும் சோதிக்கப்பட்ட தங்க ஜரியால் நெய்யப்பட்டவை. 100% அரசு சான்றளிக்கப்பட்டவை."
    if (lang === "es")
      return "Nuestros textiles son 100% tejidos a mano en telares tradicionales durante 18 a 35 días con seda pura de morera y certificado Silk Mark oficial."
    if (lang === "fr")
      return "Nos étoffes en soie de Banaras, Chanderi et Ikat sont tissées à la main sur métiers à tisser traditionnels et certifiées par le label officiel Silk Mark."
    if (lang === "de")
      return "Unsere handgewebten Banarasi-, Chanderi- und Ikat-Seiden entstehen in 18 bis 35 Tagen Handarbeit auf traditionellen Webstühlen und tragen das offizielle Silk Mark-Zertifikat."
    if (lang === "ja")
      return "バラナシの桑絹、チャンデリ、ポチャムパッリ絣織りなど、18〜35日かけて手織機で丹念に織り上げた政府シルクマーク認定品です。"
    if (lang === "ar")
      return "تشمل منسوجاتنا حرير فاراناسي الطبيعي وأقمشة تشانيديري وإيكات المنسوجة يدوياً على مدار 18 إلى 35 يوماً مع شهادة علامة الحرير الرسمية."
    return "Our textiles encompass handwoven Banarasi Mulberry silk, Chanderi weaves, and Pochampally Ikats—each painstakingly crafted on handlooms over 18 to 35 days with certified Silk Mark."
  }

  if (
    q.includes("leather") ||
    q.includes("kolhapuri") ||
    q.includes("mojari") ||
    q.includes("चमड़ा") ||
    q.includes("चर्म") ||
    q.includes("தோல்") ||
    q.includes("চামড়া") ||
    q.includes("ചർമ്മം")
  ) {
    if (lang === "hi")
      return "कोल्हापुरी चप्पल और मोजरी 100% बबूल की छाल से वानस्पतिक रूप से टैन की गई प्राकृतिक चमड़े से बिना किसी लोहे की कील या रासायनिक गोंद के हाथ से सिली जाती हैं।"
    if (lang === "mr")
      return "कोल्हापुरी चपला बाभळीच्या सालीने शुद्ध वनस्पती टॅनिंग करून कोणत्याही लोखंडी खिळ्याशिवाय किंवा रसायनांशिवाय चामड्याच्या दोऱ्याने हाताने शिवल्या जातात।"
    if (lang === "bn")
      return "কোলাপুরি চটি বাবলা গাছের বাকল দিয়ে ভেষজ উপায়ে ট্যান করা চামড়ায় কোনো লোহার পেরেক ছাড়াই হাতে সেলাই করা হয়।"
    if (lang === "ta")
      return "கோலாபுரி தோல் செருப்புகள் எந்த ஆணியும் இன்றி இயற்கை கருவேலம் பட்டையால் பதப்படுத்தப்பட்டு தூய தோலில் கையால் தைக்கப்படுகின்றன."
    if (lang === "es")
      return "Las sandalias Kolhapuri son 100% curtidas al vegetal con corteza de acacia y cosidas a mano sin clavos ni pegamentos químicos."
    if (lang === "fr")
      return "Les sandales Kolhapuri sont tannées aux écorces végétales et cousues à la main sans clous ni colle chimique, s'adaptant parfaitement à vos pieds."
    if (lang === "de")
      return "Authentische Kolhapuri-Sandalen werden pflanzlich mit Rindentanninen gegerbt und komplett ohne Nägel oder Klebstoff von Hand mit Rohlederfäden genäht."
    if (lang === "ja")
      return "コラプールの本革サンダルはバブール樹皮で100%植物タンニン鞣しされ、釘や接着剤を一切使わず生革紐で手縫いされた伝統の逸品です。"
    if (lang === "ar")
      return "صنادل كولهابوري وأحذية موجاري التراثية مصنوعة من جلد طبيعي 100% مدبوغ بلحاء الشجر النباتي ومخيطة يدوياً دون استخدام أي مسامير أو غراء كيميائي."
    return "Authentic Kolhapuri leathercraft and Mojari footwear are 100% vegetable-tanned with acacia bark and hand-braided with rawhide cords without nails or synthetic glues."
  }

  if (
    q.includes("dbt") ||
    q.includes("transfer") ||
    q.includes("money") ||
    q.includes("bank") ||
    q.includes("भुगतान") ||
    q.includes("पैसे") ||
    q.includes("പണം") ||
    q.includes("টাকা")
  ) {
    if (lang === "hi")
      return "सिम्प्लीफिकेंट पर आपका 100% भुगतान बिना किसी बिचौलिए के सीधे कारीगर के जन धन बैंक खाते में DBT (Direct Benefit Transfer) के माध्यम से पहुंचता है।"
    if (lang === "mr")
      return "सिम्प्लीफिकेंटवर तुमचे १००% पैसे थेट कारागिराच्या बँक खात्यात थेट जमा होतात. प्लॅटफॉर्म किंवा मध्यस्थ कोणतीही दलाली घेत नाही."
    if (lang === "bn")
      return "সিম্প্লিফিক্যান্টে আপনার প্রদত্ত ১০০% অর্থ সরাসরি কারিগরের ব্যাংক অ্যাকাউন্টে জমা হয়, কোনো মধ্যস্বত্বভোগী কমিশন কাটা হয় না।"
    if (lang === "ta")
      return "சிம்ப்ளிஃபிகண்ட்டில் உங்கள் கட்டணம் 100% இடைத்தரகரின்றி நேரடியாக கைவினைஞரின் வங்கிக் கணக்கில் DBT மூலம் சேர்கிறது."
    if (lang === "es")
      return "En Simplificant, el 100% del dinero se transfiere directamente a la cuenta bancaria del artesano sin comisiones intermediarias."
    if (lang === "fr")
      return "Sur Simplificant, 100% du prix payé est directement versé sur le compte bancaire de l'artisan sans commission d'intermédiaire."
    if (lang === "de")
      return "Auf Simplificant fließen 100% Ihres Kaufpreises ohne Zwischenhändlermargen direkt auf das Bankkonto des Kunsthandwerkers."
    if (lang === "ja")
      return "シンプリフィカントでは、お客様のお支払いが中間マージン0%で、全額職人の銀行口座に直接送金 (DBT) されます。"
    if (lang === "ar")
      return "في منصة سيمبليفيكانت، يتم تحويل 100% من مدفوعاتك مباشرة إلى الحساب المصرفي للحرفي بنظام التحويل المالي المباشر بدون أي عمولة وسيط."
    return "On Simplificant, 100% of your payment is credited directly into the verified artisan's bank account via Direct Benefit Transfer (DBT) with 0% middleman deduction."
  }

  // General fallback
  if (lang === "hi")
    return "नमस्ते! सिम्प्लीफिकेंट पर सभी उत्पाद 100% हस्तनिर्मित हैं—मिट्टी के बर्तन, हथकरघा वस्त्र, काष्ठ नक्काशी और चर्म शिल्प। आप माइक दबाकर किसी भी भाषा में पूछ सकते हैं!"
  if (lang === "mr")
    return "नमस्ते! सिम्प्लीफिकेंटवरील सर्व उत्पादने अस्सल हस्तनिर्मित आहेत—मातीची भांडी, हातमाग विणकाम, लाकडी कोरीव काम आणि कातडी काम. माइक टॅप करून अधिक विचारा!"
  if (lang === "bn")
    return "নমস্কার! সিম্প্লিফিক্যান্টে সমস্ত পণ্য ১০০% হস্তনির্মিত—মৃৎশিল্প, তাঁত বস্ত্র, কাঠের খোদাই এবং চামড়ার শিল্প। মাইকে চাপ দিয়ে আরও তথ্য জানতে পারেন!"
  if (lang === "ta")
    return "வணக்கம்! சிம்ப்ளிஃபிகண்ட்டில் உள்ள அனைத்து பொருட்களும் 100% கைவினைப் பொருட்களே—மண்பாண்டங்கள், கைத்தறி, மர வேலை, மற்றும் தோல் பொருட்கள். மைக்-ஐ தட்டி கேட்கலாம்!"
  if (lang === "es")
    return "¡Namaste! Todas las obras en Simplificant son 100% artesanales: cerámica, textiles, talla de madera y cuero. ¡Toque el micrófono para preguntar lo que desee!"
  if (lang === "fr")
    return "Namasté ! Toutes les pièces sur Simplificant sont 100% artisanales : poterie, tissage, sculpture sur bois et cuir. Appuyez sur le micro pour poser vos questions !"
  if (lang === "de")
    return "Namaste! Alle Werke auf Simplificant sind 100% echte Handarbeit: Keramik, Textilien, Holzschnitzerei und Leder. Tippen Sie aufs Mikrofon für mehr Informationen!"
  if (lang === "ja")
    return "ナマステ！シンプリフィカントの作品はすべて100%伝統職人による手仕事です（陶芸、手織り布、木彫り、皮革工芸）。マイクをタップしてお気軽にご質問ください！"
  if (lang === "ar")
    return "مرحباً! جميع المعروضات في منصتنا مصنوعة يدوياً 100% (فخار، نسيج يدوي، نحت خشب، وصناعات جلدية). انقر على الميكروفون للتحدث الصوتي بأي استفسار!"
  return "Namaste! Every item on Simplificant is 100% handmade—featuring pottery & clay, handloom textiles & weaves, wood carving, and traditional leather craft. Feel free to tap the microphone to ask anything!"
}

const TRENDING_SEARCHES = [
  { label: "Jaipur Blue Pottery", icon: "🏺", query: "Jaipur Blue Pottery", category: "Pottery" },
  { label: "Banarasi Silk Saree", icon: "🧵", query: "Banarasi Silk", category: "Textile" },
  { label: "Kashmir Walnut Wood", icon: "🪵", query: "Kashmir", category: "Woodwork" },
  { label: "Dhokra Brass Bell", icon: "🪙", query: "Dhokra", category: "Metalwork" },
  { label: "Channapatna Wooden Toys", icon: "🪆", query: "Channapatna", category: "Handicrafts" },
  { label: "Madhubani Folk Art", icon: "🎨", query: "Madhubani", category: "Folk & Tribal Art" },
]

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return <>{text}</>
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const regex = new RegExp(`(${escaped})`, "gi")
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#C9922E]/35 text-[#B7592F] font-bold rounded-sm px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

function productMatchesQuery(
  p: Product,
  q: string,
  selectedLanguage: LanguageCode,
  selectedCategory: string,
): boolean {
  if (p.isMaterial || p.category === "Craft Materials") return false
  if (!q.trim()) {
    return selectedCategory === "All" || p.category === selectedCategory
  }

  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean)

  const names = Object.values(p.name || {}).join(" ").toLowerCase()
  const descs = Object.values(p.description || {}).join(" ").toLowerCase()
  const locs = Object.values(p.location || {}).join(" ").toLowerCase()
  const artisan = (p.artisan || "").toLowerCase()
  const category = (p.category || "").toLowerCase()
  const materials = (p.materials || []).join(" ").toLowerCase()
  const tags = (p.tags || []).join(" ").toLowerCase()

  const searchableBlob = `${names} ${descs} ${locs} ${artisan} ${category} ${materials} ${tags}`

  return terms.every((term) => searchableBlob.includes(term))
}

export default function App() {
  // ─── 1. ROLE & USER AUTHENTICATION STATE ────────────────────────────────────
  const [activeUsers, setActiveUsers] = useState<Record<string, User>>(() => {
    try {
      const saved = localStorage.getItem("simplificant_active_users_v5")
      if (saved) return JSON.parse(saved)
      return DEFAULT_USERS
    } catch {
      return DEFAULT_USERS
    }
  })
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem("simplificant_current_user_v5")
      if (saved) return JSON.parse(saved)
      return DEFAULT_USERS.buyer
    } catch {
      return DEFAULT_USERS.buyer
    }
  })
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem("simplificant_current_user_v5")
      if (saved) {
        const u = JSON.parse(saved)
        return u.role || "buyer"
      }
      return "buyer"
    } catch {
      return "buyer"
    }
  })
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [buyerExperience, setBuyerExperience] = useState<"landing" | "catalog">("catalog")
  const [authTargetRoleHint, setAuthTargetRoleHint] = useState<Role | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("simplificant_is_logged_in") === "true"
    } catch {
      return false
    }
  })

  // ─── 2. LANGUAGE STATE ──────────────────────────────────────────────────────
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en")
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  // ─── 3. CATALOG & PRODUCT STATE ─────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(() => {
    const sanitizeAndDedup = (list: Product[]): Product[] => {
      const seen = new Set<string | number>()
      const clean: Product[] = []
      for (const p of list) {
        let id = p.id
        if (id === 103 && (p.name?.en?.includes("Matka") || p.name?.en?.includes("Water Vessel")) && clean.some((item) => item.id === 103)) {
          id = 106
        }
        if (!seen.has(id)) {
          seen.add(id)
          clean.push(id !== p.id ? { ...p, id } : p)
        }
      }
      return clean
    }

    try {
      const saved = localStorage.getItem(
        "simplificant_products_2026_handmade_v5",
      )
      if (!saved) {
        const oldV4 = localStorage.getItem(
          "simplificant_products_2026_handmade_v4",
        )
        if (oldV4) {
          const parsedOld: Product[] = JSON.parse(oldV4)
          const merged = [
            ...parsedOld.filter(
              (p) => !p.isMaterial && p.category !== "Craft Materials",
            ),
            ...INITIAL_PRODUCTS.filter(
              (ip) => !parsedOld.some((p) => p.id === ip.id),
            ),
          ]
          return sanitizeAndDedup(merged.length > 0 ? merged : INITIAL_PRODUCTS)
        }
        return sanitizeAndDedup(INITIAL_PRODUCTS)
      }
      const parsed: Product[] = JSON.parse(saved)
      const merged = [
        ...parsed.filter(
          (p) => !p.isMaterial && p.category !== "Craft Materials",
        ),
        ...INITIAL_PRODUCTS.filter((ip) => !parsed.some((p) => p.id === ip.id)),
      ]
      return sanitizeAndDedup(merged.length > 0 ? merged : INITIAL_PRODUCTS)
    } catch {
      return sanitizeAndDedup(INITIAL_PRODUCTS)
    }
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isVoiceSearching, setIsVoiceSearching] = useState(false)
  const [voiceSearchText, setVoiceSearchText] = useState("")
  const [sortBy, setSortBy] =
    useState<"featured" | "price-asc" | "price-desc" | "b2b-price">("featured")
  const [addCraftModalOpen, setAddCraftModalOpen] = useState(false)
  const [artisanHeaderMenuOpen, setArtisanHeaderMenuOpen] = useState(false)
  const [artisanStudioActiveTab, setArtisanStudioActiveTab] = useState<"studio" | "crafts" | "orders">("studio")
  const [headerSearchExpanded, setHeaderSearchExpanded] = useState(false)
  const artisanMenuRef = useRef<HTMLDivElement>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false)
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false)
  const headerSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const heroSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        artisanMenuRef.current &&
        !artisanMenuRef.current.contains(event.target as Node)
      ) {
        setArtisanHeaderMenuOpen(false)
      }
      if (
        headerSearchRef.current &&
        !headerSearchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false)
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsMobileSearchFocused(false)
      }
      if (
        heroSearchRef.current &&
        !heroSearchRef.current.contains(event.target as Node)
      ) {
        setIsHeroSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handlePerformSearch = (query?: string, category?: string) => {
    if (query !== undefined) setSearchQuery(query)
    if (category !== undefined) setSelectedCategory(category)
    setIsSearchFocused(false)
    setIsMobileSearchFocused(false)
    setIsHeroSearchFocused(false)
    const el = document.getElementById("craft-catalog")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  // ─── 4. CART & E-COMMERCE MODALS ────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState<Product | null>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ─── 5. MULTI-ROLE PROFILES ─────────────────────────────────────────────────
  const [currentSeller, setCurrentSeller] = useState<SellerProfile>(() => {
    try {
      const saved = localStorage.getItem("simplificant_seller")
      return saved ? JSON.parse(saved) : INITIAL_SELLER_PROFILE
    } catch {
      return INITIAL_SELLER_PROFILE
    }
  })
  const [currentProducer, setCurrentProducer] = useState<ProducerProfile>(
    INITIAL_PRODUCER_PROFILE,
  )
  const [currentDeliveryAgent, setCurrentDeliveryAgent] =
    useState<DeliveryAgent>(INITIAL_DELIVERY_AGENT)

  // ─── 6. ORDERS & LIFECYCLE STATE ────────────────────────────────────────────
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem("simplificant_customer_orders_2026_v5")
      if (!saved) {
        const oldV4 = localStorage.getItem(
          "simplificant_customer_orders_2026_v4",
        )
        if (oldV4) {
          const parsedOld: CustomerOrder[] = JSON.parse(oldV4)
          const merged = [
            ...parsedOld,
            ...INITIAL_CUSTOMER_ORDERS.filter(
              (io) => !parsedOld.some((o) => o.id === io.id),
            ),
          ]
          return merged.length > 0 ? merged : INITIAL_CUSTOMER_ORDERS
        }
        return INITIAL_CUSTOMER_ORDERS
      }
      const parsed: CustomerOrder[] = JSON.parse(saved)
      const merged = [
        ...parsed,
        ...INITIAL_CUSTOMER_ORDERS.filter(
          (io) => !parsed.some((o) => o.id === io.id),
        ),
      ]
      return merged.length > 0 ? merged : INITIAL_CUSTOMER_ORDERS
    } catch {
      return INITIAL_CUSTOMER_ORDERS
    }
  })
  const [customerOrdersModalOpen, setCustomerOrdersModalOpen] = useState(false)
  const [trackingLookupOrderId, setTrackingLookupOrderId] =
    useState<string | null>(null)
  const [sellerAuthModalOpen, setSellerAuthModalOpen] = useState(false)
  const [sellerAuthModalMode, setSellerAuthModalMode] =
    useState<"register" | "edit" | "login">("register")
  const [universalAuthModalOpen, setUniversalAuthModalOpen] = useState(false)
  const [artistAuthModalOpen, setArtistAuthModalOpen] = useState(false)
  const [buyerAuthModalOpen, setBuyerAuthModalOpen] = useState(false)

  // ─── SUPER ADMIN GLOBAL CONTROLS & PLATFORM SETTINGS ───────────────────────
  const [announcementText, setAnnouncementText] = useState(
    "Certified 100% Handmade Indian Heritage Crafts • 0% Middleman Fee • Direct Benefit Transfer (DBT) to Artisans",
  )
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    minWage: 140,
    zeroFeeDbt: true,
  })

  // ─── 7. NOTIFICATIONS STATE ─────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<RoleNotification[]>(
    INITIAL_NOTIFICATIONS,
  )
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)

  // ─── 8. CAMERA & AI SCANNER / UPLOAD MODALS ─────────────────────────────────
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false)
  const [sellerCameraOpen, setSellerCameraOpen] = useState(false)
  const [postUploadModalOpen, setPostUploadModalOpen] = useState(false)
  const [justPublishedProduct, setJustPublishedProduct] =
    useState<Product | null>(null)
  const [prefillValuationForSeller, setPrefillValuationForSeller] =
    useState<AIValuationResult | null>(null)
  const [prefillImageUrlForSeller, setPrefillImageUrlForSeller] =
    useState<string | null>(null)
  // Native mobile shell (Expo → WebView) pending photos
  const [sellerIncomingImage, setSellerIncomingImage] =
    useState<string | null>(null)
  const [scannerIncomingImage, setScannerIncomingImage] =
    useState<string | null>(null)

  // ─── 9. SOCIAL SHARING & SUPPORT CHAT ───────────────────────────────────────
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareTargetProduct, setShareTargetProduct] = useState<Product | null>(
    null,
  )
  const [shareTargetValuation, setShareTargetValuation] = useState<{
    valuation: AIValuationResult
    imageUrl: string
  } | null>(null)
  const [supportChatOpen, setSupportChatOpen] = useState(false)
  const [supportPrefillOrderId, setSupportPrefillOrderId] =
    useState<string | undefined>(undefined)

  // ─── 10. SAHAYAK AI ASSISTANT WIDGET ────────────────────────────────────────
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiInputMessage, setAiInputMessage] = useState("")
  const [aiIsTyping, setAiIsTyping] = useState(false)
  const [aiIsListening, setAiIsListening] = useState(false)
  const aiStopListeningRef = useRef<(() => void) | null>(null)
  const [aiMessages, setAiMessages] = useState<Array<{
    sender: "ai" | "user"
    text: string
    voiceUrl?: string
    action?: () => void
    actionLabel?: string
  }>>([])

  // Reset/update AI greeting on language change
  useEffect(() => {
    setAiMessages([
      {
        sender: "ai",
        text: translate("aiGreeting", selectedLanguage),
      },
    ])
  }, [selectedLanguage])

  // Load products from backend on mount
  useEffect(() => {
    fetch("/api/v1/products?sortBy=newest")
      .then((r) => {
        if (!r.ok) return null
        return r.json()
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.data?.items) && data.data.items.length > 0) {
          const BACKEND_TO_FRONTEND_CATEGORY: Record<string, CraftCategory> = {
            POTTERY: "Pottery",
            TEXTILE: "Textile",
            WOODWORK: "Woodwork",
            METALWARE: "Metalwork",
            JEWELLERY: "Jewelry",
            CANE_BAMBOO: "Bamboo & Cane",
            STONEWORK: "Stone Craft",
            PAINTING: "Folk & Tribal Art",
            OTHER: "Handicrafts",
          }
          const backendProducts: Product[] = data.data.items.map((b: any) => ({
            id: b.id,
            artisan_id: b.artisanId,
            name: { en: b.title, hi: b.titleHi || b.title, mr: b.title, bn: b.title, ta: b.title, te: b.title, gu: b.title, kn: b.title, ml: b.title, pa: b.title, or: b.title, es: b.title, fr: b.title, de: b.title, ja: b.title, ar: b.title },
            description: b.description || { en: "", hi: "" },
            price: Number(b.price),
            category: BACKEND_TO_FRONTEND_CATEGORY[b.category] || "Handicrafts",
            image: b.cleanImageUrl || "",
            tags: b.tags || [],
            stockQuantity: b.stockQuantity || 1,
            artisan: b.artisanName || "Verified Artisan",
            location: { en: b.artisanGiCluster || "India", hi: b.artisanGiCluster || "भारत", mr: "India", bn: "India", ta: "India", te: "India", gu: "India", kn: "India", ml: "India", pa: "India", or: "India", es: "India", fr: "India", de: "India", ja: "India", ar: "India" },
            rating: 5.0,
            reviews: 0,
            gi_tagged: b.giTagged || false,
          }))
          setProducts((prev) => {
            const merged = [
              ...backendProducts,
              ...prev.filter((p) => !backendProducts.some((bp) => bp.id === p.id)),
            ]
            const seen = new Set<string | number>()
            const cleanMerged = merged.filter((p) => {
              if (seen.has(p.id)) return false
              seen.add(p.id)
              return true
            })
            localStorage.setItem("simplificant_products_2026_handmade_v5", JSON.stringify(cleanMerged))
            return cleanMerged
          })
        }
      })
      .catch((e) => console.warn("Backend unavailable, using local products", e?.message || e))
  }, [])

  // Sync products and orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "simplificant_products_2026_handmade_v5",
        JSON.stringify(products),
      )
    } catch {}
  }, [products])

  useEffect(() => {
    try {
      localStorage.setItem(
        "simplificant_customer_orders_2026_v5",
        JSON.stringify(customerOrders),
      )
    } catch {}
  }, [customerOrders])

  useEffect(() => {
    try {
      localStorage.setItem(
        "simplificant_active_users_v5",
        JSON.stringify(activeUsers),
      )
    } catch {}
  }, [activeUsers])

  useEffect(() => {
    try {
      localStorage.setItem(
        "simplificant_current_user_v5",
        JSON.stringify(currentUser),
      )
    } catch {}
  }, [currentUser])

  const handleToggleAiMic = () => {
    if (aiIsListening) {
      if (aiStopListeningRef.current) {
        aiStopListeningRef.current()
        aiStopListeningRef.current = null
      }
      setAiIsListening(false)
      showToast("Voice microphone stopped.")
      return
    }

    setAiIsListening(true)
    showToast(translate("aiListening", selectedLanguage))
    const stopFn = speechService.startListening(
      selectedLanguage,
      (text, isFinal) => {
        setAiInputMessage(text)
        if (isFinal) {
          setAiIsListening(false)
          handleSendAiMessage(text)
        }
      },
      (err) => {
        console.warn("AI Speech recognition error:", err)
        setAiIsListening(false)
        const fallback = translate("aiChipPottery", selectedLanguage)
        setAiInputMessage(fallback)
        showToast("Voice sample query filled: " + fallback)
      },
      {
        // Real voice note recorded by the native shell (no STT service wired
        // up yet): post it as a playable voice message in the chat and keep
        // the conversation moving with the default query.
        onAudio: (payload: NativeVoicePayload) => {
          setAiIsListening(false)
          aiStopListeningRef.current = null
          const fallback = translate("aiChipPottery", selectedLanguage)
          setAiMessages((prev) => [
            ...prev,
            { sender: "user", text: fallback, voiceUrl: payload.dataUrl },
          ])
          handleSendAiMessage(fallback)
          showToast("🎙️ Voice note recorded & sent.")
        },
        onCancel: () => {
          setAiIsListening(false)
          aiStopListeningRef.current = null
          showToast("Voice recording cancelled.")
        },
      },
    )

    if (stopFn) {
      aiStopListeningRef.current = stopFn
    } else {
      setAiIsListening(false)
      const fallback = translate("aiChipPottery", selectedLanguage)
      setAiInputMessage(fallback)
      showToast("Speech recognition not supported in browser. Sample filled.")
    }
  }

  const handleSendAiMessage = (queryText?: string) => {
    const q = (queryText || aiInputMessage).trim()
    if (!q) return
    setAiMessages((prev) => [...prev, { sender: "user", text: q }])
    setAiInputMessage("")
    setAiIsTyping(true)

    setTimeout(() => {
      setAiIsTyping(false)
      const botReply = generateSahayakReply(q, selectedLanguage)
      const low = q.toLowerCase()
      const actionCategory =
        low.includes("pottery") ||
        low.includes("clay") ||
        low.includes("मिट्टी") ||
        low.includes("पॉटरी")
          ? "Pottery"
          : low.includes("textile") ||
              low.includes("silk") ||
              low.includes("weave") ||
              low.includes("रेशम") ||
              low.includes("साड़ी")
            ? "Textile"
            : low.includes("wood") ||
                low.includes("carving") ||
                low.includes("लकड़ी") ||
                low.includes("नक्काशी")
              ? "Woodwork"
              : low.includes("leather") ||
                  low.includes("चमड़ा") ||
                  low.includes("चप्पल")
                ? "Leathercraft"
                : null

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: botReply,
          action: actionCategory
            ? () => {
                setSelectedCategory(actionCategory)
                const el = document.getElementById("craft-catalog")
                el?.scrollIntoView({ behavior: "smooth" })
              }
            : undefined,
          actionLabel: actionCategory
            ? `${translate(actionCategory === "Pottery" ? "catPottery" : actionCategory === "Textile" ? "catTextile" : actionCategory === "Woodwork" ? "catWoodwork" : "catLeather", selectedLanguage)} →`
            : undefined,
        },
      ])
    }, 600)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // ─── NATIVE MOBILE SHELL BRIDGE (Expo WebView → this web app) ────────────
  // The native app shell captures photos with the device camera/gallery and
  // injects the resulting data URL here. Runs on every render so the closure
  // always sees the latest modal state. Also drains any image that was
  // injected before this page finished booting.
  useEffect(() => {
    const w = window as unknown as {
      ReactNativeWebView?: { postMessage: (msg: string) => void }
      __simplificantNativeBridge?: {
        onNativeImage: (dataUrl: string) => void
        openNativeCamera?: () => void
        openNativeGallery?: () => void
      }
      __simplificantPendingImage?: string
    }
    const postToShell = (msg: Record<string, unknown>) => {
      try {
        w.ReactNativeWebView?.postMessage(JSON.stringify(msg))
      } catch {
        /* not inside the native shell (desktop browser) */
      }
    }
    w.__simplificantNativeBridge = {
      // Preserve speechService's voice-microphone half of the bridge (installed
      // at module scope); only the photo/camera handlers depend on React state.
      ...w.__simplificantNativeBridge,
      // Android WebView has no getUserMedia — "Open Live Camera" in the web UI
      // delegates to the device camera through the native shell.
      openNativeCamera: () => postToShell({ type: "camera:take" }),
      openNativeGallery: () => postToShell({ type: "camera:gallery" }),
      onNativeImage: (dataUrl: string) => {
        if (sellerCameraOpen) {
          setSellerIncomingImage(dataUrl)
        } else if (cameraScannerOpen) {
          setScannerIncomingImage(dataUrl)
        } else {
          // No camera screen open yet: drop the photo straight into the
          // artisan upload studio so the user keeps momentum.
          setSellerIncomingImage(dataUrl)
          setSellerCameraOpen(true)
          showToast("📷 Photo captured! Opening craft upload studio…")
        }
      },
    }
    if (w.__simplificantPendingImage) {
      const pending = w.__simplificantPendingImage
      w.__simplificantPendingImage = undefined
      w.__simplificantNativeBridge?.onNativeImage(pending)
    }
  })

  const fmt = (n?: number) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`

  // ─── PERSONAL USER ACCOUNT & ROLE HANDLERS ────────────────────────────────
  const handleSwitchAccountRole = (roleKey: Role) => {
    setCurrentRole(roleKey)
    const matchedUser =
      Object.values(activeUsers).find((u) => u.role === roleKey) ||
      DEFAULT_USERS[roleKey]
    if (matchedUser) {
      setCurrentUser(matchedUser)
    }
    setIsLoggedIn(true)
    try {
      localStorage.setItem("simplificant_is_logged_in", "true")
    } catch {
      // ignore
    }
    setUserDropdownOpen(false)
    showToast(
      `Logged in as ${matchedUser?.name || roleKey.toUpperCase()} (${roleKey.toUpperCase()})`,
    )
  }

  const handleRegisterUser = (newUser: User) => {
    setActiveUsers((prev) => ({
      ...prev,
      [newUser.id]: newUser,
    }))
    setCurrentUser(newUser)
    setCurrentRole(newUser.role)
    setIsLoggedIn(true)
    try {
      localStorage.setItem("simplificant_is_logged_in", "true")
    } catch {
      // ignore
    }
    showToast(
      `Personal account registered: ${newUser.name} (${newUser.role.toUpperCase()})`,
    )
  }

  const handleLogout = () => {
    const defaultBuyer = DEFAULT_USERS.buyer
    setCurrentUser(defaultBuyer)
    setCurrentRole("buyer")
    setUserDropdownOpen(false)
    setIsLoggedIn(false)
    try {
      localStorage.setItem("simplificant_is_logged_in", "false")
    } catch {
      // ignore
    }
    showToast("Signed out of personal account. Switched to Guest Buyer.")
  }

  // ─── CART MANAGEMENT ────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    const pName = product.name[selectedLanguage] || product.name.en
    const pDesc =
      product.description[selectedLanguage] || product.description.en
    const pLoc = product.location[selectedLanguage] || product.location.en

    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        // Enforce inventory limit
        const maxStock = product.stockQuantity || 20
        if (exists.qty >= maxStock) {
          showToast(
            `Maximum available stock (${maxStock}) reached for "${pName}".`,
          )
          return prev
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...prev,
        { ...product, name: pName, description: pDesc, location: pLoc, qty: 1 },
      ]
    })
    showToast(`Added "${pName}" to your bag.`)
  }

  const handleUpdateCartQty = (id: number, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const prod = products.find((p) => p.id === id)
              const maxStock = prod?.stockQuantity || 20
              const newQty = item.qty + delta
              if (newQty > maxStock) {
                showToast(`Only ${maxStock} units available in stock.`)
                return item
              }
              return newQty > 0 ? { ...item, qty: newQty } : null
            }
            return item
          })
          .filter(Boolean) as CartItem[],
    )
  }

  const handleBuyNow = (product: Product) => {
    const pName = product.name[selectedLanguage] || product.name.en
    const pDesc =
      product.description[selectedLanguage] || product.description.en
    const pLoc = product.location[selectedLanguage] || product.location.en

    setCart([
      { ...product, name: pName, description: pDesc, location: pLoc, qty: 1 },
    ])
    setSelectedProductForDetail(null)
    setCheckoutModalOpen(true)
  }

  // ─── ORDER LIFECYCLE MANAGEMENT (SYNCHRONIZED ACROSS ROLES) ─────────────────
  const handleUpdateOrderStatus = (
    orderId: string,
    nextStatus: CustomerOrder["status"],
    completionTimestamp?: string,
  ) => {
    setCustomerOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedMilestones = o.milestones.map((m) => {
            if (nextStatus === "In Workshop" && m.stage === "crafted") {
              return { ...m, completed: true, timestamp: "Today, In Progress" }
            }
            if (
              nextStatus === "Quality Passed" &&
              (m.stage === "crafted" || m.stage === "verified")
            ) {
              return { ...m, completed: true, timestamp: "Today, Passed" }
            }
            if (
              nextStatus === "Shipped" &&
              (m.stage === "verified" || m.stage === "shipped")
            ) {
              return { ...m, completed: true, timestamp: "Today, Dispatched" }
            }
            if (nextStatus === "In Transit" && m.stage === "shipped") {
              return { ...m, completed: true, timestamp: "Today, In Transit" }
            }
            if (nextStatus === "Out for Delivery" && m.stage === "delivered") {
              return {
                ...m,
                description:
                  "Out with Delivery Agent. Share your OTP to receive package.",
              }
            }
            if (nextStatus === "Delivered") {
              return {
                ...m,
                completed: true,
                timestamp: completionTimestamp || "Today, Just now",
              }
            }
            return m
          })

          return {
            ...o,
            status: nextStatus,
            currentLocation:
              nextStatus === "Delivered"
                ? "Delivered to buyer doorstep (OTP Verified)"
                : nextStatus === "Out for Delivery"
                  ? "Out with Delivery Agent Vikram Singh"
                  : nextStatus === "Shipped"
                    ? "Dispatched with Carrier"
                    : o.currentLocation,
            milestones: updatedMilestones,
          }
        }
        return o
      }),
    )

    // Add role notifications when status updates
    const targetOrder = customerOrders.find((o) => o.id === orderId)
    if (targetOrder) {
      if (nextStatus === "Out for Delivery") {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            recipientRole: "buyer",
            title: "🛵 Package Out for Delivery!",
            message: `Your order #${orderId} is out with Agent Vikram Singh. Your handover OTP is ${targetOrder.deliveryOtp || "4921"}.`,
            timestamp: "Just now",
            read: false,
            orderId: orderId,
            type: "delivery",
          },
          ...prev,
        ])
      } else if (nextStatus === "Delivered") {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}-buyer`,
            recipientRole: "buyer",
            title: "✓ Package Delivered Successfully!",
            message: `Order #${orderId} has been delivered. Please review your handcrafted craft!`,
            timestamp: "Just now",
            read: false,
            orderId: orderId,
            type: "order",
          },
          {
            id: `notif-${Date.now()}-artisan`,
            recipientRole: "artisan",
            title: "💰 DBT Payout Released!",
            message: `₹${targetOrder.totalAmount} has been disbursed for delivered order #${orderId}.`,
            timestamp: "Just now",
            read: false,
            orderId: orderId,
            type: "payment",
          },
          ...prev,
        ])
      }
    }
  }

  // Handle advancing live delivery stage (for buyers simulating or testing delivery progress)
  const handleAdvanceOrderStage = (orderId: string) => {
    const order = customerOrders.find((o) => o.id === orderId)
    if (!order) return

    const nextMap: Record<CustomerOrder["status"], CustomerOrder["status"]> = {
      Confirmed: "In Workshop",
      Processing: "In Workshop",
      "In Workshop": "Quality Passed",
      "Quality Passed": "Shipped",
      Shipped: "In Transit",
      "In Transit": "Out for Delivery",
      "Out for Delivery": "Delivered",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
    }

    const nextStatus = nextMap[order.status] || "In Workshop"
    handleUpdateOrderStatus(orderId, nextStatus)
    showToast(`Order #${orderId} stage advanced to: ${nextStatus}`)
  }

  // Handle Order Placement from Checkout
  const handleOrderPlaced = (newOrder: CustomerOrder) => {
    setCustomerOrders((prev) => [newOrder, ...prev])
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-placed`,
        recipientRole: "buyer",
        title: "🎉 Order Confirmed via Direct Benefit Transfer!",
        message: `Order #${newOrder.id} placed for ${newOrder.productTitle}. Handover OTP: ${newOrder.deliveryOtp}`,
        timestamp: "Just now",
        read: false,
        orderId: newOrder.id,
        type: "order",
      },
      {
        id: `notif-${Date.now()}-seller`,
        recipientRole: "artisan",
        title: "🎉 New Direct Artisan Order Received!",
        message: `New order #${newOrder.id} received from ${newOrder.buyerName}. Total: ₹${newOrder.totalAmount}.`,
        timestamp: "Just now",
        read: false,
        orderId: newOrder.id,
        type: "order",
      },
      {
        id: `notif-${Date.now()}-producer`,
        recipientRole: "producer",
        title: "🏭 New Production Assignment",
        message: `Order #${newOrder.id} requires workshop preparation and inspection.`,
        timestamp: "Just now",
        read: false,
        orderId: newOrder.id,
        type: "order",
      },
      ...prev,
    ])
  }

  // Handle Customer Review Submission
  const handleSubmitReview = (
    orderId: string,
    rating: number,
    comment: string,
  ) => {
    setCustomerOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            buyerRating: rating,
            buyerReview: comment,
          }
        }
        return o
      }),
    )
  }

  // ─── FILTER PRODUCTS ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = products.filter((p) => {
      if (p.isMaterial || p.category === "Craft Materials") return false
      return productMatchesQuery(p, q, selectedLanguage, selectedCategory)
    })
    // If user searched for something and no results found in selected category, search across all categories:
    if (q && list.length === 0 && selectedCategory !== "All") {
      list = products.filter((p) => {
        if (p.isMaterial || p.category === "Craft Materials") return false
        return productMatchesQuery(p, q, selectedLanguage, "All")
      })
    }
    return list.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "b2b-price") return (b.rating || 5) - (a.rating || 5)
      return 0
    })
  }, [products, selectedCategory, searchQuery, sortBy, selectedLanguage])

  // Instant live matched products for active search bar dropdown preview
  const liveMatchedProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) {
      return products
        .filter(
          (p) =>
            !p.isMaterial &&
            p.category !== "Craft Materials" &&
            (selectedCategory === "All" || p.category === selectedCategory),
        )
        .slice(0, 4)
    }
    const allMatches = products.filter((p) =>
      productMatchesQuery(p, q, selectedLanguage, "All"),
    )
    if (selectedCategory !== "All") {
      const inCat = allMatches.filter((p) => p.category === selectedCategory)
      if (inCat.length > 0) return inCat
    }
    return allMatches
  }, [products, searchQuery, selectedCategory, selectedLanguage])

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter(
    (n) =>
      !n.read &&
      (n.recipientRole === currentRole || n.recipientRole === "admin"),
  ).length

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241C15] flex flex-col selection:bg-[#C9922E]/20">
      {/* ─── MODULE 1: EDITORIAL LANDING EXPERIENCE (BUYER ENTRY) ─────────── */}
      {currentRole === "buyer" && buyerExperience === "landing" ? (
        <EditorialLandingPage
          products={products}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          onSelectProduct={(p) => setSelectedProductForDetail(p)}
          onAddToCart={(p) => handleAddToCart(p)}
          onEnterAsBuyer={() => {
            setBuyerExperience("catalog")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          onEnterAsArtist={() => {
            handleSwitchAccountRole("artisan")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          onOpenSearch={() => {
            setBuyerExperience("catalog")
            setIsSearchFocused(true)
          }}
          onOpenCart={() => setCartOpen(true)}
          onOpenLogin={() => {
            setBuyerAuthModalOpen(true)
          }}
          onOpenBuyerLogin={() => {
            setBuyerAuthModalOpen(true)
          }}
          onOpenArtistLogin={() => {
            setArtistAuthModalOpen(true)
          }}
          onOpenWishlist={() => {
            setBuyerExperience("catalog")
            showToast("Opening craft collection.")
          }}
          cartCount={cart.reduce((s, i) => s + i.qty, 0)}
          wishlistCount={currentUser.wishlist?.length || 0}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchAccountRole}
          onPerformSearchQuery={(q) => {
            setSearchQuery(q)
            setBuyerExperience("catalog")
            handlePerformSearch(q)
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
      ) : (
        <>
          {/* Top MoSJE Official Banner (Only shown for non-buyer, non-artisan roles or maintenance) */}
          {currentRole !== "buyer" && currentRole !== "artisan" && (
            <div className="mosje-banner bg-[#241C15] text-[#F7F2E9] text-[11px] sm:text-xs py-2 px-4 border-b border-[#3A2C20]">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#C9922E] text-[#241C15] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                    MoSJE
                  </span>
                  <span className="text-[#E4DAC8] font-medium">
                    {announcementText}
                  </span>
                </div>

                <div className="mosje-extra flex items-center gap-3 text-[11px] text-[#DCA33C]">
                  <span>{translate("dbtNotice", selectedLanguage)}</span>
                  <span className="text-[#9C9182] hidden sm:inline">|</span>
                  <span className="text-[#F7F2E9] hidden sm:inline">
                    Zero Commission Marketplace
                  </span>
                </div>
              </div>
            </div>
          )}

          {siteSettings.maintenanceMode && (
            <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner animate-in fade-in">
              <span>
                ⚠️ Super Admin Alert: Platform is currently in Maintenance Mode.
                Order fulfillment and catalog updates may experience slight delays.
              </span>
            </div>
          )}

          {/* ─── APP HEADER ───────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-40 bg-[#FDFBF7] border-b border-[#E4DAC8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
                {/* LEFT: SIMPLIFICANT */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => {
                      setBuyerExperience("landing")
                      setCurrentRole("buyer")
                      setSelectedCategory("All")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="text-left cursor-pointer group"
                  >
                    <span className="font-serif text-xl sm:text-2xl font-normal text-[#241C15] tracking-[0.06em] group-hover:text-[#B7592F] transition-colors">
                      SIMPLIFICANT
                    </span>
                  </button>
                </div>

                {/* CENTER: Discover · Crafts · Stories */}
                <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-[13px] font-medium tracking-wide text-[#5B5750]">
                  <button
                    onClick={() => {
                      setBuyerExperience("landing")
                      setCurrentRole("buyer")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="hover:text-[#241C15] transition-colors cursor-pointer"
                  >
                    Discover
                  </button>
                  <span className="text-[#DACBB8] select-none text-xs">·</span>
                  <button
                    onClick={() => {
                      setBuyerExperience("catalog")
                      setCurrentRole("buyer")
                      setSelectedCategory("All")
                      const el = document.getElementById("craft-catalog")
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" })
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    }}
                    className="hover:text-[#241C15] transition-colors cursor-pointer"
                  >
                    Crafts
                  </button>
                  <span className="text-[#DACBB8] select-none text-xs">·</span>
                  <button
                    onClick={() => {
                      setCurrentRole("buyer")
                      const el = document.getElementById("explore-by-craft") || document.getElementById("craft-catalog")
                      if (el) el.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-[#241C15] transition-colors cursor-pointer"
                  >
                    Stories
                  </button>
                </nav>

                {/* RIGHT: Actions */}
                {currentRole === "artisan" ? (
                  /* ── 1. Logged-in Artist Header View ── */
                  <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-sans shrink-0">
                    {/* Subtle Search trigger */}
                    <button
                      onClick={() => setHeaderSearchExpanded(!headerSearchExpanded)}
                      className="p-1.5 text-[#6B6255] hover:text-[#241C15] rounded-full hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      title="Search"
                      aria-label="Search"
                    >
                      <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.75">
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                      </svg>
                    </button>

                    <span className="text-[#DACBB8] select-none">·</span>

                    {/* EN ▾ Language Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="text-xs font-medium text-[#5B5750] hover:text-[#241C15] transition-colors cursor-pointer flex items-center gap-1"
                        title="Language selection"
                      >
                        <span>
                          {LANGUAGES.find((l) => l.code === selectedLanguage)?.code.toUpperCase() || "EN"}
                        </span>
                        <span className="text-[8px] text-[#8C7E6D]">▾</span>
                      </button>

                      {langMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4DAC8] rounded-xl shadow-lg z-50 p-1.5 max-h-72 overflow-y-auto animate-in fade-in">
                          <div className="grid grid-cols-2 gap-0.5">
                            {LANGUAGES.map((l) => (
                              <button
                                key={l.code}
                                onClick={() => {
                                  setSelectedLanguage(l.code)
                                  setLangMenuOpen(false)
                                  showToast(`Language switched to ${l.nativeName}`)
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

                    <span className="text-[#DACBB8] select-none">·</span>

                    {/* 8830070893 ▾ Menu */}
                    <div className="relative" ref={artisanMenuRef}>
                      <button
                        onClick={() => setArtisanHeaderMenuOpen(!artisanHeaderMenuOpen)}
                        className="flex items-center gap-1 text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
                        title="Artist Studio Menu"
                      >
                        <span>{currentUser.mobile || currentSeller.phone || "8830070893"}</span>
                        <span className="text-[8px] text-[#8C7E6D]">▾</span>
                      </button>

                      {artisanHeaderMenuOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-[#FAF7F2] border border-[#E4DAC8] rounded-xl shadow-xl z-50 py-1.5 text-xs font-sans animate-in fade-in">
                          <button
                            onClick={() => {
                              setCurrentRole("artisan")
                              setArtisanStudioActiveTab("studio")
                              setArtisanHeaderMenuOpen(false)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                          >
                            My Studio
                          </button>
                          <button
                            onClick={() => {
                              setCurrentRole("artisan")
                              setArtisanStudioActiveTab("crafts")
                              setArtisanHeaderMenuOpen(false)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                          >
                            My Crafts
                          </button>
                          <button
                            onClick={() => {
                              setCurrentRole("artisan")
                              setArtisanStudioActiveTab("orders")
                              setArtisanHeaderMenuOpen(false)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                          >
                            Orders
                          </button>
                          <button
                            onClick={() => {
                              setSellerAuthModalMode("edit")
                              setSellerAuthModalOpen(true)
                              setArtisanHeaderMenuOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                          >
                            Edit Studio
                          </button>
                          <div className="border-t border-[#E4DAC8] my-1" />
                          <button
                            onClick={() => {
                              handleLogout()
                              setArtisanHeaderMenuOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 transition-colors cursor-pointer font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── 2. Buyer / Marketplace Header Right ── */
                  <div className="flex items-center gap-2.5 sm:gap-3.5 text-xs font-sans shrink-0">
                    {/* Subtle Search trigger */}
                    <button
                      onClick={() => setHeaderSearchExpanded(!headerSearchExpanded)}
                      className="p-1.5 text-[#6B6255] hover:text-[#241C15] rounded-full hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      title="Search crafts and artisans"
                      aria-label="Search"
                    >
                      <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.75">
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                      </svg>
                    </button>

                    {/* EN ▾ Language Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="text-xs font-medium text-[#5B5750] hover:text-[#241C15] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>
                          {LANGUAGES.find((l) => l.code === selectedLanguage)?.code.toUpperCase() || "EN"}
                        </span>
                        <span className="text-[8px] text-[#8C7E6D]">▾</span>
                      </button>

                      {langMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4DAC8] rounded-xl shadow-lg z-50 p-1.5 max-h-72 overflow-y-auto animate-in fade-in">
                          <div className="grid grid-cols-2 gap-0.5">
                            {LANGUAGES.map((l) => (
                              <button
                                key={l.code}
                                onClick={() => {
                                  setSelectedLanguage(l.code)
                                  setLangMenuOpen(false)
                                  showToast(`Language switched to ${l.nativeName}`)
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

                    <span className="text-[#DACBB8] select-none hidden sm:inline">·</span>

                    {/* Account: if logged in as artisan, show phone dropdown; if buyer, show buyer dropdown; if guest, show login */}
                    {isLoggedIn && (currentUser.role === "artisan" || currentRole === "artisan") ? (
                      <div className="relative" ref={artisanMenuRef}>
                        <button
                          onClick={() => setArtisanHeaderMenuOpen(!artisanHeaderMenuOpen)}
                          className="flex items-center gap-1 text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
                        >
                          <span>{currentUser.mobile || currentSeller.phone || "8830070893"}</span>
                          <span className="text-[8px] text-[#8C7E6D]">▾</span>
                        </button>

                        {artisanHeaderMenuOpen && (
                          <div className="absolute right-0 mt-2 w-44 bg-[#FAF7F2] border border-[#E4DAC8] rounded-xl shadow-xl z-50 py-1.5 text-xs font-sans animate-in fade-in">
                            <button
                              onClick={() => {
                                setCurrentRole("artisan")
                                setArtisanStudioActiveTab("studio")
                                setArtisanHeaderMenuOpen(false)
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                            >
                              My Studio
                            </button>
                            <button
                              onClick={() => {
                                setCurrentRole("artisan")
                                setArtisanStudioActiveTab("crafts")
                                setArtisanHeaderMenuOpen(false)
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                            >
                              My Crafts
                            </button>
                            <button
                              onClick={() => {
                                setCurrentRole("artisan")
                                setArtisanStudioActiveTab("orders")
                                setArtisanHeaderMenuOpen(false)
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                            >
                              Orders
                            </button>
                            <button
                              onClick={() => {
                                setSellerAuthModalMode("edit")
                                setSellerAuthModalOpen(true)
                                setArtisanHeaderMenuOpen(false)
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer font-medium"
                            >
                              Edit Studio
                            </button>
                            <div className="border-t border-[#E4DAC8] my-1" />
                            <button
                              onClick={() => {
                                handleLogout()
                                setArtisanHeaderMenuOpen(false)
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 transition-colors cursor-pointer font-medium"
                            >
                              Logout
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isLoggedIn ? (
                      <div className="relative">
                        <button
                          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                          className="flex items-center gap-1 text-xs font-medium text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
                        >
                          <span className="truncate max-w-[100px]">{currentUser.name || currentUser.mobile}</span>
                          <span className="text-[8px] text-[#8C7E6D]">▾</span>
                        </button>

                        {userDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-[#FAF7F2] border border-[#E4DAC8] rounded-xl shadow-xl z-50 py-1.5 text-xs font-sans animate-in fade-in">
                            <div className="px-4 py-2 border-b border-[#E4DAC8]">
                              <p className="font-semibold text-[#241C15] truncate">{currentUser.name}</p>
                              <p className="text-[10px] text-[#8C7E6D]">{currentUser.mobile}</p>
                            </div>
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false)
                                setTrackingLookupOrderId(null)
                                setCustomerOrdersModalOpen(true)
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer"
                            >
                              My Orders ({customerOrders.length})
                            </button>
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false)
                                setCurrentRole("artisan")
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#EFE8D8] text-[#241C15] transition-colors cursor-pointer"
                            >
                              Artisan Studio
                            </button>
                            <div className="border-t border-[#E4DAC8] my-1" />
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false)
                                handleLogout()
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 transition-colors cursor-pointer"
                            >
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setBuyerAuthModalOpen(true)}
                          className="text-xs font-medium text-[#5B5750] hover:text-[#241C15] transition-colors cursor-pointer"
                        >
                          Login as Buyer
                        </button>
                        <button
                          onClick={() => setArtistAuthModalOpen(true)}
                          className="text-xs font-medium text-[#B7592F] hover:text-[#964724] transition-colors cursor-pointer"
                        >
                          Login as Artist
                        </button>
                      </div>
                    )}

                    {/* Subtle Bag / Cart */}
                    <button
                      onClick={() => setCartOpen(true)}
                      className="relative p-1.5 text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
                      title="Shopping bag"
                      aria-label="Shopping Bag"
                    >
                      <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.75">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                      {cart.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#B7592F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {cart.reduce((s, i) => s + i.qty, 0)}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Search Overlay (When user clicks Search) */}
            {headerSearchExpanded && (
              <div ref={headerSearchRef} className="border-t border-[#E4DAC8] bg-[#FAF7F2] px-4 sm:px-8 py-3 animate-in fade-in">
                <div className="max-w-2xl mx-auto space-y-2 relative">
                  <div className="flex items-center bg-white border border-[#E4DAC8] rounded-xl px-3 py-2 focus-within:border-[#B7592F] shadow-xs">
                    <span className="text-[#8C7E6D] text-xs mr-2">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handlePerformSearch(searchQuery)
                          setHeaderSearchExpanded(false)
                        }
                      }}
                      placeholder={translate("searchPlaceholder", selectedLanguage)}
                      className="w-full text-xs sm:text-sm text-[#241C15] bg-transparent outline-none placeholder:text-[#8C7E6D]"
                      autoFocus
                    />
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <button
                        onClick={() => {
                          setCameraScannerOpen(true)
                          setHeaderSearchExpanded(false)
                        }}
                        className="px-1.5 py-0.5 hover:bg-[#FAF7F2] rounded text-xs text-[#6B6255] hover:text-[#241C15] transition-colors cursor-pointer"
                        title="AI Camera Price Scanner"
                      >
                        📷
                      </button>
                      <button
                        onClick={() => {
                          setIsVoiceSearching(true)
                          setHeaderSearchExpanded(false)
                        }}
                        className="px-1.5 py-0.5 hover:bg-[#FAF7F2] rounded text-xs text-[#6B6255] hover:text-[#241C15] transition-colors cursor-pointer"
                        title="Voice Search"
                      >
                        🎙️
                      </button>
                      <button
                        onClick={() => {
                          handlePerformSearch(searchQuery)
                          setHeaderSearchExpanded(false)
                        }}
                        className="px-3 py-1 bg-[#B7592F] hover:bg-[#964724] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                      >
                        Search
                      </button>
                      <button
                        onClick={() => setHeaderSearchExpanded(false)}
                        className="px-1.5 py-0.5 hover:bg-[#FAF7F2] rounded text-xs text-[#8C7E6D] hover:text-[#241C15] cursor-pointer"
                        title="Close Search"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Matched product quick results when typing */}
                  {searchQuery.trim() && liveMatchedProducts.length > 0 && (
                    <div className="bg-white border border-[#E4DAC8] rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto space-y-1">
                      {liveMatchedProducts.slice(0, 4).map((p) => {
                        const pName = p.name[selectedLanguage] || p.name.en
                        return (
                          <div
                            key={p.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setSelectedProductForDetail(p)
                              setHeaderSearchExpanded(false)
                            }}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#FAF7F2] cursor-pointer"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img src={p.image} alt={pName} className="w-8 h-8 rounded object-cover" />
                              <span className="text-xs text-[#241C15] font-medium truncate">{pName}</span>
                            </div>
                            <span className="text-xs font-bold text-[#B7592F] shrink-0 ml-2">₹{p.price}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
      </header>

      {/* ─── Toast Notification Overlay ────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#241C15] text-[#F7F2E9] p-4 rounded-3xl border border-[#C9922E]/40 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="text-[#C9922E] text-base">✦</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8C7E6D] hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <main className="main-content flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ================================================================= */}
        {/* ROLE VIEW 1: BUYER STOREFRONT                                     */}
        {/* ================================================================= */}
        {currentRole === "buyer" && (
          <div className="space-y-12">
            {/* ─── 1. HERO ─── */}
            <section className="relative rounded-3xl overflow-hidden border border-[#E4DAC8] bg-[#FAF7F2] text-[#241C15] p-8 sm:p-14 lg:p-16">
              <div className="max-w-2xl space-y-4">
                <span className="text-[11px] font-semibold tracking-[0.25em] text-[#B7592F] uppercase block font-sans">
                  CRAFTS WITH A STORY
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#241C15] font-normal leading-[1.15] tracking-tight">
                  Made by hands. <br />
                  Found with meaning.
                </h1>
                <p className="text-sm sm:text-base text-[#6B6255] font-normal leading-relaxed max-w-xl font-sans">
                  Discover handmade pieces shaped by Indian craft traditions and the people who keep them alive.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById("explore-by-craft") || document.getElementById("craft-catalog")
                      el?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="inline-flex items-center gap-2 bg-[#241C15] hover:bg-[#3A2C20] text-[#FDFBF7] px-7 py-3.5 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all shadow-xs hover:shadow cursor-pointer font-sans"
                  >
                    <span>Explore Crafts</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ─── 2. CATEGORY NAVIGATION ─── */}
            <div className="category-editorial-row bg-[#FAF7F2] border-y border-[#E4DAC8] py-0 px-4 sm:px-6 rounded-2xl">
              <nav
                aria-label="Craft Categories"
                className="flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-none py-3.5 text-xs sm:text-[13px] font-sans"
              >
                {[
                  { id: "All", label: "All Crafts" },
                  { id: "Pottery", label: "Pottery" },
                  { id: "Textile", label: "Textiles" },
                  { id: "Woodwork", label: "Woodwork" },
                  { id: "Metalwork", label: "Metalwork" },
                  { id: "Jewelry", label: "Jewelry" },
                  { id: "Handicrafts", label: "Decor" },
                  { id: "Folk & Tribal Art", label: "Folk Art" },
                  { id: "Bamboo & Cane", label: "Bamboo" },
                  { id: "Stone Craft", label: "Stone" },
                  { id: "Leather Craft", label: "Leather" },
                ].map((cat, idx, arr) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <React.Fragment key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id)
                          handlePerformSearch(searchQuery, cat.id)
                        }}
                        className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                          isActive
                            ? "text-[#B7592F] font-semibold border-b-2 border-[#B7592F] -mb-[2px]"
                            : "text-[#241C15] hover:text-[#B7592F] font-normal"
                        }`}
                      >
                        {cat.label}
                      </button>
                      {idx < arr.length - 1 && (
                        <span className="text-[#E4DAC8] text-xs select-none">·</span>
                      )}
                    </React.Fragment>
                  )
                })}
              </nav>
            </div>

            {/* ─── 3. SEARCH ─── */}
            <div ref={heroSearchRef} className="max-w-xl mx-auto w-full relative">
              <div className="relative flex items-center bg-white border border-[#E4DAC8] rounded-xl px-4 py-3 shadow-xs hover:border-[#B7592F]/60 focus-within:border-[#B7592F] focus-within:ring-2 focus-within:ring-[#B7592F]/15 transition-all">
                <svg
                  className="w-4 h-4 text-[#8C7E6D] shrink-0 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsHeroSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePerformSearch(searchQuery)
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Search crafts"
                  className="w-full text-xs sm:text-sm text-[#241C15] placeholder:text-[#8C7E6D] bg-transparent outline-none font-sans"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-[#8C7E6D] hover:text-[#241C15] text-xs font-semibold cursor-pointer shrink-0"
                    title="Clear search"
                  >
                    ✕
                  </button>
                ) : (
                  <div className="flex items-center gap-1 shrink-0 text-[#8C7E6D]">
                    <button
                      onClick={() => setCameraScannerOpen(true)}
                      title="AI Camera Price Scanner"
                      className="p-1.5 hover:text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsVoiceSearching(true)}
                      title="Voice search"
                      className="p-1.5 hover:text-[#241C15] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Hero Live Matched Products Popover */}
              {isHeroSearchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E4DAC8] rounded-2xl shadow-xl p-4 text-left space-y-3 animate-in fade-in z-50 max-h-[420px] overflow-y-auto">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E4DAC8]">
                    <span className="text-xs text-[#6B6255]">
                      Matching <strong>"{searchQuery}"</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-[#B7592F]">
                      {liveMatchedProducts.length} crafts
                    </span>
                  </div>
                  {liveMatchedProducts.length > 0 ? (
                    <div className="divide-y divide-[#E4DAC8]/40">
                      {liveMatchedProducts.slice(0, 5).map((item) => {
                        const pName = item.name[selectedLanguage] || item.name.en
                        const pLoc = item.location[selectedLanguage] || item.location.en
                        return (
                          <div
                            key={item.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setSelectedProductForDetail(item)
                              setIsHeroSearchFocused(false)
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                          >
                            <img
                              src={item.image}
                              alt={pName}
                              className="w-12 h-12 rounded-xl object-cover border border-[#E4DAC8] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-[#241C15] group-hover:text-[#B7592F] transition-colors truncate">
                                <HighlightMatch text={pName} query={searchQuery} />
                              </h4>
                              <p className="text-[11px] text-[#8C7E6D] truncate">
                                {item.artisan} • {pLoc.split(",")[0]}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-[#B7592F] shrink-0">
                              ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-[#8C7E6D]">
                      No crafts found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── 4. POPULAR CRAFTS -> EXPLORE BY CRAFT ─── */}
            <section id="explore-by-craft" className="space-y-6 pt-2">
              <div className="flex items-baseline justify-between border-b border-[#E4DAC8] pb-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#241C15] font-normal tracking-tight">
                  Explore by Craft
                </h3>
                <span className="text-xs text-[#8C7E6D] font-sans">
                  Living artisan traditions
                </span>
              </div>

              {/* Large Product Imagery & Minimal Labels Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  {
                    craftLabel: "Blue Pottery",
                    locationLabel: "Jaipur",
                    category: "Pottery",
                    product: products.find((p) => p.category === "Pottery"),
                  },
                  {
                    craftLabel: "Banarasi Weave",
                    locationLabel: "Varanasi",
                    category: "Textile",
                    product: products.find((p) => p.category === "Textile"),
                  },
                  {
                    craftLabel: "Walnut Woodwork",
                    locationLabel: "Kashmir",
                    category: "Woodwork",
                    product: products.find((p) => p.category === "Woodwork"),
                  },
                  {
                    craftLabel: "Dhokra Metalwork",
                    locationLabel: "Bastar",
                    category: "Metalwork",
                    product: products.find((p) => p.category === "Metalwork"),
                  },
                ].map((item, idx) => {
                  if (!item.product) return null
                  const prod = item.product
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedCategory(item.category)
                        setSelectedProductForDetail(prod)
                      }}
                      className="group cursor-pointer flex flex-col space-y-2.5"
                    >
                      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8]">
                        <img
                          src={prod.image}
                          alt={item.craftLabel}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm sm:text-base font-serif font-normal text-[#241C15] group-hover:text-[#B7592F] transition-colors">
                          {item.craftLabel}
                        </h4>
                        <p className="text-xs text-[#8C7E6D] font-sans">
                          {item.locationLabel}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ─── 5. CATALOG SECTION (MORE PRODUCTS) ─── */}
            <div id="craft-catalog" className="pt-6 space-y-6">
              <div className="flex flex-col gap-4 pb-4 border-b border-[#E4DAC8]">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-normal text-[#241C15] font-serif">
                      {selectedCategory === "All"
                        ? "All Crafts"
                        : selectedCategory === "Pottery"
                          ? "Pottery"
                          : selectedCategory === "Textile"
                            ? "Textiles"
                            : selectedCategory === "Woodwork"
                              ? "Woodwork"
                              : selectedCategory === "Metalwork"
                                ? "Metalwork"
                                : selectedCategory === "Jewelry"
                                  ? "Jewelry"
                                  : selectedCategory === "Handicrafts"
                                    ? "Decor"
                                    : selectedCategory === "Folk & Tribal Art"
                                      ? "Folk Art"
                                      : selectedCategory === "Bamboo & Cane"
                                        ? "Bamboo"
                                        : selectedCategory === "Stone Craft"
                                          ? "Stone"
                                          : "Leather"}{" "}
                      <span className="text-lg text-[#8C7E6D] font-sans font-light">
                        ({filteredProducts.length})
                      </span>
                    </h2>
                    <p className="text-xs text-[#8C7E6D] font-sans mt-0.5">
                      Authentic handmade pieces direct from master artisan guilds
                    </p>
                  </div>

                  {/* Sort selector */}
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="text-[#8C7E6D]">
                      {translate("sortBy", selectedLanguage)}:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="p-1.5 rounded-lg border border-[#E4DAC8] bg-white text-xs font-medium text-[#241C15] outline-none cursor-pointer"
                    >
                      <option value="featured">
                        {translate("sortFeatured", selectedLanguage)}
                      </option>
                      <option value="price-asc">
                        {translate("sortPriceAsc", selectedLanguage)}
                      </option>
                      <option value="price-desc">
                        {translate("sortPriceDesc", selectedLanguage)}
                      </option>
                      <option value="b2b-price">
                        {translate("sortRating", selectedLanguage)}
                      </option>
                    </select>
                  </div>
                </div>

                {searchQuery.trim() && (
                  <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#E4DAC8] rounded-2xl px-4 py-2.5 mt-2">
                    <div className="flex items-center gap-2 text-xs truncate">
                      <span className="text-[#8C7E6D]">Active search filter:</span>
                      <strong className="text-[#B7592F] font-serif font-bold text-sm bg-white px-2.5 py-0.5 rounded-lg border border-[#E4DAC8] truncate">
                        "{searchQuery}"
                      </strong>
                      <span className="text-[11px] font-bold text-[#6B6255] bg-[#EFE8D8] px-2 py-0.5 rounded-full shrink-0">
                        {filteredProducts.length} crafts matched
                      </span>
                    </div>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-semibold text-[#8C7E6D] hover:text-[#B7592F] flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      title="Clear search query"
                    >
                      <span>Clear search</span>
                      <span className="w-4 h-4 rounded-full bg-white border border-[#E4DAC8] flex items-center justify-center text-[10px]">✕</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Cards Grid */}
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const pName =
                    product.name[selectedLanguage] || product.name.en
                  const pDesc =
                    product.description[selectedLanguage] ||
                    product.description.en
                  const pLoc =
                    product.location[selectedLanguage] || product.location.en

                  return (
                    <div
                      key={product.id}
                      className="group rounded-3xl border border-[#E4DAC8] bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C9922E]/50 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div
                          onClick={() => setSelectedProductForDetail(product)}
                          className="relative aspect-4/3 overflow-hidden bg-[#FAF7F2] cursor-pointer"
                        >
                          <img
                            src={product.image}
                            alt={pName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                            }}
                          />
                          {product.gi_tagged && (
                            <span className="absolute top-2.5 right-2.5 bg-[#C9922E] text-[#241C15] text-[9.5px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                              GI Certified
                            </span>
                          )}
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#241C15]/85 text-[#F7F2E9] tracking-wide font-sans">
                            {product.category}
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="p-4 space-y-2">
                          <h3
                            onClick={() => setSelectedProductForDetail(product)}
                            className="text-base font-normal font-serif text-[#241C15] line-clamp-2 group-hover:text-[#B7592F] transition-colors cursor-pointer"
                          >
                            <HighlightMatch text={pName} query={searchQuery} />
                          </h3>
                          <p className="text-xs text-[#6B6255] line-clamp-2 leading-relaxed font-sans">
                            {pDesc}
                          </p>

                          {/* Price in INR */}
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className="text-xl font-normal text-[#241C15] font-serif">
                                {fmt(product.price)}
                              </span>
                              <span className="text-[10px] text-[#8C7E6D] block font-sans">
                                Direct to artisan
                              </span>
                            </div>

                            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-sans">
                              {product.stockQuantity || 12} in stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Action Buttons */}
                      <div className="p-4 pt-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 rounded-xl bg-[#241C15] hover:bg-[#3A2C20] py-2.5 text-xs font-medium text-[#F7F2E9] transition-colors shadow-xs cursor-pointer text-center font-sans"
                          >
                            {translate("buyNow", selectedLanguage)}
                          </button>

                          <button
                            onClick={() => handleAddToCart(product)}
                            title="Add to Bag"
                            className="h-9 px-3 rounded-xl border border-[#E4DAC8] bg-[#FAF7F2] hover:bg-[#EFE8D8] text-xs font-medium text-[#241C15] transition-colors shrink-0 cursor-pointer font-sans"
                          >
                            + Bag
                          </button>

                          <button
                            onClick={() => {
                              setShareTargetProduct(product)
                              setShareModalOpen(true)
                            }}
                            title="Share on WhatsApp, Telegram, etc."
                            className="h-9 w-9 rounded-full border border-[#E4DAC8] bg-[#FAF7F2] hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-center text-[#241C15] hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                          >
                            💬
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#8C7E6D] border-t border-[#E4DAC8]/60 pt-2">
                          <span>
                            {translate("byArtisan", selectedLanguage)}{" "}
                            <strong>{product.artisan}</strong>
                          </span>
                          <span>{pLoc.split(",")[0]}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-[#FAF7F2] rounded-3xl border border-[#E4DAC8] p-8 space-y-4">
                    <span className="text-4xl">🔍</span>
                    <h3 className="text-lg font-bold font-serif text-[#241C15]">
                      No Handcrafted Items Found
                    </h3>
                    <p className="text-xs text-[#6B6255] max-w-md mx-auto">
                      We couldn't find any crafts matching "{searchQuery}". Try searching for regional craft names like "Jaipur pottery", "Banarasi silk", "Kashmir wood", or browse other categories.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCategory("All")
                        }}
                        className="bg-[#241C15] text-[#F7F2E9] hover:bg-[#3A2C20] px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE VIEW 2: ARTISAN & SELLER WORKPLACE                           */}
        {/* ================================================================= */}
        {currentRole === "artisan" && (
          <div className="space-y-8 animate-in fade-in">
            <SellerWorkplaceDashboard
              seller={currentSeller}
              products={products}
              orders={customerOrders}
              onOpenUploadModal={() => setSellerCameraOpen(true)}
              onOpenEditProfile={() => {
                setSellerAuthModalMode("edit")
                setSellerAuthModalOpen(true)
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSwitchToBuyer={() => setCurrentRole("buyer")}
              showToast={showToast}
              activeTab={artisanStudioActiveTab}
              onTabChange={(t) => setArtisanStudioActiveTab(t)}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE VIEW 3: PRODUCER & WORKSHOP DASHBOARD                        */}
        {/* ================================================================= */}
        {currentRole === "producer" && (
          <div className="space-y-8 animate-in fade-in">
            <ProducerDashboard
              producer={currentProducer}
              products={products}
              orders={customerOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenAddProduct={() => setSellerCameraOpen(true)}
              showToast={showToast}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE VIEW 4: DELIVERY AGENT DASHBOARD                             */}
        {/* ================================================================= */}
        {currentRole === "delivery" && (
          <div className="space-y-8 animate-in fade-in">
            <DeliveryAgentDashboard
              agent={currentDeliveryAgent}
              orders={customerOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              showToast={showToast}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE VIEW 5: MAIN ADMIN DASHBOARD                                */}
        {/* ================================================================= */}
        {currentRole === "admin" && (
          <div className="space-y-8 animate-in fade-in">
            <AdminDashboard
              products={products}
              orders={customerOrders}
              users={activeUsers}
              onToggleProductStatus={(id) => {
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === id
                      ? { ...p, isActive: p.isActive === false ? true : false }
                      : p,
                  ),
                )
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateProduct={(updated) => {
                setProducts((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p)),
                )
                showToast(
                  `Handmade craft "${updated.name.en || updated.name[selectedLanguage]}" updated successfully.`,
                )
              }}
              onDeleteProduct={(id) => {
                setProducts((prev) => prev.filter((p) => p.id !== id))
                showToast(`Product ID #${id} removed from marketplace catalog.`)
              }}
              onAddProduct={(newProd) => {
                setProducts((prev) => [newProd, ...prev])
                showToast(
                  `New handmade craft "${newProd.name.en || newProd.name[selectedLanguage]}" added to platform!`,
                )
              }}
              onUpdateOrderFull={(updatedOrder) => {
                setCustomerOrders((prev) =>
                  prev.map((o) =>
                    o.id === updatedOrder.id ? updatedOrder : o,
                  ),
                )
                showToast(
                  `Order #${updatedOrder.id} status & tracking details overridden by Super Admin.`,
                )
              }}
              onUpdateUser={(updatedUser) => {
                setActiveUsers((prev) => ({
                  ...prev,
                  [updatedUser.role || updatedUser.id]: updatedUser,
                }))
                showToast(
                  `User account "${updatedUser.name}" privileges updated.`,
                )
              }}
              onAddUser={(newUser) => {
                setActiveUsers((prev) => ({
                  ...prev,
                  [newUser.id]: newUser,
                }))
                showToast(
                  `New platform user "${newUser.name}" created with role ${newUser.role?.toUpperCase()}.`,
                )
              }}
              announcementText={announcementText}
              onUpdateAnnouncement={(txt) => {
                setAnnouncementText(txt)
                showToast(
                  "Global announcement banner updated across the entire website.",
                )
              }}
              siteSettings={siteSettings}
              onUpdateSiteSettings={(settings) => {
                setSiteSettings(settings)
                showToast("Platform operational & security settings updated.")
              }}
              selectedLanguage={selectedLanguage}
              showToast={showToast}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE VIEW 6: B2B & GOVERNMENT GeM PORTAL                          */}
        {/* ================================================================= */}
        {currentRole === "b2b_gov" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#35415E]">
                Institutional Linkage & Procurement
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#241C15] font-serif">
                B2B Wholesale & Government GeM Procurement Portal
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => {
                const pName = p.name[selectedLanguage] || p.name.en
                const pLoc = p.location[selectedLanguage] || p.location.en
                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl border border-[#E4DAC8] bg-white shadow-xs space-y-3"
                  >
                    <div className="flex gap-4">
                      <img
                        src={p.image}
                        alt={pName}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#E4DAC8] shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-[#C9922E] uppercase">
                          {p.category} GI Tagged
                        </span>
                        <h3 className="text-sm font-bold font-serif text-[#241C15] line-clamp-2">
                          {pName}
                        </h3>
                        <p className="text-xs text-[#6B6255] mt-0.5">{pLoc}</p>
                      </div>
                    </div>

                    <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E4DAC8] text-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#8C7E6D] block">
                          Wholesale Rate:
                        </span>
                        <span className="font-bold text-[#35415E] text-base">
                          {fmt(p.b2b_price || p.price * 0.75)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          showToast(
                            `Bulk procurement enquiry submitted for ${pName}`,
                          )
                        }
                        className="bg-[#241C15] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#3A2C20] cursor-pointer"
                      >
                        GeM Inquiry
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ─── FLOATING SAHAYAK AI ASSISTANT WIDGET ──────────────────────────── */}
      <div className="fixed bottom-6 left-6 z-50">
        {!aiAssistantOpen ? (
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-2.5 bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] border border-[#C9922E]/50 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <span className="w-6 h-6 rounded-full bg-[#C9922E] flex items-center justify-center text-xs text-[#241C15] font-bold group-hover:rotate-12 transition-transform">
              ✨
            </span>
            <div className="text-left">
              <span className="block text-xs font-bold text-[#F7F2E9] font-serif">
                {translate("aiTitle", selectedLanguage)}
              </span>
              <span className="block text-[10px] text-[#C9922E]">
                {translate("aiSub", selectedLanguage)}
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </button>
        ) : (
          <div className="w-[340px] sm:w-[390px] bg-white rounded-3xl border border-[#E4DAC8] shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-[#241C15] text-[#F7F2E9] p-3.5 flex items-center justify-between border-b border-[#3A2C20]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#C9922E] flex items-center justify-center text-xs text-[#241C15] font-bold">
                  ✨
                </span>
                <div>
                  <h4 className="text-xs font-bold font-serif text-[#F7F2E9]">
                    {translate("aiTitle", selectedLanguage)}
                  </h4>
                  <p className="text-[10px] text-[#DCA33C]">
                    {translate("aiSub", selectedLanguage)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (aiIsListening) {
                    speechService.stopListening()
                    setAiIsListening(false)
                  }
                  stopSpeaking()
                  setAiAssistantOpen(false)
                }}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Active Voice Listening Banner */}
            {aiIsListening && (
              <div className="bg-[#B7592F] text-white px-3.5 py-2 text-xs flex items-center justify-between gap-2 animate-pulse">
                <div className="flex items-center gap-2 font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{translate("aiListening", selectedLanguage)}</span>
                </div>
                <button
                  onClick={handleToggleAiMic}
                  className="text-[10px] bg-white/25 hover:bg-white/40 text-white px-2.5 py-0.5 rounded-full font-bold cursor-pointer"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-[#FAF7F2] border-b border-[#E4DAC8] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10.5px]">
              {[
                {
                  key: "aiChipPottery",
                  query: "Jaipur Blue Pottery non-clay quartz",
                },
                {
                  key: "aiChipTextiles",
                  query: "Banarasi Mulberry Silk Handloom",
                },
                {
                  key: "aiChipLeather",
                  query: "Kolhapuri Vegetable Tanned Leather",
                },
                {
                  key: "aiChipDirect",
                  query: "Direct Benefit Transfer zero commission",
                },
              ].map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => handleSendAiMessage(chip.query)}
                  className="bg-white hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  {translate(chip.key, selectedLanguage)}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FDFBF7] text-xs">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-[#241C15] text-[#F7F2E9] rounded-br-xs"
                        : "bg-[#FAF7F2] border border-[#E4DAC8] text-[#241C15] rounded-bl-xs shadow-xs"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>

                    {msg.voiceUrl && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#C9922E]">
                          🎙️ Voice note
                        </span>
                        <audio
                          controls
                          src={msg.voiceUrl}
                          preload="metadata"
                          className="h-9 w-full max-w-[200px]"
                        />
                      </div>
                    )}

                    {msg.sender === "ai" && (
                      <div className="flex items-center gap-2 mt-2 pt-1 border-t border-[#E4DAC8]/40">
                        <button
                          onClick={() => speakText(msg.text, selectedLanguage)}
                          title="Listen to this explanation"
                          className="flex items-center gap-1 text-[10px] text-[#B7592F] hover:text-[#964724] font-bold bg-[#B7592F]/10 hover:bg-[#B7592F]/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <span>🔊</span>
                          <span>Listen</span>
                        </button>

                        {msg.action && msg.actionLabel && (
                          <button
                            onClick={() => {
                              msg.action?.()
                              setAiAssistantOpen(false)
                            }}
                            className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold px-2.5 py-0.5 rounded-full text-[10px] transition-colors shadow-xs cursor-pointer"
                          >
                            {msg.actionLabel}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiIsTyping && (
                <div className="flex justify-start">
                  <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] text-[#8C7E6D] text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar with Voice Mic Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendAiMessage()
              }}
              className="p-2.5 bg-white border-t border-[#E4DAC8] flex items-center gap-2"
            >
              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={handleToggleAiMic}
                title={
                  aiIsListening
                    ? "Stop Voice Input"
                    : "Speak to Sahayak (Microphone)"
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all cursor-pointer ${
                  aiIsListening
                    ? "bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400"
                    : "bg-[#EFE8D8] hover:bg-[#C9922E]/20 text-[#241C15]"
                }`}
              >
                🎙️
              </button>

              <input
                type="text"
                value={aiInputMessage}
                onChange={(e) => setAiInputMessage(e.target.value)}
                placeholder={translate("aiPlaceholder", selectedLanguage)}
                className="flex-1 rounded-full border border-[#E4DAC8] bg-[#FAF7F2] px-3.5 py-1.5 text-xs text-[#241C15] outline-none focus:border-[#C9922E]"
              />
              <button
                type="submit"
                disabled={!aiInputMessage.trim()}
                className="w-8 h-8 rounded-full bg-[#241C15] hover:bg-[#3A2C20] disabled:opacity-40 text-white flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-xs"
              >
                ↑
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-[#241C15] text-[#F7F2E9] border-t border-[#3A2C20] py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-serif text-[#F7F2E9]">
                SIMPLIFICANT
              </span>
              <span className="text-[10px] bg-[#C9922E]/20 text-[#C9922E] px-2 py-0.5 rounded-full font-bold">
                MoSJE Digital Artisan OS
              </span>
            </div>
            <p className="text-[#B0A489] text-[11px] mt-0.5">
              Empowering Marginalized Artisans, Weavers & Micro-Enterprises
              Across India.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#8C7E6D] text-[11px]">
            <button
              onClick={() => setSupportChatOpen(true)}
              className="hover:text-white cursor-pointer font-bold"
            >
              💬 Buyer Support Helpdesk
            </button>
            <span>•</span>
            <span>Department of Social Justice and Empowerment</span>
          </div>
        </div>
      </footer>
    </>
  )}

      {/* ─── MODAL: CAMERA FEATURE 1 - BUYER AI PRICE SCANNER ──────────────── */}
      <CameraPriceScannerModal
        isOpen={cameraScannerOpen}
        nativeIncomingImage={scannerIncomingImage}
        consumeNativeIncomingImage={() => setScannerIncomingImage(null)}
        onClose={() => setCameraScannerOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectMatchingCrafts={(categoryOrName) => {
          setSearchQuery(categoryOrName)
        }}
        onOpenArtisanSellWithData={(valuation, imageUrl) => {
          setPrefillValuationForSeller(valuation)
          setPrefillImageUrlForSeller(imageUrl)
          setSellerCameraOpen(true)
        }}
        onBuyCraftFromValuation={(val) => {
          const match = products.find((p) => p.category === val.category)
          if (match) {
            handleBuyNow(match)
          } else {
            setSelectedCategory(val.category)
            setCurrentRole("buyer")
          }
        }}
        onShareValuation={(val, img) => {
          setShareTargetValuation({ valuation: val, imageUrl: img })
          setShareTargetProduct(null)
          setShareModalOpen(true)
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: ADD ANY CRAFT OR RAW MATERIAL (FOR BUYERS & ARTISANS) ──── */}
      <AddCraftOrMaterialModal
        isOpen={addCraftModalOpen}
        onClose={() => setAddCraftModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onProductPublished={(newProduct) => {
          setProducts((prev) => {
            const merged = [newProduct, ...prev]
            localStorage.setItem("simplificant_products_2026_handmade_v5", JSON.stringify(merged))
            return merged
          })
          setJustPublishedProduct(newProduct)
          setPostUploadModalOpen(true)
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: CAMERA FEATURE 2 - SELLER CAMERA & AI STUDIO UPLOAD ───── */}
      <SellerCameraUploadModal
        isOpen={sellerCameraOpen}
        onClose={() => {
          setSellerCameraOpen(false)
          setPrefillValuationForSeller(null)
          setPrefillImageUrlForSeller(null)
          setSellerIncomingImage(null)
        }}
        selectedLanguage={selectedLanguage}
        prefillValuation={prefillValuationForSeller}
        prefillImageUrl={prefillImageUrlForSeller}
        nativeIncomingImage={sellerIncomingImage}
        consumeNativeIncomingImage={() => setSellerIncomingImage(null)}
        onProductPublished={(newProduct) => {
          setProducts((prev) => {
            const merged = [newProduct, ...prev.filter(p => p.id !== newProduct.id)]
            localStorage.setItem("simplificant_products_2026_handmade_v5", JSON.stringify(merged))
            return merged
          })
          
          fetch("/api/v1/products?sortBy=newest")
            .then((r) => {
              if (!r.ok) return null
              return r.json()
            })
            .then((data) => {
              if (data && data.success && Array.isArray(data.data?.items) && data.data.items.length > 0) {
                const BACKEND_TO_FRONTEND_CATEGORY: Record<string, CraftCategory> = {
                  POTTERY: "Pottery", TEXTILE: "Textile", WOODWORK: "Woodwork", METALWARE: "Metalwork",
                  JEWELLERY: "Jewelry", CANE_BAMBOO: "Bamboo & Cane", STONEWORK: "Stone Craft",
                  PAINTING: "Folk & Tribal Art", OTHER: "Handicrafts"
                }
                const backendProducts = data.data.items.map((b: any) => ({
                  id: b.id, artisan_id: b.artisanId,
                  name: { en: b.title, hi: b.titleHi || b.title, mr: b.title, bn: b.title, ta: b.title, te: b.title, gu: b.title, kn: b.title, ml: b.title, pa: b.title, or: b.title, es: b.title, fr: b.title, de: b.title, ja: b.title, ar: b.title },
                  description: b.description || { en: "", hi: "" }, price: Number(b.price),
                  category: BACKEND_TO_FRONTEND_CATEGORY[b.category] || "Handicrafts",
                  image: b.cleanImageUrl || "", tags: b.tags || [], stockQuantity: b.stockQuantity || 1,
                  artisan: b.artisanName || "Verified Artisan",
                  location: { en: b.artisanGiCluster || "India", hi: b.artisanGiCluster || "India", mr: "India", bn: "India", ta: "India", te: "India", gu: "India", kn: "India", ml: "India", pa: "India", or: "India", es: "India", fr: "India", de: "India", ja: "India", ar: "India" },
                  rating: 5.0, reviews: 0, gi_tagged: b.giTagged || true,
                  materials: b.materials || []
                }))
                
                setProducts(prev => {
                  const existingMap = new Map(prev.map(p => [p.id, p]))
                  backendProducts.forEach((bp: any) => existingMap.set(bp.id, bp))
                  // Keep backend products first, then append mock products that aren't in backend
                  const merged = [
                    ...backendProducts,
                    ...prev.filter(p => !backendProducts.some((bp: any) => bp.id === p.id))
                  ]
                  const seen = new Set<string | number>()
                  const cleanMerged = merged.filter((p) => {
                    if (seen.has(p.id)) return false
                    seen.add(p.id)
                    return true
                  })
                  localStorage.setItem("simplificant_products_2026_handmade_v5", JSON.stringify(cleanMerged))
                  return cleanMerged
                })
              }
            })
            .catch(() => {})

          if (currentRole !== "artisan") {
            setCurrentRole("buyer")
            window.scrollTo({ top: 0, behavior: "smooth" })
          } else {
            showToast(`Craft added to your studio catalog!`)
          }
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: POST-UPLOAD VERIFICATION & GI PASSPORT SUCCESS ─────────── */}
      <PostUploadSuccessModal
        isOpen={postUploadModalOpen}
        onClose={() => {
          setPostUploadModalOpen(false)
          setJustPublishedProduct(null)
        }}
        product={justPublishedProduct}
        selectedLanguage={selectedLanguage}
        onViewInStorefront={() => {
          setPostUploadModalOpen(false)
          setCurrentRole("buyer")
          if (justPublishedProduct) {
            setSearchQuery(
              justPublishedProduct.name[selectedLanguage] ||
                justPublishedProduct.name.en,
            )
          }
        }}
        onAddAnother={() => {
          setPostUploadModalOpen(false)
          setJustPublishedProduct(null)
          setSellerCameraOpen(true)
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: PRODUCT DETAIL VIEW ────────────────────────────────────── */}
      <ProductDetailModal
        isOpen={Boolean(selectedProductForDetail)}
        onClose={() => setSelectedProductForDetail(null)}
        product={selectedProductForDetail}
        selectedLanguage={selectedLanguage}
        onAddToCart={(p) => {
          handleAddToCart(p)
          setSelectedProductForDetail(null)
        }}
        onBuyNow={(p) => {
          handleBuyNow(p)
        }}
        onShare={(p) => {
          setSelectedProductForDetail(null)
          setShareTargetProduct(p)
          setShareModalOpen(true)
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: CHECKOUT FLOW ──────────────────────────────────────────── */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        currentUser={currentUser}
        savedAddresses={INITIAL_SAVED_ADDRESSES}
        selectedLanguage={selectedLanguage}
        onOrderPlaced={handleOrderPlaced}
        onClearCart={() => setCart([])}
        showToast={showToast}
      />

      {/* ─── MODAL: SOCIAL MEDIA SHARING (WHATSAPP, TELEGRAM, INSTA, FB) ──── */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false)
          setShareTargetProduct(null)
          setShareTargetValuation(null)
        }}
        product={shareTargetProduct}
        valuation={shareTargetValuation?.valuation}
        imageUrl={shareTargetValuation?.imageUrl}
        selectedLanguage={selectedLanguage}
        showToast={showToast}
      />

      {/* ─── MODAL: SELLER SHOP REGISTRATION & AUTH ────────────────────────── */}
      <SellerAuthModal
        isOpen={sellerAuthModalOpen}
        onClose={() => setSellerAuthModalOpen(false)}
        currentSeller={currentSeller}
        initialMode={sellerAuthModalMode}
        onSaveSeller={(s) => {
          setCurrentSeller(s)
          try {
            localStorage.setItem("simplificant_seller", JSON.stringify(s))
          } catch {}
        }}
        onArtistAuthenticated={(artisanUser, sellerPartial) => {
          setCurrentUser(artisanUser)
          setCurrentRole("artisan")
          setIsLoggedIn(true)
          try {
            localStorage.setItem("simplificant_is_logged_in", "true")
            localStorage.setItem(
              "simplificant_current_user_v5",
              JSON.stringify(artisanUser),
            )
          } catch {}
          if (sellerPartial) {
            setCurrentSeller((prev) => ({
              ...prev,
              ...sellerPartial,
              id: artisanUser.id || prev.id,
              name: artisanUser.name || prev.name,
              phone: artisanUser.mobile || prev.phone,
            }))
          }
          setBuyerExperience("catalog")
          setSellerAuthModalOpen(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        onRegisterUser={handleRegisterUser}
        allUsers={activeUsers}
        showToast={showToast}
      />

      {/* ─── MODAL: CUSTOMER ORDERS & LIVE TRACKING ────────────────────────── */}
      <CustomerOrdersTrackingModal
        isOpen={customerOrdersModalOpen}
        onClose={() => {
          setCustomerOrdersModalOpen(false)
          setTrackingLookupOrderId(null)
        }}
        customer={{
          name: currentUser.name,
          phone: currentUser.mobile,
          isVerified: true,
        }}
        orders={customerOrders}
        selectedLanguage={selectedLanguage}
        initialOrderId={trackingLookupOrderId}
        onAdvanceOrderStage={handleAdvanceOrderStage}
        onOpenLogin={() => {
          setCustomerOrdersModalOpen(false)
          setBuyerAuthModalOpen(true)
        }}
        onReorder={(order) => {
          const orig = products.find((p) => p.id === order.productId)
          if (orig) {
            handleAddToCart(orig)
            setCustomerOrdersModalOpen(false)
            setCartOpen(true)
          }
        }}
        onCancelOrder={(orderId) => {
          handleUpdateOrderStatus(orderId, "Cancelled")
        }}
        onSubmitReview={handleSubmitReview}
        onOpenSupportChat={(orderId) => {
          setCustomerOrdersModalOpen(false)
          setSupportPrefillOrderId(orderId)
          setSupportChatOpen(true)
        }}
        showToast={showToast}
      />

      {/* ─── MODAL: UNIVERSAL MULTI-ROLE AUTH MODAL ────────────────────────── */}
      <UniversalAuthModal
        isOpen={universalAuthModalOpen}
        onClose={() => setUniversalAuthModalOpen(false)}
        onLoginSuccess={(user, role) => {
          setCurrentUser(user)
          setCurrentRole(role)
          setIsLoggedIn(true)
          try {
            localStorage.setItem("simplificant_is_logged_in", "true")
          } catch {
            // ignore
          }
          setUniversalAuthModalOpen(false)
          showToast(`Signed in as ${user.name} (${role.toUpperCase()})`)
        }}
        onRegisterUser={handleRegisterUser}
        currentUser={currentUser}
        selectedLanguage={selectedLanguage}
        allUsers={activeUsers}
        targetRoleHint={authTargetRoleHint}
      />

      {/* ─── MODAL: DEDICATED BUYER AUTH MODAL ─────────────────────────────── */}
      <BuyerAuthModal
        isOpen={buyerAuthModalOpen}
        onClose={() => setBuyerAuthModalOpen(false)}
        onLoginSuccess={(user, role) => {
          setCurrentUser(user)
          setCurrentRole(role)
          setIsLoggedIn(true)
          try {
            localStorage.setItem("simplificant_is_logged_in", "true")
            localStorage.setItem("simplificant_current_user_v5", JSON.stringify(user))
          } catch {
            // ignore
          }
          setBuyerAuthModalOpen(false)
          showToast(`Welcome back, ${user.name}`)
        }}
        onRegisterUser={handleRegisterUser}
        allUsers={activeUsers}
        showToast={showToast}
      />

      {/* ─── MODAL: DEDICATED ARTIST AUTH MODAL ────────────────────────────── */}
      <ArtistAuthModal
        isOpen={artistAuthModalOpen}
        onClose={() => setArtistAuthModalOpen(false)}
        onArtistAuthenticated={(artisanUser, sellerPartial) => {
          setCurrentUser(artisanUser)
          setCurrentRole("artisan")
          setIsLoggedIn(true)
          try {
            localStorage.setItem("simplificant_is_logged_in", "true")
            localStorage.setItem("simplificant_current_user_v5", JSON.stringify(artisanUser))
          } catch {}
          if (sellerPartial) {
            setCurrentSeller((prev) => ({
              ...prev,
              ...sellerPartial,
              id: artisanUser.id || prev.id,
              name: artisanUser.name || prev.name,
              phone: artisanUser.mobile || prev.phone,
            }))
          }
          setBuyerExperience("catalog")
          setArtistAuthModalOpen(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
        onRegisterUser={handleRegisterUser}
        allUsers={activeUsers}
        showToast={showToast}
      />

      {/* ─── MODAL: BUYER CUSTOMER SUPPORT CHAT ────────────────────────────── */}
      <BuyerSupportChatModal
        isOpen={supportChatOpen}
        onClose={() => setSupportChatOpen(false)}
        orders={customerOrders}
        prefillOrderId={supportPrefillOrderId}
        selectedLanguage={selectedLanguage}
        showToast={showToast}
      />

      {/* ─── DRAWER: SHOPPING BAG ──────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#241C15]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full border-l border-[#E4DAC8] p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between border-b border-[#E4DAC8] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  <h3 className="text-base font-bold font-serif text-[#241C15]">
                    {translate("bagTitle", selectedLanguage)}
                  </h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-sm font-bold text-[#8C7E6D] hover:text-[#241C15] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <span className="text-3xl block">🧺</span>
                  <p className="text-xs font-bold text-[#241C15]">
                    {translate("bagEmpty", selectedLanguage)}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-[#E4DAC8] bg-[#FAF7F2] flex gap-3 items-center"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E4DAC8]"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#241C15] truncate font-serif">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#C9922E] font-bold font-serif">
                          {fmt(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleUpdateCartQty(item.id, -1)}
                            className="w-5 h-5 rounded bg-[#EFE8D8] text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateCartQty(item.id, 1)}
                            className="w-5 h-5 rounded bg-[#EFE8D8] text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#E4DAC8] pt-4 space-y-3">
                <div className="flex justify-between text-sm font-bold font-serif text-[#241C15]">
                  <span>{translate("bagTotal", selectedLanguage)}</span>
                  <span>
                    {fmt(cart.reduce((s, i) => s + i.price * i.qty, 0))}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false)
                    setCheckoutModalOpen(true)
                  }}
                  className="w-full bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {translate("bagCheckout", selectedLanguage)} (
                  {fmt(cart.reduce((s, i) => s + i.price * i.qty, 0))})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: VOICE SEARCH LISTENING OVERLAY ─────────────────────────── */}
      {isVoiceSearching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241C15]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#C9922E]/50 p-6 shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setIsVoiceSearching(false)}
              className="absolute top-4 right-4 text-[#8C7E6D] hover:text-[#241C15] font-bold text-sm w-7 h-7 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#C9922E]/20 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-[#C9922E] flex items-center justify-center text-3xl shadow-lg relative z-10 text-white">
                  🎙️
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B7592F]">
                  Voice Craft Search
                </span>
                <h3 className="text-xl font-bold font-serif text-[#241C15] mt-1">
                  Listening in regional language…
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4DAC8] min-h-[64px] flex items-center justify-center">
              {voiceSearchText ? (
                <p className="text-base font-bold text-[#241C15] font-serif italic animate-in fade-in">
                  "{voiceSearchText}"
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#8C7E6D]">
                  <span className="w-2 h-2 rounded-full bg-[#C9922E] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1">
                    Say "Jaipur Pottery", "Banarasi Silk", "Channapatna"...
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                Or tap a craft voice query:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "🏺 Jaipur Blue Pottery", query: "Jaipur Pottery" },
                  { label: "🧵 Banarasi Silk Dupatta", query: "Banarasi Silk" },
                  { label: "🪵 Channapatna Toys", query: "Channapatna" },
                  { label: "⚔️ Bastar Dhokra", query: "Bastar Dhokra" },
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setVoiceSearchText(s.query)
                      setSearchQuery(s.query)
                      setTimeout(() => setIsVoiceSearching(false), 500)
                    }}
                    className="text-xs bg-[#EFE8D8] hover:bg-[#C9922E]/20 text-[#241C15] px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
