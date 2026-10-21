"use client";

import React from "react";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
  title?: string;
}

export function VerifiedBadge({
  size = "sm",
  label,
  className = "",
  title = "Verified Identity",
}: VerifiedBadgeProps) {
  const sizeMap = {
    xs: { icon: "w-3.5 h-3.5", text: "text-[10px]" },
    sm: { icon: "w-4 h-4", text: "text-xs" },
    md: { icon: "w-4.5 h-4.5", text: "text-xs" },
    lg: { icon: "w-5.5 h-5.5", text: "text-sm" },
  };

  const current = sizeMap[size];

  return (
    <span
      className={`inline-flex items-center gap-1 select-none shrink-0 ${className}`}
      title={title}
    >
      {/* Authentic Instagram/Meta Scalloped Rosette Verified SVG */}
      <svg
        viewBox="0 0 24 24"
        aria-label="Verified"
        className={`${current.icon} shrink-0 drop-shadow-2xs`}
      >
        <path
          d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"
          fill="#0095F6"
        />
        <path
          d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 6.3-6.3 1.4 1.4z"
          fill="#FFFFFF"
        />
      </svg>
      {label && (
        <span className={`${current.text} font-semibold text-sky-700`}>
          {label}
        </span>
      )}
    </span>
  );
}
