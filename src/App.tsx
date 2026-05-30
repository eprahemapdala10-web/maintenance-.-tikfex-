/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, 
  Wrench, 
  ShoppingCart, 
  Phone, 
  MapPin, 
  Check, 
  Sparkles, 
  Trash2, 
  Save, 
  Plus, 
  Minus, 
  Lock, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Package, 
  ShieldCheck, 
  Clock, 
  Users, 
  Layers, 
  Info,
  Sliders,
  Settings,
  ArrowLeftRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Part, CartItem, MaintenanceData, TradeInData, PartCategory } from "./types";

// Default configuration & static data
const DEFAULT_WA = "201117735952";
const ADMIN_PASS = "1234";

const DEFAULT_PARTS: Part[] = [
  { id: 1, name: "شعلة بوتجاز يونيفرسال", cat: "cooker", price: 85, icon: "🔥", img: "", desc: "تناسب معظم ماركات البوتجازات ومصنوعة من خامات معالجة ضد الحرارة", avail: true },
  { id: 2, name: "ترموستات سخان غاز", cat: "heater", price: 220, icon: "🌡️", img: "", desc: "ترموستات أصلي مع حساس أمان للتحكم الدقيق بدرجات الحرارة", avail: true },
  { id: 3, name: "حرق بوتجاز كريازي", cat: "cooker", price: 150, icon: "⚙️", img: "", desc: "شعلة فرن داخلية أصلية مجلفنة ضد الصدأ وتتحمل التشغيل الطويل", avail: true },
  { id: 4, name: "صمام أمان سخان غاز", cat: "heater", price: 180, icon: "🔧", img: "", desc: "صمام ربع بوصة مع رداد حماية لمنع تسريب الغاز تحت أي ظرف", avail: true },
  { id: 5, name: "زجاج فرن بوتجاز", cat: "cooker", price: 320, icon: "🪟", img: "", desc: "زجاج حراري مزدوج مقوى مقاوم للصدمات والارتفاع المفاجئ للحرارة", avail: true },
  { id: 6, name: "موقد غاز كامل", cat: "cooker", price: 95, icon: "🔩", img: "", desc: "طقم مواقد غاز نحاسي كامل مقاوم لانسداد الفونيات", avail: false },
  { id: 7, name: "مفتاح شعلة بوتجاز", cat: "cooker", price: 65, icon: "🔑", img: "", desc: "مفتاح تحكم بلاستيك حراري مقوى عالي المتانة بملمس ناعم", avail: true },
  { id: 8, name: "خرطوم غاز مطاطي", cat: "heater", price: 45, icon: "🌀", img: "", desc: "خرطوم إيطالي الصنع معالج بطبقة تسليح مزدوجة أقصى أمان", avail: true }
];

const BRANDS_DATA = {
  "بوتجاز": ["كريازي", "شارب", "تيكا", "كونكورد", "أمريكانا", "زانوسي", "آرديم", "هاير", "يونيون إير", "أخرى"],
  "سخان غاز": ["جوناي", "إيتال", "كريازي", "فريش", "تيرما", "هاميلتون", "كليما", "أخرى"]
};

const PROBLEMS_DATA = {
  "بوتجاز": ["اشتعال الشعلات", "خلل في الفرن", "تسريب غاز", "مؤقت لا يعمل", "صدأ / تلف هيكل", "أخرى"],
  "سخان غاز": ["لا يشتعل", "ضعف اللهب", "تسريب ماء", "تسريب غاز", "صوت غير طبيعي", "أخرى"]
};

