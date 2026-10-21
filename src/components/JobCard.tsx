"use client";

import React from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  MapPin,
  Bookmark,
  Sparkles,
  Users,
  MessageCircle,
  Briefcase,
  IndianRupee,
  Clock,
  Star,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface JobCardProps {
  job: MockJob;
  onSelectJob: (job: MockJob) => void;
  onApplyJob: (job: MockJob) => void;
}

export function JobCard({ job, onSelectJob, onApplyJob }: JobCardProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job._id);

  // Generate deterministic review ratings for companies
  const seed = (job._id.charCodeAt(job._id.length - 1) || 5) % 10;
  const rating = (4.0 + (seed / 10) * 0.9).toFixed(1);
  const reviewsCount = 20 + seed * 18;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = "919872620706";
    const text = encodeURIComponent(
      `Hello Manpower Master! I am interested in applying for the "${job.title}" position at ${job.company} posted on Manpowermaster.com. Could you please review my profile?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Featured Accent Strip */}
      {job.featured && (
        <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"></div>
      )}

      <div>
        {/* Header: Title, Company Name, Reviews, and Company Logo Thumbnail */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Job Title */}
            <h3 className="font-bold text-[15px] sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {job.title}
            </h3>

            {/* Company Name & Rating Row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                {job.company}
              </span>
              <VerifiedBadge size="xs" />

              <span className="text-slate-300">•</span>

              {/* Star Rating (Naukri style) */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80">
                <Star className="w-2.8 h-2.8 fill-amber-500 text-amber-500" />
                <span>{rating}</span>
              </div>
              <span className="text-[11px] text-slate-400">({reviewsCount} Reviews)</span>
            </div>
          </div>

          {/* Company Logo Thumbnail */}
          <div className="shrink-0 flex items-center gap-2">
            {job.companyLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-11 h-11 rounded-xl object-contain border border-slate-200 p-1 bg-white shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                {job.company.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Naukri Iconic 3-Column Metadata Row (Experience, CTC, Location) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-100 text-xs text-slate-600">
          {/* Experience */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 truncate">
              {job.experienceLevel === "Fresher" ? "0 - 1 Yrs" : "2 - 6 Yrs"}
            </span>
          </div>

          {/* Salary / Package */}
          <div className="flex items-center gap-1.5 min-w-0">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 truncate">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          {/* Location & Work Mode */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-700 truncate">
              {job.location.split(",")[0]} <span className="text-slate-400">({job.workplaceType})</span>
            </span>
          </div>
        </div>

        {/* Short Description Snippet */}
        <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{job.description}</span>
        </div>

        {/* Key Skills Pills (Clean neutral tags) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[10px] text-slate-400 font-semibold pl-1">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Timestamp, Applicants, Bookmark & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Left: Posted time ago & Applicants */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {timeAgo(job.createdAt)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Users className="w-3 h-3 text-slate-400" />
            {job.applicantsCount} applied
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Bookmark */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveJob(job._id);
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              saved
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title={saved ? "Saved" : "Save Job"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orange-500 text-orange-500" : ""}`} />
          </button>

          {/* WhatsApp Direct Apply */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Chat with HR on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          {/* Quick Apply Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyJob(job);
            }}
            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Apply</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
