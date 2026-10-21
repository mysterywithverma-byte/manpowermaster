"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Navigation,
  Globe,
  ChevronDown,
  X,
  Briefcase,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  onSearch: () => void;
  onTagClick: (tag: string) => void;
  totalJobsCount: number;
}

const DEFAULT_POPULAR_CITIES = [
  "All Locations",
  "Bengaluru, Karnataka",
  "Delhi, NCR",
  "Noida, Uttar Pradesh",
  "Gurugram, Haryana",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Remote (Work from Home, India)",
];

const POPULAR_SEARCH_TAGS = [
  "Remote (WFH)",
  "Immediate Joiner",
  "Software Engineer",
  "Accountant",
  "Sales Manager",
  "Data Analyst",
  "Graphic Designer",
  "HR Recruiter",
];

export function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  onSearch,
  onTagClick,
  totalJobsCount,
}: HeroSectionProps) {
  const [locationInput, setLocationInput] = useState(selectedLocation || "");
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_POPULAR_CITIES);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocationInput(selectedLocation);
  }, [selectedLocation]);

  // Click outside listener for location dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: string) => {
    setLocationInput(loc);
    setSelectedLocation(loc === "All Locations" ? "All" : loc);
    setShowLocationDropdown(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/locations?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
          );
          const data = await res.json();
          if (data.city) {
            handleSelectLocation(data.city);
          }
        } catch {
          handleSelectLocation("Delhi, NCR");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60 border-b border-slate-200/80 pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/90 text-orange-800 text-xs font-bold mb-4 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
          <span>India&apos;s Verified Direct Hiring &amp; Placement Network</span>
        </div>

        {/* Clean Hero Headline (Naukri Pattern) */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2.5">
          Find your dream job now
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto mb-8">
          <strong className="text-slate-900 font-bold">{totalJobsCount > 0 ? totalJobsCount : 1200}+ verified openings</strong> from top corporate employers across India with transparent CTC in ₹ LPA.
        </p>

        {/* Unified Search Capsule (Iconic Naukri Search Bar) */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-full border border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2 sm:p-2.5 transition-all focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 text-left"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
            {/* Field 1: Designation / Skills / Company */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2 sm:py-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter designation / skills / company"
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-1"></div>

            {/* Field 2: Location Selector with Dropdown */}
            <div className="relative sm:w-64" ref={dropdownRef}>
              <div
                className="flex items-center gap-2.5 px-3 py-2 sm:py-1 cursor-pointer"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="Enter location"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium truncate cursor-pointer"
                />
                {locationInput ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLocation("");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Floating Location Dropdown Suggestions */}
              {showLocationDropdown && (
                <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-left max-h-72 overflow-y-auto animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 rounded-xl transition-colors border-b border-slate-100 mb-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-orange-600" />
                    <span>{detectingLocation ? "Detecting location..." : "Use Current Location"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLocation("Remote")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border-b border-slate-100 mb-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pan-India Remote Roles</span>
                  </button>

                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Popular Hubs
                  </div>

                  {DEFAULT_POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectLocation(city)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left transition-colors font-medium ${
                        locationInput.toLowerCase() === city.toLowerCase()
                          ? "bg-orange-50 text-orange-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field 3: Search Action Button */}
            <div className="p-1 sm:p-0 sm:pl-2 shrink-0">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Jobs</span>
              </button>
            </div>
          </div>
        </form>

        {/* Popular Trending Roles Quick Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-bold text-slate-600 text-[11px] pr-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-600" /> Popular Searches:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="px-3 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Metrics Ticker Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-slate-200/80 max-w-4xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <span>{totalJobsCount > 0 ? totalJobsCount : 1240}+</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-extrabold border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Verified Corporate Jobs</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black text-orange-600">₹42 LPA</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Highest Tech Package</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>24-48 Hrs</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Direct Recruiter SLA</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>100% Free</span>
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Zero Placement Charges</div>
          </div>
        </div>
      </div>
    </section>
  );
}
