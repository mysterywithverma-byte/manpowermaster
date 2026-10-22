"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Upload,
  Typography,
  Divider,
  Alert,
  Tooltip,
  Card,
  Table,
  AutoComplete,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BankOutlined,
  BookOutlined,
  RocketOutlined,
  GlobalOutlined,
  GithubOutlined,
  LinkedinOutlined,
  FilePdfOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

const { Text, Title } = Typography;

interface ProfileBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export function ProfileBuilderModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: ProfileBuilderModalProps) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");

  // Tab 1: Basic & Headline
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [noticePeriod, setNoticePeriod] = useState(user?.noticePeriod || "Immediate");
  const [currentCtc, setCurrentCtc] = useState(user?.currentCtc ? String(user.currentCtc) : "0");
  const [expectedCtc, setExpectedCtc] = useState(user?.expectedCtc ? String(user.expectedCtc) : "0");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  // Tab 2: Skills & IT Skills
  const [skillsList, setSkillsList] = useState<string[]>(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [itSkills, setItSkills] = useState<any[]>(
    user?.itSkills || [
      { skill: "React.js", version: "18.x", lastUsed: "2024", expYears: 3, expMonths: 6 },
      { skill: "Next.js", version: "14.x", lastUsed: "2024", expYears: 2, expMonths: 0 },
      { skill: "TypeScript", version: "5.x", lastUsed: "2024", expYears: 3, expMonths: 0 },
    ]
  );
  const [newItSkill, setNewItSkill] = useState({
    skill: "",
    version: "",
    lastUsed: "2024",
    expYears: 1,
    expMonths: 0,
  });

  // Tab 3: Employment History
  const [experienceHistory, setExperienceHistory] = useState<any[]>(
    user?.experienceHistory && user.experienceHistory.length > 0
      ? user.experienceHistory
      : [
          {
            role: "Software Engineer",
            company: "Tech Systems",
            duration: "2022 - Present",
            description: "Developed modern web apps and REST APIs.",
          },
        ]
  );

  // Tab 4: Education
  const [education, setEducation] = useState<any[]>(
    user?.education && user.education.length > 0
      ? user.education
      : [
          {
            degree: "B.Tech in Computer Science",
            institution: "College of Engineering",
            year: "2022",
            courseType: "Full Time",
            percentageOrCgpa: "8.2 CGPA",
          },
        ]
  );

  // Tab 5: Projects & Online Links
  const [projects, setProjects] = useState<any[]>(
    user?.projects && user.projects.length > 0
      ? user.projects
      : [
          {
            title: "Talent Acquisition Job Portal",
            client: "Academic / Corporate",
            duration: "6 Months",
            role: "Full Stack Lead",
            details: "Built an intelligent job board with split-screen discovery and ATS screening.",
          },
        ]
  );
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");

  // Tab 6: Career & Personal
  const [desiredRole, setDesiredRole] = useState(
    user?.careerPreferences?.desiredRole || "Software Developer"
  );
  const [preferredLocations, setPreferredLocations] = useState<string[]>(
    user?.careerPreferences?.preferredLocations || ["Bengaluru", "Remote"]
  );
  const [gender, setGender] = useState(user?.personalDetails?.gender || "Male");
  const [maritalStatus, setMaritalStatus] = useState(user?.personalDetails?.maritalStatus || "Single");
  const [dob, setDob] = useState(user?.personalDetails?.dob || "1998-05-15");
  const [hometown, setHometown] = useState(user?.personalDetails?.hometown || user?.location || "");
  const [languages, setLanguages] = useState<string>(
    user?.personalDetails?.languages
      ? user.personalDetails.languages.map((l: any) => (typeof l === "string" ? l : l.language)).join(", ")
      : "English, Hindi"
  );

  // Status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dynamic City Options via Locations API
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

  useEffect(() => {
    if (isOpen) {
      fetchCities("");
    }
  }, [isOpen]);

  // Sync state on user change
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.headline) setHeadline(user.headline);
      if (user.bio) setBio(user.bio);
      if (user.phone) setPhone(user.phone);
      if (user.location) setLocation(user.location);
      if (user.noticePeriod) setNoticePeriod(user.noticePeriod);
      if (user.currentCtc) setCurrentCtc(String(user.currentCtc));
      if (user.expectedCtc) setExpectedCtc(String(user.expectedCtc));
      if (user.avatar) setAvatarUrl(user.avatar);
      if (user.skills) setSkillsList(user.skills);
      if (user.itSkills) setItSkills(user.itSkills);
      if (user.experienceHistory) setExperienceHistory(user.experienceHistory);
      if (user.education) setEducation(user.education);
      if (user.projects) setProjects(user.projects);
      if (user.portfolioUrl) setPortfolioUrl(user.portfolioUrl);
      if (user.githubUrl) setGithubUrl(user.githubUrl);
      if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl);
      if (user.careerPreferences?.desiredRole) setDesiredRole(user.careerPreferences.desiredRole);
      if (user.careerPreferences?.preferredLocations) setPreferredLocations(user.careerPreferences.preferredLocations);
      if (user.personalDetails?.gender) setGender(user.personalDetails.gender);
      if (user.personalDetails?.maritalStatus) setMaritalStatus(user.personalDetails.maritalStatus);
      if (user.personalDetails?.dob) setDob(user.personalDetails.dob);
      if (user.personalDetails?.hometown) setHometown(user.personalDetails.hometown);
    }
  }, [user, isOpen]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const compressed = await compressImageToWebP(file, 400, 0.85);
      const formData = new FormData();
      formData.append("file", compressed.file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setAvatarUrl(data.url);
      }
    } catch {
      // ignore
    }
    return false;
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleAddItSkill = () => {
    if (newItSkill.skill.trim()) {
      setItSkills([...itSkills, { ...newItSkill }]);
      setNewItSkill({ skill: "", version: "", lastUsed: "2024", expYears: 1, expMonths: 0 });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");

    try {
      const parsedLanguages = languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((lang) => ({ language: lang, read: true, write: true, speak: true }));

      const profilePayload = {
        name,
        avatar: avatarUrl,
        headline,
        bio,
        phone,
        location,
        noticePeriod,
        currentCtc: Number(currentCtc) || 0,
        expectedCtc: Number(expectedCtc) || 0,
        skills: skillsList,
        itSkills,
        experienceHistory,
        education,
        projects,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        careerPreferences: {
          desiredRole,
          preferredLocations,
          expectedSalary: Number(expectedCtc) || 0,
          desiredJobType: "Permanent",
          desiredEmploymentType: "Full Time",
        },
        personalDetails: {
          dob,
          gender,
          maritalStatus,
          hometown,
          languages: parsedLanguages,
        },
        profileCompleted: true,
      };

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          email: user?.email,
          profileData: profilePayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUser(data.user || profilePayload);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ea580c", "#fb923c", "#16a34a"],
        });
        if (onProfileUpdated) onProfileUpdated();
        setTimeout(() => {
          setSaving(false);
          onClose();
        }, 500);
      } else {
        setError(data.error || "Failed to update profile");
        setSaving(false);
      }
    } catch {
      setError("An unexpected network error occurred.");
      setSaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 12 }}>
          <Button onClick={onClose} icon={<CloseOutlined />}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={saving}
            onClick={handleSaveAll}
            style={{ fontWeight: 600, borderRadius: 8 }}
          >
            Save Profile Details
          </Button>
        </div>
      }
      width={780}
      centered
      styles={{ body: { padding: "20px 24px" } }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
          Edit Naukri 360° Profile Details
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Keep all professional, educational, and identity details synced for recruiter searches.
        </Text>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 14, borderRadius: 8 }} />
      )}

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "basic",
            label: "Basic & Headline",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Full Name</label>
                    <Input
                      prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Mobile Number</label>
                    <Input
                      prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Current City</label>
                    <AutoComplete
                      options={cityOptions}
                      onSearch={fetchCities}
                      value={location}
                      onChange={(val) => setLocation(val)}
                      style={{ width: "100%", marginTop: 4 }}
                    >
                      <Input
                        prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Search city across India..."
                        style={{ borderRadius: 8 }}
                      />
                    </AutoComplete>
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Notice Period</label>
                    <Select
                      value={noticePeriod}
                      onChange={(val) => setNoticePeriod(val)}
                      options={[
                        { label: "Immediate Joiner", value: "Immediate" },
                        { label: "15 Days", value: "15 Days" },
                        { label: "30 Days (1 Month)", value: "30 Days" },
                        { label: "60 Days (2 Months)", value: "60 Days" },
                        { label: "90 Days (3 Months)", value: "90 Days" },
                      ]}
                      style={{ width: "100%", marginTop: 4 }}
                    />
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Current Annual CTC (₹ LPA)</label>
                    <Input
                      prefix="₹"
                      suffix="LPA"
                      value={currentCtc}
                      onChange={(e) => setCurrentCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Expected Annual CTC (₹ LPA)</label>
                    <Input
                      prefix="₹"
                      suffix="LPA"
                      value={expectedCtc}
                      onChange={(e) => setExpectedCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                </Row>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Resume Headline</label>
                  <Input.TextArea
                    rows={2}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Profile Summary (Bio)</label>
                  <Input.TextArea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "skills",
            label: "Key & IT Skills",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Key Skills */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Key Skills</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0" }}>
                    {skillsList.map((skill, i) => (
                      <Tag
                        key={i}
                        closable
                        onClose={() => setSkillsList(skillsList.filter((_, idx) => idx !== i))}
                        style={{ borderRadius: 12, padding: "2px 8px" }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      placeholder="Add technical or functional skill"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onPressEnter={handleAddSkill}
                    />
                    <Tooltip title="Add Skill">
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSkill} />
                    </Tooltip>
                  </Space.Compact>
                </div>

                <Divider style={{ margin: "10px 0" }} />

                {/* IT Skills Table */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                      IT Skills (Tools, Versions, Experience)
                    </Text>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {itSkills.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{it.skill}</span>
                          <span style={{ color: "#64748b", marginLeft: 8 }}>
                            Ver: {it.version || "N/A"} • Exp: {it.expYears}y {it.expMonths}m • Last used: {it.lastUsed}
                          </span>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => setItSkills(itSkills.filter((_, i) => i !== idx))}
                          style={{ fontWeight: 600 }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add IT Skill Form */}
                  <Row gutter={[8, 8]} align="middle">
                    <Col xs={24} sm={8}>
                      <Input
                        placeholder="Skill (e.g. Docker)"
                        value={newItSkill.skill}
                        onChange={(e) => setNewItSkill({ ...newItSkill, skill: e.target.value })}
                        size="small"
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Input
                        placeholder="Ver (e.g. 24)"
                        value={newItSkill.version}
                        onChange={(e) => setNewItSkill({ ...newItSkill, version: e.target.value })}
                        size="small"
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Input
                        placeholder="Last Used (2024)"
                        value={newItSkill.lastUsed}
                        onChange={(e) => setNewItSkill({ ...newItSkill, lastUsed: e.target.value })}
                        size="small"
                      />
                    </Col>
                    <Col xs={16} sm={5}>
                      <Input
                        placeholder="Exp Years"
                        type="number"
                        value={newItSkill.expYears}
                        onChange={(e) => setNewItSkill({ ...newItSkill, expYears: Number(e.target.value) || 0 })}
                        size="small"
                      />
                    </Col>
                    <Col xs={8} sm={3}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleAddItSkill}
                        style={{ fontWeight: 600, borderRadius: 6 }}
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>
                </div>
              </div>
            ),
          },
          {
            key: "employment",
            label: "Employment History",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 13, color: "#0f172a" }}>Work Experience Entries</Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setExperienceHistory([
                        ...experienceHistory,
                        { role: "", company: "", duration: "", description: "" },
                      ])
                    }
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    Add Experience
                  </Button>
                </div>

                {experienceHistory.map((exp, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    style={{ backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={11}>
                        <Input
                          placeholder="Designation / Role"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experienceHistory];
                            updated[idx].role = e.target.value;
                            setExperienceHistory(updated);
                          }}
                        />
                      </Col>
                      <Col xs={20} sm={11}>
                        <Input
                          placeholder="Company / Organization Name"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experienceHistory];
                            updated[idx].company = e.target.value;
                            setExperienceHistory(updated);
                          }}
                        />
                      </Col>
                      <Col xs={4} sm={2} style={{ textAlign: "right" }}>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            setExperienceHistory(experienceHistory.filter((_, i) => i !== idx))
                          }
                          style={{ fontWeight: 600 }}
                        >
                          Delete
                        </Button>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Input
                          placeholder="Duration (e.g. 2021 - Present or 2 Years)"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...experienceHistory];
                            updated[idx].duration = e.target.value;
                            setExperienceHistory(updated);
                          }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Input
                          placeholder="Key Responsibilities summary"
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experienceHistory];
                            updated[idx].description = e.target.value;
                            setExperienceHistory(updated);
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "education",
            label: "Education",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 13, color: "#0f172a" }}>Academic Qualifications</Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setEducation([
                        ...education,
                        { degree: "", institution: "", year: "2024", courseType: "Full Time", percentageOrCgpa: "" },
                      ])
                    }
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    Add Education
                  </Button>
                </div>

                {education.map((edu, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    style={{ backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={11}>
                        <Input
                          placeholder="Degree / Course (e.g. B.Tech CS, MBA, B.Com)"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </Col>
                      <Col xs={20} sm={11}>
                        <Input
                          placeholder="College / Institute Name"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].institution = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </Col>
                      <Col xs={4} sm={2} style={{ textAlign: "right" }}>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                          style={{ fontWeight: 600 }}
                        >
                          Delete
                        </Button>
                      </Col>
                      <Col xs={12} sm={8}>
                        <Input
                          placeholder="Year (e.g. 2023)"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].year = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={8}>
                        <Input
                          placeholder="Grade (% or CGPA)"
                          value={edu.percentageOrCgpa}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].percentageOrCgpa = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </Col>
                      <Col xs={24} sm={8}>
                        <Input
                          placeholder="Course Type (Full Time / Distance)"
                          value={edu.courseType}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].courseType = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "projects",
            label: "Projects & Portfolios",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Portfolio Website</label>
                    <Input
                      prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="https://myportfolio.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>GitHub Profile</label>
                    <Input
                      prefix={<GithubOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>LinkedIn Profile</label>
                    <Input
                      prefix={<LinkedinOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                </Row>

                <Divider style={{ margin: "8px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 13, color: "#0f172a" }}>Highlighted Projects</Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setProjects([
                        ...projects,
                        { title: "", client: "", duration: "", role: "", details: "" },
                      ])
                    }
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    Add Project
                  </Button>
                </div>

                {projects.map((proj, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    style={{ backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={11}>
                        <Input
                          placeholder="Project Title"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].title = e.target.value;
                            setProjects(updated);
                          }}
                        />
                      </Col>
                      <Col xs={20} sm={11}>
                        <Input
                          placeholder="Role (e.g. Lead Developer)"
                          value={proj.role}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].role = e.target.value;
                            setProjects(updated);
                          }}
                        />
                      </Col>
                      <Col xs={4} sm={2} style={{ textAlign: "right" }}>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                          style={{ fontWeight: 600 }}
                        >
                          Delete
                        </Button>
                      </Col>
                      <Col xs={24}>
                        <Input.TextArea
                          rows={2}
                          placeholder="Description & Technologies used"
                          value={proj.details}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].details = e.target.value;
                            setProjects(updated);
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "personal",
            label: "Career & Personal",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Desired Role</label>
                    <Input
                      value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Hometown</label>
                    <AutoComplete
                      options={cityOptions}
                      onSearch={fetchCities}
                      value={hometown}
                      onChange={(val) => setHometown(val)}
                      style={{ width: "100%", marginTop: 4 }}
                    >
                      <Input
                        prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Search hometown city..."
                        style={{ borderRadius: 8 }}
                      />
                    </AutoComplete>
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Gender</label>
                    <Select
                      value={gender}
                      onChange={(val) => setGender(val)}
                      options={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                      ]}
                      style={{ width: "100%", marginTop: 4 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Marital Status</label>
                    <Select
                      value={maritalStatus}
                      onChange={(val) => setMaritalStatus(val)}
                      options={[
                        { label: "Single / Unmarried", value: "Single" },
                        { label: "Married", value: "Married" },
                      ]}
                      style={{ width: "100%", marginTop: 4 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Date of Birth</label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ marginTop: 4, borderRadius: 8 }}
                    />
                  </Col>
                </Row>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Languages Known (Comma separated)
                  </label>
                  <Input
                    placeholder="e.g. English, Hindi, Punjabi, Bengali"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
