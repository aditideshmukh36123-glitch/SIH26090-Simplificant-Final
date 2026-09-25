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
  const [buyerExperience, setBuyerExperience] = useState<"landing" | "catalog">("landing")
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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false)
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false)
  const headerSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const heroSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
  const [universalAuthModalOpen, setUniversalAuthModalOpen] = useState(false)

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
            setAuthTargetRoleHint(null)
            setUniversalAuthModalOpen(true)
          }}
          onOpenBuyerLogin={() => {
            setAuthTargetRoleHint("buyer")
            setUniversalAuthModalOpen(true)
          }}
          onOpenArtistLogin={() => {
            setAuthTargetRoleHint("artisan")
            setUniversalAuthModalOpen(true)
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
          <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E4DAC8]">
            {/* Row 1: Brand, Search, Camera AI Price Scanner, Role Selector & Actions */}
            <div className="header-main-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
              <div className="header-brand-row flex items-center justify-between gap-4 lg:gap-8">
                {/* Brand Logo */}
                <button
                  onClick={() => {
                    setBuyerExperience("landing")
                    setCurrentRole("buyer")
                    setSelectedCategory("All")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="header-brand text-left shrink-0 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="brand-title text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#241C15] group-hover:text-[#B7592F] transition-colors">
                      SIMPLIFICANT
                    </span>
                    <span className="text-[10px] text-[#8C7E6D] font-light tracking-widest uppercase hidden sm:inline">
                      Artisan Marketplace
                    </span>
                  </div>
                </button>

                {/* Return to Editorial Stories link (for buyers in catalog mode) */}
                {currentRole === "buyer" && buyerExperience === "catalog" && (
                  <button
                    onClick={() => {
                      setBuyerExperience("landing")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#6B6255] hover:text-[#241C15] px-3 py-1.5 rounded-full hover:bg-[#FAF7F2] border border-[#E4DAC8]/60 transition-colors cursor-pointer shrink-0"
                  >
                    <span>←</span>
                    <span>Editorial Stories</span>
                  </button>
                )}

            {/* Global Big Search Bar (with Category Filter, 🎙️ Voice, 📷 Lens & Suggestions) */}
            <div
              ref={headerSearchRef}
              className="header-desktop-search flex-1 max-w-2xl hidden md:block relative z-30"
            >
              <div className="relative flex items-center bg-white rounded-2xl border-2 border-[#E4DAC8] focus-within:border-[#B7592F] focus-within:ring-4 focus-within:ring-[#B7592F]/10 shadow-xs transition-all">
                {/* Category Dropdown Selector */}
                <div className="relative shrink-0 border-r border-[#E4DAC8] hidden lg:block">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      handlePerformSearch(searchQuery, e.target.value)
                    }}
                    className="appearance-none bg-transparent pl-3 pr-7 py-2.5 text-xs font-bold text-[#241C15] cursor-pointer outline-none hover:text-[#B7592F] transition-colors"
                  >
                    <option value="All">All Crafts</option>
                    <option value="Pottery">🏺 Pottery</option>
                    <option value="Textile">🧵 Textile</option>
                    <option value="Woodwork">🪵 Woodwork</option>
                    <option value="Metalwork">🪙 Metalwork</option>
                    <option value="Jewelry">💍 Jewelry</option>
                    <option value="Handicrafts">🪆 Handicrafts</option>
                    <option value="Folk & Tribal Art">🎨 Folk Art</option>
                    <option value="Bamboo & Cane">🎋 Bamboo</option>
                    <option value="Stone Craft">🏛️ Stone</option>
                    <option value="Leather Craft">👞 Leather</option>
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#8C7E6D] pointer-events-none">
                    ▼
                  </span>
                </div>

                {/* Search Icon */}
                <span className="pl-3.5 text-[#8C7E6D] text-base pointer-events-none select-none">
                  🔍
                </span>

                {/* Big Search Input Field */}
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePerformSearch(searchQuery)
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={translate("searchPlaceholder", selectedLanguage)}
                  className="w-full px-3 py-2.5 text-sm text-[#241C15] font-medium placeholder:text-[#8C7E6D] bg-transparent outline-none"
                />

                {/* Action Controls Inside Search Bar */}
                <div className="flex items-center gap-1 pr-1.5 shrink-0">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      title="Clear search"
                      className="w-6 h-6 rounded-full hover:bg-[#FAF7F2] text-[#8C7E6D] hover:text-[#241C15] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}

                  {/* AI Camera Price Scanner */}
                  <button
                    onClick={() => setCameraScannerOpen(true)}
                    title="Search or Scan Crafts with AI Camera Lens"
                    className="w-8 h-8 rounded-xl hover:bg-[#FAF7F2] text-[#241C15] hover:text-[#B7592F] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  >
                    📷
                  </button>

                  {/* Voice Search Button */}
                  <button
                    onClick={() => setIsVoiceSearching(true)}
                    title="Search by Voice in Regional Indian Languages"
                    className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#C9922E]/20 text-[#241C15] hover:text-[#B7592F] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  >
                    🎙️
                  </button>

                  {/* Big Search Trigger Button */}
                  <button
                    onClick={() => handlePerformSearch(searchQuery)}
                    className="bg-[#B7592F] hover:bg-[#964724] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Live Search Matched Products & Suggestions Dropdown Popover */}
              {isSearchFocused && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E4DAC8] rounded-2xl shadow-2xl p-3.5 space-y-3 animate-in fade-in z-50 max-h-[520px] overflow-y-auto">
                  {searchQuery.trim() ? (
                    <div className="space-y-2.5">
                      {/* Active Typed Query Banner */}
                      <div className="flex items-center justify-between px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E4DAC8]">
                        <div className="flex items-center gap-2 text-xs truncate">
                          <span className="text-[#8C7E6D]">Searching for:</span>
                          <strong className="text-[#B7592F] font-bold font-serif text-sm bg-white px-2 py-0.5 rounded-lg border border-[#E4DAC8] truncate">
                            "{searchQuery}"
                          </strong>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#B7592F] text-white shrink-0 ml-2">
                          {liveMatchedProducts.length} crafts
                        </span>
                      </div>

                      {liveMatchedProducts.length > 0 ? (
                        <div className="divide-y divide-[#E4DAC8]/40 pt-1">
                          {liveMatchedProducts.slice(0, 5).map((item) => {
                            const pName = item.name[selectedLanguage] || item.name.en
                            const pLoc = item.location[selectedLanguage] || item.location.en
                            return (
                              <div
                                key={item.id}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  setSelectedProductForDetail(item)
                                  setIsSearchFocused(false)
                                }}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                              >
                                <img
                                  src={item.image}
                                  alt={pName}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#E4DAC8] shrink-0 group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-bold text-[#241C15] group-hover:text-[#B7592F] transition-colors truncate">
                                      <HighlightMatch text={pName} query={searchQuery} />
                                    </h4>
                                    {item.gi_tagged && (
                                      <span className="shrink-0 text-[8.5px] font-bold bg-[#C9922E]/20 text-[#241C15] px-1.5 py-0.2 rounded-full">
                                        GI
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#8C7E6D] truncate">
                                    by <span className="font-semibold text-[#6B6255]">{item.artisan}</span> • {pLoc.split(",")[0]}
                                  </p>
                                  <span className="text-[9.5px] text-[#8C7E6D] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E4DAC8]/60">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                  <span className="text-xs font-bold text-[#B7592F] font-serif block">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleAddToCart(item)
                                      }}
                                      title="Add to Bag"
                                      className="px-2 py-0.5 rounded-lg bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] text-[10px] font-semibold transition-colors cursor-pointer"
                                    >
                                      + Bag
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          <div className="pt-2">
                            <button
                              onMouseDown={(e) => {
                                e.preventDefault()
                                handlePerformSearch(searchQuery)
                              }}
                              className="w-full text-center py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8D8] text-xs font-bold text-[#B7592F] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>View all {liveMatchedProducts.length} results in catalog</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-1.5">
                          <span className="text-2xl">🔍</span>
                          <p className="text-xs font-bold text-[#241C15]">
                            No artisan crafts found matching "{searchQuery}"
                          </p>
                          <p className="text-[11px] text-[#8C7E6D]">
                            Try searching for pottery, silk, woodwork, brass, or artisan names.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[#E4DAC8]/60">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                            🔥 Popular Artisan Crafts
                          </span>
                          <span className="text-[10px] text-[#8C7E6D]">
                            Quick Suggestions
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-2">
                          {TRENDING_SEARCHES.map((item) => (
                            <button
                              key={item.label}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                handlePerformSearch(item.query, item.category)
                              }}
                              className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-[#FAF7F2] text-xs font-semibold text-[#241C15] transition-colors cursor-pointer border border-transparent hover:border-[#E4DAC8]"
                            >
                              <span className="text-base">{item.icon}</span>
                              <div className="truncate">
                                <div className="truncate">{item.label}</div>
                                <span className="text-[10px] text-[#8C7E6D] font-normal">{item.category}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E4DAC8]/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6D] px-1 block mb-1.5">
                          ✨ Trending Handicrafts
                        </span>
                        <div className="space-y-1">
                          {liveMatchedProducts.slice(0, 3).map((item) => {
                            const pName = item.name[selectedLanguage] || item.name.en
                            return (
                              <div
                                key={item.id}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  setSelectedProductForDetail(item)
                                  setIsSearchFocused(false)
                                }}
                                className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={item.image}
                                    alt={pName}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                                  />
                                  <span className="text-xs font-medium text-[#241C15] truncate">
                                    {pName}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-[#B7592F] shrink-0 ml-2 font-serif">
                                  ₹{item.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role & Personal Account Navigation Hub */}
            <div className="header-actions flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Personal User Identity & Account Card Switcher */}
              <div className="relative z-20">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="user-account-btn flex items-center gap-2 bg-[#EFE8D8] hover:bg-[#E4DAC8] border border-[#C9922E]/40 pl-2 pr-3 py-1.5 rounded-full text-xs font-bold text-[#241C15] transition-all shadow-xs cursor-pointer"
                  title="Manage Personal Account, Switch Identity or Log In"
                >
                  <div className="w-6 h-6 rounded-full bg-[#241C15] text-[#F7F2E9] flex items-center justify-center text-[11px] font-bold shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="user-details text-left hidden sm:block max-w-[130px] truncate">
                    <div className="text-[11px] font-bold text-[#241C15] leading-tight truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[9px] text-[#8C7E6D] uppercase tracking-wider font-semibold">
                      {currentUser.role === "b2b_gov"
                        ? "B2B / GeM"
                        : currentUser.role}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#8C7E6D]">▼</span>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown absolute right-0 mt-2 w-72 bg-white border border-[#E4DAC8] rounded-3xl shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in">
                    {/* Active Personal Account Card */}
                    <div className="p-3 bg-[#FAF7F2] border border-[#E4DAC8] rounded-2xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                          Signed In As
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#241C15] text-[#F7F2E9] text-[9.5px] font-bold uppercase">
                          {currentUser.role === "b2b_gov"
                            ? "B2B / GeM"
                            : currentUser.role}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#241C15]">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-[#6B6255] font-mono">
                        {currentUser.mobile}
                      </div>
                      <div className="text-[10px] text-[#8C7E6D] font-mono">
                        {currentUser.email}
                      </div>
                    </div>

                    {/* Personal Login & Registration Action Buttons */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setUniversalAuthModalOpen(true)
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#B7592F] hover:bg-[#964724] transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                      >
                        <span>👤</span>
                        <span>Personal Login / Switch Identity</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setUniversalAuthModalOpen(true)
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[#241C15] hover:bg-[#FAF7F2] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>📱</span>
                        <span>Personal Phone OTP Login</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setUniversalAuthModalOpen(true)
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[#241C15] hover:bg-[#FAF7F2] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>📝</span>
                        <span>Register New Personal User</span>
                      </button>
                    </div>

                    {/* Direct Quick Role Switcher */}
                    <div className="pt-2 border-t border-[#E4DAC8]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D] px-1 mb-1">
                        Switch Role Portal:
                      </p>
                      <div className="space-y-0.5 max-h-36 overflow-y-auto pr-0.5">
                        {[
                          {
                            role: "buyer" as Role,
                            label: "🛒 Buyer Storefront",
                            sub: "Browse & Buy Crafts",
                          },
                          {
                            role: "artisan" as Role,
                            label: "🏬 Artisan / Seller",
                            sub: "Workplace & Studio",
                          },
                          {
                            role: "producer" as Role,
                            label: "🏭 Workshop Producer",
                            sub: "Production Batches",
                          },
                          {
                            role: "delivery" as Role,
                            label: "🛵 Delivery Agent",
                            sub: "Doorstep Deliveries",
                          },
                          {
                            role: "admin" as Role,
                            label: "🛡️ Main Admin Portal",
                            sub: "Platform Management",
                          },
                          {
                            role: "b2b_gov" as Role,
                            label: "🏛️ B2B / GeM Portal",
                            sub: "Institutional Linkage",
                          },
                        ].map((item) => (
                          <button
                            key={item.role}
                            onClick={() => handleSwitchAccountRole(item.role)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer flex items-center justify-between ${
                              currentRole === item.role
                                ? "bg-[#241C15] text-[#F7F2E9] font-bold"
                                : "hover:bg-[#FAF7F2] text-[#241C15]"
                            }`}
                          >
                            <span>{item.label}</span>
                            {currentRole === item.role && (
                              <span className="text-[9px] text-[#C9922E] font-bold">
                                ACTIVE
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2 border-t border-[#E4DAC8]">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🚪</span>
                        <span>Sign Out (Guest Mode)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Universal Language Switcher */}
              <div className="relative z-20">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="lang-btn flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] rounded-full px-3 py-1.5 text-xs font-semibold text-[#241C15] transition-colors shadow-xs cursor-pointer"
                >
                  <span>
                    {LANGUAGES.find((l) => l.code === selectedLanguage)?.flag ||
                      "🌐"}
                  </span>
                  <span className="lang-label font-bold text-[11px] hidden sm:inline">
                    {LANGUAGES.find((l) => l.code === selectedLanguage)
                      ?.nativeName || selectedLanguage.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-[#8C7E6D]">▼</span>
                </button>

                {langMenuOpen && (
                  <div className="lang-dropdown absolute right-0 mt-2 w-64 bg-white border border-[#E4DAC8] rounded-2xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto">
                    <div className="px-2 py-1.5 border-b border-[#E4DAC8] mb-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                        Select Regional Language
                      </p>
                      <p className="text-[10px] text-[#6B6255]">
                        Instant full UI translation
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.code)
                            setLangMenuOpen(false)
                            showToast(`Language switched to ${lang.nativeName}`)
                          }}
                          className={`flex items-center gap-1.5 text-left px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            selectedLanguage === lang.code
                              ? "bg-[#C9922E]/15 text-[#241C15] font-bold border border-[#C9922E]/30"
                              : "hover:bg-[#FAF7F2] text-[#6B6255]"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="truncate">{lang.nativeName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell with Role Filter */}
              <div className="relative z-20">
                <button
                  onClick={() =>
                    setNotificationPanelOpen(!notificationPanelOpen)
                  }
                  className="notification-btn relative w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="View Notifications"
                >
                  <span>🔔</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="notif-badge absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <NotificationPanel
                  isOpen={notificationPanelOpen}
                  onClose={() => setNotificationPanelOpen(false)}
                  currentRole={currentRole}
                  notifications={notifications}
                  onMarkAsRead={(id) => {
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                    )
                  }}
                  onClearAll={() => {
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, read: true })),
                    )
                    showToast("All notifications marked as read.")
                  }}
                  onSelectOrderNotification={(orderId) => {
                    setTrackingLookupOrderId(orderId)
                    setCustomerOrdersModalOpen(true)
                  }}
                />
              </div>

              {/* Personal Login & Multi-Role Identity Access Button */}
              <button
                onClick={() => setUniversalAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                id="login-btn"
                title="Personal Login with Mobile Phone OTP or Credentials"
              >
                <span>👤</span>
                <span className="action-btn-label hidden sm:inline">Personal Login</span>
                <span className="action-btn-label sm:hidden">Login</span>
              </button>

              {/* Add Handmade Craft Button (Accessible to all verified artisans & makers) */}
              <button
                onClick={() => setAddCraftModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#B7592F] hover:bg-[#964724] text-white px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer group"
                title="List a 100% authentic handcrafted item made by certified Indian artisans"
              >
                <span className="group-hover:rotate-12 transition-transform">
                  ✨
                </span>
                <span className="action-btn-label hidden sm:inline">Add Handmade Craft</span>
                <span className="action-btn-label sm:hidden">+ Craft</span>
              </button>

              {/* Track Delivery Button (Direct access for buyers to track parcel milestones and OTP) */}
              <button
                onClick={() => {
                  setTrackingLookupOrderId(null)
                  setCustomerOrdersModalOpen(true)
                }}
                className="action-hide-mobile flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#C9922E]/50 text-[#241C15] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                title="Track package delivery, GPS milestones, delivery agent contact & doorstep OTP"
              >
                <span>🚚</span>
                <span className="hidden sm:inline">Track Delivery</span>
                {customerOrders.some(
                  (o) => o.status === "Out for Delivery",
                ) && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"
                    title="Parcel Out for Delivery"
                  />
                )}
              </button>

              {/* My Orders Button (For Buyers) */}
              {currentRole === "buyer" && (
                <button
                  onClick={() => {
                    setTrackingLookupOrderId(null)
                    setCustomerOrdersModalOpen(true)
                  }}
                  className="action-hide-mobile flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-xs cursor-pointer relative"
                  title="View your orders, invoices, and live package tracking"
                >
                  <span>📦</span>
                  <span className="hidden sm:inline">My Orders</span>
                  {customerOrders.length > 0 && (
                    <span className="bg-[#B7592F] text-white text-[10px] font-bold px-1.5 rounded-full">
                      {customerOrders.length}
                    </span>
                  )}
                </button>
              )}

              {/* Craft Bag (Cart) */}
              {currentRole === "buyer" && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-1.5 bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <span>🛍️</span>
                  <span className="action-btn-label hidden sm:inline">
                    {translate("navBag", selectedLanguage)}
                  </span>
                  {cart.length > 0 && (
                    <span className="bg-[#C9922E] text-[#241C15] text-[10px] font-bold px-1.5 rounded-full">
                      {cart.reduce((s, i) => s + i.qty, 0)}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Mobile Big Search Bar (< md) */}
        <div ref={mobileSearchRef} className="mobile-search-bar md:hidden px-4 pb-3 relative z-30">
          <div className="search-container relative flex items-center bg-white rounded-2xl border-2 border-[#E4DAC8] focus-within:border-[#B7592F] shadow-xs">
            <span className="pl-3.5 text-[#8C7E6D] text-sm pointer-events-none select-none">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsMobileSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePerformSearch(searchQuery)
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={translate("searchPlaceholder", selectedLanguage)}
              className="w-full px-2.5 py-2.5 text-xs text-[#241C15] font-medium placeholder:text-[#8C7E6D] bg-transparent outline-none"
            />
            <div className="flex items-center gap-1 pr-1.5 shrink-0">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-6 h-6 rounded-full text-[#8C7E6D] hover:text-[#241C15] text-xs font-bold cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                onClick={() => setCameraScannerOpen(true)}
                className="w-7 h-7 rounded-lg text-xs hover:bg-[#FAF7F2] flex items-center justify-center cursor-pointer"
                title="AI Camera Price Scanner"
              >
                📷
              </button>
              <button
                onClick={() => setIsVoiceSearching(true)}
                className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#C9922E]/20 text-xs flex items-center justify-center cursor-pointer"
                title="Voice Search"
              >
                🎙️
              </button>
              <button
                onClick={() => handlePerformSearch(searchQuery)}
                className="search-action-btn bg-[#B7592F] hover:bg-[#964724] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Mobile Search Live Products Dropdown Popover */}
          {isMobileSearchFocused && (
            <div className="search-dropdown absolute left-4 right-4 top-full mt-1.5 bg-white border border-[#E4DAC8] rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in z-50 max-h-[380px] overflow-y-auto">
              {searchQuery.trim() ? (
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E4DAC8]/60 text-[11px]">
                    <span className="font-bold text-[#B7592F] truncate">
                      "{searchQuery}" ({liveMatchedProducts.length} crafts)
                    </span>
                  </div>
                  {liveMatchedProducts.length > 0 ? (
                    <div className="divide-y divide-[#E4DAC8]/40 pt-1">
                      {liveMatchedProducts.slice(0, 4).map((item) => {
                        const pName = item.name[selectedLanguage] || item.name.en
                        return (
                          <div
                            key={item.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setSelectedProductForDetail(item)
                              setIsMobileSearchFocused(false)
                            }}
                            className="flex items-center gap-2.5 py-2 cursor-pointer"
                          >
                            <img
                              src={item.image}
                              alt={pName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-[#241C15] truncate">
                                <HighlightMatch text={pName} query={searchQuery} />
                              </h5>
                              <p className="text-[10px] text-[#8C7E6D] truncate">
                                {item.artisan} • {item.category}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#B7592F] font-serif shrink-0">
                              ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )
                      })}
                      <div className="pt-1.5">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handlePerformSearch(searchQuery)
                          }}
                          className="w-full text-center py-1.5 rounded-lg bg-[#FAF7F2] text-xs font-bold text-[#B7592F]"
                        >
                          View all {liveMatchedProducts.length} in catalog →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-[#8C7E6D]">
                      No crafts match "{searchQuery}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E6D]">
                    🔥 Popular Searches
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {TRENDING_SEARCHES.slice(0, 4).map((item) => (
                      <button
                        key={item.label}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handlePerformSearch(item.query, item.category)
                        }}
                        className="text-left p-1.5 rounded-lg bg-[#FAF7F2] text-[11px] font-semibold text-[#241C15] truncate flex items-center gap-1.5"
                      >
                        <span>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Category Navigation Strip (When in Buyer View) */}
        {currentRole === "buyer" && (
          <div className="category-strip bg-[#FAF7F2] border-t border-[#E4DAC8]/60 overflow-x-auto scrollbar-none py-2 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max text-xs">
              <div className="category-scroll flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: "All", labelKey: "catAll", icon: "✨" },
                  { id: "Pottery", labelKey: "catPottery", icon: "🏺" },
                  { id: "Textile", labelKey: "catTextile", icon: "🧵" },
                  { id: "Woodwork", labelKey: "catWoodwork", icon: "🪵" },
                  { id: "Metalwork", labelKey: "catMetalwork", icon: "🪙" },
                  { id: "Jewelry", labelKey: "catJewelry", icon: "💍" },
                  { id: "Handicrafts", labelKey: "catHandicrafts", icon: "🪆" },
                  {
                    id: "Folk & Tribal Art",
                    labelKey: "catFolkArt",
                    icon: "🎨",
                  },
                  { id: "Bamboo & Cane", labelKey: "catBamboo", icon: "🎋" },
                  { id: "Stone Craft", labelKey: "catStone", icon: "🏛️" },
                  { id: "Leather Craft", labelKey: "catLeather", icon: "👞" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id)
                    }}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-[#241C15] text-[#F7F2E9] font-bold shadow-xs"
                        : "text-[#6B6255] hover:text-[#241C15] hover:bg-[#EFE8D8]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{translate(cat.labelKey, selectedLanguage)}</span>
                  </button>
                ))}
              </div>

              <div className="category-extra hidden sm:flex items-center gap-2.5 text-[11.5px] text-[#6B6255] pl-4 border-l border-[#E4DAC8] shrink-0">
                {/* Add Craft Button in Strip */}
                <button
                  onClick={() => setAddCraftModalOpen(true)}
                  className="flex items-center gap-1 font-bold text-[#B7592F] hover:text-[#964724] bg-[#B7592F]/10 hover:bg-[#B7592F]/20 px-3 py-1 rounded-full transition-colors cursor-pointer border border-[#B7592F]/20 shrink-0"
                >
                  <span>✨</span>
                  <span>+ Add Handmade Craft</span>
                </button>
                {/* AI Camera Price Scanner Shortcut */}
                <button
                  onClick={() => setCameraScannerOpen(true)}
                  className="flex items-center gap-1 font-bold text-[#B7592F] hover:text-[#241C15] bg-[#B7592F]/10 px-3 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <span>📷</span>
                  <span>AI Camera Price Scanner</span>
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-[#B7592F]">📍</span>
                  <span className="text-[#8C7E6D]">
                    {translate("deliverTo", selectedLanguage)}
                  </span>
                  <strong className="text-[#241C15]">Pune 411007</strong>
                </div>
              </div>
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
          <div className="space-y-10">
            {/* Top Back Navigation to Editorial Stories */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DAC8]">
              <button
                onClick={() => {
                  setBuyerExperience("landing")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#241C15] hover:text-[#B7592F] transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Back to Stories & Editorial Overview</span>
              </button>
              <span className="text-xs text-[#8C7E6D] font-light">
                Complete Artisan Collection ({filteredProducts.length} crafts)
              </span>
            </div>
            {/* Hero Banner with Multi-Language Translation */}
            <div className="hero-banner relative rounded-3xl overflow-hidden border border-[#E4DAC8] bg-[#241C15] text-white shadow-md min-h-[360px] sm:min-h-[420px] flex items-center">
              <img
                src="https://images.unsplash.com/photo-1507022787381-b30170b5ebf4?w=1600&h=700&fit=crop&auto=format"
                alt="MoSJE Craft Heritage"
                className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#241C15] via-[#241C15]/90 to-transparent" />

              <div className="hero-content relative z-10 p-8 sm:p-12 lg:p-16 max-w-4xl">
                <span className="hero-tagline inline-block text-[#C9922E] text-[11px] font-bold tracking-[0.2em] uppercase bg-[#C9922E]/15 border border-[#C9922E]/30 px-3 py-0.5 rounded-full mb-3">
                  {translate("heroTagline", selectedLanguage)}
                </span>
                <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight font-serif text-[#F7F2E9] mb-3">
                  {translate("heroTitle", selectedLanguage)}
                </h1>
                <p className="hero-subtitle text-xs sm:text-sm text-[#E4DAC8]/80 leading-relaxed mb-6 font-light max-w-2xl">
                  {translate("heroSub", selectedLanguage)}
                </p>

                {/* ─── GRAND HERO HERITAGE SEARCH BAR ─── */}
                <div ref={heroSearchRef} className="hero-search-bar my-6 max-w-3xl relative z-20">
                  <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#FDFBF7] p-2 sm:p-2.5 rounded-3xl sm:rounded-full border-2 border-[#C9922E]/40 focus-within:border-[#C9922E] focus-within:ring-4 focus-within:ring-[#C9922E]/20 shadow-2xl transition-all gap-2">
                    {/* Category Selector */}
                    <div className="relative shrink-0 sm:border-r sm:border-[#E4DAC8] pl-2 sm:pl-3 pr-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#241C15]">
                        <span className="text-[#C9922E] text-sm">🏺</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            handlePerformSearch(searchQuery, e.target.value)
                          }}
                          className="appearance-none bg-transparent pr-6 py-1 text-xs font-bold text-[#241C15] cursor-pointer outline-none hover:text-[#B7592F]"
                        >
                          <option value="All">All Crafts</option>
                          <option value="Pottery">Pottery & Clay</option>
                          <option value="Textile">Textile & Handloom</option>
                          <option value="Woodwork">Woodwork & Carving</option>
                          <option value="Metalwork">Metalwork & Brass</option>
                          <option value="Jewelry">Jewelry & Beads</option>
                          <option value="Handicrafts">Handicrafts & Toys</option>
                          <option value="Folk & Tribal Art">Folk & Tribal Art</option>
                          <option value="Bamboo & Cane">Bamboo & Cane</option>
                          <option value="Stone Craft">Stone Craft</option>
                          <option value="Leather Craft">Leather Craft</option>
                        </select>
                        <span className="text-[9px] text-[#8C7E6D] -ml-4 pointer-events-none">
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Big Input Area */}
                    <div className="flex-1 flex items-center px-2 min-w-0">
                      <span className="text-[#8C7E6D] text-lg mr-2 shrink-0">🔍</span>
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
                        placeholder="Search Jaipur pottery, Banarasi silk, Kashmir wood, Dhokra art..."
                        className="w-full text-sm sm:text-base font-medium text-[#241C15] placeholder:text-[#8C7E6D] bg-transparent outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="p-1 text-[#8C7E6D] hover:text-[#241C15] text-xs font-bold cursor-pointer"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Integrated Controls (Voice + Lens + Big Search Button) */}
                    <div className="flex items-center gap-1.5 justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E4DAC8]">
                      <button
                        onClick={() => setCameraScannerOpen(true)}
                        title="AI Camera Price Scanner"
                        className="w-10 h-10 rounded-full bg-[#FAF7F2] hover:bg-[#EFE8D8] text-[#241C15] hover:text-[#B7592F] flex items-center justify-center text-base transition-colors cursor-pointer shrink-0"
                      >
                        📷
                      </button>
                      <button
                        onClick={() => setIsVoiceSearching(true)}
                        title="Voice Search in Indian Languages"
                        className="w-10 h-10 rounded-full bg-[#FAF7F2] hover:bg-[#EFE8D8] text-[#241C15] hover:text-[#B7592F] flex items-center justify-center text-base transition-colors cursor-pointer shrink-0"
                      >
                        🎙️
                      </button>
                      <button
                        onClick={() => handlePerformSearch(searchQuery)}
                        className="bg-[#B7592F] hover:bg-[#964724] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <span>Search Crafts</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Hero Live Matched Products Popover */}
                  {isHeroSearchFocused && searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E4DAC8] rounded-3xl shadow-2xl p-4 text-left space-y-3 animate-in fade-in z-50 max-h-[480px] overflow-y-auto">
                      {/* Active Typed Query Banner */}
                      <div className="flex items-center justify-between px-3 py-2 bg-[#FAF7F2] rounded-2xl border border-[#E4DAC8]">
                        <div className="flex items-center gap-2 text-xs truncate">
                          <span className="text-[#8C7E6D]">Searching for:</span>
                          <strong className="text-[#B7592F] font-bold font-serif text-sm bg-white px-2.5 py-0.5 rounded-lg border border-[#E4DAC8] truncate">
                            "{searchQuery}"
                          </strong>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#B7592F] text-white shrink-0 ml-2">
                          {liveMatchedProducts.length} crafts found
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
                                className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                              >
                                <img
                                  src={item.image}
                                  alt={pName}
                                  className="w-13 h-13 rounded-2xl object-cover border border-[#E4DAC8] shrink-0 group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&h=800&fit=crop&auto=format"
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#241C15] group-hover:text-[#B7592F] transition-colors truncate">
                                      <HighlightMatch text={pName} query={searchQuery} />
                                    </h4>
                                    {item.gi_tagged && (
                                      <span className="shrink-0 text-[9px] font-bold bg-[#C9922E]/20 text-[#241C15] px-2 py-0.5 rounded-full">
                                        GI Certified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#8C7E6D] truncate">
                                    by <span className="font-semibold text-[#6B6255]">{item.artisan}</span> • {pLoc.split(",")[0]}
                                  </p>
                                  <span className="text-[10px] text-[#8C7E6D] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E4DAC8]/60">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                  <span className="text-sm font-bold text-[#B7592F] font-serif block">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </span>
                                  <button
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleAddToCart(item)
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#241C15] hover:bg-[#3A2C20] text-[#F7F2E9] text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    + Add to Bag
                                  </button>
                                </div>
                              </div>
                            )
                          })}

                          <div className="pt-2.5">
                            <button
                              onMouseDown={(e) => {
                                e.preventDefault()
                                handlePerformSearch(searchQuery)
                              }}
                              className="w-full text-center py-2.5 rounded-2xl bg-[#241C15] hover:bg-[#3A2C20] text-xs font-bold text-[#F7F2E9] transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                              <span>View all {liveMatchedProducts.length} crafts in catalog</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center space-y-1.5">
                          <span className="text-3xl">🏺</span>
                          <p className="text-sm font-bold text-[#241C15]">
                            No authentic crafts found matching "{searchQuery}"
                          </p>
                          <p className="text-xs text-[#8C7E6D]">
                            Try searching for terms like "Jaipur pottery", "Banarasi silk", "Kashmir wood", or "Brass".
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trending Search Chips */}
                  <div className="hero-trending-chips mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#C9922E] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <span>🔥</span> Popular:
                    </span>
                    {TRENDING_SEARCHES.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handlePerformSearch(item.query, item.category)}
                        className="bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-[#F7F2E9] hover:text-white px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Search Results Indicator */}
                  {searchQuery && (
                    <div className="hero-search-indicator mt-2.5 flex items-center justify-between bg-[#C9922E]/20 border border-[#C9922E]/40 px-3.5 py-1.5 rounded-xl text-xs text-[#F7F2E9]">
                      <span>
                        Showing <strong>{filteredProducts.length}</strong> crafts matching "{searchQuery}"
                      </span>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#C9922E] hover:text-white font-bold underline cursor-pointer"
                      >
                        Reset search
                      </button>
                    </div>
                  )}
                </div>

                <div className="hero-cta-buttons flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById("craft-catalog")
                      el?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hero-cta-primary bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>{translate("ctaExplore", selectedLanguage)}</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      setTrackingLookupOrderId(null)
                      setCustomerOrdersModalOpen(true)
                    }}
                    className="hero-cta-secondary bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>🚚</span>
                    <span>Track Delivery</span>
                  </button>
                  <button
                    onClick={() => setCameraScannerOpen(true)}
                    className="hero-cta-secondary bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>📷</span>
                    <span>AI Camera Price Scanner</span>
                  </button>
                  <button
                    onClick={() => setAddCraftModalOpen(true)}
                    className="hero-cta-secondary bg-[#B7592F] hover:bg-[#964724] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>✨</span>
                    <span>Add Handmade Craft</span>
                  </button>
                  <button
                    onClick={() => setSellerCameraOpen(true)}
                    className="hero-cta-secondary bg-white/10 hover:bg-white/20 border border-white/25 text-[#F7F2E9] px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📸</span>
                    <span>Studio Lens</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Impact Highlights Strip */}
            <div className="impact-strip grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: translate("valPropDirect", selectedLanguage),
                  desc: translate("valPropDirectSub", selectedLanguage),
                  icon: "🏛️",
                },
                {
                  title: translate("valPropCrafts", selectedLanguage),
                  desc: translate("valPropCraftsSub", selectedLanguage),
                  icon: "🏺",
                },
                {
                  title: translate("valPropVoice", selectedLanguage),
                  desc: translate("valPropVoiceSub", selectedLanguage),
                  icon: "🎙️",
                },
                {
                  title: translate("valPropOtp", selectedLanguage),
                  desc: translate("valPropOtpSub", selectedLanguage),
                  icon: "🔐",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4DAC8] bg-[#FAF7F2] shadow-xs"
                >
                  <span className="text-2xl flex-none bg-[#EFE8D8] p-2.5 rounded-xl">
                    {b.icon}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#241C15]">
                      {b.title}
                    </h3>
                    <p className="text-[11px] text-[#6B6255] mt-0.5">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Marketplace Catalog Section ─── */}
            <div id="craft-catalog" className="pt-2 space-y-6">
              <div className="flex flex-col gap-4 pb-4 border-b border-[#E4DAC8]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B7592F]">
                      {selectedCategory === "All"
                        ? translate("catAll", selectedLanguage)
                        : selectedCategory === "Pottery"
                          ? translate("catPottery", selectedLanguage)
                          : selectedCategory === "Textile"
                            ? translate("catTextile", selectedLanguage)
                            : selectedCategory === "Woodwork"
                              ? translate("catWoodwork", selectedLanguage)
                              : selectedCategory === "Metalwork"
                                ? translate("catMetalwork", selectedLanguage)
                                : selectedCategory === "Jewelry"
                                  ? translate("catJewelry", selectedLanguage)
                                  : selectedCategory === "Handicrafts"
                                    ? translate(
                                        "catHandicrafts",
                                        selectedLanguage,
                                      )
                                    : selectedCategory === "Folk & Tribal Art"
                                      ? translate(
                                          "catFolkArt",
                                          selectedLanguage,
                                        )
                                      : selectedCategory === "Bamboo & Cane"
                                        ? translate(
                                            "catBamboo",
                                            selectedLanguage,
                                          )
                                        : selectedCategory === "Stone Craft"
                                          ? translate(
                                              "catStone",
                                              selectedLanguage,
                                            )
                                          : translate(
                                              "catLeather",
                                              selectedLanguage,
                                            )}{" "}
                      • 100% Certified Authentic Indian Heritage
                    </span>
                    <h2 className="text-2xl font-bold text-[#241C15] font-serif mt-0.5">
                      {translate("catalogHeading", selectedLanguage)} (
                      {filteredProducts.length}{" "}
                      {translate("catalogItemsCount", selectedLanguage)})
                    </h2>
                  </div>

                  {/* Top Actions: Add Craft button & Sort selector */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setAddCraftModalOpen(true)}
                      className="catalog-add-craft-btn flex items-center gap-1.5 bg-[#B7592F] hover:bg-[#964724] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>✨</span>
                      <span>+ Add Handmade Craft</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#8C7E6D]">
                        {translate("sortBy", selectedLanguage)}:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="p-1.5 rounded-xl border border-[#E4DAC8] bg-white text-xs font-semibold text-[#241C15] outline-none"
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
                </div>

                {/* Sub-filter Category Quick Pills */}
                <div className="catalog-sub-filters flex items-center gap-2 pt-1 overflow-x-auto text-xs scrollbar-none">
                  {[
                    { id: "All", labelKey: "catAll", icon: "✨" },
                    { id: "Pottery", labelKey: "catPottery", icon: "🏺" },
                    { id: "Textile", labelKey: "catTextile", icon: "🧵" },
                    { id: "Woodwork", labelKey: "catWoodwork", icon: "🪵" },
                    { id: "Metalwork", labelKey: "catMetalwork", icon: "🪙" },
                    { id: "Jewelry", labelKey: "catJewelry", icon: "💍" },
                    {
                      id: "Handicrafts",
                      labelKey: "catHandicrafts",
                      icon: "🪆",
                    },
                    {
                      id: "Folk & Tribal Art",
                      labelKey: "catFolkArt",
                      icon: "🎨",
                    },
                    { id: "Bamboo & Cane", labelKey: "catBamboo", icon: "🎋" },
                    { id: "Stone Craft", labelKey: "catStone", icon: "🏛️" },
                    { id: "Leather Craft", labelKey: "catLeather", icon: "👞" },
                  ].map((tab) => {
                    const count =
                      tab.id === "All"
                        ? products.filter(
                            (p) =>
                              !p.isMaterial && p.category !== "Craft Materials",
                          ).length
                        : products.filter(
                            (p) => p.category === tab.id && !p.isMaterial,
                          ).length
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-semibold flex items-center gap-1.5 shrink-0 ${
                          selectedCategory === tab.id
                            ? "bg-[#241C15] text-[#F7F2E9] shadow-xs"
                            : "bg-white border border-[#E4DAC8] text-[#6B6255] hover:bg-[#FAF7F2] hover:text-[#241C15]"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{translate(tab.labelKey, selectedLanguage)}</span>
                        <span
                          className={`text-[10px] px-1.5 rounded-full font-bold ${
                            selectedCategory === tab.id
                              ? "bg-[#C9922E] text-[#241C15]"
                              : "bg-[#EFE8D8] text-[#6B6255]"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
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
                            <span className="absolute top-3 right-3 bg-[#C9922E] text-[#241C15] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              ✓ GI Certified
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs bg-[#241C15]/85 text-[#F7F2E9]">
                            {product.category === "Pottery"
                              ? "🏺 " +
                                translate("catPottery", selectedLanguage)
                              : product.category === "Textile"
                                ? "🧵 " +
                                  translate("catTextile", selectedLanguage)
                                : product.category === "Woodwork"
                                  ? "🪵 " +
                                    translate("catWoodwork", selectedLanguage)
                                  : product.category === "Metalwork"
                                    ? "🪙 " +
                                      translate(
                                        "catMetalwork",
                                        selectedLanguage,
                                      )
                                    : product.category === "Jewelry"
                                      ? "💍 " +
                                        translate(
                                          "catJewelry",
                                          selectedLanguage,
                                        )
                                      : product.category === "Handicrafts"
                                        ? "🪆 " +
                                          translate(
                                            "catHandicrafts",
                                            selectedLanguage,
                                          )
                                        : product.category ===
                                            "Folk & Tribal Art"
                                          ? "🎨 " +
                                            translate(
                                              "catFolkArt",
                                              selectedLanguage,
                                            )
                                          : product.category === "Bamboo & Cane"
                                            ? "🎋 " +
                                              translate(
                                                "catBamboo",
                                                selectedLanguage,
                                              )
                                            : product.category === "Stone Craft"
                                              ? "🏛️ " +
                                                translate(
                                                  "catStone",
                                                  selectedLanguage,
                                                )
                                              : "👞 " +
                                                translate(
                                                  "catLeather",
                                                  selectedLanguage,
                                                )}
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="p-4 space-y-2">
                          <h3
                            onClick={() => setSelectedProductForDetail(product)}
                            className="text-base font-bold font-serif text-[#241C15] line-clamp-2 group-hover:text-[#B7592F] transition-colors cursor-pointer"
                          >
                            <HighlightMatch text={pName} query={searchQuery} />
                          </h3>
                          <p className="text-xs text-[#6B6255] line-clamp-2 leading-relaxed">
                            {pDesc}
                          </p>

                          {/* Price in INR */}
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className="text-xl font-bold text-[#241C15] font-serif">
                                {fmt(product.price)}
                              </span>
                              <span className="text-[10px] text-[#8C7E6D] block">
                                {translate(
                                  "valPropDirectSub",
                                  selectedLanguage,
                                )}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {product.stockQuantity || 12}{" "}
                              {translate("inStockBadge", selectedLanguage)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Action Buttons */}
                      <div className="p-4 pt-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 rounded-full bg-[#241C15] hover:bg-[#3A2C20] py-2.5 text-xs font-bold text-[#F7F2E9] transition-colors shadow-xs cursor-pointer text-center"
                          >
                            {translate("buyNow", selectedLanguage)}
                          </button>

                          <button
                            onClick={() => handleAddToCart(product)}
                            title="Add to Bag"
                            className="h-9 w-9 rounded-full border border-[#E4DAC8] bg-[#FAF7F2] hover:bg-[#EFE8D8] flex items-center justify-center text-[#241C15] transition-colors shrink-0 cursor-pointer"
                          >
                            🛍️
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
              onOpenEditProfile={() => setSellerAuthModalOpen(true)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSwitchToBuyer={() => setCurrentRole("buyer")}
              showToast={showToast}
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

          // Immediately switch to Buyer Marketplace
          setCurrentRole("buyer")
          window.scrollTo({ top: 0, behavior: "smooth" })
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
        onSaveSeller={(s) => {
          setCurrentSeller(s)
          try {
            localStorage.setItem("simplificant_seller", JSON.stringify(s))
          } catch {}
        }}
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
          setUniversalAuthModalOpen(true)
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
