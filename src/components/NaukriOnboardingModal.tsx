"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import {
  Modal,
  Steps,
  Radio,
  Input,
  Select,
  Tag,
  Button,
  Upload,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Alert,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

interface NaukriOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const POPULAR_SKILLS = [
  "React.js",
  "Node.js",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Python",
  "Java",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Git",
  "Tally Prime",
  "GST Filing",
  "Accounting",
  "Financial Analysis",
  "B2B Sales",
  "Business Development",
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Customer Support",
  "Human Resources",
  "Talent Acquisition",
  "Graphic Design",
  "UI/UX Design",
  "Data Entry",
  "Office Administration",
];

const POPULAR_LOCATIONS = [
  "Bengaluru",
  "Delhi / NCR",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Chandigarh",
  "Jaipur",
  "Noida",
  "Gurugram",
  "Remote",
];

const POPULAR_DEGREES = [
  "B.Tech / B.E. (Computer Science)",
  "B.Tech / B.E. (Information Technology)",
  "B.Tech / B.E. (Mechanical)",
  "B.Tech / B.E. (Civil)",
  "B.Tech / B.E. (Electrical)",
  "B.Com / B.Com (Hons)",
  "BBA / BBM",
  "BCA",
  "B.Sc (IT / Computer Science)",
  "B.Sc (General)",
  "BA",
  "MBA / PGDM (Finance)",
  "MBA / PGDM (Marketing)",
  "MBA / PGDM (HR)",
  "MCA",
  "M.Tech",
  "M.Com",
  "Diploma / Polytechnic",
  "12th Pass",
  "Other Graduate",
];

const PASSING_YEARS = Array.from({ length: 2030 - 1985 + 1 }, (_, i) => String(2030 - i));

