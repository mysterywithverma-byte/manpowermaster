"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw, IndianRupee, MapPin, Hash, Check } from "lucide-react";

interface FilterState {
  search: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  workplaceType: string;
  minSalary: number;
}

interface JobFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  resultsCount: number;
}

const JOB_TYPES = ["All", "Full-time", "Contract", "Internship", "Part-time"];
const EXPERIENCE_LEVELS = ["All", "Fresher", "Mid-Level", "Senior", "Lead"];
const WORKPLACE_TYPES = ["All", "Remote", "Hybrid", "On-site"];
const LOCATIONS = [
  "All",
  "Bengaluru",
  "Delhi",
  "Noida",
  "Gurugram",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Remote",
];

export function JobFilters({
  filters,
  setFilters,
  onReset,
  resultsCount,
}: JobFiltersProps) {
  const [pincode, setPincode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResult, setPincodeResult] = useState("");

  const activeCount =
    (filters.location && filters.location !== "All" ? 1 : 0) +
    (filters.jobType && filters.jobType !== "All" ? 1 : 0) +
    (filters.experienceLevel && filters.experienceLevel !== "All" ? 1 : 0) +
    (filters.workplaceType && filters.workplaceType !== "All" ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0);

  // Free Indian Pincode API call
  const handlePincodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    setPincodeLoading(true);
    setPincodeResult("");

    try {
      const res = await fetch(`/api/pincode?code=${pincode}`);
      const data = await res.json();
      if (data.success && data.formatted) {
        setPincodeResult(data.formatted);
        setFilters((prev) => ({ ...prev, location: data.formatted }));
      } else {
        setPincodeResult("No city found for this PIN");
      }
    } catch {
      setPincodeResult("Error looking up PIN");
    } finally {
      setPincodeLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
          <h3 className="font-black text-sm text-slate-900">Filters</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black border border-orange-200">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={() => {
              setPincode("");
              setPincodeResult("");
              onReset();
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-600 transition-colors font-bold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Free Indian Postal Pincode Fast Filter */}
        <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200">
          <label className="text-[10px] font-black uppercase text-orange-700 tracking-wider flex items-center gap-1 mb-1.5">
            <Hash className="w-3 h-3 text-orange-600" />
            <span>Search by Indian PIN Code (Free API)</span>
          </label>
          <form onSubmit={handlePincodeSearch} className="flex gap-1.5">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 560001, 110001..."
              className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-orange-200 text-slate-900 focus:outline-none focus:border-orange-600 font-bold"
            />
            <button
              type="submit"
              disabled={pincodeLoading || pincode.length !== 6}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {pincodeLoading ? "..." : "Check"}
            </button>
          </form>
          {pincodeResult && (
            <div className="text-[10px] text-slate-700 font-bold mt-1.5 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{pincodeResult}</span>
            </div>
          )}
        </div>

        {/* Workplace Type */}
        <div>
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
            Work Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {WORKPLACE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    workplaceType: prev.workplaceType === type ? "All" : type,
                  }))
                }
                className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                  filters.workplaceType === type
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 border border-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
            Experience Level
          </label>
          <div className="space-y-1">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orange-50 cursor-pointer text-xs font-semibold text-slate-700 select-none"
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  checked={filters.experienceLevel === level}
                  onChange={() => setFilters((prev) => ({ ...prev, experienceLevel: level }))}
                  className="rounded-full text-orange-600 focus:ring-orange-600 accent-orange-600"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Minimum Salary Slider in LPA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-orange-600" /> Min CTC
            </label>
            <span className="text-xs font-black text-orange-600">
              {filters.minSalary === 0 ? "Any Salary" : `₹${filters.minSalary}+ LPA`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={filters.minSalary}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minSalary: Number(e.target.value) }))
            }
            className="w-full accent-orange-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
            <span>₹0 LPA</span>
            <span>₹30 LPA</span>
            <span>₹60+ LPA</span>
          </div>
        </div>

        {/* Employment Type */}
        <div>
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
            Employment Type
          </label>
          <div className="space-y-1">
            {JOB_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-orange-50 cursor-pointer text-xs font-semibold text-slate-700 select-none"
              >
                <input
                  type="radio"
                  name="jobType"
                  checked={filters.jobType === type}
                  onChange={() => setFilters((prev) => ({ ...prev, jobType: type }))}
                  className="rounded-full text-orange-600 focus:ring-orange-600 accent-orange-600"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
            Key Tech Hubs
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    location: prev.location === loc ? "All" : loc,
                  }))
                }
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filters.location === loc
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-orange-50 border border-slate-200"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Showing matches count */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 text-center">
        <span className="text-xs text-slate-500">
          Showing <span className="font-black text-orange-600">{resultsCount}</span> matching roles
        </span>
      </div>
    </div>
  );
}
