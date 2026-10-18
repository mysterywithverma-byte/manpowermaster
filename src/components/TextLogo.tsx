"use client";

import React from "react";

interface TextLogoProps {
  className?: string;
  showBadge?: boolean;
  showDomain?: boolean;
  showEmblem?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TextLogo({
  className = "",
  showBadge = true,
  showDomain = true,
  showEmblem = true,
  size = "md",
}: TextLogoProps) {
  const sizeClasses = {
    sm: {
      text: "text-lg sm:text-xl",
      emblem: "w-7 h-7",
      sub: "text-[9px]",
      domain: "text-[10px]",
    },
    md: {
      text: "text-xl sm:text-2xl",
      emblem: "w-9 h-9",
      sub: "text-[10px]",
      domain: "text-xs",
    },
    lg: {
      text: "text-2xl sm:text-3xl md:text-4xl",
      emblem: "w-12 h-12",
      sub: "text-xs",
      domain: "text-sm",
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Circular DP Emblem */}
      {showEmblem && (
        <div className="relative shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/company-profile.jpeg"
            alt="Manpower Master DP"
            className={`${sizeClasses.emblem} rounded-full object-cover border-2 border-orange-600/80 shadow-xs transition-transform group-hover:scale-105`}
          />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
      )}

      {/* Indeed-Style Precision Typographic Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline tracking-tight font-black leading-none">
          <span className={`tracking-tight text-slate-900 ${sizeClasses.text} font-black`}>
            manpower
          </span>
          <span className={`tracking-tight text-orange-600 ${sizeClasses.text} font-black ml-0.5`}>
            master
          </span>
          {showDomain && (
            <span className={`font-black text-slate-400 ml-1 ${sizeClasses.domain} tracking-normal`}>
              .com
            </span>
          )}
        </div>

        {showBadge && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`${sizeClasses.sub} text-slate-500 font-bold tracking-tight`}>
              Govt. GSTIN Regd. • Jalandhar, Punjab
            </span>
            <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </div>
  );
}
