"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  IndianRupee,
  Plus,
} from "lucide-react";

interface NaukriOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

// ==========================================
// DATASETS
// ==========================================

export const QUALIFICATION_LEVELS = [
  { id: "graduation", label: "Graduation / Bachelor's" },
  { id: "post_graduation", label: "Post Graduation / Master's" },
  { id: "diploma", label: "Diploma / Polytechnic" },
  { id: "twelfth", label: "12th Pass / Intermediate" },
  { id: "tenth", label: "10th Pass / High School" },
  { id: "doctorate", label: "Doctorate / Ph.D." },
  { id: "vocational", label: "ITI / Vocational" },
  { id: "other", label: "Other" },
];

export const DEGREE_CATALOG: Record<string, string[]> = {
  graduation: [
    "B.Com",
    "B.Com (Honours)",
    "B.Tech - Computer Science",
    "B.Tech - Mechanical",
    "B.Tech - Civil",
    "B.Tech - Electrical",
    "B.Tech - IT",
    "BCA",
    "BBA",
    "B.Sc",
    "B.Sc (IT / CS)",
    "B.Sc (Agriculture)",
    "BA",
    "B.Ed",
    "B.Pharm",
    "LLB",
    "BHM",
    "B.Des",
    "B.Voc",
    "BAMS / BDS",
  ],
  post_graduation: [
    "MBA / PGDM - Finance",
    "MBA / PGDM - Marketing",
    "MBA / PGDM - HR",
    "MBA / PGDM - Operations",
    "M.Com",
    "MCA",
    "M.Tech",
    "M.Sc",
    "MA",
    "Chartered Accountant (CA)",
    "Company Secretary (CS)",
    "ICWA / CMA",
    "LLM",
  ],
  diploma: [
    "Diploma in Mechanical",
    "Diploma in Civil",
    "Diploma in Electrical",
    "Diploma in CS / IT",
    "Polytechnic Diploma",
    "Diploma in Pharmacy (D.Pharm)",
    "Diploma in Hotel Management",
  ],
  twelfth: [
    "12th - Commerce",
    "12th - Non-Medical (PCM)",
    "12th - Medical (PCB)",
    "12th - Arts / Humanities",
  ],
  tenth: [
    "10th - CBSE Board",
    "10th - State / PSEB Board",
    "10th - ICSE Board",
  ],
  doctorate: [
    "Ph.D. in Computer Science",
    "Ph.D. in Commerce / Management",
    "Ph.D. in Engineering",
    "Ph.D. in Sciences",
  ],
  vocational: [
    "ITI - Electrician",
    "ITI - Fitter",
    "ITI - Welder",
    "ITI - COPA",
  ],
  other: [
    "Certified Financial Analyst",
    "Digital Marketing Certification",
    "Full Stack Certification",
    "Data Analytics Certification",
  ],
};

export const POPULAR_SPECIALIZATIONS = [
  "Accounting & Taxation",
  "GST & Accounts",
  "Finance & Banking",
  "Computer Science",
  "Information Technology",
  "Sales & Marketing",
  "Human Resources",
  "Mechanical",
  "Civil",
  "Electrical",
  "General",
  "Commerce",
  "Arts",
  "Medical Sciences",
  "Non-Medical / Maths",
  "Operations & Logistics",
];

// All passing years from 2030 down to 1970
export const ALL_PASSING_YEARS = Array.from(
  { length: 2030 - 1970 + 1 },
  (_, i) => String(2030 - i)
);

export const POPULAR_DESIGNATIONS = [
  "Accountant",
  "Senior Accountant",
  "Tally / GST Operator",
  "Accounts Executive",
  "Sales Executive",
  "Business Development Executive",
  "Business Development Manager",
  "Field Sales Officer",
  "Telecaller",
  "Customer Support Executive",
  "Office Administrator",
  "Back Office Executive",
  "Data Entry Operator",
  "HR Executive / Recruiter",
  "HR Manager",
  "Frontend Developer",
  "Full Stack Developer",
  "Backend Developer",
  "Graphic Designer",
  "Digital Marketing Executive",
  "Store Manager",
  "Billing Executive",
  "Receptionist",
];

