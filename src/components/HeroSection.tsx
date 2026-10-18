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

const TRENDING_ROLES = [
  "Software Engineer",
  "Data Analyst",
  "Sales Manager",
  "Graphic Designer",
  "Accountant",
  "HR Recruiter",
  "Remote (WFH)",
  "Immediate Joiner",
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
  // Location Autocomplete states
  const [locationInput, setLocationInput] = useState(selectedLocation || "");
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_POPULAR_CITIES);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize when selectedLocation changes from outside
  useEffect(() => {
    setLocationInput(selectedLocation);
  }, [selectedLocation]);

  // Fetch location suggestions as user types
  useEffect(() => {
    let active = true;

    async function fetchSuggestions() {
      if (!locationInput.trim()) {
        setSuggestions(DEFAULT_POPULAR_CITIES);
        return;
      }

      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(locationInput.trim())}`);
        const data = await res.json();
        if (active && data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // Fallback to local filter
        if (active) {
          const filtered = DEFAULT_POPULAR_CITIES.filter((c) =>
            c.toLowerCase().includes(locationInput.toLowerCase())
          );
          setSuggestions(filtered);
        }
      }
    }

    const timer = setTimeout(fetchSuggestions, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [locationInput]);

  // Close dropdown on outside click
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
    const finalVal = loc === "All Locations" ? "" : loc;
    setLocationInput(finalVal);
    setSelectedLocation(finalVal);
    setShowLocationDropdown(false);
    setTimeout(onSearch, 50);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            "Delhi, NCR";
          const state = data.address?.state || "India";
          const formatted = `${city}, ${state}`;
          handleSelectLocation(formatted);
        } catch {
          handleSelectLocation("Delhi, NCR");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        handleSelectLocation("Bengaluru, Karnataka");
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLocationDropdown(false);
    onSearch();
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-8 md:pt-10 md:pb-14 bg-gradient-to-b from-orange-50/50 via-white to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading, Subtitle & Unified Search (Naukri Style) */}
          <div className="lg:col-span-7 text-left">
            {/* Clean Trust Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-800 mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Verified Direct Career &amp; Staffing Portal</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
              Find Your Dream Job with{" "}
              <span className="text-orange-600">
                Manpower Master
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-6 font-normal leading-relaxed">
              5,000+ verified direct openings across Accounts, Sales, Tech &amp; Remote roles with transparent CTC in <strong className="text-orange-700 font-bold">₹ LPA</strong>.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSubmit}
              className="relative p-1.5 rounded-2xl bg-white border border-slate-300 shadow-md shadow-orange-950/5 transition-all focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-600/10 mb-4"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Job Title / Keyword Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2">
                  <Search className="w-4 h-4 text-orange-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter skills / designations / companies..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>

                <div className="hidden sm:block w-[1px] h-6 bg-slate-200"></div>

                {/* Location Input with Autocomplete */}
                <div className="relative sm:w-56" ref={dropdownRef}>
                  <div
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 sm:bg-transparent rounded-xl border sm:border-0 border-slate-200 cursor-text"
                    onClick={() => setShowLocationDropdown(true)}
                  >
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="Location or City..."
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-semibold truncate"
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

                  {/* Floating Dropdown Suggestions */}
                  {showLocationDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-left max-h-72 overflow-y-auto animate-in fade-in duration-100">
                      {/* Current Location Option */}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 rounded-xl transition-colors border-b border-slate-100 mb-1"
                      >
                        <Navigation className="w-3.5 h-3.5 text-orange-600" />
                        <span>
                          {detectingLocation ? "Detecting location..." : "Use Current Location"}
                        </span>
                      </button>

                      {/* Remote Option */}
                      <button
                        type="button"
                        onClick={() => handleSelectLocation("Remote")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border-b border-slate-100 mb-1"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pan-India Remote Roles</span>
                      </button>

                      <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Suggested Locations
                      </div>

                      {suggestions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-500">
                          No matching city found.
                        </div>
                      ) : (
                        suggestions.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleSelectLocation(city)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left transition-colors font-medium ${
                              locationInput.toLowerCase() === city.toLowerCase()
                                ? "bg-orange-50 text-orange-700 font-bold"
                                : "text-slate-700 hover:bg-orange-50/60 hover:text-slate-900"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{city}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Sleek Search Button */}
                <button
                  type="submit"
                  className="sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular Roles Quick Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" /> Popular:
              </span>
              {TRENDING_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onTagClick(role)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Vector Illustration Showcase (Naukri Pattern) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative">
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm w-full max-w-sm text-center">
              {/* Illustration */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/hero-search.png"
                alt="Find your next career move"
                className="max-h-56 w-auto mx-auto object-contain"
              />

              {/* Floating Trust Pills */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-left">
                <div>
                  <div className="text-xs font-bold text-slate-900">Direct Recruiter Hiring</div>
                  <div className="text-[10px] text-slate-500">Govt GST Regd (03IPTPB9968A1ZJ)</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  Active SLA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-200 max-w-4xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <span>{totalJobsCount > 0 ? totalJobsCount : 1240}+</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-extrabold border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Verified Indian Jobs</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-orange-600">₹42 LPA</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Avg Senior Package</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>24-48 Hrs</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Direct Recruiter SLA</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>100% Free</span>
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Zero Seeker Charges</div>
          </div>
        </div>
      </div>
    </section>
  );
}
