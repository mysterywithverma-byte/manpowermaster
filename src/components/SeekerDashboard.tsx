"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob, MockApplication } from "@/lib/mock-data";
import { JobCard } from "@/components/JobCard";
import { ProfileBuilderModal } from "@/components/ProfileBuilderModal";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  Briefcase,
  Bookmark,
  User,
  Clock,
  CheckCircle2,
  FileText,
  MapPin,
  TrendingUp,
  GraduationCap,
  Download,
  Edit3,
  Camera,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { NaukriProfileView } from "@/components/NaukriProfileView";
import { ResumeBuilderModal } from "@/components/ResumeBuilderModal";

interface SeekerDashboardProps {
  onSelectJob: (job: MockJob) => void;
  onApplyJob: (job: MockJob) => void;
}

const STAGES: MockApplication["status"][] = ["Applied", "Shortlisted", "Interviewed", "Hired"];

export function SeekerDashboard({ onSelectJob, onApplyJob }: SeekerDashboardProps) {
  const { user, savedJobs } = useAuth();
  const [tab, setTab] = useState<"applications" | "bookmarks" | "profile">("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);

  // Fetch applications
  const fetchApps = async () => {
    try {
      setLoading(true);
      const applicantId = user?._id || user?.id || "user-seeker-1";
      const res = await fetch(`/api/applications?applicantId=${applicantId}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch bookmarked jobs
  useEffect(() => {
    async function fetchBookmarked() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.data) {
          const filtered = data.data.filter((j: MockJob) => savedJobs.includes(j._id));
          setBookmarkedJobs(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchBookmarked();
  }, [savedJobs]);

  const completenessScore = React.useMemo(() => {
    let score = 20;
    if (user?.name) score += 10;
    if (user?.headline) score += 15;
    if (user?.phone) score += 15;
    if (user?.resumeUrl) score += 20;
    if (user?.skills && user.skills.length > 0) score += 10;
    if (user?.education && user.education.length > 0) score += 5;
    if (user?.experienceHistory && user.experienceHistory.length > 0) score += 5;
    return Math.min(score, 100);
  }, [user]);

  const getStatusBadge = (status: MockApplication["status"]) => {
    switch (status) {
      case "Hired":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "Interviewed":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Shortlisted":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "Rejected":
        return "bg-rose-100 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-[80vh]">
      {/* Profile Overview Header Card (Pure White) */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="relative cursor-pointer group shrink-0"
              title="Click to update profile photo"
            >
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatar}
                  alt={user?.name || "Profile"}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-2xl font-black text-white shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900/80 text-white shadow-xs group-hover:bg-orange-600 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.name}
                </h1>
                {user?.isVerified && (
                  <VerifiedBadge size="sm" label="Verified Candidate" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Immediate Joiner"}
                </span>
              </div>
              <p className="text-xs text-orange-700 font-bold mt-0.5">
                {user?.headline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" /> {user?.location || "Bengaluru, Karnataka"}
                </span>
                <span>•</span>
                <span>{user?.phone || "+91 98765 43210"}</span>
                {user?.expectedCtc && (
                  <>
                    <span>•</span>
                    <span className="text-slate-900 font-bold">
                      Expected CTC: ₹{user.expectedCtc} LPA
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completeness & Edit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-left min-w-[180px]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Profile Score</span>
                <span className="text-orange-700">{completenessScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsResumeBuilderOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate ATS Resume</span>
              </button>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100 overflow-x-auto pb-1">
          <button
            onClick={() => setTab("applications")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              tab === "applications"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-orange-700 hover:bg-orange-50"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Applications Pipeline</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-orange-700 text-[10px] font-black">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setTab("bookmarks")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              tab === "bookmarks"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-orange-700 hover:bg-orange-50"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Jobs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-orange-700 text-[10px] font-black">
              {bookmarkedJobs.length}
            </span>
          </button>

          <button
            onClick={() => setTab("profile")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              tab === "profile"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-orange-700 hover:bg-orange-50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Naukri Profile &amp; CV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Applications Pipeline */}
      {tab === "applications" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>Live Application Status Pipeline</span>
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No applications yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Explore open positions and apply with 1-click using your profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const job = app.jobId || {};
                const currentStageIndex = STAGES.indexOf(app.status);

                return (
                  <div
                    key={app._id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-orange-300 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-800">
                            {job.company || "Company"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-orange-600" /> Applied {timeAgo(app.appliedAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                          {job.title || "Software Engineering Role"}
                        </h3>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-600" /> {job.location || "Bengaluru, India"}
                          {job.salaryMin && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 font-black">
                                {formatSalary(job.salaryMin, job.salaryMax)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Step Indicator */}
                    {app.status !== "Rejected" ? (
                      <div className="py-3 px-4 rounded-xl bg-orange-50/60 border border-orange-200 mb-3">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>
                          {STAGES.map((stage, idx) => {
                            const isCompleted = currentStageIndex >= idx;
                            const isCurrent = currentStageIndex === idx;

                            return (
                              <div key={stage} className="flex flex-col items-center relative z-10">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                    isCompleted
                                      ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-400"
                                      : "bg-white border-2 border-slate-300 text-slate-400"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span
                                  className={`text-[10px] mt-1 font-bold ${
                                    isCurrent ? "text-orange-600 font-black" : isCompleted ? "text-slate-800" : "text-slate-400"
                                  }`}
                                >
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold mb-3">
                        Candidate application closed by employer.
                      </div>
                    )}

                    {app.coverNote && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-normal">
                        <span className="font-bold text-slate-800">Your Pitch: </span>
                        {app.coverNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarked Roles */}
      {tab === "bookmarks" && (
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-orange-600" />
            <span>Saved Roles ({bookmarkedJobs.length})</span>
          </h2>

          {bookmarkedJobs.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-sm">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No bookmarked jobs</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bookmark exciting jobs on the explore page to compare compensation and apply later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onSelectJob={onSelectJob}
                  onApplyJob={onApplyJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Authentic Naukri Candidate Profile & FastForward Resume Builder */}
      {tab === "profile" && (
        <NaukriProfileView onOpenProfileBuilder={() => setIsProfileModalOpen(true)} />
      )}

      {/* Profile Builder Modal */}
      <ProfileBuilderModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={() => {
          fetchApps();
        }}
      />

      {/* ATS Resume Builder Modal */}
      <ResumeBuilderModal
        isOpen={isResumeBuilderOpen}
        onClose={() => setIsResumeBuilderOpen(false)}
        onSaved={() => {
          fetchApps();
        }}
      />
    </div>
  );
}