export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Accounts": [
    "Tally Prime",
    "Tally ERP 9",
    "GST Filing",
    "TDS & Income Tax",
    "Bookkeeping",
    "Bank Reconciliation",
    "Balance Sheet",
    "Busy Software",
    "Billing",
  ],
  "Sales & Marketing": [
    "Field Sales",
    "B2B Sales",
    "B2C Sales",
    "Lead Generation",
    "Telecalling",
    "Digital Marketing",
    "SEO",
    "Social Media",
  ],
  "Office & Admin": [
    "Advanced Excel",
    "MIS Reporting",
    "Office Admin",
    "Back Office",
    "Data Entry",
    "Email Drafting",
  ],
  "IT & Software": [
    "React.js",
    "Node.js",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "SQL",
    "HTML/CSS",
  ],
  "HR & Operations": [
    "Recruitment",
    "Payroll",
    "Logistics",
    "Customer Support",
    "Graphic Design",
  ],
};

// ==========================================
// SEARCHABLE COMBOBOX COMPONENT
// ==========================================

interface SearchableComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  allowCustom?: boolean;
  asyncSearch?: boolean;
  onSearchChange?: (q: string) => void;
  isLoading?: boolean;
}

function SearchableCombobox({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  icon,
  allowCustom = true,
  asyncSearch = false,
  onSearchChange,
  isLoading = false,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = asyncSearch
    ? options
    : options.filter((opt) =>
        opt.toLowerCase().includes((query || "").toLowerCase())
      );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (allowCustom) {
      onChange(val);
    }
    if (onSearchChange) {
      onSearchChange(val);
    }
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    setQuery(opt);
    onChange(opt);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    if (onSearchChange) onSearchChange("");
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-1" ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-orange-600 font-black">*</span>}
        </label>
        {isLoading && (
          <span className="text-[10px] text-orange-600 font-semibold animate-pulse flex items-center gap-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Searching API...
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={query}
          required={required}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pr-14 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold transition-all ${
            icon ? "pl-9" : "pl-3"
          }`}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isOpen ? "rotate-180 text-orange-600" : ""
              }`}
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 animate-in fade-in duration-100">
            {filtered.length > 0 ? (
              filtered.map((opt, idx) => {
                const isSelected = opt.toLowerCase() === (query || "").toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : query.trim() ? (
              <div className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => handleSelectOption(query)}
                  className="px-3 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-bold hover:bg-orange-700"
                >
                  Use &ldquo;{query}&rdquo;
                </button>
              </div>
            ) : (
              <div className="p-2.5 text-xs text-slate-400 text-center font-medium">
                No suggestions. Type custom value above.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN NAUKRI ONBOARDING MODAL COMPONENT
// ==========================================

export function NaukriOnboardingModal({
  isOpen,
  onClose,
  onCompleted,
}: NaukriOnboardingModalProps) {
  const { user, login, updateUser } = useAuth();

  // Step Tracker (1 to 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State - COMPLETELY BLANK / UNSELECTED BY DEFAULT
  const [workStatus, setWorkStatus] = useState<"experienced" | "fresher" | null>(null);
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState("");

  // Live Location API Search
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    if (!location.trim() || location.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoadingLocations(true);
        const res = await fetch(`/api/locations?q=${encodeURIComponent(location)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setLocationSuggestions(
            data.suggestions.filter((s: string) => s !== "All Locations")
          );
        }
      } catch {
        // ignore
      } finally {
        setLoadingLocations(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [location]);

  // Step 2: Education - COMPLETELY BLANK BY DEFAULT
  const [qualificationLevel, setQualificationLevel] = useState("");
  const [degreeName, setDegreeName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [courseType, setCourseType] = useState<"Full Time" | "Part Time" | "Distance">("Full Time");
  const [percentageOrCgpa, setPercentageOrCgpa] = useState("");

  // Live College Search API
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  useEffect(() => {
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
    }, 200);
    return () => clearTimeout(timer);
  }, [collegeName]);

  // Step 3: Experienced Specific - COMPLETELY BLANK BY DEFAULT
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceMonths, setExperienceMonths] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");

  // Step 4: Skills & Salary - COMPLETELY BLANK BY DEFAULT
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  // Resume Upload
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLevelChange = (levelId: string) => {
    setQualificationLevel(levelId);
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      if (skills.length < 15) {
        setSkills([...skills, skill]);
      }
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customSkillInput.trim()) {
      e.preventDefault();
      const val = customSkillInput.trim();
      if (!skills.includes(val) && skills.length < 15) {
        setSkills([...skills, val]);
      }
      setCustomSkillInput("");
    }
  };

  const handleAddCustomSkillClick = () => {
    if (customSkillInput.trim()) {
      const val = customSkillInput.trim();
      if (!skills.includes(val) && skills.length < 15) {
        setSkills([...skills, val]);
      }
      setCustomSkillInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setUploadingResume(true);
    setError("");
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
        setResumeFileName(data.fileName || data.name || file.name);
      } else {
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

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setError("");
    if (step === 1) {
      if (!workStatus) {
        setError("Please select whether you are Experienced or a Fresher.");
        return false;
      }
      if (!fullName.trim()) {
        setError("Please enter your Full Name.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid Email.");
        return false;
      }
      if (!phone.trim()) {
        setError("Please enter your Mobile number.");
        return false;
      }
      if (!location.trim()) {
        setError("Please select or enter your City.");
        return false;
      }
    } else if (step === 2) {
      if (!degreeName.trim()) {
        setError("Please enter your Degree / Course name.");
        return false;
      }
      if (!passingYear.trim()) {
        setError("Please select or enter your Passing Year.");
        return false;
      }
    } else if (step === 3 && workStatus === "experienced") {
      if (!currentCompany.trim()) {
        setError("Please enter your Company name.");
        return false;
      }
      if (!currentDesignation.trim()) {
        setError("Please enter your Job Title / Designation.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;

    if (step === 2 && workStatus === "fresher") {
      setStep(4);
    } else {
      setStep((prev) => Math.min(prev + 1, 4) as any);
    }
  };

  const handlePrevStep = () => {
    if (step === 4 && workStatus === "fresher") {
      setStep(2);
    } else {
      setStep((prev) => Math.max(prev - 1, 1) as any);
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    setError("");

    const formattedExp =
      workStatus === "experienced"
        ? `${experienceYears || "0"} Yrs ${experienceMonths ? `${experienceMonths} Mo` : ""}`.trim()
        : "Fresher";

    const headline =
      workStatus === "experienced"
        ? `${currentDesignation || "Executive"} at ${currentCompany || "Company"} (${formattedExp} Exp)`
        : `${degreeName.split("(")[0].trim()} • Entry-Level Candidate`;

    const fullDegreeTitle = specialization
      ? `${degreeName} in ${specialization}`
      : degreeName;

    const profilePayload = {
      name: fullName || user?.name || "Candidate",
      email: email || user?.email || "candidate@gmail.com",
      role: "seeker" as const,
      avatar: user?.avatar || undefined,
      phone,
      location,
      headline,
      skills,
      noticePeriod: noticePeriod || "Immediate",
      expectedCtc: parseFloat(expectedCtc) || 0,
      currentCtc: workStatus === "experienced" ? parseFloat(currentCtc) || 0 : 0,
      resumeUrl: resumeUrl || undefined,
      resumeFileName: resumeFileName || undefined,
      education: [
        {
          degree: fullDegreeTitle,
          institution: collegeName || "Affiliated Institution",
          year: passingYear,
          courseType,
          score: percentageOrCgpa || undefined,
        },
      ],
      experienceHistory:
        workStatus === "experienced"
          ? [
              {
                role: currentDesignation || "Executive",
                company: currentCompany || "Current Organization",
                duration: formattedExp,
                description: `Experience in ${skills.slice(0, 3).join(", ") || "functional responsibilities"}.`,
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
        // Fallback
      }

      if (!res.ok || (data && data.success === false)) {
        throw new Error((data && data.error) || `Update failed (${res.status})`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Concise Value Prop */}
        <div className="w-full md:w-5/12 bg-gradient-to-b from-orange-50/70 via-orange-50/30 to-white p-5 sm:p-7 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-xs font-semibold text-orange-800 mb-3.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Direct Placement Portal</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Candidate Profile Registration
            </h3>

            <div className="mt-4 space-y-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-orange-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Free Registration</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-orange-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom Course &amp; Passing Year</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-orange-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct HR Interview Invites</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200/60 text-center">
            <div className="text-[11px] text-slate-500 font-semibold">
              Govt. GSTIN: 03IPTPB9968A1ZJ
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form Wizard */}
        <div className="w-full md:w-7/12 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Step Indicators */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                <span className="text-orange-600 font-black">
                  Step {step} of {workStatus === "fresher" ? 3 : 4}
                </span>
                <span>
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Education"}
                  {step === 3 && (workStatus === "experienced" ? "Experience" : "Skills")}
                  {step === 4 && "Skills & Resume"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((s) => {
                  if (workStatus === "fresher" && s === 3) return null;
                  const isActive = s <= step;
                  return (
                    <div
                      key={s}
                      className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? "bg-orange-600" : "bg-slate-100"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center justify-between animate-in fade-in">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="p-1 text-rose-500 hover:text-rose-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 1: Basic Info & Work Status */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Personal Details &amp; Status
                  </h4>
                </div>

                {/* Work Status Toggle (No auto-selection) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Work Status <span className="text-orange-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setWorkStatus("experienced")}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                        workStatus === "experienced"
                          ? "bg-orange-50/60 border-orange-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Experienced</div>
                        <div className="text-[10px] text-slate-400">Prior work experience</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setWorkStatus("fresher")}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                        workStatus === "fresher"
                          ? "bg-emerald-50/60 border-emerald-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Fresher</div>
                        <div className="text-[10px] text-slate-400">New graduate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile & Live Location API Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                      />
                    </div>
                  </div>

                  {/* LIVE API POWERED LOCATION */}
                  <SearchableCombobox
                    label="Current City / Location"
                    required={true}
                    value={location}
                    onChange={(val) => setLocation(val)}
                    options={locationSuggestions}
                    asyncSearch={true}
                    isLoading={loadingLocations}
                    icon={<MapPin className="w-4 h-4" />}
                    placeholder="Search city (live API)..."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Education Details (All blank by default) */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Education Details
                  </h4>
                </div>

                {/* Qualification Level (No default auto-selection) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Qualification Level
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUALIFICATION_LEVELS.map((lvl) => {
                      const isSelected = qualificationLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handleLevelChange(lvl.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-600 text-white shadow-xs"
                              : "bg-slate-100 hover:bg-orange-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Degree / Course Combobox */}
                <SearchableCombobox
                  label="Degree / Course Name"
                  required={true}
                  value={degreeName}
                  onChange={(val) => setDegreeName(val)}
                  options={
                    qualificationLevel && DEGREE_CATALOG[qualificationLevel]
                      ? DEGREE_CATALOG[qualificationLevel]
                      : Object.values(DEGREE_CATALOG).flat().slice(0, 25)
                  }
                  icon={<GraduationCap className="w-4 h-4" />}
                  placeholder="e.g. B.Com, B.Tech, BCA"
                />

                {/* Stream & Passing Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableCombobox
                    label="Specialization / Stream"
                    value={specialization}
                    onChange={(val) => setSpecialization(val)}
                    options={POPULAR_SPECIALIZATIONS}
                    icon={<Layers className="w-4 h-4" />}
                    placeholder="e.g. Accounts, Computer Science"
                  />

                  <SearchableCombobox
                    label="Passing Year"
                    required={true}
                    value={passingYear}
                    onChange={(val) => setPassingYear(val)}
                    options={ALL_PASSING_YEARS}
                    icon={<Calendar className="w-4 h-4" />}
                    placeholder="Passing year"
                  />
                </div>

                {/* College / University Name (Live API) */}
                <SearchableCombobox
                  label="College / University Name"
                  value={collegeName}
                  onChange={(val) => setCollegeName(val)}
                  options={collegeSuggestions}
                  asyncSearch={true}
                  isLoading={loadingColleges}
                  icon={<Building2 className="w-4 h-4" />}
                  placeholder="Search university (live API)..."
                />

                {/* Course Type & Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Course Type
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["Full Time", "Part Time", "Distance"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCourseType(type)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                            courseType === type
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Score (Optional)
                    </label>
                    <input
                      type="text"
                      value={percentageOrCgpa}
                      onChange={(e) => setPercentageOrCgpa(e.target.value)}
                      placeholder="e.g. 75% or 8.0 CGPA"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Work History (Only for Experienced, all blank) */}
            {step === 3 && workStatus === "experienced" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Employment Details
                  </h4>
                </div>

                {/* Designation */}
                <SearchableCombobox
                  label="Current / Last Job Title"
                  required={true}
                  value={currentDesignation}
                  onChange={(val) => setCurrentDesignation(val)}
                  options={POPULAR_DESIGNATIONS}
                  placeholder="e.g. Accountant, Sales Executive"
                />

                {/* Company Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Company Name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                {/* Experience Years & Months */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Total Experience
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="Years"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-600"
                    />
                    <select
                      value={experienceMonths}
                      onChange={(e) => setExperienceMonths(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-600"
                    >
                      <option value="">Months</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i)}>
                          {i} Months
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Current CTC */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current CTC (₹ LPA)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={currentCtc}
                      onChange={(e) => setCurrentCtc(e.target.value)}
                      placeholder="₹ LPA"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Skills, Salary & Resume (All blank by default) */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Skills &amp; Resume
                  </h4>
                </div>

                {/* Selected Skills Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Selected Skills ({skills.length})
                    </label>
                    {skills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSkills([])}
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="min-h-[40px] p-2 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 items-center">
                    {skills.length > 0 ? (
                      skills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-600 text-white"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className="p-0.5 hover:bg-orange-700 rounded-full cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium pl-1">
                        No skills added yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Add Custom Skill Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="Type skill and press Enter"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkillClick}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Category Skill Chips */}
                <div className="space-y-1.5 pt-1">
                  {Object.entries(SKILL_CATEGORIES).map(([catName, catSkills]) => (
                    <div key={catName} className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">
                        {catName}:
                      </span>
                      {catSkills.slice(0, 6).map((sk) => {
                        const isSelected = skills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-orange-600 text-white font-bold"
                                : "bg-slate-100 hover:bg-orange-50 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Expected CTC & Notice Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Expected Annual CTC (₹ LPA)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        step="0.1"
                        value={expectedCtc}
                        onChange={(e) => setExpectedCtc(e.target.value)}
                        placeholder="₹ LPA"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Notice Period
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-bold"
                    >
                      <option value="">Select notice period</option>
                      <option value="Immediate">Immediate (0-7 Days)</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days (1 Month)</option>
                      <option value="60 Days">60 Days (2 Months)</option>
                      <option value="90 Days">90 Days (3 Months)</option>
                      <option value="Serving Notice">Serving Notice</option>
                    </select>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="pt-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Attach Resume (Optional - PDF or Word)
                  </label>
                  <div className="p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-orange-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {resumeFileName || "No file attached"}
                      </div>
                    </div>

                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0">
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Browse</span>
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
          </div>

          {/* Footer Controls */}
          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
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
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete &amp; Register</span>
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