export function NaukriOnboardingModal({
  isOpen,
  onClose,
  onCompleted,
}: NaukriOnboardingModalProps) {
  const { user, updateUser, login } = useAuth();

  // Selected primary role: seeker (employee) or employer
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  // If seeker: fresher or experienced
  const [workStatus, setWorkStatus] = useState<"fresher" | "experienced">("fresher");

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Common Profile Fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.location || "");

  // Seeker - Fresher / Experienced Shared Fields
  const [highestDegree, setHighestDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [college, setCollege] = useState("");
  const [passingYear, setPassingYear] = useState("2024");
  const [courseType, setCourseType] = useState("Full Time");
  const [cgpaOrPercent, setCgpaOrPercent] = useState("");

  // Experienced Specific Fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [totalExpYears, setTotalExpYears] = useState("2");
  const [totalExpMonths, setTotalExpMonths] = useState("0");
  const [currentCtc, setCurrentCtc] = useState("12");
  const [noticePeriod, setNoticePeriod] = useState("30 Days");

  // Skills & Preferences
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React.js",
    "JavaScript",
    "Node.js",
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>(["Bengaluru", "Remote"]);
  const [expectedCtc, setExpectedCtc] = useState("18");
  const [headline, setHeadline] = useState("");

  // Resume Upload
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Employer Specific Fields
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [companyType, setCompanyType] = useState("Corporate");
  const [industry, setIndustry] = useState("IT & Software Services");
  const [companySize, setCompanySize] = useState("51-200 Employees");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [recruiterDesignation, setRecruiterDesignation] = useState("HR Manager");
  const [hiringRoles, setHiringRoles] = useState<string[]>([
    "Frontend Developer",
    "Backend Developer",
  ]);
  const [customHiringRole, setCustomHiringRole] = useState("");

  // Submission & Loading state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dynamic API Datasets for Location, Industry, and Company Type
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [industryOptions, setIndustryOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);

  const [companyTypeOptions, setCompanyTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCompanyTypes, setLoadingCompanyTypes] = useState(false);

  const searchCities = async (q: string = "") => {
    try {
      setLoadingCities(true);
      const res = await fetch(`/api/locations?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.suggestions) {
        setCityOptions(data.suggestions.map((c: string) => ({ label: c, value: c })));
      }
    } catch {
      // fallback
    } finally {
      setLoadingCities(false);
    }
  };

  const searchIndustries = async (q: string = "") => {
    try {
      setLoadingIndustries(true);
      const res = await fetch(`/api/industries?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setIndustryOptions(
          data.data.map((item: any) => ({
            label: `${item.name} (${item.category})`,
            value: item.name,
          }))
        );
      }
    } catch {
      // fallback
    } finally {
      setLoadingIndustries(false);
    }
  };

  const searchCompanyTypes = async (q: string = "") => {
    try {
      setLoadingCompanyTypes(true);
      const res = await fetch(`/api/company-types?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCompanyTypeOptions(
          data.data.map((item: any) => ({
            label: `${item.shortLabel} — ${item.description}`,
            value: item.shortLabel,
          }))
        );
      }
    } catch {
      // fallback
    } finally {
      setLoadingCompanyTypes(false);
    }
  };

  // Preload initial datasets when modal opens
  useEffect(() => {
    if (isOpen) {
      searchCities("");
      searchIndustries("");
      searchCompanyTypes("");
    }
  }, [isOpen]);

  // Sync initial user details when opening
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.location) setCity(user.location);
      if (user.role) setRole(user.role === "employer" ? "employer" : "seeker");
      if (user.companyName) setCompanyName(user.companyName);
      if (user.resumeUrl) setResumeUrl(user.resumeUrl);
      if (user.resumeFileName) setResumeFileName(user.resumeFileName);
      if (user.headline) setHeadline(user.headline);
      if (user.skills && user.skills.length > 0) setSelectedSkills(user.skills);
    }
  }, [user, isOpen]);

  // Auto-generate resume headline recommendation
  useEffect(() => {
    if (!headline || headline === "") {
      if (role === "seeker") {
        if (workStatus === "fresher") {
          const deg = highestDegree ? highestDegree.split("(")[0].trim() : "Recent Graduate";
          const skl = selectedSkills.slice(0, 3).join(", ");
          setHeadline(
            `${deg} skilled in ${skl || "modern tools"} seeking Entry-Level / Junior Opportunities.`
          );
        } else {
          const des = currentDesignation || "Software Professional";
          const comp = currentCompany ? ` at ${currentCompany}` : "";
          const skl = selectedSkills.slice(0, 3).join(", ");
          setHeadline(
            `${des}${comp} with ${totalExpYears}+ years experience in ${skl || "core technologies"}.`
          );
        }
      }
    }
  }, [role, workStatus, highestDegree, currentDesignation, currentCompany, selectedSkills, totalExpYears, headline]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length < 20) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleAddHiringRole = () => {
    if (customHiringRole.trim() && !hiringRoles.includes(customHiringRole.trim())) {
      setHiringRoles([...hiringRoles, customHiringRole.trim()]);
      setCustomHiringRole("");
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setResumeUrl(data.url);
        setResumeFileName(data.fileName || file.name);
      } else {
        setError(data.error || "Resume upload failed");
      }
    } catch {
      setError("Error uploading resume");
    } finally {
      setUploadingResume(false);
    }
    return false; // prevent AntD default upload
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let profilePayload: any = {
        name,
        email,
        phone,
        location: city,
        role,
        profileCompleted: true,
      };

      if (role === "seeker") {
        const educationRecord = highestDegree
          ? [
              {
                qualification: highestDegree,
                course: specialization || highestDegree,
                institute: college || "University",
                passingYear,
                courseType,
                percentageOrCgpa: cgpaOrPercent,
                degree: highestDegree,
                institution: college || "University",
                year: passingYear,
              },
            ]
          : [];

        const experienceRecord =
          workStatus === "experienced" && currentDesignation
            ? [
                {
                  role: currentDesignation,
                  company: currentCompany || "Current Organization",
                  duration: `${totalExpYears} yrs ${totalExpMonths} mos`,
                  description: `Working as ${currentDesignation} specializing in ${selectedSkills.slice(0, 4).join(", ")}.`,
                  isCurrent: true,
                },
              ]
            : [];

        profilePayload = {
          ...profilePayload,
          workStatus,
          candidateType: workStatus,
          headline:
            headline ||
            (workStatus === "fresher"
              ? `${highestDegree || "Graduate"} seeking entry level roles`
              : `${currentDesignation || "Professional"} with ${totalExpYears} years experience`),
          skills: selectedSkills,
          education: educationRecord,
          experienceHistory: experienceRecord,
          currentCtc: workStatus === "experienced" ? Number(currentCtc) || 0 : 0,
          expectedCtc: Number(expectedCtc) || 0,
          noticePeriod: workStatus === "experienced" ? noticePeriod : "Immediate",
          resumeUrl,
          resumeFileName,
          careerPreferences: {
            desiredRole: desiredRole || currentDesignation || "Software Professional",
            preferredLocations,
            expectedSalary: Number(expectedCtc) || 0,
            desiredJobType: "Permanent",
            desiredEmploymentType: "Full Time",
            preferredShift: "Day Shift",
          },
          personalDetails: {
            hometown: city,
            languages: [
              { language: "English", read: true, write: true, speak: true },
              { language: "Hindi", read: true, write: true, speak: true },
            ],
          },
        };
      } else {
        // Employer payload
        profilePayload = {
          ...profilePayload,
          companyName,
          headline: `${recruiterDesignation} at ${companyName}`,
          employerDetails: {
            companyName,
            companyType,
            industry,
            recruiterDesignation,
            website: companyWebsite,
            gstin,
            companySize,
            officeAddress,
            city,
            hiringRoles,
          },
        };
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          email: user?.email || email,
          profileData: profilePayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUser(data.user || profilePayload);
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ea580c", "#fb923c", "#16a34a", "#2563eb"],
        });

        setTimeout(() => {
          setSubmitting(false);
          if (onCompleted) onCompleted();
          onClose();
        }, 800);
      } else {
        setError(data.error || "Profile could not be saved.");
        setSubmitting(false);
      }
    } catch {
      setError("An unexpected error occurred while saving profile.");
      setSubmitting(false);
    }
  };

  // Steps definition for Seeker vs Employer
  const seekerStepItems = [
    { title: "Account Type" },
    { title: "Basic Info" },
    { title: workStatus === "experienced" ? "Experience & Edu" : "Education" },
    { title: "Skills & Goals" },
  ];

  const employerStepItems = [
    { title: "Account Type" },
    { title: "Company Info" },
    { title: "Recruiter & Hiring" },
  ];

  const stepItems = role === "seeker" ? seekerStepItems : employerStepItems;
  const maxSteps = stepItems.length;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      maskClosable={false}
      styles={{
        body: { padding: "28px 32px" },
      }}
    >
      {/* Modal Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "#ea580c",
            color: "#ffffff",
            fontSize: 22,
            marginBottom: 8,
          }}
        >
          {role === "seeker" ? <UserOutlined /> : <BankOutlined />}
        </div>
        <Title level={3} style={{ margin: "4px 0 2px 0", color: "#0f172a" }}>
          Complete Your Profile Details
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Naukri 360° Profile setup ensures accurate job recommendations and verified recruiter outreach.
        </Text>
      </div>

      {/* Steps Header */}
      <Steps
        current={currentStep}
        items={stepItems}
        size="small"
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {/* ============================================================== */}
      {/* STEP 0: SELECT ROLE (EMPLOYEE VS EMPLOYER) & FRESHER/EXP      */}
      {/* ============================================================== */}
      {currentStep === 0 && (
        <div>
          <Title level={5} style={{ color: "#334155", marginBottom: 12 }}>
            Tell us who you are:
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div
                onClick={() => setRole("seeker")}
                style={{
                  border: role === "seeker" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                  backgroundColor: role === "seeker" ? "#fff7ed" : "#ffffff",
                  borderRadius: 14,
                  padding: "18px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    color: role === "seeker" ? "#ea580c" : "#64748b",
                    marginBottom: 6,
                  }}
                >
                  <UserOutlined />
                </div>
                <Text strong style={{ fontSize: 15, display: "block", color: "#0f172a" }}>
                  I am a Job Seeker (Employee)
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Looking for internships, fresher jobs, or corporate career opportunities.
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div
                onClick={() => setRole("employer")}
                style={{
                  border: role === "employer" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                  backgroundColor: role === "employer" ? "#fff7ed" : "#ffffff",
                  borderRadius: 14,
                  padding: "18px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    color: role === "employer" ? "#ea580c" : "#64748b",
                    marginBottom: 6,
                  }}
                >
                  <BankOutlined />
                </div>
                <Text strong style={{ fontSize: 15, display: "block", color: "#0f172a" }}>
                  I am a Recruiter / Company (Employer)
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Looking to post job vacancies and hire candidates for our organization.
                </Text>
              </div>
            </Col>
          </Row>

          {/* Sub-Selection for Seekers: Fresher vs Experienced */}
          {role === "seeker" && (
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px dashed #e2e8f0" }}>
              <Title level={5} style={{ color: "#334155", marginBottom: 12 }}>
                What is your current work status?
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div
                    onClick={() => setWorkStatus("fresher")}
                    style={{
                      border: workStatus === "fresher" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                      backgroundColor: workStatus === "fresher" ? "#fff7ed" : "#ffffff",
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <BookOutlined style={{ fontSize: 22, color: workStatus === "fresher" ? "#ea580c" : "#64748b" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                        I am a Fresher
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Student or recently graduated with 0 years experience
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div
                    onClick={() => setWorkStatus("experienced")}
                    style={{
                      border: workStatus === "experienced" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                      backgroundColor: workStatus === "experienced" ? "#fff7ed" : "#ffffff",
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <SolutionOutlined style={{ fontSize: 22, color: workStatus === "experienced" ? "#ea580c" : "#64748b" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                        I am Experienced
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Have worked previously or currently working in a company
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 1: BASIC INFO                                      */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Full Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Mobile Number <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Email Address <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Current City <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Select
                showSearch
                size="large"
                placeholder="Search or type your city across India..."
                value={city || undefined}
                onChange={(val) => setCity(val)}
                onSearch={searchCities}
                filterOption={false}
                loading={loadingCities}
                options={cityOptions}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 2: EDUCATION (FRESHER) / EXP & EDU (EXPERIENCED)   */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {workStatus === "experienced" && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
                Current / Most Recent Employment Details
              </Text>

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Designation / Role
                  </label>
                  <Input
                    placeholder="e.g. Senior Frontend Developer"
                    value={currentDesignation}
                    onChange={(e) => setCurrentDesignation(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Company Name
                  </label>
                  <Input
                    placeholder="e.g. Infosys, Wipro, Startup Ltd"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </Col>
              </Row>

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Total Experience (Years)
                  </label>
                  <Select
                    value={totalExpYears}
                    onChange={(val) => setTotalExpYears(val)}
                    options={Array.from({ length: 30 }, (_, i) => ({
                      label: `${i} Years`,
                      value: String(i),
                    }))}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Annual CTC (₹ LPA)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="LPA"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Notice Period
                  </label>
                  <Select
                    value={noticePeriod}
                    onChange={(val) => setNoticePeriod(val)}
                    options={[
                      { label: "Immediate Joiner", value: "Immediate" },
                      { label: "15 Days or less", value: "15 Days" },
                      { label: "1 Month (30 Days)", value: "30 Days" },
                      { label: "2 Months (60 Days)", value: "60 Days" },
                      { label: "3 Months (90 Days)", value: "90 Days" },
                    ]}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </Col>
              </Row>
            </div>
          )}

          {/* Education Block */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
              Highest Educational Qualification
            </Text>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Degree / Qualification
                </label>
                <Select
                  showSearch
                  placeholder="Select Degree"
                  value={highestDegree || undefined}
                  onChange={(val) => setHighestDegree(val)}
                  options={POPULAR_DEGREES.map((d) => ({ label: d, value: d }))}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  College / Institute Name
                </label>
                <Input
                  placeholder="e.g. Delhi University / IIT / NIT"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Passing Year
                </label>
                <Select
                  value={passingYear}
                  onChange={(val) => setPassingYear(val)}
                  options={PASSING_YEARS.map((yr) => ({ label: yr, value: yr }))}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Course Type
                </label>
                <Select
                  value={courseType}
                  onChange={(val) => setCourseType(val)}
                  options={[
                    { label: "Full Time", value: "Full Time" },
                    { label: "Part Time", value: "Part Time" },
                    { label: "Correspondence / Distance", value: "Distance" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Grading (% or CGPA)
                </label>
                <Input
                  placeholder="e.g. 8.5 CGPA or 78%"
                  value={cgpaOrPercent}
                  onChange={(e) => setCgpaOrPercent(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 3: SKILLS, SALARY, RESUME & PREFERENCES             */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Skills Picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
              Key Skills (Select or add skills for recruiter keyword matching)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 110, overflowY: "auto", marginBottom: 8 }}>
              {POPULAR_SKILLS.map((skl) => {
                const isSelected = selectedSkills.includes(skl);
                return (
                  <Tag.CheckableTag
                    key={skl}
                    checked={isSelected}
                    onChange={() => toggleSkill(skl)}
                    style={{
                      borderRadius: 16,
                      padding: "3px 10px",
                      fontSize: 11,
                      border: isSelected ? "1px solid #ea580c" : "1px solid #e2e8f0",
                    }}
                  >
                    {skl}
                  </Tag.CheckableTag>
                );
              })}
            </div>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                size="small"
                placeholder="Add other skill (e.g. Tailwind, Redux, Spring Boot)"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onPressEnter={handleAddCustomSkill}
              />
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCustomSkill}
                style={{ fontWeight: 600 }}
              >
                Add Skill
              </Button>
            </Space.Compact>
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Target / Desired Job Role
              </label>
              <Input
                placeholder="e.g. Full Stack Engineer, Accountant"
                value={desiredRole}
                onChange={(e) => setDesiredRole(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Expected Annual CTC (₹ LPA)
              </label>
              <Input
                prefix="₹"
                suffix="LPA"
                value={expectedCtc}
                onChange={(e) => setExpectedCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Resume Upload Box */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px dashed #cbd5e1",
              textAlign: "center",
            }}
          >
            <Upload
              beforeUpload={handleResumeUpload}
              showUploadList={false}
              accept=".pdf,.doc,.docx"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingResume}
                style={{ borderRadius: 8 }}
              >
                {resumeFileName ? "Replace Resume Document" : "Upload Resume (PDF, DOCX)"}
              </Button>
            </Upload>
            {resumeFileName && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                <CheckCircleFilled /> Attached: {resumeFileName}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              DOC, DOCX, PDF | Max size: 5 MB
            </div>
          </div>

          {/* Resume Headline */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
              Naukri Resume Headline
            </label>
            <Input.TextArea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Summary headline shown prominently to corporate recruiters"
              style={{ marginTop: 4, borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 1: COMPANY INFO                                   */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Company / Organization Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<BankOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. Acme Tech Solutions Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Company Type
              </label>
              <Select
                showSearch
                size="large"
                placeholder="Search company type (e.g. MNC, Startup, Pvt Ltd)..."
                value={companyType}
                onChange={(val) => setCompanyType(val)}
                onSearch={searchCompanyTypes}
                filterOption={false}
                loading={loadingCompanyTypes}
                options={companyTypeOptions}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Industry Domain
              </label>
              <Select
                showSearch
                size="large"
                placeholder="Search industry domain (e.g. IT, BFSI, Healthcare)..."
                value={industry}
                onChange={(val) => setIndustry(val)}
                onSearch={searchIndustries}
                filterOption={false}
                loading={loadingIndustries}
                options={industryOptions}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Company Size
              </label>
              <Select
                size="large"
                value={companySize}
                onChange={(val) => setCompanySize(val)}
                options={[
                  { label: "1-10 Employees", value: "1-10 Employees" },
                  { label: "11-50 Employees", value: "11-50 Employees" },
                  { label: "51-200 Employees", value: "51-200 Employees" },
                  { label: "201-500 Employees", value: "201-500 Employees" },
                  { label: "500+ Employees", value: "500+ Employees" },
                ]}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Company Website
              </label>
              <Input
                prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />}
                placeholder="https://example.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Headquarter City
              </label>
              <Select
                showSearch
                size="large"
                placeholder="Search Headquarter City across India..."
                value={city || undefined}
                onChange={(val) => setCity(val)}
                onSearch={searchCities}
                filterOption={false}
                loading={loadingCities}
                options={cityOptions}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
          </Row>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
              Corporate Office Address &amp; GSTIN / CIN (Optional)
            </label>
            <Input
              placeholder="e.g. 5th Floor, Cyber City, Gurugram • GSTIN: 07AAAAA0000A1Z5"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              style={{ marginTop: 4, borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 2: RECRUITER & HIRING NEEDS                      */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Recruiter / Contact Person Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. Priya Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Your Official Designation <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<SolutionOutlined style={{ color: "#94a3b8" }} />}
                placeholder="e.g. Head of Talent Acquisition"
                value={recruiterDesignation}
                onChange={(e) => setRecruiterDesignation(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Official Work Email <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                placeholder="priya@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Contact Mobile Number <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
          </Row>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
              Roles Currently Hiring For (Candidates will be matched with these openings)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {hiringRoles.map((r, i) => (
                <Tag
                  key={i}
                  closable
                  onClose={() => setHiringRoles(hiringRoles.filter((_, idx) => idx !== i))}
                  style={{ borderRadius: 12, padding: "2px 8px", backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}
                >
                  {r}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Add hiring role (e.g. Senior Backend Engineer, Sales Executive)"
                value={customHiringRole}
                onChange={(e) => setCustomHiringRole(e.target.value)}
                onPressEnter={handleAddHiringRole}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddHiringRole}
                style={{ fontWeight: 600 }}
              >
                Add Role
              </Button>
            </Space.Compact>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {currentStep > 0 ? (
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            Previous
          </Button>
        ) : (
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
        )}

        <Space size={10}>
          {currentStep > 0 && (
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>
          )}

          {currentStep < maxSteps - 1 ? (
            <Button
              type="primary"
              size="large"
              style={{ fontWeight: 600, borderRadius: 8 }}
              onClick={() => {
                if (currentStep === 1 && role === "seeker" && (!name || !email)) {
                  setError("Please provide your name and email.");
                  return;
                }
                if (currentStep === 1 && role === "employer" && !companyName) {
                  setError("Please provide your company name.");
                  return;
                }
                setError("");
                setCurrentStep((prev) => prev + 1);
              }}
            >
              <span>Next Step</span>
              <ArrowRightOutlined />
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              loading={submitting}
              icon={<CheckCircleFilled />}
              onClick={handleSubmit}
              style={{ fontWeight: 700, borderRadius: 8 }}
            >
              Complete Profile &amp; Start
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
