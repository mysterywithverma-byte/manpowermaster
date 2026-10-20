"use client";

import React from "react";

interface TextLogoProps {
  className?: string;
  showEmblem?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TextLogo({
  className = "",
  showEmblem = true,
  size = "md",
}: TextLogoProps) {
  const sizeClasses = {
    sm: {
      text: "text-lg sm:text-xl",
      emblem: "w-7 h-7 sm:w-8 sm:h-8",
    },
    md: {
      text: "text-lg sm:text-2xl",
      emblem: "w-8 h-8 sm:w-9 sm:h-9",
    },
    lg: {
      text: "text-2xl sm:text-3xl md:text-4xl",
      emblem: "w-10 h-10 sm:w-12 sm:h-12",
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Circular DP Emblem */}
      {showEmblem && (
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/company-profile.jpeg"
            alt="Manpower Master"
            className={`${sizeClasses.emblem} rounded-full object-cover border-2 border-orange-600/80 shadow-xs`}
          />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
          </span>
        </div>
      )}

      {/* Clean Corporate Brand Wordmark (No .com, No GST/Address clutter in nav) */}
      <div className="flex items-baseline tracking-tight font-black leading-none">
        <span className={`tracking-tight text-slate-900 ${sizeClasses.text} font-black`}>
          manpower
        </span>
        <span className={`tracking-tight text-orange-600 ${sizeClasses.text} font-black ml-0.5`}>
          master
        </span>
      </div>
    </div>
  );
}
