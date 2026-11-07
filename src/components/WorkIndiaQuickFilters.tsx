"use client";

import React from "react";
import { Zap, GraduationCap, Home, Heart, Moon, Clock, Bike, Laptop } from "lucide-react";

interface WorkIndiaQuickFiltersProps {
  onQuickFilter: (key: string, value: string) => void;
  activeFilter?: string;
  isHindi?: boolean;
}

const QUICK_FILTERS = [
  { id: "fresher", labelEn: "Freshers Welcome", labelHi: "फ्रेशर जॉब्स", icon: Zap, key: "experienceLevel", value: "Entry-Level" },
  { id: "10th_pass", labelEn: "10th / 12th Pass", labelHi: "10वीं / 12वीं पास", icon: GraduationCap, key: "search", value: "12th Pass" },
  { id: "wfh", labelEn: "Work From Home (WFH)", labelHi: "घर बैठे काम (WFH)", icon: Home, key: "workplaceType", value: "Remote" },
  { id: "female", labelEn: "Female Preferred", labelHi: "महिला स्पेशल", icon: Heart, key: "search", value: "Female" },
  { id: "night_shift", labelEn: "Night Shift", labelHi: "नाईट शिफ्ट", icon: Moon, key: "search", value: "Night Shift" },
  { id: "part_time", labelEn: "Part Time", labelHi: "पार्ट टाइम", icon: Clock, key: "jobType", value: "Part-time" },
  { id: "with_bike", labelEn: "Jobs with Bike", labelHi: "बाइक वाले जॉब्स", icon: Bike, key: "search", value: "Bike" },
  { id: "with_laptop", labelEn: "Computer / Laptop", labelHi: "लैपटॉप जॉब्स", icon: Laptop, key: "search", value: "Computer" },
];

export default function WorkIndiaQuickFilters({
  onQuickFilter,
  activeFilter,
  isHindi = false,
}: WorkIndiaQuickFiltersProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          {isHindi ? "त्वरित फ़िल्टर:" : "Quick Filter:"}
        </span>

        {QUICK_FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onQuickFilter(f.key, f.value)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-orange-600" />
              <span>{isHindi ? f.labelHi : f.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

