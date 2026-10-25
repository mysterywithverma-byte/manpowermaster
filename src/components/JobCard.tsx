"use client";

import React from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import { Card, Tag, Button, Avatar, Space, Typography, Tooltip, Badge } from "antd";
import {
  Bookmark,
  MapPin,
  Clock,
  Zap,
  Flame,
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  MessageCircle,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const { Text, Title } = Typography;

interface JobCardProps {
  job: MockJob;
  onSelectJob: (job: MockJob) => void;
  onApplyJob: (job: MockJob) => void;
  isSelected?: boolean;
}

function getJobTags(job: MockJob) {
  const seed = (job._id.charCodeAt(job._id.length - 1) || 5) % 10;
  const tags: Array<{ label: string; color: string; icon?: React.ReactNode }> = [];

  // Lifecycle status tags first
  if (job.status === "filled") {
    tags.push({
      label: "Position Filled",
      color: "purple",
    });
  } else if (job.status === "closed") {
    tags.push({
      label: "Closed",
      color: "default",
    });
  } else if (job.status === "expired") {
    tags.push({
      label: "Expired",
      color: "error",
    });
  }

  if (job.urgentHiring) {
    tags.push({
      label: "Urgent Hiring",
      color: "warning",
      icon: <Zap className="w-3 h-3 text-amber-500 mr-0.5 inline" />,
    });
  }

  if (job.openingsCount && job.openingsCount > 1) {
    tags.push({
      label: `${job.openingsCount} Vacancies`,
      color: "cyan",
    });
  }

  if (job.featured && !job.urgentHiring) {
    tags.push({
      label: "Hot Job",
      color: "error",
      icon: <Flame className="w-3 h-3 text-red-500 mr-0.5 inline" />,
    });
  }

  const daysSincePost = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePost < 3 && tags.length < 3) {
    tags.push({
      label: "New",
      color: "success",
    });
  }

  if (seed % 3 === 0 && tags.length < 3) {
    tags.push({
      label: "Easy Apply",
      color: "processing",
      icon: <CheckCircle2 className="w-3 h-3 text-blue-500 mr-0.5 inline" />,
    });
  }

  return tags.slice(0, 3);
}

export function JobCard({ job, onSelectJob, onApplyJob, isSelected }: JobCardProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job._id);

  const seed = (job._id.charCodeAt(job._id.length - 1) || 5) % 10;
  const rating = (4.0 + (seed / 10) * 0.9).toFixed(1);
  const reviewsCount = 20 + seed * 18;
  const matchSeed = (job._id.charCodeAt(0) || 7) % 30;
  const matchPct = 65 + matchSeed;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = "919872620706";
    const text = encodeURIComponent(
      `Hello Manpower Master! I am interested in applying for the "${job.title}" position at ${job.company} posted on Manpowermaster.com. Could you please review my profile?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const jobTags = getJobTags(job);

  return (
    <Card
      hoverable
      className="mobile-compact-card"
      onClick={() => onSelectJob(job)}
      styles={{
        body: { padding: "16px 18px" },
      }}
      style={{
        borderRadius: 14,
        border: isSelected ? "2px solid #ea580c" : "1px solid #e2e8f0",
        backgroundColor: isSelected ? "#fffbf7" : "#ffffff",
        boxShadow: isSelected
          ? "0 4px 12px rgba(234, 88, 12, 0.12)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
      }}
    >
      {/* Top Header: Company Avatar + Title + Bookmark */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <Space align="start" size={12} style={{ flex: 1, minWidth: 0 }}>
          <Avatar
            shape="square"
            size={44}
            src={job.companyLogo}
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#ea580c",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 10,
              flexShrink: 0,
            }}
          >
            {job.company ? job.company.charAt(0) : <Building2 className="w-5 h-5 text-orange-600" />}
          </Avatar>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
              <Text strong style={{ fontSize: 13, color: "#475569" }}>
                {job.company}
              </Text>
              <VerifiedBadge size="xs" />
              <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 2 }}>
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{rating}</span>
                <span>({reviewsCount})</span>
              </span>
            </div>

            <Title
              level={4}
              ellipsis={{ rows: 1 }}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {job.title}
            </Title>
          </div>
        </Space>

        {/* Bookmark & Match Badge */}
        <Space size={6} align="center">
          <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, fontSize: 11, margin: 0 }}>
            {matchPct}% Match
          </Tag>
          <Tooltip title={saved ? "Remove from saved" : "Save job"}>
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={
                <Bookmark
                  className={`w-4 h-4 ${
                    saved ? "text-orange-600 fill-orange-600" : "text-slate-400"
                  }`}
                />
              }
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveJob(job._id);
              }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Tags Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {jobTags.map((t, idx) => (
          <Tag key={idx} color={t.color} icon={t.icon} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
            {t.label}
          </Tag>
        ))}
        <Tag color="default" style={{ borderRadius: 6, fontSize: 11, color: "#475569" }}>
          {job.experienceLevel || "Mid-Level"}
        </Tag>
        <Tag color="default" style={{ borderRadius: 6, fontSize: 11, color: "#475569" }}>
          {job.jobType}
        </Tag>
      </div>

      {/* Salary & Location Row */}
      <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
          <span className="font-extrabold text-sm text-emerald-600">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="text-slate-300 hidden xs:inline">•</span>
          <span className="text-slate-600 inline-flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px]">{job.location}</span>
          </span>
          <span className="text-slate-300 hidden xs:inline">•</span>
          <span className="text-slate-400 text-[11px] inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeAgo(job.createdAt)}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="middle"
            icon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={handleWhatsAppClick}
            className="flex-1 sm:flex-initial h-9 sm:h-7 text-xs font-semibold rounded-xl sm:rounded-lg active:scale-95"
            style={{
              borderColor: "#bbf7d0",
              backgroundColor: "#f0fdf4",
            }}
          >
            WhatsApp
          </Button>
          {job.status === "filled" ? (
            <Button
              disabled
              size="middle"
              className="flex-1 sm:flex-initial h-9 sm:h-7 text-xs font-bold rounded-xl sm:rounded-lg opacity-75"
            >
              Filled
            </Button>
          ) : job.status === "closed" ? (
            <Button
              disabled
              size="middle"
              className="flex-1 sm:flex-initial h-9 sm:h-7 text-xs font-bold rounded-xl sm:rounded-lg opacity-75"
            >
              Closed
            </Button>
          ) : job.status === "expired" ? (
            <Button
              disabled
              size="middle"
              className="flex-1 sm:flex-initial h-9 sm:h-7 text-xs font-bold rounded-xl sm:rounded-lg opacity-75"
            >
              Expired
            </Button>
          ) : (
            <Button
              type="primary"
              size="middle"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => onApplyJob(job)}
              className="flex-1 sm:flex-initial h-9 sm:h-7 text-xs font-bold rounded-xl sm:rounded-lg active:scale-95 shadow-xs"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
