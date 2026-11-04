"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { ALL_CATALOG_JOB_ROLES } from "@/data/businessCatalog";
import { CATALOG_JOB_TITLES, CATALOG_INDIAN_CITIES } from "@/data/jobTitlesAndCities";
import {
  Modal,
  Input,
  Select,
  AutoComplete,
  Button,
  Row,
  Col,
  Alert,
  Switch,
  Tag,
  Avatar,
  ConfigProvider,
  Tabs,
  TimePicker,
  Checkbox,
  Drawer,
  message,
} from "antd";

const TITLE_AUTOCOMPLETE_OPTIONS = CATALOG_JOB_TITLES.map((t) => ({ value: t, label: t }));
const CITY_AUTOCOMPLETE_OPTIONS = CATALOG_INDIAN_CITIES.map((c) => ({ value: c, label: c }));
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const parseTimeToDayjs = (timeStr?: string) => {
  if (!timeStr) return null;
  const d = dayjs(timeStr, ["h:mm A", "hh:mm A", "h:mm a", "hh:mm a", "HH:mm"]);
  return d.isValid() ? d : null;
};

import {
  Building2,
  MapPin,
  Check,
  Briefcase,
  Zap,
  X,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  FileCheck,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Video,
  UserCheck,
  IndianRupee,
  MessageSquare,
  Star,
  Gift,
  User,
  Languages,
  FileText,
  AlertTriangle,
  Bookmark,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { monthlyToLpa, lpaToMonthly } from "@/lib/utils";

// Autocomplete suggestion lists
const QUALIFICATION_SUGGESTIONS = [
  { value: "Below 10th Pass" },
  { value: "10th Pass / Matric" },
  { value: "12th Pass / Intermediate" },
  { value: "Diploma / ITI" },
  { value: "Any Graduate (BA / B.Com / B.Sc)" },
  { value: "B.Com / Accounts & Finance" },
  { value: "B.Tech / BE / BCA / MCA" },
  { value: "MBA / Post Graduate" },
];

const SHIFT_SUGGESTIONS = [
  { value: "Day Shift (9:30 AM - 6:30 PM)" },
  { value: "General Shift (10:00 AM - 7:00 PM)" },
  { value: "Morning Shift (7:00 AM - 3:30 PM)" },
  { value: "Evening Shift (2:00 PM - 10:30 PM)" },
  { value: "Night Shift (8:00 PM - 5:00 AM)" },
  { value: "Rotational Shift" },
  { value: "Flexible Working Hours" },
];

const EXPERIENCE_SUGGESTIONS = [
  { value: "Fresher" },
  { value: "Experienced" },
  { value: "Both (Fresher & Experienced Both)" },
  { value: "0 - 1 Year" },
  { value: "1 - 3 Years" },
  { value: "3 - 5 Years" },
  { value: "5+ Years" },
];

const INTERVIEW_MODE_SUGGESTIONS = [
  { value: "Direct Walk-in Interview" },
  { value: "Interview Schedule (Scheduled Slot)" },
  { value: "Telephonic Interview" },
  { value: "Online (Google Meet / Zoom)" },
];

const INTERVIEW_TIME_SLOT_SUGGESTIONS = [
  { value: "10:00 AM to 01:00 PM (Morning Slot)" },
  { value: "11:00 AM to 04:00 PM (Standard Slot)" },
  { value: "02:00 PM to 05:30 PM (Afternoon Slot)" },
  { value: "10:00 AM to 06:00 PM (Full Day Slot)" },
  { value: "Flexible Hours (With Prior Appointment)" },
];

const CALLING_TIME_SLOT_PRESETS = [
  { label: "09:30 AM to 06:30 PM (Standard Business Hours)", value: "09:30 AM to 06:30 PM" },
  { label: "10:00 AM to 05:00 PM (Direct Calling Window)", value: "10:00 AM to 05:00 PM" },
  { label: "09:00 AM to 07:00 PM (Extended Working Hours)", value: "09:00 AM to 07:00 PM" },
  { label: "10:00 AM to 01:00 PM (Morning Slot Only)", value: "10:00 AM to 01:00 PM" },
  { label: "02:00 PM to 06:00 PM (Afternoon Slot Only)", value: "02:00 PM to 06:00 PM" },
];

const ENGLISH_SUGGESTIONS = [
  { value: "No English Required" },
  { value: "Basic / Conversational" },
  { value: "Good Working English" },
  { value: "Fluent English" },
];

const ASSET_SUGGESTIONS = [
  { label: "Two Wheeler & DL", value: "Two Wheeler & DL" },
  { label: "Smartphone", value: "Smartphone" },
  { label: "Laptop / Computer", value: "Laptop" },
  { label: "Aadhaar & PAN Card", value: "Aadhaar & PAN" },
  { label: "Bank Account Passbook / Cheque", value: "Bank Passbook" },
];

// Popular WorkIndia categories & roles
const POPULAR_JOB_TITLES = [
  "Telecalling / BPO Executive",
  "Field Sales Executive",
  "Delivery Partner / Rider",
  "Back Office / Data Entry Operator",
  "Accountant / Tally Operator",
  "Retail Counter Sales",
  "Computer Operator",
  "Cook / Chef / Kitchen Staff",
  "Security Guard",
  "Driver (Car / Commercial)",
  "HR Executive / Recruiter",
  "Nurse / Medical Assistant",
  "Teacher / Tutor",
  "Digital Marketing Executive",
  "Software Developer / IT Support",
  "Electrician / Technician",
  "Customer Support Associate",
  "Graphic Designer",
];

const JOB_CATEGORY_SUGGESTIONS = [
  { value: "Sales & Marketing" },
  { value: "Customer Support / BPO" },
  { value: "Back Office / Data Entry" },
  { value: "Accounting & Finance" },
  { value: "Delivery / Logistics / Driver" },
  { value: "Retail / Counter Sales" },
  { value: "IT & Software" },
  { value: "HR & Recruitment" },
  { value: "Hotel & Hospitality / Cook" },
  { value: "Healthcare / Pharma / Nursing" },
  { value: "Manufacturing / Production" },
  { value: "Education & Teaching" },
  { value: "Security & Facility" },
  { value: "Engineering & Technical" },
  { value: "Other" },
];

const LANGUAGE_SUGGESTIONS = [
  { value: "Hindi" },
  { value: "English" },
  { value: "Marathi" },
  { value: "Tamil" },
  { value: "Telugu" },
  { value: "Bengali" },
  { value: "Gujarati" },
  { value: "Kannada" },
  { value: "Punjabi" },
  { value: "Malayalam" },
  { value: "Urdu" },
];

const NOTICE_PERIOD_SUGGESTIONS = [
  { value: "Immediate Joiner" },
  { value: "Within 15 Days" },
  { value: "Within 30 Days" },
  { value: "Within 60 Days" },
];

const PERK_TAG_SUGGESTIONS = [
  { label: "PF & ESI", value: "PF & ESI" },
  { label: "Free Meals / Food", value: "Free Meals" },
  { label: "Cab / Travel Allowance", value: "Cab / Transport" },
  { label: "Health / Medical Insurance", value: "Health Insurance" },
  { label: "Performance Incentives", value: "Performance Incentives" },
  { label: "Annual Bonus / Diwali Bonus", value: "Annual Bonus" },
  { label: "Overtime Pay", value: "Overtime Pay" },
  { label: "Training & Certification", value: "Training Provided" },
  { label: "Work From Home / Remote Option", value: "Work From Home" },
  { label: "Mobile / Internet Allowance", value: "Mobile Allowance" },
];

// Quick suggestion chips for "Any other specific requirement"
const SPECIFIC_REQUIREMENT_PRESETS = [
  "Must have Two Wheeler & Valid Driving License",
  "Android or iOS Smartphone with Active Internet",
  "Immediate Joining required within 2-3 days",
  "Candidate must speak fluent Hindi & basic English",
  "Regular Day Shift only (No Night Shifts)",
  "Lucrative target-linked daily / weekly incentives",
  "Basic Computer & MS Excel knowledge required",
  "Freshers and Experienced both are welcome to apply",
];

const WEEK_DAYS = [
  { key: "Mon", short: "Mon", full: "Monday" },
  { key: "Tue", short: "Tue", full: "Tuesday" },
  { key: "Wed", short: "Wed", full: "Wednesday" },
  { key: "Thu", short: "Thu", full: "Thursday" },
  { key: "Fri", short: "Fri", full: "Friday" },
  { key: "Sat", short: "Sat", full: "Saturday" },
  { key: "Sun", short: "Sun", full: "Sunday" },
];

const DRAFT_STORAGE_KEY = "recruiter_job_draft_v3";

function calculateShiftDuration(inTimeStr: string, outTimeStr: string): string {
  const parseToMinutes = (t: string) => {
    const match = t?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const p = match[3]?.toUpperCase() || (h >= 12 ? "PM" : "AM");
    if (p === "PM" && h < 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };
  const inM = parseToMinutes(inTimeStr);
  const outM = parseToMinutes(outTimeStr);
  if (inM === null || outM === null) return "";
  let diff = outM - inM;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}${mins > 0 ? `h ${mins}m` : " Hours"}`;
}

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  onOpenEmployerAuth?: () => void;
  jobToEdit?: any | null;
  onSwitchToCandidate?: () => void;
}

export function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
  onOpenEmployerAuth,
  jobToEdit,
  onSwitchToCandidate,
}: PostJobModalProps) {
  const { user, updateUser, loginAsDemo } = useAuth();

  // Employer identity
  const employerName = user?.companyName || user?.name || "Corporate Employer";
  const employerLogo = user?.avatar || user?.companyLogo || "/company-profile.jpeg";
  const userBranches = user?.employerDetails?.branches || (user as any)?.branches || [];

  // Active Tab
  const [activeTab, setActiveTab] = useState("1");

  // Draft Management State
  const [draftAvailable, setDraftAvailable] = useState<any | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const isRestoringDraft = useRef(false);

  // Smart Optimization Drawer State (WorkIndia Suggestions)
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [workplaceType, setWorkplaceType] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [openingsCount, setOpeningsCount] = useState("");
  const [urgentHiring, setUrgentHiring] = useState(false);
  const [jobCategory, setJobCategory] = useState("");

  // Compensation States
  const [salaryMonthlyMin, setSalaryMonthlyMin] = useState("");
  const [salaryMonthlyMax, setSalaryMonthlyMax] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [probationPeriod, setProbationPeriod] = useState("");
  const [perkTags, setPerkTags] = useState<string[]>([]);

  // Role Specs
  const [experienceLevel, setExperienceLevel] = useState("");
  const [qualification, setQualification] = useState("");
  const [shiftTiming, setShiftTiming] = useState("");
  const [shiftInTime, setShiftInTime] = useState("");
  const [shiftOutTime, setShiftOutTime] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [workingDaysList, setWorkingDaysList] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState<string>("30");

  // Candidate Criteria
  const [genderPreference, setGenderPreference] = useState<string>("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [requiredAssets, setRequiredAssets] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [languagesRequired, setLanguagesRequired] = useState<string[]>([]);
  const [noticePeriod, setNoticePeriod] = useState("");

  // WorkIndia Hero Specific Requirements Field
  const [otherRequirements, setOtherRequirements] = useState("");

  // Interview & Contact
  const [interviewMode, setInterviewMode] = useState("");
  const [interviewAddress, setInterviewAddress] = useState("");
  const [interviewStartDate, setInterviewStartDate] = useState("");
  const [interviewEndDate, setInterviewEndDate] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState("");
  const [interviewEndTime, setInterviewEndTime] = useState("");
  const [interviewTimeSlot, setInterviewTimeSlot] = useState("");
  const [recruiterWhatsApp, setRecruiterWhatsApp] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [referralBonus, setReferralBonus] = useState("");

  // Candidate Calling Availability
  const [callingDaysList, setCallingDaysList] = useState<string[]>([]);
  const [callingTimeStart, setCallingTimeStart] = useState("");
  const [callingTimeEnd, setCallingTimeEnd] = useState("");
  const [callingSlotPreset, setCallingSlotPreset] = useState("");

  // Description & Visibility
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [featured, setFeatured] = useState(false);

  // Statutory Anti-Fraud & Recruiter Terms Consent (WorkIndia Mandatory)
  const [contactConsent, setContactConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Working Days Toggle
  const toggleWorkingDay = (dayKey: string) => {
    let nextList: string[];
    if (workingDaysList.includes(dayKey)) {
      nextList = workingDaysList.filter((d) => d !== dayKey);
    } else {
      nextList = WEEK_DAYS.map((w) => w.key).filter(
        (k) => workingDaysList.includes(k) || k === dayKey
      );
    }
    setWorkingDaysList(nextList);

    let summary = "";
    if (nextList.length === 6 && !nextList.includes("Sun")) {
      summary = "6 Days (Mon - Sat, Sun Off)";
    } else if (
      nextList.length === 5 &&
      !nextList.includes("Sat") &&
      !nextList.includes("Sun")
    ) {
      summary = "5 Days (Mon - Fri, Sat & Sun Off)";
    } else if (nextList.length === 7) {
      summary = "All 7 Days (Rotational Off)";
    } else if (nextList.length === 0) {
      summary = "Flexible / Remote Hours";
    } else {
      const offDays = WEEK_DAYS.filter((d) => !nextList.includes(d.key)).map((d) => d.full);
      summary = `${nextList.length} Days (${nextList.join(", ")}${
        offDays.length > 0 ? ` • ${offDays.join(", ")} Off` : ""
      })`;
    }
    setWorkingDays(summary);
  };

  const applyWorkingDaysPreset = (days: string[], customSummary?: string) => {
    setWorkingDaysList(days);
    if (customSummary) {
      setWorkingDays(customSummary);
    } else if (days.length === 6 && !days.includes("Sun")) {
      setWorkingDays("6 Days (Mon - Sat, Sun Off)");
    } else if (days.length === 5) {
      setWorkingDays("5 Days (Mon - Fri, Sat & Sun Off)");
    } else if (days.length === 7) {
      setWorkingDays("All 7 Days (Rotational Off)");
    } else {
      setWorkingDays(`${days.length} Days (${days.join(", ")})`);
    }
  };

  const updateShiftInTime = (inVal: string) => {
    setShiftInTime(inVal);
    if (inVal && shiftOutTime) {
      setShiftTiming(`${inVal} - ${shiftOutTime}`);
    } else if (inVal) {
      setShiftTiming(`In: ${inVal}`);
    }
  };

  const updateShiftOutTime = (outVal: string) => {
    setShiftOutTime(outVal);
    if (shiftInTime && outVal) {
      setShiftTiming(`${shiftInTime} - ${outVal}`);
    } else if (outVal) {
      setShiftTiming(`Out: ${outVal}`);
    }
  };

  const updateInterviewStartTime = (inVal: string) => {
    setInterviewStartTime(inVal);
    if (inVal && interviewEndTime) {
      setInterviewTimeSlot(`${inVal} to ${interviewEndTime}`);
    } else if (inVal) {
      setInterviewTimeSlot(`${inVal} Onwards`);
    } else {
      setInterviewTimeSlot(interviewEndTime ? `Till ${interviewEndTime}` : "");
    }
  };

  const updateInterviewEndTime = (outVal: string) => {
    setInterviewEndTime(outVal);
    if (interviewStartTime && outVal) {
      setInterviewTimeSlot(`${interviewStartTime} to ${outVal}`);
    } else if (outVal) {
      setInterviewTimeSlot(`Till ${outVal}`);
    } else {
      setInterviewTimeSlot(interviewStartTime ? `${interviewStartTime} Onwards` : "");
    }
  };

  const toggleCallingDay = (dayKey: string) => {
    setCallingDaysList((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const updateCallingTimeStart = (time: string) => {
    setCallingTimeStart(time);
    if (time && callingTimeEnd) {
      setCallingSlotPreset(`${time} to ${callingTimeEnd}`);
    }
  };

  const updateCallingTimeEnd = (time: string) => {
    setCallingTimeEnd(time);
    if (callingTimeStart && time) {
      setCallingSlotPreset(`${callingTimeStart} to ${time}`);
    }
  };

  const handleCallingSlotPreset = (val: string) => {
    setCallingSlotPreset(val);
    if (val.includes(" to ")) {
      const parts = val.split(" to ");
      if (parts[0]) setCallingTimeStart(parts[0].trim());
      if (parts[1]) setCallingTimeEnd(parts[1].trim());
    }
  };

  const handleInterviewSlotPreset = (presetVal: string) => {
    setInterviewTimeSlot(presetVal);
    if (!presetVal) {
      setInterviewStartTime("");
      setInterviewEndTime("");
      return;
    }
    const cleanT = presetVal.replace(/\(.*\)/g, "").trim();
    if (cleanT.includes(" to ")) {
      const parts = cleanT.split(" to ");
      if (parts[0]) setInterviewStartTime(parts[0].trim());
      if (parts[1]) setInterviewEndTime(parts[1].trim());
    } else if (cleanT.includes(" - ")) {
      const parts = cleanT.split(" - ");
      if (parts[0]) setInterviewStartTime(parts[0].trim());
      if (parts[1]) setInterviewEndTime(parts[1].trim());
    }
  };

  // Branch Selection Handler
  const handleBranchSelect = (branchId?: string) => {
    setSelectedBranchId(branchId || "");
    if (!branchId || branchId === "custom") {
      return;
    }
    if (branchId === "main") {
      const headOffice = userBranches.find((b: any) => b.isHeadquarters);
      if (headOffice) {
        const locStr = headOffice.state ? `${headOffice.city}, ${headOffice.state}` : headOffice.city;
        setLocation(locStr);
        if (headOffice.address) setInterviewAddress(`${headOffice.address}, ${headOffice.city}`);
      } else if (user?.location) {
        setLocation(user.location);
      }
      return;
    }

    const branch = userBranches.find((b: any) => (b.id || b.branchName) === branchId);
    if (branch) {
      const locStr = branch.state ? `${branch.city}, ${branch.state}` : branch.city;
      setLocation(locStr);
      if (branch.address) {
        setInterviewAddress(`${branch.address}, ${branch.city}`);
      }
    }
  };

  // Synchronized Salary Handlers
  const handleMonthlyMinChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setSalaryMonthlyMin(clean);
    if (clean && Number(clean) > 0) {
      const lpa = monthlyToLpa(Number(clean));
      setSalaryMin(String(lpa));
    } else {
      setSalaryMin("");
    }
  };

  const handleMonthlyMaxChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setSalaryMonthlyMax(clean);
    if (clean && Number(clean) > 0) {
      const lpa = monthlyToLpa(Number(clean));
      setSalaryMax(String(lpa));
    } else {
      setSalaryMax("");
    }
  };

  const handleLpaMinChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setSalaryMin(clean);
    if (clean && Number(clean) > 0) {
      const mo = lpaToMonthly(Number(clean));
      setSalaryMonthlyMin(String(mo));
    } else {
      setSalaryMonthlyMin("");
    }
  };

  const handleLpaMaxChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setSalaryMax(clean);
    if (clean && Number(clean) > 0) {
      const mo = lpaToMonthly(Number(clean));
      setSalaryMonthlyMax(String(mo));
    } else {
      setSalaryMonthlyMax("");
    }
  };

  // Quick Monthly Salary Preset Handler
  const applyMonthlySalaryPreset = (minMo: number, maxMo: number) => {
    setSalaryMonthlyMin(String(minMo));
    setSalaryMonthlyMax(String(maxMo));
    setSalaryMin(String(monthlyToLpa(minMo)));
    setSalaryMax(String(monthlyToLpa(maxMo)));
  };

  // Quick Append to Specific Requirements
  const handleAppendSpecificRequirement = (tagText: string) => {
    if (!otherRequirements.trim()) {
      setOtherRequirements(`• ${tagText}`);
    } else if (otherRequirements.includes(tagText)) {
      message.info("Requirement already added");
    } else {
      setOtherRequirements(`${otherRequirements.trim()}\n• ${tagText}`);
    }
  };

  // Lock background body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Check LocalStorage for saved Draft when opening
  useEffect(() => {
    if (isOpen && !jobToEdit) {
      try {
        const savedDraftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraftStr) {
          const draftObj = JSON.parse(savedDraftStr);
          if (draftObj && (draftObj.title || draftObj.location || draftObj.jobCategory)) {
            setDraftAvailable(draftObj);
            setShowDraftBanner(true);
          }
        }
      } catch {
        // ignore localStorage error
      }
    }
  }, [isOpen, jobToEdit]);

  // Auto-save form into LocalStorage draft (Debounced)
  useEffect(() => {
    if (!isOpen || jobToEdit || isRestoringDraft.current) return;
    if (!title && !location && !salaryMonthlyMin) return;

    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          title,
          company: company || employerName,
          location,
          workplaceType,
          jobType,
          jobCategory,
          openingsCount,
          salaryMonthlyMin,
          salaryMonthlyMax,
          salaryMin,
          salaryMax,
          experienceLevel,
          qualification,
          shiftTiming,
          shiftInTime,
          shiftOutTime,
          workingDays,
          workingDaysList,
          expiryDays,
          genderPreference,
          englishLevel,
          requiredAssets,
          interviewMode,
          interviewAddress,
          interviewStartDate,
          interviewEndDate,
          interviewStartTime,
          interviewEndTime,
          interviewTimeSlot,
          recruiterWhatsApp,
          callingDaysList,
          callingTimeStart,
          callingTimeEnd,
          callingSlotPreset,
          contactPerson,
          contactEmail,
          referralBonus,
          skills,
          description,
          requirements,
          benefits,
          otherRequirements,
          probationPeriod,
          perkTags,
          ageMin,
          ageMax,
          languagesRequired,
          noticePeriod,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      } catch {
        // ignore
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    jobToEdit,
    title,
    company,
    location,
    workplaceType,
    jobType,
    jobCategory,
    openingsCount,
    salaryMonthlyMin,
    salaryMonthlyMax,
    salaryMin,
    salaryMax,
    experienceLevel,
    qualification,
    shiftTiming,
    shiftInTime,
    shiftOutTime,
    workingDays,
    workingDaysList,
    expiryDays,
    genderPreference,
    englishLevel,
    requiredAssets,
    interviewMode,
    interviewAddress,
    interviewStartDate,
    interviewEndDate,
    interviewStartTime,
    interviewEndTime,
    interviewTimeSlot,
    recruiterWhatsApp,
    contactPerson,
    contactEmail,
    referralBonus,
    skills,
    description,
    requirements,
    benefits,
    otherRequirements,
    probationPeriod,
    perkTags,
    ageMin,
    ageMax,
    languagesRequired,
    noticePeriod,
    employerName,
  ]);

  // Restore Draft Handler (WorkIndia Pattern)
  const handleRestoreDraft = () => {
    if (!draftAvailable) return;
    isRestoringDraft.current = true;
    try {
      setTitle(draftAvailable.title || "");
      setCompany(draftAvailable.company || employerName);
      setLocation(draftAvailable.location || "");
      setWorkplaceType(draftAvailable.workplaceType || "On-site");
      setJobType(draftAvailable.jobType || "Full-time");
      setJobCategory(draftAvailable.jobCategory || "");
      setOpeningsCount(draftAvailable.openingsCount || "2");
      setSalaryMonthlyMin(draftAvailable.salaryMonthlyMin || "");
      setSalaryMonthlyMax(draftAvailable.salaryMonthlyMax || "");
      setSalaryMin(draftAvailable.salaryMin || "");
      setSalaryMax(draftAvailable.salaryMax || "");
      setExperienceLevel(draftAvailable.experienceLevel || "Fresher");
      setQualification(draftAvailable.qualification || "");
      setShiftTiming(draftAvailable.shiftTiming || "09:30 AM - 06:30 PM (Day Shift)");
      setShiftInTime(draftAvailable.shiftInTime || "09:30 AM");
      setShiftOutTime(draftAvailable.shiftOutTime || "06:30 PM");
      setWorkingDays(draftAvailable.workingDays || "6 Days (Mon - Sat, Sun Off)");
      setWorkingDaysList(draftAvailable.workingDaysList || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
      setExpiryDays(draftAvailable.expiryDays || "30");
      setGenderPreference(draftAvailable.genderPreference || "Any");
      setEnglishLevel(draftAvailable.englishLevel || "Basic / Conversational");
      setRequiredAssets(draftAvailable.requiredAssets || []);
      setInterviewMode(draftAvailable.interviewMode || "Direct Walk-in Interview");
      setInterviewAddress(draftAvailable.interviewAddress || "");
      setInterviewStartDate(draftAvailable.interviewStartDate || "");
      setInterviewEndDate(draftAvailable.interviewEndDate || "");
      setInterviewStartTime(draftAvailable.interviewStartTime || "10:00 AM");
      setInterviewEndTime(draftAvailable.interviewEndTime || "05:00 PM");
      setInterviewTimeSlot(draftAvailable.interviewTimeSlot || "");
      setRecruiterWhatsApp(draftAvailable.recruiterWhatsApp || "");
      setCallingDaysList(draftAvailable.callingDaysList || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
      setCallingTimeStart(draftAvailable.callingTimeStart || "09:30 AM");
      setCallingTimeEnd(draftAvailable.callingTimeEnd || "06:30 PM");
      setCallingSlotPreset(draftAvailable.callingSlotPreset || "09:30 AM to 06:30 PM");
      setContactPerson(draftAvailable.contactPerson || user?.name || "");
      setContactEmail(draftAvailable.contactEmail || user?.email || "");
      setReferralBonus(draftAvailable.referralBonus || "");
      setSkills(draftAvailable.skills || "");
      setDescription(draftAvailable.description || "");
      setRequirements(draftAvailable.requirements || "");
      setBenefits(draftAvailable.benefits || "");
      setOtherRequirements(draftAvailable.otherRequirements || "");
      setProbationPeriod(draftAvailable.probationPeriod || "");
      setPerkTags(draftAvailable.perkTags || []);
      setAgeMin(draftAvailable.ageMin || "");
      setAgeMax(draftAvailable.ageMax || "");
      setLanguagesRequired(draftAvailable.languagesRequired || ["Hindi"]);
      setNoticePeriod(draftAvailable.noticePeriod || "");
      setShowDraftBanner(false);
      message.success("Draft job details restored successfully!");
    } finally {
      setTimeout(() => {
        isRestoringDraft.current = false;
      }, 500);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftAvailable(null);
    setShowDraftBanner(false);
    message.info("Saved draft discarded.");
  };

  const handleSaveDraftManually = () => {
    if (!title && !location) {
      message.warning("Please enter at least a Job Title or Location to save draft.");
      return;
    }
    const draftPayload = {
      title,
      company: company || employerName,
      location,
      workplaceType,
      jobType,
      jobCategory,
      openingsCount,
      salaryMonthlyMin,
      salaryMonthlyMax,
      salaryMin,
      salaryMax,
      experienceLevel,
      qualification,
      shiftTiming,
      shiftInTime,
      shiftOutTime,
      workingDays,
      workingDaysList,
      expiryDays,
      genderPreference,
      englishLevel,
      requiredAssets,
      interviewMode,
      interviewAddress,
      interviewStartDate,
      interviewEndDate,
      interviewStartTime,
      interviewEndTime,
      interviewTimeSlot,
      recruiterWhatsApp,
      contactPerson,
      contactEmail,
      referralBonus,
      skills,
      description,
      requirements,
      benefits,
      otherRequirements,
      probationPeriod,
      perkTags,
      ageMin,
      ageMax,
      languagesRequired,
      noticePeriod,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
    message.success("Job posting progress saved to browser draft!");
  };

  // Reset or pre-fill on modal open
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
      setActiveTab("1");

      if (jobToEdit) {
        setTitle(jobToEdit.title || "");
        setCompany(jobToEdit.company || employerName);
        setLocation(jobToEdit.location || "");
        setWorkplaceType(jobToEdit.workplaceType || "On-site");
        setExperienceLevel(jobToEdit.experienceLevel || "Fresher");
        setJobType(jobToEdit.jobType || "Full-time");
        setJobCategory(jobToEdit.jobCategory || "");
        setSalaryMin(jobToEdit.salaryMin ? String(jobToEdit.salaryMin) : "");
        setSalaryMax(jobToEdit.salaryMax ? String(jobToEdit.salaryMax) : "");
        setSalaryMonthlyMin(
          jobToEdit.salaryMonthlyMin
            ? String(jobToEdit.salaryMonthlyMin)
            : jobToEdit.salaryMin
            ? String(lpaToMonthly(jobToEdit.salaryMin))
            : ""
        );
        setSalaryMonthlyMax(
          jobToEdit.salaryMonthlyMax
            ? String(jobToEdit.salaryMonthlyMax)
            : jobToEdit.salaryMax
            ? String(lpaToMonthly(jobToEdit.salaryMax))
            : ""
        );
        setOpeningsCount(jobToEdit.openingsCount ? String(jobToEdit.openingsCount) : "2");
        setExpiryDays(jobToEdit.expiryDays ? String(jobToEdit.expiryDays) : "30");
        setQualification(jobToEdit.qualification || "");
        setShiftTiming(jobToEdit.shiftTiming || "");
        if (jobToEdit.shiftTiming && jobToEdit.shiftTiming.includes(" - ")) {
          const cleanT = jobToEdit.shiftTiming.replace(/.*\(|\).*/g, "");
          const parts = cleanT.split(" - ");
          if (parts[0]) setShiftInTime(parts[0].trim());
          if (parts[1]) setShiftOutTime(parts[1].trim());
        }
        const wd = jobToEdit.workingDays || "";
        setWorkingDays(wd || "6 Days (Mon - Sat, Sun Off)");
        if (wd.includes("5 Days") || wd.includes("Mon - Fri")) {
          setWorkingDaysList(["Mon", "Tue", "Wed", "Thu", "Fri"]);
        } else if (wd.includes("7 Days") || wd.includes("Rotational")) {
          setWorkingDaysList(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
        } else {
          setWorkingDaysList(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
        }
        setGenderPreference(jobToEdit.genderPreference || "Any");
        setEnglishLevel(jobToEdit.englishLevel || "Basic / Conversational");
        setRequiredAssets(jobToEdit.requiredAssets || []);
        setInterviewMode(jobToEdit.interviewMode || "Direct Walk-in Interview");
        setInterviewAddress(jobToEdit.interviewAddress || "");
        setInterviewStartDate(jobToEdit.interviewStartDate || "");
        setInterviewEndDate(jobToEdit.interviewEndDate || "");
        setInterviewTimeSlot(jobToEdit.interviewTimeSlot || "");
        if (jobToEdit.interviewTimeSlot && jobToEdit.interviewTimeSlot.includes(" - ")) {
          const cleanT = jobToEdit.interviewTimeSlot.replace(/.*\(|\).*/g, "");
          const parts = cleanT.split(" - ");
          if (parts[0]) setInterviewStartTime(parts[0].trim());
          if (parts[1]) setInterviewEndTime(parts[1].trim());
        }
        setRecruiterWhatsApp(jobToEdit.recruiterWhatsApp || "");
        if (jobToEdit.callingDays && Array.isArray(jobToEdit.callingDays) && jobToEdit.callingDays.length > 0) {
          setCallingDaysList(jobToEdit.callingDays);
        }
        if (jobToEdit.callingTimeStart) setCallingTimeStart(jobToEdit.callingTimeStart);
        if (jobToEdit.callingTimeEnd) setCallingTimeEnd(jobToEdit.callingTimeEnd);
        if (jobToEdit.callingTimeStart && jobToEdit.callingTimeEnd) {
          setCallingSlotPreset(`${jobToEdit.callingTimeStart} to ${jobToEdit.callingTimeEnd}`);
        }
        setUrgentHiring(Boolean(jobToEdit.urgentHiring));
        setSkills(Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(", ") : jobToEdit.skills || "");
        setDescription(jobToEdit.description || "");
        setRequirements(Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join("\n") : jobToEdit.requirements || "");
        setBenefits(Array.isArray(jobToEdit.benefits) ? jobToEdit.benefits.join("\n") : jobToEdit.benefits || "");
        setOtherRequirements(jobToEdit.otherRequirements || "");
        setFeatured(Boolean(jobToEdit.featured));
        if (jobToEdit.branchId) setSelectedBranchId(jobToEdit.branchId);
        setProbationPeriod(jobToEdit.probationPeriod || "");
        setPerkTags(jobToEdit.perkTags || []);
        if (jobToEdit.agePreference) {
          const match = String(jobToEdit.agePreference).match(/(\d+)\s*[-to]+\s*(\d+)/i);
          if (match) {
            setAgeMin(match[1]);
            setAgeMax(match[2]);
          }
        }
        setLanguagesRequired(jobToEdit.languagesRequired || ["Hindi"]);
        setNoticePeriod(jobToEdit.noticePeriod || "");
        setContactPerson(jobToEdit.contactPerson || "");
        setContactEmail(jobToEdit.contactEmail || "");
        setReferralBonus(jobToEdit.referralBonus || "");
        setContactConsent(true);
      } else {
        // Fresh posting defaults - clean & unselected
        setTitle("");
        setCompany(user?.companyName || user?.name || "");
        setLocation(user?.location || "");
        setWorkplaceType("");
        setJobType("");
        setJobCategory("");
        setOpeningsCount("");
        setUrgentHiring(false);
        setSalaryMonthlyMin("");
        setSalaryMonthlyMax("");
        setSalaryMin("");
        setSalaryMax("");
        setExperienceLevel("");
        setQualification("");
        setShiftTiming("");
        setShiftInTime("");
        setShiftOutTime("");
        setWorkingDaysList([]);
        setWorkingDays("");
        setExpiryDays("30");
        setGenderPreference("");
        setEnglishLevel("");
        setRequiredAssets([]);
        setInterviewMode("");
        setInterviewAddress("");
        setInterviewStartDate("");
        setInterviewEndDate("");
        setInterviewStartTime("");
        setInterviewEndTime("");
        setInterviewTimeSlot("");
        setRecruiterWhatsApp(user?.phone || "");
        setCallingDaysList([]);
        setCallingTimeStart("");
        setCallingTimeEnd("");
        setCallingSlotPreset("");
        setSkills("");
        setDescription("");
        setRequirements("");
        setBenefits("");
        setOtherRequirements("");
        setFeatured(false);
        setSelectedBranchId("");
        setProbationPeriod("");
        setPerkTags([]);
        setAgeMin("");
        setAgeMax("");
        setLanguagesRequired([]);
        setNoticePeriod("");
        setContactPerson(user?.name || "");
        setContactEmail(user?.email || "");
        setReferralBonus("");
        setContactConsent(true);
      }
    }
  }, [isOpen, jobToEdit, user]);

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in or register as an employer to publish a vacancy.");
      return;
    }

    if (user.isBlocked) {
      setError("Your account has been blocked or suspended by Admin. You cannot publish job vacancies.");
      return;
    }

    if (!title.trim()) {
      setError("Please specify the Job Role / Title.");
      setActiveTab("1");
      return;
    }

    const companyToUse = company.trim() || employerName;
    if (!companyToUse) {
      setError("Company Name is required.");
      setActiveTab("1");
      return;
    }

    if (!location.trim()) {
      setError("Work City / Location is required.");
      setActiveTab("1");
      return;
    }

    if (!contactConsent) {
      setError("Please agree to the Fair Hiring Terms & Anti-Fraud Policy before publishing.");
      setActiveTab("5");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedBranchObj = userBranches.find(
        (b: any) => (b.id || b.branchName) === selectedBranchId
      );

      // Consolidate specific requirements into requirements array
      const allRequirementsList = requirements.split("\n").map((r) => r.trim()).filter(Boolean);
      if (otherRequirements.trim()) {
        const extraReqs = otherRequirements.split("\n").map((r) => r.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean);
        allRequirementsList.push(...extraReqs);
      }

      const payload = {
        title: title.trim(),
        company: companyToUse,
        companyLogo: employerLogo,
        location: location.trim() || "India",
        branchId: selectedBranchId !== "custom" && selectedBranchId !== "main" ? selectedBranchId : undefined,
        branchName: selectedBranchObj?.branchName || (selectedBranchId === "main" ? "Head Office" : undefined),
        workplaceType: workplaceType || "On-site",
        experienceLevel: experienceLevel.trim() || "Fresher",
        jobType: jobType || "Full-time",
        jobCategory: jobCategory.trim(),
        salaryMin: Number(salaryMin) || (salaryMonthlyMin ? monthlyToLpa(Number(salaryMonthlyMin)) : 0),
        salaryMax: Number(salaryMax) || (salaryMonthlyMax ? monthlyToLpa(Number(salaryMonthlyMax)) : 0),
        salaryMonthlyMin: Number(salaryMonthlyMin) || (salaryMin ? lpaToMonthly(Number(salaryMin)) : 0),
        salaryMonthlyMax: Number(salaryMonthlyMax) || (salaryMax ? lpaToMonthly(Number(salaryMax)) : 0),
        salaryCurrency: "INR",
        openingsCount: Number(openingsCount) || 1,
        expiryDays: Number(expiryDays) || 30,
        qualification: qualification.trim(),
        shiftTiming: shiftTiming.trim(),
        workingDays: workingDays.trim(),
        genderPreference: genderPreference || "Any",
        englishLevel: englishLevel.trim(),
        requiredAssets,
        interviewMode: interviewMode.trim(),
        interviewAddress: interviewAddress.trim(),
        interviewStartDate: interviewStartDate.trim(),
        interviewEndDate: interviewEndDate.trim(),
        interviewTimeSlot: interviewTimeSlot.trim(),
        recruiterWhatsApp: recruiterWhatsApp.trim(),
        callingDays: callingDaysList,
        callingTimeStart: callingTimeStart.trim(),
        callingTimeEnd: callingTimeEnd.trim(),
        callingHoursSummary: `${
          callingDaysList.length === 7
            ? "All Days"
            : callingDaysList.length === 6 && !callingDaysList.includes("Sun")
            ? "Mon - Sat"
            : callingDaysList.length === 5 && !callingDaysList.includes("Sat") && !callingDaysList.includes("Sun")
            ? "Mon - Fri"
            : callingDaysList.join(", ")
        } (${callingTimeStart || "09:30 AM"} - ${callingTimeEnd || "06:30 PM"})`,
        urgentHiring,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description: description.trim() || `${title} position at ${companyToUse}. Apply now to connect with recruiter directly.`,
        requirements: allRequirementsList,
        otherRequirements: otherRequirements.trim(),
        benefits: benefits.split("\n").map((b) => b.trim()).filter(Boolean),
        featured,
        postedBy: user._id || user.id || user.email,
        probationPeriod: probationPeriod.trim(),
        perkTags,
        contactConsent: true,
        agePreference:
          ageMin && ageMax
            ? `${ageMin} - ${ageMax} Years`
            : ageMin
            ? `${ageMin}+ Years`
            : ageMax
            ? `Up to ${ageMax} Years`
            : "",
        languagesRequired,
        noticePeriod: noticePeriod.trim(),
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        referralBonus: referralBonus.trim(),
      };

      const url = jobToEdit ? `/api/jobs/${jobToEdit._id}` : "/api/jobs";
      const method = jobToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish job opening");
      }

      // Clear local draft upon successful publishing
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      if (user && user.role !== "employer") {
        updateUser({ role: "employer" });
      }

      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#16a34a", "#f59e0b"],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onJobCreated();
        onClose();
      }, 950);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error publishing job";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 1: COMPANY & ROLE DETAILS ──────────────────────────────────
  const renderTab1_CompanyBasics = () => (
    <div className="space-y-4 max-w-[920px] mx-auto">
      {/* Recruiter Support & Value Prop Header (WorkIndia Style) */}
      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-blue-950">
            Post in 2 minutes • Direct Candidate Calls &amp; WhatsApp • Zero Commission
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-800">
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span>Need Help? Call Recruiter Support: <strong className="text-blue-900 font-bold">08069824660</strong></span>
        </div>
      </div>

      {/* Draft Restore Notification Banner (WorkIndia Pattern) */}
      {showDraftBanner && draftAvailable && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="text-xs font-bold text-amber-950">
                Do you want to restore your draft &ldquo;{draftAvailable.title || "Untitled"}&rdquo; job?
              </div>
              <div className="text-[11px] text-amber-800/80 flex items-center gap-1.5 flex-wrap mt-0.5">
                {[
                  draftAvailable.location,
                  draftAvailable.qualification,
                  draftAvailable.experienceLevel,
                  draftAvailable.salaryMonthlyMin ? `₹${draftAvailable.salaryMonthlyMin}/mo` : "",
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              size="small"
              type="primary"
              onClick={handleRestoreDraft}
              className="bg-amber-600 hover:bg-amber-500 font-semibold text-xs border-none"
            >
              Restore Draft
            </Button>
            <Button
              size="small"
              type="text"
              onClick={handleDiscardDraft}
              className="text-xs text-amber-900 hover:text-amber-950"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* 1. Job Role Details */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Role Details &amp; Vacancies</span>
        </span>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={14}>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Job Title / Designation <span className="text-red-500">*</span>
            </label>
            <AutoComplete
              size="middle"
              placeholder="Search or enter job title"
              value={title}
              onChange={(val) => setTitle(val)}
              options={TITLE_AUTOCOMPLETE_OPTIONS}
              filterOption={(inputValue, option) =>
                (option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false)
              }
              className="w-full font-medium"
            />
          </Col>

          <Col xs={24} sm={10}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Job Role / Area of Work <span className="text-red-500">*</span>
            </label>
            <Select
              size="middle"
              placeholder="Select job category"
              value={jobCategory || undefined}
              onChange={(val) => setJobCategory(val || "")}
              options={JOB_CATEGORY_SUGGESTIONS.map((c) => ({ label: c.value, value: c.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={24} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              No. of Openings / Vacancies <span className="text-red-500">*</span>
            </label>
            <Input
              size="middle"
              prefix={<Users className="w-3.5 h-3.5 text-slate-400" />}
              placeholder="Number of openings"
              value={openingsCount}
              onChange={(e) => setOpeningsCount(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full font-semibold"
            />
          </Col>

          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Experience Level
            </label>
            <Select
              size="middle"
              placeholder="Select experience level"
              value={experienceLevel || undefined}
              onChange={(val) => setExperienceLevel(val || "")}
              options={EXPERIENCE_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>

          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Min Qualification
            </label>
            <Select
              size="middle"
              placeholder="Select minimum qualification"
              value={qualification || undefined}
              onChange={(val) => setQualification(val || "")}
              options={QUALIFICATION_SUGGESTIONS.map((q) => ({ label: q.value, value: q.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>
      </div>

      {/* 2. Workplace & Location */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Workplace &amp; Location</span>
        </span>

        <Row gutter={[12, 12]}>
          {userBranches.length > 0 && (
            <Col xs={24} sm={12}>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Select Branch
              </label>
              <Select
                size="middle"
                placeholder="Select branch office"
                value={selectedBranchId || undefined}
                allowClear
                onChange={handleBranchSelect}
                className="w-full text-xs font-semibold"
                options={[
                  { label: "🏢 Main / Head Office", value: "main" },
                  ...userBranches.map((b: any) => ({
                    label: `📍 ${b.branchName} (${b.city})`,
                    value: b.id || b.branchName,
                  })),
                  { label: "➕ Custom Location / Other", value: "custom" },
                ]}
              />
            </Col>
          )}

          <Col xs={24} sm={userBranches.length > 0 ? 12 : 24}>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Job Location / Target City <span className="text-red-500">*</span>
            </label>
            <AutoComplete
              size="middle"
              placeholder="Search or enter city"
              value={location}
              onChange={(val) => setLocation(val)}
              options={CITY_AUTOCOMPLETE_OPTIONS}
              filterOption={(inputValue, option) =>
                (option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false)
              }
              className="w-full font-medium"
            />
          </Col>
        </Row>

        {/* Workplace, Job Type, Listing Expiry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200/70">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Workplace</span>
            <Select
              size="middle"
              placeholder="Select workplace"
              value={workplaceType || undefined}
              onChange={(val) => setWorkplaceType(val || "")}
              allowClear
              className="w-full"
              options={[
                { label: "🏢 On-site (Office / Plant)", value: "On-site" },
                { label: "🏡 Remote (WFH)", value: "Remote" },
                { label: "🔄 Hybrid", value: "Hybrid" },
              ]}
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Job Type</span>
            <Select
              size="middle"
              placeholder="Select job type"
              value={jobType || undefined}
              onChange={(val) => setJobType(val || "")}
              allowClear
              className="w-full"
              options={[
                { label: "Full-time (Regular)", value: "Full-time" },
                { label: "Part-time", value: "Part-time" },
                { label: "Contract / Project", value: "Contract" },
                { label: "Internship", value: "Internship" },
              ]}
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Listing Expiry</span>
            <Select
              size="middle"
              value={expiryDays || "30"}
              onChange={(val) => setExpiryDays(val || "30")}
              className="w-full"
              options={[
                { label: "7 Days (Urgent)", value: "7" },
                { label: "15 Days", value: "15" },
                { label: "30 Days (Standard)", value: "30" },
                { label: "45 Days", value: "45" },
                { label: "60 Days", value: "60" },
              ]}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Urgent Hiring</span>
              </span>
              <Switch
                size="small"
                checked={urgentHiring}
                onChange={(checked) => setUrgentHiring(checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Employer Identity Card */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Hiring Company Profile</span>
          </span>
          <Tag className="m-0 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
            Verified Employer
          </Tag>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <Avatar
            size={42}
            shape="square"
            src={employerLogo}
            className="border border-slate-200 rounded-md shrink-0 bg-white text-slate-700 font-bold"
          >
            {employerName.charAt(0)}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 truncate">
              {company || employerName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Direct Corporate Hiring Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── TAB 2: SALARY & SCHEDULE ───────────────────────────────────────
  const renderTab2_SalaryTiming = () => (
    <div className="space-y-4 max-w-[920px] mx-auto">
      {/* Salary Compensation (WorkIndia Monthly In-Hand Pattern) */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
            <span>Monthly In-Hand Salary <span className="text-red-500">*</span></span>
          </span>
          {salaryMin && salaryMax && (
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              ₹{salaryMin} - ₹{salaryMax} LPA
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Enter monthly take-home salary range offered to candidate. Annual LPA is calculated automatically.
        </p>

        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Min Monthly (₹/mo)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="/mo"
              placeholder="Min salary"
              value={salaryMonthlyMin}
              onChange={(e) => handleMonthlyMinChange(e.target.value)}
              className="font-semibold"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Max Monthly (₹/mo)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="/mo"
              placeholder="Max salary"
              value={salaryMonthlyMax}
              onChange={(e) => handleMonthlyMaxChange(e.target.value)}
              className="font-semibold"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Min Annual (₹ LPA)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="LPA"
              placeholder="Min LPA"
              value={salaryMin}
              onChange={(e) => handleLpaMinChange(e.target.value)}
              className="font-semibold"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Max Annual (₹ LPA)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="LPA"
              placeholder="Max LPA"
              value={salaryMax}
              onChange={(e) => handleLpaMaxChange(e.target.value)}
              className="font-semibold"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Probation Period</label>
            <Select
              size="middle"
              placeholder="Select probation period"
              value={probationPeriod || undefined}
              onChange={(val) => setProbationPeriod(val || "")}
              allowClear
              className="w-full"
              options={[
                { label: "No Probation", value: "No Probation" },
                { label: "1 Month", value: "1 Month" },
                { label: "3 Months", value: "3 Months" },
                { label: "6 Months", value: "6 Months" },
              ]}
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Referral Bonus (₹)</label>
            <Input
              size="middle"
              prefix="₹"
              placeholder="Referral bonus amount"
              value={referralBonus}
              onChange={(e) => setReferralBonus(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </Col>
        </Row>
      </div>

      {/* Perks & Benefits Tags */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-slate-500" />
            <span>Company Perks &amp; Benefits</span>
          </span>
          <span className="text-[11px] text-slate-400">Select or type custom &amp; press Enter</span>
        </div>
        <Select
          mode="tags"
          size="middle"
          placeholder="Select perks or type custom (e.g. Free Cab, Health Insurance)..."
          value={perkTags}
          onChange={(val) => setPerkTags(val || [])}
          options={PERK_TAG_SUGGESTIONS.map((p) => ({ label: p.label, value: p.value }))}
          allowClear
          className="w-full"
          tokenSeparators={[","]}
        />
      </div>

      {/* Working Schedule & Shift Timing */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Working Schedule &amp; Shift Timing</span>
        </span>

        {/* Working Days Selection */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block">
                Working Days
              </label>
              <span className="text-[11px] text-slate-500">
                Selected: <strong className="text-slate-800">{workingDays || (workingDaysList.length > 0 ? `${workingDaysList.length} Days` : "Not specified")}</strong>
              </span>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyWorkingDaysPreset(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "6 Days (Mon - Sat, Sun Off)")}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  workingDaysList.length === 6 && !workingDaysList.includes("Sun")
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
              >
                6 Days (Mon-Sat)
              </button>
              <button
                type="button"
                onClick={() => applyWorkingDaysPreset(["Mon", "Tue", "Wed", "Thu", "Fri"], "5 Days (Mon - Fri, Sat & Sun Off)")}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  workingDaysList.length === 5 && !workingDaysList.includes("Sat") && !workingDaysList.includes("Sun")
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
              >
                5 Days (Mon-Fri)
              </button>
              <button
                type="button"
                onClick={() => applyWorkingDaysPreset(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "All 7 Days (Rotational Off)")}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  workingDaysList.length === 7
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
              >
                All 7 Days
              </button>
            </div>
          </div>

          {/* 7 Day Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {WEEK_DAYS.map((day) => {
              const isWorking = workingDaysList.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleWorkingDay(day.key)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 select-none ${
                    isWorking
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  title={`${day.full}: ${isWorking ? "Working Day" : "Weekly Off"}`}
                >
                  {isWorking && <Check className="w-3 h-3 stroke-[2.5]" />}
                  <span>{day.full}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
            <span>Weekly Off:</span>
            <span className="font-semibold text-slate-700">
              {workingDaysList.length === 0
                ? "Not selected"
                : WEEK_DAYS.filter((d) => !workingDaysList.includes(d.key)).map((d) => d.full).join(", ") || "None (Rotational Off)"}
            </span>
          </div>
        </div>

        {/* Shift In & Shift Out Time */}
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={5}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift In Time</label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={5}
              placeholder="In Time"
              value={parseTimeToDayjs(shiftInTime)}
              onChange={(_, timeString) => updateShiftInTime(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
          <Col xs={12} sm={5}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift Out Time</label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={5}
              placeholder="Out Time"
              value={parseTimeToDayjs(shiftOutTime)}
              onChange={(_, timeString) => updateShiftOutTime(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift Duration</label>
            <div className="h-8 px-2.5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              {calculateShiftDuration(shiftInTime, shiftOutTime) || "--"}
            </div>
          </Col>
          <Col xs={24} sm={10}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift Preset / Summary</label>
            <Select
              size="middle"
              placeholder="Select shift preset"
              value={shiftTiming || undefined}
              onChange={(val) => setShiftTiming(val || "")}
              options={SHIFT_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>
      </div>
    </div>
  );

  // ─── TAB 3: CANDIDATE CRITERIA & SPECIFIC REQUIREMENTS (WorkIndia Hero) ─
  const renderTab3_CandidateCriteria = () => (
    <div className="space-y-4 max-w-[920px] mx-auto">
      {/* Candidate Criteria */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Candidate Eligibility &amp; Demographics</span>
        </span>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender Preference</label>
            <Select
              size="middle"
              placeholder="Select Gender"
              value={genderPreference || undefined}
              onChange={(val) => setGenderPreference(val || "")}
              allowClear
              className="w-full"
              options={[
                { label: "No Preference (Any)", value: "Any" },
                { label: "Male Only", value: "Male" },
                { label: "Female Only", value: "Female" },
              ]}
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">English Requirement</label>
            <Select
              size="middle"
              placeholder="Select English Level"
              value={englishLevel || undefined}
              onChange={(val) => setEnglishLevel(val || "")}
              options={ENGLISH_SUGGESTIONS.map((e) => ({ label: e.value, value: e.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Age Preference (Years)
            </label>
            <div className="flex items-center gap-1.5">
              <Input
                size="middle"
                placeholder="Min"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full text-center"
                maxLength={2}
              />
              <span className="text-xs text-slate-400 font-semibold shrink-0">to</span>
              <Input
                size="middle"
                placeholder="Max"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full text-center"
                maxLength={2}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Languages Required</label>
            <Select
              size="middle"
              mode="multiple"
              placeholder="Select languages"
              value={languagesRequired}
              onChange={(val) => setLanguagesRequired(val || [])}
              options={LANGUAGE_SUGGESTIONS.map((l) => ({ label: l.value, value: l.value }))}
              allowClear
              className="w-full"
              maxTagCount={2}
            />
          </Col>
        </Row>
      </div>

      {/* Mandatory Assets / Documents */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Mandatory Candidate Assets / Documents</span>
          </span>
          <span className="text-[11px] text-slate-400">Select or type custom &amp; press Enter</span>
        </div>
        <Select
          mode="tags"
          size="middle"
          placeholder="Select mandatory assets (e.g. 2-Wheeler, Aadhaar, Smartphone)..."
          value={requiredAssets}
          onChange={(val) => setRequiredAssets(val || [])}
          options={ASSET_SUGGESTIONS.map((a) => ({ label: a.label, value: a.value }))}
          allowClear
          className="w-full"
          tokenSeparators={[","]}
        />
      </div>

      {/* WORKINDIA HERO FIELD: "Any other specific requirement (Optional)" */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Any Other Specific Requirement (Optional)</span>
          </label>
          <span className="text-[11px] text-slate-400">AI-optimized candidate matching</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-2">
          Add any detail like: Industry, Age, Gender, Certification, Incentives, Tools, or Skills required:
        </p>

        <Input.TextArea
          rows={3}
          placeholder="Enter any other specific qualification, certificate, or tool requirements"
          value={otherRequirements}
          onChange={(e) => setOtherRequirements(e.target.value)}
          className="text-xs mb-3"
        />

        {/* 1-Click Suggestion Tags (WorkIndia Pattern) */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Click to add common requirements:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SPECIFIC_REQUIREMENT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAppendSpecificRequirement(preset)}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>+</span>
                <span>{preset}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── TAB 4: INTERVIEW & CONTACT ─────────────────────────────────────
  const renderTab4_Interview = () => (
    <div className="space-y-4 max-w-[920px] mx-auto">
      {/* Interview Process */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Video className="w-3.5 h-3.5 text-slate-500" />
          <span>Interview Mode &amp; Recruiter Contact</span>
        </span>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Mode</label>
            <Select
              size="middle"
              placeholder="Select interview mode"
              value={interviewMode || undefined}
              onChange={(val) => setInterviewMode(val || "")}
              options={INTERVIEW_MODE_SUGGESTIONS.map((m) => ({ label: m.value, value: m.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Recruiter WhatsApp Number <span className="text-emerald-600">(Direct Candidate Contact)</span>
            </label>
            <Input
              size="middle"
              placeholder="10-digit WhatsApp number"
              prefix={<PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
              value={recruiterWhatsApp}
              onChange={(e) => setRecruiterWhatsApp(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Person Name</label>
            <Input
              size="middle"
              prefix={<User className="w-3.5 h-3.5 text-slate-400" />}
              placeholder="Contact person name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Venue / Walk-in Address</label>
            <Input
              size="middle"
              placeholder="Enter interview venue or office address"
              prefix={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              value={interviewAddress}
              onChange={(e) => setInterviewAddress(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Official Contact Email</label>
            <Input
              size="middle"
              placeholder="Official contact email"
              prefix={<MessageSquare className="w-3.5 h-3.5 text-slate-400" />}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </Col>
        </Row>
      </div>

      {/* Candidate Calling Days & Hours */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            <span>Recruiter Calling Days &amp; Timings (कैंडिडेट कब कॉल कर सकते हैं)</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {callingDaysList.length === 7 ? "All 7 Days" : callingDaysList.length > 0 ? `${callingDaysList.length} Days Active` : "Not specified"}
          </span>
        </div>

        {/* Calling Days Selection */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-slate-600 block">
              Calling Days (कॉल करने के दिन)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCallingDaysList(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  callingDaysList.length === 6 && !callingDaysList.includes("Sun")
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                Mon - Sat
              </button>
              <button
                type="button"
                onClick={() => setCallingDaysList(["Mon", "Tue", "Wed", "Thu", "Fri"])}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  callingDaysList.length === 5 && !callingDaysList.includes("Sat") && !callingDaysList.includes("Sun")
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                Mon - Fri
              </button>
              <button
                type="button"
                onClick={() => setCallingDaysList(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])}
                className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                  callingDaysList.length === 7
                    ? "bg-blue-600 text-white border-blue-600 font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                All 7 Days
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {WEEK_DAYS.map((day) => {
              const isSelected = callingDaysList.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleCallingDay(day.key)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 select-none ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  <span>{day.full}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calling Hours Window */}
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Calling Time Preset (समय स्लॉट)
            </label>
            <Select
              size="middle"
              value={callingSlotPreset || undefined}
              onChange={handleCallingSlotPreset}
              options={CALLING_TIME_SLOT_PRESETS}
              placeholder="Select standard calling hours"
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Call Start Time (कॉल शुरू)
            </label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={15}
              placeholder="Start Time"
              value={parseTimeToDayjs(callingTimeStart)}
              onChange={(_, timeString) => updateCallingTimeStart(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Call End Time (कॉल समाप्त)
            </label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={15}
              placeholder="End Time"
              value={parseTimeToDayjs(callingTimeEnd)}
              onChange={(_, timeString) => updateCallingTimeEnd(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
        </Row>

        {/* Live Candidate Calling Notice Preview */}
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">Candidate Calling Notice: </span>
            <span>
              {callingDaysList.length > 0 ? (
                <>
                  Candidates can call HR on{" "}
                  <strong className="text-emerald-950 font-bold">
                    {callingDaysList.length === 7
                      ? "All 7 Days"
                      : callingDaysList.length === 6 && !callingDaysList.includes("Sun")
                      ? "Monday to Saturday"
                      : callingDaysList.length === 5 && !callingDaysList.includes("Sat") && !callingDaysList.includes("Sun")
                      ? "Monday to Friday"
                      : callingDaysList.map((k) => WEEK_DAYS.find((w) => w.key === k)?.full || k).join(", ")}
                  </strong>{" "}
                  between{" "}
                  <strong className="text-emerald-950 font-bold">
                    {callingTimeStart || "09:30 AM"} to {callingTimeEnd || "06:30 PM"}
                  </strong>
                  .
                </>
              ) : (
                "Select calling days and hours above to inform candidates when they can call HR."
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Interview Schedule Timing */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Interview Schedule Window</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Candidate Slot Window
          </span>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Start Date</label>
            <Input
              size="middle"
              type="date"
              value={interviewStartDate}
              onChange={(e) => setInterviewStartDate(e.target.value)}
              className="font-medium"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview End Date / Deadline</label>
            <Input
              size="middle"
              type="date"
              value={interviewEndDate}
              onChange={(e) => setInterviewEndDate(e.target.value)}
              className="font-medium"
            />
          </Col>
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Daily Interview Time Slot Preset</label>
            <Select
              size="middle"
              placeholder="Select daily interview slot"
              value={interviewTimeSlot || undefined}
              onChange={handleInterviewSlotPreset}
              options={INTERVIEW_TIME_SLOT_SUGGESTIONS.map((t) => ({ label: t.value, value: t.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-2.5">
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">In Time (Start Window)</label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={15}
              placeholder="Start Time"
              value={parseTimeToDayjs(interviewStartTime)}
              onChange={(_, timeString) => updateInterviewStartTime(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Out Time (End Window)</label>
            <TimePicker
              size="middle"
              use12Hours
              format="h:mm A"
              minuteStep={15}
              placeholder="End Time"
              value={parseTimeToDayjs(interviewEndTime)}
              onChange={(_, timeString) => updateInterviewEndTime(typeof timeString === "string" ? timeString : "")}
              className="w-full"
              allowClear
            />
          </Col>
        </Row>

        <div className="mt-2.5 text-[11px] text-slate-600 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            {interviewStartDate || interviewEndDate || interviewTimeSlot ? (
              <>
                Candidate Notice: Walk-in / Interview window is active between{" "}
                <strong className="text-slate-900 font-bold">{interviewStartDate || "Immediate"}</strong> and{" "}
                <strong className="text-slate-900 font-bold">{interviewEndDate || "Vacancy Active"}</strong> during{" "}
                <strong className="text-slate-900 font-bold">{interviewTimeSlot || "Designated Hours"}</strong>.
              </>
            ) : (
              "Tip: Setting an interview window helps candidates arrive prepared without scheduling delays."
            )}
          </span>
        </div>
      </div>
    </div>
  );

  // ─── TAB 5: DESCRIPTION, STATUTORY NOTICE & CONSENT ──────────────────
  const renderTab5_Description = () => (
    <div className="space-y-4 max-w-[920px] mx-auto">
      {/* Description & Responsibilities */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Job Description &amp; Responsibilities</span>
        </span>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Required Key Skills (Comma separated)
            </label>
            <Input
              size="middle"
              placeholder="e.g. Sales, Telecalling, Computer, Customer Handling"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Job Responsibilities &amp; Overview
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Enter brief role overview and key day-to-day responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Candidate Requirements (One per line)
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Enter candidate requirements (one per line)"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="text-xs"
              />
            </Col>
            <Col xs={24} sm={12}>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Perks &amp; Incentives Notes (One per line)
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Enter perks, allowances &amp; incentives (one per line)"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="text-xs"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Featured & Urgent Visibility */}
      <div className="p-4 rounded-xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 text-slate-500" />
          <span>Listing Visibility &amp; Highlights</span>
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span>Featured Listing (Top Rank)</span>
            </span>
            <Switch
              size="small"
              checked={featured}
              onChange={(checked) => setFeatured(checked)}
            />
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span>Urgent Hiring Badge</span>
            </span>
            <Switch
              size="small"
              checked={urgentHiring}
              onChange={(checked) => setUrgentHiring(checked)}
            />
          </div>
        </div>
      </div>

      {/* WORKINDIA CRITICAL STATUTORY ANTI-FRAUD NOTICE */}
      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-rose-950 text-xs mb-1">
            Zero-Tolerance Policy: Asking Job Seekers for Any Payment is Strictly Prohibited
          </div>
          <div className="text-[11px] text-rose-800 leading-relaxed">
            Under Indian Employment laws &amp; platform security policy, charging registration fees, deposit, documentation costs, or training fees to candidates is illegal. Recruiter KYC verification is mandatory. Any fee complaint leads to immediate account ban and blacklisting.
          </div>
        </div>
      </div>

      {/* WORKINDIA RECRUITER CONSENT & TERMS CHECKBOX */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
        <Checkbox
          checked={contactConsent}
          onChange={(e) => setContactConsent(e.target.checked)}
          className="text-xs text-slate-700 leading-snug"
        >
          <span className="font-medium">
            I agree to the <strong className="text-slate-900">Terms &amp; Conditions</strong>, <strong className="text-slate-900">Privacy Policy</strong>, and provide consent to be contacted by candidates, sales agents, and customer support via WhatsApp, SMS, phone calls, and email.
          </span>
        </Checkbox>
      </div>
    </div>
  );

  // ─── TAB ITEMS DEFINITION ───────────────────────────────────────────
  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">1. Company &amp; Role</span>
          <span className="sm:hidden">1. Role</span>
        </span>
      ),
      children: renderTab1_CompanyBasics(),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <IndianRupee className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">2. Salary &amp; Timing</span>
          <span className="sm:hidden">2. Salary</span>
        </span>
      ),
      children: renderTab2_SalaryTiming(),
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">3. Candidate Criteria</span>
          <span className="sm:hidden">3. Criteria</span>
        </span>
      ),
      children: renderTab3_CandidateCriteria(),
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">4. Interview &amp; Contact</span>
          <span className="sm:hidden">4. Interview</span>
        </span>
      ),
      children: renderTab4_Interview(),
    },
    {
      key: "5",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <FileCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">5. Description &amp; Terms</span>
          <span className="sm:hidden">5. Publish</span>
        </span>
      ),
      children: renderTab5_Description(),
    },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        success ? null : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Left: WorkIndia "No - I'm a candidate" Exit Button & Save Draft */}
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="middle"
                onClick={() => {
                  onClose();
                  if (onSwitchToCandidate) {
                    onSwitchToCandidate();
                  } else {
                    const el = document.getElementById("job-listings");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs text-slate-500 hover:text-blue-600 font-medium px-2"
              >
                No - I’m a candidate
              </Button>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <Button
                type="dashed"
                size="middle"
                onClick={handleSaveDraftManually}
                className="text-xs text-slate-600 font-medium"
              >
                Save Draft
              </Button>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <Button
                type="text"
                size="middle"
                icon={<Lightbulb className="w-3.5 h-3.5 text-amber-500" />}
                onClick={() => setShowInsightsDrawer(true)}
                className="text-xs text-slate-600 hover:text-amber-600 font-medium hidden sm:inline-flex items-center gap-1"
              >
                Hiring Insights
              </Button>
            </div>

            {/* Right: Step Navigation / Publish */}
            <div className="flex items-center gap-2 ml-auto">
              {activeTab !== "1" && (
                <Button
                  size="middle"
                  onClick={() => setActiveTab(String(Number(activeTab) - 1))}
                  className="font-semibold"
                >
                  ← Back
                </Button>
              )}
              {activeTab !== "5" ? (
                <Button
                  type="primary"
                  size="middle"
                  onClick={() => setActiveTab(String(Number(activeTab) + 1))}
                  className="font-bold shadow-xs"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="middle"
                  icon={<Check className="w-3.5 h-3.5" />}
                  loading={loading}
                  onClick={handleSubmit}
                  disabled={!contactConsent}
                  className="font-bold shadow-xs active:scale-95 bg-blue-600 hover:bg-blue-500"
                >
                  {jobToEdit ? "Update Opening" : "Post Job Now"}
                </Button>
              )}
            </div>
          </div>
        )
      }
      className="post-job-full-modal"
      wrapClassName="post-job-full-modal-wrap"
      width="100vw"
      style={{
        maxWidth: "100vw",
        width: "100vw",
        height: "100vh",
        top: 0,
        margin: 0,
        padding: 0,
      }}
      centered={false}
      styles={{
        body: {
          flex: "1 1 auto",
          padding: "20px 24px",
          maxHeight: "calc(100vh - 130px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          background: "#f8fafc",
        },
        header: {
          padding: "14px 24px",
          marginBottom: 0,
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
        },
        footer: {
          marginTop: "auto",
          padding: "12px 24px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        },
      }}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 leading-tight">
                {jobToEdit ? "Edit Job Vacancy" : "Post Job Opening for Free & Hire Staff"}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                Direct Corporate Hiring • Zero Commission • Connect directly with candidates
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="hidden sm:inline-flex m-0 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200">
              STEP {activeTab}/5
            </Tag>
          </div>
        </div>
      }
    >
      <ConfigProvider
        getPopupContainer={(node) => {
          if (typeof document !== "undefined") {
            const modalBody = node?.closest(".ant-modal-body");
            if (modalBody) return modalBody as HTMLElement;
          }
          return (node?.parentElement || document.body) as HTMLElement;
        }}
      >
        {/* Blocked Account Notice */}
        {user?.isBlocked && (
          <Alert
            type="error"
            showIcon
            className="mb-3 rounded-xl text-xs"
            message="Account Blocked / Suspended by Admin"
            description="Your account has been restricted by platform moderators. You cannot publish or edit vacancies. Please contact support."
          />
        )}

        {/* Guest Notice */}
        {!user && (
          <Alert
            type="info"
            showIcon
            className="mb-3 rounded-xl text-xs"
            message="Post job with 1-Click Recruiter Demo or Sign in"
            description={
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => loginAsDemo("employer")}
                >
                  1-Click Employer Demo Login
                </Button>
                {onOpenEmployerAuth && (
                  <Button size="small" onClick={onOpenEmployerAuth}>
                    Sign In / Register
                  </Button>
                )}
              </div>
            }
          />
        )}

        {error && (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            message={error}
            className="mb-3 rounded-xl text-xs"
          />
        )}

        {success ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mb-3">
              <Check className="w-7 h-7" />
            </div>
            <div className="font-bold text-lg text-slate-900">
              {jobToEdit ? "Job Updated Successfully!" : "Job Published Live!"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Candidates can now discover this vacancy and contact you directly via WhatsApp &amp; phone.
            </div>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="post-job-tabs"
            tabBarStyle={{
              marginBottom: 16,
              borderBottom: "2px solid #e2e8f0",
              fontWeight: 600,
            }}
          />
        )}

        {/* WORKINDIA STYLE SMART INSIGHTS DRAWER */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm text-slate-900">Before you proceed, we have insights for you!</span>
            </div>
          }
          placement="right"
          size="default"
          open={showInsightsDrawer}
          onClose={() => setShowInsightsDrawer(false)}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-bold text-blue-900 text-xs mb-1">
                WorkIndia Style Smart Optimization
              </div>
              <div className="text-[11px] text-blue-700">
                These suggestions help improve qualified candidate applications and lead conversion.
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                  <tr>
                    <th className="p-2.5 font-bold">Parameter</th>
                    <th className="p-2.5 font-bold">Selection</th>
                    <th className="p-2.5 font-bold">Suggested</th>
                    <th className="p-2.5 font-bold">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-700">Experience</td>
                    <td className="p-2.5 text-slate-600">{experienceLevel || "1 Year"}</td>
                    <td className="p-2.5 font-bold text-blue-600">Fresher + Exp</td>
                    <td className="p-2.5 text-emerald-600 font-bold">+45% Inquiries</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-700">Monthly Salary</td>
                    <td className="p-2.5 text-slate-600">
                      {salaryMonthlyMin ? `₹${salaryMonthlyMin}` : "Unset"}
                    </td>
                    <td className="p-2.5 font-bold text-blue-600">₹18k - ₹25k</td>
                    <td className="p-2.5 text-emerald-600 font-bold">Top 15% Rank</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-700">Direct Contact</td>
                    <td className="p-2.5 text-slate-600">
                      {recruiterWhatsApp ? "WhatsApp On" : "None"}
                    </td>
                    <td className="p-2.5 font-bold text-blue-600">HR WhatsApp</td>
                    <td className="p-2.5 text-emerald-600 font-bold">2x Faster Hire</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Predicted Candidate Reach: <strong>~75 to 130 applicants in 48 hrs</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero commission — direct connect to candidate WhatsApp</span>
              </div>
            </div>

            <Button
              type="primary"
              block
              onClick={() => setShowInsightsDrawer(false)}
              className="mt-2 font-bold"
            >
              Continue to Job Posting
            </Button>
          </div>
        </Drawer>
      </ConfigProvider>
    </Modal>
  );
}
