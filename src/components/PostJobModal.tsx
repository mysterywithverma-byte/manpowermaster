"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { ALL_CATALOG_JOB_ROLES } from "@/data/businessCatalog";
import {
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Upload,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Tooltip,
  Switch,
  Result,
  AutoComplete,
} from "antd";
import {
  Building2,
  MapPin,
  Check,
  Briefcase,
  Plus,
  Zap,
  User,
  X,
  Upload as UploadIcon,
} from "lucide-react";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

const { Text, Title } = Typography;

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  onOpenEmployerAuth?: () => void;
}

export function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
  onOpenEmployerAuth,
}: PostJobModalProps) {
  const { user, updateUser, loginAsDemo } = useAuth();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "Manpower Master");
  const [companyLogo, setCompanyLogo] = useState(
    user?.companyLogo || "/company-profile.jpeg"
  );
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [workplaceType, setWorkplaceType] = useState<"Remote" | "On-site" | "Hybrid">("Hybrid");
  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive">("Senior");
  const [jobType, setJobType] = useState<"Full-time" | "Part-time" | "Contract" | "Internship">("Full-time");
  const [salaryMin, setSalaryMin] = useState("28");
  const [salaryMax, setSalaryMax] = useState("45");
  const [skills, setSkills] = useState("React, Node.js, SQL, AWS, Communication");
  const [description, setDescription] = useState(
    "We are seeking a talented professional to join our growing team. You will lead key technical initiatives and collaborate with cross-functional partners."
  );
  const [requirements, setRequirements] = useState(
    "3+ years relevant experience in your domain\nStrong communication and problem-solving skills\nTrack record of high ownership and delivery"
  );
  const [benefits, setBenefits] = useState(
    "Comprehensive Health Insurance\nAnnual Performance Bonus & ESOPs\nHome Office & Learning Allowance"
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

  React.useEffect(() => {
    if (isOpen) {
      fetchCities("");
      if (user?.companyName) setCompany(user.companyName);
      if (user?.companyLogo) setCompanyLogo(user.companyLogo);
      if (userBranches.length > 0 && selectedBranchId === "custom") {
        const firstBranch = userBranches[0];
        setSelectedBranchId(firstBranch.id);
        const locStr = firstBranch.state ? `${firstBranch.city}, ${firstBranch.state}` : firstBranch.city;
        setLocation(locStr);
      }
    }
  }, [isOpen, user]);

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
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          salaryCurrency: "INR",
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          description,
          requirements: requirements.split("\n").filter(Boolean),
          benefits: benefits.split("\n").filter(Boolean),
          featured,
          postedBy: user._id || user.id || user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish job");
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
      }, 1200);
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
              Publish Job Opening
            </Button>
          </div>
        )
      }
      width={700}
      centered
      styles={{ body: { padding: "20px 24px" } }}
    >
      {success ? (
        <Result
          status="success"
          title="Job Vacancy Published Successfully!"
          subTitle="Your opening is now live across candidate search feeds."
        />
      ) : (
        <div>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
              Post a New Job Opening
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Target verified candidates across India with structured job requirements.
            </Text>
          </div>

          {!user && (
            <Alert
              type="warning"
              showIcon
              message="Employer Account Required"
              description={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Sign in as an employer to publish this opening.</span>
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        if (onOpenEmployerAuth) onOpenEmployerAuth();
                        onClose();
                      }}
                    >
                      Sign In
                    </Button>
                    <Button size="small" onClick={() => loginAsDemo("employer")}>
                      Demo Employer
                    </Button>
                  </Space>
                </div>
              }
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
          )}

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 14, borderRadius: 8 }} />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Job Title / Role * (Select or type custom)
                </label>
                <AutoComplete
                  options={ALL_CATALOG_JOB_ROLES.map((role) => ({ label: role, value: role }))}
                  filterOption={(inputValue, option) =>
                    (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                  }
                  value={title}
                  onChange={(val) => setTitle(val)}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <Input
                    prefix={<Briefcase className="w-3.5 h-3.5 text-slate-400" />}
                    style={{ borderRadius: 8 }}
                  />
                </AutoComplete>
              </Col>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Company Name *</label>
                <Input
                  prefix={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>

            {/* Branch / Office Selection for Multi-Branch Employers */}
            {userBranches.length > 0 && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#fffaf5",
                  border: "1px solid #fed7aa",
                  borderRadius: 10,
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#9a3412", display: "flex", alignItems: "center", gap: 6 }}>
                    <Building2 className="w-4 h-4 text-orange-600" />
                    Assign to Company Branch / Office Location:
                  </label>
                  <span style={{ fontSize: 11, color: "#ea580c", fontWeight: 600 }}>
                    {userBranches.length} Branches Available
                  </span>
                </div>
                <Select
                  size="middle"
                  value={selectedBranchId}
                  onChange={handleBranchSelect}
                  style={{ width: "100%" }}
                  options={[
                    { label: "📍 Custom / Unspecified Location", value: "custom" },
                    ...userBranches.map((b: any) => ({
                      label: `🏢 ${b.branchName} (${b.city}${b.state ? `, ${b.state}` : ""}) — ${b.branchType || "Branch"}`,
                      value: b.id,
                    })),
                  ]}
                />
              </div>
            )}

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Location (City)</label>
                <AutoComplete
                  options={cityOptions}
                  onSearch={fetchCities}
                  value={location}
                  onChange={(val) => setLocation(val)}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <Input
                    prefix={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                    style={{ borderRadius: 8 }}
                  />
                </AutoComplete>
              </Col>
              <Col xs={12} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Work Mode</label>
                <Select
                  value={workplaceType}
                  onChange={(val) => setWorkplaceType(val)}
                  options={[
                    { label: "Hybrid", value: "Hybrid" },
                    { label: "Remote", value: "Remote" },
                    { label: "On-site", value: "On-site" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Experience Level</label>
                <Select
                  value={experienceLevel}
                  onChange={(val) => setExperienceLevel(val)}
                  options={[
                    { label: "Fresher (0 Yrs)", value: "Fresher" },
                    { label: "Mid-Level (1-3 Yrs)", value: "Mid-Level" },
                    { label: "Senior (3-6 Yrs)", value: "Senior" },
                    { label: "Lead (6-10 Yrs)", value: "Lead" },
                    { label: "Executive (10+ Yrs)", value: "Executive" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Job Type</label>
                <Select
                  value={jobType}
                  onChange={(val) => setJobType(val)}
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Internship", value: "Internship" },
                    { label: "Part-time", value: "Part-time" },
                  ]}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Min Salary (₹ LPA)</label>
                <Input
                  prefix="₹"
                  suffix="LPA"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value.replace(/[^0-9.]/g, ""))}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Max Salary (₹ LPA)</label>
                <Input
                  prefix="₹"
                  suffix="LPA"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value.replace(/[^0-9.]/g, ""))}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block" }}>Featured Slot</label>
                <div style={{ marginTop: 8 }}>
                  <Switch
                    checked={featured}
                    onChange={(checked) => setFeatured(checked)}
                    checkedChildren="Featured"
                    unCheckedChildren="Standard"
                  />
                </div>
              </Col>
            </Row>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Mandatory Key Skills (Comma separated)
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Job Description</label>
              <Input.TextArea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
