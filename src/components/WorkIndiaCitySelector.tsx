"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface WorkIndiaCitySelectorProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isHindi?: boolean;
}

const POPULAR_CITIES = [
  { id: "All", en: "All India", hi: "पूरा भारत" },
  { id: "Delhi", en: "Delhi NCR", hi: "दिल्ली एनसीआर" },
  { id: "Mumbai", en: "Mumbai", hi: "मुंबई" },
  { id: "Bengaluru", en: "Bengaluru", hi: "बेंगलुरु" },
  { id: "Pune", en: "Pune", hi: "पुणे" },
  { id: "Hyderabad", en: "Hyderabad", hi: "हैदराबाद" },
  { id: "Chennai", en: "Chennai", hi: "चेन्नई" },
  { id: "Kolkata", en: "Kolkata", hi: "कोलकाता" },
  { id: "Ahmedabad", en: "Ahmedabad", hi: "अहमदाबाद" },
  { id: "Surat", en: "Surat", hi: "सूरत" },
  { id: "Jaipur", en: "Jaipur", hi: "जयपुर" },
  { id: "Lucknow", en: "Lucknow", hi: "लखनऊ" },
  { id: "Kanpur", en: "Kanpur", hi: "कानपुर" },
  { id: "Indore", en: "Indore", hi: "इंदौर" },
  { id: "Chandigarh", en: "Chandigarh", hi: "चंडीगढ़" },
  { id: "Jalandhar", en: "Jalandhar", hi: "जालंधर" },
];

export default function WorkIndiaCitySelector({
  selectedCity,
  onSelectCity,
  isHindi = false,
}: WorkIndiaCitySelectorProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>{isHindi ? "शहर चुनें:" : "Select City:"}</span>
        </span>

        {POPULAR_CITIES.map((city) => {
          const isSelected =
            (city.id === "All" && (!selectedCity || selectedCity === "All")) ||
            selectedCity.toLowerCase() === city.id.toLowerCase();

          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectCity(city.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-orange-600 text-white shadow-xs font-bold ring-2 ring-orange-500/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              {isHindi ? city.hi : city.en}
            </button>
          );
        })}
      </div>
    </div>
  );
}

