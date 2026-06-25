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
  ArrowLeftRight,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Part, CartItem, MaintenanceData, TradeInData, PartCategory, Technician, CustomerRecord, CoverageArea, Appliance } from "./types";

// Default configuration & static data
const DEFAULT_WA = "201117735952";
const ADMIN_PASS = "1234";

// Function to get active cities based on coverage areas
const getCitiesForGov = (govName: string, currentCovAreas: CoverageArea[]) => {
  const activeInCov = currentCovAreas
    .filter(area => area.gov === govName && area.active)
    .map(area => area.name.trim());

  return activeInCov;
};

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
  "بوتجاز": [
    "يونيفرسال",
    "كريازي",
    "فريش",
    "زانوسي",
    "يونيون إير",
    "لا جيرمانيا",
    "جليم غاز",
    "وايت بوينت",
    "توشيبا",
    "تورنيدو",
    "شارب",
    "تيكا",
    "وايت ويل",
    "بوش",
    "أريستون",
    "كونكورد",
    "أمريكانا",
    "آرديم",
    "هاير",
    "أخرى"
  ],
  "سخان غاز": [
    "يونيفرسال",
    "كريازي",
    "فريش",
    "أوليمبك هيروز",
    "تورنيدو",
    "جوناي",
    "إيتال",
    "زانوسي",
    "تيرما",
    "هاميلتون",
    "كليما",
    "توشيبا",
    "أريستون",
    "بوش",
    "مصانع حربية 360",
    "أخرى"
  ]
};

const PROBLEMS_DATA = {
  "بوتجاز": ["اشتعال الشعلات", "خلل في الفرن", "تسريب غاز", "مؤقت لا يعمل", "صدأ / تلف هيكل", "أخرى"],
  "سخان غاز": ["لا يشتعل", "ضعف اللهب", "تسريب ماء", "تسريب غاز", "صوت غير طبيعي", "أخرى"]
};

const egyptData: { [key: string]: string[] } = {
  "الجيزة": [
    "الحوامدية",
    "البدرشين",
    "منيل شيحة",
    "أم خنان",
    "منى الأمير",
    "أبو صير",
    "سقارة",
    "المريوطية",
    "أبو النمرس",
    "طموة"
  ],
  "القاهرة": [
    "المعادي",
    "حلوان",
    "مصر الجديدة",
    "مدينة نصر",
    "وسط البلد",
    "شبرا",
    "التجمع الخامس",
    "المرج",
    "عين شمس"
  ],
  "القليوبية": [
    "بنها",
    "شبرا الخيمة",
    "قليوب",
    "الخانكة",
    "طوخ"
  ],
  "الإسكندرية": [
    "سموحة",
    "ميامي",
    "المنتزة",
    "العجمي",
    "سيدي بشر",
    "وسط البلد"
  ]
};

const DEFAULT_COV_AREAS: CoverageArea[] = [];
Object.entries(egyptData).forEach(([gov, cities]) => {
  cities.forEach(city => {
    const isGizaTarget = gov === "الجيزة" && [
      "الحوامدية",
      "البدرشين",
      "منيل شيحة",
      "أم خنان",
      "منى الأمير",
      "أبو صير",
      "سقارة",
      "المريوطية"
    ].includes(city);
    
    DEFAULT_COV_AREAS.push({
      name: city,
      active: isGizaTarget,
      gov: gov
    });
  });
});


const formatEgyptPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (!clean) return "";
  if (clean.startsWith("20") && clean.length >= 11) {
    return clean;
  }
  if (clean.startsWith("0")) {
    clean = clean.substring(1);
  }
  return "20" + clean;
};

const DEFAULT_TECHNICIANS: Technician[] = [
  { id: 1, name: "م. أحمد عبد العزيز", phone: "201117735952", city: "الحوامدية", cities: ["الحوامدية", "أم خنان", "سقارة"], specialties: ["بوتجاز", "سخان غاز"] },
  { id: 2, name: "م. محمود فاروق", phone: "201012345678", city: "البدرشين", cities: ["البدرشين", "أبو صير", "منى الأمير"], specialties: ["بوتجاز"] },
  { id: 3, name: "م. مصطفى الجيزاوي", phone: "201211112222", city: "منيل شيحة", cities: ["منيل شيحة", "المريوطية"], specialties: ["سخان غاز"] },
  { id: 4, name: "م. كريم علام", phone: "201055556666", city: "أم خنان", cities: ["أم خنان", "الحوامدية"], specialties: ["بوتجاز", "سخان غاز"] },
  { id: 5, name: "م. سامي الأمير", phone: "201299990000", city: "منى الأمير", cities: ["منى الأمير", "البدرشين"], specialties: ["سخان غاز"] },
  { id: 6, name: "م. سعيد البصير", phone: "201144445555", city: "أبو صير", cities: ["أبو صير", "سقارة"], specialties: ["بوتجاز"] },
  { id: 7, name: "م. هاني السقاري", phone: "201177778888", city: "سقارة", cities: ["سقارة", "المريوطية"], specialties: ["بوتجاز", "سخان غاز"] },
  { id: 8, name: "م. شريف المريوطي", phone: "201522223333", city: "المريوطية", cities: ["المريوطية", "منيل شيحة"], specialties: ["سخان غاز", "بوتجاز"] }
];

const DEFAULT_CUSTOMERS: CustomerRecord[] = [
  { id: "cust-1", name: "محمود سيد الشامي", phone: "201555566611", city: "مدينة الحوامدية", address: "شارع الجمهورية - أمام مسجد التوحيد", serviceType: "طلب صيانة", details: "صيانة بوتجاز - الماركة: كريازي - المشكلة: انسداد الشعلات الثلاثة", timestamp: "30/05/2026, 09:30:15 ص" },
  { id: "cust-2", name: "علاء حسني البدرشيني", phone: "201012344321", city: "البدرشين", address: "بجوار محطة القطار - برج الهدى ص1", serviceType: "شراء قطع غيار", details: "ترموستات سخان غاز (عدد 1)، صمام أمان سخان غاز (عدد 1)", timestamp: "29/05/2026, 04:15:33 م" },
  { id: "cust-3", name: "فاطمة أحمد منيل شيحة", phone: "201271112223", city: "منيل شيحة", address: "شارع البحر الأعظم - خلف صيدلية السلام", serviceType: "تجديد", details: "تجديد سخان غاز - ماركة: جوناي (عمر: 4 سنوات - حالة: متهالك وجيد)", timestamp: "28/05/2026, 11:22:10 ص" },
  { id: "cust-4", name: "شريف عبد العزيز طموة", phone: "201149998887", city: "طموة", address: "طريق مصر-أسيوط الزراعي - مدخل طموة", serviceType: "طلب صيانة", details: "صيانة سخان غاز - الماركة: فريش - المشكلة: تسريب غاز وضعف اللهب", timestamp: "27/05/2026, 08:44:00 ص" },
];

