"use client";

import React from "react";
import { Input, Button, Tag, Space, Select, Tooltip } from "antd";
import { Search, MapPin, Globe, Sparkles, TrendingUp, Zap } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  onSearch: () => void;
  onTagClick: (tag: string) => void;
  totalJobsCount: number;
}

const POPULAR_CITIES = [
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
  const locationOptions = [
    {
      label: "Locations",
      options: [
        {
          value: "All",
          label: (
            <Space size={6}>
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>All Locations</span>
            </Space>
          ),
        },
        {
          value: "Remote",
          label: (
            <Space size={6}>
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Remote / WFH</span>
            </Space>
          ),
        },
      ],
    },
    {
      label: "Cities",
      options: POPULAR_CITIES.filter((c) => c !== "All Locations").map((city) => ({
        value: city,
        label: (
          <Space size={6}>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{city}</span>
          </Space>
        ),
      })),
    },
  ];

  return (
    <section className="bg-white border-b border-slate-200/80 px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Compact Zoho-style Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>
            {totalJobsCount > 0 ? totalJobsCount : "1,200"}+ active corporate openings
          </span>
        </div>

        {/* Clean Hero Title */}
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">
          Find your next career move
        </h1>

        {/* Sleek Zoho-Style Unified Search Bar */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors p-1.5 flex flex-col sm:flex-row gap-1.5 items-stretch sm:items-center">
          {/* Query input */}
          <div className="flex-1 min-w-0">
            <Input
              size="large"
              variant="borderless"
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Role, skill, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={onSearch}
              allowClear
              className="text-sm font-normal"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200" />
          <div className="block sm:hidden h-px w-full bg-slate-100" />

          {/* Location Select */}
          <div className="w-full sm:w-48 shrink-0">
            <Select
              size="large"
              variant="borderless"
              showSearch
              placeholder="City..."
              value={selectedLocation === "All" ? undefined : selectedLocation}
              onChange={(val) => setSelectedLocation(val || "All")}
              options={locationOptions}
              className="w-full text-sm"
              suffixIcon={<MapPin className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
              allowClear
            />
          </div>

          {/* Sleek Zoho Icon Button */}
          <Tooltip title="Search Jobs" placement="top">
            <Button
              type="primary"
              size="large"
              icon={<Search className="w-4 h-4" />}
              onClick={onSearch}
              aria-label="Search"
              className="w-full sm:w-10 h-10 rounded-lg shrink-0 flex items-center justify-center shadow-xs"
            />
          </Tooltip>
        </div>

        {/* Popular Tags */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 justify-start sm:justify-center">
          <span className="text-xs text-slate-400 shrink-0 inline-flex items-center gap-1 mr-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> Trending:
          </span>

          {POPULAR_SEARCH_TAGS.map((tag) => (
            <Tag
              key={tag}
              onClick={() => onTagClick(tag)}
              className="cursor-pointer rounded-md px-2.5 py-0.5 text-xs font-normal text-slate-600 bg-slate-50 border-slate-200 hover:border-primary hover:text-primary transition-colors shrink-0 m-0"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
