"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob } from "@/lib/mock-data";
import { calculateJobMatchScore } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { JobFilters } from "@/components/JobFilters";
import { JobSplitView } from "@/components/JobSplitView";
import { ApplyJobModal } from "@/components/ApplyJobModal";
import { PostJobModal } from "@/components/PostJobModal";
import { AuthModal } from "@/components/AuthModal";
import { NaukriOnboardingModal } from "@/components/NaukriOnboardingModal";
import { SeekerDashboard } from "@/components/SeekerDashboard";
import { EmployerDashboard } from "@/components/EmployerDashboard";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { JobJsonLd } from "@/components/JobJsonLd";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Briefcase,
  X,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface FilterState {
  search: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  workplaceType: string;
  minSalary: number;
}

const INITIAL_FILTERS: FilterState = {
  search: "",
  location: "All",
  jobType: "All",
  experienceLevel: "All",
  workplaceType: "All",
  minSalary: 0,
};

export default function HomePage() {
  const { user, activeView, setActiveView } = useAuth();

  // Modals state
  const [jobToApply, setJobToApply] = useState<MockJob | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<"seeker" | "employer">("seeker");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Filters & Search state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<"recommended" | "featured" | "latest" | "salary">("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Jobs data
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingJobs, setSyncingJobs] = useState(false);
  const [syncToast, setSyncToast] = useState("");

  const handleSyncExternalJobs = async () => {
    setSyncingJobs(true);
    setSyncToast("");
    try {
      const res = await fetch("/api/external-jobs", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncToast(data.message || "Synced fresh live jobs!");
        fetchJobs();
        setTimeout(() => setSyncToast(""), 4500);
      } else {
        setSyncToast("Sync failed. Check connection.");
        setTimeout(() => setSyncToast(""), 3500);
      }
    } catch {
      setSyncToast("Error contacting Free Jobs API.");
      setTimeout(() => setSyncToast(""), 3500);
    } finally {
      setSyncingJobs(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.location && filters.location !== "All") params.set("location", filters.location);
      if (filters.jobType && filters.jobType !== "All") params.set("jobType", filters.jobType);
      if (filters.experienceLevel && filters.experienceLevel !== "All") params.set("experienceLevel", filters.experienceLevel);
      if (filters.workplaceType && filters.workplaceType !== "All") params.set("workplaceType", filters.workplaceType);
      if (filters.minSalary > 0) params.set("minSalary", filters.minSalary.toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.location,
    filters.jobType,
    filters.experienceLevel,
    filters.workplaceType,
    filters.minSalary,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("authModal") === "true") {
        if (!user) {
          setIsAuthOpen(true);
        }
        // Clean authModal from URL so it doesn't persist across refreshes
        const url = new URL(window.location.href);
        url.searchParams.delete("authModal");
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
      }
    }
  }, [user]);

  // Never auto-open registration/onboarding on page refresh!
  // Only auto-open if explicitly flagged right after a brand-new sign up
  useEffect(() => {
    if (typeof window !== "undefined" && user && user.profileCompleted === false && !isAuthOpen) {
      const isFreshSignup = sessionStorage.getItem("fresh_registration_flow");
      if (isFreshSignup === "true") {
        sessionStorage.removeItem("fresh_registration_flow");
        setIsOnboardingOpen(true);
      }
    }
  }, [user, isAuthOpen]);

  const handleSearchSubmit = () => {
    fetchJobs();
  };

  const handleTagClick = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      search: tag === "Remote (WFH)" || tag === "Immediate Joiner" ? "" : tag,
      workplaceType: tag === "Remote (WFH)" ? "Remote" : prev.workplaceType,
    }));
    setTimeout(fetchJobs, 50);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setTimeout(fetchJobs, 50);
  };

  // Client sort & deduplication by unique ID
  const sortedJobs = useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: MockJob[] = [];
    for (const j of jobs) {
      if (j && j._id && !seen.has(j._id)) {
        seen.add(j._id);
        uniqueList.push(j);
      }
    }

    if (sortBy === "recommended") {
      return uniqueList.sort((a, b) => {
        const scoreA = calculateJobMatchScore(user, a).score;
        const scoreB = calculateJobMatchScore(user, b).score;
        if (scoreB !== scoreA) return scoreB - scoreA;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    if (sortBy === "salary") {
      return uniqueList.sort((a, b) => b.salaryMax - a.salaryMax);
    }
    if (sortBy === "latest") {
      return uniqueList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    // "featured"
    return uniqueList.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, sortBy, user]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectJobById = (_jobId: string) => {
    // Job selection is now handled internally by JobSplitView
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-orange-600 selection:text-white">
      {/* Google Jobs Schema.org JSON-LD Structured Data */}
      <JobJsonLd jobs={jobs} />

      {/* Navigation */}
      <Navbar
        onOpenAuth={() => {
          setAuthInitialRole("seeker");
          setIsAuthOpen(true);
        }}
        onOpenEmployerAuth={() => {
          setAuthInitialRole("employer");
          setIsAuthOpen(true);
        }}
        onOpenPostJob={() => {
          if (!user) {
            setAuthInitialRole("employer");
            setIsAuthOpen(true);
          } else {
            setIsPostJobOpen(true);
          }
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onSelectJobId={handleSelectJobById}
      />

      {/* Main View Switching with mobile bottom nav padding */}
      <main className="flex-1 bg-transparent pb-20 md:pb-0">
        {activeView === "explore" && (
          <div>
            {/* Hero Section with Sensible Search and Location Dropdown */}
            <HeroSection
              searchQuery={filters.search}
              setSearchQuery={(val) => setFilters((prev) => ({ ...prev, search: val }))}
              selectedLocation={filters.location}
              setSelectedLocation={(val) => setFilters((prev) => ({ ...prev, location: val }))}
              onSearch={handleSearchSubmit}
              onTagClick={handleTagClick}
              totalJobsCount={jobs.length}
            />

            {/* Jobs Explorer Grid Container */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
              {/* Explorer Sub-Header Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0" />
                    <span>Verified Open Positions in India</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Showing <strong className="text-orange-700 font-bold">{sortedJobs.length}</strong> active openings
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filters Toggle Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 active:scale-95 transition-all shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {(filters.location !== "All" || filters.jobType !== "All" || filters.experienceLevel !== "All" || filters.workplaceType !== "All" || filters.minSalary > 0) && (
                      <span className="w-2 h-2 rounded-full bg-orange-600" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Sync Free API Jobs Button */}
                    <button
                      onClick={handleSyncExternalJobs}
                      disabled={syncingJobs}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      title="Fetch live jobs from Free Remotive & Arbeitnow APIs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingJobs ? "animate-spin" : ""}`} />
                      <span className="hidden xs:inline">{syncingJobs ? "Syncing..." : "Sync Live Jobs"}</span>
                      <span className="xs:hidden">{syncingJobs ? "..." : "Sync"}</span>
                    </button>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none cursor-pointer shadow-xs max-w-[140px] sm:max-w-none truncate"
                      >
                        <option value="recommended">🎯 Best Match (Recommended)</option>
                        <option value="featured">⭐ Featured Roles</option>
                        <option value="latest">🕒 Latest Posted</option>
                        <option value="salary">💰 Highest Salary</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toast Banner for Free API Sync */}
              {syncToast && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncToast}</span>
                </div>
              )}

              {/* Layout: Sidebar Filters + Indeed-Style Split Screen */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden md:block w-56 lg:w-60 flex-shrink-0 sticky top-24">
                  <JobFilters
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleResetFilters}
                    resultsCount={sortedJobs.length}
                  />
                </aside>

                {/* Mobile Filters Drawer Modal (Bottom Sheet) */}
                {mobileFiltersOpen && (
                  <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
                    <div
                      className="bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-250 border-t border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Drag Handle & Header */}
                      <div className="pt-2.5 px-4 pb-3 border-b border-slate-100 flex flex-col">
                        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mb-2.5" />
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-black text-slate-900">Filter Job Openings</span>
                          </div>
                          <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer active:scale-95"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scrollable Filters Content */}
                      <div className="p-4 overflow-y-auto flex-1">
                        <JobFilters
                          filters={filters}
                          setFilters={setFilters}
                          onReset={handleResetFilters}
                          resultsCount={sortedJobs.length}
                        />
                      </div>

                      {/* Sticky Bottom Actions */}
                      <div className="p-3 border-t border-slate-100 bg-white/95 backdrop-blur-md pb-safe flex gap-2">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 active:scale-95 transition-all"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-xs text-white shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          Show {sortedJobs.length} Roles
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indeed-Style Split Screen Job View */}
                <div className="flex-1 min-w-0">
                  <JobSplitView
                    jobs={sortedJobs}
                    loading={loading}
                    onApplyJob={(j) => {
                      if (!user) {
                        setIsAuthOpen(true);
                      } else {
                        setJobToApply(j);
                      }
                    }}
                    onResetFilters={handleResetFilters}
                  />
                </div>
              </div>

              {/* Dual Action Banners: Candidate Fast-Track & Employer Talent Hub */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Banner */}
                <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-2 border-orange-200 p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider mb-2.5">
                      For Employees
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Accelerate your career search with Manpower Master
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Complete your employee profile, upload your resume, and get direct interview invites from verified corporate employers with zero recruiter spam.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-orange-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        if (!user) {
                          setAuthInitialRole("seeker");
                          setIsAuthOpen(true);
                        } else {
                          setIsOnboardingOpen(true);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      {user ? "Update Employee Profile" : "Sign In as Employee"}
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">100% Free Placements</span>
                  </div>
                </div>

                {/* Employer Banner */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-2 border-slate-700 p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider mb-2.5">
                      For Employers &amp; HR
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Hiring talent? Post free jobs &amp; screen top candidates
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Publish vacancies in under 60 seconds, connect with verified engineers &amp; specialists directly on WhatsApp, and manage candidate hiring stages.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        if (!user) {
                          setAuthInitialRole("employer");
                          setIsAuthOpen(true);
                        } else {
                          setIsPostJobOpen(true);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Post Free Job
                    </button>
                    <button
                      onClick={() => {
                        if (!user) {
                          setAuthInitialRole("employer");
                          setIsAuthOpen(true);
                        } else {
                          setActiveView("employer-dashboard");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition-all cursor-pointer"
                    >
                      Employer Console
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Dashboard Views */}
        {activeView === "seeker-dashboard" && (
          <SeekerDashboard
            onSelectJob={() => {}}
            onApplyJob={(j) => setJobToApply(j)}
          />
        )}

        {activeView === "employer-dashboard" && (
          <EmployerDashboard
            onOpenPostJob={() => setIsPostJobOpen(true)}
            onOpenEditProfile={() => setIsOnboardingOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (Phone-Friendly) */}
      <MobileBottomNav
        onOpenPostJob={() => {
          if (!user) {
            setAuthInitialRole("employer");
            setIsAuthOpen(true);
          } else {
            setIsPostJobOpen(true);
          }
        }}
        onOpenAuth={() => {
          setAuthInitialRole("seeker");
          setIsAuthOpen(true);
        }}
      />

      {/* Interactive Modals */}

      <ApplyJobModal
        job={jobToApply}
        onClose={() => setJobToApply(null)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onAppliedSuccessfully={() => {
          fetchJobs();
          setActiveView("seeker-dashboard");
        }}
      />

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onOpenEmployerAuth={() => {
          setAuthInitialRole("employer");
          setIsAuthOpen(true);
        }}
        onJobCreated={() => {
          fetchJobs();
          setActiveView("employer-dashboard");
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialRole={authInitialRole}
        onClose={() => setIsAuthOpen(false)}
        onOpenDetailedRegistration={() => {
          setIsAuthOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      <NaukriOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleted={() => {
          setIsOnboardingOpen(false);
          fetchJobs();
        }}
      />
    </div>
  );
}
