"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Printer,
  Download,
  Save,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Camera,
  Image as ImageIcon,
  Building2,
  Calendar,
  Languages,
  Eye,
  Sliders,
  Type,
  Maximize2,
  Wrench,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { compressImageToWebP } from "@/lib/image-compressor";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    photoUrl?: string;
    showPhoto: boolean;
  };
  summary: string;
  experience: {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    year: string;
    score: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: {
    id: string;
    title: string;
    techStack: string;
    link: string;
    description: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
}

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type TemplateType = "corporate" | "modern" | "minimal" | "executive";
type ColorTheme = "navy" | "slate" | "emerald" | "burgundy";
type PageSpacing = "compact" | "normal" | "spacious";

export function ResumeBuilderModal({ isOpen, onClose, onSaved }: ResumeBuilderModalProps) {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "experience" | "education" | "skills" | "projects" | "extras">("personal");
  const [template, setTemplate] = useState<TemplateType>("corporate");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("navy");
  const [spacing, setSpacing] = useState<PageSpacing>("normal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newTechSkill, setNewTechSkill] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");

  const addTechSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || resume.skills.technical.includes(trimmed)) return;
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...prev.skills.technical, trimmed],
      },
    }));
    setNewTechSkill("");
  };

  const removeTechSkill = (index: number) => {
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index),
      },
    }));
  };

  const addTool = (tool: string) => {
    const trimmed = tool.trim();
    if (!trimmed || resume.skills.tools.includes(trimmed)) return;
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        tools: [...prev.skills.tools, trimmed],
      },
    }));
    setNewTool("");
  };

  const removeTool = (index: number) => {
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        tools: prev.skills.tools.filter((_, i) => i !== index),
      },
    }));
  };

  const addSoftSkill = (soft: string) => {
    const trimmed = soft.trim();
    if (!trimmed || resume.skills.soft.includes(trimmed)) return;
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: [...prev.skills.soft, trimmed],
      },
    }));
    setNewSoftSkill("");
  };

  const removeSoftSkill = (index: number) => {
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: prev.skills.soft.filter((_, i) => i !== index),
      },
    }));
  };

  // Resume State initialized from user profile
  const [resume, setResume] = useState<ResumeData>({
    personalInfo: {
      fullName: user?.name || "Rohit Verma",
      headline: user?.headline || "Senior Software Engineer (Full Stack)",
      email: user?.email || "rohit.verma@example.com",
      phone: user?.phone || "+91 98765 43210",
      location: user?.location || "Bengaluru, Karnataka, India",
      linkedin: user?.linkedinUrl || "linkedin.com/in/rohitverma",
      github: user?.githubUrl || "github.com/rohitverma",
      portfolio: user?.portfolioUrl || "rohitverma.dev",
      photoUrl: user?.avatar || "",
      showPhoto: true,
    },
    summary:
      user?.bio ||
      "Results-driven Senior Software Engineer with 4+ years of expertise in architecting high-scale web platforms, distributed cloud microservices, and responsive user interfaces. Proven track record of boosting system performance by 40% and deploying mission-critical enterprise applications.",
    experience:
      user?.experienceHistory && user.experienceHistory.length > 0
        ? user.experienceHistory.map((exp, idx) => ({
            id: `exp-${idx}`,
            role: exp.role || "Software Developer",
            company: exp.company || "Corporate Tech Solutions",
            location: "Bengaluru, India",
            startDate: "2022",
            endDate: "Present",
            current: true,
            bullets: exp.description
              ? exp.description.split(".").filter((b: string) => b.trim().length > 5)
              : [
                  "Architected core web services with Next.js and TypeScript serving 100K+ monthly active users.",
                  "Reduced API latency by 35% through Redis caching and optimized database query execution.",
                  "Collaborated with cross-functional product and engineering teams to deliver bi-weekly production releases.",
                ],
          }))
        : [
            {
              id: "exp-1",
              role: "Senior Full Stack Engineer",
              company: "TechNexus Enterprises",
              location: "Bengaluru, India",
              startDate: "Jan 2023",
              endDate: "Present",
              current: true,
              bullets: [
                "Engineered responsive user dashboards in React and Next.js, boosting user engagement by 45%.",
                "Built secure RESTful APIs with Node.js and MongoDB handling 2M+ transactions monthly.",
                "Mentored 4 junior engineers on coding best practices, automated unit tests, and CI/CD pipelines.",
              ],
            },
            {
              id: "exp-2",
              role: "Software Developer",
              company: "Innovate Digital Labs",
              location: "Chandigarh, India",
              startDate: "Jul 2021",
              endDate: "Dec 2022",
              current: false,
              bullets: [
                "Developed front-facing components with modern Tailwind CSS and optimized client state management.",
                "Integrated third-party payment gateways, SMS notifications, and OAuth2 authentication workflows.",
              ],
            },
          ],
    education:
      user?.education && user.education.length > 0
        ? user.education.map((edu, idx) => ({
            id: `edu-${idx}`,
            degree: edu.degree || "B.Tech in Computer Science & Engineering",
            institution: edu.institution || "National Institute of Technology",
            location: "India",
            year: edu.year || "2021",
            score: "8.6 CGPA",
          }))
        : [
            {
              id: "edu-1",
              degree: "B.Tech in Computer Science & Engineering",
              institution: "Punjab Technical University",
              location: "Jalandhar, Punjab",
              year: "2021",
              score: "8.5 CGPA / 82%",
            },
          ],
    skills: {
      technical:
        user?.skills && user.skills.length > 0
          ? user.skills
          : ["React.js", "Next.js", "TypeScript", "Node.js", "Express", "MongoDB", "PostgreSQL", "Tailwind CSS", "REST APIs"],
      soft: ["Problem Solving", "Team Leadership", "Cross-Functional Collaboration", "Agile & Scrum"],
      tools: ["Git & GitHub", "Docker", "Postman", "AWS (EC2/S3)", "VS Code", "Figma"],
    },
    projects: [
      {
        id: "proj-1",
        title: "Enterprise Talent & Job Nexus Portal",
        techStack: "Next.js 16, TypeScript, MongoDB, Tailwind CSS",
        link: "https://manpowermaster.com",
        description: "Built a high-performance recruitment portal featuring split-screen job discovery, automated ATS resume screening, and recruiter applicant tracking.",
      },
      {
        id: "proj-2",
        title: "Real-Time Cloud Analytics Dashboard",
        techStack: "React, Node.js, WebSockets, Chart.js",
        link: "https://github.com/example/analytics",
        description: "Developed live metrics streaming engine tracking server health, response latencies, and conversion funnels with sub-second alert notifications.",
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        year: "2023",
      },
      {
        id: "cert-2",
        name: "Meta Certified Front-End Developer",
        issuer: "Meta / Coursera",
        year: "2022",
      },
    ],
    languages: [
      { language: "English", proficiency: "Professional Working" },
      { language: "Hindi", proficiency: "Native / Bilingual" },
      { language: "Punjabi", proficiency: "Fluent" },
    ],
  });

  // Sync state with user profile when opened
  useEffect(() => {
    if (user && isOpen) {
      setResume((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user.name || prev.personalInfo.fullName,
          headline: user.headline || prev.personalInfo.headline,
          email: user.email || prev.personalInfo.email,
          phone: user.phone || prev.personalInfo.phone,
          location: user.location || prev.personalInfo.location,
          linkedin: user.linkedinUrl || prev.personalInfo.linkedin,
          github: user.githubUrl || prev.personalInfo.github,
          portfolio: user.portfolioUrl || prev.personalInfo.portfolio,
          photoUrl: user.avatar || prev.personalInfo.photoUrl,
        },
        skills: {
          ...prev.skills,
          technical: user.skills && user.skills.length > 0 ? user.skills : prev.skills.technical,
        },
      }));
    }
  }, [user, isOpen]);

  // Compute Live ATS Compatibility Score
  const atsScore = React.useMemo(() => {
    let score = 20; // base score
    if (resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone) score += 20;
    if (resume.summary && resume.summary.length > 80) score += 15;
    if (resume.experience.length > 0) score += 20;
    if (resume.education.length > 0) score += 15;
    if (resume.skills.technical.length >= 5) score += 10;
    return Math.min(score, 100);
  }, [resume]);

  if (!isOpen) return null;

  // Theme color definitions
  const themeColors = {
    navy: {
      primary: "#1e3a8a",
      primaryText: "text-blue-900",
      border: "border-blue-900",
      accentBg: "bg-blue-50",
      pillBg: "bg-blue-900 text-white",
    },
    slate: {
      primary: "#334155",
      primaryText: "text-slate-800",
      border: "border-slate-800",
      accentBg: "bg-slate-50",
      pillBg: "bg-slate-800 text-white",
    },
    emerald: {
      primary: "#065f46",
      primaryText: "text-emerald-900",
      border: "border-emerald-800",
      accentBg: "bg-emerald-50",
      pillBg: "bg-emerald-800 text-white",
    },
    burgundy: {
      primary: "#831843",
      primaryText: "text-pink-950",
      border: "border-pink-950",
      accentBg: "bg-pink-50",
      pillBg: "bg-pink-950 text-white",
    },
  };

  const currentTheme = themeColors[colorTheme];

  // Spacing styling maps
  const spacingMap = {
    compact: { gap: "space-y-4", padding: "p-6 sm:p-8", fontSize: "text-[11px]" },
    normal: { gap: "space-y-6", padding: "p-8 sm:p-12", fontSize: "text-xs" },
    spacious: { gap: "space-y-8", padding: "p-10 sm:p-14", fontSize: "text-sm" },
  };

  // Handle Photo / DP Upload with in-browser WebP compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const compressed = await compressImageToWebP(file, 400, 0.85);
      setResume((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          photoUrl: compressed.dataUrl,
          showPhoto: true,
        },
      }));
    } catch (err) {
      console.error("Photo compression error:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save to Profile & Set as Active Resume
  const handleSaveToProfile = async () => {
    try {
      setIsSaving(true);
      const fileName = `${resume.personalInfo.fullName.replace(/\s+/g, "_")}_ATS_Resume.pdf`;
      const resumeUrl = `/resumes/${fileName}`;

      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          email: user?.email,
          resumeUrl,
          resumeFileName: fileName,
          headline: resume.personalInfo.headline,
          bio: resume.summary,
          phone: resume.personalInfo.phone,
          location: resume.personalInfo.location,
          avatar: resume.personalInfo.photoUrl || user?.avatar,
          skills: resume.skills.technical,
          education: resume.education.map((e) => ({
            degree: e.degree,
            institution: e.institution,
            year: e.year,
          })),
          experienceHistory: resume.experience.map((e) => ({
            role: e.role,
            company: e.company,
            duration: `${e.startDate} - ${e.endDate}`,
            description: e.bullets.join(". "),
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUser({
          resumeUrl,
          resumeFileName: fileName,
          headline: resume.personalInfo.headline,
          bio: resume.summary,
          avatar: resume.personalInfo.photoUrl || user?.avatar,
          skills: resume.skills.technical,
        });

        setSaveSuccess(true);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onSaved) onSaved();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Browser Print (Generates High-Res Vector PDF)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
      <div className="relative w-full max-w-7xl h-[95vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  ATS Professional Resume Builder
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ATS 100% Compatible
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Live interactive ATS builder with vector PDF export &amp; instant candidate profile attachment.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ATS Score Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-600" />
                ATS Score:
              </span>
              <span className="font-extrabold text-emerald-700">{atsScore}/100</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${atsScore}%` }}
                />
              </div>
            </div>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as Vector PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print / Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Save to Profile Button */}
            <button
              onClick={handleSaveToProfile}
              disabled={isSaving}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>Saving...</>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Attached!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Attach to Profile</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template & Styling Toolbar (Hidden on Print) */}
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Template Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Format:</span>
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {(["corporate", "modern", "minimal", "executive"] as TemplateType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer capitalize ${
                    template === t ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t === "corporate" ? "Naukri Corporate" : t === "modern" ? "Modern Tech" : t === "minimal" ? "Minimal ATS" : "Executive"}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: DP Toggle + Palette Theme + Spacing */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Photo Toggle */}
            <button
              onClick={() =>
                setResume((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    showPhoto: !prev.personalInfo.showPhoto,
                  },
                }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                resume.personalInfo.showPhoto
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
              }`}
              title="Toggle Photo visibility on Resume sheet"
            >
              <Camera className="w-3 h-3 text-emerald-600" />
              <span>Photo: {resume.personalInfo.showPhoto ? "Visible" : "Hidden"}</span>
            </button>

            {/* Spacing Switcher */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-500 text-[11px]">Density:</span>
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                {(["compact", "normal", "spacious"] as PageSpacing[]).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpacing(sp)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      spacing === sp ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Accents */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
              {(["navy", "slate", "emerald", "burgundy"] as ColorTheme[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setColorTheme(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                    colorTheme === c ? "scale-110 border-slate-900 shadow-xs" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor:
                      c === "navy"
                        ? "#1e3a8a"
                        : c === "slate"
                        ? "#334155"
                        : c === "emerald"
                        ? "#065f46"
                        : "#831843",
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Work Area: Left Editor Panel + Right Live Resume Sheet */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:block">
          
          {/* Left Editor Panel (Hidden on Print) */}
          <div className="w-full lg:w-5/12 border-r border-slate-200 bg-white flex flex-col overflow-hidden print:hidden">
            {/* Editor Sub-Tabs with Crisp Icons */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto shrink-0">
              {[
                { id: "personal", label: "Contact & DP", icon: User },
                { id: "summary", label: "Summary", icon: Sparkles },
                { id: "experience", label: "Experience", icon: Briefcase },
                { id: "education", label: "Education", icon: GraduationCap },
                { id: "skills", label: "Core Competencies & Skills", icon: Code2 },
                { id: "projects", label: "Projects", icon: FolderGit2 },
                { id: "extras", label: "Certs & Langs", icon: Award },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? "bg-white text-orange-600 shadow-2xs border border-slate-200 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Forms Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              
              {/* TAB 1: Personal, Photo & Contact */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  
                  {/* Photo / DP Upload Block */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-orange-600" />
                        <span>Candidate Photo (DP)</span>
                      </span>
                      
                      {/* Photo Toggle Switch */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-[11px] font-semibold text-slate-600">Include in Resume</span>
                        <input
                          type="checkbox"
                          checked={resume.personalInfo.showPhoto}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: {
                                ...resume.personalInfo,
                                showPhoto: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-orange-600 rounded-sm cursor-pointer accent-orange-600"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="relative shrink-0">
                        {resume.personalInfo.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resume.personalInfo.photoUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-[9px] mt-0.5">No DP</span>
                          </div>
                        )}
                      </div>

                      {/* Upload & Actions */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{uploadingPhoto ? "Compressing..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              disabled={uploadingPhoto}
                              className="hidden"
                            />
                          </label>

                          {resume.personalInfo.photoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setResume({
                                  ...resume,
                                  personalInfo: {
                                    ...resume.personalInfo,
                                    photoUrl: "",
                                  },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Lightweight WebP conversion keeps resume vector PDF fast and under 50KB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Fields with Icons */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.fullName}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-semibold"
                          placeholder="e.g. Rohit Verma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Professional Headline *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.headline}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, headline: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
                          placeholder="e.g. Senior Software Engineer • React | Node | Cloud"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="email"
                            value={resume.personalInfo.email}
                            onChange={(e) =>
                              setResume({
                                ...resume,
                                personalInfo: { ...resume.personalInfo, email: e.target.value },
                              })
                            }
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
                            placeholder="e.g. rohit@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Phone / WhatsApp *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={resume.personalInfo.phone}
                            onChange={(e) =>
                              setResume({
                                ...resume,
                                personalInfo: { ...resume.personalInfo, phone: e.target.value },
                              })
                            }
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
                            placeholder="e.g. +91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Location (City, State, Country)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.location}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, location: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
                          placeholder="e.g. Bengaluru, Karnataka, India"
                        />
                      </div>
                    </div>

                    {/* Social Web Links with Icons */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Professional Links
                      </span>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.linkedin}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, linkedin: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                          placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-700">
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.github}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, github: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                          placeholder="GitHub URL (e.g. github.com/username)"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-600">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={resume.personalInfo.portfolio}
                          onChange={(e) =>
                            setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, portfolio: e.target.value },
                            })
                          }
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                          placeholder="Portfolio / Personal Website"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Summary / Objective */}
              {activeTab === "summary" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>Executive Professional Summary</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {resume.summary.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500 leading-relaxed font-medium"
                    placeholder="Brief 3-4 sentence overview of your career, core specializations, and quantifiable achievements."
                  />

                  {/* 1-Click AI Presets */}
                  <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200">
                    <div className="text-[11px] font-bold text-orange-900 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>1-Click Preset Suggestions</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary:
                              "Enthusiastic and results-driven Software Engineer with a solid foundation in modern web frameworks, data structures, and database design. Eager to leverage strong problem-solving and rapid learning capabilities to contribute to mission-critical engineering projects.",
                          })
                        }
                        className="p-1.5 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 text-left text-[11px] font-semibold text-slate-800 transition-colors cursor-pointer"
                      >
                        Fresher / Graduate
                      </button>
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            summary:
                              "Versatile Full Stack Developer with 4+ years of hands-on experience designing and scaling web platforms with Next.js, Node.js, and cloud microservices. Proven expertise in reducing latency, implementing automated testing, and mentoring junior engineers.",
                          })
                        }
                        className="p-1.5 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 text-left text-[11px] font-semibold text-slate-800 transition-colors cursor-pointer"
                      >
                        Experienced Engineer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Work Experience */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                      <span>Work Experience Timeline</span>
                    </span>
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          experience: [
                            ...resume.experience,
                            {
                              id: `exp-${Date.now()}`,
                              role: "Software Engineer",
                              company: "New Company",
                              location: "City, India",
                              startDate: "2023",
                              endDate: "Present",
                              current: true,
                              bullets: ["Engineered scalable features and maintained high code quality."],
                            },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3" /> Add Role
                    </button>
                  </div>

                  {resume.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 relative group"
                    >
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            experience: resume.experience.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2 pr-6">
                        <div className="relative">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...resume.experience];
                              updated[idx].role = e.target.value;
                              setResume({ ...resume, experience: updated });
                            }}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                            placeholder="Designation / Role"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...resume.experience];
                            updated[idx].company = e.target.value;
                            setResume({ ...resume, experience: updated });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                          placeholder="Company Name"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...resume.experience];
                            updated[idx].startDate = e.target.value;
                            setResume({ ...resume, experience: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="Start (e.g. 2022)"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...resume.experience];
                            updated[idx].endDate = e.target.value;
                            setResume({ ...resume, experience: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="End (or Present)"
                        />
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const updated = [...resume.experience];
                            updated[idx].location = e.target.value;
                            setResume({ ...resume, experience: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="City, Country"
                        />
                      </div>

                      {/* Bullets */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Key Achievements (1 per line)
                        </label>
                        <textarea
                          rows={3}
                          value={exp.bullets.join("\n")}
                          onChange={(e) => {
                            const updated = [...resume.experience];
                            updated[idx].bullets = e.target.value
                              .split("\n")
                              .filter((b) => b.trim().length > 0);
                            setResume({ ...resume, experience: updated });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs leading-relaxed"
                          placeholder="Enter measurable achievements (e.g. Increased speed by 30%)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Education */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                      <span>Academic Credentials</span>
                    </span>
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          education: [
                            ...resume.education,
                            {
                              id: `edu-${Date.now()}`,
                              degree: "B.Tech / Degree",
                              institution: "University / Institute",
                              location: "India",
                              year: "2023",
                              score: "8.0 CGPA",
                            },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3" /> Add Degree
                    </button>
                  </div>

                  {resume.education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative"
                    >
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            education: resume.education.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resume.education];
                          updated[idx].degree = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        placeholder="Degree / Qualification"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[idx].institution = e.target.value;
                            setResume({ ...resume, education: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] col-span-2"
                          placeholder="College / Institute"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[idx].year = e.target.value;
                            setResume({ ...resume, education: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="Year"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: Core Competencies & Skills */}
              {activeTab === "skills" && (
                <div className="space-y-5">
                  {/* Category 1: Technical & Core Competencies */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-orange-600" />
                        <span>Technical &amp; Core Competencies ({resume.skills.technical.length})</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Visible on Resume Sheet</span>
                    </div>

                    {/* Interactive Add Skill Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTechSkill}
                        onChange={(e) => setNewTechSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTechSkill(newTechSkill);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500 bg-white"
                        placeholder="Type skill (e.g. Next.js, Python, AWS, Docker) & press Enter"
                      />
                      <button
                        type="button"
                        onClick={() => addTechSkill(newTechSkill)}
                        className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill</span>
                      </button>
                    </div>

                    {/* Interactive Chip List with Delete "X" */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resume.skills.technical.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeTechSkill(i)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* 1-Click Popular Suggestions */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        + 1-Click Popular Suggestions
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "React.js",
                          "Next.js",
                          "TypeScript",
                          "Node.js",
                          "Python",
                          "Java",
                          "AWS",
                          "Docker",
                          "MongoDB",
                          "PostgreSQL",
                          "SQL",
                          "Tailwind CSS",
                          "REST APIs",
                          "GraphQL",
                          "Git",
                          "Redis",
                        ]
                          .filter((s) => !resume.skills.technical.includes(s))
                          .slice(0, 8)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => addTechSkill(s)}
                              className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              + {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Tools & Platforms */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-orange-600" />
                      <span>Tools, Cloud &amp; Platforms ({resume.skills.tools.length})</span>
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTool(newTool);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500 bg-white"
                        placeholder="e.g. Git, Docker, Postman, Linux, VS Code, Figma"
                      />
                      <button
                        type="button"
                        onClick={() => addTool(newTool)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Tool</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resume.skills.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <span>{tool}</span>
                          <button
                            type="button"
                            onClick={() => removeTool(i)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`Remove ${tool}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Soft & Interpersonal Skills */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-orange-600" />
                      <span>Soft &amp; Interpersonal Skills ({resume.skills.soft.length})</span>
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSoftSkill}
                        onChange={(e) => setNewSoftSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSoftSkill(newSoftSkill);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500 bg-white"
                        placeholder="e.g. Problem Solving, Team Leadership, Agile / Scrum"
                      />
                      <button
                        type="button"
                        onClick={() => addSoftSkill(newSoftSkill)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resume.skills.soft.map((soft, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <span>{soft}</span>
                          <button
                            type="button"
                            onClick={() => removeSoftSkill(i)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`Remove ${soft}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Projects */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>Key Engineering Projects</span>
                    </span>
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          projects: [
                            ...resume.projects,
                            {
                              id: `proj-${Date.now()}`,
                              title: "New Web Platform",
                              techStack: "React, Node, MongoDB",
                              link: "https://github.com",
                              description: "Engineered responsive full-stack application.",
                            },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3" /> Add Project
                    </button>
                  </div>

                  {resume.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative"
                    >
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            projects: resume.projects.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx].title = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        placeholder="Project Title"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.techStack}
                          onChange={(e) => {
                            const updated = [...resume.projects];
                            updated[idx].techStack = e.target.value;
                            setResume({ ...resume, projects: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="Tech Stack Used"
                        />
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => {
                            const updated = [...resume.projects];
                            updated[idx].link = e.target.value;
                            setResume({ ...resume, projects: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-[11px]"
                          placeholder="Project URL / GitHub"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx].description = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                        placeholder="Key features and business impact..."
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: Extras (Certifications & Languages) */}
              {activeTab === "extras" && (
                <div className="space-y-4">
                  {/* Certifications */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-orange-600" />
                        <span>Certifications &amp; Accreditations</span>
                      </span>
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            certifications: [
                              ...resume.certifications,
                              {
                                id: `cert-${Date.now()}`,
                                name: "Certificate Name",
                                issuer: "Issuing Body",
                                year: "2023",
                              },
                            ],
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add
                      </button>
                    </div>

                    {resume.certifications.map((cert, idx) => (
                      <div
                        key={cert.id}
                        className="p-2 mb-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...resume.certifications];
                            updated[idx].name = e.target.value;
                            setResume({ ...resume, certifications: updated });
                          }}
                          className="flex-1 px-2 py-1 rounded-md border border-slate-300 text-[11px] font-semibold"
                          placeholder="Certification Title"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...resume.certifications];
                            updated[idx].issuer = e.target.value;
                            setResume({ ...resume, certifications: updated });
                          }}
                          className="w-32 px-2 py-1 rounded-md border border-slate-300 text-[11px]"
                          placeholder="Issuer (e.g. AWS)"
                        />
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              certifications: resume.certifications.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Languages */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-orange-600" />
                      <span>Languages Known</span>
                    </span>
                    <div className="space-y-1.5">
                      {resume.languages.map((lang, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={lang.language}
                            onChange={(e) => {
                              const updated = [...resume.languages];
                              updated[idx].language = e.target.value;
                              setResume({ ...resume, languages: updated });
                            }}
                            className="w-32 px-2 py-1 rounded-md border border-slate-300 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={lang.proficiency}
                            onChange={(e) => {
                              const updated = [...resume.languages];
                              updated[idx].proficiency = e.target.value;
                              setResume({ ...resume, languages: updated });
                            }}
                            className="flex-1 px-2 py-1 rounded-md border border-slate-300 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Resume Sheet (Printed Area) */}
          <div className="flex-1 bg-slate-100/80 p-3 sm:p-6 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:w-full">
            
            {/* Standard A4 Styled Document Sheet */}
            <div
              id="resume-printable-sheet"
              className={`w-full max-w-[800px] min-h-[1050px] bg-white ${spacingMap[spacing].padding} shadow-xl border border-slate-200 text-slate-900 font-sans leading-normal print:shadow-none print:border-none print:p-8 print:w-full print:max-w-none print:min-h-0`}
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {/* ==================================================== */}
              {/* TEMPLATE 1: NAUKRI CORPORATE / EXECUTIVE ATS         */}
              {/* ==================================================== */}
              {template === "corporate" && (
                <div className={spacingMap[spacing].gap}>
                  {/* Header Row with Optional DP / Photo */}
                  <div className="border-b-2 pb-4 flex items-center justify-between gap-5" style={{ borderColor: currentTheme.primary }}>
                    <div className="flex-1 min-w-0">
                      <h1
                        className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight"
                        style={{ color: currentTheme.primary }}
                      >
                        {resume.personalInfo.fullName}
                      </h1>
                      <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                        {resume.personalInfo.headline}
                      </div>

                      {/* Contact Bar with Icons */}
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-600 mt-2.5 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{resume.personalInfo.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{resume.personalInfo.phone}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{resume.personalInfo.email}</span>
                        </span>
                        {resume.personalInfo.linkedin && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-700">
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              <span>{resume.personalInfo.linkedin}</span>
                            </span>
                          </>
                        )}
                        {resume.personalInfo.portfolio && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Globe className="w-3 h-3 shrink-0" />
                              <span>{resume.personalInfo.portfolio}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Candidate Photo / DP */}
                    {resume.personalInfo.showPhoto && resume.personalInfo.photoUrl && (
                      <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resume.personalInfo.photoUrl}
                          alt={resume.personalInfo.fullName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 shadow-xs"
                          style={{ borderColor: currentTheme.primary }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary with Icon */}
                  {resume.summary && (
                    <div>
                      <h3
                        className="text-xs font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                        style={{ color: currentTheme.primary }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Professional Profile</span>
                      </h3>
                      <p className={`${spacingMap[spacing].fontSize} text-slate-700 leading-relaxed text-justify`}>
                        {resume.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills Grid with Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: currentTheme.primary }}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Technical &amp; Core Competencies</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("skills")}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 print:hidden cursor-pointer"
                        title="Add or Edit Skills"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add / Edit Skills</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {resume.skills.technical.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience with Icon */}
                  <div>
                    <h3
                      className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5"
                      style={{ color: currentTheme.primary }}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Professional Work Experience</span>
                    </h3>
                    <div className="space-y-3.5">
                      {resume.experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900">
                              {exp.role} <span className="font-normal text-slate-600">at</span> {exp.company}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {exp.startDate} – {exp.endDate} | {exp.location}
                            </span>
                          </div>
                          <ul className={`list-disc list-outside pl-4 space-y-1 ${spacingMap[spacing].fontSize} text-slate-700 leading-relaxed`}>
                            {exp.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Projects with Icon */}
                  {resume.projects.length > 0 && (
                    <div>
                      <h3
                        className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                        style={{ color: currentTheme.primary }}
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Key Projects</span>
                      </h3>
                      <div className="space-y-2.5">
                        {resume.projects.map((proj) => (
                          <div key={proj.id} className="text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>
                                {proj.title}{" "}
                                <span className="font-normal text-[11px] text-slate-500 font-mono">
                                  ({proj.techStack})
                                </span>
                              </span>
                              {proj.link && (
                                <span className="text-[10px] text-blue-600 font-normal">
                                  {proj.link}
                                </span>
                              )}
                            </div>
                            <p className={`text-slate-700 ${spacingMap[spacing].fontSize} mt-0.5 leading-relaxed`}>
                              {proj.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education with Icon */}
                  <div>
                    <h3
                      className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      style={{ color: currentTheme.primary }}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Education &amp; Qualifications</span>
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      {resume.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span>
                            <span className="text-slate-600"> — {edu.institution}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications & Languages with Icons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                    {resume.certifications.length > 0 && (
                      <div>
                        <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Certifications</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5">
                          {resume.certifications.map((c) => (
                            <li key={c.id}>
                              {c.name} ({c.issuer}, {c.year})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {resume.languages.length > 0 && (
                      <div>
                        <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-blue-600" />
                          <span>Languages Known</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TEMPLATE 2: MODERN TECH / SILICON                    */}
              {/* ==================================================== */}
              {template === "modern" && (
                <div className={spacingMap[spacing].gap}>
                  {/* Top Bar Accent */}
                  <div className="flex items-center justify-between border-b pb-4 border-slate-200 gap-4">
                    <div className="flex items-center gap-4">
                      {resume.personalInfo.showPhoto && resume.personalInfo.photoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={resume.personalInfo.photoUrl}
                          alt={resume.personalInfo.fullName}
                          className="w-18 h-18 rounded-2xl object-cover border-2 shadow-2xs shrink-0"
                          style={{ borderColor: currentTheme.primary }}
                        />
                      )}
                      <div>
                        <h1 className="text-2xl font-black text-slate-900">{resume.personalInfo.fullName}</h1>
                        <div className="text-xs font-bold mt-0.5" style={{ color: currentTheme.primary }}>
                          {resume.personalInfo.headline}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-600 font-medium space-y-1 shrink-0">
                      <div className="flex items-center justify-end gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{resume.personalInfo.email}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{resume.personalInfo.phone}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{resume.personalInfo.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Body */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Left Column: Summary & Experience & Projects */}
                    <div className="sm:col-span-2 space-y-5">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-1.5 border-b pb-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                          <span>About Me</span>
                        </h4>
                        <p className={`${spacingMap[spacing].fontSize} text-slate-700 leading-relaxed`}>{resume.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2.5 border-b pb-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                          <span>Experience</span>
                        </h4>
                        <div className="space-y-3.5 text-xs">
                          {resume.experience.map((exp) => (
                            <div key={exp.id} className="space-y-1">
                              <div className="font-bold text-slate-900">{exp.role}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {exp.company} • {exp.startDate} - {exp.endDate}
                              </div>
                              <ul className={`list-disc pl-4 space-y-0.5 text-slate-700 ${spacingMap[spacing].fontSize}`}>
                                {exp.bullets.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {resume.projects.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2 border-b pb-1 flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                            <span>Projects</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            {resume.projects.map((p) => (
                              <div key={p.id}>
                                <div className="font-bold text-slate-900">{p.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{p.techStack}</div>
                                <p className={`text-slate-700 ${spacingMap[spacing].fontSize} mt-0.5`}>{p.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Skills, Education, Certs */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2 border-b pb-1">
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                            <span>Tech Skills</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveTab("skills")}
                            className="text-[10px] font-bold text-orange-600 hover:underline print:hidden cursor-pointer"
                          >
                            + Edit
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {resume.skills.technical.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                              style={{
                                backgroundColor: currentTheme.primary + "15",
                                color: currentTheme.primary,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-1.5 border-b pb-1 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                          <span>Education</span>
                        </h4>
                        <div className="space-y-2 text-xs">
                          {resume.education.map((e) => (
                            <div key={e.id}>
                              <div className="font-bold text-slate-900">{e.degree}</div>
                              <div className="text-slate-500 text-[11px]">{e.institution}</div>
                              <div className="text-[10px] font-semibold text-slate-400">{e.year}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {resume.certifications.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-1.5 border-b pb-1 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                            <span>Certifications</span>
                          </h4>
                          <div className="space-y-1.5 text-xs text-slate-700">
                            {resume.certifications.map((c) => (
                              <div key={c.id}>
                                <div className="font-bold text-[11px]">{c.name}</div>
                                <div className="text-[10px] text-slate-500">{c.issuer}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TEMPLATE 3 & 4: MINIMAL ATS / EXECUTIVE CLEAN        */}
              {/* ==================================================== */}
              {(template === "minimal" || template === "executive") && (
                <div className={`${spacingMap[spacing].gap} text-slate-800`}>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-300 gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                        {resume.personalInfo.fullName}
                      </h1>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {resume.personalInfo.headline}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{resume.personalInfo.location}</span>
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{resume.personalInfo.phone}</span>
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{resume.personalInfo.email}</span>
                        </span>
                        {resume.personalInfo.linkedin && (
                          <>
                            <span>|</span>
                            <span>{resume.personalInfo.linkedin}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {resume.personalInfo.showPhoto && resume.personalInfo.photoUrl && (
                      <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resume.personalInfo.photoUrl}
                          alt={resume.personalInfo.fullName}
                          className="w-18 h-18 rounded-xl object-cover border border-slate-300 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-slate-500" />
                      <span>Summary</span>
                    </h3>
                    <p className={`${spacingMap[spacing].fontSize} text-slate-700 leading-relaxed`}>{resume.summary}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-slate-500" />
                        <span>Technical &amp; Core Competencies</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("skills")}
                        className="text-[10px] font-bold text-orange-600 hover:underline print:hidden cursor-pointer"
                      >
                        + Add / Edit
                      </button>
                    </div>
                    <div className="text-xs text-slate-700">
                      <span className="font-bold">Languages &amp; Frameworks: </span>
                      {resume.skills.technical.join(", ")}
                    </div>
                    {resume.skills.tools.length > 0 && (
                      <div className="text-xs text-slate-700 mt-0.5">
                        <span className="font-bold">Tools &amp; Infrastructure: </span>
                        {resume.skills.tools.join(", ")}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-2 text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-slate-500" />
                      <span>Professional Experience</span>
                    </h3>
                    <div className="space-y-3">
                      {resume.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between text-xs font-bold text-slate-900">
                            <span>{exp.company} — {exp.role}</span>
                            <span className="font-medium text-slate-600">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <ul className={`list-disc pl-4 text-slate-700 space-y-0.5 mt-1 ${spacingMap[spacing].fontSize}`}>
                            {exp.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      <span>Education</span>
                    </h3>
                    {resume.education.map((e) => (
                      <div key={e.id} className="flex justify-between text-xs text-slate-800">
                        <span><strong className="text-slate-900">{e.degree}</strong>, {e.institution}</span>
                        <span>{e.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
