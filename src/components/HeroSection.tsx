"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Tag, Space, Select, AutoComplete, Tooltip } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FireOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
} from "@ant-design/icons";

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
      label: "Special Options",
      options: [
        {
          value: "All",
          label: (
            <Space>
              <GlobalOutlined style={{ color: "#1677ff" }} />
              <span>All Locations (India)</span>
            </Space>
          ),
        },
        {
          value: "Remote",
          label: (
            <Space>
              <ThunderboltFilled style={{ color: "#16a34a" }} />
              <span>Remote / Work From Home</span>
            </Space>
          ),
        },
      ],
    },
    {
      label: "Major Cities",
      options: POPULAR_CITIES.filter((c) => c !== "All Locations").map((city) => ({
        value: city,
        label: (
          <Space>
            <EnvironmentOutlined style={{ color: "#94a3b8" }} />
            <span>{city}</span>
          </Space>
        ),
      })),
    },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderBottom: "1px solid #e2e8f0",
        padding: "36px 16px 40px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        {/* Trust Badge */}
        <div style={{ display: "inline-block", marginBottom: 14 }}>
          <Tag
            color="orange"
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #fed7aa",
            }}
          >
            <CheckCircleFilled style={{ color: "#ea580c" }} />
            <span>India&apos;s Verified Direct Hiring &amp; Placement Network</span>
          </Tag>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: "clamp(26px, 4.5vw, 44px)",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 10px",
          }}
        >
          Find your dream job with verified corporate employers
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            maxWidth: 620,
            margin: "0 auto 28px",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#0f172a" }}>
            {totalJobsCount > 0 ? totalJobsCount : "1,200"}+ verified openings
          </strong>{" "}
          across India with transparent CTC in ₹ LPA & direct HR interview calls.
        </p>

        {/* Ant Design Unified Search Bar */}
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            border: "1px solid #cbd5e1",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
            padding: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* Query input */}
          <div style={{ flex: "1 1 280px" }}>
            <Input
              size="large"
              variant="borderless"
              prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: 16, marginRight: 6 }} />}
              placeholder="Designation, skills, or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={onSearch}
              allowClear
              style={{ fontSize: 14 }}
            />
          </div>

          {/* Divider */}
          <div
            className="hidden sm:block"
            style={{ width: 1, height: 28, backgroundColor: "#e2e8f0" }}
          />

          {/* Location Select */}
          <div style={{ flex: "1 1 220px", display: "flex", alignItems: "center" }}>
            <Select
              size="large"
              variant="borderless"
              showSearch
              placeholder="Select or type city..."
              value={selectedLocation === "All" ? undefined : selectedLocation}
              onChange={(val) => setSelectedLocation(val || "All")}
              options={locationOptions}
              style={{ width: "100%", fontSize: 14 }}
              suffixIcon={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
              allowClear
            />
          </div>

          {/* Search Button */}
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined style={{ fontSize: 16 }} />}
            onClick={onSearch}
            style={{
              height: 44,
              padding: "0 24px",
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.25)",
            }}
          >
            Search Jobs
          </Button>
        </div>

        {/* Popular Tags */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginRight: 4,
            }}
          >
            <FireOutlined style={{ color: "#ea580c" }} /> Popular:
          </span>

          {POPULAR_SEARCH_TAGS.map((tag) => (
            <Tag
              key={tag}
              onClick={() => onTagClick(tag)}
              style={{
                cursor: "pointer",
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 500,
                color: "#334155",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
              }}
              className="hover:border-orange-500 hover:text-orange-600"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
