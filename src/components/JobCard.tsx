"use client";

import React from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import { Card, Tag, Button, Avatar, Space, Typography, Tooltip, Badge } from "antd";
import {
  BookOutlined,
  BookFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  FireFilled,
  CheckCircleFilled,
  WhatsAppOutlined,
  ArrowRightOutlined,
  StarFilled,
  BankOutlined,
} from "@ant-design/icons";
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

  if (job.featured) {
    tags.push({
      label: "Hot Job",
      color: "error",
      icon: <FireFilled />,
    });
  }

  const daysSincePost = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePost < 3) {
    tags.push({
      label: "New",
      color: "success",
    });
  }

  if (seed >= 7) {
    tags.push({
      label: "Urgent Hiring",
      color: "warning",
      icon: <ThunderboltFilled />,
    });
  }

  if (seed % 3 === 0) {
    tags.push({
      label: "Easy Apply",
      color: "processing",
      icon: <CheckCircleFilled />,
    });
  }

  return tags.slice(0, 2);
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
            {job.company ? job.company.charAt(0) : <BankOutlined />}
          </Avatar>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
              <Text strong style={{ fontSize: 13, color: "#475569" }}>
                {job.company}
              </Text>
              <VerifiedBadge size="xs" />
              <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 2 }}>
                <StarFilled style={{ color: "#eab308", fontSize: 10 }} />
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
              icon={
                saved ? (
                  <BookFilled style={{ color: "#ea580c", fontSize: 16 }} />
                ) : (
                  <BookOutlined style={{ color: "#94a3b8", fontSize: 16 }} />
                )
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

      {/* Salary & Location */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px dashed #f1f5f9",
        }}
      >
        <Space size={14} split={<span style={{ color: "#cbd5e1" }}>•</span>}>
          <Text strong style={{ fontSize: 14, color: "#16a34a" }}>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Text>
          <span style={{ fontSize: 12, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <EnvironmentOutlined />
            <span>{job.location}</span>
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ClockCircleOutlined />
            <span>{timeAgo(job.createdAt)}</span>
          </span>
        </Space>

        {/* Action Buttons */}
        <Space size={8} onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            icon={<WhatsAppOutlined style={{ color: "#16a34a" }} />}
            onClick={handleWhatsAppClick}
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4", fontWeight: 600, borderRadius: 6 }}
          >
            WhatsApp
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => onApplyJob(job)}
            style={{ fontWeight: 600, borderRadius: 6 }}
          >
            Apply Now
          </Button>
        </Space>
      </div>
    </Card>
  );
}
