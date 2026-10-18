"use client";

import React from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  MapPin,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Users,
  MessageCircle,
} from "lucide-react";

interface JobCardProps {
  job: MockJob;
  onSelectJob: (job: MockJob) => void;
  onApplyJob: (job: MockJob) => void;
}

export function JobCard({ job, onSelectJob, onApplyJob }: JobCardProps) {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job._id);

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
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white hover:bg-orange-50/20 border-2 border-slate-200 hover:border-orange-600 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:shadow-orange-950/5 hover:-translate-y-0.5"
    >
      {/* Featured Accent Strip */}
      {job.featured && (
        <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-orange-600 to-transparent"></div>
      )}

      <div>
        {/* Card Header: Company Logo, Name, Location & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 p-0.5 bg-white shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-base shrink-0 shadow-xs">
                {job.company.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-700">
                  {job.company}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-1">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveJob(job._id);
            }}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? "bg-orange-50 text-orange-700 border-orange-300"
                : "bg-slate-50 text-slate-400 border-slate-200 hover:text-orange-600 hover:bg-orange-50"
            }`}
            title={saved ? "Remove bookmark" : "Save this job"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-orange-600 text-orange-600" : ""}`} />
          </button>
        </div>

        {/* Location & Meta Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200">
            <MapPin className="w-3 h-3 text-orange-600" />
            {job.location}
          </span>

          <span
            className={`px-2.5 py-1 rounded-lg font-bold ${
              job.workplaceType === "Remote"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : job.workplaceType === "Hybrid"
                ? "bg-orange-50 text-orange-700 border border-orange-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {job.workplaceType}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200">
            {job.experienceLevel}
          </span>

          {job.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-bold border border-orange-200">
              <Sparkles className="w-3 h-3 text-orange-600" />
              Featured
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed font-normal">
          {job.description}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-md bg-orange-50 text-[11px] font-bold text-orange-800 border border-orange-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Salary in LPA & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="text-base sm:text-lg font-bold text-orange-700 tracking-tight">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
            <span>{timeAgo(job.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" /> {job.applicantsCount} applied
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* WhatsApp Direct Connect */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all cursor-pointer"
            title="Chat directly with HR on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
          </button>

          {/* 1-Click Apply */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyJob(job);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Apply</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
