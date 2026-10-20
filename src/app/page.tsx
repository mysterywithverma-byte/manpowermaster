"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob } from "@/lib/mock-data";
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
import { AdminDashboard } from "@/components/AdminDashboard";
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Filters & Search state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<"featured" | "latest" | "salary">("featured");
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

    if (sortBy === "salary") {
      return uniqueList.sort((a, b) => b.salaryMax - a.salaryMax);
    }
    if (sortBy === "latest") {
      return uniqueList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    // "featured" default
    return uniqueList.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, sortBy]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectJobById = (_jobId: string) => {
    // Job selection is now handled internally by JobSplitView
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-orange-600 selection:text-white">
      {/* Google Jobs Schema.org JSON-LD Structured Data */}
      <JobJsonLd jobs={jobs} />

      {/* Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenRegister={() => setIsOnboardingOpen(true)}
        onOpenPostJob={() => {
          if (!user) {
            setIsAuthOpen(true);
          } else {
            setIsPostJobOpen(true);
          }
        }}
        onSelectJobId={handleSelectJobById}
      />

      {/* Main View Switching */}
      <main className="flex-1 bg-white">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {/* Explorer Sub-Header Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                    <span>Verified Open Positions in India</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing <strong className="text-orange-700 font-bold">{sortedJobs.length}</strong> active openings
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filters Toggle Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>

                  {/* Sync Free API Jobs Button */}
                  <button
                    onClick={handleSyncExternalJobs}
                    disabled={syncingJobs}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Fetch live jobs from Free Remotive & Arbeitnow APIs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingJobs ? "animate-spin" : ""}`} />
                    <span>{syncingJobs ? "Syncing..." : "Sync Live Jobs"}</span>
                  </button>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value="featured">Featured &amp; Recommended</option>
                      <option value="latest">Latest First</option>
                      <option value="salary">Highest Package (CTC)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toast Banner for Free API Sync */}
              {syncToast && (
                <div className="mb-6 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
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

                {/* Mobile Filters Drawer Modal */}
                {mobileFiltersOpen && (
                  <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-3 overflow-y-auto flex flex-col justify-end">
                    <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-300 shadow-2xl max-h-[85vh] overflow-y-auto">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-black text-slate-900">Filter Job Openings</span>
                        </div>
                        <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <JobFilters
                        filters={filters}
                        setFilters={setFilters}
                        onReset={handleResetFilters}
                        resultsCount={sortedJobs.length}
                      />
                      <button onClick={() => setMobileFiltersOpen(false)} className="w-full mt-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-xs text-white shadow-xs cursor-pointer">
                        Apply Filters &amp; View Roles ({sortedJobs.length})
                      </button>
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

              {/* Naukri-Style Candidate Registration Banner — Only for guests */}
              {!user && (
                <div className="mt-12 rounded-3xl bg-gradient-to-r from-orange-50 via-white to-orange-50 border-2 border-orange-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:flex w-24 h-24 shrink-0 bg-white rounded-2xl p-2 border border-orange-200 shadow-xs items-center justify-center">
                      <img
                        src="/illustrations/hero-search.png"
                        alt="Job Search"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                        Fast-Track Hiring
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Accelerate your career search with Manpower Master
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl">
                        Complete your candidate profile, upload your resume, and get direct interview invites from verified corporate employers with zero recruiter spam.
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setIsOnboardingOpen(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
                    >
                      Register as Job Seeker
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:block text-center">
                      Takes under 2 minutes
                    </span>
                  </div>
                </div>
              )}
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
          <EmployerDashboard onOpenPostJob={() => setIsPostJobOpen(true)} />
        )}

        {activeView === "admin-dashboard" && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (Phone-Friendly) */}
      <MobileBottomNav
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
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
        onJobCreated={() => {
          fetchJobs();
          setActiveView("employer-dashboard");
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
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
