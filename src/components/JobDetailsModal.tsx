"use client";

import React from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  X,
  MapPin,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowUpRight,
  Sparkles,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface JobDetailsModalProps {
  job: MockJob | null;
  onClose: () => void;
  onApply: (job: MockJob) => void;
}

export function JobDetailsModal({ job, onClose, onApply }: JobDetailsModalProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const [atsLoading, setAtsLoading] = React.useState(false);
  const [atsResult, setAtsResult] = React.useState<any>(null);
  const [inHandSalary, setInHandSalary] = React.useState<string>("");

  // Calculate estimated monthly take-home salary from CTC
  React.useEffect(() => {
    if (job) {
      const avgLpa = (job.salaryMin + job.salaryMax) / 2;
      fetch(`/api/currency?lpa=${avgLpa}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.formattedInHand) {
            setInHandSalary(data.formattedInHand);
          }
        })
        .catch(() => {});
    }
  }, [job]);

  if (!job) return null;

  const saved = isJobSaved(job._id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Job opening link copied to clipboard!");
    }
  };

  const handleWhatsApp = () => {
    const phone = job.recruiterWhatsApp?.replace(/[^0-9]/g, "") || "919872620706";
    const text = encodeURIComponent(
      `Hello! I am inquiring about the ${job.title} vacancy at ${job.company} on Manpower Master.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const handleRunAtsCheck = async () => {
    if (!job) return;
    setAtsLoading(true);
    try {
      const res = await fetch("/api/ats-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          jobSkills: job.skills,
          userSkills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "Git", "REST APIs"],
          userResumeText: "Experienced Software Engineer building high-performance web applications with React, TypeScript, Next.js, and Node.js.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAtsResult(data);
      }
    } catch {
      // Handle error
    } finally {
      setAtsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-5 sm:p-8 text-slate-900 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Alerts */}
        {job.status === "filled" && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
            <span>🚫 Position Filled: This job opening has been filled. Applications are no longer accepted.</span>
          </div>
        )}
        {job.status === "closed" && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-2">
            <span>🔒 Hiring Closed: The recruiter has closed applications for this position.</span>
          </div>
        )}
        {job.status === "expired" && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2">
            <span>⌛ Job Expired: The application window for this position has ended.</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pr-10">
          {job.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 p-1 bg-white shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-xs">
              {job.company.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-sm text-slate-800">
                {job.company}
              </span>
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-400">• {timeAgo(job.createdAt)}</span>
              {job.urgentHiring && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px]">
                  URGENT HIRING
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              {job.title}
            </h2>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                {job.location}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 font-bold border border-orange-200">
                {job.workplaceType}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-200">
                {job.experienceLevel}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-200">
                {job.jobType}
              </span>
            </div>
          </div>
        </div>

        {/* Compensation Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50 border border-orange-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-orange-700 font-black uppercase tracking-wider">
              Offered Compensation (LPA &amp; Monthly)
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </div>
            {inHandSalary && (
              <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Est. In-Hand Take Home: ~{inHandSalary} (Post EPF &amp; Tax)</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => toggleSaveJob(job._id)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                saved
                  ? "bg-white text-orange-700 border-orange-300 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:text-orange-600"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orange-600 text-orange-600" : ""}`} />
              <span>{saved ? "Saved" : "Save Job"}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp HR</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-xl bg-white text-slate-700 hover:text-orange-600 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {job.status === "filled" ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
              >
                Position Filled
              </button>
            ) : job.status === "closed" ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
              >
                Hiring Closed
              </button>
            ) : job.status === "expired" ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
              >
                Expired
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(job);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>1-Click Apply</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Operational Highlights Card */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
            Hiring Specifications &amp; Eligibility
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Vacancies</span>
              <span className="font-bold text-slate-800">{job.openingsCount ? `${job.openingsCount} Openings` : "Multiple"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Min Education</span>
              <span className="font-bold text-slate-800 truncate block">{job.qualification || "Any Graduate"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Shift Timing</span>
              <span className="font-bold text-slate-800 truncate block">{job.shiftTiming || "Day Shift"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Working Days</span>
              <span className="font-bold text-slate-800 truncate block">{job.workingDays || "6 Days (Sun Off)"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">English Level</span>
              <span className="font-bold text-slate-800 truncate block">{job.englishLevel || "Basic"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Interview Mode</span>
              <span className="font-bold text-slate-800 truncate block">{job.interviewMode || "Walk-in"}</span>
            </div>
          </div>
          {job.interviewAddress && (
            <div className="mt-2.5 p-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Walk-in Location: </span>
              <span>{job.interviewAddress}</span>
            </div>
          )}
          {(job.interviewStartDate || job.interviewEndDate || job.interviewTimeSlot) && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-orange-50/90 border border-orange-200 text-xs text-orange-950 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-orange-950">Interview Schedule Window: </span>
                <span>
                  {job.interviewStartDate || "Immediate"}
                  {job.interviewEndDate ? ` to ${job.interviewEndDate}` : ""}
                  {job.interviewTimeSlot ? ` • Daily Slot: ${job.interviewTimeSlot}` : ""}
                </span>
              </div>
            </div>
          )}
          {job.requiredAssets && job.requiredAssets.length > 0 && (
            <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Must Have:</span>
              {job.requiredAssets.map((asset, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                  {asset}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Free Resume ATS Scanner Widget */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-orange-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                AI Resume Match &amp; ATS Score (Free API)
              </h4>
            </div>
            <button
              onClick={handleRunAtsCheck}
              disabled={atsLoading}
              className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {atsLoading ? "Scanning Profile..." : "Analyze ATS Match"}
            </button>
          </div>

          {atsResult ? (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-orange-600">
                  {atsResult.score}%
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {atsResult.feedback}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Calculated using standard recruiter keyword matching
                  </span>
                </div>
              </div>

              {atsResult.missingSkills && atsResult.missingSkills.length > 0 && (
                <div className="text-xs mt-2">
                  <span className="text-slate-500 font-bold">Suggested keywords to add: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {atsResult.missingSkills.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black"
                      >
                        +{sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Click &quot;Analyze ATS Match&quot; to test your profile against this role&apos;s technical requirements with zero cost.
            </p>
          )}
        </div>

        {/* Content Section: Description */}
        <div className="space-y-6 text-sm text-slate-700">
          <div>
            <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">
              Role Overview
            </h4>
            <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-normal">
              {job.description}
            </p>
          </div>

          {/* Key Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2.5">
                Key Requirements
              </h4>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack Skills Chips */}
          <div>
            <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2.5">
              Skills Required
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Benefits & Perks */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2.5">
                Perks &amp; Culture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
