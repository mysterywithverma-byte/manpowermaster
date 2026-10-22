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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  SolutionOutlined,
  BookOutlined,
  BellOutlined,
  EditOutlined,
  FilePdfOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  DollarOutlined,
  CheckCircleFilled,
  PlusOutlined,
  DeleteOutlined,
  BankOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
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
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);

  // Job Alerts state
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([
    {
      id: "1",
      role: "Software Engineer",
      location: "Bengaluru",
      frequency: "Daily",
      experience: "2-5 Years",
      active: true,
    },
    {
      id: "2",
      role: "Data Analyst",
      location: "Remote",
      frequency: "Weekly",
      experience: "0-2 Years",
      active: false,
    },
  ]);
  const [newAlertRole, setNewAlertRole] = useState("");
  const [newAlertLocation, setNewAlertLocation] = useState("");
  const [newAlertFreq, setNewAlertFreq] = useState<"Daily" | "Weekly">("Daily");
  const [showAddAlert, setShowAddAlert] = useState(false);

  // Fetch applications
  const fetchApps = async () => {
    try {
      setLoading(true);
      const applicantId = user?._id || user?.id || "user-seeker-1";
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
              {job.company ? job.company.charAt(0) : <BankOutlined />}
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
        <span style={{ fontSize: 12, color: "#475569" }}>
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
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Overview Profile Card */}
      <Card
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {/* User Info with Animated Progress Ring on DP */}
          <Space align="start" size={16}>
            <div
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                position: "relative",
                cursor: "pointer",
                width: 84,
                height: 84,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              title={`Profile ${completenessScore}% Complete - Click to Edit`}
            >
              <Progress
                type="circle"
                percent={completenessScore}
                size={84}
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
                size={64}
                src={user?.avatar}
                style={{
                  backgroundColor: "#ea580c",
                  fontWeight: 800,
                  fontSize: 24,
                  border: "3px solid #ffffff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </Avatar>
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  backgroundColor: completenessScore >= 80 ? "#16a34a" : "#ea580c",
                  color: "#ffffff",
                  padding: "1px 7px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 800,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  border: "2px solid #ffffff",
                  whiteSpace: "nowrap",
                }}
              >
                {completenessScore}%
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Title level={3} style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
                  {user?.name}
                </Title>
                {user?.isVerified && <VerifiedBadge size="sm" label="Verified Candidate" />}
                <Tag color="green" style={{ fontWeight: 700, borderRadius: 12 }}>
                  {user?.noticePeriod ? `${user.noticePeriod} Joiner` : "Immediate Joiner"}
                </Tag>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: "#ea580c", marginTop: 4 }}>
                {user?.headline || "Software Engineer / Professional Candidate"}
              </div>

              <Space
                size={14}
                split={<span style={{ color: "#cbd5e1" }}>•</span>}
                style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}
              >
                <span>
                  <EnvironmentOutlined /> {user?.location || "Bengaluru, Karnataka"}
                </span>
                <span>
                  <PhoneOutlined /> {user?.phone || "+91 98765 43210"}
                </span>
                {user?.expectedCtc && (
                  <strong style={{ color: "#0f172a" }}>Expected: ₹{user.expectedCtc} LPA</strong>
                )}
              </Space>
            </div>
          </Space>

          {/* Profile Progress & Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                minWidth: 160,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Profile Score</span>
                <span style={{ color: "#ea580c" }}>{completenessScore}%</span>
              </div>
              <Progress
                percent={completenessScore}
                showInfo={false}
                strokeColor="#ea580c"
                size="small"
              />
            </div>

            <Space size={10}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => setIsResumeBuilderOpen(true)}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                ATS Resume
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsProfileModalOpen(true)}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Edit Profile
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs
        activeKey={tab}
        onChange={setTab}
        type="card"
        items={[
          {
            key: "applications",
            label: (
              <Space>
                <SolutionOutlined />
                <span>Applications Pipeline</span>
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
              <Space>
                <BookOutlined />
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
            key: "profile",
            label: (
              <Space>
                <IdcardOutlined />
                <span>Profile Details (Naukri 360°)</span>
              </Space>
            ),
            children: (
              <NaukriProfileView onOpenProfileBuilder={() => setIsProfileModalOpen(true)} />
            ),
          },
          {
            key: "alerts",
            label: (
              <Space>
                <BellOutlined />
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
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Receive daily WhatsApp &amp; Email alerts when relevant corporate jobs are posted.
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddAlert(!showAddAlert)}
                    style={{ fontWeight: 600, borderRadius: 8 }}
                  >
                    Create Job Alert
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
                        icon={<CheckCircleFilled />}
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
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            setJobAlerts((prev) => prev.filter((a) => a.id !== alert.id))
                          }
                        />
                      </Space>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Profile Builder & Resume Builder Modals */}
      {isProfileModalOpen && (
        <ProfileBuilderModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {isResumeBuilderOpen && (
        <ResumeBuilderModal
          isOpen={isResumeBuilderOpen}
          onClose={() => setIsResumeBuilderOpen(false)}
        />
      )}
    </div>
  );
}
