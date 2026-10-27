"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { ALL_CATALOG_JOB_ROLES } from "@/data/businessCatalog";
import {
  Modal,
  Input,
  Select,
  Button,
  Row,
  Col,
  Alert,
  Switch,
  Tag,
  Avatar,
  ConfigProvider,
  Tabs,
} from "antd";
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
  Hourglass,
  Award,
  Video,
  UserCheck,
  Plus,
  Trash2,
  IndianRupee,
  MessageSquare,
  Star,
  Globe,
  Timer,
  Gift,
  User,
  Languages,
  FileText,
} from "lucide-react";
import { monthlyToLpa, lpaToMonthly } from "@/lib/utils";

// Autocomplete suggestion lists (Users can select OR type any custom value)
const QUALIFICATION_SUGGESTIONS = [
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

const SHIFT_IN_TIME_SUGGESTIONS = [
  { value: "08:00 AM" },
  { value: "08:30 AM" },
  { value: "09:00 AM" },
  { value: "09:30 AM" },
  { value: "10:00 AM" },
  { value: "10:30 AM" },
  { value: "11:00 AM" },
  { value: "02:00 PM" },
  { value: "08:00 PM" },
];

const SHIFT_OUT_TIME_SUGGESTIONS = [
  { value: "05:00 PM" },
  { value: "05:30 PM" },
  { value: "06:00 PM" },
  { value: "06:30 PM" },
  { value: "07:00 PM" },
  { value: "07:30 PM" },
  { value: "08:00 PM" },
  { value: "10:30 PM" },
  { value: "05:00 AM" },
];

const WORKING_DAYS_SUGGESTIONS = [
  { value: "6 Days (Mon - Sat)" },
  { value: "5 Days (Mon - Fri)" },
  { value: "Alternate Saturdays Off" },
  { value: "Rotational Off" },
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
  { value: "Interview Schedule (Scheduled Slot)" },
  { value: "Direct Walk-in Interview" },
  { value: "Online (Google Meet / Zoom)" },
  { value: "Telephonic Interview" },
];

const INTERVIEW_START_TIME_SUGGESTIONS = [
  { value: "08:00 AM" },
  { value: "08:30 AM" },
  { value: "09:00 AM" },
  { value: "09:30 AM" },
  { value: "10:00 AM" },
  { value: "10:30 AM" },
  { value: "11:00 AM" },
  { value: "11:30 AM" },
  { value: "12:00 PM" },
  { value: "01:00 PM" },
  { value: "02:00 PM" },
  { value: "03:00 PM" },
  { value: "04:00 PM" },
];

const INTERVIEW_END_TIME_SUGGESTIONS = [
  { value: "12:00 PM" },
  { value: "01:00 PM" },
  { value: "02:00 PM" },
  { value: "03:00 PM" },
  { value: "04:00 PM" },
  { value: "04:30 PM" },
  { value: "05:00 PM" },
  { value: "05:30 PM" },
  { value: "06:00 PM" },
  { value: "06:30 PM" },
  { value: "07:00 PM" },
  { value: "08:00 PM" },
];

const INTERVIEW_TIME_SLOT_SUGGESTIONS = [
  { value: "10:00 AM to 01:00 PM (Morning Slot)" },
  { value: "11:00 AM to 04:00 PM (Standard Slot)" },
  { value: "02:00 PM to 05:30 PM (Afternoon Slot)" },
  { value: "10:00 AM to 06:00 PM (Full Day Slot)" },
  { value: "Flexible Hours (With Prior Appointment)" },
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

const JOB_CATEGORY_SUGGESTIONS = [
  { value: "Sales & Marketing" },
  { value: "IT & Software" },
  { value: "Customer Support / BPO" },
  { value: "Back Office / Data Entry" },
  { value: "Accounting & Finance" },
  { value: "HR & Recruitment" },
  { value: "Operations & Logistics" },
  { value: "Manufacturing / Production" },
  { value: "Healthcare / Pharma" },
  { value: "Education / Teaching" },
  { value: "Retail / Store" },
  { value: "Delivery / Driver" },
  { value: "Security / Housekeeping" },
  { value: "Engineering / Technical" },
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
  { value: "Within 90 Days" },
];

const PERK_TAG_SUGGESTIONS = [
  { label: "PF & ESI", value: "PF & ESI" },
  { label: "Free Meals", value: "Free Meals" },
  { label: "Cab / Transport", value: "Cab / Transport" },
  { label: "Health Insurance", value: "Health Insurance" },
  { label: "Incentives", value: "Incentives" },
  { label: "Annual Bonus", value: "Annual Bonus" },
  { label: "Leave Encashment", value: "Leave Encashment" },
  { label: "Training Provided", value: "Training Provided" },
  { label: "Work From Home", value: "Work From Home" },
  { label: "Flexible Hours", value: "Flexible Hours" },
  { label: "Gratuity", value: "Gratuity" },
  { label: "Mobile Allowance", value: "Mobile Allowance" },
];

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  onOpenEmployerAuth?: () => void;
  jobToEdit?: any | null;
}

export function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
  onOpenEmployerAuth,
  jobToEdit,
}: PostJobModalProps) {
  const { user, updateUser, loginAsDemo } = useAuth();

  // Employer identity from profile DP (no upload field)
  const employerName = user?.companyName || user?.name || "Corporate Employer";
  const employerLogo = user?.avatar || user?.companyLogo || "/company-profile.jpeg";

  // Employer Registered Branches
  const userBranches = user?.employerDetails?.branches || (user as any)?.branches || [];

  // Active Tab
  const [activeTab, setActiveTab] = useState("1");

  // Form States (Clean & Empty by default - No dummy data)
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [workplaceType, setWorkplaceType] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [openingsCount, setOpeningsCount] = useState("");
  const [urgentHiring, setUrgentHiring] = useState(false);
  const [jobCategory, setJobCategory] = useState("");

  // Compensation States (Monthly <-> LPA dual sync)
  const [salaryMonthlyMin, setSalaryMonthlyMin] = useState("");
  const [salaryMonthlyMax, setSalaryMonthlyMax] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [probationPeriod, setProbationPeriod] = useState("");
  const [perkTags, setPerkTags] = useState<string[]>([]);

  // Role Specs (Custom values supported)
  const [experienceLevel, setExperienceLevel] = useState("");
  const [qualification, setQualification] = useState("");
  const [shiftTiming, setShiftTiming] = useState("");
  const [shiftInTime, setShiftInTime] = useState("");
  const [shiftOutTime, setShiftOutTime] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [expiryDays, setExpiryDays] = useState<string>("");

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

  // Candidate Criteria & Interview
  const [genderPreference, setGenderPreference] = useState<string>("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [requiredAssets, setRequiredAssets] = useState<string[]>([]);
  const [customAssetInput, setCustomAssetInput] = useState("");
  const [interviewMode, setInterviewMode] = useState("");
  const [interviewAddress, setInterviewAddress] = useState("");
  const [interviewStartDate, setInterviewStartDate] = useState("");
  const [interviewEndDate, setInterviewEndDate] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState("");
  const [interviewEndTime, setInterviewEndTime] = useState("");
  const [interviewTimeSlot, setInterviewTimeSlot] = useState("");
  const [recruiterWhatsApp, setRecruiterWhatsApp] = useState("");
  const [agePreference, setAgePreference] = useState("");
  const [languagesRequired, setLanguagesRequired] = useState<string[]>([]);
  const [noticePeriod, setNoticePeriod] = useState("");

  // Contact & Additional
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [referralBonus, setReferralBonus] = useState("");

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

  // Custom Asset Handlers
  const addCustomAsset = () => {
    const trimmed = customAssetInput.trim();
    if (trimmed && !requiredAssets.includes(trimmed)) {
      setRequiredAssets([...requiredAssets, trimmed]);
      setCustomAssetInput("");
    }
  };

  const removeAsset = (val: string) => {
    setRequiredAssets(requiredAssets.filter((a) => a !== val));
  };

  const toggleAsset = (val: string) => {
    if (requiredAssets.includes(val)) {
      setRequiredAssets(requiredAssets.filter((a) => a !== val));
    } else {
      setRequiredAssets([...requiredAssets, val]);
    }
  };

  // Perk Tag Handlers
  const togglePerk = (val: string) => {
    if (perkTags.includes(val)) {
      setPerkTags(perkTags.filter((p) => p !== val));
    } else {
      setPerkTags([...perkTags, val]);
    }
  };

  // Details
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Dynamic City options via API
  const [cityOptions, setCityOptions] = useState<{ value: string }[]>([]);
  const fetchCities = async (q: string = "") => {
    try {
      const res = await fetch(`/api/locations?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.suggestions) {
        setCityOptions(data.suggestions.map((c: string) => ({ value: c })));
      }
    } catch {
      // ignore
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

  // Lock background body scroll when modal is active
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

  // Reset or pre-fill on modal open
  useEffect(() => {
    if (isOpen) {
      fetchCities("");
      setError("");
      setSuccess(false);
      setActiveTab("1");

      if (jobToEdit) {
        // Pre-fill for Edit mode
        setTitle(jobToEdit.title || "");
        setCompany(jobToEdit.company || employerName);
        setLocation(jobToEdit.location || "");
        setWorkplaceType(jobToEdit.workplaceType || "");
        setExperienceLevel(jobToEdit.experienceLevel || "");
        setJobType(jobToEdit.jobType || "");
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
        setOpeningsCount(jobToEdit.openingsCount ? String(jobToEdit.openingsCount) : "");
        setExpiryDays(jobToEdit.expiryDays ? String(jobToEdit.expiryDays) : "");
        setQualification(jobToEdit.qualification || "");
        setShiftTiming(jobToEdit.shiftTiming || "");
        if (jobToEdit.shiftTiming && jobToEdit.shiftTiming.includes(" - ")) {
          const cleanT = jobToEdit.shiftTiming.replace(/.*\(|\).*/g, "");
          const parts = cleanT.split(" - ");
          if (parts[0]) setShiftInTime(parts[0].trim());
          if (parts[1]) setShiftOutTime(parts[1].trim());
        } else {
          setShiftInTime("");
          setShiftOutTime("");
        }
        setWorkingDays(jobToEdit.workingDays || "");
        setGenderPreference(jobToEdit.genderPreference || "");
        setEnglishLevel(jobToEdit.englishLevel || "");
        setRequiredAssets(jobToEdit.requiredAssets || []);
        setInterviewMode(jobToEdit.interviewMode || "");
        setInterviewAddress(jobToEdit.interviewAddress || "");
        setInterviewStartDate(jobToEdit.interviewStartDate || "");
        setInterviewEndDate(jobToEdit.interviewEndDate || "");
        setInterviewTimeSlot(jobToEdit.interviewTimeSlot || "");
        if (jobToEdit.interviewTimeSlot && jobToEdit.interviewTimeSlot.includes(" - ")) {
          const cleanT = jobToEdit.interviewTimeSlot.replace(/.*\(|\).*/g, "");
          const parts = cleanT.split(" - ");
          if (parts[0]) setInterviewStartTime(parts[0].trim());
          if (parts[1]) setInterviewEndTime(parts[1].trim());
        } else {
          setInterviewStartTime("");
          setInterviewEndTime("");
        }
        setRecruiterWhatsApp(jobToEdit.recruiterWhatsApp || user?.phone || "");
        setUrgentHiring(Boolean(jobToEdit.urgentHiring));
        setSkills(Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(", ") : jobToEdit.skills || "");
        setDescription(jobToEdit.description || "");
        setRequirements(Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join("\n") : jobToEdit.requirements || "");
        setBenefits(Array.isArray(jobToEdit.benefits) ? jobToEdit.benefits.join("\n") : jobToEdit.benefits || "");
        setFeatured(Boolean(jobToEdit.featured));
        if (jobToEdit.branchId) setSelectedBranchId(jobToEdit.branchId);
        setProbationPeriod(jobToEdit.probationPeriod || "");
        setPerkTags(jobToEdit.perkTags || []);
        setAgePreference(jobToEdit.agePreference || "");
        setLanguagesRequired(jobToEdit.languagesRequired || []);
        setNoticePeriod(jobToEdit.noticePeriod || "");
        setContactPerson(jobToEdit.contactPerson || "");
        setContactEmail(jobToEdit.contactEmail || "");
        setReferralBonus(jobToEdit.referralBonus || "");
      } else {
        // Clean blank form for fresh posting (No dummy pre-fill)
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
        setWorkingDays("");
        setExpiryDays("");
        setGenderPreference("");
        setEnglishLevel("");
        setRequiredAssets([]);
        setCustomAssetInput("");
        setInterviewMode("");
        setInterviewAddress("");
        setInterviewStartDate("");
        setInterviewEndDate("");
        setInterviewStartTime("");
        setInterviewEndTime("");
        setInterviewTimeSlot("");
        setRecruiterWhatsApp(user?.phone || "");
        setSkills("");
        setDescription("");
        setRequirements("");
        setBenefits("");
        setFeatured(false);
        setSelectedBranchId("");
        setProbationPeriod("");
        setPerkTags([]);
        setAgePreference("");
        setLanguagesRequired([]);
        setNoticePeriod("");
        setContactPerson(user?.name || "");
        setContactEmail(user?.email || "");
        setReferralBonus("");
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

    setLoading(true);
    setError("");

    try {
      const selectedBranchObj = userBranches.find(
        (b: any) => (b.id || b.branchName) === selectedBranchId
      );

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
        urgentHiring,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description: description.trim(),
        requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        benefits: benefits.split("\n").map((b) => b.trim()).filter(Boolean),
        featured,
        postedBy: user._id || user.id || user.email,
        probationPeriod: probationPeriod.trim(),
        perkTags,
        agePreference: agePreference.trim(),
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

      if (user && user.role !== "employer") {
        updateUser({ role: "employer" });
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ea580c", "#fb923c", "#16a34a"],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onJobCreated();
        onClose();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error publishing job";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB CONTENT RENDERERS ───────────────────────────────────────────

  const renderTab1_CompanyBasics = () => (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Employer Identity Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-orange-600" />
            <span>Company &amp; Branch Location</span>
          </span>
          <Tag color="green" className="m-0 text-[10px] font-bold">
            Verified DP
          </Tag>
        </div>

        {/* Employer DP Display */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 mb-3">
          <Avatar
            size={44}
            shape="square"
            src={employerLogo}
            className="border border-slate-200 rounded-lg shrink-0"
          >
            {employerName.charAt(0)}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 truncate">
              {company || employerName}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Company Profile DP Attached</span>
            </div>
          </div>
        </div>

        <Row gutter={[12, 12]}>
          {userBranches.length > 0 && (
            <Col xs={24} sm={12}>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Select Branch
              </label>
              <Select
                size="middle"
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
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Work City / State <span className="text-red-500">*</span>
            </label>
            <Input
              size="middle"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
              prefix={<MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 inline" />}
            />
          </Col>
        </Row>

        {/* Workplace, Job Type, Listing Expiry, Urgent */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200/70">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Workplace</span>
            <Select
              size="middle"
              value={workplaceType || undefined}
              allowClear
              onChange={(val) => setWorkplaceType(val || "")}
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
              value={jobType || undefined}
              allowClear
              onChange={(val) => setJobType(val || "")}
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
              value={expiryDays || undefined}
              allowClear
              onChange={(val) => setExpiryDays(val || "")}
              className="w-full"
              options={[
                { label: "7 Days (Urgent)", value: "7" },
                { label: "15 Days", value: "15" },
                { label: "30 Days (Standard)", value: "30" },
                { label: "45 Days", value: "45" },
                { label: "60 Days", value: "60" },
                { label: "90 Days", value: "90" },
              ]}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Urgent?</span>
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

      {/* Job Role Details */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Briefcase className="w-3.5 h-3.5 text-orange-600" />
          <span>Role Details &amp; Openings</span>
        </span>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={10}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Job Role / Title <span className="text-red-500">*</span>
            </label>
            <Input
              size="middle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-medium"
            />
          </Col>
          <Col xs={12} sm={4}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Vacancies
            </label>
            <Input
              size="middle"
              prefix={<Users className="w-3.5 h-3.5 text-slate-400" />}
              value={openingsCount}
              onChange={(e) => setOpeningsCount(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </Col>
          <Col xs={12} sm={10}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Job Category / Department
            </label>
            <Select
              size="middle"
              value={jobCategory || undefined}
              onChange={(val) => setJobCategory(val || "")}
              options={JOB_CATEGORY_SUGGESTIONS.map((c) => ({ label: c.value, value: c.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Required Experience
            </label>
            <Select
              size="middle"
              value={experienceLevel || undefined}
              onChange={(val) => setExperienceLevel(val || "")}
              options={EXPERIENCE_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Min Education
            </label>
            <Select
              size="middle"
              value={qualification || undefined}
              onChange={(val) => setQualification(val || "")}
              options={QUALIFICATION_SUGGESTIONS.map((q) => ({ label: q.value, value: q.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Notice Period Accepted
            </label>
            <Select
              size="middle"
              value={noticePeriod || undefined}
              onChange={(val) => setNoticePeriod(val || "")}
              options={NOTICE_PERIOD_SUGGESTIONS.map((n) => ({ label: n.value, value: n.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>
      </div>
    </div>
  );

  const renderTab2_SalaryTiming = () => (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Salary Compensation */}
      <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-orange-600" />
            <span>Salary Compensation (Monthly &amp; LPA)</span>
          </span>
          {salaryMin && salaryMax && (
            <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">
              ₹{salaryMin} - ₹{salaryMax} LPA
            </span>
          )}
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Min Monthly (₹/mo)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="/mo"
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
              value={salaryMin}
              onChange={(e) => handleLpaMinChange(e.target.value)}
              className="font-bold text-orange-600"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Max Annual (₹ LPA)</label>
            <Input
              size="middle"
              prefix="₹"
              suffix="LPA"
              value={salaryMax}
              onChange={(e) => handleLpaMaxChange(e.target.value)}
              className="font-bold text-orange-600"
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Probation Period</label>
            <Select
              size="middle"
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
              value={referralBonus}
              onChange={(e) => setReferralBonus(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </Col>
        </Row>
      </div>

      {/* Perks & Benefits Tags */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Gift className="w-3.5 h-3.5 text-orange-600" />
          <span>Company Perks &amp; Benefits</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PERK_TAG_SUGGESTIONS.map((perk) => {
            const isActive = perkTags.includes(perk.value);
            return (
              <button
                key={perk.value}
                type="button"
                onClick={() => togglePerk(perk.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {isActive ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-slate-400 font-bold">+</span>}
                <span>{perk.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shift Timing */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Clock className="w-3.5 h-3.5 text-orange-600" />
          <span>Working Schedule &amp; Shift Timing</span>
        </span>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Working Days</label>
            <Select
              size="middle"
              value={workingDays || undefined}
              onChange={(val) => setWorkingDays(val || "")}
              options={WORKING_DAYS_SUGGESTIONS.map((w) => ({ label: w.value, value: w.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={4}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift In Time</label>
            <Select
              size="middle"
              value={shiftInTime || undefined}
              onChange={(val) => updateShiftInTime(val || "")}
              options={SHIFT_IN_TIME_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={4}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift Out Time</label>
            <Select
              size="middle"
              value={shiftOutTime || undefined}
              onChange={(val) => updateShiftOutTime(val || "")}
              options={SHIFT_OUT_TIME_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={10}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Shift Preset / Summary</label>
            <Select
              size="middle"
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

  const renderTab3_CandidateCriteria = () => (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Candidate Criteria */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <UserCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>Candidate Eligibility &amp; Preferences</span>
        </span>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender Preference</label>
            <Select
              size="middle"
              value={genderPreference || undefined}
              allowClear
              onChange={(val) => setGenderPreference(val || "")}
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
              value={englishLevel || undefined}
              onChange={(val) => setEnglishLevel(val || "")}
              options={ENGLISH_SUGGESTIONS.map((e) => ({ label: e.value, value: e.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Age Preference</label>
            <Select
              size="middle"
              value={agePreference || undefined}
              onChange={(val) => setAgePreference(val || "")}
              allowClear
              className="w-full"
              options={[
                { label: "No Age Restriction", value: "No Age Restriction" },
                { label: "18 - 25 Years", value: "18-25" },
                { label: "21 - 30 Years", value: "21-30" },
                { label: "25 - 35 Years", value: "25-35" },
                { label: "30 - 45 Years", value: "30-45" },
                { label: "Below 30 Years", value: "Below 30" },
                { label: "Below 40 Years", value: "Below 40" },
              ]}
            />
          </Col>
          <Col xs={12} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Languages Required</label>
            <Select
              size="middle"
              mode="multiple"
              value={languagesRequired}
              onChange={(val) => setLanguagesRequired(val || [])}
              options={LANGUAGE_SUGGESTIONS.map((l) => ({ label: l.value, value: l.value }))}
              allowClear
              className="w-full"
              maxTagCount={3}
            />
          </Col>
        </Row>
      </div>

      {/* Mandatory Assets / Documents - Custom */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <FileText className="w-3.5 h-3.5 text-orange-600" />
          <span>Mandatory Candidate Assets / Documents</span>
        </span>

        {/* Quick Toggle Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ASSET_SUGGESTIONS.map((asset) => {
            const isSelected = requiredAssets.includes(asset.value);
            return (
              <button
                key={asset.value}
                type="button"
                onClick={() => toggleAsset(asset.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-slate-400 font-bold">+</span>}
                <span>{asset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Asset Input */}
        <div className="flex items-center gap-2">
          <Input
            size="middle"
            value={customAssetInput}
            onChange={(e) => setCustomAssetInput(e.target.value)}
            onPressEnter={addCustomAsset}
            className="flex-1"
            prefix={<Plus className="w-3.5 h-3.5 text-slate-400" />}
          />
          <Button
            size="middle"
            type="primary"
            onClick={addCustomAsset}
            disabled={!customAssetInput.trim()}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        {/* Display Selected Custom Assets */}
        {requiredAssets.filter((a) => !ASSET_SUGGESTIONS.some((s) => s.value === a)).length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {requiredAssets
              .filter((a) => !ASSET_SUGGESTIONS.some((s) => s.value === a))
              .map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {custom}
                  <button
                    type="button"
                    onClick={() => removeAsset(custom)}
                    className="text-blue-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </span>
              ))}
          </div>
        )}

        {/* Summary */}
        {requiredAssets.length > 0 && (
          <div className="mt-2 text-[10px] text-slate-500 font-medium">
            {requiredAssets.length} item{requiredAssets.length > 1 ? "s" : ""} selected
          </div>
        )}
      </div>
    </div>
  );

  const renderTab4_Interview = () => (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Interview Process */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Video className="w-3.5 h-3.5 text-orange-600" />
          <span>Interview Process &amp; Contact</span>
        </span>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Mode</label>
            <Select
              size="middle"
              value={interviewMode || undefined}
              onChange={(val) => setInterviewMode(val || "")}
              options={INTERVIEW_MODE_SUGGESTIONS.map((m) => ({ label: m.value, value: m.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={8}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">HR WhatsApp Number</label>
            <Input
              size="middle"
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
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Venue / Office Address</label>
            <Input
              size="middle"
              prefix={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
              value={interviewAddress}
              onChange={(e) => setInterviewAddress(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Email</label>
            <Input
              size="middle"
              prefix={<MessageSquare className="w-3.5 h-3.5 text-slate-400" />}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </Col>
        </Row>
      </div>

      {/* Interview Schedule Timing */}
      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-600" />
            <span>Interview Schedule Window</span>
          </span>
          <span className="text-[10px] font-semibold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">
            Candidate Time Window
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
          <Col xs={12} sm={3}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">In Time (Start)</label>
            <Select
              size="middle"
              value={interviewStartTime || undefined}
              onChange={updateInterviewStartTime}
              options={INTERVIEW_START_TIME_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={3}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Out Time (End)</label>
            <Select
              size="middle"
              value={interviewEndTime || undefined}
              onChange={updateInterviewEndTime}
              options={INTERVIEW_END_TIME_SUGGESTIONS.map((s) => ({ label: s.value, value: s.value }))}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={6}>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Daily Interview Time Slot</label>
            <Select
              size="middle"
              value={interviewTimeSlot || undefined}
              onChange={handleInterviewSlotPreset}
              options={INTERVIEW_TIME_SLOT_SUGGESTIONS.map((t) => ({ label: t.value, value: t.value }))}
              allowClear
              className="w-full"
            />
          </Col>
        </Row>

        {/* Live Preview Info Banner */}
        <div className="mt-2.5 text-[11px] text-slate-600 p-2 rounded-lg bg-white border border-orange-100 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>
            {interviewStartDate || interviewEndDate || interviewTimeSlot ? (
              <>
                Candidate Notice: Must attend interview between{" "}
                <strong className="text-orange-950 font-bold">{interviewStartDate || "Immediate"}</strong> and{" "}
                <strong className="text-orange-950 font-bold">{interviewEndDate || "Vacancy Active"}</strong> during{" "}
                <strong className="text-orange-950 font-bold">{interviewTimeSlot || "Designated Hours"}</strong>.
              </>
            ) : (
              "Tip: Specify start date, end date, and time slot so candidates clearly know their interview window."
            )}
          </span>
        </div>
      </div>
    </div>
  );

  const renderTab5_Description = () => (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Skills & Description */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <FileCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>Job Description &amp; Details</span>
        </span>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Required Key Skills (Comma separated)
            </label>
            <Input
              size="middle"
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
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="text-xs"
              />
            </Col>
            <Col xs={24} sm={12}>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Perks &amp; Benefits (One per line)
              </label>
              <Input.TextArea
                rows={4}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="text-xs"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Featured & Visibility */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 text-orange-600" />
          <span>Listing Visibility &amp; Highlights</span>
        </span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Featured Listing</span>
            </span>
            <Switch
              size="small"
              checked={featured}
              onChange={(checked) => setFeatured(checked)}
            />
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
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

      {/* Direct Employer Hiring Trust Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/60 border border-orange-200/80 text-xs">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Direct Employer Benefits</span>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero intermediary commission — 100% direct recruiter hiring</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Applicants can contact you directly via HR WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Live tracking in Employer Dashboard</span>
          </div>
        </div>
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
          <span className="hidden sm:inline">Company & Role</span>
          <span className="sm:hidden">Basics</span>
        </span>
      ),
      children: renderTab1_CompanyBasics(),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <IndianRupee className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salary & Timing</span>
          <span className="sm:hidden">Salary</span>
        </span>
      ),
      children: renderTab2_SalaryTiming(),
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Candidate Criteria</span>
          <span className="sm:hidden">Criteria</span>
        </span>
      ),
      children: renderTab3_CandidateCriteria(),
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Interview & Contact</span>
          <span className="sm:hidden">Interview</span>
        </span>
      ),
      children: renderTab4_Interview(),
    },
    {
      key: "5",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <FileCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Description & Perks</span>
          <span className="sm:hidden">Details</span>
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
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              💡 Zero commission • Direct candidate applications to employer WhatsApp &amp; dashboard
            </div>
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              {activeTab !== "1" && (
                <Button
                  size="middle"
                  onClick={() => setActiveTab(String(Number(activeTab) - 1))}
                  className="font-semibold"
                >
                  ← Previous
                </Button>
              )}
              {activeTab !== "5" ? (
                <Button
                  type="primary"
                  size="middle"
                  onClick={() => setActiveTab(String(Number(activeTab) + 1))}
                  className="font-bold shadow-xs"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="middle"
                  icon={<Check className="w-3.5 h-3.5" />}
                  loading={loading}
                  onClick={handleSubmit}
                  className="font-bold shadow-xs active:scale-95"
                >
                  {jobToEdit ? "Update Opening" : "Publish Opening"}
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
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 leading-tight">
                {jobToEdit ? "Edit Job Vacancy" : "Post Direct Job Opening"}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                Direct Corporate Hiring • Zero Commission • Real-time Candidate Connection
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Full Screen Job Posting Studio
          </span>
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
            Candidates can now discover this vacancy and apply directly.
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
      </ConfigProvider>
    </Modal>
  );
}
