/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { Part, CartItem, PartCategory } from "../types";

interface PartsStoreProps {
  parts: Part[];
  cart: CartItem[];
  onAddToCart: (partId: number) => void;
  onUpdateQty: (partId: number, delta: number) => void;
  onOpenCart: () => void;
}

export default function PartsStore({
  parts,
  cart,
  onAddToCart,
  onUpdateQty,
  onOpenCart,
}: PartsStoreProps) {
  const [partsFilter, setPartsFilter] = useState<PartCategory | "all">("all");

  const filteredParts = parts.filter(
    p => p.avail && (partsFilter === "all" || p.cat === partsFilter)
  );

  return (
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
          تصفح واشترِ قطع غيار السخانات والبوتجازات الأصلية بجميع المقاسات وبسعر معقول.
        </p>
      </div>

      {/* Filtering Controls */}
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
        {filteredParts.map((item) => {
          const cartItemInstance = cart.find(i => i.id === item.id);
          const qty = cartItemInstance?.qty || 0;

          return (
            <div 
              key={item.id}
              className="bg-[#111114] rounded-none overflow-hidden border border-white/10 hover:border-brand-orange/45 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Section */}
              <div className="relative cursor-zoom-in overflow-hidden group/img">
                <div className="w-full h-44 bg-[#1b1b1f] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-300">
                  {item.img ? (
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                      onError={(e) => {
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
              </div>

              {/* Content */}
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

                  {/* Cart Controls */}
                  <div>
                    {qty > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[#1b1b1f] rounded-none p-1.5 border border-white/10">
                          <button 
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-8 h-8 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-white text-sm">{qty}</span>
                          <button 
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-8 h-8 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all text-sm font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={onOpenCart}
                          className="w-full py-2.5 px-4 rounded-none bg-brand-orange text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-brand-orange-dark"
                        >
                          <span>🛒 عرض السلة ودفع الطلب ({qty})</span>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onAddToCart(item.id)}
                        className="w-full py-2.5 px-4 rounded-none bg-[#1b1b1f] border border-white/10 hover:border-brand-orange hover:bg-brand-orange/5 text-slate-200 hover:text-brand-orange text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
  );
}
