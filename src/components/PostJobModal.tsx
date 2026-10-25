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
  AutoComplete,
  Tag,
  Avatar,
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
  { value: "Day Shift (9 AM - 6 PM)" },
  { value: "Day Shift (10 AM - 7 PM)" },
  { value: "Morning Shift (7 AM - 3 PM)" },
  { value: "Evening Shift (2 PM - 10 PM)" },
  { value: "Night Shift (8 PM - 5 AM)" },
  { value: "Rotational Shift" },
  { value: "Flexible Hours" },
];

const WORKING_DAYS_SUGGESTIONS = [
  { value: "6 Days (Mon - Sat)" },
  { value: "5 Days (Mon - Fri)" },
  { value: "Alternate Saturdays Off" },
  { value: "Rotational Off" },
];

const EXPERIENCE_SUGGESTIONS = [
  { value: "Fresher" },
  { value: "0 - 1 Year" },
  { value: "1 - 3 Years" },
  { value: "3 - 5 Years" },
  { value: "5+ Years" },
];

const INTERVIEW_MODE_SUGGESTIONS = [
  { value: "Direct Walk-in Interview" },
  { value: "Telephonic Interview" },
  { value: "Online (Google Meet / Zoom)" },
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

  // Form States (Clean & Empty by default - No dummy data)
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("main");
  const [location, setLocation] = useState("");
  const [workplaceType, setWorkplaceType] = useState<"Remote" | "On-site" | "Hybrid">("On-site");
  const [jobType, setJobType] = useState<"Full-time" | "Part-time" | "Contract" | "Internship">("Full-time");
  const [openingsCount, setOpeningsCount] = useState("");
  const [urgentHiring, setUrgentHiring] = useState(false);

  // Compensation States (Monthly <-> LPA dual sync)
  const [salaryMonthlyMin, setSalaryMonthlyMin] = useState("");
  const [salaryMonthlyMax, setSalaryMonthlyMax] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  // Role Specs (Custom values supported)
  const [experienceLevel, setExperienceLevel] = useState("");
  const [qualification, setQualification] = useState("");
  const [shiftTiming, setShiftTiming] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");

  // Candidate Criteria & Interview
  const [genderPreference, setGenderPreference] = useState("Any");
  const [englishLevel, setEnglishLevel] = useState("");
  const [requiredAssets, setRequiredAssets] = useState<string[]>([]);
  const [interviewMode, setInterviewMode] = useState("");
  const [interviewAddress, setInterviewAddress] = useState("");
  const [recruiterWhatsApp, setRecruiterWhatsApp] = useState("");

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
  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (branchId === "custom") {
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

  // Reset or pre-fill on modal open
  useEffect(() => {
    if (isOpen) {
      fetchCities("");
      setError("");
      setSuccess(false);

      if (jobToEdit) {
        // Pre-fill for Edit mode
        setTitle(jobToEdit.title || "");
        setCompany(jobToEdit.company || employerName);
        setLocation(jobToEdit.location || "");
        setWorkplaceType(jobToEdit.workplaceType || "On-site");
        setExperienceLevel(jobToEdit.experienceLevel || "");
        setJobType(jobToEdit.jobType || "Full-time");
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
        setOpeningsCount(jobToEdit.openingsCount ? String(jobToEdit.openingsCount) : "1");
        setExpiryDays(jobToEdit.expiryDays ? String(jobToEdit.expiryDays) : "30");
        setQualification(jobToEdit.qualification || "");
        setShiftTiming(jobToEdit.shiftTiming || "");
        setWorkingDays(jobToEdit.workingDays || "");
        setGenderPreference(jobToEdit.genderPreference || "Any");
        setEnglishLevel(jobToEdit.englishLevel || "");
        setRequiredAssets(jobToEdit.requiredAssets || []);
        setInterviewMode(jobToEdit.interviewMode || "");
        setInterviewAddress(jobToEdit.interviewAddress || "");
        setRecruiterWhatsApp(jobToEdit.recruiterWhatsApp || user?.phone || "");
        setUrgentHiring(Boolean(jobToEdit.urgentHiring));
        setSkills(Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(", ") : jobToEdit.skills || "");
        setDescription(jobToEdit.description || "");
        setRequirements(Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join("\n") : jobToEdit.requirements || "");
        setBenefits(Array.isArray(jobToEdit.benefits) ? jobToEdit.benefits.join("\n") : jobToEdit.benefits || "");
        setFeatured(Boolean(jobToEdit.featured));
        if (jobToEdit.branchId) setSelectedBranchId(jobToEdit.branchId);
      } else {
        // Clean blank form for fresh posting (No dummy pre-fill)
        setTitle("");
        setCompany(user?.companyName || user?.name || "");
        setLocation(user?.location || "");
        setWorkplaceType("On-site");
        setJobType("Full-time");
        setOpeningsCount("1");
        setUrgentHiring(false);
        setSalaryMonthlyMin("");
        setSalaryMonthlyMax("");
        setSalaryMin("");
        setSalaryMax("");
        setExperienceLevel("");
        setQualification("");
        setShiftTiming("");
        setWorkingDays("");
        setExpiryDays("30");
        setGenderPreference("Any");
        setEnglishLevel("");
        setRequiredAssets([]);
        setInterviewMode("");
        setInterviewAddress("");
        setRecruiterWhatsApp(user?.phone || "");
        setSkills("");
        setDescription("");
        setRequirements("");
        setBenefits("");
        setFeatured(false);

        // Auto select branch if available
        if (userBranches.length > 0) {
          const defaultBranch = userBranches.find((b: any) => b.isHeadquarters) || userBranches[0];
          setSelectedBranchId(defaultBranch.id || defaultBranch.branchName);
          const locStr = defaultBranch.state ? `${defaultBranch.city}, ${defaultBranch.state}` : defaultBranch.city;
          setLocation(locStr);
          if (defaultBranch.address) setInterviewAddress(`${defaultBranch.address}, ${defaultBranch.city}`);
        } else {
          setSelectedBranchId("main");
        }
      }
    }
  }, [isOpen, jobToEdit, user]);

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in or register as an employer to publish a vacancy.");
      return;
    }

    if (!title.trim()) {
      setError("Please specify the Job Role / Title.");
      return;
    }

    const companyToUse = company.trim() || employerName;
    if (!companyToUse) {
      setError("Company Name is required.");
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
        workplaceType,
        experienceLevel: experienceLevel.trim() || "Fresher",
        jobType,
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
        genderPreference,
        englishLevel: englishLevel.trim(),
        requiredAssets,
        interviewMode: interviewMode.trim(),
        interviewAddress: interviewAddress.trim(),
        recruiterWhatsApp: recruiterWhatsApp.trim(),
        urgentHiring,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description: description.trim(),
        requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        benefits: benefits.split("\n").map((b) => b.trim()).filter(Boolean),
        featured,
        postedBy: user._id || user.id || user.email,
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

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        success ? null : (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              💡 Jobs auto-expire after selected validity period
            </div>
            <div className="flex items-center gap-2">
              <Button size="middle" onClick={onClose} icon={<X className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
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
            </div>
          </div>
        )
      }
      width={780}
      centered
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 leading-tight">
              {jobToEdit ? "Edit Job Vacancy" : "Post Direct Job Opening"}
            </div>
            <div className="text-xs text-slate-500 font-normal">
              Zero commission • Direct candidate applications
            </div>
          </div>
        </div>
      }
    >
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
        <div className="max-h-[72vh] overflow-y-auto pr-1 flex flex-col gap-3.5">
          {/* SECTION 1: Employer Identity & Branch Selection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Company &amp; Branch Location</span>
              </span>
              <Tag color="green" className="m-0 text-[10px] font-bold">
                Employer Verified DP
              </Tag>
            </div>

            <Row gutter={[10, 10]} align="middle">
              {/* Employer DP Display (No file input) */}
              <Col xs={24} sm={8}>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                  <Avatar
                    size={38}
                    shape="square"
                    src={employerLogo}
                    className="border border-slate-200 rounded-lg shrink-0"
                  >
                    {employerName.charAt(0)}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {company || employerName}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Company Profile DP</span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Branch Selector (If employer has branches) */}
              {userBranches.length > 0 && (
                <Col xs={24} sm={8}>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Select Branch
                  </label>
                  <Select
                    size="middle"
                    value={selectedBranchId}
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

              {/* Work City / Location (Custom typing supported) */}
              <Col xs={24} sm={userBranches.length > 0 ? 8 : 16}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Work City / State <span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  size="middle"
                  value={location}
                  onChange={(val) => setLocation(val)}
                  onSearch={fetchCities}
                  options={cityOptions}
                  placeholder="Type or select city (e.g. Jalandhar, Punjab)..."
                  className="w-full"
                  prefix={<MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 inline" />}
                />
              </Col>
            </Row>

            {/* Workplace & Job Type row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Workplace
                </span>
                <Select
                  size="middle"
                  value={workplaceType}
                  onChange={(val) => setWorkplaceType(val)}
                  className="w-full"
                  options={[
                    { label: "On-site", value: "On-site" },
                    { label: "Hybrid", value: "Hybrid" },
                    { label: "Remote (WFH)", value: "Remote" },
                  ]}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Job Type
                </span>
                <Select
                  size="middle"
                  value={jobType}
                  onChange={(val) => setJobType(val)}
                  className="w-full"
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Part-time", value: "Part-time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Internship", value: "Internship" },
                  ]}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Listing Expiry
                </span>
                <Select
                  size="middle"
                  value={expiryDays}
                  onChange={(val) => setExpiryDays(val)}
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
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
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

          {/* SECTION 2: Role Details & Openings */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Briefcase className="w-3.5 h-3.5 text-orange-600" />
              <span>Role Specifications &amp; Vacancies</span>
            </span>

            <Row gutter={[10, 10]}>
              {/* Job Title / Role (Custom typing + Catalog AutoComplete) */}
              <Col xs={24} sm={16}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Job Role / Title <span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  size="middle"
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={ALL_CATALOG_JOB_ROLES.map((r) => ({ value: r }))}
                  filterOption={(input, option) =>
                    option!.value.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Select or type custom role (e.g. Accountant, Sales Manager, Cook)..."
                  className="w-full"
                />
              </Col>

              {/* Vacancies / Openings Count */}
              <Col xs={12} sm={4}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Vacancies
                </label>
                <Input
                  size="middle"
                  prefix={<Users className="w-3.5 h-3.5 text-slate-400" />}
                  value={openingsCount}
                  onChange={(e) => setOpeningsCount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 2"
                />
              </Col>

              {/* Experience Level (Custom typing supported) */}
              <Col xs={12} sm={4}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Experience
                </label>
                <AutoComplete
                  size="middle"
                  value={experienceLevel}
                  onChange={(val) => setExperienceLevel(val)}
                  options={EXPERIENCE_SUGGESTIONS}
                  placeholder="e.g. 1-2 Yrs"
                  className="w-full"
                />
              </Col>
            </Row>

            <Row gutter={[10, 10]} className="mt-2.5">
              {/* Minimum Education (Custom typing supported) */}
              <Col xs={24} sm={8}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Min Education
                </label>
                <AutoComplete
                  size="middle"
                  value={qualification}
                  onChange={(val) => setQualification(val)}
                  options={QUALIFICATION_SUGGESTIONS}
                  placeholder="Select or type (e.g. 12th Pass, Graduate)..."
                  className="w-full"
                />
              </Col>

              {/* Shift Timing (Custom typing supported) */}
              <Col xs={12} sm={8}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Shift Timing
                </label>
                <AutoComplete
                  size="middle"
                  value={shiftTiming}
                  onChange={(val) => setShiftTiming(val)}
                  options={SHIFT_SUGGESTIONS}
                  placeholder="Select or type (e.g. Day Shift, 10 AM-7 PM)..."
                  className="w-full"
                />
              </Col>

              {/* Working Days (Custom typing supported) */}
              <Col xs={12} sm={8}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Working Days
                </label>
                <AutoComplete
                  size="middle"
                  value={workingDays}
                  onChange={(val) => setWorkingDays(val)}
                  options={WORKING_DAYS_SUGGESTIONS}
                  placeholder="Select or type (e.g. 6 Days, Mon-Fri)..."
                  className="w-full"
                />
              </Col>
            </Row>
          </div>

          {/* SECTION 3: Salary Compensation (Monthly <-> LPA Realtime Sync) */}
          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Salary Compensation (Monthly ₹/mo &amp; Auto LPA)</span>
              </span>
              {salaryMin && salaryMax && (
                <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                  ₹{salaryMin} - ₹{salaryMax} LPA
                </span>
              )}
            </div>

            <Row gutter={[10, 10]}>
              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Min Monthly (₹/month)
                </label>
                <Input
                  size="middle"
                  prefix="₹"
                  suffix="/mo"
                  value={salaryMonthlyMin}
                  onChange={(e) => handleMonthlyMinChange(e.target.value)}
                  placeholder="e.g. 20000"
                  className="font-semibold"
                />
              </Col>

              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Max Monthly (₹/month)
                </label>
                <Input
                  size="middle"
                  prefix="₹"
                  suffix="/mo"
                  value={salaryMonthlyMax}
                  onChange={(e) => handleMonthlyMaxChange(e.target.value)}
                  placeholder="e.g. 35000"
                  className="font-semibold"
                />
              </Col>

              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Min Annual (₹ LPA)
                </label>
                <Input
                  size="middle"
                  prefix="₹"
                  suffix="LPA"
                  value={salaryMin}
                  onChange={(e) => handleLpaMinChange(e.target.value)}
                  placeholder="e.g. 2.4"
                  className="font-bold text-orange-600"
                />
              </Col>

              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Max Annual (₹ LPA)
                </label>
                <Input
                  size="middle"
                  prefix="₹"
                  suffix="LPA"
                  value={salaryMax}
                  onChange={(e) => handleLpaMaxChange(e.target.value)}
                  placeholder="e.g. 4.2"
                  className="font-bold text-orange-600"
                />
              </Col>
            </Row>
          </div>

          {/* SECTION 4: Candidate Criteria & Interview */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <FileCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Candidate Criteria &amp; Interview Process</span>
            </span>

            <Row gutter={[10, 10]}>
              {/* Gender Preference */}
              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Gender Preference
                </label>
                <Select
                  size="middle"
                  value={genderPreference}
                  onChange={(val) => setGenderPreference(val)}
                  className="w-full"
                  options={[
                    { label: "Any Gender", value: "Any" },
                    { label: "Male Only", value: "Male" },
                    { label: "Female Only", value: "Female" },
                  ]}
                />
              </Col>

              {/* English Level (Custom typing supported) */}
              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  English Requirement
                </label>
                <AutoComplete
                  size="middle"
                  value={englishLevel}
                  onChange={(val) => setEnglishLevel(val)}
                  options={ENGLISH_SUGGESTIONS}
                  placeholder="Select or type..."
                  className="w-full"
                />
              </Col>

              {/* Candidate Mandatory Assets / Docs (mode="tags" allows custom typing!) */}
              <Col xs={24} sm={12}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mandatory Documents / Assets (Select or type custom tag)
                </label>
                <Select
                  size="middle"
                  mode="tags"
                  value={requiredAssets}
                  onChange={(val) => setRequiredAssets(val)}
                  options={ASSET_SUGGESTIONS}
                  placeholder="Select or type any custom asset..."
                  className="w-full"
                />
              </Col>
            </Row>

            <Row gutter={[10, 10]} className="mt-2.5">
              {/* Interview Mode (Custom typing supported) */}
              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Interview Mode
                </label>
                <AutoComplete
                  size="middle"
                  value={interviewMode}
                  onChange={(val) => setInterviewMode(val)}
                  options={INTERVIEW_MODE_SUGGESTIONS}
                  placeholder="Walk-in / Telephonic / Online..."
                  className="w-full"
                />
              </Col>

              {/* Recruiter WhatsApp */}
              <Col xs={12} sm={6}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  HR WhatsApp Number
                </label>
                <Input
                  size="middle"
                  prefix={<PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
                  value={recruiterWhatsApp}
                  onChange={(e) => setRecruiterWhatsApp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 9872620706"
                />
              </Col>

              {/* Walk-in Venue Address */}
              <Col xs={24} sm={12}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Interview Venue / Office Address
                </label>
                <Input
                  size="middle"
                  prefix={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                  value={interviewAddress}
                  onChange={(e) => setInterviewAddress(e.target.value)}
                  placeholder="e.g. Floor 2, Verma Complex, Model Town..."
                />
              </Col>
            </Row>

            {/* Mandatory Key Skills */}
            <div className="mt-2.5">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Required Key Skills (Comma separated)
              </label>
              <Input
                size="middle"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Tally Prime, GST, Billing, Client Communication..."
              />
            </div>

            {/* Job Description */}
            <div className="mt-2.5">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Job Responsibilities &amp; Overview
              </label>
              <Input.TextArea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state key day-to-day responsibilities..."
                className="text-xs"
              />
            </div>

            {/* Requirements & Benefits */}
            <Row gutter={[10, 10]} className="mt-2.5">
              <Col xs={24} sm={12}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Candidate Requirements (One per line)
                </label>
                <Input.TextArea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. 1+ year experience&#10;Good communication..."
                  className="text-xs"
                />
              </Col>

              <Col xs={24} sm={12}>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Perks &amp; Benefits (One per line)
                </label>
                <Input.TextArea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="e.g. PF &amp; ESIC Coverage&#10;Performance Bonus..."
                  className="text-xs"
                />
              </Col>
            </Row>
          </div>
        </div>
      )}
    </Modal>
  );
}
