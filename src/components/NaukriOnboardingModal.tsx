"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import {
  X,
  Briefcase,
  GraduationCap,
  Upload,
  FileText,
  MapPin,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";

interface NaukriOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const COMMON_SKILLS = [
  "Accounts / Tally",
  "Sales & Business Development",
  "Customer Support / Telecalling",
  "Digital Marketing",
  "Full Stack / React",
  "Python / Data Analysis",
  "Graphic Design",
  "HR & Recruitment",
  "Office Administration",
  "Back Office Operations",
  "Logistics & Dispatch",
  "Field Sales",
];

const QUALIFICATIONS = [
  "Graduation / Bachelor's Degree (B.Com, B.Tech, BCA, BA, etc.)",
  "Post Graduation / Master's (MBA, M.Com, MCA, etc.)",
  "Diploma / Polytechnic",
  "12th Pass / Higher Secondary",
  "Vocational / ITI Certification",
];

export function NaukriOnboardingModal({
  isOpen,
  onClose,
  onCompleted,
}: NaukriOnboardingModalProps) {
  const { user, login, updateUser } = useAuth();

  // Step Tracker (1 to 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("experienced");
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "Jalandhar, Punjab");
  const [noticePeriod, setNoticePeriod] = useState<string>("Immediate");
  const [expectedCtc, setExpectedCtc] = useState<string>("4.5");

  // Experienced Specific
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [totalExperienceYears, setTotalExperienceYears] = useState("2");
  const [currentCtc, setCurrentCtc] = useState("3.6");

  // Fresher Specific
  const [highestQualification, setHighestQualification] = useState(QUALIFICATIONS[0]);
  const [passingYear, setPassingYear] = useState("2025");
  const [collegeName, setCollegeName] = useState("");
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  React.useEffect(() => {
    if (!collegeName.trim() || collegeName.length < 2) {
      setCollegeSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoadingColleges(true);
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(collegeName)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.colleges)) {
          setCollegeSuggestions(data.colleges);
        }
      } catch {
        // ignore
      } finally {
        setLoadingColleges(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [collegeName]);

  // Skills
  const [skills, setSkills] = useState<string[]>([
    "Accounts / Tally",
    "Office Administration",
  ]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Resume
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      if (skills.length < 12) setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customSkillInput.trim()) {
      e.preventDefault();
      const val = customSkillInput.trim();
      if (!skills.includes(val) && skills.length < 12) {
        setSkills([...skills, val]);
      }
      setCustomSkillInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setResumeUrl(data.url);
        setResumeFileName(data.name || file.name);
      } else {
        // Fallback simulate URL
        setResumeUrl(`/uploads/${file.name}`);
        setResumeFileName(file.name);
      }
    } catch {
      setResumeUrl(`/uploads/${file.name}`);
      setResumeFileName(file.name);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const headline =
      workStatus === "experienced"
        ? `${currentDesignation || "Professional"} at ${currentCompany || "Company"} (${totalExperienceYears} Yrs Exp)`
        : `Fresher Candidate • ${highestQualification.split("(")[0].trim()}`;

    const profilePayload = {
      name: fullName || user?.name || "Job Candidate",
      email: email || user?.email || "candidate@gmail.com",
      avatar: user?.avatar || undefined,
      phone,
      location,
      headline,
      skills,
      noticePeriod,
      expectedCtc: parseFloat(expectedCtc) || 4.5,
      resumeUrl: resumeUrl || undefined,
      resumeFileName: resumeFileName || undefined,
      education: [
        {
          degree: highestQualification,
          institution: collegeName || "State University",
          year: passingYear,
        },
      ],
      experienceHistory:
        workStatus === "experienced"
          ? [
              {
                role: currentDesignation || "Executive",
                company: currentCompany || "Current Organization",
                duration: `${totalExperienceYears} Years`,
                description: `Handled key responsibilities in ${skills.slice(0, 3).join(", ")}.`,
              },
            ]
          : [],
    };

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Fallback in case of empty response
      }

      if (!res.ok || (data && data.success === false)) {
        throw new Error((data && data.error) || `Profile update failed (${res.status})`);
      }

      updateUser(profilePayload);
      await login(profilePayload.email);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#c2410c", "#ea580c", "#10b981", "#f59e0b"],
      });

      if (onCompleted) onCompleted();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving profile";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side Decorative Illustration & Trust Panel (Naukri Style) */}
        <div className="w-full md:w-5/12 bg-gradient-to-b from-orange-50/70 via-orange-50/40 to-white p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-xs font-semibold text-orange-800 mb-4 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Direct Recruitment Portal</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-2">
              On registering, you can:
            </h3>

            <ul className="space-y-3 mt-4 text-xs font-medium text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>Build a verified profile and let genuine employers find you</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>Receive direct WhatsApp interview calls from HR leads</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>1-Click Apply to verified Punjab &amp; Pan-India openings</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>Transparent salary packages clearly marked in ₹ LPA</span>
              </li>
            </ul>
          </div>

          {/* Clean User-provided Vector Illustration */}
          <div className="mt-6 pt-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/hero-search.png"
              alt="Candidate Career Search"
              className="max-h-44 w-auto mx-auto object-contain drop-shadow-xs"
            />
            <div className="text-[11px] text-slate-400 font-semibold mt-2">
              Govt. GSTIN Regd: 03IPTPB9968A1ZJ • Manpower Master
            </div>
          </div>
        </div>

        {/* Right Side Form (Naukri Multi-Step Flow) */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Step Progress Pills */}
            <div className="flex items-center gap-1.5 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    s <= step ? "bg-orange-600" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            {/* STEP 1: Work Status Selection */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Tell us about your work status
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We will tailor matching job opportunities based on your experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Experienced Card */}
                  <div
                    onClick={() => setWorkStatus("experienced")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      workStatus === "experienced"
                        ? "bg-orange-50/50 border-orange-600 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">I&apos;m Experienced</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        I have prior work experience (excluding internships or trainee roles).
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-orange-700">
                      <span>Select Experienced</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Fresher Card */}
                  <div
                    onClick={() => setWorkStatus("fresher")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      workStatus === "fresher"
                        ? "bg-orange-50/50 border-orange-600 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">I&apos;m a Fresher</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        I have just completed graduation or looking for my first job.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <span>Select Fresher</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Resume Upload Box (Naukri puts resume early to auto-parse) */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Attach Resume (Optional - PDF or Word)
                  </label>
                  <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-orange-300 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-orange-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]">
                          {resumeFileName || "Drop or upload your CV"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {resumeUrl ? "File attached successfully" : "PDF, DOC, DOCX up to 10MB"}
                        </div>
                      </div>
                    </div>

                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all shrink-0">
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 text-slate-600" />
                          <span>{resumeUrl ? "Change" : "Browse"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Details & Contact */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Personal &amp; Contact Details
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct employers will contact you on these details.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Gurpreet Singh"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98726 20706"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Location / City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Jalandhar, Punjab"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Experience or Education Details */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    {workStatus === "experienced" ? "Employment History" : "Education Background"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {workStatus === "experienced"
                      ? "Add your most recent employer and compensation"
                      : "Add your latest completed or ongoing qualification"}
                  </p>
                </div>

                {workStatus === "experienced" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Current / Most Recent Company *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="e.g. HDFC Bank, Infosys, Local Firm"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Current Job Title / Designation *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentDesignation}
                          onChange={(e) => setCurrentDesignation(e.target.value)}
                          placeholder="e.g. Senior Accountant, Sales Lead"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Total Work Experience (Years)
                        </label>
                        <select
                          value={totalExperienceYears}
                          onChange={(e) => setTotalExperienceYears(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                        >
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="4">4 Years</option>
                          <option value="5">5 Years</option>
                          <option value="7">7+ Years (Senior)</option>
                          <option value="10">10+ Years (Lead / Manager)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Current Annual CTC (₹ LPA)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentCtc}
                          onChange={(e) => setCurrentCtc(e.target.value)}
                          placeholder="e.g. 3.5"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Highest Qualification *
                      </label>
                      <select
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                      >
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                          <span>College / University / School Name</span>
                          {loadingColleges && (
                            <span className="text-[10px] text-orange-600 font-semibold animate-pulse">
                              Searching live...
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={collegeName}
                            onFocus={() => setShowCollegeDropdown(true)}
                            onChange={(e) => {
                              setCollegeName(e.target.value);
                              setShowCollegeDropdown(true);
                            }}
                            placeholder="e.g. Guru Nanak Dev University, LPU, DU, IIT..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                          />
                        </div>

                        {/* Free College Autocomplete Suggestions Dropdown */}
                        {showCollegeDropdown && collegeSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-2 py-1 text-[10px] uppercase font-black text-slate-400 tracking-wider flex justify-between items-center">
                              <span>Verified Institute Matches</span>
                              <span className="text-orange-600">Select</span>
                            </div>
                            {collegeSuggestions.map((col, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setCollegeName(col);
                                  setShowCollegeDropdown(false);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span className="truncate">{col}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Passing Year
                        </label>
                        <select
                          value={passingYear}
                          onChange={(e) => setPassingYear(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                        >
                          <option value="2026">2026 (Pursuing Final Year)</option>
                          <option value="2025">2025 (Recent Graduate)</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022 or earlier</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 4: Skills, Salary & Notice Period */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Key Skills &amp; Availability
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your core functional skills so matching jobs appear instantly.
                  </p>
                </div>

                {/* Popular Skill Badges */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Popular Skills (Click to Add / Remove):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SKILLS.map((sk) => {
                      const selected = skills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? "bg-orange-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-orange-50 border border-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Skill Input */}
                <div>
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="Type custom skill and press Enter (e.g. GST Filing, Cold Calling)..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-medium"
                  />
                </div>

                {/* Salary & Notice Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Expected Annual CTC (₹ LPA) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={expectedCtc}
                      onChange={(e) => setExpectedCtc(e.target.value)}
                      placeholder="e.g. 4.8"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Notice Period *
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    >
                      <option value="Immediate">Immediate Joiner (0-7 Days)</option>
                      <option value="15 Days">15 Days or less</option>
                      <option value="30 Days">30 Days (1 Month)</option>
                      <option value="60 Days">60 Days (2 Months)</option>
                      <option value="Serving Notice">Serving Notice Period</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitOnboarding}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile &amp; Start</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
