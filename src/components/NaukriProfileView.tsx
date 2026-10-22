"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  Tag,
  Button,
  Avatar,
  Progress,
  Space,
  Row,
  Col,
  Typography,
  Tooltip,
  Divider,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  BookOutlined,
  RocketOutlined,
  GlobalOutlined,
  GithubOutlined,
  LinkedinOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ThunderboltFilled,
  CameraOutlined,
} from "@ant-design/icons";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ResumeBuilderModal } from "@/components/ResumeBuilderModal";

const { Text, Title, Paragraph } = Typography;

interface NaukriProfileViewProps {
  onOpenProfileBuilder: () => void;
}

export function NaukriProfileView({ onOpenProfileBuilder }: NaukriProfileViewProps) {
  const { user, updateUser } = useAuth();
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [activeQuickLink, setActiveQuickLink] = useState("resume");

  // Calculate Naukri Profile Completeness (0-100)
  const profileScore = React.useMemo(() => {
    let score = 20;
    if (user?.name) score += 10;
    if (user?.headline) score += 15;
    if (user?.phone) score += 10;
    if (user?.resumeUrl) score += 20;
    if (user?.skills && user.skills.length > 0) score += 10;
    if (user?.education && user.education.length > 0) score += 5;
    if (user?.experienceHistory && user.experienceHistory.length > 0) score += 10;
    return Math.min(score, 100);
  }, [user]);

  const scrollToSection = (sectionId: string) => {
    setActiveQuickLink(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const quickLinks = [
    { id: "resume", label: "Resume" },
    { id: "headline", label: "Resume Headline" },
    { id: "skills", label: "Key Skills" },
    { id: "employment", label: "Employment" },
    { id: "education", label: "Education" },
    { id: "it-skills", label: "IT Skills" },
    { id: "projects", label: "Projects" },
    { id: "summary", label: "Profile Summary" },
    { id: "accomplishments", label: "Accomplishments" },
    { id: "career-profile", label: "Desired Career Profile" },
    { id: "personal-details", label: "Personal Details" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ========================================================= */}
      {/* TOP HEADER: NAUKRI CANDIDATE PROFILE SUMMARY CARD         */}
      {/* ========================================================= */}
      <Card
        style={{
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {/* Left: Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Naukri-style Animated Progress Ring wrapping DP */}
            <div
              onClick={onOpenProfileBuilder}
              style={{
                position: "relative",
                cursor: "pointer",
                width: 96,
                height: 96,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              title={`Profile ${profileScore}% Completed - Click to Edit`}
            >
              <Progress
                type="circle"
                percent={profileScore}
                size={96}
                strokeWidth={5}
                strokeColor={{
                  "0%": "#fb923c",
                  "100%": "#ea580c",
                }}
                trailColor="#fed7aa"
                showInfo={false}
                style={{ position: "absolute", top: 0, left: 0 }}
              />

              <Avatar
                size={74}
                src={user?.avatar}
                style={{
                  backgroundColor: "#ea580c",
                  fontSize: 28,
                  fontWeight: 800,
                  border: "3px solid #ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
              </Avatar>

              <div
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "1.5px solid #ffffff",
                }}
              >
                <CameraOutlined />
              </div>

              {/* Profile % Pill Badge directly on DP */}
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  backgroundColor: profileScore >= 80 ? "#16a34a" : "#ea580c",
                  color: "#ffffff",
                  padding: "1px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  border: "2px solid #ffffff",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {profileScore}%
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
                  {user?.name || "Candidate Name"}
                </Title>
                {user?.isVerified && <VerifiedBadge size="sm" label="Verified Candidate" />}
                <Tag color="green" style={{ borderRadius: 10, fontWeight: 700 }}>
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Immediate Joiner"}
                </Tag>
              </div>

              {/* Headline */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                  {user?.headline || "Senior Software Engineer (Full Stack)"}
                </Text>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ padding: "0 4px", height: "auto", fontWeight: 600 }}
                >
                  Edit
                </Button>
              </div>

              {/* Quick Contact Micro Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <EnvironmentOutlined style={{ color: "#ea580c" }} />
                  <span>{user?.location || "Bengaluru, Karnataka"}</span>
                </span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PhoneOutlined style={{ color: "#ea580c" }} />
                  <span>{user?.phone || "+91 98765 43210"}</span>
                  <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />
                </span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MailOutlined style={{ color: "#ea580c" }} />
                  <span>{user?.email || "candidate@example.com"}</span>
                  <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />
                </span>
              </div>
            </div>
          </div>

          {/* Right: Naukri Profile Completeness Widget & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 14,
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                minWidth: 190,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "#c2410c" }}>Profile Strength</span>
                <span style={{ color: "#ea580c" }}>{profileScore}%</span>
              </div>
              <Progress percent={profileScore} strokeColor="#ea580c" showInfo={false} size="small" />
              <div style={{ fontSize: 11, color: "#9a3412", marginTop: 4 }}>
                {profileScore >= 90 ? "Excellent profile visibility" : "Add details to boost recruiter reach"}
              </div>
            </div>

            <Space size={10}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => setIsResumeBuilderOpen(true)}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Generate ATS Resume
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={onOpenProfileBuilder}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Edit Full Profile
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* TWO-COLUMN NAUKRI LAYOUT                                  */}
      {/* ========================================================= */}
      <Row gutter={[20, 20]} align="top">
        {/* Left Column: Naukri Quick Links (Sticky Sidebar) */}
        <Col xs={24} lg={6}>
          <div
            style={{
              position: "sticky",
              top: 80,
              backgroundColor: "#ffffff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94a3b8",
                padding: "6px 8px",
              }}
            >
              Quick Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {quickLinks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: activeQuickLink === item.id ? 700 : 500,
                    backgroundColor: activeQuickLink === item.id ? "#fff7ed" : "transparent",
                    color: activeQuickLink === item.id ? "#c2410c" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{item.label}</span>
                  <RightOutlined style={{ fontSize: 10, color: "#94a3b8" }} />
                </div>
              ))}
            </div>

            {/* FastForward Help Box */}
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <ThunderboltFilled style={{ color: "#ea580c" }} />
                <span>Naukri FastForward</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: "1.4" }}>
                Generate an ATS score and resume format preferred by top Indian recruiters.
              </p>
              <Button
                size="small"
                type="primary"
                block
                style={{ marginTop: 8, borderRadius: 8 }}
                onClick={() => setIsResumeBuilderOpen(true)}
              >
                Open Resume Builder
              </Button>
            </div>
          </div>
        </Col>

        {/* Right Column: Detailed Naukri Section Cards */}
        <Col xs={24} lg={18}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* SECTION 1: RESUME CARD */}
            <Card
              id="resume"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Resume</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Resume is the most critical document recruiters evaluate. Keep it current.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={onOpenProfileBuilder}
                >
                  Upload Resume
                </Button>
              </div>

              {user?.resumeUrl ? (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <Space align="center" size={12}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: "#ea580c",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      <FilePdfOutlined />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                        {user.resumeFileName || "candidate_resume.pdf"}
                      </div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                        <CheckCircleFilled /> Attached &amp; Active
                      </div>
                    </div>
                  </Space>

                  <Space size={8}>
                    <a href={user.resumeUrl} target="_blank" rel="noreferrer">
                      <Button size="small" icon={<DownloadOutlined />}>
                        Download
                      </Button>
                    </a>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setIsResumeBuilderOpen(true)}
                    >
                      Edit in Builder
                    </Button>
                  </Space>
                </div>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: "#fff7ed",
                    border: "1px dashed #fed7aa",
                    textAlign: "center",
                  }}
                >
                  <Text strong style={{ color: "#c2410c", display: "block" }}>
                    No Resume Attached
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Upload your resume file or use our ATS Resume Builder to generate one instantly.
                  </Text>
                  <div style={{ marginTop: 10 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<FilePdfOutlined />}
                      onClick={() => setIsResumeBuilderOpen(true)}
                    >
                      Generate ATS Resume
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* SECTION 2: RESUME HEADLINE */}
            <Card
              id="headline"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Resume Headline</Title>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ fontWeight: 600 }}
                >
                  Edit Headline
                </Button>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 13, color: "#334155", fontWeight: 500 }}>
                {user?.headline ||
                  "Software Engineer with experience in React, Next.js, and Node.js microservices."}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
                This is the first summary line recruiters read in candidate search results.
              </Text>
            </Card>

            {/* SECTION 3: KEY SKILLS */}
            <Card
              id="skills"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Key Skills</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Recruiters search candidates by key skills. Add your core competencies.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onOpenProfileBuilder}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Add Skills
                </Button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(user?.skills && user.skills.length > 0
                  ? user.skills
                  : ["React.js", "TypeScript", "Node.js", "MongoDB", "REST APIs", "Tailwind CSS"]
                ).map((skill, idx) => (
                  <Tag
                    key={idx}
                    style={{
                      borderRadius: 14,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {skill}
                  </Tag>
                ))}
              </div>
            </Card>

            {/* SECTION 4: EMPLOYMENT */}
            <Card
              id="employment"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Employment History</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Organizations worked at, designations, and durations.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onOpenProfileBuilder}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Add Employment
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(user?.experienceHistory && user.experienceHistory.length > 0
                  ? user.experienceHistory
                  : [
                      {
                        role: "Software Developer",
                        company: "Tech Systems Solutions",
                        duration: "2022 - Present",
                        description: "Developed responsive portals with React/Next.js and microservices.",
                      },
                    ]
                ).map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 13, color: "#0f172a" }}>{exp.role}</Text>
                      <Tag color="orange" style={{ borderRadius: 8 }}>{exp.duration}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <BankOutlined style={{ color: "#94a3b8" }} />
                      <span>{exp.company}</span>
                    </div>
                    {exp.description && (
                      <Paragraph style={{ margin: "6px 0 0 0", fontSize: 12, color: "#64748b" }}>
                        {exp.description}
                      </Paragraph>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 5: EDUCATION */}
            <Card
              id="education"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Education</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Highest qualification, degrees, colleges, and passing years.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onOpenProfileBuilder}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Add Education
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(user?.education && user.education.length > 0
                  ? user.education
                  : [
                      {
                        degree: "B.Tech in Computer Science & Engineering",
                        institution: "National Institute of Technology",
                        year: "2022",
                      },
                    ]
                ).map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{edu.degree}</div>
                      <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <BookOutlined style={{ color: "#94a3b8" }} />
                        <span>{edu.institution || edu.institute}</span>
                      </div>
                    </div>
                    <Tag style={{ borderRadius: 8, fontWeight: 700 }}>{edu.year || edu.passingYear}</Tag>
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 6: IT SKILLS */}
            <Card
              id="it-skills"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>IT Skills</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Software technologies, versions used, and years of experience.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onOpenProfileBuilder}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Add IT Skill
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {(user?.itSkills && user.itSkills.length > 0
                  ? user.itSkills
                  : [
                      { skill: "React.js", version: "18.x", lastUsed: "2024", expYears: 3, expMonths: 0 },
                      { skill: "TypeScript", version: "5.x", lastUsed: "2024", expYears: 2, expMonths: 6 },
                      { skill: "Node.js", version: "20.x", lastUsed: "2024", expYears: 3, expMonths: 0 },
                    ]
                ).map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{it.skill}</div>
                    <div style={{ color: "#64748b", marginTop: 2 }}>
                      Ver: {it.version || "Latest"} • {it.expYears} yrs {it.expMonths || 0} mos
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                      Last used: {it.lastUsed || "2024"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 7: PROJECTS */}
            <Card
              id="projects"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Projects</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Academic and corporate portfolio initiatives.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onOpenProfileBuilder}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Add Project
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(user?.projects && user.projects.length > 0
                  ? user.projects
                  : [
                      {
                        title: "Talent Acquisition Job Portal",
                        role: "Full Stack Engineer",
                        details: "High-scale recruitment application with ATS screening and live telemetry.",
                      },
                    ]
                ).map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{proj.title}</div>
                    <div style={{ fontSize: 12, color: "#c2410c", fontWeight: 600, marginTop: 2 }}>
                      {proj.role || "Developer"}
                    </div>
                    {proj.details && (
                      <Paragraph style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b" }}>
                        {proj.details}
                      </Paragraph>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 8: PROFILE SUMMARY */}
            <Card
              id="summary"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Profile Summary</Title>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ fontWeight: 600 }}
                >
                  Edit Summary
                </Button>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: "1.6" }}>
                {user?.bio ||
                  "Dedicated software engineer with a strong track record of designing modern web applications, high-performance APIs, and collaborating with cross-functional product teams to deliver measurable business results."}
              </Paragraph>
            </Card>

            {/* SECTION 9: ACCOMPLISHMENTS & PROFILES */}
            <Card
              id="accomplishments"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Accomplishments &amp; Online Profiles</Title>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ fontWeight: 600 }}
                >
                  Edit Links
                </Button>
              </div>

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, marginBottom: 2 }}>PORTFOLIO</div>
                    <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {user?.portfolioUrl ? <a href={user.portfolioUrl} target="_blank">{user.portfolioUrl}</a> : "Not added"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, marginBottom: 2 }}>GITHUB</div>
                    <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {user?.githubUrl ? <a href={user.githubUrl} target="_blank">{user.githubUrl}</a> : "Not added"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 11, marginBottom: 2 }}>LINKEDIN</div>
                    <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {user?.linkedinUrl ? <a href={user.linkedinUrl} target="_blank">{user.linkedinUrl}</a> : "Not added"}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* SECTION 10: DESIRED CAREER PROFILE */}
            <Card
              id="career-profile"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Desired Career Profile</Title>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ fontWeight: 600 }}
                >
                  Edit Preferences
                </Button>
              </div>

              <Row gutter={[12, 12]}>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>DESIRED ROLE</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {user?.careerPreferences?.desiredRole || "Software Developer"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>EXPECTED CTC</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      ₹{user?.expectedCtc || 18} LPA
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>NOTICE PERIOD</span>
                    <span style={{ fontWeight: 700, color: "#16a34a" }}>
                      {user?.noticePeriod || "Immediate"}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* SECTION 11: PERSONAL DETAILS */}
            <Card
              id="personal-details"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Personal Details</Title>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined style={{ color: "#ea580c" }} />}
                  onClick={onOpenProfileBuilder}
                  style={{ fontWeight: 600 }}
                >
                  Edit Details
                </Button>
              </div>

              <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>GENDER</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.gender || "Male"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>MARITAL STATUS</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.maritalStatus || "Single"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>HOMETOWN</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.hometown || user?.location || "Delhi"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>LANGUAGES</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.languages
                        ? user.personalDetails.languages.map((l: any) => (typeof l === "string" ? l : l.language)).join(", ")
                        : "English, Hindi"}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Embedded Resume Builder Modal */}
      <ResumeBuilderModal
        isOpen={isResumeBuilderOpen}
        onClose={() => setIsResumeBuilderOpen(false)}
        onSaved={() => {
          setIsResumeBuilderOpen(false);
        }}
      />
    </div>
  );
}
