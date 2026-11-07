"use client";

import React from "react";
import {
  PhoneCall,
  Laptop,
  Bike,
  Briefcase,
  Calculator,
  UtensilsCrossed,
  Car,
  Shield,
  ShoppingBag,
  Building,
  Zap,
  HeartPulse,
  Package,
  Palette,
  Code,
  Home,
} from "lucide-react";

interface WorkIndiaCategoryGridProps {
  onSelectCategory: (role: string) => void;
  selectedCategory?: string;
  isHindi?: boolean;
}

const CATEGORIES = [
  {
    id: "Telecaller",
    titleEn: "Telecaller / BPO",
    titleHi: "टेलीकॉलर / BPO",
    openings: "3,400+ Jobs",
    icon: PhoneCall,
    bgColor: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "Back Office",
    titleEn: "Back Office / Data Entry",
    titleHi: "बैक ऑफिस / डाटा एंट्री",
    openings: "2,850+ Jobs",
    icon: Laptop,
    bgColor: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  {
    id: "Delivery",
    titleEn: "Delivery Partner",
    titleHi: "डिलीवरी पार्टनर",
    openings: "4,120+ Jobs",
    icon: Bike,
    bgColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: "Sales",
    titleEn: "Field Sales / Marketing",
    titleHi: "फील्ड सेल्स / मार्केटिंग",
    openings: "2,300+ Jobs",
    icon: Briefcase,
    bgColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: "Accountant",
    titleEn: "Accounts & Tally GST",
    titleHi: "अकाउंटेंट / टैली",
    openings: "1,240+ Jobs",
    icon: Calculator,
    bgColor: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "Cook",
    titleEn: "Cook & Chef",
    titleHi: "कुक / शेफ",
    openings: "940+ Jobs",
    icon: UtensilsCrossed,
    bgColor: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    id: "Driver",
    titleEn: "Driver (Car / Auto)",
    titleHi: "ड्राइवर (कार / ऑटो)",
    openings: "1,180+ Jobs",
    icon: Car,
    bgColor: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  {
    id: "Security",
    titleEn: "Security Guard",
    titleHi: "सिक्योरिटी गार्ड",
    openings: "890+ Jobs",
    icon: Shield,
    bgColor: "bg-slate-50 text-slate-700 border-slate-200",
  },
  {
    id: "Retail",
    titleEn: "Retail & Counter Sales",
    titleHi: "काउंटर सेल्स / स्टोर",
    openings: "1,450+ Jobs",
    icon: ShoppingBag,
    bgColor: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    id: "Receptionist",
    titleEn: "Receptionist / Front Desk",
    titleHi: "रिसेप्शनिस्ट",
    openings: "760+ Jobs",
    icon: Building,
    bgColor: "bg-teal-50 text-teal-600 border-teal-200",
  },
  {
    id: "Electrician",
    titleEn: "Electrician & Technician",
    titleHi: "इलेक्ट्रीशियन / तकनीशियन",
    openings: "620+ Jobs",
    icon: Zap,
    bgColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    id: "Nurse",
    titleEn: "Nurse & Healthcare",
    titleHi: "नर्स / स्वास्थ्य सेवा",
    openings: "510+ Jobs",
    icon: HeartPulse,
    bgColor: "bg-red-50 text-red-600 border-red-200",
  },
  {
    id: "Warehouse",
    titleEn: "Warehouse & Logistics",
    titleHi: "वेयरहाउस / लॉजिस्टिक्स",
    openings: "980+ Jobs",
    icon: Package,
    bgColor: "bg-lime-50 text-lime-700 border-lime-200",
  },
  {
    id: "Graphic Designer",
    titleEn: "Graphic Designer",
    titleHi: "ग्राफिक डिजाइनर",
    openings: "670+ Jobs",
    icon: Palette,
    bgColor: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  },
  {
    id: "Software",
    titleEn: "Software & IT Support",
    titleHi: "सॉफ्टवेयर / IT सपोर्ट",
    openings: "1,550+ Jobs",
    icon: Code,
    bgColor: "bg-sky-50 text-sky-600 border-sky-200",
  },
  {
    id: "Housekeeping",
    titleEn: "Housekeeping / Maid",
    titleHi: "हाउसकीपिंग / मेड",
    openings: "430+ Jobs",
    icon: Home,
    bgColor: "bg-stone-50 text-stone-700 border-stone-200",
  },
];

export default function WorkIndiaCategoryGrid({
  onSelectCategory,
  selectedCategory,
  isHindi = false,
}: WorkIndiaCategoryGridProps) {
  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {isHindi ? "पॉपुलर जॉब श्रेणियां (Direct HR Call)" : "Explore Top Job Categories in Your City"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHindi
                ? "सीधे कंपनी के HR से बात करें और 24 घंटे में नौकरी पाएं"
                : "Verified direct company openings with instant phone & WhatsApp connect"}
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            50,000+ Active Roles
          </span>
        </div>

        {/* Categories Grid (4x4 on desktop, scrollable on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory?.toLowerCase() === cat.id.toLowerCase();

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? "bg-white border-orange-600 shadow-md ring-2 ring-orange-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 border transition-transform group-hover:scale-105 ${cat.bgColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-1">
                    {isHindi ? cat.titleHi : cat.titleEn}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    {cat.openings}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

