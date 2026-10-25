"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MockJob, MockUser } from "@/lib/mock-data";
import { formatSalary, getDaysRemaining } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PostJobModal } from "@/components/PostJobModal";
import {
  ShieldCheck,
  Server,
  Users,
  Briefcase,
  Activity,
  RefreshCw,
  CheckCircle,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  Sparkles,
  Building2,
  UserCheck,
  Filter,
  ExternalLink,
  ShieldAlert,
  Edit3,
  Clock,
  AlertTriangle,
  Flag,
  Ban,
  X,
  AlertOctagon,
} from "lucide-react";

export function AdminDashboard() {
  const { loginAsDemo, user: currentAdminUser } = useAuth();

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<MockJob | null>(null);

  // Tab State: "users" | "jobs" | "system"
  const [activeTab, setActiveTab] = useState<"users" | "jobs" | "system">("users");

  // User Filter & Search state (Filter Employers, Employees / Seekers, or Blocked)
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userVerifiedFilter, setUserVerifiedFilter] = useState("all");

  // Report Account Modal State
  const [reportModalUser, setReportModalUser] = useState<MockUser | null>(null);
  const [reportReason, setReportReason] = useState("Fake Job Vacancies / Scams");
  const [customReportNote, setCustomReportNote] = useState("");
  const [reportAlsoBlock, setReportAlsoBlock] = useState(true);
  const [reportAlsoDeleteJobs, setReportAlsoDeleteJobs] = useState(true);

  // Block Account Modal State
  const [blockModalUser, setBlockModalUser] = useState<MockUser | null>(null);
  const [blockDeleteJobs, setBlockDeleteJobs] = useState(true);

  // Count active jobs posted by a user
  const getUserJobsCount = (u: MockUser) => {
    const uId = u._id || u.id;
    return jobs.filter(
      (j) =>
        j.postedBy === uId ||
        (u.email && j.postedBy === u.email) ||
        (u.companyName && j.company?.toLowerCase() === u.companyName.toLowerCase())
    ).length;
  };

  // Job Filter & Search state
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  // Action feedback
  const [actionToast, setActionToast] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(""), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [seedRes, jobsRes, usersRes] = await Promise.all([
        fetch("/api/seed"),
        fetch("/api/jobs"),
        fetch("/api/users"),
      ]);

      const seedData = await seedRes.json();
      const jobsData = await jobsRes.json();
      const usersData = await usersRes.json();

      setDbStatus(seedData);
      if (jobsData.success) {
        setJobs(jobsData.data || []);
      }
      if (usersData.success) {
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Blue Tick Toggle (Verification)
  const handleToggleBlueTick = async (user: MockUser) => {
    const newVerifiedState = !user.isVerified;
    const userId = user._id || user.id;
    if (!userId) return;

    setActionLoadingId(userId);
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === userId || u.id === userId ? { ...u, isVerified: newVerifiedState } : u))
      );

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: newVerifiedState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          newVerifiedState
            ? `Blue Tick verified badge granted to ${user.name}!`
            : `Blue Tick revoked from ${user.name}.`
        );
      } else {
        showToast("Error updating verification status");
        loadAllData();
      }
    } catch {
      showToast("Network error updating Blue Tick");
      loadAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Role Change
  const handleChangeRole = async (user: MockUser, newRole: "seeker" | "employer" | "admin") => {
    const userId = user._id || user.id;
    if (!userId) return;

    setActionLoadingId(userId);
    try {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u))
      );

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Role for ${user.name} changed to ${newRole.toUpperCase()}`);
      } else {
        loadAllData();
      }
    } catch {
      loadAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: MockUser) => {
    const userId = user._id || user.id;
    if (!userId) return;

    if (!confirm(`Are you sure you want to delete user account "${user.name}" (${user.email})?`)) {
      return;
    }

    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId && u.id !== userId));
        showToast(`Account ${user.name} deleted.`);
      } else {
        showToast("Error deleting user.");
      }
    } catch {
      showToast("Network error deleting user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Report Account (with option to block and delete jobs)
  const handleReportAccount = async () => {
    if (!reportModalUser) return;
    const userId = reportModalUser._id || reportModalUser.id;
    if (!userId) return;

    setActionLoadingId(userId);
    try {
      const fullReason = customReportNote.trim()
        ? `${reportReason}: ${customReportNote.trim()}`
        : reportReason;

      const payload = {
        isReported: true,
        reportReason: fullReason,
        isBlocked: reportAlsoBlock,
        blockedReason: reportAlsoBlock ? fullReason : undefined,
        deleteJobs: reportAlsoBlock && reportAlsoDeleteJobs,
      };

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId || u.id === userId
              ? {
                  ...u,
                  isReported: true,
                  reportReason: fullReason,
                  isBlocked: reportAlsoBlock ? true : u.isBlocked,
                  blockedReason: reportAlsoBlock ? fullReason : u.blockedReason,
                }
              : u
          )
        );

        if (reportAlsoBlock && reportAlsoDeleteJobs) {
          const userEmail = reportModalUser.email;
          const userCompany = reportModalUser.companyName;
          setJobs((prev) =>
            prev.filter(
              (j) =>
                j.postedBy !== userId &&
                (!userEmail || j.postedBy !== userEmail) &&
                (!userCompany || j.company?.toLowerCase() !== userCompany.toLowerCase())
            )
          );
        }

        showToast(
          `Account "${reportModalUser.name}" reported!${
            reportAlsoBlock ? " Account blocked." : ""
          }${
            reportAlsoBlock && reportAlsoDeleteJobs && data.deletedJobsCount
              ? ` (${data.deletedJobsCount} jobs deleted)`
              : ""
          }`
        );
        setReportModalUser(null);
        setCustomReportNote("");
      } else {
        showToast(data.error || "Failed to submit report");
      }
    } catch {
      showToast("Network error submitting report");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Toggle Block / Unblock (with optional job purging)
  const handleToggleBlock = async (user: MockUser, deleteJobs: boolean = false) => {
    const userId = user._id || user.id;
    if (!userId) return;

    const willBlock = !user.isBlocked;
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBlocked: willBlock,
          blockedReason: willBlock ? "Blocked by Administrator" : "",
          deleteJobs: willBlock && deleteJobs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId || u.id === userId
              ? {
                  ...u,
                  isBlocked: willBlock,
                  blockedReason: willBlock ? "Blocked by Administrator" : "",
                }
              : u
          )
        );

        if (willBlock && deleteJobs) {
          const userEmail = user.email;
          const userCompany = user.companyName;
          setJobs((prev) =>
            prev.filter(
              (j) =>
                j.postedBy !== userId &&
                (!userEmail || j.postedBy !== userEmail) &&
                (!userCompany || j.company?.toLowerCase() !== userCompany.toLowerCase())
            )
          );
        }

        showToast(
          willBlock
            ? `Account "${user.name}" blocked.${
                deleteJobs ? ` All posted jobs deleted.` : ""
              }`
            : `Account "${user.name}" unblocked successfully.`
        );
        setBlockModalUser(null);
      } else {
        showToast(data.error || "Failed to update block status");
      }
    } catch {
      showToast("Network error updating block status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Toggle Job Featured
  const handleToggleJobFeatured = async (job: MockJob) => {
    const newFeatured = !job.featured;
    setActionLoadingId(job._id);
    try {
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, featured: newFeatured } : j))
      );

      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newFeatured ? `Job "${job.title}" marked as Featured!` : `Job un-featured.`);
      }
    } catch {
      loadAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Update Job Status (active / filled / closed / expired)
  const handleUpdateJobStatus = async (
    job: MockJob,
    newStatus: "active" | "filled" | "closed" | "expired"
  ) => {
    setActionLoadingId(job._id);
    try {
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );

      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Job status changed to "${newStatus.toUpperCase()}".`);
      }
    } catch {
      loadAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Job
  const handleDeleteJob = async (job: MockJob) => {
    if (!confirm(`Delete opening "${job.title}" at ${job.company}?`)) return;

    setActionLoadingId(job._id);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== job._id));
        showToast(`Job "${job.title}" deleted successfully.`);
      }
    } catch {
      showToast("Error deleting job.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Users (All Users, Employers Only, Employees/Job Seekers Only, or Blocked/Reported)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter: 'all' | 'employer' | 'seeker' | 'admin' | 'blocked'
      if (userRoleFilter === "employer" && u.role !== "employer") return false;
      if (userRoleFilter === "seeker" && u.role !== "seeker") return false;
      if (userRoleFilter === "admin" && u.role !== "admin") return false;
      if (userRoleFilter === "blocked" && !u.isBlocked && !u.isReported) return false;

      // Status / Verification Filter
      if (userVerifiedFilter === "verified" && !u.isVerified) return false;
      if (userVerifiedFilter === "unverified" && u.isVerified) return false;
      if (userVerifiedFilter === "blocked" && !u.isBlocked) return false;
      if (userVerifiedFilter === "reported" && !u.isReported) return false;

      // Search (Name, email, company, headline, phone, skills)
      if (userSearch) {
        const q = userSearch.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesCompany = u.companyName?.toLowerCase().includes(q);
        const matchesHeadline = u.headline?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesSkills = u.skills?.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesEmail || matchesCompany || matchesHeadline || matchesPhone || matchesSkills;
      }
      return true;
    });
  }, [users, userSearch, userRoleFilter, userVerifiedFilter]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (jobStatusFilter === "featured" && !j.featured) return false;
      if (jobStatusFilter !== "all" && jobStatusFilter !== "featured" && j.status !== jobStatusFilter) return false;
      if (jobSearch) {
        const q = jobSearch.toLowerCase();
        const matchesTitle = j.title?.toLowerCase().includes(q);
        const matchesCompany = j.company?.toLowerCase().includes(q);
        const matchesLoc = j.location?.toLowerCase().includes(q);
        return matchesTitle || matchesCompany || matchesLoc;
      }
      return true;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  // Quick stats
  const totalVerifiedUsers = users.filter((u) => u.isVerified).length;
  const totalCandidates = users.filter((u) => u.role === "seeker").length;
  const totalEmployers = users.filter((u) => u.role === "employer").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalBlockedUsers = users.filter((u) => u.isBlocked || u.isReported).length;
  const totalFeaturedJobs = jobs.filter((j) => j.featured).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-[85vh]">
      {/* Admin Top Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-sm mb-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Platform Admin &amp; Moderation Center
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage user verification (Blue Ticks), moderate employer job postings, and review platform telemetry.
              </p>
            </div>
          </div>

          {/* Refresh Action Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="Refresh Admin Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Global Action Toast */}
        {actionToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Total Accounts</span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {users.length} <span className="text-xs font-semibold text-slate-500">Users</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {totalCandidates} Seekers • {totalEmployers} Employers
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-sky-800 font-bold">Blue Tick Badges</span>
              <VerifiedBadge size="sm" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-700">
              {totalVerifiedUsers} <span className="text-xs font-semibold text-sky-600">Verified</span>
            </div>
            <div className="text-[10px] text-sky-700 mt-0.5 font-semibold">
              Official Trusted Accounts
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Live Openings</span>
              <Briefcase className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-600">
              {jobs.length} <span className="text-xs font-semibold text-slate-500">Jobs</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {totalFeaturedJobs} Featured on Home
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Applications</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {dbStatus?.metrics?.applications || 2} <span className="text-xs font-semibold text-slate-500">Sent</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% Free Pipeline</div>
          </div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User &amp; Employer Moderation ({filteredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "jobs"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Listings &amp; Vacancy Status ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "system"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: USERS & BLUE TICK MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* User Type & Search Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Role Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userRoleFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Accounts ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("employer")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    userRoleFilter === "employer"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Employers ({totalEmployers})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("seeker")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    userRoleFilter === "seeker"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Employees / Seekers ({totalCandidates})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("blocked")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    userRoleFilter === "blocked"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Reported / Blocked ({totalBlockedUsers})</span>
                </button>
              </div>

              {/* Status Select Filter */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <span className="text-[11px] font-bold text-slate-400">Filter By Status:</span>
                <select
                  value={userVerifiedFilter}
                  onChange={(e) => setUserVerifiedFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified (Blue Tick)</option>
                  <option value="unverified">Unverified</option>
                  <option value="blocked">Blocked Accounts</option>
                  <option value="reported">Reported Accounts</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user name, email, company, phone, headline, or skills..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  User &amp; Employer Moderation Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter by Employers or Employees, verify authentic corporate accounts with Blue Ticks, and report or block scam accounts.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {filteredUsers.length} Accounts Displayed
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">Loading user directory...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No users match your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-black">User Details</th>
                      <th className="pb-3 font-black">Account Role</th>
                      <th className="pb-3 font-black">Organization / Affiliation</th>
                      <th className="pb-3 font-black text-center">Blue Tick Status</th>
                      <th className="pb-3 font-black text-right">Moderation &amp; Safety Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const uId = u._id || u.id || "";
                      const isPending = actionLoadingId === uId;
                      const userJobsCount = getUserJobsCount(u);

                      return (
                        <tr key={uId} className={`hover:bg-slate-50/70 transition-colors ${u.isBlocked ? "bg-rose-50/30" : ""}`}>
                          {/* User Avatar + Name + Email + Status Badges */}
                          <td className="py-3 pr-3">
                            <div className="flex items-start gap-2.5">
                              {u.avatar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                                  {u.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <span>{u.name}</span>
                                  {u.isVerified && <VerifiedBadge size="xs" />}
                                </div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                                {u.phone && (
                                  <div className="text-[10px] text-slate-400">{u.phone}</div>
                                )}

                                {/* Status tags for Blocked / Reported */}
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  {u.isBlocked && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      <Ban className="w-2.5 h-2.5" />
                                      <span>Blocked (Cannot Post)</span>
                                    </span>
                                  )}
                                  {u.isReported && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                                      title={u.reportReason}
                                    >
                                      <Flag className="w-2.5 h-2.5" />
                                      <span>Reported: {u.reportReason || "Policy Violation"}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 pr-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : u.role === "employer"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {u.role === "employer" ? "Employer" : u.role === "admin" ? "Admin" : "Job Seeker / Employee"}
                            </span>
                          </td>

                          {/* Company / Headline */}
                          <td className="py-3 pr-3">
                            {u.role === "employer" ? (
                              <div>
                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                  <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                  <span>{u.companyName || "Independent Employer"}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                  {userJobsCount > 0 ? (
                                    <span className="text-orange-700 font-bold">{userJobsCount} Active Job Vacancies</span>
                                  ) : (
                                    "0 Active Jobs"
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-[11px] text-slate-800 font-medium line-clamp-1 max-w-xs">
                                  {u.headline || "Job Candidate"}
                                </div>
                                {u.location && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {u.location}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Blue Tick Badge & One-Click Toggle (Employers Only) */}
                          <td className="py-3 text-center">
                            {u.role === "employer" ? (
                              <button
                                onClick={() => handleToggleBlueTick(u)}
                                disabled={isPending}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                                  u.isVerified
                                    ? "bg-sky-50 text-sky-700 border-2 border-sky-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
                                }`}
                                title={
                                  u.isVerified
                                    ? "Click to revoke Blue Tick verification"
                                    : "Click to grant Blue Tick verified badge"
                                }
                              >
                                {u.isVerified ? (
                                  <>
                                    <VerifiedBadge size="xs" />
                                    <span>Verified (Revoke)</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400"></span>
                                    <span>Give Blue Tick</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                                Employers Only
                              </span>
                            )}
                          </td>

                          {/* Moderation Actions (Report, Block/Unblock, Role, Delete) */}
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Report Account Button */}
                              <button
                                onClick={() => setReportModalUser(u)}
                                disabled={isPending}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                title="Report account for fake jobs, scams, or abuse"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Report</span>
                              </button>

                              {/* Block / Unblock Button */}
                              {u.isBlocked ? (
                                <button
                                  onClick={() => handleToggleBlock(u)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                  title="Click to unblock account"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Unblock</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setBlockModalUser(u)}
                                  disabled={isPending || u.email === currentAdminUser?.email}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                  title="Block this account & optionally delete jobs"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Block</span>
                                </button>
                              )}

                              {/* Quick Role Switcher */}
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeRole(u, e.target.value as any)}
                                disabled={isPending}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer focus:outline-none"
                              >
                                <option value="seeker">Seeker</option>
                                <option value="employer">Employer</option>
                                <option value="admin">Admin</option>
                              </select>

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={isPending || u.email === currentAdminUser?.email}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30"
                                title="Delete account completely"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOBS MODERATION */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Job Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search job title, company, location..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Filter By Status:</span>
              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Vacancies</option>
                <option value="active">Active Only</option>
                <option value="filled">Position Filled</option>
                <option value="closed">Closed Only</option>
                <option value="expired">Expired Only</option>
                <option value="featured">Featured On Home</option>
              </select>
            </div>
          </div>

          {/* Job Table */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Job Vacancy Lifecycle &amp; Moderation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage vacancy status (Active, Position Filled, Closed, Expired), edit opening details, review validity days, or remove listings.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                {filteredJobs.length} Vacancies
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">Loading job listings...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No jobs match your filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-black">Opening &amp; Company</th>
                      <th className="pb-3 font-black">Compensation (Monthly &amp; LPA)</th>
                      <th className="pb-3 font-black">Vacancies &amp; Expiry</th>
                      <th className="pb-3 font-black text-center">Featured</th>
                      <th className="pb-3 font-black text-center">Vacancy Status</th>
                      <th className="pb-3 font-black text-right">Edit &amp; Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((j) => {
                      const isPending = actionLoadingId === j._id;
                      const exp = getDaysRemaining(j.expiresAt);

                      return (
                        <tr key={j._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pr-3">
                            <div className="font-bold text-slate-900">{j.title}</div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600">
                              <span>{j.company}</span>
                              <VerifiedBadge size="xs" />
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 font-normal">{j.location}</span>
                            </div>
                          </td>

                          {/* Compensation */}
                          <td className="py-3 pr-3 font-semibold text-slate-900">
                            <div>{formatSalary(j.salaryMin, j.salaryMax)}</div>
                          </td>

                          {/* Vacancies & Expiry */}
                          <td className="py-3 pr-3">
                            <div className="font-bold text-slate-700">
                              {j.openingsCount || 1} Openings
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                                exp.isExpired
                                  ? "bg-rose-100 text-rose-800"
                                  : exp.days <= 7
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              {exp.label}
                            </span>
                          </td>

                          {/* Toggle Featured */}
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleToggleJobFeatured(j)}
                              disabled={isPending}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                j.featured
                                  ? "bg-amber-50 text-amber-600 border-amber-300"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                              title={j.featured ? "Unmark featured" : "Feature on homepage"}
                            >
                              <Star className={`w-4 h-4 ${j.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          </td>

                          {/* Vacancy Status Selector (Active, Position Filled, Closed, Expired) */}
                          <td className="py-3 text-center">
                            <select
                              value={j.status}
                              onChange={(e) =>
                                handleUpdateJobStatus(
                                  j,
                                  e.target.value as "active" | "filled" | "closed" | "expired"
                                )
                              }
                              disabled={isPending}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                j.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : j.status === "filled"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : j.status === "expired"
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              <option value="active">🟢 Active</option>
                              <option value="filled">💼 Position Filled</option>
                              <option value="closed">🔒 Closed</option>
                              <option value="expired">⏳ Expired</option>
                            </select>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingJob(j)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                                title="Edit job details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(j)}
                                disabled={isPending}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete job listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH & MAINTENANCE */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-orange-600" />
              <span>Database Cluster Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time connectivity and persistence status with MongoDB Atlas.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Database Engine:</span>
                <span className="font-black text-slate-900">{dbStatus?.database || "MongoDB Atlas"}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Cluster Status:</span>
                <span className="font-black text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online &amp; Operational
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Registered Users:</span>
                <span className="font-black text-slate-900">{users.length} Records</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Total Openings:</span>
                <span className="font-black text-slate-900">{jobs.length} Positions</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <span>Ecosystem Synchronization</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reset mock data or synchronize fresh live jobs from free public APIs.
            </p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/clean-mock-data", { method: "POST" });
                    const d = await res.json();
                    showToast(d.message || "All fake jobs purged!");
                    loadAllData();
                  } catch {
                    showToast("Clean mock data error");
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <span>Purge All Mock / Fake Data (Keep Database 100% Clean)</span>
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/external-jobs", { method: "POST" });
                    const d = await res.json();
                    showToast(d.message || "Synced external jobs!");
                    loadAllData();
                  } catch {
                    showToast("External sync error");
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <span>Fetch Live Jobs from Free Public Remotive API</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal from Admin Panel */}
      {editingJob && (
        <PostJobModal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onJobCreated={() => {
            setEditingJob(null);
            loadAllData();
          }}
          jobToEdit={editingJob}
        />
      )}

      {/* Report Account Modal */}
      {reportModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setReportModalUser(null);
                setCustomReportNote("");
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Report &amp; Restrict Account
                </h3>
                <p className="text-xs text-slate-500">
                  Flag account for policy violations, fake vacancies, or suspicious activities.
                </p>
              </div>
            </div>

            {/* Target Account Info */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">{reportModalUser.name}</div>
                <div className="text-[11px] text-slate-500">{reportModalUser.email}</div>
                {reportModalUser.companyName && (
                  <div className="text-[10px] text-orange-700 font-semibold mt-0.5">
                    {reportModalUser.companyName}
                  </div>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-black uppercase">
                {reportModalUser.role}
              </span>
            </div>

            {/* Report Reason Dropdown */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Violation / Report Reason
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Fake Job Vacancies / Scams">Fake Job Vacancies / Scams</option>
                <option value="Charging Money / Fees from Candidates">Charging Money / Fees from Candidates</option>
                <option value="Misleading Salary or Information">Misleading Salary or Information</option>
                <option value="Inappropriate / Abusive Communication">Inappropriate / Abusive Communication</option>
                <option value="Spam / Duplicate Accounts">Spam / Duplicate Accounts</option>
                <option value="Other Policy Violation">Other Policy Violation</option>
              </select>
            </div>

            {/* Additional Note */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Admin Notes / Investigation Details (Optional)
              </label>
              <textarea
                rows={2}
                value={customReportNote}
                onChange={(e) => setCustomReportNote(e.target.value)}
                placeholder="Specific evidence or complaints received..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Checkboxes */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 mb-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={reportAlsoBlock}
                  onChange={(e) => setReportAlsoBlock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>Also Block this account (Cannot post new job vacancies)</span>
              </label>

              {reportAlsoBlock && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-800 ml-6">
                  <input
                    type="checkbox"
                    checked={reportAlsoDeleteJobs}
                    onChange={(e) => setReportAlsoDeleteJobs(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    Delete all ({getUserJobsCount(reportModalUser)}) job openings posted by this employer
                  </span>
                </label>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportModalUser(null);
                  setCustomReportNote("");
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportAccount}
                disabled={actionLoadingId === (reportModalUser._id || reportModalUser.id)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Confirm Report &amp; Restrict</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Account Modal */}
      {blockModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setBlockModalUser(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Block Account: {blockModalUser.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Restricts account from creating, modifying, or publishing vacancies.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-xs">
              <div className="font-bold text-slate-800">{blockModalUser.email}</div>
              <div className="text-slate-500 mt-0.5">Role: <span className="font-bold uppercase">{blockModalUser.role}</span></div>
              {blockModalUser.companyName && (
                <div className="text-slate-500 mt-0.5">Company: <span className="font-bold">{blockModalUser.companyName}</span></div>
              )}
            </div>

            {/* Delete Jobs Option */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 mb-5">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-rose-900">
                <input
                  type="checkbox"
                  checked={blockDeleteJobs}
                  onChange={(e) => setBlockDeleteJobs(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
                />
                <div>
                  <div>Delete all posted jobs ({getUserJobsCount(blockModalUser)} active openings)</div>
                  <div className="text-[11px] font-normal text-rose-700 mt-0.5">
                    Instantly purges all vacancies posted by this user from public search.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleBlock(blockModalUser, blockDeleteJobs)}
                disabled={actionLoadingId === (blockModalUser._id || blockModalUser.id)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm &amp; Block Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