const DEFAULT_APPLIANCES: Appliance[] = [
  {
    id: 1,
    deviceType: "ثلاجة",
    brand: "توشيبا 3 باب نوفروست",
    condition: "ممتازة كالجديدة",
    usageDuration: "سنة واحدة",
    price: 12500,
    imageUrl: "https://images.unsplash.com/photo-1571887455899-41d2ded28a64?auto=format&fit=crop&q=80&w=600",
    details: "ثلاجة توشيبا بحالة متميزة جداً، تبريد هائل، لا يوجد بها أي خدوش، مع ضمان متبقي 4 سنوات."
  },
  {
    id: 2,
    deviceType: "بوتاجاز",
    brand: "يونيفرسال 5 شعلة استانلس",
    condition: "جيدة جداً",
    usageDuration: "سنتين",
    price: 4800,
    imageUrl: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=600",
    details: "بوتاجاز يونيفرسال 5 شعلة، عيون نحاسية شعلة قوية، شواية دوارة تعمل بكفاءة تامة."
  },
  {
    id: 3,
    deviceType: "سخان",
    brand: "أوليمبيك غاز ديجيتال 10 لتر",
    condition: "ممتازة",
    usageDuration: "6 أشهر",
    price: 2900,
    imageUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600",
    details: "سخان غاز طبيعي ديجيتال أوليمبيك، يعمل مع أقل ضغط مياه، موفر للغاز ومزود بعوامل أمان كاملة."
  }
];

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"home" | "maintenance" | "parts" | "tradein" | "appliances" | "admin" >("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderRef, setSuccessOrderRef] = useState("#00000");
  const [assignedTech, setAssignedTech] = useState<Technician | null>(null);

  // Branded Appliance States
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const saved = localStorage.getItem("tf_appliances");
      return saved ? JSON.parse(saved) : DEFAULT_APPLIANCES;
    } catch {
      return DEFAULT_APPLIANCES;
    }
  });

  const saveAppliancesToStorage = (updated: Appliance[]) => {
    setAppliances(updated);
    try {
      localStorage.setItem("tf_appliances", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Add new appliance states
  const [newAppType, setNewAppType] = useState("بوتاجاز");
  const [newAppBrand, setNewAppBrand] = useState("");
  const [newAppCondition, setNewAppCondition] = useState("");
  const [newAppUsage, setNewAppUsage] = useState("");
  const [newAppPrice, setNewAppPrice] = useState<number | "">("");
  const [newAppImage, setNewAppImage] = useState("");
  const [newAppDetails, setNewAppDetails] = useState("");

  // Customer appliance purchase modal state
  const [selectedApplianceForOrder, setSelectedApplianceForOrder] = useState<Appliance | null>(null);
  const [orderClientName, setOrderClientName] = useState("");
  const [orderClientPhone, setOrderClientPhone] = useState("");
  const [orderClientAddress, setOrderClientAddress] = useState("");
  const [orderClientGov, setOrderClientGov] = useState("الجيزة");
  const [orderClientCity, setOrderClientCity] = useState("");

  // Cascading location states
  const [mFormGov, setMFormGov] = useState("الجيزة");
  const [tiFormGov, setTiFormGov] = useState("الجيزة");
  const [checkGov, setCheckGov] = useState("الجيزة");
  const [newTechGov, setNewTechGov] = useState("الجيزة");

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

  // Admin sub-tab & Technician/Customer states
  const [adminSubTab, setAdminSubTab] = useState<"inventory" | "appliances_sale" | "customers" | "technicians" | "areas">("inventory");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    message: string;
  } | null>(null);

  const alert = (msg: string) => {
    setCustomAlert({
      show: true,
      message: msg
    });
  };

  const [covAreas, setCovAreas] = useState<CoverageArea[]>(() => {
    try {
      const dbVersion = localStorage.getItem("tf_db_version");
      const saved = localStorage.getItem("tf_cov_areas");
      
      if (dbVersion === "3.0" && saved) {
        const parsed: any[] = JSON.parse(saved);
        
        // Build a Map of existing items by name for fast lookup
        const savedMap = new Map<string, any>();
        parsed.forEach(item => {
          if (item && item.name) {
            savedMap.set(item.name.trim(), item);
          }
        });

        // Merge DEFAULT_COV_AREAS with saved overrides
        const merged: CoverageArea[] = DEFAULT_COV_AREAS.map(def => {
          const savedItem = savedMap.get(def.name.trim());
          if (savedItem) {
            return {
              ...def,
              active: savedItem.active !== undefined ? savedItem.active : def.active,
              gov: savedItem.gov || def.gov
            };
          }
          return def;
        });

        // Add any completely custom user-added areas that are not in DEFAULT_COV_AREAS
        const defaultNamesSet = new Set(DEFAULT_COV_AREAS.map(d => d.name.trim()));
        parsed.forEach(item => {
          if (item && item.name && !defaultNamesSet.has(item.name.trim())) {
            merged.push({
              name: item.name.trim(),
              active: item.active !== undefined ? item.active : true,
              gov: item.gov || "الجيزة"
            });
          }
        });

        return merged;
      }
      
      const activeTargetCities = ["الحوامدية", "البدرشين", "منيل شيحة", "أم خنان", "منى الأمير", "أبو صير", "سقارة", "المريوطية", "طموة"];
      const updatedAreas = DEFAULT_COV_AREAS.map(area => {
        if (activeTargetCities.includes(area.name.trim())) {
          return { ...area, active: true };
        }
        return area;
      });
      
      localStorage.setItem("tf_cov_areas", JSON.stringify(updatedAreas));
      return updatedAreas;
    } catch {
      return DEFAULT_COV_AREAS;
    }
  });

  const saveCovAreasToStorage = (updated: CoverageArea[]) => {
    setCovAreas(updated);
    try {
      localStorage.setItem("tf_cov_areas", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const activeAreas = useMemo(() => covAreas.filter(a => a.active).map(a => a.name), [covAreas]);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaGov, setNewAreaGov] = useState("الجيزة");

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const dbVersion = localStorage.getItem("tf_db_version");
      const saved = localStorage.getItem("tf_technicians");
      
      if (dbVersion === "3.0" && saved) {
        return JSON.parse(saved);
      }
      
      let existing: any[] = [];
      if (saved) {
        try {
          existing = JSON.parse(saved);
        } catch {
          existing = [];
        }
      }
      
      const customTechs = existing.filter(tech => {
        if (!tech) return false;
        const id = Number(tech.id);
        // Retain user custom added technicians (usually ID >= 100 or non-default IDs)
        const defaultIds = new Set(DEFAULT_TECHNICIANS.map(t => t.id));
        return !defaultIds.has(id);
      }).map(tech => {
        // Upgrade format to include cities array and specialties if missing
        const city = tech.city || "";
        const cities = Array.isArray(tech.cities) ? tech.cities : (city ? [city] : []);
        const specialties = Array.isArray(tech.specialties) ? tech.specialties : ["بوتجاز", "سخان غاز"];
        return {
          ...tech,
          city: cities[0] || city,
          cities,
          specialties,
          phone: formatEgyptPhone(tech.phone || "")
        };
      });
      
      const mergedTechs = [
        ...DEFAULT_TECHNICIANS.map(t => ({
          ...t,
          phone: formatEgyptPhone(t.phone)
        })),
        ...customTechs
      ];
      
      localStorage.setItem("tf_technicians", JSON.stringify(mergedTechs));
      localStorage.setItem("tf_db_version", "3.0");
      return mergedTechs;
    } catch {
      return DEFAULT_TECHNICIANS;
    }
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const saved = localStorage.getItem("tf_customers");
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  });

  const [newTechName, setNewTechName] = useState("");
  const [newTechPhone, setNewTechPhone] = useState("");
  const [newTechCity, setNewTechCity] = useState("الحوامدية");
  const [newTechSpecs, setNewTechSpecs] = useState<string[]>(["بوتجاز", "سخان غاز"]);
  const [newTechSelectedCities, setNewTechSelectedCities] = useState<string[]>(["الحوامدية"]);
  
  const [editingTechId, setEditingTechId] = useState<number | null>(null);
  const [areasTabEditingTechId, setAreasTabEditingTechId] = useState<number | null>(null);
  const [editTechName, setEditTechName] = useState("");
  const [editTechPhone, setEditTechPhone] = useState("");
  const [editTechSpecs, setEditTechSpecs] = useState<string[]>([]);
  const [editTechCities, setEditTechCities] = useState<string[]>([]);

  const [selectedCusts, setSelectedCusts] = useState<string[]>([]);
  const [bulkMessageText, setBulkMessageText] = useState("شريكنا الكريم من تك فيكس 🛠️، نود التذكير بأهمية جدولة الصيانة الوقائية السنوية للبوتجاز والسخان لضمان أقصى حماية وكفاءة لسلامة عائلتكم. حرك الطلب الآن بخصم 15%!");
  const [singleOffers, setSingleOffers] = useState<{[key: string]: string}>({});

  const saveTechniciansToStorage = (updated: Technician[]) => {
    setTechnicians(updated);
    try {
      localStorage.setItem("tf_technicians", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCustomersToStorage = (updated: CustomerRecord[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem("tf_customers", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCustomerRecord = (record: Omit<CustomerRecord, "id">) => {
    const newRecord: CustomerRecord = {
      ...record,
      phone: formatEgyptPhone(record.phone),
      id: "cust-" + Date.now() + "-" + Math.floor(Math.random() * 1000)
    };
    setCustomers(prev => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem("tf_customers", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Log of custom automated routing requests (customRequestsLog)
  const [customRequestsLog, setCustomRequestsLog] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("tf_customRequestsLog");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCustomRequestsLog = (updatedLog: any[]) => {
    setCustomRequestsLog(updatedLog);
    try {
      localStorage.setItem("tf_customRequestsLog", JSON.stringify(updatedLog));
    } catch (e) {
      console.error(e);
    }
  };

  // Normalize Arabic letters for robust matching of cities and specialties
  const normalizeArabic = (str: string): string => {
    if (!str) return "";
    return str
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/بوتاجاز/g, "بوتجاز")
      .replace(/\s+/g, " ");
  };

  // Robust fuzzy matching for cities
  const isCityMatch = (cityA: string, cityB: string): boolean => {
    const normA = normalizeArabic(cityA);
    const normB = normalizeArabic(cityB);
    if (!normA || !normB) return false;
    
    // 1. Exact match after normalization
    if (normA === normB) return true;
    
    // 2. Substring match
    if (normA.includes(normB) || normB.includes(normA)) return true;
    
    // 3. Word-based matching (excluding common prefixes/stopwords)
    const stopwords = ["مركز", "قريه", "مدينه", "منطقه", "ناحيه", "ال"];
    const wordsA = normA.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));
    const wordsB = normB.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));
    
    if (wordsA.length > 0 && wordsB.length > 0) {
      return wordsA.some(wA => wordsB.some(wB => wA === wB || wA.includes(wB) || wB.includes(wA)));
    }
    
    // 4. Strip "ال" prefix and check match
    const stripEl = (s: string) => s.startsWith("ال") ? s.substring(2) : s;
    if (stripEl(normA) === stripEl(normB)) return true;
    
    return false;
  };

  // Initialize and seed default technicians and active areas
  const seedInitialData = (force = false) => {
    const currentSavedTechs = localStorage.getItem("tf_technicians");
    const parsedTechs = currentSavedTechs ? JSON.parse(currentSavedTechs) : [];
    
    if (force || parsedTechs.length === 0) {
      // Apply default techs
      const formattedTechs = DEFAULT_TECHNICIANS.map(t => ({
        ...t,
        phone: formatEgyptPhone(t.phone)
      }));
      setTechnicians(formattedTechs);
      localStorage.setItem("tf_technicians", JSON.stringify(formattedTechs));
    }

    // Activate default areas in Giza (الحوامدية، البدرشين، منيل شيحة، أم خنان، إلخ)
    const activeTargetCities = ["الحوامدية", "البدرشين", "منيل شيحة", "أم خنان", "منى الأمير", "أبو صير", "سقارة", "المريوطية", "طموة"];
    const currentSavedAreas = localStorage.getItem("tf_cov_areas");
    let areasList = currentSavedAreas ? JSON.parse(currentSavedAreas) : [...DEFAULT_COV_AREAS];
    
    if (areasList.length === 0) {
      areasList = [...DEFAULT_COV_AREAS];
    }

    const updatedAreas = areasList.map((area: any) => {
      if (activeTargetCities.includes(area.name.trim())) {
        return { ...area, active: true };
      }
      return area;
    });

    setCovAreas(updatedAreas);
    localStorage.setItem("tf_cov_areas", JSON.stringify(updatedAreas));
    localStorage.setItem("tf_db_version", "3.0");
  };

  // Auto load/seed on mount (equivalent to window.onload logic)
  useEffect(() => {
    const dbVersion = localStorage.getItem("tf_db_version");
    if (dbVersion !== "3.0") {
      seedInitialData(true);
    } else {
      const isTechsEmpty = !localStorage.getItem("tf_technicians") || JSON.parse(localStorage.getItem("tf_technicians") || "[]").length === 0;
      const isAreasEmpty = !localStorage.getItem("tf_cov_areas") || JSON.parse(localStorage.getItem("tf_cov_areas") || "[]").length === 0;
      
      if (isTechsEmpty || isAreasEmpty) {
        seedInitialData(false);
      }
    }
  }, []);

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

  // Automatically select the first active coverage area initially for all forms
  useEffect(() => {
    const activeList = covAreas.filter(a => a.active);
    if (activeList.length > 0) {
      if (!mForm.city) {
        setMForm(f => ({ ...f, city: activeList[0].name }));
      }
      if (!tiForm.city) {
        setTiForm(f => ({ ...f, city: activeList[0].name }));
      }
      if (!checkCity) {
        setCheckCity(activeList[0].name);
      }
      if (!orderClientCity) {
        setOrderClientCity(activeList[0].name);
      }
    }
  }, [covAreas]);

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
    if (!checkName || !checkPhone || !checkAddr) {
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
📍 *المنطقة/المدينة:* ${checkCity || "لم يتم تحديدها"}
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
      client_gov: checkGov,
      client_city: checkCity,
      client_address: checkAddr,
      items: cart.map(i => `${i.name} (عدد ${i.qty})`).join(" , "),
      total: `${formattedPrice} ج.م`,
      timestamp: formattedNow()
    };

    // Unified General Manager routing
    const targetPhone = "201117735952";
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(orderMsg)}`;

    fetch("https://formspree.io/f/xvgowoen", { 
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
    .finally(() => {
      // Regardless of Formspree outcome, open WhatsApp and show confirmation
      window.open(waUrl, "_blank", "noreferrer");
      setSuccessOrderRef(ref);
      setIsSuccessModalOpen(true);

      // Save client transaction record to customers database
      saveCustomerRecord({
        name: checkName,
        phone: checkPhone,
        gov: checkGov,
        city: checkCity,
        address: checkAddr,
        serviceType: "شراء قطع غيار",
        details: cart.map(i => `${i.name} (${i.qty} قطع)`).join("، "),
        timestamp: formattedNow()
      });

      setCart([]);
      setIsCartOpen(false);
      setIsCheckingOut(false);
    });
  };

  // Maintenance wizard step validation helper
  const isMStepValid = () => {
    if (mStep === 0) return !!mForm.deviceType;
    if (mStep === 1) return !!mForm.serviceType;
    if (mStep === 2) return !!(mForm.brand && (mForm.problem || mForm.customProblem));
    if (mStep === 3) return !!(mForm.name && mForm.phone && mForm.address);
    return false;
  };

  const handleMaintenanceSubmit = () => {
    const formattedProblem = mForm.problem || mForm.customProblem;
    const clientCity = (mForm.city || "").trim();
    const clientDevice = (mForm.deviceType || "").trim(); // "بوتجاز" or "سخان غاز"
    
    const normalizedClientCity = normalizeArabic(clientCity);
    const normalizedClientDevice = normalizeArabic(clientDevice);

    // Find matching technician based on normalized multi-city and specialty coverage
    const matchedTech = technicians.find(tech => {
      // 1. Geography match:
      let coversGeographically = false;
      const cities = Array.isArray(tech.cities) ? tech.cities : (tech.city ? [tech.city] : []);
      if (cities.length > 0) {
        coversGeographically = cities.some(c => isCityMatch(c, clientCity));
      }

      // 2. Specialty match:
      let coversSpecialty = false;
      const specialties = Array.isArray(tech.specialties) ? tech.specialties : [];
      if (specialties.length === 0) {
        coversSpecialty = true; // covers everything if empty
      } else {
        coversSpecialty = specialties.some(s => {
          const normS = normalizeArabic(s);
          if (normS === normalizedClientDevice) return true;
          if (normS.includes(normalizedClientDevice) || normalizedClientDevice.includes(normS)) return true;
          // Special handlers for "سخان" vs "سخان غاز" & "بوتاجاز" vs "بوتجاز"
          if (normS.includes("سخان") && normalizedClientDevice.includes("سخان")) return true;
          if (normS.includes("بوتجاز") && normalizedClientDevice.includes("بوتجاز")) return true;
          if (normS.includes("بوتاجاز") && normalizedClientDevice.includes("بوتجاز")) return true;
          return false;
        });
      }

      return coversGeographically && coversSpecialty;
    });

    setAssignedTech(matchedTech || null);

    // If no technician found, use backup number 201117735952 as main coordinator
    const fallbackPhone = "201117735952";
    const assignedPhone = matchedTech ? formatEgyptPhone(matchedTech.phone) : formatEgyptPhone(waNumber || fallbackPhone);
    const techName = matchedTech ? matchedTech.name : "الإدارة العامة ومندوب التنسيق";

    const maintenanceMsg = `🛠️ *طلب صيانة جديدة - تك فيكس كود الأوردر* 🛠️
━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${mForm.name}
📞 *الهاتف:* ${mForm.phone}
📍 *المنطقة/المدينة:* ${mForm.city || "لم يتم تحديدها"} [${mFormGov}]
🏠 *العنوان:* ${mForm.address}
━━━━━━━━━━━━━━━━━━
⚙️ *نوع الجهاز:* ${mForm.deviceType}
🏷️ *الماركة:* ${mForm.brand}
💼 *نوع الخدمة:* ${mForm.serviceType}
📝 *المشكلة للتصليح:* ${formattedProblem}
━━━━━━━━━━━━━━━━━━
👨‍🔧 *الفني المخصص:* ${techName}
📞 *رقم هاتف الفني:* ${matchedTech ? matchedTech.phone : "تحت المتابعة والتوزيع الإداري العام [201117735952]"}
━━━━━━━━━━━━━━━━━━
⏰ *وقت الإرسال:* ${formattedNow()}`;

    // WhatsApp Direct Link with fully formatted message
    const waUrl = `https://wa.me/${assignedPhone}?text=${encodeURIComponent(maintenanceMsg)}`;
    
    // Attempt to open in new window
    const newWindow = window.open(waUrl, "_blank", "noreferrer");
    
    // Fallback if popup blocked
    if (!newWindow) {
      console.warn("WhatsApp popup blocked, falling back to window.location");
      window.location.href = waUrl;
    }

    // Save record to customRequestsLog in LocalStorage
    const newRequestLog = {
      id: "req-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      customerName: mForm.name,
      phone: formatEgyptPhone(mForm.phone),
      city: mForm.city,
      address: mForm.address,
      deviceType: mForm.deviceType,
      brand: mForm.brand,
      problem: formattedProblem,
      techName: techName,
      techPhone: matchedTech ? matchedTech.phone : "201117735952",
      timestamp: formattedNow()
    };
    
    const updatedLog = [newRequestLog, ...customRequestsLog];
    saveCustomRequestsLog(updatedLog);

    // Save record to persistent customer database (CRM system) so it shows in admin instantly
    saveCustomerRecord({
      name: mForm.name,
      phone: mForm.phone,
      gov: mFormGov,
      city: mForm.city,
      address: mForm.address,
      serviceType: "طلب صيانة",
      details: `${mForm.serviceType} لجهاز ${mForm.deviceType} (${mForm.brand}) - المشكلة: ${formattedProblem} [الفني المخصص: ${techName}]`,
      timestamp: formattedNow()
    });

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
📍 *المنطقة/المدينة:* ${tiForm.city || "لم يتم تحديدها"}
━━━━━━━━━━━━━━━━━━
📦 *الجهاز:* ${tiForm.deviceType}
🏷️ *الماركة:* ${tiForm.brand}
📅 *العمر التقريبي:* ${tiForm.age}
📊 *الحالة العامة:* ${tiForm.condition}
📝 *ملاحظات إضافية:* ${tiForm.notes || "لا يوجد"}
━━━━━━━━━━━━━━━━━━
⏰ *وقت الإرسال:* ${formattedNow()}
💡 *ملاحظة:* يرجى تزويدنا بصور للجهاز بمجرد إرسال الرسالة لتقييم أفضل.`;

    // Unified General Manager routing
    const targetPhone = "201117735952";
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(tradeMsg)}`;
    
    // Attempt to open in new window
    const newWindow = window.open(waUrl, "_blank", "noreferrer");
    
    // Fallback if popup blocked
    if (!newWindow) {
      console.warn("WhatsApp popup blocked, falling back to window.location");
      window.location.href = waUrl;
    }

    // Save client record to customer database
    saveCustomerRecord({
      name: tiForm.name,
      phone: tiForm.phone,
      gov: tiFormGov,
      city: tiForm.city,
      address: "مرفقة بالملاحظات",
      serviceType: isSell ? "بيع وتجديد أجهزة" : "تجديد",
      details: `${isSell ? "بيع" : "تجديد"} ${tiForm.deviceType} - ماركة: ${tiForm.brand} (عمر: ${tiForm.age} - حالة: ${tiForm.condition})`,
      timestamp: formattedNow()
    });

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
    const partToDelete = parts.find(p => p.id === id);
    const partName = partToDelete ? partToDelete.name : "هذه القطعة";
    setCustomConfirm({
      show: true,
      title: "حذف قطعة غيار",
      message: `هل أنت متأكد من رغبتك بحذف قطعة الغيار (${partName}) نهائياً من القائمة والمخزن؟`,
      onConfirm: () => {
        const updated = parts.filter(p => p.id !== id);
        savePartsToStorage(updated);
        setCart(curr => curr.filter(item => item.id !== id));
        triggerToast("تم حذف قطعة الغيار بنجاح 🗑️");
        setCustomConfirm(null);
      }
    });
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
              onClick={() => setActiveTab("appliances")}
              className={`px-4 py-2.5 text-sm font-black tracking-wider uppercase transition-all flex items-center gap-1 ${
                activeTab === "appliances" 
                  ? "text-brand-orange border-b-2 border-brand-orange" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>الأجهزة المتاحة للبيع</span>
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
            onClick={() => setActiveTab("appliances")}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${activeTab === "appliances" ? "text-brand-orange" : "text-slate-400"}`}
          >
            <span>🛍️</span>
            <span>شراء أجهزة</span>
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
                  {covAreas.map((area, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-[#1b1b1f] px-4 py-3 border flex items-center justify-between hover:border-brand-orange/30 transition-all group pointer-events-none ${
                        area.active ? "border-white/5 opacity-100" : "border-red-500/10 opacity-60"
                      }`}
                    >
                      <span className={`text-sm font-black group-hover:text-white ${
                        area.active ? "text-slate-200" : "text-slate-500 line-through"
                      }`}>{area.name}</span>
                      {area.active ? (
                        <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/5 px-1.5 py-0.5 border border-emerald-500/10 font-bold">ONLINE</span>
                      ) : (
                        <span className="text-red-400 font-mono text-[10px] bg-red-500/5 px-1.5 py-0.5 border border-red-500/10 font-bold">PAUSED</span>
                      )}
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
                    {(() => {
                      const deviceTypeKey = (mForm.deviceType === "سخان غاز" || mForm.deviceType === "سخان") ? "سخان غاز" : "بوتجاز";
                      const availableBrands = BRANDS_DATA[deviceTypeKey] || [];
                      const isPredefined = availableBrands.includes(mForm.brand);
                      return (
                        <div className="space-y-3 font-sans">
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">ماركة المصنع للجهاز <span className="text-brand-orange">*</span></label>
                            <select 
                              value={isPredefined ? mForm.brand : (mForm.brand ? "أخرى" : "")}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "أخرى") {
                                  setMForm(f => ({ ...f, brand: "" }));
                                } else {
                                  setMForm(f => ({ ...f, brand: val }));
                                }
                              }}
                              className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange font-bold text-right"
                            >
                              <option value="" disabled>-- اختر ماركة جهازك من القائمة --</option>
                              {availableBrands.map((br, bIdx) => (
                                <option key={bIdx} value={br}>{br}</option>
                              ))}
                            </select>
                          </div>

                          {(!mForm.brand || !isPredefined) && (
                            <div className="space-y-1.5 animate-fadeIn">
                              <label className="text-xs text-[#f97316] font-bold block">يرجى كتابة ماركة المصنع يدوياً <span className="text-brand-orange">*</span></label>
                              <input 
                                type="text" 
                                placeholder="مثال: يونيفرسال، كريازي، فريش، زانوسي... *"
                                value={mForm.brand}
                                onChange={(e) => setMForm(f => ({ ...f, brand: e.target.value }))}
                                className="w-full p-3 rounded-none bg-[#141417] border border-brand-orange/70 text-white text-sm outline-none focus:border-brand-orange font-bold placeholder-slate-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Common Problem chip selections */}
                    <div className="space-y-2">
                       <label className="text-xs text-slate-400 font-bold block">العرض أو المشكلة الرئيسية <span className="text-brand-orange">*</span></label>
                       <input 
                        type="text"
                        placeholder="اكتب العرض أو المشكلة *"
                        value={mForm.problem}
                        onChange={(e) => setMForm(f => ({ ...f, problem: e.target.value }))}
                        className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange"
                      />
                    </div>

                    {/* Custom text problem description */}
                    <div className="space-y-1.5 pt-2">
                       <label className="text-xs text-slate-400 font-bold block">أو اكتب وصفاً وملاحظات مخصصة تود إطلاع الفني عليها</label>
                      <textarea 
                        value={mForm.customProblem}
                        onChange={(e) => setMForm(f => ({ ...f, customProblem: e.target.value }))}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs text-slate-400 font-bold block font-sans">المنطقة السكنية / المدينة <span className="text-brand-orange">*</span></label>
                        <select 
                          value={mForm.city}
                          onChange={(e) => setMForm(f => ({ ...f, city: e.target.value }))}
                          className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange font-bold font-sans"
                        >
                          <option value="" disabled>اختر منطقتك السكنية</option>
                          {covAreas.filter(a => a.active).map((area, idx) => (
                            <option key={idx} value={area.name}>{area.name}</option>
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
                  <div className="text-center py-8 space-y-6 animate-fadeIn font-sans text-right" dir="rtl">
                    <div className="w-16 h-16 rounded-none bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500 text-3xl font-black">
                      ✓
                    </div>
                    <div className="space-y-2 text-center">
                      <h4 className="text-emerald-400 text-2xl font-black">وصلنا طلب الصيانة الفورية!</h4>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto text-center">
                        تم تجميع طلبك وتحليله جغرافياً وفنياً وتوجيهه بنجاح إلى الفني المتخصص المسؤول عن تغطية منطقتك وجهازك.
                      </p>
                    </div>

                    {/* Assigned Technician Card */}
                    <div className="bg-[#111114] p-5 rounded-none border border-white/10 max-w-md mx-auto space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          الفني المعين لتنفيذ الأوردر:
                        </span>
                        <span className="text-[10px] bg-brand-orange/10 text-brand-orange border border-brand-orange/25 font-bold px-2 py-0.5">
                          توجيه تلقائي ذكي ⚡
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-[#0c0c0e] border border-white/10 flex items-center justify-center text-xl font-bold text-slate-300">
                          👨‍🔧
                        </div>
                        <div className="space-y-0.5 text-right">
                          <h5 className="text-white font-black text-sm">{assignedTech ? assignedTech.name : "الإدارة العامة ومندوب التنسيق"}</h5>
                          <p className="text-slate-400 text-[10px] font-bold">
                            {assignedTech 
                              ? `التخصص: صيانة ${Array.isArray(assignedTech.specialties) ? assignedTech.specialties.join(" و ") : "الأجهزة"}` 
                              : "إدارة تشغيل وتوجيه الصيانة المركزية"}
                          </p>
                          <p className="text-slate-500 text-[10px] font-bold">
                            تغطية جغرافية نشطة: {assignedTech 
                              ? (Array.isArray(assignedTech.cities) ? assignedTech.cities.join("، ") : assignedTech.city) 
                              : "كامل أنحاء جمهورية مصر العربية"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <a 
                          href={assignedTech 
                            ? `https://wa.me/${formatEgyptPhone(assignedTech.phone)}?text=${encodeURIComponent(`مرحباً ${assignedTech.name}، أنا العميل ${mForm.name} من منطقة ${mForm.city}. تم توجيه طلبي إليك بخصوص صيانة ${mForm.deviceType} (${mForm.brand}) من مركز تك فيكس.`)}`
                            : `https://wa.me/${formatEgyptPhone(waNumber)}?text=${encodeURIComponent(`مرحباً تك فيكس، أريد المتابعة مع المسؤول بخصوص طلب الصيانة الذي قمت بإرساله لمنطقة ${mForm.city}.`)}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex-grow py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center border border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer decoration-none"
                        >
                          💬 تحدث مباشرة مع الفني المعين
                        </a>

                        {/* GM Notification Option */}
                        <a 
                          href={`https://wa.me/${formatEgyptPhone(waNumber)}?text=${encodeURIComponent(`🚨 *إشعار تعيين أوردر تلقائي لمنطقة ${mForm.city}* 🚨\n\n- تم استقبال طلب صيانة من العميل (${mForm.name}) في محافظة ${mFormGov} - ${mForm.city}.\n- نوع الجهاز: ${mForm.deviceType} (${mForm.brand}).\n- الفني المخصص: ${assignedTech ? assignedTech.name : "الإدارة العامة"}.\n- هاتف الفني: ${assignedTech ? assignedTech.phone : "تحت المتابعة"}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3.5 bg-[#0a0a0c] hover:bg-[#111114] text-slate-300 font-bold text-xs text-center border border-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer decoration-none"
                          title="إرسال إشعار تأكيد التوجيه إلى المدير العام للمتابعة الإدارية"
                        >
                          👤 توجيه للمدير العام ⚙️
                        </a>
                      </div>
                    </div>

                    <div className="pt-4 text-center">
                      <button 
                        onClick={handleResetMaintenance}
                        className="px-6 py-2.5 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-extrabold text-xs transition-all shadow-md cursor-pointer inline-block"
                      >
                        العودة للرئيسية وموافق 👍
                      </button>
                    </div>
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
                    {(() => {
                      const deviceTypeKey = (tiForm.deviceType === "سخان غاز" || tiForm.deviceType === "سخان") ? "سخان غاز" : "بوتجاز";
                      const availableBrands = BRANDS_DATA[deviceTypeKey] || [];
                      const isPredefined = availableBrands.includes(tiForm.brand);
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                            <div className="space-y-1.5">
                              <label className="text-xs text-slate-400 font-bold block">نوع الجهاز المتوفر <span className="text-brand-orange">*</span></label>
                              <select 
                                value={tiForm.deviceType}
                                onChange={(e) => setTiForm(f => ({ ...f, deviceType: e.target.value, brand: "" }))}
                                className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange font-bold text-right"
                              >
                                <option value="بوتجاز">بوتجاز</option>
                                <option value="سخان غاز">سخان غاز</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs text-slate-400 font-bold block">الماركة المصنعة <span className="text-brand-orange">*</span></label>
                              <select 
                                value={isPredefined ? tiForm.brand : (tiForm.brand ? "أخرى" : "")}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "أخرى") {
                                    setTiForm(f => ({ ...f, brand: "" }));
                                  } else {
                                    setTiForm(f => ({ ...f, brand: val }));
                                  }
                                }}
                                className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange font-bold text-right"
                              >
                                <option value="" disabled>-- اختر ماركة جهازك من القائمة --</option>
                                {availableBrands.map((br, bIdx) => (
                                  <option key={bIdx} value={br}>{br}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {(!tiForm.brand || !isPredefined) && (
                            <div className="space-y-1.5 animate-fadeIn font-sans">
                              <label className="text-xs text-[#f97316] font-bold block">يرجى كتابة الماركة المصنعة يدوياً <span className="text-brand-orange">*</span></label>
                              <input 
                                type="text" 
                                placeholder="مثال: يونيفرسال، كريازي، فريش، أوليمبك... *"
                                value={tiForm.brand}
                                onChange={(e) => setTiForm(f => ({ ...f, brand: e.target.value }))}
                                className="w-full p-3 rounded-none bg-[#141417] border border-brand-orange/70 text-white text-sm outline-none focus:border-brand-orange font-bold placeholder-slate-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
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

                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs text-slate-400 font-bold block">المنطقة السكنية / المدينة <span className="text-brand-orange">*</span></label>
                          <select 
                            value={tiForm.city}
                            onChange={(e) => setTiForm(f => ({ ...f, city: e.target.value }))}
                            className="w-full p-3 rounded-none bg-brand-input border border-white/15 text-white text-sm outline-none focus:border-brand-orange font-bold font-sans"
                          >
                            <option value="" disabled>اختر منطقتك السكنية</option>
                            {covAreas.filter(a => a.active).map((area, idx) => (
                              <option key={idx} value={area.name}>{area.name}</option>
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
                      disabled={!tiForm.requestType || !tiForm.brand || !tiForm.age || !tiForm.condition || !tiForm.name || !tiForm.phone}
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

        {/* TAB 4.5: APPLIANCES SALE FOR CLIENTS */}
          {activeTab === "appliances" && (
            <motion.div 
              key="appliances-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <span className="text-xs uppercase tracking-[0.3em] text-[#f97316] font-bold block">// غسالات، بوتاجازات وسخانات مستعملة ومعاد تصنيعها</span>
                <h2 className="text-4xl font-black text-white tracking-tighter">🛍️ الأجهزة الرياضية والمنزلية لشركة "تك فيكس"</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">أجهزة مضمونة 100% مجددة بالكامل على أيدي خبرائنا، مع ضمان حقيقي يصل إلى عام كامل بأسعار لا تقبل المنافسة</p>
              </div>

              {/* Grid Layout of Appliances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                {appliances.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-[#111114] border border-white/5 space-y-3">
                    <span className="text-4xl">📭</span>
                    <h3 className="text-lg font-black text-white">لا توجد أجهزة معروضة للبيع حالياً</h3>
                    <p className="text-slate-400 text-xs">ترقب مراجعة وتجهيز بعض الأجهزة الممتازة لتضاف قريباً لكتالوج المتجر</p>
                  </div>
                ) : (
                  appliances.map((app) => (
                    <div key={app.id} className="bg-[#111114] border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-[#f97316]/50 transition-all">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        {app.imageUrl ? (
                          <img 
                            src={app.imageUrl} 
                            alt={app.brand} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950 font-black text-xs">
                            لا تتوفر صورة للجهاز 📷
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase bg-[#f97316] text-[#000] tracking-wide">
                          {app.deviceType}
                        </span>
                      </div>
                      
                      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between text-right">
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-[#f97316] transition-colors">{app.brand}</h3>
                          
                          <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
                            <span className="bg-white/5 px-2 py-0.5 border border-white/5">حالة: {app.condition}</span>
                            <span className="bg-white/5 px-2 py-0.5 border border-white/5">الاستهلاك: {app.usageDuration}</span>
                          </div>

                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 pt-2">{app.details}</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold">السعر النهائي المعروض</span>
                            <span className="text-xl font-black text-[#f97316]">{(app.price).toLocaleString()} ج.م</span>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedApplianceForOrder(app);
                              setOrderClientGov("الجيزة");
                              setOrderClientCity("");
                            }}
                            className="w-full py-3 bg-[#f97316] hover:bg-[#d9530f] text-black font-black text-xs uppercase tracking-wider text-center cursor-pointer transition-all"
                          >
                            طلب شراء هذا الجهاز الآن 📞
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Purchase Details Modal Popup */}
              {selectedApplianceForOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black/80 cursor-pointer" onClick={() => setSelectedApplianceForOrder(null)} />
                  
                  <div className="relative w-full max-w-lg bg-[#111114] border border-white/10 p-6 md:p-8 text-right shadow-2xl z-10" dir="rtl">
                    <button 
                      onClick={() => setSelectedApplianceForOrder(null)}
                      className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors text-lg cursor-pointer"
                    >
                      ✕
                    </button>

                    <span className="text-[10px] text-[#f97316] uppercase font-black tracking-widest">// تفعيل حجز وشراء أجهزة منزلية</span>
                    <h3 className="text-2xl font-black text-white mt-1 mb-4">تملّك: {selectedApplianceForOrder.brand}</h3>

                    <div className="bg-[#1b1b1f] p-4 border border-white/5 mb-5 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>نوع الجهاز المطلوب للتوصيل:</span>
                        <span className="text-white font-bold">{selectedApplianceForOrder.deviceType}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>سعر البيع النهائي المتفق عليه:</span>
                        <span className="text-[#f97316] font-black">{selectedApplianceForOrder.price.toLocaleString()} ج.م</span>
                      </div>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!orderClientName || !orderClientPhone || !orderClientAddress) {
                        alert("الرجاء استكمال كافة البيانات لإتمام عملية الشراء المباشرة!");
                        return;
                      }

                      const orderRefCode = "#APP" + Math.floor(10000 + Math.random() * 90000);
                      const fullMsg = `🛍️ *طلب شراء جهاز منزلي - تك فيكس* 🛍️
━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${orderClientName}
📞 *الهاتف:* ${orderClientPhone}
📍 *المحافظة:* ${orderClientGov}
📍 *المنطقة:* ${orderClientCity || "لم يتم تحديدها"}
🏠 *العنوان:* ${orderClientAddress}
━━━━━━━━━━━━━━━━━━
📦 *الجهاز المطلوب:* ${selectedApplianceForOrder.brand} (${selectedApplianceForOrder.deviceType})
💎 *الحالة:* ${selectedApplianceForOrder.condition}
⏳ *مدة الاستخدام:* ${selectedApplianceForOrder.usageDuration}
💰 *السعر المقدر:* ${selectedApplianceForOrder.price.toLocaleString()} ج.م
━━━━━━━━━━━━━━━━━━
🔖 *رقم أوردر الحجز:* ${orderRefCode}
⏰ *وقت المراسلة:* ${formattedNow()}`;

                      // Unified general manager router (201117735952)
                      const queryPhone = "201117735952";
                      const waUrl = `https://wa.me/${queryPhone}?text=${encodeURIComponent(fullMsg)}`;
                      
                      // Attempt to open in new window
                      const newWindow = window.open(waUrl, "_blank", "noreferrer");
                      
                      // Fallback if popup blocked
                      if (!newWindow) {
                        console.warn("WhatsApp popup blocked, falling back to window.location");
                        window.location.href = waUrl;
                      }

                      // Store to customer database
                      saveCustomerRecord({
                        name: orderClientName,
                        phone: orderClientPhone,
                        gov: orderClientGov,
                        city: orderClientCity,
                        address: orderClientAddress,
                        serviceType: "شراء جهاز منزلي",
                        details: `شراء جهاز: ${selectedApplianceForOrder.brand} بسعر ${selectedApplianceForOrder.price.toLocaleString()} ج.م`,
                        timestamp: formattedNow()
                      });

                      // Reset fields & success confirmation
                      setOrderClientName("");
                      setOrderClientPhone("");
                      setOrderClientAddress("");
                      setSelectedApplianceForOrder(null);
                      triggerToast("تم تسجيل طلب الشراء بنجاح وبانتظار رد المدير بالواتساب!");
                    }} className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-bold block">اسم المشتري بالكامل <span className="text-[#f97316]">*</span></label>
                        <input 
                          type="text"
                          required
                          value={orderClientName}
                          onChange={(e) => setOrderClientName(e.target.value)}
                          placeholder="مثال: يوسف ماهر الجيزاوي"
                          className="w-full p-2.5 rounded-none bg-brand-input border border-white/10 text-white text-xs outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-bold block">رقم هاتف الواتس اب للتواصل والمتابعة <span className="text-[#f97316]">*</span></label>
                        <input 
                          type="tel"
                          required
                          value={orderClientPhone}
                          onChange={(e) => setOrderClientPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className="w-full p-2.5 rounded-none bg-brand-input border border-white/10 text-white text-xs text-left outline-none focus:border-brand-orange"
                          dir="ltr"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-slate-400 font-bold block">المنطقة السكنية / المدينة <span className="text-[#f97316]">*</span></label>
                        <select 
                          value={orderClientCity}
                          onChange={(e) => setOrderClientCity(e.target.value)}
                          className="w-full p-2.5 rounded-none bg-brand-input border border-white/10 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                        >
                          <option value="" disabled>اختر منطقتك السكنية</option>
                          {covAreas.filter(a => a.active).map((area, idx) => (
                            <option key={idx} value={area.name}>{area.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-bold block">عنوان المنزل تفصيلياً (الشارع، البناية، الشقة) <span className="text-[#f97316]">*</span></label>
                        <input 
                          type="text"
                          required
                          value={orderClientAddress}
                          onChange={(e) => setOrderClientAddress(e.target.value)}
                          placeholder="مثال: شارع المحطة الرئيسي - عمارة الهدى، الطابق الرابع شقة ٣"
                          className="w-full p-2.5 rounded-none bg-brand-input border border-white/10 text-white text-xs outline-none focus:border-[#f97316]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#f97316] hover:bg-[#d9530f] text-black font-black text-sm uppercase tracking-wider text-center cursor-pointer transition-all mt-4"
                      >
                        إرسال كود طلب الحجز والشراء الآن 📲
                      </button>

                    </form>
                  </div>
                </div>
              )}

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
                        id="admin-password-input"
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
                  
                  {/* BRANDED INTERACTIVE DASHBOARD SUB-NAVBAR TABS */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">// لوحة التحكم الإدارية المركزية</h3>
                      <p className="text-slate-400 text-xs">تك فيكس مبيعات، صيانة، تفريغ وتوزيع المناطق التوزيعي بالأقسام</p>
                    </div>
                    {/* Switch buttons */}
                    <div className="flex flex-wrap items-center bg-[#111114] p-1 border border-white/10 gap-1 rounded-none select-none">
                      <button 
                        onClick={() => setAdminSubTab("inventory")}
                        className={`py-2 px-4 text-center font-extrabold text-[11px] tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                          adminSubTab === "inventory" 
                            ? "bg-brand-orange text-black font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>المخزن الحالي ({parts.length})</span>
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("customers")}
                        className={`py-2 px-4 text-center font-extrabold text-[11px] tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                          adminSubTab === "customers" 
                            ? "bg-brand-orange text-black font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>بيانات العملاء ({customers.length})</span>
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("technicians")}
                        className={`py-2 px-4 text-center font-extrabold text-[11px] tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                          adminSubTab === "technicians" 
                            ? "bg-brand-orange text-black font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>إدارة الفنيين ({technicians.length})</span>
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("areas")}
                        className={`py-2 px-4 text-center font-extrabold text-[11px] tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                          adminSubTab === "areas" 
                            ? "bg-brand-orange text-black font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>إدارة المناطق ({covAreas.length})</span>
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("appliances_sale")}
                        className={`py-2 px-4 text-center font-extrabold text-[11px] tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                          adminSubTab === "appliances_sale" 
                            ? "bg-brand-orange text-black font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>بيع الأجهزة المنزلية ({appliances.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* SUBTAB 1: INVENTORY MANAGEMENT */}
                  {adminSubTab === "inventory" && (
                    <div className="space-y-8">
                      {/* Seeding & Demo Data Setup Container */}
                      <div className="bg-brand-orange/5 p-5 rounded-none border border-brand-orange/20 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-brand-orange font-black text-sm flex items-center gap-1.5">
                              <span>⚡ تهيئة منظومة الفنيين والتوجيه التلقائي التجريبي (Developer Seeding)</span>
                            </h4>
                            <p className="text-[10px] text-slate-300">
                              اضغط هنا لزرع بيانات 8 فنيين تجريبيين على الفور واجهة الـ LocalStorage وتفعيل تغطية مناطق الجيزة الرئيسية. يتيح لك هذا اختبار دالة التوزيع الجيو-تخصصي للعملاء فوراً.
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              seedInitialData(true);
                              triggerToast("تمت تهيئة وزرع بيانات التوزيع التلقائي لـ 8 فنيين وتفعيل تغطية الجيزة بنجاح! ⚡");
                            }}
                            className="px-5 py-3 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black text-xs font-black transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 self-start sm:self-center shrink-0"
                          >
                            <span>زرع البيانات التجريبية 🧪</span>
                          </button>
                        </div>
                      </div>

                      {/* Config Box: WA Number */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-3">
                        <h4 className="text-white font-black text-sm flex items-center gap-2">
                          <Settings className="w-4 h-4 text-brand-orange animate-spin-slow" />
                          <span>📱 تعيين رقم الواتس آب المسؤول لمسار الطلبات</span>
                        </h4>
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
                          <table className="w-full text-right text-xs table-auto min-w-[600px]">
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

                  {/* SUBTAB 1.5: APPLIANCES CATALOG MANAGEMENT FOR ADMIN */}
                  {adminSubTab === "appliances_sale" && (
                    <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
                      {/* Configuration header & status cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#111114] p-5 border border-white/10 space-y-1">
                          <span className="text-xs text-slate-500 font-bold">// إحصائية العرض</span>
                          <h4 className="text-xs font-black text-slate-300">إجمالي الأجهزة المنزلية</h4>
                          <div className="text-3xl font-black text-white">{appliances.length} جهاز</div>
                        </div>
                        <div className="bg-[#111114] p-5 border border-white/10 space-y-1">
                          <span className="text-xs text-[#f97316] font-bold">// التوصيل المتاح</span>
                          <h4 className="text-xs font-black text-slate-300">أماكن تمثيل التوصيل والمبيعات</h4>
                          <div className="text-3xl font-black text-[#f97316]">جميع المحافظات المتاحة</div>
                        </div>
                        <div className="bg-[#111114] p-5 border border-white/10 space-y-1">
                          <span className="text-xs text-emerald-400 font-bold">// ضمان تك فيكس</span>
                          <h4 className="text-xs font-black text-slate-300">مدة الكفالة للأجهزة المعروضة</h4>
                          <div className="text-3xl font-black text-emerald-400">سنة كاملة بالمنزل</div>
                        </div>
                      </div>

                      {/* Display table of listed appliances */}
                      <div className="bg-[#111114] p-5 border border-white/10 space-y-4">
                        <h4 className="text-white font-black text-sm block border-b border-white/10 pb-2">📦 كتالوج الأجهزة المعروضة حالياً للبيع</h4>
                        
                        {appliances.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-xs">
                            لا توجد أجهزة مضافة حالياً في المعرض. استخدم النموذج أدناه لإضافة جهازك الأول!
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                                  <th className="py-3 px-2">صورة الجهاز</th>
                                  <th className="py-3 px-2">نوع الجهاز</th>
                                  <th className="py-3 px-2">الماركة والموديل</th>
                                  <th className="py-3 px-2">الحالة</th>
                                  <th className="py-3 px-2">مدة الاستهلاك</th>
                                  <th className="py-3 px-2">السعر المطلوب</th>
                                  <th className="py-3 px-2 text-center">الإجراءات</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-slate-200">
                                {appliances.map((app) => (
                                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-2">
                                      {app.imageUrl ? (
                                        <img src={app.imageUrl} alt={app.brand} className="w-12 h-12 object-cover border border-white/10" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-12 h-12 bg-slate-900 border border-white/10 flex items-center justify-center text-[10px]">بلا صورة</div>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 font-bold text-[#f97316]">{app.deviceType}</td>
                                    <td className="py-3 px-2 font-black">{app.brand}</td>
                                    <td className="py-3 px-2">{app.condition}</td>
                                    <td className="py-3 px-2">{app.usageDuration}</td>
                                    <td className="py-3 px-2 text-[#f97316] font-black">{app.price.toLocaleString()} ج.م</td>
                                    <td className="py-3 px-2 text-center">
                                      <button
                                        onClick={() => {
                                          setCustomConfirm({
                                            show: true,
                                            title: "حذف جهاز من المعرض",
                                            message: `هل أنت متأكد من رغبتك بحذف هذا الجهاز (${app.brand}) من قائمة المبيعات المعروضة للعملاء؟`,
                                            onConfirm: () => {
                                              const updated = appliances.filter(a => a.id !== app.id);
                                              saveAppliancesToStorage(updated);
                                              triggerToast("تم حذف الجهاز بنجاح من الكتالوج المعروض! 🗑️");
                                              setCustomConfirm(null);
                                            }
                                          });
                                        }}
                                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold transition-all rounded-none cursor-pointer text-[10px]"
                                      >
                                        حذف الجهاز 🗑️
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Form: Add Refurbished Appliance */}
                      <div className="bg-[#111114] p-6 border border-white/10 space-y-6">
                        <div className="border-b border-white/10 pb-2">
                          <span className="text-xs text-[#f97316] uppercase font-black tracking-widest block">// تسجيل الأجهزة المستعملة وتدقيق مبيعات المعرض</span>
                          <h4 className="text-white font-black text-sm">➕ إضافة جهاز منزل جديد للمعرض للعملاء</h4>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!newAppBrand || !newAppCondition || !newAppPrice) {
                            alert("الرجاء الملء الدقيق للماركة والحالة الفنية والسعر العام!");
                            return;
                          }
                          const newApp: Appliance = {
                            id: Date.now(),
                            deviceType: newAppType,
                            brand: newAppBrand,
                            condition: newAppCondition,
                            usageDuration: newAppUsage || "سنتين",
                            price: Number(newAppPrice),
                            imageUrl: newAppImage || "https://images.unsplash.com/photo-1571887455899-41d2ded28a64?auto=format&fit=crop&q=80&w=600",
                            details: newAppDetails || "جهاز مجدد ومضمون كلياً من خلال مهندسو تك فيكس بضمان استبدال منزلي كامل."
                          };

                          const updated = [...appliances, newApp];
                          saveAppliancesToStorage(updated);

                          // Reset state fields
                          setNewAppBrand("");
                          setNewAppCondition("");
                          setNewAppUsage("");
                          setNewAppPrice("");
                          setNewAppImage("");
                          setNewAppDetails("");

                          triggerToast("تم حفظ ونشر الجهاز الجديد بنجاح في الكتالوج!");
                        }} className="space-y-4">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">تصنيف الجهاز المنزل <span className="text-[#f97316]">*</span></label>
                              <select 
                                value={newAppType}
                                onChange={(e) => setNewAppType(e.target.value)}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold"
                              >
                                <option value="بوتاجاز">بوتاجاز</option>
                                <option value="ثلاجة">ثلاجة</option>
                                <option value="سخان">سخان</option>
                                <option value="غسالة">غسالة</option>
                                <option value="أخرى">أخرى</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">الماركة والموديل تفصيلياً (مثال: يونيفرسال 5 شعلة استانلس) <span className="text-[#f97316]">*</span></label>
                              <input 
                                type="text"
                                required
                                placeholder="الماركة والموديل"
                                value={newAppBrand}
                                onChange={(e) => setNewAppBrand(e.target.value)}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">الحالة الفنية العامة (بين: ممتازة، متهالك ومجدد، جيدة جداً) <span className="text-[#f97316]">*</span></label>
                              <input 
                                type="text"
                                required
                                placeholder="مثال: ممتازة كالعذراء / مجدد كلياً"
                                value={newAppCondition}
                                onChange={(e) => setNewAppCondition(e.target.value)}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">مدة الاستخدام التقريبية للجهاز (مثال: 6 أشهر، سنة ونصف) <span className="text-[#f97316]">*</span></label>
                              <input 
                                type="text"
                                placeholder="مثال: سنة واحدة"
                                value={newAppUsage}
                                onChange={(e) => setNewAppUsage(e.target.value)}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">السعر المطلوب النهائي للبيع بالمصري <span className="text-[#f97316]">*</span></label>
                              <input 
                                type="number"
                                required
                                placeholder="اكتب قيمة السعر بالجنيه فقط"
                                value={newAppPrice}
                                onChange={(e) => setNewAppPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left font-bold"
                                dir="ltr"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold block">رابط صورة الجهاز الحقيقية (اختياري / يدعم روابط Unsplash) 📷</label>
                              <input 
                                type="url"
                                placeholder="بث رابط صورة الجهاز المنزل"
                                value={newAppImage}
                                onChange={(e) => setNewAppImage(e.target.value)}
                                className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-[#f97316]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold block">شرح تفصيلي إضافي ومميزات الجهاز (الملحقات، الكفالة، شروط التوصيل)</label>
                            <textarea 
                              rows={3}
                              placeholder="مواصفات تبريد الثلاجة، كفاءة شواية الفران البوتجاز، أو أمن السخان الديجيتال بالماركة..."
                              value={newAppDetails}
                              onChange={(e) => setNewAppDetails(e.target.value)}
                              className="w-full p-2.5 bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-[#f97316]"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full sm:w-auto py-3 px-6 rounded-none bg-[#f97316] hover:bg-[#d9530f] text-black font-black text-xs transition-colors cursor-pointer mt-2"
                          >
                            تأكيد وبث الجهاز الجديد للبيع في المتجر للعملاء 🚀
                          </button>

                        </form>
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 2: CUSTOMER DATABASE CRM */}
                  {adminSubTab === "customers" && (
                    <div className="space-y-8 animate-fadeIn">
                      
                      {/* Global Campaign Panel */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📢</span>
                          <h4 className="text-white font-black text-sm">حملة الرسائل الجماعية واستقطاب العملاء الدائمين</h4>
                        </div>
                        <p className="text-slate-400 text-xs">
                          قم بتحديد العملاء المطلوبين من الجدول عبر مربعات التحديد لتطلق لهم بمفتاح مجمع رسالة دورية ترويجية.
                        </p>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">نص الرسالة الموحدة للحملة الجماهيرية:</label>
                          <textarea 
                            value={bulkMessageText}
                            onChange={(e) => setBulkMessageText(e.target.value)}
                            className="w-full p-3 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange h-20 leading-relaxed font-bold"
                            placeholder="مثال: أهلاً بك عملينا العزيز من مركز تك فيكس للمجموعات..."
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                          <div className="text-xs text-slate-400 font-normal">
                            تم تحديد <span className="text-brand-orange font-black text-sm">{selectedCusts.length}</span> عملاء من إجمالي <span className="text-white font-black text-sm">{customers.length}</span> عميل بالمنظومة.
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => setSelectedCusts([])}
                              disabled={selectedCusts.length === 0}
                              className="py-2.5 px-4 rounded-none bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                            >
                              إلغاء التحديد الجماعي
                            </button>
                            <button
                              onClick={() => {
                                if (selectedCusts.length === 0) {
                                  alert("الرجاء تحديد عميل واحد على الأقل أولاً لإرسال الحملة الجماعية");
                                  return;
                                }
                                
                                // Process selected customers sequentially in a campaign mode
                                const readyCusts = customers.filter(c => selectedCusts.includes(c.id));
                                if (readyCusts.length > 0) {
                                  // Open first match
                                  const c0 = readyCusts[0];
                                  const cleanPhone = c0.phone.trim().replace(/\D/g, "");
                                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(bulkMessageText)}`, "_blank", "noreferrer");
                                  
                                  // Message explaining how to handle multiple queue elements sequentially tanpa diblokir popup blocker
                                  alert(`جاري تشغيل الحملة. تم فتح المحادثة الأولى وبث الرسالة لحساب العميل (${c0.name}). يمكنك متابعة النقر على أيقونات الإرسال المجاورة لبقية العملاء المحددين في القائمة للتوالي السهل.`);
                                }
                              }}
                              disabled={selectedCusts.length === 0}
                              className="py-2.5 px-6 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs transition-all disabled:bg-neutral-800 disabled:text-neutral-500 cursor-pointer flex items-center gap-1"
                            >
                              <span>إرسال الحملة الجماعية الواتس آب ({selectedCusts.length})</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Customer CRM Table */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-white font-black text-sm flex items-center gap-2">
                            <span>👥 رصيد وقاعدة بيانات العملاء التاريخية</span>
                            <span className="px-2 py-0.5 text-[10px] bg-white/10 text-neutral-300 font-extrabold">{customers.length} سجل</span>
                          </h4>
                          
                          <button 
                            onClick={() => {
                              setCustomConfirm({
                                show: true,
                                title: "مسح قاعدة بيانات العملاء",
                                message: "هل أنت متأكد من حذف كامل سجلات صيانة الطلبات وسجل العملاء التاريخي بأكمله؟ لا يمكن التراجع عن هذا الإجراء.",
                                onConfirm: () => {
                                  saveCustomersToStorage([]);
                                  triggerToast("تم تنظيف وتفريغ قاعدة بيانات العملاء بنجاح 🗑️");
                                  setCustomConfirm(null);
                                }
                              });
                            }}
                            className="text-xs text-red-400 hover:text-red-500 font-bold hover:underline transition-all cursor-pointer"
                          >
                            مسح كامل تتبع العملاء التاريخي
                          </button>
                        </div>

                        {customers.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-xs">
                            لا يوجد أي عملاء مسجلين حالياً بالمنظومة المحلي، جاري حفظ العملاء تلقائياً عند طلب صيانة أو مبيعات.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-none border border-white/10">
                            <table className="w-full text-right text-xs table-auto min-w-[750px]">
                              <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                                <tr>
                                  <th className="p-3 w-10 text-center">
                                    <input 
                                      type="checkbox"
                                      checked={customers.length > 0 && selectedCusts.length === customers.length}
                                      onChange={() => {
                                        if (selectedCusts.length === customers.length) {
                                          setSelectedCusts([]);
                                        } else {
                                          setSelectedCusts(customers.map(c => c.id));
                                        }
                                      }}
                                      className="cursor-pointer"
                                    />
                                  </th>
                                  <th className="p-3">اسم العميل</th>
                                  <th className="p-3">الهاتف</th>
                                  <th className="p-3">العنوان والمنطقة</th>
                                  <th className="p-3">نوع الخدمة</th>
                                  <th className="p-3 text-center">التاريخ</th>
                                  <th className="p-3">توجيه الرسالة مخصصة (صيانة/حملة)</th>
                                  <th className="p-3 text-center">حملات وتواصل</th>
                                  <th className="p-3 text-center">حذف العميل</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {customers.map((c) => (
                                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="p-3 text-center">
                                      <input 
                                        type="checkbox"
                                        checked={selectedCusts.includes(c.id)}
                                        onChange={() => {
                                          if (selectedCusts.includes(c.id)) {
                                            setSelectedCusts(prev => prev.filter(x => x !== c.id));
                                          } else {
                                            setSelectedCusts(prev => [...prev, c.id]);
                                          }
                                        }}
                                        className="cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-3 text-white font-black">
                                      <input 
                                        type="text"
                                        value={c.name}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, name: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c]/80 border border-white/10 focus:border-brand-orange p-1 px-1.5 text-xs w-full text-white font-bold outline-none rounded-none transition-all"
                                        placeholder="اسم العميل"
                                      />
                                    </td>
                                    <td className="p-3 font-mono text-slate-300 antialiased font-bold text-left" dir="ltr">
                                      <input 
                                        type="text"
                                        value={c.phone}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, phone: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c]/80 border border-white/10 focus:border-brand-orange p-1 px-1.5 text-xs w-full text-slate-300 font-mono text-left font-bold outline-none rounded-none transition-all"
                                        placeholder="رقم الهاتف"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <select 
                                        value={c.city}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, city: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                          triggerToast(`تم تحديث منطقة العميل تلقائياً إلى ${e.target.value}`);
                                        }}
                                        className="bg-[#0a0a0c] border border-white/10 focus:border-brand-orange p-1 text-[11px] text-brand-orange font-black w-full outline-none rounded-none mb-1 text-right"
                                      >
                                        {covAreas.map((area, idx) => (
                                          <option key={idx} value={area.name}>{area.name}</option>
                                        ))}
                                      </select>
                                      <input 
                                        type="text"
                                        value={c.address}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, address: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c]/80 border border-white/10 focus:border-brand-orange p-1 px-1.5 text-[10px] w-full text-slate-400 font-semibold outline-none rounded-none"
                                        placeholder="تفاصيل العنوان"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <select 
                                        value={c.serviceType}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, serviceType: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c] border border-white/10 focus:border-[#4f46e5] p-1 text-[11px] text-slate-300 font-bold w-full outline-none rounded-none mb-1 text-right"
                                      >
                                        <option value="طلب صيانة">طلب صيانة 🔧</option>
                                        <option value="شراء قطع غيار">شراء قطع غيار 🛒</option>
                                        <option value="بيع وتجديد أجهزة">بيع وتجديد أجهزة ♻️</option>
                                        <option value="تجديد">تجديد 🏷️</option>
                                      </select>
                                      <input 
                                        type="text"
                                        value={c.details || ""}
                                        onChange={(e) => {
                                          const updated = customers.map(x => x.id === c.id ? { ...x, details: e.target.value } : x);
                                          saveCustomersToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c]/80 border border-white/10 focus:border-brand-orange p-1 px-1.5 text-[10px] w-full text-slate-400 outline-none rounded-none"
                                        placeholder="ملاحظات وتفاصيل الجهاز"
                                      />
                                    </td>
                                    <td className="p-3 text-slate-400 text-center text-[10px] font-bold" dir="rtl">{c.timestamp}</td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1 max-w-[240px]">
                                        <input 
                                          type="text"
                                          placeholder="رسالة دورية مخصصة للعميل..."
                                          value={singleOffers[c.id] || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setSingleOffers(prev => ({ ...prev, [c.id]: val }));
                                          }}
                                          className="p-1 px-2 rounded-none bg-[#0a0a0c] border border-white/10 text-white text-[10px] outline-none font-bold focus:border-brand-orange flex-grow"
                                        />
                                        <button 
                                          onClick={() => {
                                            const customMsg = singleOffers[c.id] || `مرحباً ${c.name} 🛠️، نود التذكير بضرورة جدولة صيانة وقائية على جهازكم لضمان أمانه المستمر ومستعدين لإرسال فني فوري بخصم تك فيكس الخاص!`;
                                            const cleanPhone = c.phone.trim().replace(/\D/g, "");
                                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMsg)}`, "_blank", "noreferrer");
                                          }}
                                          className="px-2.5 py-1 text-[10px] bg-[#1a1a20] border border-white/10 hover:border-transparent hover:bg-emerald-600 hover:text-white text-slate-300 font-bold transition-all cursor-pointer shrink-0"
                                        >
                                          إرسال مخصص
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <button 
                                        onClick={() => {
                                          const cleanPhone = c.phone.trim().replace(/\D/g, "");
                                          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(bulkMessageText)}`, "_blank", "noreferrer");
                                        }}
                                        className="px-2 py-1 text-[10px] bg-brand-orange/10 hover:bg-brand-orange hover:text-black text-brand-orange font-bold border border-brand-orange/20 transition-all cursor-pointer"
                                        title="إرسال رسالة الحملة الفردية الموحدة"
                                      >
                                        بث الحملة الموحدة 📢
                                      </button>
                                    </td>
                                    <td className="p-3 text-center">
                                      <button 
                                        onClick={() => {
                                          setCustomConfirm({
                                            show: true,
                                            title: "حذف سجل عميل",
                                            message: `هل تريد بالتأكيد إزالة سجل العميل (${c.name}) نهائياً من قاعدة بيانات المنظومة؟`,
                                            onConfirm: () => {
                                              const updated = customers.filter(x => x.id !== c.id);
                                              saveCustomersToStorage(updated);
                                              triggerToast("تم حذف سجل العميل بنجاح 🗑️");
                                              setCustomConfirm(null);
                                            }
                                          });
                                        }}
                                        className="p-2 rounded-none bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-400 transition-all cursor-pointer inline-flex items-center justify-center"
                                        title="حذف السجل 🗑️"
                                      >
                                        <span>🗑️</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Custom Requests Log Section */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4 font-sans">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-white font-black text-sm flex items-center gap-2">
                            <span>📋 سجل تتبع طلبات التوجيه التلقائي الذكي للفنيين (customRequestsLog)</span>
                            <span className="px-2 py-0.5 text-[10px] bg-brand-orange/15 text-brand-orange border border-brand-orange/20 font-extrabold">{customRequestsLog.length} طلب ذكي</span>
                          </h4>
                          
                          <button 
                            onClick={() => {
                              setCustomConfirm({
                                show: true,
                                title: "مسح سجل التوجيه التلقائي",
                                message: "هل أنت متأكد من مسح كامل سجل طلبات التوجيه التلقائي (customRequestsLog) المحفوظ؟ لا يمكن استعادته لاحقاً.",
                                onConfirm: () => {
                                  saveCustomRequestsLog([]);
                                  triggerToast("تم مسح سجل التوجيه التلقائي بنجاح 📋🗑️");
                                  setCustomConfirm(null);
                                }
                              });
                            }}
                            className="text-xs text-red-400 hover:text-red-500 font-bold hover:underline transition-all cursor-pointer"
                          >
                            مسح سجل التوجيه التلقائي
                          </button>
                        </div>

                        {customRequestsLog.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-xs">
                            لا يوجد أي أوردرات تم توجيهها تلقائياً للفنيين حالياً. سيقوم النظام بحفظها تلقائياً بمجرد إرسال العميل لطلب صيانة جديد.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-none border border-white/10">
                            <table className="w-full text-right text-xs table-auto min-w-[750px]">
                              <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                                <tr>
                                  <th className="p-3">اسم العميل</th>
                                  <th className="p-3">رقم العميل</th>
                                  <th className="p-3">المنطقة والسكن</th>
                                  <th className="p-3">الجهاز والماركة</th>
                                  <th className="p-3 font-bold text-brand-orange">الفني المخصص</th>
                                  <th className="p-3 text-center">التوقيت والتاريخ</th>
                                  <th className="p-3 text-center">حالة التوجيه</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {customRequestsLog.map((log, idx) => (
                                  <tr key={log.id || idx} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="p-3 text-white font-bold">{log.customerName}</td>
                                    <td className="p-3 font-mono text-slate-300 text-left" dir="ltr">{log.phone}</td>
                                    <td className="p-3">
                                      <div className="text-slate-300 font-medium">{log.city}</div>
                                      <div className="text-[10px] text-slate-500 font-normal">{log.address}</div>
                                    </td>
                                    <td className="p-3">
                                      <span className="px-2 py-0.5 rounded-none bg-white/5 border border-white/10 text-slate-300 text-[10px] inline-block font-extrabold mb-1">{log.deviceType}</span>
                                      <div className="text-[10px] text-slate-400 font-medium">{log.brand} - {log.problem}</div>
                                    </td>
                                    <td className="p-3 font-bold text-brand-orange">
                                      <div>👤 {log.techName}</div>
                                      <div className="text-[10px] font-mono text-slate-500" dir="ltr">{log.techPhone}</div>
                                    </td>
                                    <td className="p-3 text-slate-400 text-center text-[10px]" dir="rtl">{log.timestamp}</td>
                                    <td className="p-3 text-center">
                                      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        توجيه تلقائي ناجح ✓
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 3: TECHNICIAN MANAGEMENT */}
                  {adminSubTab === "technicians" && (
                    <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
                      
                      {/* Active Technicians Geographical Board List */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4 font-sans">
                        <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-white/5 pb-3 gap-2">
                          <h4 className="text-white font-black text-sm flex items-center gap-1.5">
                            <span>🛠️ لوحة إدارة الفنيين والمسؤوليات التوزيعية المزدوجة</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">سجل فنيين لتسريح طلبات الصيانة والمبيعات بمساراتهم ومحافظاتهم ذاتياً</span>
                        </div>

                        <div className="overflow-x-auto rounded-none border border-white/10">
                          <table className="w-full text-right text-xs table-auto min-w-[650px]">
                            <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                              <tr>
                                <th className="p-3.5">المهندس الفني</th>
                                <th className="p-3.5">قناة الاتصال المباشرة</th>
                                <th className="p-3.5">أجهزة التخصص</th>
                                <th className="p-3.5">المناطق الجغرافية المغطاة</th>
                                <th className="p-3.5 text-center">التحكم والتعديل والضبط</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 font-bold text-slate-300">
                              {technicians.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                                    لا يوجد فنيين معرفين، جميع طلبات الصيانة والقطع يتم توجيهها تلقائياً إلى رقم المسؤول العام.
                                  </td>
                                </tr>
                              ) : (
                                technicians.map((t) => {
                                  const isEditing = editingTechId === t.id;
                                  return (
                                    <React.Fragment key={t.id}>
                                      <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-3">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="text-white text-xs font-black">{t.name}</span>
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <span className="text-slate-400 text-xs font-mono select-all font-bold block" dir="ltr">
                                            {t.phone}
                                          </span>
                                        </td>
                                        <td className="p-3">
                                          <div className="flex flex-wrap gap-1">
                                            {(t.specialties || ["بوتجاز", "سخان غاز"]).map((spec, specIdx) => (
                                              <span 
                                                key={specIdx} 
                                                className="px-1.5 py-0.5 text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-none font-bold"
                                              >
                                                {spec}
                                              </span>
                                            ))}
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <div className="flex flex-wrap gap-1 max-w-sm">
                                            {(t.cities || [t.city || "طموة"]).map((city, cityIdx) => (
                                              <span 
                                                key={cityIdx} 
                                                className="px-1.5 py-0.5 text-[9px] bg-brand-orange/10 border border-brand-orange/25 text-brand-orange rounded-none font-bold"
                                              >
                                                {city}
                                              </span>
                                            ))}
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          <div className="flex items-center gap-1.5 justify-center">
                                            <button 
                                              onClick={() => {
                                                if (isEditing) {
                                                  setEditingTechId(null);
                                                } else {
                                                  setEditingTechId(t.id);
                                                  setEditTechName(t.name);
                                                  setEditTechPhone(t.phone);
                                                  setEditTechSpecs(t.specialties || ["بوتجاز", "سخان غاز"]);
                                                  setEditTechCities(t.cities || [t.city || "طموة"]);
                                                }
                                              }}
                                              className={`py-1.5 px-3 rounded-none text-[10px] font-black cursor-pointer transition-all shrink-0 ${
                                                isEditing 
                                                  ? "bg-slate-700 text-white" 
                                                  : "bg-[#0a0a0c] border border-white/10 text-slate-300 hover:border-brand-orange hover:text-white"
                                              }`}
                                            >
                                              {isEditing ? "إغلاق التعديل" : "✍️ تعديل التخصص والمناطق"}
                                            </button>

                                            {deleteConfirmId === t.id ? (
                                              <div className="flex items-center gap-1">
                                                <button 
                                                  onClick={() => {
                                                    const updated = technicians.filter(x => x.id !== t.id);
                                                    saveTechniciansToStorage(updated);
                                                    setDeleteConfirmId(null);
                                                    triggerToast(`تم فصل وإلغاء تعيين الفني ${t.name} بنجاح`);
                                                  }}
                                                  className="py-1 px-2 rounded-none bg-red-600 hover:bg-red-700 text-white font-black text-[9px] cursor-pointer"
                                                >
                                                  تأكيد حذف
                                                </button>
                                                <button 
                                                  onClick={() => setDeleteConfirmId(null)}
                                                  className="py-1 px-1.5 bg-white/10 hover:bg-white/15 text-slate-300 text-[9px] cursor-pointer"
                                                >
                                                  إلغاء
                                                </button>
                                              </div>
                                            ) : (
                                              <button 
                                                onClick={() => setDeleteConfirmId(t.id)}
                                                className="p-1 px-1.5 rounded-none bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/15 transition-all text-[10px] cursor-pointer inline-flex items-center"
                                                title="إزالة الفني من المنظومة"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>

                                      {/* Expanded Inline Editing Area for Row */}
                                      {isEditing && (
                                        <tr>
                                          <td colSpan={5} className="bg-[#0b0b0d] p-5 border-y border-white/10 text-right animate-fadeIn">
                                            <div className="space-y-4 max-w-4xl mx-auto">
                                              <h5 className="text-white font-black text-xs border-b border-white/5 pb-2">📋 تعديل تفاصيل الفني الجغرافية والفنية: {t.name}</h5>
                                              
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                  <label className="text-[10px] text-slate-400 block font-bold">الاسم المهني للفني</label>
                                                  <input 
                                                    type="text"
                                                    value={editTechName}
                                                    onChange={(e) => setEditTechName(e.target.value)}
                                                    className="w-full p-2.5 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                                                  />
                                                </div>

                                                <div className="space-y-1">
                                                  <label className="text-[10px] text-slate-400 block font-bold">رقم هاتف الواتساب الفردي</label>
                                                  <input 
                                                    type="text"
                                                    value={editTechPhone}
                                                    onChange={(e) => setEditTechPhone(e.target.value)}
                                                    className="w-full p-2.5 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans text-left"
                                                    dir="ltr"
                                                  />
                                                </div>
                                              </div>

                                              {/* Specialty Edit */}
                                              <div className="space-y-1 overflow-x-hidden">
                                                <label className="text-[10px] text-slate-400 block font-bold font-sans">تخصص أجهزة الصيانة</label>
                                                <div className="flex gap-4 p-2 bg-[#111114] border border-white/10 w-fit">
                                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                                                    <input 
                                                      type="checkbox"
                                                      checked={editTechSpecs.includes("بوتجاز")}
                                                      onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setEditTechSpecs(prev => 
                                                          isChecked ? [...prev, "بوتجاز"] : prev.filter(x => x !== "بوتجاز")
                                                        );
                                                      }}
                                                      className="accent-brand-orange cursor-pointer"
                                                    />
                                                    <span>صيانة بوتجازات</span>
                                                  </label>
                                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                                                    <input 
                                                      type="checkbox"
                                                      checked={editTechSpecs.includes("سخان غاز")}
                                                      onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setEditTechSpecs(prev => 
                                                          isChecked ? [...prev, "سخان غاز"] : prev.filter(x => x !== "سخان غاز")
                                                        );
                                                      }}
                                                      className="accent-brand-orange cursor-pointer"
                                                    />
                                                    <span>صيانة سخانات غاز</span>
                                                  </label>
                                                </div>
                                              </div>

                                              {/* Multiple Cities Edit */}
                                              <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 block font-bold font-sans">المناطق السكنية المغطاة (تحديد متعدد)</label>
                                                <div className="p-3 bg-[#111114] border border-white/10 max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                  {covAreas.filter(area => area.active).map((area, idx) => {
                                                    const isSelected = editTechCities.includes(area.name);
                                                    return (
                                                      <label key={idx} className="flex items-center gap-2 text-[10px] cursor-pointer text-slate-300 font-bold hover:text-white">
                                                        <input 
                                                          type="checkbox"
                                                          checked={isSelected}
                                                          onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setEditTechCities(prev => 
                                                              isChecked ? [...prev, area.name] : prev.filter(c => c !== area.name)
                                                            );
                                                          }}
                                                          className="accent-brand-orange cursor-pointer w-3.5 h-3.5"
                                                        />
                                                        <span>{area.name} <span className="text-[8px] text-slate-500 font-sans font-bold">({area.gov})</span></span>
                                                      </label>
                                                    );
                                                  })}
                                                </div>
                                              </div>

                                              <div className="flex gap-2">
                                                <button 
                                                  onClick={() => {
                                                    if (!editTechName.trim() || !editTechPhone.trim()) {
                                                      alert("الرجاء إدخال بيانات صحيحة للفني أولاً");
                                                      return;
                                                    }
                                                    if (editTechSpecs.length === 0) {
                                                      alert("يجب اختيار تخصص واحد على الأقل للفني");
                                                      return;
                                                    }
                                                    if (editTechCities.length === 0) {
                                                      alert("يجب تعيين منطقة سكنية واحدة على الأقل لتغطية هذا الفني");
                                                      return;
                                                    }
                                                    
                                                    const formattedPhone = formatEgyptPhone(editTechPhone);
                                                    const updated = technicians.map(x => x.id === t.id ? { 
                                                      ...x, 
                                                      name: editTechName.trim(), 
                                                      phone: formattedPhone,
                                                      city: editTechCities[0],
                                                      cities: editTechCities,
                                                      specialties: editTechSpecs
                                                    } : x);

                                                    saveTechniciansToStorage(updated);
                                                    setEditingTechId(null);
                                                    triggerToast(`تم تحديث التخصص والمناطق المغطاة للفني ${editTechName} بنجاح! ⚡`);
                                                  }}
                                                  className="py-1.5 px-4 bg-brand-orange hover:bg-brand-orange-dark text-black text-xs font-black transition-all cursor-pointer rounded-none border border-transparent"
                                                >
                                                  حفظ التعديلات 💾
                                                </button>
                                                <button 
                                                  type="button"
                                                  onClick={() => setEditingTechId(null)}
                                                  className="py-1.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer rounded-none"
                                                >
                                                  إلغاء التعديل
                                                </button>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Add New Technician Block Form */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4 font-sans">
                        <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                          <Plus className="w-4.5 h-4.5 text-brand-orange" />
                          <span>إضافة فني جديد وتعيين تخصصاته وخرائطه التغطوية</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">اسم الفني الثنائي/الكامل</label>
                            <input 
                              type="text"
                              placeholder="مثال: المهندس سمير عبد الله"
                              value={newTechName}
                              onChange={(e) => setNewTechName(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">رقم هاتف واتساب الفردي للفني</label>
                            <input 
                              type="text"
                              placeholder="مثال: 01023456789"
                              value={newTechPhone}
                              onChange={(e) => setNewTechPhone(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left font-bold font-sans"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        {/* Specialty Choice Checklist */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">أجهزة وتوجيه تخصص الفني المعين <span className="text-[#f97316]">*</span></label>
                          <div className="flex gap-4 p-3.5 bg-[#0a0a0c] border border-white/10 w-fit">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white select-none">
                              <input 
                                type="checkbox"
                                checked={newTechSpecs.includes("بوتجاز")}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setNewTechSpecs(prev => 
                                    isChecked ? [...prev, "بوتجاز"] : prev.filter(x => x !== "بوتجاز")
                                  );
                                }}
                                className="accent-brand-orange cursor-pointer w-4 h-4"
                              />
                              <span>🔧 صيانة وإصلاح البوتجازات</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white select-none">
                              <input 
                                type="checkbox"
                                checked={newTechSpecs.includes("سخان غاز")}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setNewTechSpecs(prev => 
                                    isChecked ? [...prev, "سخان غاز"] : prev.filter(x => x !== "سخان غاز")
                                  );
                                }}
                                className="accent-brand-orange cursor-pointer w-4 h-4"
                              />
                              <span>🔥 صيانة وإصلاح سخانات الغاز</span>
                            </label>
                          </div>
                        </div>

                        {/* Multi-select active coverage cities */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">المناطق السكنية الموكل تغطيتها بالكامل لهذا الفني (تحديد متعدد) <span className="text-[#f97316]">*</span></label>
                          <p className="text-[10px] text-slate-500 pb-1.5">يقوم النظام تلقائياً بتوجيه واستخلاص صيانة هذه الأجهزة بتلك المناطق وتسريحها لهذا الفني مباشرة</p>
                          
                          <div className="p-4 bg-[#0a0a0c] border border-white/15 max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                            {covAreas.filter(area => area.active).map((area, idx) => {
                              const isSelected = newTechSelectedCities.includes(area.name);
                              return (
                                <label 
                                  key={idx} 
                                  className={`flex items-center gap-2.5 p-2 border transition-all text-xs cursor-pointer select-none font-bold ${
                                    isSelected 
                                      ? "bg-brand-orange/5 border-brand-orange text-brand-orange" 
                                      : "bg-[#111114]/50 border-white/5 hover:border-white/15 text-slate-300"
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setNewTechSelectedCities(prev => 
                                        isChecked ? [...prev, area.name] : prev.filter(c => c !== area.name)
                                      );
                                    }}
                                    className="accent-brand-orange cursor-pointer w-4 h-4 shrink-0"
                                  />
                                  <div className="leading-tight">
                                    <div className="text-[11px]">{area.name}</div>
                                    <div className="text-[8px] text-slate-500 font-sans font-bold">{area.gov}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={() => {
                              if (!newTechName.trim() || !newTechPhone.trim()) {
                                alert("الرجاء كتابة اسم ورقم واتساب فني صحيحين");
                                return;
                              }
                              if (newTechSpecs.length === 0) {
                                alert("يجب إدخال خيار تخصص صيانة أجهزة واحد على الأعل للفني");
                                return;
                              }
                              if (newTechSelectedCities.length === 0) {
                                alert("يجب تحديد وتغطية منطقة سكنية واحدة على الأقل للفني");
                                return;
                              }

                              const formattedPhone = formatEgyptPhone(newTechPhone);
                              const newTech: Technician = {
                                id: Date.now() + Math.floor(Math.random() * 100),
                                name: newTechName.trim(),
                                phone: formattedPhone,
                                city: newTechSelectedCities[0],
                                cities: newTechSelectedCities,
                                specialties: newTechSpecs
                              };

                              const updated = [...technicians, newTech];
                              saveTechniciansToStorage(updated);
                              
                              // Clear inputs
                              setNewTechName("");
                              setNewTechPhone("");
                              setNewTechSelectedCities(["الحوامدية"]);
                              
                              triggerToast(`تمت إضافة الفني (${newTech.name}) وتأمينه بـ ${newTechSelectedCities.length} منطقة صيانة وتخصيصه بنظام التوزيع! ⚡`);
                            }}
                            className="w-full sm:w-auto py-3 px-8 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs transition-colors cursor-pointer"
                          >
                            تأكيد إضافة وتسجيل الفني وجدولة جدول التوزيع الآلي ⚡
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                  {false && (
                    <div className="animate-fadeIn">
                      
                      {/* Active Technicians Geographical Board List */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                        <h4 className="text-white font-black text-sm flex items-center justify-between gap-2">
                          <span>🛠️ لوحة إدارة الفنيين والمسؤوليات التوزيعية</span>
                          <span className="text-[10px] text-slate-400">سجل فنيين لتسريح طلبات الصيانة والمبيعات بمساراتهم ذاتياً</span>
                        </h4>

                        <div className="overflow-x-auto rounded-none border border-white/10">
                          <table className="w-full text-right text-xs table-auto min-w-[500px]">
                            <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                              <tr>
                                <th className="p-3.5">اسم الفني</th>
                                <th className="p-3.5">رقم هاتف الواتس آب لـ التلقي المباشر</th>
                                <th className="p-3.5">المنطقة الجغرافية الموكل إليها</th>
                                <th className="p-3.5 text-center">الأمان والحذف</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {technicians.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-slate-500 text-xs">
                                    لا يوجد فنيين معرفين، جميع طلبات الصيانة والقطع يتم توجيهها تلقائياً إلى رقم المسؤول العام.
                                  </td>
                                </tr>
                              ) : (
                                technicians.map((t) => (
                                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3">
                                      <div className="flex items-center gap-1.5 w-full">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                        <input 
                                          type="text"
                                          value={t.name}
                                          onChange={(e) => {
                                            const updated = technicians.map(x => x.id === t.id ? { ...x, name: e.target.value } : x);
                                            saveTechniciansToStorage(updated);
                                          }}
                                          className="bg-[#0a0a0c] border border-white/10 focus:border-brand-orange p-2 text-xs w-full text-white font-bold outline-none rounded-none transition-all"
                                          placeholder="اسم الفني"
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <input 
                                        type="text"
                                        value={t.phone}
                                        onChange={(e) => {
                                          const updated = technicians.map(x => x.id === t.id ? { ...x, phone: e.target.value } : x);
                                          saveTechniciansToStorage(updated);
                                        }}
                                        className="bg-[#0a0a0c] border border-white/10 focus:border-brand-orange p-2 text-xs w-full text-slate-300 font-mono text-left font-bold outline-none rounded-none transition-all"
                                        dir="ltr"
                                        placeholder="رقم الواتساب"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <select 
                                        value={t.city}
                                        onChange={(e) => {
                                          const updated = technicians.map(x => x.id === t.id ? { ...x, city: e.target.value } : x);
                                          saveTechniciansToStorage(updated);
                                          triggerToast(`تم تحديث منطقة الفني ${t.name} تلقائياً إلى ${e.target.value}`);
                                        }}
                                        className="bg-[#0a0a0c] border border-white/10 focus:border-brand-orange p-2 text-xs text-brand-orange font-black w-full outline-none rounded-none transition-all"
                                      >
                                        {covAreas.map((area, cIdx) => (
                                          <option key={cIdx} value={area.name}>{area.name}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-3 text-center">
                                      {deleteConfirmId === t.id ? (
                                        <div className="flex items-center gap-1.5 justify-center">
                                          <button 
                                            onClick={() => {
                                              const updated = technicians.filter(x => x.id !== t.id);
                                              saveTechniciansToStorage(updated);
                                              setDeleteConfirmId(null);
                                              triggerToast(`تم فصل وإلغاء تثبيت الفني ${t.name} بنجاح`);
                                            }}
                                            className="py-1.5 px-3 rounded-none bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] cursor-pointer transition-all shrink-0"
                                          >
                                            تأكيد الفصل
                                          </button>
                                          <button 
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="py-1.5 px-2 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-[10px] cursor-pointer transition-all shrink-0"
                                          >
                                            إلغاء
                                          </button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setDeleteConfirmId(t.id)}
                                          className="py-1.5 px-2.5 rounded-none bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/15 text-red-400 transition-all text-[11px] cursor-pointer inline-flex items-center gap-1"
                                          title="فصل وإلغاء تعيين الفني"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>فصل الفني</span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Add New Technician Block Form */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                        <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-brand-orange" />
                          <span>إضافة فني جديد لمنظومة التوزيع الآلي للمناطق</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          عند إضافة فني مخصص لمنطقة ما، سيتم تلقائياً إرسال رسائل شراء قطع الغيار أو طلبات صيانة تلك المنطقة بالواتساب إلى رقمه مباشرة، وفي حال عدم وجود فني موكل للمنطقة سيتم التوجيه تلقائياً للمدير العام.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">اسم الفني الثنائي/الكامل</label>
                            <input 
                              type="text"
                              placeholder="مثال: م. سمير إبراهيم"
                              value={newTechName}
                              onChange={(e) => setNewTechName(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">رقم واتس آب الفني (مع كود الدولة دون +)</label>
                            <input 
                              type="text"
                              placeholder="مثال: 201022334455"
                              value={newTechPhone}
                              onChange={(e) => setNewTechPhone(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left font-bold"
                              dir="ltr"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-bold block">منطقة الفني (المدينة/المنطقة)</label>
                            <select 
                              value={newTechCity}
                              onChange={(e) => setNewTechCity(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                            >
                              <option value="" disabled>اختر منطقة الفني</option>
                              {covAreas.map((area, idx) => (
                                <option key={idx} value={area.name}>{area.name} {area.active ? "" : "(موقوفة مؤقتاً)"}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (!newTechName || !newTechPhone) {
                              alert("الرجاء إدخال اسم فني ورقم واتساب صحيحين");
                              return;
                            }
                            const formattedPhone = formatEgyptPhone(newTechPhone);
                            const newTech: Technician = {
                              id: Date.now() + Math.floor(Math.random() * 100),
                              name: newTechName,
                              phone: formattedPhone,
                              city: newTechCity
                            };
                            const updated = [...technicians, newTech];
                            saveTechniciansToStorage(updated);
                            setNewTechName("");
                            setNewTechPhone("");
                            triggerToast(`تمت إضافة الفني ${newTech.name} وتخصيص منطقة ${newTech.city} له بنجاح برقم ${formattedPhone}`);
                          }}
                          className="w-full sm:w-auto py-2.5 px-6 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs transition-colors cursor-pointer"
                        >
                          إضافة الفني وجدولة جدول التوزيع الآلي ⚡
                        </button>
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 4: AREAS MANAGEMENT */}
                  {adminSubTab === "areas" && (
                    <div className="space-y-8 animate-fadeIn">
                      
                      {/* Interactive Geo-Distribution Matrix / Table */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4 font-sans text-right" dir="rtl">
                        <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-white/5 pb-3">
                          <h4 className="text-white font-black text-sm flex items-center gap-1.5">
                            <span className="text-brand-orange">📋</span>
                            <span>جدول توزيع مهام ومناطق الصيانة الفعلي بين الفنيين (دقة جغرافية وتوزيع متعدد)</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">تحكم وراجع التغطية المزدوجة والمشتركة للفنيين لكل مدينة أو قرية بنقرة واحدة</span>
                        </div>

                        <p className="text-xs text-slate-450 leading-relaxed">
                          يوضح الجدول التالي جميع المناطق السكنية المتاحة بالنظام، وحالة تغطيتها، والفنيين المكلفين بها حالياً. يمكنك <strong>إسناد فني إضافي</strong> أو <strong>إلغاء تغطية فني</strong> من أي منطقة مباشرة لتفعيل التوزيع والجدولة التلقائية الذكية.
                        </p>

                        <div className="overflow-x-auto rounded-none border border-white/10">
                          <table className="w-full text-right text-xs table-auto min-w-[650px]">
                            <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                              <tr>
                                <th className="p-3">اسم المنطقة</th>
                                <th className="p-3">المحافظة</th>
                                <th className="p-3">حالة التغطية الحالية</th>
                                <th className="p-3 text-brand-orange">الفنيين المسؤولين (تغطية متعددة)</th>
                                <th className="p-3 text-center">إضافة فني للمنطقة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 font-bold text-slate-300">
                              {covAreas.map((area, areaIdx) => {
                                // Find technicians active in this area (either in city or in cities)
                                const assignedTechsList = technicians.filter(tech => {
                                  const cities = Array.isArray(tech.cities) ? tech.cities : (tech.city ? [tech.city] : []);
                                  return cities.some(c => isCityMatch(c, area.name));
                                });

                                // Find technicians not yet assigned to this area
                                const unassignedTechsList = technicians.filter(tech => {
                                  const cities = Array.isArray(tech.cities) ? tech.cities : (tech.city ? [tech.city] : []);
                                  return !cities.some(c => isCityMatch(c, area.name));
                                });

                                return (
                                  <tr key={areaIdx} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="p-3">
                                      <span className="text-white font-black">{area.name}</span>
                                      {!area.active && <span className="mr-2 text-[9px] bg-red-500/15 text-red-400 px-1 py-0.5 font-bold">مغلقة مؤقتاً</span>}
                                    </td>
                                    <td className="p-3 text-slate-400">{area.gov || "الجيزة"}</td>
                                    <td className="p-3">
                                      {assignedTechsList.length > 0 ? (
                                        <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          مغطاة بالكامل ✓ ({assignedTechsList.length} فنيين)
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                          تحت المتابعة الإدارية (تلقائي المسؤول العام)
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {assignedTechsList.length === 0 ? (
                                        <span className="text-[11px] text-slate-500 font-normal">لا يوجد فنيين حالياً لقريتك/مدينتك</span>
                                      ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                          {assignedTechsList.map(tech => {
                                            const isSelectedForEdit = areasTabEditingTechId === tech.id;
                                            return (
                                              <div 
                                                key={tech.id} 
                                                className={`inline-flex items-center gap-1.5 p-1 px-1.5 text-[10px] border transition-all ${
                                                  isSelectedForEdit 
                                                    ? "bg-brand-orange/20 border-brand-orange text-white" 
                                                    : "bg-[#1c1c22] border-white/10 text-slate-300 hover:border-white/30"
                                                }`}
                                              >
                                                <button
                                                  type="button"
                                                  title="تعديل هذا الفني وتخصيصه فوراً"
                                                  onClick={() => {
                                                    if (isSelectedForEdit) {
                                                      setAreasTabEditingTechId(null);
                                                    } else {
                                                      setAreasTabEditingTechId(tech.id);
                                                      setEditTechName(tech.name);
                                                      setEditTechPhone(tech.phone);
                                                      setEditTechSpecs(tech.specialties || ["بوتجاز", "سخان غاز"]);
                                                      setEditTechCities(tech.cities || [tech.city || "طموة"]);
                                                    }
                                                  }}
                                                  className="hover:text-brand-orange font-bold text-slate-300 mr-0.5 cursor-pointer text-xs"
                                                >
                                                  ✍️
                                                </button>
                                                <span className="text-white">👤 {tech.name}</span>
                                                <button
                                                  type="button"
                                                  title="إلغاء التغطية لهذه المنطقة"
                                                  onClick={() => {
                                                    // Remove area.name from tech's cities
                                                    const currentCities = Array.isArray(tech.cities) ? tech.cities : (tech.city ? [tech.city] : []);
                                                    const updatedCities = currentCities.filter(c => !isCityMatch(c, area.name));
                                                    const updatedTechs = technicians.map(t => t.id === tech.id ? {
                                                      ...t,
                                                      cities: updatedCities,
                                                      city: updatedCities[0] || ""
                                                    } : t);
                                                    saveTechniciansToStorage(updatedTechs);
                                                    triggerToast(`تم إزالة تغطية الفني (${tech.name}) لمنطقة ${area.name}`);
                                                  }}
                                                  className="text-red-450 hover:text-red-500 font-bold mr-1 hover:bg-white/5 w-4 h-4 rounded-none flex items-center justify-center shrink-0 cursor-pointer text-xs"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      {unassignedTechsList.length === 0 ? (
                                        <span className="text-[10px] text-slate-600 font-medium">جميع الفنيين يغطون هذه المنطقة</span>
                                      ) : (
                                        <select
                                          value=""
                                          onChange={(e) => {
                                            const techId = Number(e.target.value);
                                            if (!techId) return;
                                            
                                            const tech = technicians.find(t => t.id === techId);
                                            if (!tech) return;

                                            const currentCities = Array.isArray(tech.cities) ? tech.cities : (tech.city ? [tech.city] : []);
                                            if (!currentCities.some(c => isCityMatch(c, area.name))) {
                                              const updatedCities = [...currentCities, area.name];
                                              const updatedTechs = technicians.map(t => t.id === techId ? {
                                                ...t,
                                                cities: updatedCities,
                                                city: updatedCities[0] || area.name
                                              } : t);
                                              saveTechniciansToStorage(updatedTechs);
                                              triggerToast(`تم إدراج منطقة ${area.name} لتغطية الفني ${tech.name} بنجاح! ⚡`);
                                            }
                                          }}
                                          className="p-1 px-1.5 rounded-none bg-[#0a0a0c] border border-white/15 text-slate-300 text-[10px] sm:w-40 font-bold outline-none focus:border-brand-orange cursor-pointer"
                                        >
                                          <option value="">+ اختر فني للإسناد</option>
                                          {unassignedTechsList.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                          ))}
                                        </select>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Interactive Technician Editing Drawer on Areas Page */}
                        {areasTabEditingTechId !== null && (() => {
                          const techToEdit = technicians.find(t => t.id === areasTabEditingTechId);
                          if (!techToEdit) return null;
                          return (
                            <div className="bg-[#15151a] p-5 rounded-none border border-brand-orange text-right space-y-4 animate-fadeIn mt-4 relative" dir="rtl">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <h4 className="text-white font-black text-sm flex items-center gap-2">
                                  <span className="text-brand-orange text-lg">⚙️</span>
                                  <span>توجيه وتعديل تخصص ومناطق الفني: <strong className="text-brand-orange">{techToEdit.name}</strong></span>
                                </h4>
                                <button 
                                  onClick={() => setAreasTabEditingTechId(null)}
                                  className="text-slate-400 hover:text-white font-bold text-sm bg-white/5 hover:bg-white/10 w-6 h-6 flex items-center justify-center cursor-pointer border border-white/10"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Section 1: Tech Details & Specialties */}
                                <div className="space-y-4 bg-[#0d0d10] p-4 border border-white/5">
                                  <div className="flex items-center gap-2 border-b border-white/5 pb-1.5 label-section">
                                    <span className="text-[11px] text-slate-300 font-black">⚙️ ضبط التخصص والهوية</span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 block font-bold">اسم المهندس/الفني</label>
                                    <input 
                                      type="text"
                                      value={editTechName}
                                      onChange={(e) => setEditTechName(e.target.value)}
                                      className="w-full p-2 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 block font-bold">رقم هاتف الواتساب</label>
                                    <input 
                                      type="text"
                                      value={editTechPhone}
                                      onChange={(e) => setEditTechPhone(e.target.value)}
                                      className="w-full p-2 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans text-left"
                                      dir="ltr"
                                    />
                                  </div>

                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-[10px] text-slate-400 block font-bold">تغيير تخصص الأجهزة <span className="text-brand-orange">*</span></label>
                                    <p className="text-[9px] text-slate-500 pb-1">تحديد الأجهزة التي يحق للفني استلام بلاغات أعطالها لتلقي التوجيه الذكي</p>
                                    <div className="flex flex-col gap-2 p-2.5 bg-[#111114] border border-white/10 rounded-none w-full">
                                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white select-none">
                                        <input 
                                          type="checkbox"
                                          checked={editTechSpecs.includes("بوتجاز")}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setEditTechSpecs(prev => 
                                              isChecked ? [...prev, "بوتجاز"] : prev.filter(x => x !== "بوتجاز")
                                            );
                                          }}
                                          className="accent-brand-orange cursor-pointer w-4 h-4"
                                        />
                                        <span>صيانة بوتجازات 🍳</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white select-none">
                                        <input 
                                          type="checkbox"
                                          checked={editTechSpecs.includes("سخان غاز")}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setEditTechSpecs(prev => 
                                              isChecked ? [...prev, "سخان غاز"] : prev.filter(x => x !== "سخان غاز")
                                            );
                                          }}
                                          className="accent-brand-orange cursor-pointer w-4 h-4"
                                        />
                                        <span>صيانة سخانات غاز 🔥</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 2 & 3: Coverage Cities Checkbox Board */}
                                <div className="md:col-span-2 space-y-3 bg-[#0d0d10] p-4 border border-white/5 flex flex-col justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-baseline justify-between border-b border-white/5 pb-1.5">
                                      <h5 className="text-[11px] text-slate-300 font-black">📍 تعيين وتحديد كتل التغطية الجغرافية للفني ({editTechCities.length} مناطق موكلة إليه)</h5>
                                      <span className="text-[9px] text-brand-orange font-bold font-sans">يمكن تحديد أكثر من منطقة في آن واحد</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed pb-1">
                                      برجاء وضع علامة على جميع المناطق والمحافظات المشمولة في نطاق الخدمة الميدانية المعتمدة لهذا الفني. سيقوم الروبوت بتوجيه أوردرات الصيانة الواردة لهذه المناطق إليه آلياً.
                                    </p>
                                  </div>

                                  <div className="p-3 bg-[#111114] border border-white/10 max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {covAreas.filter(area => area.active).map((area, idx) => {
                                      const isSelected = editTechCities.includes(area.name);
                                      return (
                                        <label 
                                          key={idx} 
                                          className={`flex items-center gap-2.5 p-2 border transition-all text-xs cursor-pointer select-none font-bold ${
                                            isSelected 
                                              ? "bg-brand-orange/10 border-brand-orange text-white" 
                                              : "bg-[#0a0a0c] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                                          }`}
                                        >
                                          <input 
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                              const isChecked = e.target.checked;
                                              setEditTechCities(prev => 
                                                isChecked ? [...prev, area.name] : prev.filter(c => c !== area.name)
                                              );
                                            }}
                                            className="accent-brand-orange cursor-pointer w-3.5 h-3.5"
                                          />
                                          <div className="flex flex-col text-right">
                                            <span>{area.name}</span>
                                            <span className="text-[8px] text-slate-500 font-sans">محافظة {area.gov || "الجيزة"}</span>
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>

                                  <div className="flex gap-2.5 pt-3.5 border-t border-white/5 justify-end">
                                    <button 
                                      onClick={() => {
                                        if (!editTechName.trim() || !editTechPhone.trim()) {
                                          alert("الرجاء إدخال بيانات صحيحة للفني أولاً");
                                          return;
                                        }
                                        if (editTechSpecs.length === 0) {
                                          alert("يجب اختيار تخصص صيانة واحد على الأقل للمهندس");
                                          return;
                                        }
                                        if (editTechCities.length === 0) {
                                          alert("يجب اختيار وتوجيه منطقة سكنية واحدة على الأقل للفني");
                                          return;
                                        }

                                        const formattedPhone = formatEgyptPhone(editTechPhone);
                                        const updatedTechs = technicians.map(t => t.id === areasTabEditingTechId ? {
                                          ...t,
                                          name: editTechName.trim(),
                                          phone: formattedPhone,
                                          city: editTechCities[0],
                                          cities: editTechCities,
                                          specialties: editTechSpecs
                                        } : t);

                                        saveTechniciansToStorage(updatedTechs);
                                        setAreasTabEditingTechId(null);
                                        triggerToast(`✓ تم تحديث تخصص الفني (${editTechName}) وتوجيهه لـ ${editTechCities.length} مناطق تغطية بنجاح!`);
                                      }}
                                      className="py-2 px-5 bg-brand-orange hover:bg-brand-orange-dark text-black text-[11px] font-black transition-all cursor-pointer rounded-none border border-transparent shadow font-sans"
                                    >
                                      حفظ التعديلات والتوجيه المزدوج 💾
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setAreasTabEditingTechId(null)}
                                      className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-all cursor-pointer rounded-none border border-white/5 font-sans"
                                    >
                                      إلغاء التعديل
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Active Areas Geographical Control Board */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4 font-sans">
                        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 border-b border-white/5 pb-3">
                          <h4 className="text-white font-black text-sm">📍 لوحة التحكم بنشاط نطاق الخدمات وقفل/فتح التغطية</h4>
                          <span className="text-[10px] text-slate-400">تحكم بوقف أو تفعيل استقبال طلبات الصيانة والمبيعات بقرى ومراكز الجيزة</span>
                        </div>

                        <div className="overflow-x-auto rounded-none border border-white/10">
                          <table className="w-full text-right text-xs table-auto min-w-[500px]">
                            <thead className="bg-[#0a0a0c] text-slate-400 font-bold text-[10px]">
                              <tr>
                                <th className="p-3.5 font-bold">اسم المنطقة / المركز السكني</th>
                                <th className="p-3.5 text-center font-bold">حالة الخدمة وتلقي الطلبات</th>
                                <th className="p-3.5 text-center font-bold">التحكم والخيارات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 font-bold text-slate-300">
                              {covAreas.map((area, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-3 font-bold text-white">
                                    <input 
                                      type="text"
                                      value={area.name}
                                      onChange={(e) => {
                                        const updated = covAreas.map((x, i) => i === idx ? { ...x, name: e.target.value } : x);
                                        saveCovAreasToStorage(updated);
                                      }}
                                      className="bg-transparent border-0 border-b border-white/10 focus:border-brand-orange outline-none p-1 text-xs w-full text-white font-bold"
                                      placeholder="اسم المنطقة"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <button 
                                      onClick={() => {
                                        const updated = covAreas.map((x, i) => i === idx ? { ...x, active: !x.active } : x);
                                        saveCovAreasToStorage(updated);
                                        triggerToast(updated[idx].active ? `تم تفعيل الخدمة واستقبال الطلبات في ${area.name}` : `تم إيقاف الخدمة وتعطيل الطلبات في ${area.name}`);
                                      }}
                                      className={`px-4 py-1.5 font-bold text-[10px] uppercase transition-all rounded-none border leading-none cursor-pointer ${
                                        area.active 
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                                          : "bg-red-500/10 border-red-500/25 text-red-100 line-through hover:bg-red-500/20"
                                      }`}
                                    >
                                      {area.active ? "● مغطاة ونشطة (مفتوحة)" : "○ موقوفة مؤقتاً (مغلقة)"}
                                    </button>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button 
                                      onClick={() => {
                                        setCustomConfirm({
                                          show: true,
                                          title: "حذف منطقة جغرافية",
                                          message: `هل أنت متأكد من حذف المنطقة السكنية (${area.name}) نهائياً من قائمة الفروع بالمنظومة؟ سيؤثر هذا فوراً على خيارات التغطية المعروضة للعملاء والفنيين.`,
                                          onConfirm: () => {
                                            const updated = covAreas.filter((_, i) => i !== idx);
                                            saveCovAreasToStorage(updated);
                                            triggerToast("تم حذف وإزالة المنطقة بنجاح 🗑️");
                                            setCustomConfirm(null);
                                          }
                                        });
                                      }}
                                      className="p-1.5 rounded-none bg-red-500/10 border border-red-500/15 hover:bg-red-500 hover:text-white text-red-400 transition-all cursor-pointer inline-flex items-center justify-center mx-auto"
                                      title="حذف المنطقة نهائياً"
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

                      {/* Add New Area Block Form */}
                      <div className="bg-[#111114] p-5 rounded-none border border-white/10 space-y-4">
                        <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-brand-orange" />
                          <span>إضافة منطقة تغطية جديدة بالنظام الجغرافي</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-2xl text-right">
                          <div className="space-y-1.5 w-full">
                            <label className="text-xs text-slate-400 font-bold block">المحافظة التابع لها المنطقة</label>
                            <select 
                              value={newAreaGov}
                              onChange={(e) => setNewAreaGov(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                            >
                              {Object.keys(egyptData).map((govName) => (
                                <option key={govName} value={govName}>{govName}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5 w-full">
                            <label className="text-xs text-slate-400 font-bold block">اسم الحي / المدينة / المنطقة الجديدة</label>
                            <input 
                              type="text"
                              placeholder="مثال: منشأة دهشور، العياط، الحوامدية..."
                              value={newAreaName}
                              onChange={(e) => setNewAreaName(e.target.value)}
                              className="w-full p-2.5 rounded-none bg-[#0a0a0c] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans"
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              if (!newAreaName.trim()) {
                                alert("الرجاء كتابة اسم المنطقة بشكل صحيح أولاً");
                                return;
                              }
                              
                              if (covAreas.some(x => x.name.trim() === newAreaName.trim())) {
                                alert("هذه المنطقة مضافة بالفعل بالمنظومة");
                                return;
                              }

                              const updated = [...covAreas, { name: newAreaName.trim(), active: true, gov: newAreaGov }];
                              saveCovAreasToStorage(updated);
                              setNewAreaName("");
                              triggerToast(`تمت إضافة المنطقة الجديدة (${newAreaName}) التابعة لمحافظة ${newAreaGov} وتفعيل تغطيتها!`);
                            }}
                            className="w-full py-2.5 px-6 rounded-none bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs transition-colors cursor-pointer block text-center"
                          >
                            تأكيد إضافة المنطقة نشطة ⚡
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input 
                        type="tel"
                        placeholder="رقم هاتفك للتواصل *"
                        value={checkPhone}
                        onChange={(e) => setCheckPhone(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange text-left font-bold"
                        dir="ltr"
                      />
                        <select 
                          value={checkCity}
                          onChange={(e) => setCheckCity(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-none bg-[#111114] border border-white/15 text-white text-xs outline-none focus:border-brand-orange font-bold font-sans animate-fadeIn"
                        >
                          <option value="" disabled>اختر منطقتك السكنية</option>
                          {covAreas.filter(a => a.active).map((area, idx) => (
                            <option key={idx} value={area.name}>{area.name}</option>
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
                    disabled={isCheckingOut || !checkName || !checkPhone || !checkAddr}
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
              setAdminError("");
              setActiveTab("admin");
              window.scrollTo(0, 0);
              setTimeout(() => {
                const input = document.getElementById("admin-password-input");
                if (input) {
                  input.focus();
                }
              }, 100);
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

      {/* CUSTOM CONFIRMATION DIALOG MODAL (Saves us from blocked window.confirm inside iframe) */}
      <AnimatePresence>
        {customConfirm && customConfirm.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0e0e12] border border-red-500/30 p-6 text-right relative shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-white font-black text-sm">{customConfirm.title}</h3>
              </div>
              <p className="text-xs text-slate-300 font-bold leading-relaxed mb-6">
                {customConfirm.message}
              </p>
              <div className="flex flex-row-reverse gap-3">
                <button 
                  type="button"
                  onClick={() => customConfirm.onConfirm()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-none cursor-pointer transition-colors"
                >
                  نعم، تأكيد الحذف 🗑️
                </button>
                <button 
                  type="button"
                  onClick={() => setCustomConfirm(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold text-xs rounded-none cursor-pointer transition-colors"
                >
                  تراجع وإلغاء ❌
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM ALERT DIALOG MODAL (Saves us from blocked window.alert inside iframe) */}
      <AnimatePresence>
        {customAlert && customAlert.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0e0e12] border border-brand-orange/30 p-6 text-right relative shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-white font-black text-sm">تنبيه من تك فيكس</h3>
              </div>
              <p className="text-xs text-slate-300 font-bold leading-relaxed mb-6">
                {customAlert.message}
              </p>
              <div className="flex flex-row-reverse">
                <button 
                  type="button"
                  onClick={() => setCustomAlert(null)}
                  className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-black font-black text-xs rounded-none cursor-pointer transition-colors"
                >
                  حسناً 🎯
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
