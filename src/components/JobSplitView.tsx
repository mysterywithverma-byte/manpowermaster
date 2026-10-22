"use client";

import React, { useState, useEffect } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import { JobCard } from "@/components/JobCard";
import {
  Card,
  Tag,
  Button,
  Avatar,
  Space,
  Typography,
  Tooltip,
  Skeleton,
  Empty,
  Progress,
  Divider,
  Drawer,
  Badge,
} from "antd";
import {
  BookOutlined,
  BookFilled,
  ShareAltOutlined,
  WhatsAppOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireFilled,
  StarFilled,
  BankOutlined,
  CheckOutlined,
  ReloadOutlined,
  ThunderboltFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const { Text, Title, Paragraph } = Typography;

interface JobSplitViewProps {
  jobs: MockJob[];
  loading: boolean;
  onApplyJob: (job: MockJob) => void;
  onResetFilters: () => void;
}

function getRecruiterActivity(job: MockJob) {
  const seed = (job._id.charCodeAt(job._id.length - 1) || 5) % 10;
  const hoursAgo = (seed % 47) + 1;
  const viewedCount = ((seed * 3) % 200) + 20;
  const matchPct = ((seed * 7) % 30) + 65;
  const rating = (4.0 + (seed / 10) * 0.9).toFixed(1);
  return {
    hoursAgo,
    viewedCount,
    matchPct,
    rating,
    reviewsCount: 15 + seed * 14,
    recruiterName: `${job.company} Talent Team`,
    recruiterOnline: hoursAgo < 8,
  };
}

export function JobSplitView({
  jobs,
  loading,
  onApplyJob,
  onResetFilters,
}: JobSplitViewProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null);
  const [atsResult, setAtsResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
  } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [inHandSalary, setInHandSalary] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) setSelectedJob(jobs[0]);
    if (jobs.length === 0) setSelectedJob(null);
  }, [jobs]);

  useEffect(() => {
    setAtsResult(null);
    setInHandSalary("");
    if (selectedJob) {
      const avgLpa = (selectedJob.salaryMin + selectedJob.salaryMax) / 2;
      fetch(`/api/currency?lpa=${avgLpa}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.formattedInHand) setInHandSalary(d.formattedInHand);
        })
        .catch(() => {});
    }
  }, [selectedJob]);

  const handleRunAts = async () => {
    if (!selectedJob) return;
    setAtsLoading(true);
    try {
      const res = await fetch("/api/ats-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob._id,
          jobSkills: selectedJob.skills,
          userSkills: ["React", "TypeScript", "Node.js", "Next.js", "SQL"],
          userResumeText:
            "Full Stack Engineer experienced in React, Next.js, and TypeScript.",
        }),
      });
      const data = await res.json();
      if (data.success) setAtsResult(data);
    } catch {
      /* noop */
    } finally {
      setAtsLoading(false);
    }
  };

  const handleShare = (job: MockJob) => {
    const slug = job.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/jobs/${slug}-${job._id.slice(-6)}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (job: MockJob) => {
    const text = encodeURIComponent(
      `Hello Manpower Master! I am interested in applying for the "${job.title}" position at ${job.company}. Could you please review my profile?`
    );
    window.open(`https://wa.me/919872620706?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
            styles={{ body: { padding: 18 } }}
          >
            <Skeleton avatar active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          textAlign: "center",
          padding: "36px 20px",
          maxWidth: 540,
          margin: "24px auto",
        }}
      >
        <Empty
          description={
            <div>
              <Title level={4} style={{ margin: "12px 0 6px", color: "#0f172a" }}>
                No Job Vacancies Found
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Try adjusting your search criteria or resetting filters to see more verified openings.
              </Text>
            </div>
          }
        >
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onResetFilters}
            style={{ fontWeight: 600, marginTop: 12 }}
          >
            Reset Filters
          </Button>
        </Empty>
      </Card>
    );
  }

  const recruiterInfo = selectedJob ? getRecruiterActivity(selectedJob) : null;

  // Detail Panel Component reused for desktop side card and mobile drawer
  const DetailPanelContent = ({ job }: { job: MockJob }) => (
    <div>
      {/* Top Header Card */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Space align="start" size={14} style={{ flex: 1, minWidth: 0 }}>
            <Avatar
              shape="square"
              size={54}
              src={job.companyLogo}
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#ea580c",
                fontWeight: 800,
                fontSize: 20,
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              {job.company.charAt(0)}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Title level={3} style={{ fontSize: 18, margin: 0, color: "#0f172a" }}>
                {job.title}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 4,
                  fontSize: 13,
                }}
              >
                <Text strong style={{ color: "#475569" }}>
                  {job.company}
                </Text>
                <VerifiedBadge size="xs" />
                <span style={{ color: "#cbd5e1" }}>•</span>
                <span style={{ fontSize: 12, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <StarFilled style={{ color: "#eab308", fontSize: 11 }} />
                  <span>{recruiterInfo?.rating || "4.2"}</span>
                  <span>({recruiterInfo?.reviewsCount} reviews)</span>
                </span>
              </div>
            </div>
          </Space>

          <Space size={6}>
            <Tooltip title={isJobSaved(job._id) ? "Saved" : "Save Job"}>
              <Button
                icon={
                  isJobSaved(job._id) ? (
                    <BookFilled style={{ color: "#ea580c" }} />
                  ) : (
                    <BookOutlined />
                  )
                }
                onClick={() => toggleSaveJob(job._id)}
              />
            </Tooltip>
            <Tooltip title={copied ? "Link Copied!" : "Share Job"}>
              <Button
                icon={copied ? <CheckOutlined style={{ color: "#16a34a" }} /> : <ShareAltOutlined />}
                onClick={() => handleShare(job)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 3-Pillar Metadata Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
              Experience
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {job.experienceLevel || "Mid-Level"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
              Annual CTC
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
              Location
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {job.location} ({job.workplaceType})
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Space size={10} style={{ width: "100%" }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => onApplyJob(job)}
            style={{ fontWeight: 700, borderRadius: 10, flex: 1 }}
          >
            Apply Now
          </Button>

          <Button
            size="large"
            icon={<WhatsAppOutlined style={{ color: "#16a34a", fontSize: 18 }} />}
            onClick={() => handleWhatsApp(job)}
            style={{
              borderColor: "#bbf7d0",
              backgroundColor: "#f0fdf4",
              fontWeight: 600,
              borderRadius: 10,
            }}
          >
            WhatsApp HR
          </Button>
        </Space>
      </div>

      {/* Detail Content Sections */}
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ATS Resume Scanner Section */}
        <Card
          size="small"
          style={{
            borderRadius: 12,
            border: "1px solid #fed7aa",
            backgroundColor: "#fff7ed",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Space align="center" size={6}>
              <ThunderboltFilled style={{ color: "#ea580c" }} />
              <Text strong style={{ fontSize: 13, color: "#9a3412" }}>
                AI Match &amp; ATS Score
              </Text>
            </Space>
            <Button
              size="small"
              type="primary"
              icon={<ThunderboltFilled />}
              loading={atsLoading}
              onClick={handleRunAts}
              style={{
                backgroundColor: "#ea580c",
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Analyze Match
            </Button>
          </div>

          {atsResult ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <Progress
                  percent={atsResult.score}
                  size="small"
                  strokeColor="#ea580c"
                  style={{ flex: 1, margin: 0 }}
                />
                <Text strong style={{ fontSize: 13, color: "#c2410c" }}>
                  {atsResult.score}%
                </Text>
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Matched {atsResult.matched.length} key skills required for this role.
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "#78350f" }}>
              Click Scan Profile to see how well your resume matches this job before applying.
            </div>
          )}
        </Card>

        {/* Required Skills */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
            Key Skills &amp; Competencies
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {job.skills.map((skill) => (
              <Tag
                key={skill}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        </div>

        {/* Job Overview */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
            Role Overview &amp; Responsibilities
          </div>
          <Paragraph
            style={{
              fontSize: 13,
              color: "#334155",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              margin: 0,
            }}
          >
            {job.description}
          </Paragraph>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
              Candidate Qualifications
            </div>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
              Perks &amp; Benefits
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {job.benefits.map((b, i) => (
                <Tag key={i} color="success" style={{ borderRadius: 6, fontWeight: 500, fontSize: 11 }}>
                  {b}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* In-Hand Monthly Take-Home Salary Calculator */}
        {inHandSalary && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#166534" }}>
                Estimated In-Hand Monthly
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>
                {inHandSalary}
              </div>
            </div>
            <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>
              After Standard Deductions
            </Tag>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      {/* Left List of Jobs */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            isSelected={selectedJob?._id === job._id}
            onSelectJob={(j) => {
              setSelectedJob(j);
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen(true);
              }
            }}
            onApplyJob={onApplyJob}
          />
        ))}
      </div>

      {/* Right Desktop Detail Panel (Sticky) */}
      <div
        className="hidden lg:block"
        style={{
          width: "52%",
          position: "sticky",
          top: 76,
          maxHeight: "calc(100vh - 96px)",
          overflowY: "auto",
        }}
      >
        {selectedJob && (
          <Card
            styles={{ body: { padding: 0 } }}
            style={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            <DetailPanelContent job={selectedJob} />
          </Card>
        )}
      </div>

      {/* Mobile Drawer for Job Details */}
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        placement="bottom"
        height="85%"
        styles={{ body: { padding: 0 } }}
      >
        {selectedJob && <DetailPanelContent job={selectedJob} />}
      </Drawer>
    </div>
  );
}