const COV_AREAS = [
  "مدينة الحوامدية",
  "البدرشين",
  "منيل شيحة",
  "طموة",
  "سقارة",
  "المريوطية",
  "أم خنان",
  "منى الأمير",
  "عرب التل"
];

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"home" | "maintenance" | "parts" | "tradein" | "admin">("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderRef, setSuccessOrderRef] = useState("#00000");

  // Dynamic config loaded from localStorage safely
  const [parts, setParts] = useState<Part[]>(() => {
    try {
      const saved = localStorage.getItem("tf_parts");
      return saved ? JSON.parse(saved) : DEFAULT_PARTS;
    } catch {
      return DEFAULT_PARTS;
    }
  });

  const [waNumber, setWaNumber] = useState(() => {
    try {
      return localStorage.getItem("tf_wa") || DEFAULT_WA;
    } catch {
      return DEFAULT_WA;
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [partsFilter, setPartsFilter] = useState<PartCategory | "all">("all");

  // Admin section states
  const [isAdminLoginVisible, setIsAdminLoginVisible] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminToast, setAdminToast] = useState("");
  const [activeZoomedPart, setActiveZoomedPart] = useState<Part | null>(null);

  // New part inputs for admin
  const [newPartName, setNewPartName] = useState("");
  const [newPartPrice, setNewPartPrice] = useState("");
  const [newPartCat, setNewPartCat] = useState<PartCategory>("cooker");
  const [newPartImg, setNewPartImg] = useState("");
  const [newPartDesc, setNewPartDesc] = useState("");

  // Maintenance Multi-step wizard state
  const [mStep, setMStep] = useState(0);
  const [mForm, setMForm] = useState<MaintenanceData>({
    deviceType: "",
    serviceType: "",
    brand: "",
    problem: "",
    customProblem: "",
    name: "",
    phone: "",
    address: "",
    city: ""
  });

  // Trade-in form state
  const [tiForm, setTiForm] = useState<TradeInData>({
    requestType: "",
    deviceType: "بوتجاز",
    brand: "",
    age: "",
    condition: "",
    name: "",
    phone: "",
    city: "",
    notes: ""
  });
  const [isTiSuccess, setIsTiSuccess] = useState(false);

  // Cart checkout info
  const [checkName, setCheckName] = useState("");
  const [checkPhone, setCheckPhone] = useState("");
  const [checkCity, setCheckCity] = useState("");
  const [checkAddr, setCheckAddr] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Synchronizers
  const savePartsToStorage = (updatedParts: Part[]) => {
    setParts(updatedParts);
    try {
      localStorage.setItem("tf_parts", JSON.stringify(updatedParts));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  const saveWaToStorage = (updatedWa: string) => {
    setWaNumber(updatedWa);
    try {
      localStorage.setItem("tf_wa", updatedWa);
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  const triggerToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(""), 3000);
  };

  // Helper date formatter
  const formattedNow = () => {
    return new Date().toLocaleString("ar-EG", { hour12: true });
  };

  const getWhatsAppMessageUrl = (msg: string) => {
    const cleanWa = waNumber.trim().replace(/\D/g, "");
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`;
  };

  const openWhatsApp = (msg: string) => {
    window.open(getWhatsAppMessageUrl(msg), "_blank", "noreferrer");
  };

  // Utility calculations
  const totalCartQty = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.qty, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  }, [cart]);

  // Handle Cart quantity controls cleanly
  const updateCartQty = (partId: number, delta: number) => {
    const targetPart = parts.find(p => p.id === partId);
    if (!targetPart) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === partId);
      if (existing) {
        const nextQty = existing.qty + delta;
        if (nextQty <= 0) {
          return prev.filter(item => item.id !== partId);
        }
        return prev.map(item => item.id === partId ? { ...item, qty: nextQty } : item);
      } else if (delta > 0) {
        return [...prev, {
          id: targetPart.id,
          name: targetPart.name,
          price: targetPart.price,
          icon: targetPart.icon,
          img: targetPart.img,
          qty: 1
        }];
      }
      return prev;
    });
  };

  // Checkout with Fallback logic
  const handleCheckout = () => {
    if (!checkName || !checkPhone || !checkCity || !checkAddr) {
      alert("الرجاء إدخال جميع بيانات التوصيل لإكمال الطلب");
      return;
    }

    setIsCheckingOut(true);

    const ref = "#ORD" + Math.floor(10000 + Math.random() * 90000);
    const orderItemsList = cart.map(item => `• ${item.name} (عدد ${item.qty}) = ${(item.price * item.qty).toLocaleString()} ج.م`).join("\n");
    const formattedPrice = totalCartPrice.toLocaleString();

    const orderMsg = `🛒 *طلب قطع غيار جديد - تك فيكس* 🛒
━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${checkName}
📞 *الهاتف:* ${checkPhone}
📍 *المنطقة:* ${checkCity}
🏠 *العنوان:* ${checkAddr}
━━━━━━━━━━━━━━━━━━
📦 *القطع المطلوبة:*
${orderItemsList}
━━━━━━━━━━━━━━━━━━
💰 *الإجمالي النهائي:* ${formattedPrice} ج.م
🔖 *رقم الطلب:* ${ref}
⏰ *وقت الطلب:* ${formattedNow()}`;

    // Standard high-fidelity Formspree post with robust backup redirection
    const payload = {
      _subject: `🛒 طلب قطع غيار جديد ${ref}`,
      order_ref: ref,
      client_name: checkName,
      client_phone: checkPhone,
      client_city: checkCity,
      client_address: checkAddr,
      items: cart.map(i => `${i.name} (عدد ${i.qty})`).join(" , "),
      total: `${formattedPrice} ج.م`,
      timestamp: formattedNow()
    };

    fetch("https://formspree.io/f/xvgowoen", { 
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(() => {
      // Success modal trigger
      setSuccessOrderRef(ref);
      setIsSuccessModalOpen(true);
      setCart([]);
      setIsCartOpen(false);
    })
    .catch(() => {
      // Redirection backup as a secure alternative
      openWhatsApp(orderMsg);
      setSuccessOrderRef(ref);
      setIsSuccessModalOpen(true);
      setCart([]);
      setIsCartOpen(false);
    })
    .finally(() => {
      setIsCheckingOut(false);
    });
  };

  // Maintenance wizard step validation helper
  const isMStepValid = () => {
    if (mStep === 0) return !!mForm.deviceType;
    if (mStep === 1) return !!mForm.serviceType;
    if (mStep === 2) return !!(mForm.brand && (mForm.problem || mForm.customProblem));
    if (mStep === 3) return !!(mForm.name && mForm.phone && mForm.address && mForm.city);
    return false;
  };

  const handleMaintenanceSubmit = () => {
    const formattedProblem = mForm.problem || mForm.customProblem;
    const maintenanceMsg = `🛠️ *طلب صيانة جديد - تك فيكس* 🛠️
━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${mForm.name}
📞 *الهاتف:* ${mForm.phone}
📍 *المنطقة:* ${mForm.city}
🏠 *العنوان:* ${mForm.address}
━━━━━━━━━━━━━━━━━━
⚙️ *نوع الجهاز:* ${mForm.deviceType}
🏷️ *الماركة:* ${mForm.brand}
💼 *نوع الخدمة:* ${mForm.serviceType}
📝 *المشكلة للتصليح:* ${formattedProblem}
━━━━━━━━━━━━━━━━━━
⏰ *وقت الإرسال:* ${formattedNow()}`;

    openWhatsApp(maintenanceMsg);
    setMStep(4); // Move to final step 
  };

  // Trade-In Form submission
  const handleTradeInSubmit = () => {
    const isSell = tiForm.requestType === "sell";
    const headerTitle = isSell ? "طلب بيع جهاز مستعمل" : "طلب تجديد شامل لجهاز";
    const tradeMsg = `💰 *${headerTitle} - تك فيكس* 💰
━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${tiForm.name}
📞 *الهاتف:* ${tiForm.phone}
📍 *المنطقة:* ${tiForm.city}
━━━━━━━━━━━━━━━━━━
📦 *الجهاز:* ${tiForm.deviceType}
🏷️ *الماركة:* ${tiForm.brand}
📅 *العمر التقريبي:* ${tiForm.age}
📊 *الحالة العامة:* ${tiForm.condition}
📝 *ملاحظات إضافية:* ${tiForm.notes || "لا يوجد"}
━━━━━━━━━━━━━━━━━━
⏰ *وقت الإرسال:* ${formattedNow()}
💡 *ملاحظة:* يرجى تزويدنا بصور للجهاز بمجرد إرسال الرسالة لتقييم أفضل.`;

    openWhatsApp(tradeMsg);
    setIsTiSuccess(true);
  };

  // Reset helpers
  const handleResetMaintenance = () => {
    setMStep(0);
    setMForm({
      deviceType: "",
      serviceType: "",
      brand: "",
      problem: "",
      customProblem: "",
      name: "",
      phone: "",
      address: "",
      city: ""
    });
    setActiveTab("home");
  };

  const handleResetTradeIn = () => {
    setTiForm({
      requestType: "",
      deviceType: "بوتجاز",
      brand: "",
      age: "",
      condition: "",
      name: "",
      phone: "",
      city: "",
      notes: ""
    });
    setIsTiSuccess(false);
  };

  // Admin authentication handlers
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASS) {
      setIsAdminAuthenticated(true);
      setAdminError("");
      setIsAdminLoginVisible(false);
      triggerToast("تم تسجيل الدخول بنجاح كمسؤول");
    } else {
      setAdminError("كلمة المرور غير صحيحة، حاول مجدداً");
    }
  };

  // Admin operations on catalog
  const handleDeletePart = (id: number) => {
    if (window.confirm("هل أنت متأكد من رغبتك بحذف قطعة الغيار هذه من القائمة؟")) {
      const updated = parts.filter(p => p.id !== id);
      savePartsToStorage(updated);
      setCart(curr => curr.filter(item => item.id !== id));
      triggerToast("تم حذف قطعة الغيار بنجاح");
    }
  };

  const handleTogglePartAvailability = (id: number) => {
    const updated = parts.map(p => p.id === id ? { ...p, avail: !p.avail } : p);
    savePartsToStorage(updated);
    triggerToast("تم تعديل حالة توفر قطعة الغيار");
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartPrice) {
      alert("الطلب يحتاج إلى اسم وسعر مالي لقطعة الغيار على الأقل");
      return;
    }
    const newPart: Part = {
      id: Date.now(),
      name: newPartName,
      cat: newPartCat,
      price: Number(newPartPrice),
      icon: newPartCat === "cooker" ? "🔥" : "🌡️",
      img: newPartImg,
      desc: newPartDesc || "قطعة غيار معتمدة أصلية مكفولة بالكامل",
      avail: true
    };

    savePartsToStorage([...parts, newPart]);
    setNewPartName("");
    setNewPartPrice("");
    setNewPartImg("");
    setNewPartDesc("");
    triggerToast("تمت إضافة قطعة الغيار الجديدة بنجاح");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] font-sans text-[#f8fafc] flex flex-col selection:bg-brand-orange selection:text-black relative overflow-hidden">
      
      {/* Decorative matrix Grid background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-white/10 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand with Bold Accent */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-lg shadow-brand-orange/20 text-black font-black text-2xl">
              🔥
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter leading-none text-white uppercase">
                تك <span className="text-brand-orange">فيكس</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">صيانة وقطع غيار بأسلوب معاصر</p>
            </div>
          </div>

          {/* Nav tabs desktop style */}
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab("home")}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all ${
                activeTab === "home" 
                  ? "text-brand-orange border-b-2 border-brand-orange" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => { setActiveTab("maintenance"); setMStep(0); }}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all ${
                activeTab === "maintenance" 
                  ? "text-brand-orange border-b-2 border-brand-orange" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              طلب صيانة منزلية
            </button>
            <button 
              onClick={() => setActiveTab("parts")}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all ${
                activeTab === "parts" 
                  ? "text-brand-orange border-b-2 border-brand-orange" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              متجر قطع الغيار
            </button>
            <button 
              onClick={() => setActiveTab("tradein")}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all ${
                activeTab === "tradein" 
                  ? "text-brand-orange border-b-2 border-brand-orange" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              بيع وتجديد الأجهزة
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all flex items-center gap-1 ${
                activeTab === "admin" 
                  ? "text-[#38bdf8] border-b-2 border-[#38bdf8]" 
                  : "text-slate-400 hover:text-[#38bdf8]"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة التحكم بالإدارة</span>
            </button>
          </div>

          {/* Action buttons (Cart, Main Maintenance Click) */}
          <div className="flex items-center gap-3">
            {totalCartQty > 0 && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-brand-orange transition-all cursor-pointer flex items-center justify-center"
                id="cart-trigger-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-none bg-brand-orange text-black text-[10px] font-black flex items-center justify-center animate-bounce">
                  {totalCartQty}
                </span>
              </button>
            )}

            <button 
              onClick={() => { setActiveTab("maintenance"); setMStep(0); }}
              className="px-5 py-2.5 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black transition-all text-xs font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>اطلب صيانة</span>
            </button>
          </div>

        </div>

        {/* Navigation tabs mobile style */}
        <div className="flex md:hidden items-center justify-around mt-4 pt-3 border-t border-white/10">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "home" ? "text-brand-orange" : "text-slate-400"}`}
          >
            <span>🏠</span>
            <span>الرئيسية</span>
          </button>
          <button 
            onClick={() => { setActiveTab("maintenance"); setMStep(0); }}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "maintenance" ? "text-brand-orange" : "text-slate-400"}`}
          >
            <span>⚙️</span>
            <span>حجز صيانة</span>
          </button>
          <button 
            onClick={() => setActiveTab("parts")}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "parts" ? "text-brand-orange" : "text-slate-400"}`}
          >
            <span>🛒</span>
            <span>قطع الغيار</span>
          </button>
          <button 
            onClick={() => setActiveTab("tradein")}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "tradein" ? "text-brand-orange" : "text-slate-400"}`}
          >
            <span>💰</span>
            <span>بيع وتجديد</span>
          </button>
          <button 
            onClick={() => setActiveTab("admin")}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "admin" ? "text-[#38bdf8]" : "text-slate-400"}`}
          >
            <span>🔐</span>
            <span>الإدارة</span>
          </button>
        </div>
      </nav>

      {/* CORE APPLICATION CONTAINER */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 z-10">
        
        {/* TAB 1: HOME PANEL */}
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div 
              key="home-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-16"
            >
              
              {/* HERO SPLASH HEADER (BOLD TYPOGRAPHY STYLE) */}
              <div className="text-right max-w-4xl space-y-6 pt-6 border-b border-white/10 pb-12 mb-12">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#38bdf8] font-black block mb-3">
                    // مركز معتمد ومتخصص في الجيزة ومحيطها
                  </span>
                  <h2 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-none">
                    تصليح <span className="text-[#38bdf8]">البوتجازات</span> <br />
                    وسخانات الغاز
                  </h2>
                  <p className="text-slate-400 mt-4 text-lg sm:text-xl font-medium max-w-3xl leading-relaxed">
                    منظومة الصيانة الفورية المتكاملة في منزلك مع قطع غيار أصلية وضمان معتمد. لا نغادر حتى نتأكد من كفاءة تشغيل جهازك بأمان تام وأقل تكلفة ممكنة.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button 
                    onClick={() => { setActiveTab("maintenance"); setMStep(0); }}
                    className="px-8 py-4 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-sm tracking-widest uppercase transition-all"
                  >
                    🚀 احجز فني صيانة للعنوان
                  </button>

                  <button 
                    onClick={() => setActiveTab("parts")}
                    className="px-8 py-4 rounded-none bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10"
                  >
                    تصفح متجر قطع الغيار
                  </button>
                </div>
              </div>

              {/* STATS BENTO METRICS (BOLD TYPOGRAPHY CORE VALUE) */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold mb-6">مؤشرات الأداء السنوية ومستوى التغطية</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="bg-[#111114] border-r-4 border-emerald-500 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-black text-white">العملاء السعداء</span>
                        <span className="text-emerald-500 font-mono text-xl font-bold">+5000</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-serif italic">تقييم الخدمة من أهالي الجيزة: ممتاز</p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-[#38bdf8] p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-black text-white">سنوات الخبرة</span>
                        <span className="text-[#38bdf8] font-mono text-xl font-bold">+10</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-serif italic">فنيون ذوو تدريب واحترافية عالية</p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-amber-500 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-black text-white">الاستجابة</span>
                        <span className="text-amber-500 font-mono text-xl font-bold">24/7</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-serif italic">تنسيق وحجز فوري حتى أيام الجمعة</p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-blue-500 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-black text-white">قطع الغيار</span>
                        <span className="text-blue-400 font-mono text-xl font-bold">+500</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-serif italic">قطع أصلية جاهزة وسيارات تجهيز متنقلة</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ADVANCED GOOGLE LOCAL SEO TARGETING: GEOGRAPHICAL COVERAGE MAP SECTION */}
              <div id="coverage-area-panel" className="bg-[#111114] border-l-4 border-brand-orange p-8 sm:p-10">
                <div className="space-y-3 mb-8">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black block">// نطاق خدماتنا الجغرافية</span>
                  <h3 className="text-4xl font-black text-white tracking-tighter">التغطية المحلية الواسعة بالجيزة</h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                    نأتي إليك مجهزين بكامل العتاد والقطع لتقديم الصيانة المنزلية المعتمدة في كافة المدن والقرى المحيطة:
                  </p>
                </div>

                {/* Local Area SEO Tag Clouds */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {COV_AREAS.map((area, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[#1b1b1f] px-4 py-3 border border-white/5 flex items-center justify-between hover:border-brand-orange/30 transition-all group pointer-events-none"
                    >
                      <span className="text-sm font-black text-slate-200 group-hover:text-white">{area}</span>
                      <span className="text-brand-orange font-mono text-xs">ONLINE</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    STATUS_DEVICES: COOKERS & HEATERS FULLY OPERATIONAL
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 italic">
                    زمن تلبية الطلب والوصول لعنوانك: من ساعة إلى 3 ساعات كحد أقصى!
                  </span>
                </div>
              </div>

              {/* INTEGRATED SERVICES HIGHLIGHTS (BOLD DESIGN) */}
              <div className="space-y-8 pointer-events-none">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold block mb-2">// حلول صيانة متخصصة ومصنفة</span>
                  <h3 className="text-4xl font-black text-white tracking-tighter">الخدمات الأساسية التي نقدمها</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-[#111114] border-r-4 border-brand-orange p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-2xl mb-4">🔧</div>
                      <h4 className="text-xl font-black text-slate-100 mb-2">صيانة منزلية شاملة</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        تصليح فوري للأعطال بالمنزل دون الحاجة لنقل الجهاز ومصاريف إضافية ومضمونة بالكامل.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-[#38bdf8] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-2xl mb-4">🛒</div>
                      <h4 className="text-xl font-black text-slate-100 mb-2">قطع غيار أصلية</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        نوفر متجراً متكاملاً لبيع وتوريد قطع الغيار أصلية الصنع من المصنع مع ضمان حقيقي على الاستبدال.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-purple-500 p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-2xl mb-4">✨</div>
                      <h4 className="text-xl font-black text-slate-100 mb-2">تجديد شامل للأجهزة</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        نعيد دهان جلفنة الجهاز وتجديد المحابس والشعلات ليعود بوتجازك القديم للعمل كأنه جديد.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111114] border-r-4 border-emerald-500 p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-2xl mb-4">💰</div>
                      <h4 className="text-xl font-black text-slate-100 mb-2">شراء واستبدال القديم</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        نشتري سخانات الغاز والبوتجازات المستعملة الخردة أو التالفة بأفضل الأسعار النقدية المتاحة.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* TRUST PROTOCOL BANNER / CTA WITH DIRECT WHATSAPP */}
              <div className="bg-brand-orange text-black p-8 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-tr-[4rem]">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] font-black opacity-75 block mb-2">// تواصل مباشرة فورا</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-3">هل تواجه مشكلة مفاجئة في السخان أو البوتجاز؟</h3>
                  <p className="text-sm font-bold opacity-80 max-w-xl">
                    لا تتردد بالإتصال بالفنيين فوراً والحصول على استشارة فنية مجانية، أو حجز موعد زيارة منزلية سريعة.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto shrink-0">
                  <button 
                    onClick={() => { setActiveTab("maintenance"); setMStep(0); }}
                    className="bg-black text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-zinc-900 transition-all w-full md:w-auto"
                  >
                    🚀 طلب موعد إصلاح فوري
                  </button>

                  <a 
                    href={getWhatsAppMessageUrl("مرحبا تك فيكس، أريد الاستفسار عن خدمة صيانة منزلية سريعاً للضرورة لو سمحت.")}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25d366] text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-[#128c7e] transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    <Phone className="w-4 h-4" />
                    <span>واتس آب (01117735952)</span>
                  </a>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 2: MAINTENANCE STEP-BY-STEP WIZARD */}
        <AnimatePresence mode="wait">
          {activeTab === "maintenance" && (
            <motion.div 
              key="m-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-black text-white">🔧 حجز خدمة الصيانة المنزلية</h2>
                <p className="text-neutral-400 text-sm">أجب عن الأسئلة القصيرة لنقوم بتهيئة الفني وتجهيز الأدوات اللازمة لعنوانك</p>
              </div>

              <div className="bg-[#111114] rounded-none p-6 sm:p-8 border border-white/10 shadow-2xl relative">
                
                {/* Steps tracker indicators */}
                {mStep < 4 && (
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {[0, 1, 2, 3].map((stepIdx) => {
                        const isDone = mStep > stepIdx;
                        const isCurrent = mStep === stepIdx;
                        return (
                          <div 
                            key={stepIdx}
                            className={`w-9 h-9 rounded-none font-black text-sm flex items-center justify-center transition-all border duration-300 ${
                              isDone 
                                ? "bg-brand-orange border-transparent text-black" 
                                : isCurrent
                                  ? "bg-white text-black border-white ring-4 ring-white/10"
                                  : "bg-[#1b1b1f] text-slate-500 border-white/10"
                            }`}
                          >
                            {isDone ? "✓" : stepIdx + 1}
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress tracking line */}
                    <div className="w-full h-1 bg-[#1b1b1f] rounded-none overflow-hidden">
                      <div 
                        className="h-full bg-brand-orange transition-all duration-300"
                        style={{ width: `${(mStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 0: SELECT APPLIANCE */}
                {mStep === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-center text-white mb-2">ما هو الجهاز الذي ترغب في صيانته؟</h3>
                    <div className="grid grid-cols-2 gap-4">
                      
                      <button 
                        onClick={() => setMForm(f => ({ ...f, deviceType: "بوتجاز" }))}
                        className={`p-6 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                          mForm.deviceType === "بوتجاز" 
                            ? "border-brand-orange bg-brand-orange/5 text-brand-orange font-black" 
                            : "border-white/10 bg-[#1b1b1f] hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <span className="text-4xl animate-bounce">🍳</span>
                        <span className="font-bold text-sm">بوتجاز طهي</span>
                      </button>

                      <button 
                        onClick={() => setMForm(f => ({ ...f, deviceType: "سخان غاز" }))}
                        className={`p-6 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                          mForm.deviceType === "سخان غاز" 
                            ? "border-brand-orange bg-brand-orange/5 text-brand-orange font-black" 
                            : "border-white/10 bg-[#1b1b1f] hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <span className="text-4xl animate-bounce">🚿</span>
                        <span className="font-bold text-sm">سخان غاز</span>
                      </button>

                    </div>
                  </div>
                )}

                {/* STEP 1: SERVICE TYPE */}
                {mStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-center text-white mb-2">ما هو نوع الخدمة المنزلية المطلوبة؟</h3>
                    
                    {[
                      { title: "صيانة وتصليح عطل بالجهاز", desc: "إصلاح تسريب، شعلات مسدودة أو مشاكل الإشعال", icon: "🔧" },
                      { title: "توصيل وتثبيت جهاز جديد", desc: "تركيب الفونيات وتحويله للعمل على الغاز الطبيعي أو الأنبوبة", icon: "📦" },
                      { title: "تجديد وصيانة عمرة كاملة", desc: "إعادة بناء الهيكل المتهالك والصمامات التالفة بالكامل", icon: "✨" }
                    ].map((svc, sIdx) => {
                      const isSel = mForm.serviceType === svc.title;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => setMForm(f => ({ ...f, serviceType: svc.title }))}
                          className={`w-full p-4 rounded-none border transition-all text-right flex items-center gap-4 cursor-pointer ${
                            isSel 
                              ? "border-brand-orange bg-brand-orange/5 text-brand-orange" 
                              : "border-white/10 bg-[#1b1b1f] hover:bg-neutral-800/10 text-slate-300"
                          }`}
                        >
                          <span className="text-2xl">{svc.icon}</span>
                          <div className="flex-grow">
                            <div className="font-black text-sm">{svc.title}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">{svc.desc}</div>
                          </div>
                        </button>
                      );
                    })}

                  </div>
                )}

                {/* STEP 2: DETAILS (BRAND, PROBLEM) */}
                {mStep === 2 && (
                  <div className="space-y-5 text-right">
                    <h3 className="text-lg font-black text-center text-white mb-2">تفاصيل العطل والماركة</h3>
                    
                    {/* Brand dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block">ماركة المصنع للجهاز <span className="text-brand-orange">*</span></label>
                      <select 
                        value={mForm.brand}
                        onChange={(e) => setMForm(f => ({ ...f, brand: e.target.value }))}
                        className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                      >
                        <option value="" disabled>اختر الماركة المصنعة لطلبك</option>
                        {(BRANDS_DATA[mForm.deviceType as keyof typeof BRANDS_DATA] || []).map((br, bIdx) => (
                          <option key={bIdx} value={br}>{br}</option>
                        ))}
                      </select>
                    </div>

                    {/* Common Problem chip selections */}
                    <div className="space-y-2">
                       <label className="text-xs text-slate-400 font-bold block">العرض أو المشكلة الرئيسية <span className="text-brand-orange">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {(PROBLEMS_DATA[mForm.deviceType as keyof typeof PROBLEMS_DATA] || []).map((prob, pIdx) => {
                          const isSel = mForm.problem === prob;
                          return (
                            <button
                              key={pIdx}
                              onClick={() => setMForm(f => ({ ...f, problem: prob, customProblem: "" }))}
                              className={`px-3.5 py-1.5 rounded-none text-xs font-semibold transition-all border cursor-pointer ${
                                isSel
                                  ? "bg-brand-orange text-black border-brand-orange font-black"
                                  : "bg-[#1b1b1f] border-white/10 text-slate-300 hover:border-white/20"
                              }`}
                            >
                              {prob}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom text problem description */}
                    <div className="space-y-1.5 pt-2">
                       <label className="text-xs text-slate-400 font-bold block">أو اكتب وصفاً وملاحظات مخصصة تود إطلاع الفني عليها</label>
                      <textarea 
                        value={mForm.customProblem}
                        onChange={(e) => setMForm(f => ({ ...f, customProblem: e.target.value, problem: e.target.value ? "" : f.problem }))}
                        rows={3}
                        placeholder="اكتب تفاصيل إضافية مثل: هناك تسريب في المحبس الثاني، أو سخان الغاز لا يستشعر ضغط المياه..."
                        className="w-full p-3.5 rounded-none bg-brand-input border border-white/15 text-white text-xs outline-none focus:border-brand-orange resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: CLIENT INFORMATION */}
                {mStep === 3 && (
                  <div className="space-y-4 text-right">
                    <h3 className="text-lg font-black text-center text-white mb-2">بيانات مالك الطلب والعنوان بالتفصيل</h3>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block">الاسم بالكامل <span className="text-brand-orange">*</span></label>
                      <input 
                        type="text"
                        placeholder="مثال: أحمد عبد الله الهاشم"
                        value={mForm.name}
                        onChange={(e) => setMForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block">رقم الهاتف الفعال للتواصل <span className="text-brand-orange">*</span></label>
                      <input 
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={mForm.phone}
                        onChange={(e) => setMForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">الموقع / المنطقة المحددة <span className="text-brand-orange">*</span></label>
                        <select 
                          value={mForm.city}
                          onChange={(e) => setMForm(f => ({ ...f, city: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        >
                          <option value="" disabled>اختر منطقتك السكنية</option>
                          {COV_AREAS.map((city, cIdx) => (
                            <option key={cIdx} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">تفاصيل الشارع والمنزل <span className="text-brand-orange">*</span></label>
                        <input 
                          type="text"
                          placeholder="الشارع، الدور، شقة"
                          value={mForm.address}
                          onChange={(e) => setMForm(f => ({ ...f, address: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: SUCCESS COMPLETED RESPONSE */}
                {mStep === 4 && (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-none bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500 text-3xl font-black">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-emerald-400 text-2xl font-black">وصلنا طلب الصيانة الفورية!</h4>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                        تم تجميع طلبك وإرساله إلى الفني المسؤول عن الصيانة. سيتم مراجعة طلبك والتواصل معك عبر الهاتف أو الواتس آب في غضون ربع ساعة فقط!
                      </p>
                    </div>
                    <button 
                      onClick={handleResetMaintenance}
                      className="px-6 py-3 rounded-none bg-[#111114] border border-white/10 hover:bg-[#1b1b1f] text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                    >
                      موافق، شكراً! 👍
                    </button>
                  </div>
                )}

                {/* Navigation controls footer of wizard */}
                {mStep < 4 && (
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
                    {mStep > 0 && (
                      <button 
                        onClick={() => setMStep(curr => curr - 1)}
                        className="px-5 py-3 rounded-none bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronRight className="w-4 h-4 ml-1" />
                        السابق
                      </button>
                    )}

                    {mStep < 3 ? (
                      <button 
                        onClick={() => { if(isMStepValid()) setMStep(curr => curr + 1); }}
                        disabled={!isMStepValid()}
                        className="flex-grow py-3 px-5 rounded-none bg-brand-orange disabled:bg-neutral-800 disabled:text-neutral-500 font-black text-sm text-black select-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>متابعة الطلب</span>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleMaintenanceSubmit}
                        disabled={!isMStepValid()}
                        className="flex-grow py-3.5 px-5 rounded-none bg-brand-orange text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-extrabold text-sm select-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Phone className="w-4 h-4" />
                        <span>إرسال وتأكيد الطلب الفوري عبر واتس آب</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 3: PARTS STORE SECTION */}
        <AnimatePresence mode="wait">
          {activeTab === "parts" && (
            <motion.div 
              key="parts-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#38bdf8] font-bold block">// توريد قطع الغيار فورياً</span>
                <h2 className="text-4xl font-black text-white tracking-tighter">🛍️ متجر قطع غيار معتمدة</h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  تصفح واشترِ قطع غيار السخانات والبوتجازات الأصلية بجميع المقاسات وبسعر معقول. سنقوم بشحنها لباب منزلك مع ضمان استبدال.
                </p>
              </div>

              {/* Filtering Controls Row */}
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => setPartsFilter("all")}
                  className={`px-5 py-2.5 rounded-none text-xs font-bold transition-all border ${
                    partsFilter === "all" 
                      ? "bg-brand-orange border-transparent text-black font-black" 
                      : "bg-[#111114] border-white/10 text-slate-400 hover:border-white/15"
                  }`}
                >
                  الكل ({parts.filter(p => p.avail).length})
                </button>
                <button 
                  onClick={() => setPartsFilter("cooker")}
                  className={`px-5 py-2.5 rounded-none text-xs font-bold transition-all border ${
                    partsFilter === "cooker" 
                      ? "bg-brand-orange border-transparent text-black font-black" 
                      : "bg-[#111114] border-white/10 text-slate-400 hover:border-white/15"
                  }`}
                >
                  قطع بوتجاز ({parts.filter(p => p.avail && p.cat === "cooker").length})
                </button>
                <button 
                  onClick={() => setPartsFilter("heater")}
                  className={`px-5 py-2.5 rounded-none text-xs font-bold transition-all border ${
                    partsFilter === "heater" 
                      ? "bg-brand-orange border-transparent text-black font-black" 
                      : "bg-[#111114] border-white/10 text-slate-400 hover:border-white/15"
                  }`}
                >
                  قطع سخان غاز ({parts.filter(p => p.avail && p.cat === "heater").length})
                </button>
              </div>

              {/* Parts Listing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {parts
                  .filter(p => p.avail && (partsFilter === "all" || p.cat === partsFilter))
                  .map((item) => {
                    const cartItemInstance = cart.find(i => i.id === item.id);
                    const qty = cartItemInstance?.qty || 0;

                    return (
                      <div 
                        key={item.id}
                        className="bg-[#111114] rounded-none overflow-hidden border border-white/10 hover:border-brand-orange/45 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                      >
                        <div 
                          onClick={() => setActiveZoomedPart(item)}
                          className="relative cursor-zoom-in overflow-hidden group/img"
                        >
                          {/* Image Placeholder with category emoji */}
                          <div className="w-full h-44 bg-[#1b1b1f] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-300">
                            {item.img ? (
                              <img 
                                src={item.img} 
                                alt={item.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                onError={(e) => {
                                  // Fallback indicator
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="transition-transform duration-500 group-hover/img:scale-110">{item.icon || "⚙️"}</span>
                            )}
                            
                            <span className="absolute top-3 right-3 text-[10px] font-black tracking-wide px-2.5 py-1 rounded-none bg-black text-brand-orange uppercase border border-white/10 z-10">
                              {item.cat === "cooker" ? "بوتجاز" : "سخان غاز"}
                            </span>
                          </div>

                          {/* Hover magnifying indicator label */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black gap-1">
                            <span>🔍 تكبير واستكشاف الصورة</span>
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-white font-black text-sm leading-snug tracking-tight">{item.name}</h4>
                            <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{item.desc}</p>
                          </div>

                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-brand-orange font-black text-lg">{item.price} ج.م</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-none border border-emerald-500/20 font-bold">متوفر فوراً ✓</span>
                            </div>

                            {/* Cart Add / Qty Controllers */}
                            <div>
                              {qty > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between bg-[#1b1b1f] rounded-none p-1.5 border border-white/10">
                                    <button 
                                      onClick={() => updateCartQty(item.id, -1)}
                                      className="w-8 h-8 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="font-extrabold text-white text-sm">{qty}</span>
                                    <button 
                                      onClick={() => updateCartQty(item.id, 1)}
                                      className="w-8 h-8 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => setIsCartOpen(true)}
                                    className="w-full py-2.5 px-4 rounded-none bg-brand-orange text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <span>🛒 عرض السلة ودفع الطلب ({qty})</span>
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => updateCartQty(item.id, 1)}
                                  className="w-full py-2.5 px-4 rounded-none bg-[#1b1b1f] border border-white/10 hover:border-brand-orange hover:bg-brand-orange/5 text-slate-200 hover:text-brand-orange font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>أضف إلى سلة المشتريات</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 4: TRADE-IN / SELL / RENEW OR EXCHANGE */}
        <AnimatePresence mode="wait">
          {activeTab === "tradein" && (
            <motion.div 
              key="ti-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center space-y-3 mb-8">
                <span className="text-xs uppercase tracking-[0.3em] text-[#38bdf8] font-bold block">// خدمات استبدال وتثمين ذكية</span>
                <h2 className="text-4xl font-black text-white tracking-tighter">💰 بيع أو جدّد جهازك المستعمل</h2>
                <p className="text-slate-400 text-sm">احصل على تقييم نقدي عادل لشراء بوتجازك أو سخانك التالف، أو اطلب تجديده كلياً ليعود جديداً</p>
              </div>

              <div className="bg-[#111114] rounded-none p-6 sm:p-8 border border-white/10 shadow-2xl relative text-right">
                
                {!isTiSuccess ? (
                  <div className="space-y-6">
                    
                    {/* Choose Goal Category */}
                    <div className="space-y-2.5">
                      <label className="text-xs text-slate-400 font-bold block">ما هو غرضك الأساسي من الطلب؟ <span className="text-brand-orange">*</span></label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setTiForm(f => ({ ...f, requestType: "sell" }))}
                          className={`p-4 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            tiForm.requestType === "sell"
                              ? "border-brand-orange bg-brand-orange/5 text-brand-orange font-black"
                              : "border-white/10 bg-[#1b1b1f] hover:border-white/20 text-slate-300"
                          }`}
                        >
                          <span className="text-2xl animate-pulse">💰</span>
                          <span className="font-black text-xs">أريد بيع جهازي للورشة</span>
                        </button>

                        <button 
                          onClick={() => setTiForm(f => ({ ...f, requestType: "renew" }))}
                          className={`p-4 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            tiForm.requestType === "renew"
                              ? "border-brand-orange bg-brand-orange/5 text-brand-orange font-black"
                              : "border-white/10 bg-[#1b1b1f] hover:border-white/20 text-slate-300"
                          }`}
                        >
                          <span className="text-2xl animate-pulse">✨</span>
                          <span className="font-black text-xs">أريد تجديد جهازي بالكامل</span>
                        </button>
                      </div>
                    </div>

                    {/* Appliance & Brand info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">نوع الجهاز المتوفر <span className="text-brand-orange">*</span></label>
                        <select 
                          value={tiForm.deviceType}
                          onChange={(e) => setTiForm(f => ({ ...f, deviceType: e.target.value, brand: "" }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        >
                          <option value="بوتجاز">بوتجاز</option>
                          <option value="سخان غاز">سخان غاز</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">الماركة المصنعة <span className="text-brand-orange">*</span></label>
                        <select 
                          value={tiForm.brand}
                          onChange={(e) => setTiForm(f => ({ ...f, brand: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        >
                          <option value="" disabled>اختر ماركة المصنع</option>
                          {(BRANDS_DATA[tiForm.deviceType as keyof typeof BRANDS_DATA] || []).map((br, bIdx) => (
                            <option key={bIdx} value={br}>{br}</option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Age and condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">العمر الافتراضي التقريبي للجهاز <span className="text-brand-orange">*</span></label>
                        <select 
                          value={tiForm.age}
                          onChange={(e) => setTiForm(f => ({ ...f, age: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        >
                          <option value="" disabled>كم عمر الجهاز التقريبي؟</option>
                          <option value="أقل من سنة">أقل من سنة</option>
                          <option value="من سنة إلى 3 سنوات">من سنة إلى 3 سنوات</option>
                          <option value="من 3 إلى 5 سنوات">من 3 إلى 5 سنوات</option>
                          <option value="من 5 إلى 10 سنوات">من 5 إلى 10 سنوات</option>
                          <option value="أكثر من 10 سنوات">أكثر من 10 سنوات</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">الحالة العامة للتشغيل حالياً <span className="text-brand-orange">*</span></label>
                        <select 
                          value={tiForm.condition}
                          onChange={(e) => setTiForm(f => ({ ...f, condition: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        >
                          <option value="" disabled>ما هي حالته الفنية؟</option>
                          <option value="ممتاز - يعمل بشكل رائع دون عطل">ممتاز - يعمل بشكل رائع دون عطل</option>
                          <option value="جيد - يشتغل به بعض العيوب الطفيفة">جيد - يشتغل به بعض العيوب الطفيفة</option>
                          <option value="متوسط - يحتاج صيانة فورية ليعمل">متوسط - يحتاج صيانة فورية ليعمل</option>
                          <option value="تالف - لا يعمل نهائياً (خردة)">تالف - لا يعمل نهائياً (خردة)</option>
                        </select>
                      </div>

                    </div>

                    {/* Personal data boundary */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">اسمك بالكامل <span className="text-brand-orange">*</span></label>
                        <input 
                          type="text"
                          placeholder="الرجاء كتابة اسمك الكامل"
                          value={tiForm.name}
                          onChange={(e) => setTiForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">رقم هاتفك الفعال للإتصال <span className="text-brand-orange">*</span></label>
                          <input 
                            type="tel"
                            placeholder="01xxxxxxxxx"
                            value={tiForm.phone}
                            onChange={(e) => setTiForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange text-left"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">منطقتك السكنية بالجيزة <span className="text-brand-orange">*</span></label>
                          <select 
                            value={tiForm.city}
                            onChange={(e) => setTiForm(f => ({ ...f, city: e.target.value }))}
                            className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                          >
                            <option value="" disabled>اختر موقع سكنك</option>
                            {COV_AREAS.map((city, cIdx) => (
                              <option key={cIdx} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                      </div>

                    </div>

                    {/* Custom Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block">ملاحظات إضافية أو مشاكل أخرى تود ذكرها</label>
                      <textarea 
                        value={tiForm.notes}
                        onChange={(e) => setTiForm(f => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        placeholder="مثال: البوتجاز به بعض الصدأ السطحي ومروحة الفرن لا تشتغل..."
                        className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-xs outline-none focus:border-brand-orange resize-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-none bg-brand-orange/5 border border-brand-orange/15 flex items-start gap-2 text-slate-400 text-xs leading-relaxed">
                      <Info className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                      <span>
                        بمجرد تسيير الطلب، سيقوم فني المعاينة بالاتصال بك فوراً لإعطاء السعر المقترح والبدء بعملية الشراء أو التجديد!
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button 
                      onClick={handleTradeInSubmit}
                      disabled={!tiForm.requestType || !tiForm.brand || !tiForm.age || !tiForm.condition || !tiForm.name || !tiForm.phone || !tiForm.city}
                      className="w-full py-4 rounded-none bg-brand-orange text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-black text-sm select-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Phone className="w-4 h-4" />
                      <span>إرسال ومتابعة الطلب عبر واتس آب</span>
                    </button>

                  </div>
                ) : (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-none bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500 text-3xl font-black">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-emerald-400 text-2xl font-black">تم إرسال الطلب بنجاح!</h4>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                        سوف يتم مراجعة بيانات جهازك المستند للبروتوكول المقترح والتواصل معك لتأكيد تسليم المبلغ أو ترتيبات شحن الجهاز وتجديده بالكامل.
                      </p>
                    </div>
                    <button 
                      onClick={handleResetTradeIn}
                      className="px-6 py-3 rounded-none bg-[#111114] border border-white/10 hover:bg-[#1b1b1f] text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                    >
                      موافق، تقديم طلب جديد
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-right"
              dir="rtl"
            >
              <div className="bg-[#111114] border border-white/10 p-6 md:p-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-[10px] tracking-[0.25em] text-[#38bdf8] font-bold block">// البوابة البرمجية لإدارة لوحة الصيانة</span>
                    <h2 className="text-3xl font-black text-white tracking-tight">⚙️ لوحة تحكم المسؤول وتعديل المخزون</h2>
                  </div>
                  {isAdminAuthenticated ? (
                    <button 
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        triggerToast("تم تسجيل الخروج بنجاح كمسؤول");
                      }}
                      className="px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-300 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-transparent transition-all cursor-pointer rounded-none"
                    >
                      🔒 الخروج من بوابة الإدارة
                    </button>
                  ) : (
                    <span className="text-xs bg-brand-orange/15 text-brand-orange font-black px-3 py-1.5 border border-brand-orange/20 animate-pulse">
                      المنطقة الإدارية مغلقة 🔒
                    </span>
                  )}
                </div>
              </div>

              {!isAdminAuthenticated ? (
                <div className="bg-[#111114] border border-white/10 p-8 max-w-md mx-auto shadow-2xl space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-xl font-bold">
                      🔐
                    </div>
                    <h3 className="text-white font-black text-base">يرجى تسجيل الدخول</h3>
                    <p className="text-slate-400 text-[11px]">أدخل الرقم السري المعتمد لإجراء التعديل الفوري لمخزن القطع وتحديثات الواتس آب</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block">كلمة المرور الكودية للورشة</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                        className="w-full py-3 px-4 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange text-center tracking-widest font-bold font-mono"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleAdminLogin}
                      className="w-full py-3 px-4 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black text-xs font-black transition-all cursor-pointer shadow-md"
                    >
                      تأكيد الولوج وفتح التحكم ✓
                    </button>
                  </div>

                  {adminError && (
                    <p className="text-red-400 text-xs text-center font-bold bg-red-500/5 py-2 border border-red-500/10">
                      ⚠️ {adminError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Config Box: WA Number */}
                  <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-3">
                    <h4 className="text-white font-black text-sm">📱 تعيين رقم الواتس آب المسؤول لمسار الطلبات</h4>
                    <div className="flex items-center gap-2 max-w-sm">
                      <input 
                        type="text"
                        placeholder="201117735952"
                        value={waNumber}
                        onChange={(e) => saveWaToStorage(e.target.value)}
                        className="flex-grow p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left font-bold"
                        dir="ltr"
                      />
                      <button 
                        onClick={() => triggerToast("تم حفظ وتحديث رقم هاتف المسؤول بنجاح")}
                        className="px-4 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Save className="w-4 h-4" />
                        <span>حفظ الرقم</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">يرجى كتابة رمز الدولة أولاً دون إشارة الموجب (+) (مثال: 20 للجمهورية متبوعاً بالرقم)</p>
                  </div>

                  {/* List & Edit existing items */}
                  <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                    <h4 className="text-white font-black text-sm">📃 قائمة جرد ومخزون المبيعات الحالي بموقعك</h4>
                    
                    <div className="overflow-x-auto rounded-none border border-white/10">
                      <table className="w-full text-right text-xs table-auto">
                        <thead className="bg-[#0a0a0c] text-slate-400 uppercase font-bold text-[10px]">
                          <tr>
                            <th className="p-3.5">اسم قطعة الغيار</th>
                            <th className="p-3.5">الفئة</th>
                            <th className="p-3.5">السعر (ج.م)</th>
                            <th className="p-3.5 text-center">حالة التوفر</th>
                            <th className="p-3.5">صورة (رابط أول)</th>
                            <th className="p-3.5 text-center">خيارات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {parts.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 font-semibold text-white">
                                <input 
                                  type="text"
                                  value={p.name}
                                  onChange={(e) => {
                                    const updatedParts = parts.map(x => x.id === p.id ? { ...x, name: e.target.value } : x);
                                    savePartsToStorage(updatedParts);
                                  }}
                                  className="bg-transparent border-0 border-b border-white/10 focus:border-brand-orange outline-none p-1 text-xs w-full text-white font-bold"
                                />
                              </td>
                              <td className="p-3">
                                <select 
                                  value={p.cat}
                                  onChange={(e) => {
                                    const updatedParts = parts.map(x => x.id === p.id ? { ...x, cat: e.target.value as PartCategory } : x);
                                    savePartsToStorage(updatedParts);
                                  }}
                                  className="bg-[#0a0a0c] border border-white/15 rounded-none p-1 text-xs text-white color-white"
                                >
                                  <option value="cooker">بوتجاز</option>
                                  <option value="heater">سخان غاز</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="number"
                                  value={p.price}
                                  onChange={(e) => {
                                    const updatedParts = parts.map(x => x.id === p.id ? { ...x, price: Number(e.target.value) } : x);
                                    savePartsToStorage(updatedParts);
                                  }}
                                  className="bg-transparent border-0 border-b border-white/10 focus:border-brand-orange outline-none p-1 text-xs w-20 text-white font-bold"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => handleTogglePartAvailability(p.id)}
                                  className={`px-3 py-1 rounded-none text-[10px] font-bold transition-all border shrink-0 ${
                                    p.avail 
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                      : "bg-red-500/10 border-red-500/25 text-red-400"
                                  }`}
                                >
                                  {p.avail ? "عرض بالمتجر" : "مخفي ومحذوف"}
                                </button>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={p.img}
                                  placeholder="https://..."
                                  onChange={(e) => {
                                    const updatedParts = parts.map(x => x.id === p.id ? { ...x, img: e.target.value } : x);
                                    savePartsToStorage(updatedParts);
                                  }}
                                  className="bg-[#0a0a0c] border border-white/15 rounded-none p-1.5 text-[10px] w-36 text-slate-300 outline-none"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => handleDeletePart(p.id)}
                                  className="p-1.5 rounded-none bg-red-500/10 border border-red-500/15 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="حذف القطعة فوريا"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add New Part Block Form */}
                  <form onSubmit={handleAddPart} className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                    <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand-orange" />
                      <span>إضافة قطعة غيار جديدة للقائمة للمتجر</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">اسم قطعة الغيار</label>
                        <input 
                          type="text"
                          placeholder="مثال: ترموكوبل سخان إيطالي"
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                          className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">سعر التجزئة المالي (ج.م)</label>
                        <input 
                          type="number"
                          placeholder="الرجاء كتابة السعر بالأرقام"
                          value={newPartPrice}
                          onChange={(e) => setNewPartPrice(e.target.value)}
                          className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">فئة تصنيف القطعة</label>
                        <select 
                          value={newPartCat}
                          onChange={(e) => setNewPartCat(e.target.value as PartCategory)}
                          className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                        >
                          <option value="cooker">بوتجاز طهيي</option>
                          <option value="heater">سخان غاز</option>
                        </select>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">رابط الصورة (اختياري)</label>
                        <input 
                          type="text"
                          placeholder="https://example.com/item.jpg"
                          value={newPartImg}
                          onChange={(e) => setNewPartImg(e.target.value)}
                          className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-bold block">وصف مختصر للقطعة</label>
                        <input 
                          type="text"
                          placeholder="مثال: يمنع تسريب الغاز في حالة انطفاء الشعلة المفاجئ..."
                          value={newPartDesc}
                          onChange={(e) => setNewPartDesc(e.target.value)}
                          className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full sm:w-auto py-3 px-6 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs transition-colors cursor-pointer"
                    >
                      تأكيد وبث قطعة الغيار الجديدة بالمتجر لقائمة العملاء
                    </button>

                  </form>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/10 bg-[#0c0c0e] py-12 px-6 text-center text-xs text-slate-500 space-y-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="font-extrabold text-[#fff] text-sm tracking-tight">// مركز تك فيكس المعتمد لصيانة البوتجازات وسخانات الغاز بالجيزة</p>
          <p className="leading-relaxed text-slate-400">
            نوفر لكم خدمات فنية احترافية منزلية بأرخص التكاليف بالاعتماد على قطع الغيار الأصلية والضمان الشامل.
          </p>
          <p className="text-[#38bdf8] font-bold">
            مناطق التغطية المباشرة الفورية الدائمة: مدينة الحوامدية | البدرشين | منيل شيحة | طموة | سقارة | المريوطية | أم خنان | منى الأمير | عرب التل
          </p>
        </div>
        <div className="pt-6 border-t border-white/10 text-[10px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} - تك فيكس لخدمات الصيانة والخدمات المنزلية بجهورية مصر العربية.</span>
          <span>خدمة فنية متاحة في منزلك على مدار الـ 24 ساعة للإصلاحات الطارئة.</span>
        </div>
      </footer>

      {/* WHATSAPP FLOATING SPEED DIAL */}
      <a 
        href={getWhatsAppMessageUrl("مرحباً تك فيكس، أريد الاستفسار عن حجز تصليح صيانة منزلية لجهازي فوراً.")}
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-orange text-black flex items-center justify-center text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 border border-white/20 font-black"
        title="تواصل معنا سريعاً عبر واتس آب"
      >
        💬
      </a>

      {/* CART DRAWER SLIDER POPUP (SIDE SHEET) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop black overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/85 z-50 cursor-pointer"
            />
            {/* Side-sheet drawer */}
            <motion.div 
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 right-0 sm:right-auto sm:w-md bg-[#111114] border-r border-white/10 z-50 flex flex-col justify-between overflow-hidden shadow-2xl text-right rounded-none"
              dir="rtl"
            >
              
              {/* Drawer header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1b1b1f]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛒</span>
                  <h3 className="font-black text-[#fff] text-base">سلة المشتريات والقطع</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Catalog Items List */}
              <div className="flex-grow overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-24 space-y-3">
                    <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-500 text-2xl font-bold">
                      🛒
                    </div>
                    <p className="text-slate-400 text-sm font-semibold">سلة قطعه الغيار فارغة حالياً</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); setActiveTab("parts"); }}
                      className="px-4 py-2 rounded-none bg-brand-orange text-black text-xs font-black hover:bg-brand-orange/95 transition-all cursor-pointer"
                    >
                      تصفح متجر قطع الغيار لإضافتها
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-[#1b1b1f] p-3.5 rounded-none border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Part icon fallback */}
                          <div className="w-11 h-11 rounded-none bg-brand-orange/10 border border-brand-orange/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {item.img ? (
                              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{item.icon || "⚙️"}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-secondary-100 line-clamp-1">{item.name}</h4>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {item.price.toLocaleString()} ج.م / قطعة
                            </span>
                          </div>
                        </div>

                        {/* Controls & Price */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-[#111114] p-1.5 rounded-none border border-white/10 gap-2.5">
                            <button 
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-6 h-6 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white text-xs">{item.qty}</span>
                            <button 
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-6 h-6 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-xs font-bold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <span className="text-brand-orange font-black text-xs min-w-[55px] text-left">
                            {(item.price * item.qty).toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer checkout information fields */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-[#1b1b1f] space-y-4">
                  
                  <div className="space-y-3">
                    <h4 className="text-slate-400 text-xs font-black tracking-wider">// بيانات الشحن المنزلي الفوري</h4>
                    
                    <div className="space-y-1.5">
                      <input 
                        type="text"
                        placeholder="اسمك الكامل *"
                        value={checkName}
                        onChange={(e) => setCheckName(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <input 
                        type="tel"
                        placeholder="رقم هاتفك للتواصل *"
                        value={checkPhone}
                        onChange={(e) => setCheckPhone(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left"
                        dir="ltr"
                      />
                      <select 
                        value={checkCity}
                        onChange={(e) => setCheckCity(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                      >
                        <option value="" disabled>المدينة/القرية بالجيرة *</option>
                        {COV_AREAS.map((city, cIdx) => (
                          <option key={cIdx} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <input 
                        type="text"
                        placeholder="العنوان وملاحظات التوصيل بالتفصيل *"
                        value={checkAddr}
                        onChange={(e) => setCheckAddr(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm">
                    <span className="text-slate-400 font-bold">الإجمالي للمشتريات:</span>
                    <span className="text-brand-orange font-black text-xl">{totalCartPrice.toLocaleString()} ج.م</span>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !checkName || !checkPhone || !checkCity || !checkAddr}
                    className="w-full py-3.5 px-4 rounded-none bg-brand-orange disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCheckingOut ? (
                      <span className="inline-block w-4 h-4 rounded-none border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <span>تأكيد الشراء وإيفاد طلب الشحن المنزلي</span>
                    )}
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* POPUP FULL-SCREEN MODAL FOR ORDERS SUCCESS */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="fixed inset-0 bg-black cursor-pointer"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] border-2 border-brand-orange/30 rounded-3xl p-8 max-w-sm w-full text-center relative z-10 space-y-6 shadow-2xl text-right"
              dir="rtl"
            >
              <div className="w-16 h-16 rounded-full bg-brand-orange/10 border-2 border-brand-orange flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-brand-orange">تم تعميد طلب الشراء بنجاح!</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  شكراً لثقتكم بنا، تم تسجيل طلبيتك بنجاح لتغذية مستودعات الفروع وسيتم تجهيز قطع الغيار للشحن فوراً والتنسيق تلفونياً معك.
                </p>
              </div>

              <div className="bg-[#131222] p-3 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-neutral-400 font-bold">رقم الطلب الفريد المرجعي:</span>
                <div className="text-brand-orange font-black text-lg mt-0.5">{successOrderRef}</div>
              </div>

              <button 
                onClick={() => { setIsSuccessModalOpen(false); }}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold text-sm transition-all focus:ring-2 focus:ring-brand-orange/50 cursor-pointer"
              >
                شكرًا، موافق! 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAGNIFIED IMAGE MODAL OVERLAY */}
      <AnimatePresence>
        {activeZoomedPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveZoomedPart(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-[#111114] border border-white/15 w-full max-w-2xl relative z-10 flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-none text-right"
              dir="rtl"
            >
              {/* Close Button top corner */}
              <button 
                onClick={() => setActiveZoomedPart(null)}
                className="absolute top-4 left-4 z-20 w-10 h-10 rounded-none bg-black/85 border border-white/10 text-white flex items-center justify-center hover:bg-brand-orange hover:text-black hover:border-transparent transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Image Panel */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-[#1b1b1f] flex items-center justify-center text-7xl relative overflow-hidden shrink-0 border-l border-white/10">
                {activeZoomedPart.img ? (
                  <img src={activeZoomedPart.img} alt={activeZoomedPart.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{activeZoomedPart.icon || "⚙️"}</span>
                )}
                <span className="absolute bottom-4 right-4 text-[10px] font-black tracking-widest px-3 py-1 bg-black text-brand-orange uppercase border border-white/10">
                  {activeZoomedPart.cat === "cooker" ? "بوتجاز" : "سخان غاز"}
                </span>
              </div>

              {/* Information body */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] tracking-[0.25em] text-[#38bdf8] font-bold block">// تفاصيل قطعة الغيار المعتمدة</span>
                  <h3 className="text-white font-black text-xl leading-snug tracking-tight">{activeZoomedPart.name}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{activeZoomedPart.desc}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#38bdf8] text-xs font-bold">حالة التوفر:</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">متوفر فوري بالورش والمنزل ✓</span>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400 text-xs">سعر التجزئة:</span>
                    <span className="text-brand-orange font-black text-2xl">{activeZoomedPart.price} ج.م</span>
                  </div>

                  {/* Operational add controls directly on magnification modal */}
                  <div className="pt-2">
                    {cart.some(curr => curr.id === activeZoomedPart.id) ? (
                      <div className="flex items-center justify-between bg-[#1b1b1f] p-1.5 border border-white/10 md:text-sm">
                        <button 
                          onClick={() => updateCartQty(activeZoomedPart.id, -1)}
                          className="w-10 h-10 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black text-white text-xs">
                          {cart.find(curr => curr.id === activeZoomedPart.id)?.qty || 0} قطع مضافة للسلة
                        </span>
                        <button 
                          onClick={() => updateCartQty(activeZoomedPart.id, 1)}
                          className="w-10 h-10 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          updateCartQty(activeZoomedPart.id, 1);
                        }}
                        className="w-full py-3 px-5 rounded-none bg-brand-orange text-black font-black text-xs hover:bg-brand-orange-dark transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة لطلب الشراء الآن</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRIVACY-COMPLIANT ARABIC ADMIN PANEL TOGGLE (CLEARLY VISIBLE & BRANDED) */}
      <div className="border-t border-white/5 bg-[#0a0a14] py-8 text-center">
        <button 
          onClick={() => {
            if (isAdminAuthenticated) {
              setIsAdminAuthenticated(false);
              triggerToast("تم تسجيل الخروج بنجاح كمسؤول");
            } else {
              setIsAdminLoginVisible(true);
            }
          }}
          className="text-xs text-slate-400 hover:text-brand-orange font-black py-2.5 px-5 border border-white/10 bg-[#111114] hover:bg-[#1b1b1f] hover:border-brand-orange/40 rounded-none transition-all cursor-pointer inline-flex items-center gap-2 select-none"
        >
          {isAdminAuthenticated ? (
            <>
              <span>🔒 تسجيل الخروج من لوحة الإدارة</span>
            </>
          ) : (
            <>
              <span>🔐 فتح بوابة دخول المدير والتحكم بالجرد</span>
            </>
          )}
        </button>
      </div>

      {/* SECURE ADMIN LOGIN MODAL OVERLAY PORTAL */}
      <AnimatePresence>
        {isAdminLoginVisible && !isAdminAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminLoginVisible(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-[#111114] border border-white/15 w-full max-w-md relative z-10 p-8 shadow-2xl overflow-hidden rounded-none text-right"
              dir="rtl"
            >
              <button 
                onClick={() => setIsAdminLoginVisible(false)}
                className="absolute top-4 left-4 z-20 w-8 h-8 rounded-none bg-black/85 border border-white/10 text-white flex items-center justify-center hover:bg-brand-orange hover:text-black hover:border-transparent transition-all cursor-pointer text-xs font-bold"
              >
                ✕
              </button>

              <div className="text-center space-y-3 mb-6">
                <div className="w-14 h-14 bg-brand-orange/10 border border-brand-orange/20 mx-auto flex items-center justify-center text-2xl font-bold">
                  🔐
                </div>
                <h3 className="text-white font-black text-lg">بوابة دخول الإدارة والتحكم</h3>
                <p className="text-slate-400 text-xs leading-relaxed">أدخل الرقم السري المعتمد للورشة لتعديل جرد الأسعار والمبيعات المتوفرة فوراً وإدارة مسار التواصل المباشر.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold block">رقم المرور الخاص بالورشة</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                    className="w-full py-3 px-4 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange text-center tracking-widest font-bold font-mono"
                    autoFocus
                  />
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    if (adminPassword === ADMIN_PASS) {
                      setIsAdminAuthenticated(true);
                      setAdminError("");
                      setIsAdminLoginVisible(false);
                      setActiveTab("admin");
                      triggerToast("تم تسجيل الدخول بنجاح كمسؤول");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      setAdminError("كلمة المرور غير صحيحة، حاول مجدداً");
                    }
                  }}
                  className="w-full py-3 px-4 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black text-xs font-black transition-all cursor-pointer shadow-md"
                >
                  تأكيد الولوج وفتح التحكم ✓
                </button>
              </div>

              {adminError && (
                <p className="text-red-400 text-xs text-center font-bold bg-red-500/5 py-2 mt-4 border border-red-500/10 animate-shake">
                  ⚠️ {adminError}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ADMIN FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {adminToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-orange text-white py-3 px-6 rounded-xl border border-brand-orange-dark shadow-2xl text-xs font-bold tracking-tight z-50 flex items-center gap-2"
          >
            <span>✓</span>
            <span>{adminToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
