"use client";

import React, { useState, useEffect } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary } from "@/lib/utils";
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
  Drawer,
} from "antd";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
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
            icon={<RotateCcw className="w-3.5 h-3.5" />}
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
    <div className="relative">
      {/* Mobile Drag Indicator Bar */}
      <div className="lg:hidden flex justify-center py-2 bg-slate-50 border-b border-slate-100">
        <div className="w-10 h-1.5 rounded-full bg-slate-300" />
      </div>

      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <Space align="start" size={12} style={{ flex: 1, minWidth: 0 }}>
            <Avatar
              shape="square"
              size={48}
              src={job.companyLogo}
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#ea580c",
                fontWeight: 800,
                fontSize: 18,
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              {job.company.charAt(0)}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Title level={3} style={{ fontSize: 17, margin: 0, color: "#0f172a", lineHeight: 1.3 }}>
                {job.title}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 3,
                  fontSize: 12,
                }}
              >
                <Text strong style={{ color: "#475569" }}>
                  {job.company}
                </Text>
                <VerifiedBadge size="xs" />
                <span style={{ color: "#cbd5e1" }}>•</span>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{recruiterInfo?.rating || "4.2"}</span>
                </span>
              </div>
            </div>
          </Space>

          <Space size={6}>
            <Tooltip title={isJobSaved(job._id) ? "Saved" : "Save Job"}>
              <Button
                type="text"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"
                icon={
                  isJobSaved(job._id) ? (
                    <BookmarkCheck className="w-4 h-4 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-slate-500" />
                  )
                }
                onClick={() => toggleSaveJob(job._id)}
              />
            </Tooltip>
            <Tooltip title={copied ? "Link Copied!" : "Share Job"}>
              <Button
                type="text"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"
                icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                onClick={() => handleShare(job)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 3-Pillar Metadata Row - 3 Columns on Mobile */}
        <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3.5 text-center sm:text-left">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Experience
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
              {job.experienceLevel || "Mid-Level"}
            </div>
          </div>
          <div className="min-w-0 border-x border-slate-200 px-1">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Annual CTC
            </div>
            <div className="text-xs font-bold text-emerald-600 truncate mt-0.5">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Location
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
              {job.location}
            </div>
          </div>
        </div>

        {/* Action Buttons for Desktop / Header */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Button
            type="primary"
            size="large"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => onApplyJob(job)}
            style={{ fontWeight: 600, borderRadius: 8, flex: 1 }}
          >
            Apply Now
          </Button>

          <Tooltip title="Chat with HR on WhatsApp">
            <Button
              size="large"
              icon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
              onClick={() => handleWhatsApp(job)}
              style={{
                borderColor: "#bbf7d0",
                backgroundColor: "#f0fdf4",
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              WhatsApp HR
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Detail Content Sections */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 pb-24 lg:pb-6">
        {/* ATS Resume Scanner Section */}
        <Card
          size="small"
          style={{
            borderRadius: 10,
            border: "1px solid #fed7aa",
            backgroundColor: "#fff7ed",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Space align="center" size={6}>
              <Sparkles className="w-4 h-4 text-primary" />
              <Text strong style={{ fontSize: 13, color: "#9a3412" }}>
                AI Match &amp; ATS Score
              </Text>
            </Space>
            <Button
              size="small"
              type="primary"
              icon={<Sparkles className="w-3 h-3" />}
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
        height="90%"
        styles={{ body: { padding: 0 } }}
        footer={
          selectedJob ? (
            <div className="flex items-center gap-2.5 pb-safe">
              <Button
                size="large"
                icon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
                onClick={() => handleWhatsApp(selectedJob)}
                className="flex-1 font-semibold rounded-lg active:scale-95"
                style={{
                  borderColor: "#bbf7d0",
                  backgroundColor: "#f0fdf4",
                  height: 42,
                }}
              >
                WhatsApp HR
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onApplyJob(selectedJob);
                }}
                className="flex-1 font-semibold rounded-lg shadow-xs active:scale-95"
                style={{ height: 42 }}
              >
                Apply Now
              </Button>
            </div>
          ) : null
        }
      >
        {selectedJob && <DetailPanelContent job={selectedJob} />}
      </Drawer>
    </div>
  );
}