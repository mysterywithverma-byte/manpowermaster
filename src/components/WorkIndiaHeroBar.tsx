"use client";

import React from "react";
import { ShieldCheck, PhoneCall, CheckCircle2, Globe, Users } from "lucide-react";

interface WorkIndiaHeroBarProps {
  isHindi: boolean;
  onToggleLanguage: () => void;
  onOpenEmployerPosting: () => void;
}

export default function WorkIndiaHeroBar({
  isHindi,
  onToggleLanguage,
  onOpenEmployerPosting,
}: WorkIndiaHeroBarProps) {
  return (
    <div className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-sm border-b border-orange-500">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Value Proposition */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-center sm:text-left justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black uppercase tracking-wider text-white border border-white/30">
            <PhoneCall className="w-3 h-3 text-amber-200" />
            {isHindi ? "सीधा HR को कॉल करें" : "Direct HR Call"}
          </span>
          <span className="font-bold text-white text-xs sm:text-sm">
            {isHindi
              ? "100% फ्री नौकरियां • कोई कंसल्टेंसी नहीं • डायरेक्ट इंटरव्यू"
              : "100% Free Jobs • Zero Consultancy • Direct Interview in 24 Hours"}
          </span>
        </div>

        {/* Right: Language Switcher & Post Job CTA */}
        <div className="flex items-center gap-3">
          {/* Bilingual Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/35 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
            title="Toggle English / हिंदी"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHindi ? "English" : "हिंदी"}</span>
          </button>

          {/* Quick Employer Post Job Link */}
          <button
            type="button"
            onClick={onOpenEmployerPosting}
            className="px-3 py-1 rounded-lg bg-white text-orange-700 hover:bg-orange-50 font-black text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isHindi ? "कंपनी हैं? फ्री जॉब पोस्ट करें" : "Employers: Post Job Free"}
          </button>
        </div>
      </div>
    </div>
  );
}
