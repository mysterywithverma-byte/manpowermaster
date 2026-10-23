"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { compressImageToWebP } from "@/lib/image-compressor";
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
  Empty,
  Dropdown,
  Modal,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  FileText,
  Type,
  Sparkles,
  Briefcase,
  GraduationCap,
  Cpu,
  FolderGit2,
  AlignLeft,
  Award,
  Target,
  User,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
  Building2,
  Camera,
  Eye,
  Trash2,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ResumeBuilderModal } from "@/components/ResumeBuilderModal";

const { Text, Title, Paragraph } = Typography;

interface NaukriProfileViewProps {
  onOpenProfileBuilder: (tab?: string) => void;
}

export function NaukriProfileView({ onOpenProfileBuilder }: NaukriProfileViewProps) {
  const { user, updateUser } = useAuth();
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [activeQuickLink, setActiveQuickLink] = useState("resume");
  const [isViewAvatarOpen, setIsViewAvatarOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Image file size should be less than 5MB.");
      return;
    }

    setUploadingAvatar(true);

    try {
      // 1. Compress image & convert to modern WebP format in browser (reduces size by 90%+)
      const compressed = await compressImageToWebP(file, 400, 0.82);
      const formData = new FormData();
      formData.append("file", compressed.file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const finalAvatarUrl = data.success && data.url ? data.url : compressed.dataUrl;

      // Update user state and persist in DB
      updateUser({ avatar: finalAvatarUrl });
      await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          email: user?.email,
          avatar: finalAvatarUrl,
        }),
      });
      message.success("Profile photo converted to WebP & updated successfully!");
    } catch {
      message.error("Error compressing or uploading profile photo");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = () => {
    Modal.confirm({
      title: "Remove Profile Photo",
      content: "Are you sure you want to remove your profile photo?",
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        updateUser({ avatar: "" });
        try {
          await fetch("/api/users/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?._id || user?.id,
              email: user?.email,
              avatar: "",
            }),
          });
          message.success("Profile photo removed.");
        } catch {
          message.error("Could not remove photo from database.");
        }
      },
    });
  };

  const avatarMenuItems: MenuProps["items"] = [
    {
      key: "view",
      label: "View Photo",
      icon: <Eye className="w-3.5 h-3.5 text-slate-500" />,
      disabled: !user?.avatar,
      onClick: () => setIsViewAvatarOpen(true),
    },
    {
      key: "update",
      label: "Upload New Photo",
      icon: <Camera className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => fileInputRef.current?.click(),
    },
    ...(user?.avatar
      ? [
          {
            type: "divider" as const,
          },
          {
            key: "delete",
            label: "Remove Photo",
            danger: true,
            icon: <Trash2 className="w-3.5 h-3.5 text-red-500" />,
            onClick: handleDeleteAvatar,
          },
        ]
      : []),
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveQuickLink(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const quickLinks = [
    { id: "resume", label: "Resume", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "headline", label: "Headline", icon: <Type className="w-3.5 h-3.5" /> },
    { id: "skills", label: "Key Skills", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "employment", label: "Employment", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "it-skills", label: "IT Skills", icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: "projects", label: "Projects", icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: "summary", label: "Profile Summary", icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { id: "accomplishments", label: "Online Profiles", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "career-profile", label: "Career Preferences", icon: <Target className="w-3.5 h-3.5" /> },
    { id: "personal-details", label: "Personal Details", icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ========================================================= */}
      {/* TOP HEADER: CANDIDATE PROFILE SUMMARY CARD                */}
      {/* ========================================================= */}
      <Card
        style={{
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
        }}
        styles={{ body: { padding: "18px 24px" } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Left: Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Hidden file input for DP image selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            <Dropdown
              menu={{ items: avatarMenuItems }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                className="group"
                title="Profile photo options (View, Update, Remove)"
              >
                <Avatar
                  size={70}
                  src={user?.avatar}
                  style={{
                    backgroundColor: "#ea580c",
                    fontSize: 26,
                    fontWeight: 700,
                    border: "2px solid #fed7aa",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                </Avatar>

                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    backgroundColor: "#ffffff",
                    color: "#ea580c",
                    borderRadius: "50%",
                    padding: 4,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    border: "1px solid #fed7aa",
                  }}
                  className="group-hover:bg-orange-50 group-hover:scale-110 transition-all"
                >
                  <Camera className="w-3 h-3 text-orange-600" />
                </div>
              </div>
            </Dropdown>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
                  {user?.name || "Candidate"}
                </Title>
                {user?.isVerified && <VerifiedBadge size="sm" label="Verified Candidate" />}
                <Tag color="green" style={{ borderRadius: 10, fontWeight: 700 }}>
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Notice Period Not Set"}
                </Tag>
              </div>

              {/* Headline */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: user?.headline ? "#475569" : "#94a3b8", fontWeight: 600, fontStyle: user?.headline ? "normal" : "italic" }}>
                  {user?.headline || "No headline added yet"}
                </Text>
                <Button
                  type="link"
                  size="small"
                  icon={<Pencil className="w-3 h-3 text-orange-600" />}
                  onClick={() => onOpenProfileBuilder("basic")}
                  style={{ padding: "0 4px", height: "auto", fontWeight: 600 }}
                >
                  Edit
                </Button>
              </div>

              {/* Quick Contact Micro Info */}
              <Space
                size={14}
                separator={<span style={{ color: "#cbd5e1" }}>•</span>}
                style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}
                wrap
              >
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.location || "Location not set"}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.phone || "No phone added"}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || "No email added"}</span>
                </span>
              </Space>
            </div>
          </div>

          {/* Right: Modern Zoho-style Compact Action Toolbar */}
          <Space size={8} align="center">
            <Tooltip title="Edit Profile Details">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => onOpenProfileBuilder("basic")}
                style={{
                  backgroundColor: "#ea580c",
                  borderColor: "#ea580c",
                  boxShadow: "0 2px 6px rgba(234, 88, 12, 0.25)",
                }}
              />
            </Tooltip>
            <Tooltip title="Generate ATS Resume">
              <Button
                shape="circle"
                size="large"
                icon={<FileText className="w-4 h-4 text-orange-600" />}
                onClick={() => setIsResumeBuilderOpen(true)}
                style={{
                  border: "1px solid #fed7aa",
                  backgroundColor: "#fff7ed",
                }}
              />
            </Tooltip>
          </Space>
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
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: activeQuickLink === item.id ? 700 : 500,
                    backgroundColor: activeQuickLink === item.id ? "#fff7ed" : "transparent",
                    color: activeQuickLink === item.id ? "#ea580c" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: activeQuickLink === item.id ? "#ea580c" : "#94a3b8" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              ))}
            </div>

            {/* Resume Builder Help Box */}
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
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>ATS Resume Builder</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: "1.4" }}>
                Generate a clean, recruiter-preferred ATS resume format in seconds.
              </p>
              <Button
                size="small"
                type="primary"
                block
                style={{ marginTop: 8, borderRadius: 8, fontWeight: 600 }}
                icon={<FileText className="w-3.5 h-3.5 mr-1" />}
                onClick={() => setIsResumeBuilderOpen(true)}
              >
                Open Builder
              </Button>
            </div>
          </div>
        </Col>

        {/* Right Column: Detailed Section Cards */}
        <Col xs={24} lg={18}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* SECTION 1: RESUME CARD */}
            <Card
              id="resume"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Resume Document</Title>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => setIsResumeBuilderOpen(true)}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Upload / Build
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
                      }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                        {user.resumeFileName || "Uploaded_Resume.pdf"}
                      </div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Attached &amp; Active
                      </div>
                    </div>
                  </Space>

                  <Space size={8}>
                    <a href={user.resumeUrl} target="_blank" rel="noreferrer">
                      <Button size="small" icon={<Download className="w-3.5 h-3.5" />}>
                        Download
                      </Button>
                    </a>
                    <Button
                      type="primary"
                      size="small"
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => setIsResumeBuilderOpen(true)}
                    >
                      Edit
                    </Button>
                  </Space>
                </div>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    textAlign: "center",
                  }}
                >
                  <Text strong style={{ color: "#475569", display: "block" }}>
                    No Resume Attached
                  </Text>
                  <div style={{ marginTop: 10 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<FileText className="w-3.5 h-3.5 mr-1" />}
                      onClick={() => setIsResumeBuilderOpen(true)}
                    >
                      Build ATS Resume
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* SECTION 2: RESUME HEADLINE */}
            <Card
              id="headline"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Type className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Resume Headline</Title>
                </div>
                <Tooltip title="Edit Headline">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Pencil className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => onOpenProfileBuilder("basic")}
                  />
                </Tooltip>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 13, color: user?.headline ? "#334155" : "#94a3b8", fontStyle: user?.headline ? "normal" : "italic" }}>
                {user?.headline || "No resume headline added yet. Click edit to add a summary."}
              </Paragraph>
            </Card>

            {/* SECTION 3: KEY SKILLS */}
            <Card
              id="skills"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Key Skills</Title>
                </div>
                <Tooltip title="Add Skills">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Plus className="w-4 h-4 text-orange-600" />}
                    onClick={() => onOpenProfileBuilder("skills")}
                  />
                </Tooltip>
              </div>

              {user?.skills && user.skills.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {user.skills.map((skill, idx) => (
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
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    No skills added yet.
                  </Text>
                  <Button size="small" type="dashed" icon={<Plus className="w-3.5 h-3.5 mr-1" />} onClick={() => onOpenProfileBuilder("skills")}>
                    Add Skill
                  </Button>
                </div>
              )}
            </Card>

            {/* SECTION 4: EMPLOYMENT */}
            <Card
              id="employment"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Work Experience</Title>
                </div>
                <Tooltip title="Add Work Experience">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Plus className="w-4 h-4 text-orange-600" />}
                    onClick={() => onOpenProfileBuilder("employment")}
                  />
                </Tooltip>
              </div>

              {user?.experienceHistory && user.experienceHistory.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {user.experienceHistory.map((exp: any, idx: number) => (
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
                        {exp.duration && <Tag color="orange" style={{ borderRadius: 8 }}>{exp.duration}</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
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
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    No work experience recorded.
                  </Text>
                  <Button size="small" type="dashed" icon={<Plus className="w-3.5 h-3.5 mr-1" />} onClick={() => onOpenProfileBuilder("employment")}>
                    Add Experience
                  </Button>
                </div>
              )}
            </Card>

            {/* SECTION 5: EDUCATION */}
            <Card
              id="education"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <GraduationCap className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Education &amp; Degrees</Title>
                </div>
                <Tooltip title="Add Education">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Plus className="w-4 h-4 text-orange-600" />}
                    onClick={() => onOpenProfileBuilder("education")}
                  />
                </Tooltip>
              </div>

              {user?.education && user.education.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {user.education.map((edu: any, idx: number) => (
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
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>{edu.institution || edu.institute}</span>
                        </div>
                      </div>
                      {(edu.year || edu.passingYear) && (
                        <Tag style={{ borderRadius: 8, fontWeight: 700 }}>{edu.year || edu.passingYear}</Tag>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    No education details added yet.
                  </Text>
                  <Button size="small" type="dashed" icon={<Plus className="w-3.5 h-3.5 mr-1" />} onClick={() => onOpenProfileBuilder("education")}>
                    Add Education
                  </Button>
                </div>
              )}
            </Card>

            {/* SECTION 6: IT SKILLS */}
            <Card
              id="it-skills"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Cpu className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>IT Tools &amp; Technologies</Title>
                </div>
                <Tooltip title="Add IT Skill">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Plus className="w-4 h-4 text-orange-600" />}
                    onClick={() => onOpenProfileBuilder("skills")}
                  />
                </Tooltip>
              </div>

              {user?.itSkills && user.itSkills.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {user.itSkills.map((it: any, idx: number) => (
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
                        {it.version && `Ver: ${it.version} • `}{it.expYears} yrs {it.expMonths || 0} mos
                      </div>
                      {it.lastUsed && (
                        <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                          Last used: {it.lastUsed}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    No IT tools or version skills recorded.
                  </Text>
                  <Button size="small" type="dashed" icon={<Plus className="w-3.5 h-3.5 mr-1" />} onClick={() => onOpenProfileBuilder("skills")}>
                    Add IT Skill
                  </Button>
                </div>
              )}
            </Card>

            {/* SECTION 7: PROJECTS */}
            <Card
              id="projects"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FolderGit2 className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Projects &amp; Portfolio</Title>
                </div>
                <Tooltip title="Add Project">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Plus className="w-4 h-4 text-orange-600" />}
                    onClick={() => onOpenProfileBuilder("projects")}
                  />
                </Tooltip>
              </div>

              {user?.projects && user.projects.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {user.projects.map((proj: any, idx: number) => (
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
                      {proj.role && (
                        <div style={{ fontSize: 12, color: "#c2410c", fontWeight: 600, marginTop: 2 }}>
                          {proj.role}
                        </div>
                      )}
                      {proj.details && (
                        <Paragraph style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b" }}>
                          {proj.details}
                        </Paragraph>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    No projects added yet.
                  </Text>
                  <Button size="small" type="dashed" icon={<Plus className="w-3.5 h-3.5 mr-1" />} onClick={() => onOpenProfileBuilder("projects")}>
                    Add Project
                  </Button>
                </div>
              )}
            </Card>

            {/* SECTION 8: PROFILE SUMMARY */}
            <Card
              id="summary"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlignLeft className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Profile Summary</Title>
                </div>
                <Tooltip title="Edit Summary">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Pencil className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => onOpenProfileBuilder("basic")}
                  />
                </Tooltip>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 13, color: user?.bio ? "#475569" : "#94a3b8", lineHeight: "1.6", fontStyle: user?.bio ? "normal" : "italic" }}>
                {user?.bio || "No profile summary added yet."}
              </Paragraph>
            </Card>

            {/* SECTION 9: ACCOMPLISHMENTS & PROFILES */}
            <Card
              id="accomplishments"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Online Profiles</Title>
                </div>
                <Tooltip title="Edit Links">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Pencil className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => onOpenProfileBuilder("personal")}
                  />
                </Tooltip>
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
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Target className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Career Preferences</Title>
                </div>
                <Tooltip title="Edit Preferences">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Pencil className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => onOpenProfileBuilder("basic")}
                  />
                </Tooltip>
              </div>

              <Row gutter={[12, 12]}>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>DESIRED ROLE</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {user?.careerPreferences?.desiredRole || "Not specified"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>EXPECTED CTC</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {user?.expectedCtc ? `₹${user.expectedCtc} LPA` : "Not specified"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>NOTICE PERIOD</span>
                    <span style={{ fontWeight: 700, color: "#16a34a" }}>
                      {user?.noticePeriod || "Not specified"}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* SECTION 11: PERSONAL DETAILS */}
            <Card
              id="personal-details"
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: "16px 20px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User className="w-4 h-4 text-orange-600" />
                  <Title level={5} style={{ margin: 0, color: "#0f172a" }}>Personal Details</Title>
                </div>
                <Tooltip title="Edit Details">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<Pencil className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => onOpenProfileBuilder("personal")}
                  />
                </Tooltip>
              </div>

              <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>GENDER</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.gender || "Not specified"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>MARITAL STATUS</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.maritalStatus || "Not specified"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>HOMETOWN</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.hometown || user?.location || "Not specified"}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block" }}>LANGUAGES</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      {user?.personalDetails?.languages && user.personalDetails.languages.length > 0
                        ? user.personalDetails.languages.map((l: any) => (typeof l === "string" ? l : l.language)).join(", ")
                        : "Not specified"}
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

      {/* View Profile Photo Modal */}
      <Modal
        open={isViewAvatarOpen}
        onCancel={() => setIsViewAvatarOpen(false)}
        footer={null}
        centered
        width={380}
        styles={{ body: { padding: 24, textAlign: "center" } }}
      >
        <div className="flex flex-col items-center gap-4">
          <Avatar
            size={220}
            src={user?.avatar}
            style={{
              backgroundColor: "#ea580c",
              fontSize: 80,
              fontWeight: 700,
              border: "3px solid #fed7aa",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
          </Avatar>
          <div className="text-center">
            <h3 className="text-base font-semibold text-slate-800 m-0">{user?.name || "Candidate"}</h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">Profile Photo</p>
          </div>
          <div className="flex items-center gap-2 w-full pt-2">
            <Button
              className="flex-1"
              icon={<Camera className="w-4 h-4 text-primary" />}
              onClick={() => {
                setIsViewAvatarOpen(false);
                fileInputRef.current?.click();
              }}
            >
              Change Photo
            </Button>
            {user?.avatar && (
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  setIsViewAvatarOpen(false);
                  handleDeleteAvatar();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
