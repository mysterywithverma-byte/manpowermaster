"use client";

import React, { useState, useEffect } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  MapPin, Bookmark, CheckCircle2, Sparkles, ArrowUpRight, Users,
  MessageCircle, X, Share2, Briefcase, Clock, Eye, IndianRupee,
  ChevronRight, ZapIcon,
} from "lucide-react";

interface JobSplitViewProps {
  jobs: MockJob[];
  loading: boolean;
  onApplyJob: (job: MockJob) => void;
  onResetFilters: () => void;
}

function getRecruiterActivity(job: MockJob) {
  const seed = job._id.charCodeAt(job._id.length - 1);
  const hoursAgo = (seed % 47) + 1;
  const viewedCount = (seed * 3 % 200) + 20;
  const matchPct = (seed * 7 % 30) + 60;
  return {
    hoursAgo, viewedCount, matchPct,
    recruiterName: `${job.company} HR`,
    recruiterOnline: hoursAgo < 6,
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
      fetch(`/api/currency?lpa=${avgLpa}`).then(r => r.json()).then(d => {
        if (d.success && d.formattedInHand) setInHandSalary(d.formattedInHand);
      }).catch(() => {});
    }
  }, [selectedJob]);

  const handleRunAts = async () => {
    if (!selectedJob) return;
    setAtsLoading(true);
    try {
      const res = await fetch("/api/ats-scanner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob._id, jobSkills: selectedJob.skills,
          userSkills: ["React", "TypeScript", "Node.js", "Next.js", "Git"],
          userResumeText: "Experienced Software Engineer with React and TypeScript." }),
      });
      const data = await res.json();
      if (data.success) setAtsResult(data);
    } catch { /* noop */ } finally { setAtsLoading(false); }
  };

  const handleShare = (job: MockJob) => {
    const slug = job.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");
    const url = `${window.location.origin}/jobs/${slug}-${job._id.slice(-6)}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (job: MockJob) => {
    const text = encodeURIComponent(`Hello Manpower Master! I am interested in the "${job.title}" role at ${job.company}. Please review my profile.`);
    window.open(`https://wa.me/919872620706?text=${text}`, "_blank");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Searching active openings...</p>
      </div>
    </div>
  );

  if (jobs.length === 0) return (
    <div className="p-14 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-md">
      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 className="text-base font-bold text-slate-900 mb-1">No matching roles found</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Try resetting or loosening filters.</p>
      <button onClick={onResetFilters} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white cursor-pointer">Reset All Filters</button>
    </div>
  );

  const recruiterInfo = selectedJob ? getRecruiterActivity(selectedJob) : null;

  const DetailPanel = ({ job }: { job: MockJob }) => (
    <div className="flex-1">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          {job.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.companyLogo} alt={job.company} className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200 bg-white shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-xl shadow-sm">{job.company.charAt(0)}</div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-900 leading-tight">{job.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-slate-600">{job.company}</span>
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-400">Verified Employer</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => toggleSaveJob(job._id)} className={`p-2 rounded-xl border cursor-pointer transition-all ${isJobSaved(job._id) ? "bg-orange-50 text-orange-600 border-orange-300" : "bg-slate-50 text-slate-400 border-slate-200 hover:text-orange-600"}`}>
              <Bookmark className={`w-4 h-4 ${isJobSaved(job._id) ? "fill-orange-500" : ""}`} />
            </button>
            <button onClick={() => handleShare(job)} className="p-2 rounded-xl border bg-slate-50 text-slate-500 border-slate-200 hover:text-orange-600 cursor-pointer transition-all" title={copied ? "Copied!" : "Copy link"}>
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button onClick={() => handleWhatsApp(job)} className="p-2 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-all">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        {recruiterInfo && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 mb-3 text-xs">
            <div className={`w-2 h-2 rounded-full shrink-0 ${recruiterInfo.recruiterOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span className="text-amber-800 font-medium">
              <strong>{recruiterInfo.recruiterName}</strong> active {recruiterInfo.hoursAgo}h ago
            </span>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-0.5 text-slate-600"><Eye className="w-3 h-3" />{recruiterInfo.viewedCount} views</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-bold">{recruiterInfo.matchPct}% match</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold"><MapPin className="w-3 h-3 text-orange-600" />{job.location}</span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${job.workplaceType === "Remote" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : job.workplaceType === "Hybrid" ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-slate-100 text-slate-700"}`}>{job.workplaceType}</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">{job.experienceLevel}</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">{job.jobType}</span>
          {job.featured && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-bold border border-orange-200"><Sparkles className="w-3 h-3 text-orange-600" /> Featured</span>}
        </div>
      </div>
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xl font-black text-orange-700">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</div>
            {inHandSalary && (
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <IndianRupee className="w-3 h-3" />
                Est. in-hand: <strong className="text-slate-700">{inHandSalary}/mo</strong>
              </div>
            )}
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div className="flex items-center gap-1 justify-end"><Users className="w-3 h-3" /><span>{job.applicantsCount} applied</span></div>
            <div className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /><span>Posted {timeAgo(job.createdAt)}</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onApplyJob(job)} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-600/20 transition-all">
            <ArrowUpRight className="w-4 h-4" /> Apply Now
          </button>
          <button onClick={() => handleWhatsApp(job)} className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold text-sm flex items-center gap-1.5 cursor-pointer transition-all">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
        </div>
      </div>
      <div className="px-5 py-4 border-b border-slate-100">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Required Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.map(skill => <span key={skill} className="px-2.5 py-1 rounded-lg bg-orange-50 text-[11px] font-bold text-orange-800 border border-orange-200">{skill}</span>)}
        </div>
      </div>
      <div className="px-5 py-4 border-b border-slate-100">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">About This Role</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
      </div>
      {job.requirements?.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Requirements</h4>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <ChevronRight className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {job.benefits?.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Perks &amp; Benefits</h4>
          <div className="flex flex-wrap gap-1.5">
            {job.benefits.map((b, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-semibold text-emerald-800 border border-emerald-200">{b}</span>)}
          </div>
        </div>
      )}
      <div className="px-5 py-4">
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-black text-slate-900">ATS Resume Match Score</h4>
              <p className="text-xs text-slate-500">Check how well your resume matches this job</p>
            </div>
            {atsResult && (
              <div className={`text-2xl font-black ${atsResult.score >= 70 ? "text-emerald-600" : atsResult.score >= 50 ? "text-amber-600" : "text-red-600"}`}>
                {atsResult.score}%
              </div>
            )}
          </div>
          {atsResult ? (
            <div className="space-y-1.5 text-xs">
              {atsResult.matched?.length > 0 && <div><span className="font-bold text-emerald-700">Matched: </span><span className="text-slate-600">{atsResult.matched.join(", ")}</span></div>}
              {atsResult.missing?.length > 0 && <div><span className="font-bold text-red-600">Missing: </span><span className="text-slate-600">{atsResult.missing.join(", ")}</span></div>}
            </div>
          ) : (
            <button onClick={handleRunAts} disabled={atsLoading} className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 transition-all">
              {atsLoading ? "Analyzing..." : "Run ATS Check"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex gap-0 h-[calc(100vh-210px)] min-h-[580px] rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="w-full md:w-[40%] lg:w-[36%] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50">
          <div className="p-2.5 space-y-2">
            {jobs.map((job, idx) => {
              const isSelected = selectedJob?._id === job._id;
              const saved = isJobSaved(job._id);
              return (
                <div key={`${job._id}-${idx}`}
                  onClick={() => { setSelectedJob(job); setMobileDetail(true); }}
                  className={`relative p-3.5 rounded-xl cursor-pointer border-2 transition-all duration-150 ${isSelected ? "bg-white border-orange-500 shadow-md shadow-orange-500/10" : "bg-white border-transparent hover:border-orange-200 hover:bg-orange-50/30"}`}
                >
                  {job.featured && <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />}
                  <div className="flex items-start gap-2.5">
                    {job.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-sm shrink-0">{job.company.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">{job.company}<CheckCircle2 className="w-3 h-3 text-orange-600 shrink-0" /></p>
                          <h3 className={`font-bold text-sm leading-tight line-clamp-1 mt-0.5 ${isSelected ? "text-orange-700" : "text-slate-900"}`}>{job.title}</h3>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleSaveJob(job._id); }} className={`p-1.5 rounded-lg border shrink-0 cursor-pointer transition-all ${saved ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-slate-50 text-slate-300 border-slate-200 hover:text-orange-500"}`}>
                          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orange-500" : ""}`} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-600 font-medium"><MapPin className="w-2.5 h-2.5 text-orange-500" />{job.location.split(",")[0]}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${job.workplaceType === "Remote" ? "bg-emerald-50 text-emerald-700" : job.workplaceType === "Hybrid" ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{job.workplaceType}</span>
                        {job.featured && <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold"><Sparkles className="w-2.5 h-2.5" /> Hot</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-orange-700">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(job.createdAt)}</span>
                      </div>
                      {isSelected && (
                        <button onClick={(e) => { e.stopPropagation(); onApplyJob(job); }} className="w-full mt-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors">
                          <ZapIcon className="w-3 h-3" /> Quick Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="hidden md:flex flex-col flex-1 overflow-y-auto bg-white">
          {selectedJob ? <DetailPanel job={selectedJob} /> : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a job to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {mobileDetail && selectedJob && (
        <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
            <h2 className="font-bold text-slate-900 text-sm truncate pr-2">{selectedJob.title}</h2>
            <button onClick={() => setMobileDetail(false)} className="p-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <DetailPanel job={selectedJob} />
        </div>
      )}
    </>
  );
}