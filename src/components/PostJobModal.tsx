"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { ALL_CATALOG_JOB_ROLES } from "@/data/businessCatalog";
import {
  Modal,
  Input,
  Select,
  Button,
  Upload,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Tooltip,
  Switch,
  AutoComplete,
  Tag,
  Divider,
} from "antd";
import {
  Building2,
  MapPin,
  Check,
  Briefcase,
  Zap,
  User,
  X,
  Upload as UploadIcon,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  FileCheck,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { compressImageToWebP } from "@/lib/image-compressor";
import { monthlyToLpa, lpaToMonthly } from "@/lib/utils";

const { Text, Title } = Typography;

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  onOpenEmployerAuth?: () => void;
  jobToEdit?: any | null; // Supports editing existing jobs!
}

export function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
  onOpenEmployerAuth,
  jobToEdit,
}: PostJobModalProps) {
  const { user, updateUser, loginAsDemo } = useAuth();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "Manpower Master");
  const [companyLogo, setCompanyLogo] = useState(
    user?.companyLogo || "/company-profile.jpeg"
  );
  const [location, setLocation] = useState("Jalandhar, Punjab");
  const [workplaceType, setWorkplaceType] = useState<"Remote" | "On-site" | "Hybrid">("On-site");
  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive">("Mid-Level");
  const [jobType, setJobType] = useState<"Full-time" | "Part-time" | "Contract" | "Internship">("Full-time");

  // Monthly Salary and LPA Dual Auto-Calculation
  const [salaryMonthlyMin, setSalaryMonthlyMin] = useState("25000");
  const [salaryMonthlyMax, setSalaryMonthlyMax] = useState("40000");
  const [salaryMin, setSalaryMin] = useState("3.0");
  const [salaryMax, setSalaryMax] = useState("4.8");

  // Extra Critical Job Details
  const [openingsCount, setOpeningsCount] = useState("2");
  const [expiryDays, setExpiryDays] = useState("30");
  const [qualification, setQualification] = useState("Any Graduate");
  const [shiftTiming, setShiftTiming] = useState("Day Shift");
  const [workingDays, setWorkingDays] = useState("6 Days (Mon-Sat)");
  const [genderPreference, setGenderPreference] = useState("Any");
  const [englishLevel, setEnglishLevel] = useState("Basic English");
  const [requiredAssets, setRequiredAssets] = useState<string[]>(["Aadhaar & PAN"]);
  const [interviewMode, setInterviewMode] = useState<"Walk-in" | "Telephonic" | "Online (Google Meet / Zoom)">("Telephonic");
  const [interviewAddress, setInterviewAddress] = useState("");
  const [recruiterWhatsApp, setRecruiterWhatsApp] = useState(user?.phone || "9872620706");
  const [urgentHiring, setUrgentHiring] = useState(true);

  const [skills, setSkills] = useState("Tally, MS Office, Accounts, GST, Communication");
  const [description, setDescription] = useState(
    "We are seeking a dedicated professional to handle key day-to-day corporate operations, accounts and client correspondence. High growth environment with direct leadership mentoring."
  );
  const [requirements, setRequirements] = useState(
    "1+ years relevant industry experience\nBasic computer literacy and MS Office / Tally knowledge\nGood communication and punctual work ethic"
  );
  const [benefits, setBenefits] = useState(
    "Timely Monthly Salary on 1st\nPerformance Incentives & Bonus\nESI & PF Coverage\nPaid Festival Holidays"
  );
  const [featured, setFeatured] = useState(true);

  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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

  // Multi-Branch Integration for Employer
  const userBranches = user?.employerDetails?.branches || [];
  const [selectedBranchId, setSelectedBranchId] = useState<string>("custom");

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (branchId === "custom") return;
    const branch = userBranches.find((b: any) => b.id === branchId);
    if (branch) {
      const locStr = branch.state ? `${branch.city}, ${branch.state}` : branch.city;
      setLocation(locStr);
    }
  };

  // Salary Handlers (Monthly <-> LPA Synchronization)
  const handleMonthlyMinChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setSalaryMonthlyMin(clean);
    if (clean && Number(clean) > 0) {
      const lpa = monthlyToLpa(Number(clean));
      setSalaryMin(String(lpa));
    }
  };

  const handleMonthlyMaxChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setSalaryMonthlyMax(clean);
    if (clean && Number(clean) > 0) {
      const lpa = monthlyToLpa(Number(clean));
      setSalaryMax(String(lpa));
    }
  };

  const handleLpaMinChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setSalaryMin(clean);
    if (clean && Number(clean) > 0) {
      const mo = lpaToMonthly(Number(clean));
      setSalaryMonthlyMin(String(mo));
    }
  };

  const handleLpaMaxChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setSalaryMax(clean);
    if (clean && Number(clean) > 0) {
      const mo = lpaToMonthly(Number(clean));
      setSalaryMonthlyMax(String(mo));
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchCities("");
      if (jobToEdit) {
        // Pre-fill for Edit mode
        setTitle(jobToEdit.title || "");
        setCompany(jobToEdit.company || "");
        setCompanyLogo(jobToEdit.companyLogo || "/company-profile.jpeg");
        setLocation(jobToEdit.location || "Jalandhar, Punjab");
        setWorkplaceType(jobToEdit.workplaceType || "On-site");
        setExperienceLevel(jobToEdit.experienceLevel || "Mid-Level");
        setJobType(jobToEdit.jobType || "Full-time");
        setSalaryMin(String(jobToEdit.salaryMin || "3.0"));
        setSalaryMax(String(jobToEdit.salaryMax || "4.8"));
        setSalaryMonthlyMin(String(jobToEdit.salaryMonthlyMin || lpaToMonthly(jobToEdit.salaryMin) || "25000"));
        setSalaryMonthlyMax(String(jobToEdit.salaryMonthlyMax || lpaToMonthly(jobToEdit.salaryMax) || "40000"));
        setOpeningsCount(String(jobToEdit.openingsCount || 2));
        setExpiryDays(String(jobToEdit.expiryDays || 30));
        setQualification(jobToEdit.qualification || "Any Graduate");
        setShiftTiming(jobToEdit.shiftTiming || "Day Shift");
        setWorkingDays(jobToEdit.workingDays || "6 Days (Mon-Sat)");
        setGenderPreference(jobToEdit.genderPreference || "Any");
        setEnglishLevel(jobToEdit.englishLevel || "Basic English");
        setRequiredAssets(jobToEdit.requiredAssets || ["Aadhaar & PAN"]);
        setInterviewMode(jobToEdit.interviewMode || "Telephonic");
        setInterviewAddress(jobToEdit.interviewAddress || "");
        setRecruiterWhatsApp(jobToEdit.recruiterWhatsApp || user?.phone || "9872620706");
        setUrgentHiring(jobToEdit.urgentHiring ?? true);
        setSkills(Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(", ") : jobToEdit.skills || "");
        setDescription(jobToEdit.description || "");
        setRequirements(Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join("\n") : jobToEdit.requirements || "");
        setBenefits(Array.isArray(jobToEdit.benefits) ? jobToEdit.benefits.join("\n") : jobToEdit.benefits || "");
        setFeatured(Boolean(jobToEdit.featured));
      } else {
        // Reset or use employer defaults
        if (user?.companyName) setCompany(user.companyName);
        if (user?.companyLogo) setCompanyLogo(user.companyLogo);
        if (user?.phone) setRecruiterWhatsApp(user.phone);
        if (userBranches.length > 0 && selectedBranchId === "custom") {
          const firstBranch = userBranches[0];
          setSelectedBranchId(firstBranch.id);
          const locStr = firstBranch.state ? `${firstBranch.city}, ${firstBranch.state}` : firstBranch.city;
          setLocation(locStr);
        }
      }
    }
  }, [isOpen, user, jobToEdit]);

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const compressed = await compressImageToWebP(file, 400, 0.85);
      const formData = new FormData();
      formData.append("file", compressed.file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setCompanyLogo(data.url);
      }
    } catch {
      // ignore
    } finally {
      setUploadingLogo(false);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in or register as an employer to publish an opening.");
      return;
    }

    if (!title.trim() || !company.trim()) {
      setError("Job Title and Company Name are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        company,
        companyLogo,
        location,
        branchId: selectedBranchId !== "custom" ? selectedBranchId : undefined,
        branchName:
          selectedBranchId !== "custom"
            ? userBranches.find((b: any) => b.id === selectedBranchId)?.branchName
            : undefined,
        workplaceType,
        experienceLevel,
        jobType,
        salaryMin: Number(salaryMin) || monthlyToLpa(Number(salaryMonthlyMin)),
        salaryMax: Number(salaryMax) || monthlyToLpa(Number(salaryMonthlyMax)),
        salaryMonthlyMin: Number(salaryMonthlyMin) || lpaToMonthly(Number(salaryMin)),
        salaryMonthlyMax: Number(salaryMonthlyMax) || lpaToMonthly(Number(salaryMax)),
        salaryCurrency: "INR",
        openingsCount: Number(openingsCount) || 1,
        expiryDays: Number(expiryDays) || 30,
        qualification,
        shiftTiming,
        workingDays,
        genderPreference,
        englishLevel,
        requiredAssets,
        interviewMode,
        interviewAddress,
        recruiterWhatsApp,
        urgentHiring,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description,
        requirements: requirements.split("\n").filter(Boolean),
        benefits: benefits.split("\n").filter(Boolean),
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
        throw new Error(data.error || "Failed to save job opening");
      }

      if (user && user.role !== "employer") {
        updateUser({ role: "employer" });
      }

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ea580c", "#fb923c", "#16a34a"],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onJobCreated();
        onClose();
      }, 1000);
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12 }}>
            <Button onClick={onClose} icon={<X className="w-3.5 h-3.5" />}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<Check className="w-3.5 h-3.5" />}
              loading={loading}
              onClick={handleSubmit}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              {jobToEdit ? "Save Job Changes" : "Publish Job Opening"}
            </Button>
          </div>
        )
      }
      width={760}
      centered
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#ea580c",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {jobToEdit ? "Edit Job Vacancy" : "Post a Direct Corporate Job Vacancy"}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>
              Zero Commission • Direct Candidate Applications • Instant WhatsApp Connect
            </div>
          </div>
        </div>
      }
    >
      {/* Guest Warning */}
      {!user && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
          message="Post job with 1-Click Recruiter Demo or Sign in"
          description={
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  loginAsDemo("employer");
                }}
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
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {success ? (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
              color: "#16a34a",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Check className="w-8 h-8" />
          </div>
          <Title level={4} style={{ margin: "0 0 6px 0", color: "#0f172a" }}>
            {jobToEdit ? "Job Updated Successfully!" : "Job Published Live!"}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Candidates can now discover this opening and apply directly.
          </Text>
        </div>
      ) : (
        <div style={{ maxHeight: "68vh", overflowY: "auto", paddingRight: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Row 1: Role Title & Openings */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={16}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Job Role / Title <span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={ALL_CATALOG_JOB_ROLES.map((r) => ({ value: r }))}
                  filterOption={(inputValue, option) =>
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  placeholder="e.g. Senior Accountant / Tally Operator / Sales Exec"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={12} sm={4}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Vacancies / Openings
                </label>
                <Input
                  prefix={<Users className="w-3.5 h-3.5 text-slate-400" />}
                  value={openingsCount}
                  onChange={(e) => setOpeningsCount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="2"
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
              <Col xs={12} sm={4}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Urgent Hiring?
                </label>
                <div style={{ marginTop: 8 }}>
                  <Switch
                    checked={urgentHiring}
                    onChange={(checked) => setUrgentHiring(checked)}
                    checkedChildren="Urgent"
                    unCheckedChildren="Normal"
                  />
                </div>
              </Col>
            </Row>

            {/* Row 2: Company Name, Logo & Branch */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Hiring Company / Brand <span className="text-red-500">*</span>
                </label>
                <Input
                  prefix={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Verma Enterprises / ABC Technologies"
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>

              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Company Logo
                </label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <Input
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    placeholder="https://... or upload"
                    style={{ borderRadius: 8, flex: 1 }}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleLogoUpload}
                    accept="image/*"
                  >
                    <Button
                      loading={uploadingLogo}
                      icon={<UploadIcon className="w-3.5 h-3.5" />}
                      style={{ borderRadius: 8 }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </div>
              </Col>
            </Row>

            {/* Row 3: Location & Workplace Type */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={14}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Work Location (City, State) <span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  value={location}
                  onChange={(val) => setLocation(val)}
                  onSearch={fetchCities}
                  options={cityOptions}
                  placeholder="e.g. Jalandhar, Punjab / Ludhiana / Chandigarh"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={5}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Workplace</label>
                <Select
                  value={workplaceType}
                  onChange={(val) => setWorkplaceType(val)}
                  options={[
                    { label: "On-site", value: "On-site" },
                    { label: "Hybrid", value: "Hybrid" },
                    { label: "Remote (WFH)", value: "Remote" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={5}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Job Type</label>
                <Select
                  value={jobType}
                  onChange={(val) => setJobType(val)}
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Part-time", value: "Part-time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Internship", value: "Internship" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
            </Row>

            {/* 🌟 SALARY SECTION: Monthly Input + Auto LPA Calculator */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Salary Compensation (Monthly Wise &amp; Auto LPA)
                  </span>
                </div>
                <Tag color="orange" className="m-0 font-bold text-[11px] rounded-md">
                  Auto-Calculates LPA
                </Tag>
              </div>

              <Row gutter={[12, 10]}>
                {/* Monthly Min */}
                <Col xs={12} sm={6}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Min Monthly (₹/month)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="/mo"
                    value={salaryMonthlyMin}
                    onChange={(e) => handleMonthlyMinChange(e.target.value)}
                    placeholder="25000"
                    style={{ marginTop: 2, borderRadius: 8, fontWeight: 600 }}
                  />
                </Col>

                {/* Monthly Max */}
                <Col xs={12} sm={6}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Max Monthly (₹/month)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="/mo"
                    value={salaryMonthlyMax}
                    onChange={(e) => handleMonthlyMaxChange(e.target.value)}
                    placeholder="40000"
                    style={{ marginTop: 2, borderRadius: 8, fontWeight: 600 }}
                  />
                </Col>

                {/* Calculated LPA Min */}
                <Col xs={12} sm={6}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Min Package (₹ LPA)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="LPA"
                    value={salaryMin}
                    onChange={(e) => handleLpaMinChange(e.target.value)}
                    placeholder="3.0"
                    style={{ marginTop: 2, borderRadius: 8, fontWeight: 700, color: "#ea580c" }}
                  />
                </Col>

                {/* Calculated LPA Max */}
                <Col xs={12} sm={6}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Max Package (₹ LPA)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="LPA"
                    value={salaryMax}
                    onChange={(e) => handleLpaMaxChange(e.target.value)}
                    placeholder="4.8"
                    style={{ marginTop: 2, borderRadius: 8, fontWeight: 700, color: "#ea580c" }}
                  />
                </Col>
              </Row>

              <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-1">
                <span>
                  💡 <strong>Formula:</strong> ₹{Number(salaryMonthlyMin || 0).toLocaleString("en-IN")}/mo × 12 ={" "}
                  <strong className="text-orange-700">₹{salaryMin || "0"} LPA</strong>
                </span>
                <span className="text-emerald-700 font-bold">
                  Shows: ₹{Number(salaryMonthlyMin || 0).toLocaleString("en-IN")} - ₹{Number(salaryMonthlyMax || 0).toLocaleString("en-IN")}/month ({salaryMin} - {salaryMax} LPA)
                </span>
              </div>
            </div>

            {/* Row 4: Job Expiry Validity & Experience Level */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Job Active Validity (Auto-Expires After)
                  </label>
                  <span className="text-[11px] font-bold text-orange-600">
                    Auto-Closes Expired Jobs
                  </span>
                </div>
                <Select
                  value={expiryDays}
                  onChange={(val) => setExpiryDays(val)}
                  options={[
                    { label: "7 Days (Urgent / Immediate Walk-in)", value: "7" },
                    { label: "15 Days (Short Window Hiring)", value: "15" },
                    { label: "30 Days (Standard 1 Month)", value: "30" },
                    { label: "45 Days (Extended Hiring)", value: "45" },
                    { label: "60 Days (2 Months)", value: "60" },
                    { label: "90 Days (Quarterly Continuous Hiring)", value: "90" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Experience Level Required
                </label>
                <Select
                  value={experienceLevel}
                  onChange={(val) => setExperienceLevel(val)}
                  options={[
                    { label: "Fresher (0 Years)", value: "Fresher" },
                    { label: "Mid-Level (1-3 Yrs)", value: "Mid-Level" },
                    { label: "Senior (3-6 Yrs)", value: "Senior" },
                    { label: "Lead (6-10 Yrs)", value: "Lead" },
                    { label: "Executive (10+ Yrs)", value: "Executive" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
            </Row>

            {/* Row 5: Qualification, Shift & Working Days */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Minimum Education Required
                </label>
                <Select
                  value={qualification}
                  onChange={(val) => setQualification(val)}
                  options={[
                    { label: "10th Pass / High School", value: "10th Pass" },
                    { label: "12th Pass / Intermediate", value: "12th Pass" },
                    { label: "Diploma / ITI", value: "Diploma / ITI" },
                    { label: "Any Graduate (BA, B.Com, B.Sc)", value: "Any Graduate" },
                    { label: "Technical Graduate (B.Tech, BCA, MCA)", value: "B.Tech / BCA / MCA" },
                    { label: "Post Graduate / MBA", value: "MBA / Post Graduate" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Shift Timing</label>
                <Select
                  value={shiftTiming}
                  onChange={(val) => setShiftTiming(val)}
                  options={[
                    { label: "Day Shift (9 AM - 6 PM)", value: "Day Shift" },
                    { label: "Night Shift (8 PM - 5 AM)", value: "Night Shift" },
                    { label: "Rotational Shift", value: "Rotational Shift" },
                    { label: "US / UK Shift", value: "US / UK Shift" },
                    { label: "Flexible Working Hours", value: "Flexible Hours" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Working Days</label>
                <Select
                  value={workingDays}
                  onChange={(val) => setWorkingDays(val)}
                  options={[
                    { label: "5 Days (Mon - Fri)", value: "5 Days (Mon-Fri)" },
                    { label: "6 Days (Mon - Sat)", value: "6 Days (Mon-Sat)" },
                    { label: "Alternate Saturdays Off", value: "Alternate Saturdays Off" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
            </Row>

            {/* Row 6: Gender Preference & English Level */}
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Gender Preference
                </label>
                <Select
                  value={genderPreference}
                  onChange={(val) => setGenderPreference(val)}
                  options={[
                    { label: "Any (No Preference)", value: "Any" },
                    { label: "Male Only", value: "Male" },
                    { label: "Female Only", value: "Female" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  English Requirement
                </label>
                <Select
                  value={englishLevel}
                  onChange={(val) => setEnglishLevel(val)}
                  options={[
                    { label: "No English Required", value: "No English Required" },
                    { label: "Basic / Conversational", value: "Basic English" },
                    { label: "Good / Fluent English", value: "Fluent English" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Candidate Mandatory Assets / Documents
                </label>
                <Select
                  mode="multiple"
                  value={requiredAssets}
                  onChange={(val) => setRequiredAssets(val)}
                  options={[
                    { label: "Two Wheeler & DL", value: "Two Wheeler & DL" },
                    { label: "Smartphone", value: "Smartphone" },
                    { label: "Laptop / Computer", value: "Laptop" },
                    { label: "Aadhaar & PAN", value: "Aadhaar & PAN" },
                    { label: "Bank Account Passbook", value: "Bank Passbook" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
            </Row>

            {/* Row 7: Interview Details & WhatsApp */}
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Interview Mode
                </label>
                <Select
                  value={interviewMode}
                  onChange={(val: any) => setInterviewMode(val)}
                  options={[
                    { label: "Telephonic Interview", value: "Telephonic" },
                    { label: "Direct Walk-in", value: "Walk-in" },
                    { label: "Online (Google Meet)", value: "Online (Google Meet / Zoom)" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>

              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Recruiter WhatsApp Number
                </label>
                <Input
                  prefix={<PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
                  value={recruiterWhatsApp}
                  onChange={(e) => setRecruiterWhatsApp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9872620706"
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>

              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Interview Venue / Address (for Walk-In)
                </label>
                <Input
                  value={interviewAddress}
                  onChange={(e) => setInterviewAddress(e.target.value)}
                  placeholder="e.g. Office #4, Ground Floor, Model Town, Jalandhar"
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>

            {/* Skills & Description */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Mandatory Key Skills (Comma separated)
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Tally, GST, MS Excel, Billing, Client Communication"
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Job Description</label>
              <Input.TextArea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed job roles and daily responsibilities..."
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Key Requirements (One per line)
                </label>
                <Input.TextArea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Specific requirements..."
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Benefits &amp; Perks (One per line)
                </label>
                <Input.TextArea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="ESI, PF, Bonuses, Free Tea/Coffee..."
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>
          </div>
        </div>
      )}
    </Modal>
  );
}
