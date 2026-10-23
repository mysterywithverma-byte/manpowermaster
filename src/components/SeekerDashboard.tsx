"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob, MockApplication } from "@/lib/mock-data";
import { JobCard } from "@/components/JobCard";
import { ProfileBuilderModal } from "@/components/ProfileBuilderModal";
import { ResumeBuilderModal } from "@/components/ResumeBuilderModal";
import { NaukriProfileView } from "@/components/NaukriProfileView";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  Card,
  Tabs,
  Avatar,
  Badge,
  Tag,
  Button,
  Progress,
  Space,
  Typography,
  Table,
  Empty,
  Tooltip,
  Switch,
  Input,
  Select,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  User,
  Briefcase,
  Bookmark,
  Bell,
  Pencil,
  FileText,
  MapPin,
  Phone,
  Mail,
  Eye,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const { Text, Title } = Typography;

interface SeekerDashboardProps {
  onSelectJob: (job: MockJob) => void;
  onApplyJob: (job: MockJob) => void;
}

interface JobAlert {
  id: string;
  role: string;
  location: string;
  frequency: "Daily" | "Weekly";
  experience: string;
  active: boolean;
}

export function SeekerDashboard({ onSelectJob, onApplyJob }: SeekerDashboardProps) {
  const { user, savedJobs } = useAuth();
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("basic");
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);

  const handleOpenProfileBuilder = (targetTab: string = "basic") => {
    setProfileModalTab(targetTab);
    setIsProfileModalOpen(true);
  };

  // Job Alerts state (Real empty state, no dummy data)
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [newAlertRole, setNewAlertRole] = useState("");
  const [newAlertLocation, setNewAlertLocation] = useState("");
  const [newAlertFreq, setNewAlertFreq] = useState<"Daily" | "Weekly">("Daily");
  const [showAddAlert, setShowAddAlert] = useState(false);

  // Fetch applications
  const fetchApps = async () => {
    if (!user?._id && !user?.id) {
      setApplications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const applicantId = user._id || user.id;
      const res = await fetch(`/api/applications?applicantId=${applicantId}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [user]);

  // Fetch bookmarked jobs
  useEffect(() => {
    async function fetchBookmarked() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.data) {
          const filtered = data.data.filter((j: MockJob) =>
            savedJobs.includes(j._id)
          );
          setBookmarkedJobs(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchBookmarked();
  }, [savedJobs]);

  const completenessScore = useMemo(() => {
    let score = 20;
    if (user?.name) score += 10;
    if (user?.headline) score += 15;
    if (user?.phone) score += 15;
    if (user?.resumeUrl) score += 20;
    if (user?.skills && user.skills.length > 0) score += 10;
    if (user?.education && user.education.length > 0) score += 5;
    if (user?.experienceHistory && user.experienceHistory.length > 0) score += 5;
    return Math.min(score, 100);
  }, [user]);

  const getStatusTag = (status: MockApplication["status"]) => {
    switch (status) {
      case "Hired":
        return <Tag color="success">Hired</Tag>;
      case "Interviewed":
        return <Tag color="processing">Interview Scheduled</Tag>;
      case "Shortlisted":
        return <Tag color="warning">Shortlisted</Tag>;
      case "Rejected":
        return <Tag color="error">Archived</Tag>;
      default:
        return <Tag color="default">Application Received</Tag>;
    }
  };

  // Ant Design Table Columns for Applications
  const applicationColumns: ColumnsType<any> = [
    {
      title: "Role & Company",
      key: "job",
      render: (_, record) => {
        const job = record.jobId || {};
        return (
          <Space align="start" size={10}>
            <Avatar
              shape="square"
              src={job.companyLogo}
              style={{ backgroundColor: "#f1f5f9", color: "#ea580c", fontWeight: 700 }}
            >
              {job.company ? job.company.charAt(0) : <Building2 className="w-4 h-4 text-orange-600" />}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                {job.title || "Job Application"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{job.company}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <span style={{ fontSize: 12, color: "#475569", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {record.jobId?.location || "India"}
        </span>
      ),
    },
    {
      title: "Salary Package",
      key: "salary",
      render: (_, record) => {
        const job = record.jobId;
        return (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
            {job ? formatSalary(job.salaryMin, job.salaryMax) : "—"}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: "Applied On",
      key: "createdAt",
      render: (_, record) => (
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {timeAgo(record.createdAt)}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 48,
      render: (_, record) => (
        <Tooltip title="View Job Details">
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
            onClick={() => onSelectJob(record.jobId)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Modern Zoho-style Candidate Profile Card */}
      <Card
        style={{
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
          marginBottom: 20,
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
          {/* Left: Clean Avatar & User Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              onClick={() => handleOpenProfileBuilder("basic")}
              style={{
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Click to edit profile"
            >
              <Avatar
                size={64}
                src={user?.avatar}
                style={{
                  backgroundColor: "#ea580c",
                  fontWeight: 700,
                  fontSize: 22,
                  border: "2px solid #fed7aa",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </Avatar>
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  padding: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ea580c",
                  fontSize: 10,
                  border: "1px solid #fed7aa",
                }}
              >
                <Pencil className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Title level={4} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  {user?.name || "Candidate"}
                </Title>
                {user?.isVerified && <VerifiedBadge size="sm" label="Verified" />}
                <Tag
                  bordered={false}
                  style={{
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    fontWeight: 600,
                    borderRadius: 6,
                    fontSize: 11,
                    padding: "1px 8px",
                  }}
                >
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Notice Period Not Set"}
                </Tag>
              </div>

              <div style={{ fontSize: 13, fontWeight: 500, color: user?.headline ? "#475569" : "#94a3b8", marginTop: 2, fontStyle: user?.headline ? "normal" : "italic" }}>
                {user?.headline || "No headline added yet"}
              </div>

              <Space
                size={14}
                split={<span style={{ color: "#cbd5e1" }}>•</span>}
                style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}
                wrap
              >
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user?.location || "Location not set"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user?.phone || "No phone added"}
                </span>
                {user?.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>
                )}
                {user?.expectedCtc && (
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>
                    ₹{user.expectedCtc} LPA Expected
                  </span>
                )}
              </Space>
            </div>
          </div>

          {/* Right: Modern Zoho-style Compact Icon Action Toolbar */}
          <Space size={8} align="center">
            <Tooltip title="View Profile">
              <Button
                shape="circle"
                size="large"
                icon={<Eye className="w-4 h-4 text-slate-600" />}
                onClick={() => setIsViewProfileOpen(true)}
                style={{
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              />
            </Tooltip>

            <Tooltip title="Edit Profile Details">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => handleOpenProfileBuilder("basic")}
                style={{
                  backgroundColor: "#ea580c",
                  borderColor: "#ea580c",
                  boxShadow: "0 2px 6px rgba(234, 88, 12, 0.25)",
                }}
              />
            </Tooltip>

            <Tooltip title="ATS Resume Builder">
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

      {/* Main Tabs */}
      <Tabs
        activeKey={tab}
        onChange={setTab}
        size="middle"
        style={{ marginTop: 4 }}
        items={[
          {
            key: "applications",
            label: (
              <Space size={6}>
                <Briefcase className="w-4 h-4" />
                <span>Applications</span>
                <Badge count={applications.length} style={{ backgroundColor: "#ea580c" }} size="small" />
              </Space>
            ),
            children: (
              <Card
                style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={applications}
                  columns={applicationColumns}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 600 }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="You haven't applied to any roles yet"
                        style={{ padding: "32px 0" }}
                      />
                    ),
                  }}
                />
              </Card>
            ),
          },
          {
            key: "bookmarks",
            label: (
              <Space size={6}>
                <Bookmark className="w-4 h-4" />
                <span>Saved Jobs</span>
                <Badge count={bookmarkedJobs.length} style={{ backgroundColor: "#64748b" }} size="small" />
              </Space>
            ),
            children: (
              <div>
                {bookmarkedJobs.length === 0 ? (
                  <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center", padding: 32 }}>
                    <Empty description="No saved jobs found. Click the bookmark icon on any job card to save it." />
                  </Card>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                    {bookmarkedJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onSelectJob={onSelectJob}
                        onApplyJob={onApplyJob}
                      />
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "alerts",
            label: (
              <Space size={6}>
                <Bell className="w-4 h-4" />
                <span>Job Alerts</span>
              </Space>
            ),
            children: (
              <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <Title level={4} style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
                      Active Job Alerts
                    </Title>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setShowAddAlert(!showAddAlert)}
                    style={{ fontWeight: 600, borderRadius: 8 }}
                  >
                    Create Alert
                  </Button>
                </div>

                {showAddAlert && (
                  <Card
                    size="small"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 16 }}
                  >
                    <Space wrap size={10}>
                      <Input
                        placeholder="Role / Title"
                        value={newAlertRole}
                        onChange={(e) => setNewAlertRole(e.target.value)}
                        style={{ width: 180 }}
                      />
                      <Input
                        placeholder="City"
                        value={newAlertLocation}
                        onChange={(e) => setNewAlertLocation(e.target.value)}
                        style={{ width: 140 }}
                      />
                      <Select
                        value={newAlertFreq}
                        onChange={(val) => setNewAlertFreq(val)}
                        options={[
                          { label: "Daily", value: "Daily" },
                          { label: "Weekly", value: "Weekly" },
                        ]}
                        style={{ width: 110 }}
                      />
                      <Button
                        type="primary"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          if (!newAlertRole) return;
                          setJobAlerts((prev) => [
                            ...prev,
                            {
                              id: String(Date.now()),
                              role: newAlertRole,
                              location: newAlertLocation || "All India",
                              frequency: newAlertFreq,
                              experience: "Any",
                              active: true,
                            },
                          ]);
                          setNewAlertRole("");
                          setNewAlertLocation("");
                          setShowAddAlert(false);
                        }}
                        style={{ fontWeight: 600, borderRadius: 8 }}
                      >
                        Save Alert
                      </Button>
                    </Space>
                  </Card>
                )}

                {jobAlerts.length === 0 ? (
                  <Empty
                    description="No job alerts created yet. Click 'Create Job Alert' to receive updates."
                    style={{ padding: "32px 0" }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {jobAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderRadius: 10,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                            {alert.role}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {alert.location} • {alert.frequency} Digest
                          </div>
                        </div>
                        <Space size={14}>
                          <Switch
                            checked={alert.active}
                            onChange={(checked) =>
                              setJobAlerts((prev) =>
                                prev.map((a) => (a.id === alert.id ? { ...a, active: checked } : a))
                              )
                            }
                          />
                          <Tooltip title="Delete Alert">
                            <Button
                              type="text"
                              danger
                              shape="circle"
                              size="small"
                              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                              onClick={() =>
                                setJobAlerts((prev) => prev.filter((a) => a.id !== alert.id))
                              }
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />

      {/* Profile Builder & Resume Builder Modals */}
      {isProfileModalOpen && (
        <ProfileBuilderModal
          isOpen={isProfileModalOpen}
          initialTab={profileModalTab}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {isResumeBuilderOpen && (
        <ResumeBuilderModal
          isOpen={isResumeBuilderOpen}
          onClose={() => setIsResumeBuilderOpen(false)}
        />
      )}

      {/* Candidate Profile Details View Modal */}
      <Modal
        open={isViewProfileOpen}
        onCancel={() => setIsViewProfileOpen(false)}
        footer={null}
        width={1050}
        title={
          <Space size={8}>
            <User className="w-4 h-4 text-orange-600" />
            <span style={{ fontWeight: 700 }}>Profile Details</span>
          </Space>
        }
        destroyOnHidden
        style={{ top: 24 }}
      >
        <div style={{ marginTop: 16 }}>
          <NaukriProfileView
            onOpenProfileBuilder={(targetTab = "basic") => {
              setIsViewProfileOpen(false);
              setProfileModalTab(targetTab);
              setIsProfileModalOpen(true);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
