"use client";

import React, { useState, useEffect } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  MapPin,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  Users,
  MessageCircle,
  X,
  Share2,
  Briefcase,
  Clock,
  Eye,
  IndianRupee,
  ChevronRight,
  Zap,
  Star,
  CheckCircle,
  FileText,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface JobSplitViewProps {
  jobs: MockJob[];
  loading: boolean;
  onApplyJob: (job: MockJob) => void;
  onResetFilters: () => void;
}

function getRecruiterActivity(job: MockJob) {
  const seed = (job._id.charCodeAt(job._id.length - 1) || 5) % 10;
  const hoursAgo = (seed % 47) + 1;
  const viewedCount = (seed * 3 % 200) + 20;
  const matchPct = (seed * 7 % 30) + 65;
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

export function JobSplitView({ jobs, loading, onApplyJob, onResetFilters }: JobSplitViewProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null);
  const [atsResult, setAtsResult] = useState<{ score: number; matched: string[]; missing: string[] } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [inHandSalary, setInHandSalary] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) setSelectedJob(jobs[0]);
    if (jobs.length === 0) setSelectedJob(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          userResumeText: "Full Stack Engineer experienced in React, Next.js, and TypeScript.",
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
    const slug = job.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");
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
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-slate-200">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading verified openings...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">No matching roles found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Try loosening your search filters or exploring remote opportunities.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white cursor-pointer transition-all"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  const recruiterInfo = selectedJob ? getRecruiterActivity(selectedJob) : null;

  const DetailPanel = ({ job }: { job: MockJob }) => (
    <div className="flex-1">
      {/* Sticky Top Header of Detail Panel */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {job.companyLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-14 h-14 rounded-xl object-contain border border-slate-200 p-1 bg-white shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xl shadow-2xs shrink-0">
                {job.company.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-slate-700">{job.company}</span>
                <VerifiedBadge size="xs" />
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  <Star className="w-2.8 h-2.8 fill-amber-500 text-amber-500" />
                  <span>{recruiterInfo?.rating || "4.2"}</span>
                </div>
                <span className="text-[11px] text-slate-400">({recruiterInfo?.reviewsCount} Reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleSaveJob(job._id)}
              className={`p-2 rounded-xl border cursor-pointer transition-all ${
                isJobSaved(job._id)
                  ? "bg-orange-50 text-orange-600 border-orange-200"
                  : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700"
              }`}
              title={isJobSaved(job._id) ? "Saved" : "Save Job"}
            >
              <Bookmark className={`w-4 h-4 ${isJobSaved(job._id) ? "fill-orange-500 text-orange-500" : ""}`} />
            </button>
            <button
              onClick={() => handleShare(job)}
              className="p-2 rounded-xl border bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800 cursor-pointer transition-all"
              title={copied ? "Copied Link!" : "Share Job"}
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3-Pillar Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Experience</div>
              <div className="font-semibold text-slate-800">{job.experienceLevel} Level</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Annual CTC</div>
              <div className="font-bold text-slate-900">{formatSalary(job.salaryMin, job.salaryMax)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Location</div>
              <div className="font-semibold text-slate-800">{job.location.split(",")[0]} ({job.workplaceType})</div>
            </div>
          </div>
        </div>

        {/* Recruiter Activity SLA Bar */}
        {recruiterInfo && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-900 font-medium">
                <strong>{recruiterInfo.recruiterName}</strong> was active {recruiterInfo.hoursAgo}h ago
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{recruiterInfo.viewedCount} views</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{recruiterInfo.matchPct}% Profile Match</span>
            </div>
          </div>
        )}

        {/* Compact Enterprise Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApplyJob(job)}
            className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span>Apply</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleWhatsApp(job)}
            title="Chat with Recruiter on WhatsApp"
            className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Detail Content Sections */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Required Skills */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Key Skills &amp; Competencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="pt-5 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Role Overview &amp; Responsibilities
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Candidate Qualifications
            </h4>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <ChevronRight className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Perks &amp; Corporate Benefits
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-emerald-50 text-xs font-medium text-emerald-800 border border-emerald-200/80"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrated ATS Match Score Tool */}
        <div className="pt-5 border-t border-slate-100">
          <div className="rounded-2xl bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50 border border-orange-200/90 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Resume &amp; Skill Match Diagnostic</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compare your saved candidate profile skills against this job&apos;s ATS criteria.
                </p>
              </div>
              {atsResult && (
                <div
                  className={`text-xl font-black px-2.5 py-1 rounded-xl border ${
                    atsResult.score >= 70
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-amber-700 bg-amber-50 border-amber-200"
                  }`}
                >
                  {atsResult.score}%
                </div>
              )}
            </div>

            {atsResult ? (
              <div className="space-y-1.5 text-xs mt-3 pt-3 border-t border-orange-100">
                {atsResult.matched?.length > 0 && (
                  <div>
                    <span className="font-bold text-emerald-700">Matched Skills: </span>
                    <span className="text-slate-700">{atsResult.matched.join(", ")}</span>
                  </div>
                )}
                {atsResult.missing?.length > 0 && (
                  <div>
                    <span className="font-bold text-rose-600">Recommended Skills to Add: </span>
                    <span className="text-slate-700">{atsResult.missing.join(", ")}</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleRunAts}
                disabled={atsLoading}
                className="mt-3 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 transition-all shadow-xs"
              >
                {atsLoading ? "Scanning Skills..." : "Analyze ATS Match"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex gap-0 h-[calc(100vh-200px)] min-h-[620px] rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
        {/* Left Column: Job Feed List */}
        <div className="w-full md:w-[42%] lg:w-[38%] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/40">
          <div className="p-3 space-y-2.5">
            {jobs.map((job, idx) => {
              const isSelected = selectedJob?._id === job._id;
              const saved = isJobSaved(job._id);

              return (
                <div
                  key={`${job._id}-${idx}`}
                  onClick={() => {
                    setSelectedJob(job);
                    setMobileDetail(true);
                  }}
                  className={`relative p-4 rounded-xl cursor-pointer border transition-all duration-150 ${
                    isSelected
                      ? "bg-white border-blue-500 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20 border-l-4 border-l-blue-600"
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top: Title & Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-bold text-sm leading-snug line-clamp-1 ${
                          isSelected ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
                        <span className="font-semibold truncate max-w-[140px]">{job.company}</span>
                        <VerifiedBadge size="xs" />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job._id);
                      }}
                      className={`p-1.5 rounded-lg border shrink-0 cursor-pointer transition-all ${
                        saved
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : "bg-slate-50 text-slate-300 border-slate-200 hover:text-slate-600"
                      }`}
                      title={saved ? "Saved" : "Save Job"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orange-500 text-orange-500" : ""}`} />
                    </button>
                  </div>

                  {/* 3-Point Micro Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {job.experienceLevel === "Fresher" ? "0-1 Yrs" : "2-5 Yrs"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <IndianRupee className="w-3 h-3 text-slate-400" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location.split(",")[0]}
                    </span>
                  </div>

                  {/* Skills tags preview */}
                  <div className="flex flex-wrap items-center gap-1 mt-2.5">
                    {job.skills.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{job.skills.length - 3}</span>
                    )}
                  </div>

                  {/* Bottom: Posted Date & Applicants */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(job.createdAt)}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {job.applicantsCount} applied
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Job Detail Canvas */}
        <div className="hidden md:flex flex-col flex-1 overflow-y-auto bg-white">
          {selectedJob ? (
            <DetailPanel job={selectedJob} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-slate-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Select an opening to review complete specifications</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Detail View */}
      {mobileDetail && selectedJob && (
        <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm truncate pr-2">{selectedJob.title}</h2>
            <button
              onClick={() => setMobileDetail(false)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DetailPanel job={selectedJob} />
        </div>
      )}
    </>
  );
}