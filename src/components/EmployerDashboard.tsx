"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob, MockApplication } from "@/lib/mock-data";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  Building2,
  PlusCircle,
  Users,
  CheckCircle2,
  Filter,
  FileText,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface EmployerDashboardProps {
  onOpenPostJob: () => void;
}

export function EmployerDashboard({ onOpenPostJob }: EmployerDashboardProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [syncingJobs, setSyncingJobs] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const recruiterId = user?._id || "user-employer-1";
      const companyParam = user?.companyName ? `&company=${encodeURIComponent(user.companyName)}` : "";

      const [jobsRes, appsRes] = await Promise.all([
        fetch(`/api/jobs?postedBy=${recruiterId}${companyParam}`),
        fetch(`/api/applications?recruiterId=${recruiterId}`),
      ]);

      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();

      if (jobsData.success) {
        setJobs(jobsData.data || []);
      }
      if (appsData.success) {
        setApplications(appsData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSyncLiveJobs = async () => {
    setSyncingJobs(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/external-jobs", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message || "Synced fresh live jobs!");
        fetchData();
      } else {
        setSyncMessage("Could not sync external jobs.");
      }
    } catch {
      setSyncMessage("Sync error occurred.");
    } finally {
      setSyncingJobs(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: MockApplication["status"]) => {
    try {
      setStatusUpdatingId(appId);
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredApps =
    selectedJobId === "all"
      ? applications
      : applications.filter((a) => {
          const jId = typeof a.jobId === "object" ? a.jobId?._id : a.jobId;
          return jId === selectedJobId;
        });

  const totalHired = applications.filter((a) => a.status === "Hired").length;
  const totalShortlisted = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interviewed"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-[80vh]">
      {/* Top Banner (Pure White) */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.companyName || "Razorpay"} Talent Console
                </h1>
                <VerifiedBadge size="sm" label="Verified Employer" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recruiter Lead: <strong className="text-slate-800">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Free External Jobs Sync API Button */}
            <button
              onClick={handleSyncLiveJobs}
              disabled={syncingJobs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 transition-all cursor-pointer disabled:opacity-50"
              title="Fetch fresh live jobs via free Remotive Public API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingJobs ? "animate-spin" : ""}`} />
              <span>{syncingJobs ? "Fetching..." : "Fetch Live Jobs"}</span>
            </button>

            <button
              onClick={onOpenPostJob}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Opening</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xl sm:text-2xl font-black text-slate-900">{jobs.length}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Active Openings</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xl sm:text-2xl font-black text-orange-600">{applications.length}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Total Candidates</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xl sm:text-2xl font-black text-amber-600">{totalShortlisted}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">In Interviews</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xl sm:text-2xl font-black text-emerald-600">{totalHired}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Hired / Selected</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Applicants Review Board */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>Candidate Pipeline &amp; Stage Board</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified resumes, contact applicants on WhatsApp, and update hiring stages.
              </p>
            </div>

            {/* Job Filter selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-orange-600" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none"
              >
                <option value="all">All Positions ({applications.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading candidate applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No applicants yet for this view</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Candidates applying from the job board will show up here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => {
                const jobTitle = typeof app.jobId === "object" ? app.jobId?.title : "Software Engineer";
                const companyName = typeof app.jobId === "object" ? app.jobId?.company : "Company";
                const phoneClean = app.applicantDetails?.phone?.replace(/[^0-9]/g, "") || "919876543210";

                return (
                  <div
                    key={app._id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-orange-300 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Candidate Meta */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-base text-white shrink-0">
                          {app.applicantDetails?.name?.charAt(0) || "C"}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">
                              {app.applicantDetails?.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {app.applicantDetails?.noticePeriod || "Immediate Joiner"}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 mt-0.5">
                            Role: <strong className="text-slate-800">{jobTitle}</strong> ({companyName})
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-orange-600" /> {app.applicantDetails?.email}
                            </span>
                            {app.applicantDetails?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-orange-600" /> {app.applicantDetails?.phone}
                              </span>
                            )}
                            <span>•</span>
                            <span>Exp: <strong className="text-slate-800">{app.applicantDetails?.experienceYears} yrs</strong></span>
                            {app.applicantDetails?.expectedCtc && (
                              <span>• Expected: <strong className="text-orange-600 font-bold">₹{app.applicantDetails?.expectedCtc} LPA</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Action Controller & Direct WhatsApp */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hi ${app.applicantDetails?.name}, this is ${user?.companyName || "HR"} regarding your application for ${jobTitle}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <div className="text-xs text-slate-500 font-bold">Stage:</div>
                        <select
                          disabled={statusUpdatingId === app._id}
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value as any)}
                          className={`px-3 py-1.5 text-xs font-black rounded-xl border focus:outline-none cursor-pointer transition-colors ${
                            app.status === "Hired"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : app.status === "Interviewed"
                              ? "bg-orange-100 text-orange-800 border-orange-300"
                              : app.status === "Shortlisted"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : app.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewed">Interviewing</option>
                          <option value="Hired">Offer Extended / Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Candidate Pitch & Links */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-600 italic">
                        &quot;{app.coverNote || "Eager to discuss this position and contribute to the team."}&quot;
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {app.applicantDetails?.portfolioUrl && (
                          <a
                            href={app.applicantDetails.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-orange-600 font-bold hover:underline"
                          >
                            <span>Portfolio</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <a
                          href={app.resumeUrl || "https://example.com/resume.pdf"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Resume (PDF)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Posted Jobs */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            <span>Active Open Roles ({jobs.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1">{job.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-2">{job.company} • {job.location}</div>
                <div className="text-sm font-black text-orange-600 mb-2">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span>{job.applicantsCount} Applicants</span>
                  <span className="text-[10px]">{timeAgo(job.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
