"use client";

import React from "react";
import {
  Card,
  Slider,
  Radio,
  Tag,
  Button,
  Badge,
  Space,
  Divider,
  Typography,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

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

export function JobFilters({
  filters,
  setFilters,
  onReset,
  resultsCount,
}: JobFiltersProps) {
  const activeCount =
    (filters.location && filters.location !== "All" ? 1 : 0) +
    (filters.jobType && filters.jobType !== "All" ? 1 : 0) +
    (filters.experienceLevel && filters.experienceLevel !== "All" ? 1 : 0) +
    (filters.workplaceType && filters.workplaceType !== "All" ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0);

  return (
    <Card
      styles={{
        body: { padding: "16px 18px" },
      }}
      style={{
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid #f1f5f9",
          marginBottom: 16,
        }}
      >
        <Space align="center" size={8}>
          <FilterOutlined style={{ color: "#ea580c" }} />
          <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
            All Filters
          </Text>
          {activeCount > 0 && (
            <Badge
              count={activeCount}
              style={{ backgroundColor: "#ea580c" }}
              size="small"
            />
          )}
        </Space>

        {activeCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined style={{ color: "#ea580c" }} />}
            onClick={onReset}
            style={{ fontWeight: 600, padding: 0 }}
          >
            Reset
          </Button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Work Mode */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 8,
            }}
          >
            Work Mode
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {WORKPLACE_TYPES.map((type) => {
              const isSelected = filters.workplaceType === type;
              return (
                <Tag.CheckableTag
                  key={type}
                  checked={isSelected}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      workplaceType: prev.workplaceType === type ? "All" : type,
                    }))
                  }
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    margin: 0,
                    backgroundColor: isSelected ? "#ea580c" : "#f1f5f9",
                    color: isSelected ? "#ffffff" : "#334155",
                    border: isSelected ? "1px solid #ea580c" : "1px solid #e2e8f0",
                  }}
                >
                  {type}
                </Tag.CheckableTag>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 8,
            }}
          >
            Experience Level
          </div>
          <Radio.Group
            value={filters.experienceLevel}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, experienceLevel: e.target.value }))
            }
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <Radio key={level} value={level} style={{ fontSize: 13, color: "#334155" }}>
                {level}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        {/* Minimum Salary Slider in LPA */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Min CTC
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#ea580c" }}>
              {filters.minSalary === 0 ? "Any Salary" : `₹${filters.minSalary}+ LPA`}
            </span>
          </div>
          <Slider
            min={0}
            max={60}
            step={5}
            value={filters.minSalary}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, minSalary: Number(val) }))
            }
            marks={{
              0: "₹0",
              30: "₹30L",
              60: "₹60L+",
            }}
          />
        </div>

        {/* Employment Type */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 8,
            }}
          >
            Employment Type
          </div>
          <Radio.Group
            value={filters.jobType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, jobType: e.target.value }))
            }
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            {JOB_TYPES.map((type) => (
              <Radio key={type} value={type} style={{ fontSize: 13, color: "#334155" }}>
                {type}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>

      <Divider style={{ margin: "16px 0 12px" }} />

      <div style={{ textAlign: "center", fontSize: 12, color: "#64748b" }}>
        Showing <strong style={{ color: "#ea580c" }}>{resultsCount}</strong> matching roles
      </div>
    </Card>
  );
}
