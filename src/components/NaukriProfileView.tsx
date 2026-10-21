"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Edit3,
  Plus,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Building2,
  Globe2,
  Eye,
  TrendingUp,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ResumeBuilderModal } from "@/components/ResumeBuilderModal";

interface NaukriProfileViewProps {
  onOpenProfileBuilder: () => void;
}

export function NaukriProfileView({ onOpenProfileBuilder }: NaukriProfileViewProps) {
  const { user, updateUser } = useAuth();
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [activeQuickLink, setActiveQuickLink] = useState("resume");

  // Calculate Naukri Profile Completeness (0-100)
  const profileScore = React.useMemo(() => {
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

  const scrollToSection = (sectionId: string) => {
    setActiveQuickLink(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const quickLinks = [
    { id: "resume", label: "Resume" },
    { id: "headline", label: "Resume Headline" },
    { id: "skills", label: "Key Skills" },
    { id: "employment", label: "Employment" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "summary", label: "Profile Summary" },
    { id: "certifications", label: "Accomplishments" },
    { id: "career-profile", label: "Desired Career Profile" },
    { id: "personal-details", label: "Personal Details" },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER: NAUKRI CANDIDATE PROFILE SUMMARY CARD         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar with Camera Trigger */}
            <div
              onClick={onOpenProfileBuilder}
              className="relative cursor-pointer group shrink-0"
              title="Click to update profile photo"
            >
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatar}
                  alt={user?.name || "Profile"}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-white shadow-xs group-hover:bg-orange-600 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Candidate Metadata */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user?.name || "Candidate Name"}
                </h1>
                {user?.isVerified && (
                  <VerifiedBadge size="sm" label="Verified Candidate" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Immediate Joiner"}
                </span>
              </div>

              {/* Headline */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <span>{user?.headline || "Senior Software Engineer (Full Stack)"}</span>
                <button
                  onClick={onOpenProfileBuilder}
                  className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
                  title="Edit Headline"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              {/* 4-Column Micro Stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>3 Years 2 Months</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.location || "Bengaluru, Karnataka"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.phone || "+91 98765 43210"}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || "candidate@example.com"}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                </span>
              </div>
            </div>
          </div>

          {/* Right: Naukri Profile Completeness Score Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-left min-w-[210px]">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                  <span>Profile Strength</span>
                </span>
                <span className="text-orange-700 font-extrabold">{profileScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5 font-medium leading-tight">
                {profileScore >= 90
                  ? "Excellent! Your profile receives 3X more recruiter reach."
                  : "Add missing details to boost your rank on recruiter searches."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsResumeBuilderOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate ATS Resume</span>
              </button>
              <button
                onClick={onOpenProfileBuilder}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Full Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TWO-COLUMN NAUKRI LAYOUT                                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Naukri Quick Links (Sticky Sidebar) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-20 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
            Quick Links
          </div>
          <nav className="space-y-0.5">
            {quickLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  activeQuickLink === item.id
                    ? "bg-orange-50 text-orange-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </nav>

          {/* FastForward Help Box */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Naukri FastForward</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Get an instant ATS score and standout resume format preferred by top Indian corporate recruiters.
            </p>
            <button
              onClick={() => setIsResumeBuilderOpen(true)}
              className="mt-2.5 w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer transition-colors"
            >
              Open Resume Builder
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Naukri Section Cards */}
        <div className="lg:col-span-9 space-y-5">
          
          {/* SECTION 1: RESUME CARD (With FastForward Generator Banner) */}
          <div
            id="resume"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Resume</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Resume is the most important document recruiters look at. Keep it updated.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>

            {/* Active Resume Status Card */}
            {user?.resumeUrl ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {user.resumeFileName || "candidate_resume.pdf"}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Attached &amp; Active
                      </span>
                      <span>•</span>
                      <span>Updated recently</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => setIsResumeBuilderOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit in Builder</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* FASTFORWARD RESUME BUILDER CALLOUT (Naukri Standard) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-orange-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Don't have a professional resume?</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Generate an ATS-Compliant Corporate Resume in 2 minutes
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Our built-in resume generator automatically formats your profile details into high-ranking ATS templates (Naukri Corporate, Modern Tech, and Minimalist) ready for instant PDF download.
                </p>
              </div>

              <button
                onClick={() => setIsResumeBuilderOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create ATS Resume</span>
              </button>
            </div>
            
            <div className="text-[11px] text-slate-400">
              Supported Formats: DOC, DOCX, PDF, RTF | Max file size: 5 MB
            </div>
          </div>

          {/* SECTION 2: RESUME HEADLINE */}
          <div
            id="headline"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Resume Headline</h2>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {user?.headline ||
                "Senior Software Engineer with 4+ years experience in React, Next.js, Node.js and building high-scale fintech & recruitment microservices."}
            </p>
            <p className="text-[11px] text-slate-400">
              It is the first thing recruiters see and read in search candidate listings.
            </p>
          </div>

          {/* SECTION 3: KEY SKILLS */}
          <div
            id="skills"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Key Skills</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recruiters search candidates based on key skills. Add your top technical &amp; functional strengths.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skills
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(user?.skills && user.skills.length > 0
                ? user.skills
                : ["React.js", "Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs", "Git", "Docker"]
              ).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 4: EMPLOYMENT (WORK EXPERIENCE) */}
          <div
            id="employment"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Employment History</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Details of current and previous organizations worked at.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Employment
              </button>
            </div>

            <div className="space-y-4">
              {(user?.experienceHistory && user.experienceHistory.length > 0
                ? user.experienceHistory
                : [
                    {
                      role: "Senior Software Engineer",
                      company: "Tech Systems Solutions",
                      duration: "2022 - Present",
                      description: "Architected modern responsive portals with Next.js and high-throughput Node.js microservices.",
                    },
                    {
                      role: "Full Stack Developer",
                      company: "Innovate Labs Ltd",
                      duration: "2020 - 2022",
                      description: "Built scalable UI components and REST APIs for enterprise clients.",
                    },
                  ]
              ).map((exp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{exp.role}</span>
                    <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                      {exp.duration}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exp.company}</span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: EDUCATION */}
          <div
            id="education"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Education</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Higher education, degree programs, and academic achievements.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            <div className="space-y-3">
              {(user?.education && user.education.length > 0
                ? user.education
                : [
                    {
                      degree: "B.Tech in Computer Science & Engineering",
                      institution: "National Institute of Technology",
                      year: "2021",
                    },
                  ]
              ).map((edu, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-500 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{edu.institution}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: PROJECTS */}
          <div
            id="projects"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Projects</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showcase projects built during academic or professional tenures.
                </p>
              </div>
              <button
                onClick={() => setIsResumeBuilderOpen(true)}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Projects in Builder
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <div className="font-bold text-xs text-slate-900">
                  Talent Acquisition &amp; Job Nexus Portal
                </div>
                <div className="text-[11px] text-orange-700 font-semibold font-mono">
                  Next.js 16 • TypeScript • MongoDB
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  High-throughput recruitment platform with split-screen job discovery and automated ATS screening.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <div className="font-bold text-xs text-slate-900">
                  Cloud Infrastructure Health Monitor
                </div>
                <div className="text-[11px] text-orange-700 font-semibold font-mono">
                  React • Node.js • WebSockets
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Live streaming telemetry engine tracking response latencies and server availability across multi-cloud instances.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 7: PROFILE SUMMARY */}
          <div
            id="summary"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Profile Summary</h2>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {user?.bio ||
                "Seasoned Full Stack Engineer with strong foundations in React, Next.js, and Node.js microservices. Proven track record in boosting system throughput, reducing database latency, and delivering high-quality corporate applications with zero downtime."}
            </p>
          </div>

          {/* SECTION 8: DESIRED CAREER PROFILE */}
          <div
            id="career-profile"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Desired Career Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps recruiters match roles with your compensation expectations and work preferences.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Desired Role
                </span>
                <span className="font-semibold text-slate-800">Software Developer / Tech Lead</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Expected CTC
                </span>
                <span className="font-bold text-slate-900">
                  ₹{user?.expectedCtc || 36} LPA (Annual)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Notice Period
                </span>
                <span className="font-semibold text-emerald-800">
                  {user?.noticePeriod || "Immediate Joiner"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Employment Type
                </span>
                <span className="font-semibold text-slate-800">Full Time / Permanent</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Preferred Workplace
                </span>
                <span className="font-semibold text-slate-800">Hybrid / Remote / On-site</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Preferred Locations
                </span>
                <span className="font-semibold text-slate-800">Bengaluru, Delhi NCR, Chandigarh</span>
              </div>
            </div>
          </div>

          {/* SECTION 9: PERSONAL DETAILS */}
          <div
            id="personal-details"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Personal Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confidential identity details verified for corporate hiring background checks.
                </p>
              </div>
              <button
                onClick={onOpenProfileBuilder}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Gender &amp; Status
                </span>
                <span className="font-semibold text-slate-800">Male • Single</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Work Authorization
                </span>
                <span className="font-semibold text-slate-800">Citizen of India</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Languages Known
                </span>
                <span className="font-semibold text-slate-800">English, Hindi, Punjabi</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded Resume Builder Modal */}
      <ResumeBuilderModal
        isOpen={isResumeBuilderOpen}
        onClose={() => setIsResumeBuilderOpen(false)}
        onSaved={() => {
          setIsResumeBuilderOpen(false);
        }}
      />
    </div>
  );
}
