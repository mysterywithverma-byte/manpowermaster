"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockJob, MockApplication } from "@/lib/mock-data";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  Card,
  Statistic,
  Row,
  Col,
  Select,
  Tag,
  Button,
  Avatar,
  Space,
  Typography,
  Alert,
  Tooltip,
} from "antd";
import {
  BankOutlined,
  PlusOutlined,
  TeamOutlined,
  CheckCircleFilled,
  ReloadOutlined,
  WhatsAppOutlined,
  FilePdfOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  FieldTimeOutlined,
  EditOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const { Text, Title } = Typography;

interface EmployerDashboardProps {
  onOpenPostJob: () => void;
  onOpenEditProfile?: () => void;
}

export function EmployerDashboard({
  onOpenPostJob,
  onOpenEditProfile,
}: EmployerDashboardProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [syncingJobs, setSyncingJobs] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const recruiterId = user?._id || "user-employer-1";
      const companyParam = user?.companyName
        ? `&company=${encodeURIComponent(user.companyName)}`
        : "";

      const [jobsRes, appsRes] = await Promise.all([
        fetch(`/api/jobs?postedBy=${recruiterId}${companyParam}`),
        fetch(`/api/applications?recruiterId=${recruiterId}`),
      ]);

      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();

      if (jobsData.success) {
        setJobs(jobsData.data || []);
      }
      if (appsData.success) {
        setApplications(appsData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSyncLiveJobs = async () => {
    setSyncingJobs(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/external-jobs", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message || "Synced fresh live jobs!");
        fetchData();
      } else {
        setSyncMessage("Could not sync external jobs.");
      }
    } catch {
      setSyncMessage("Sync error occurred.");
    } finally {
      setSyncingJobs(false);
    }
  };

  const handleUpdateStatus = async (
    appId: string,
    newStatus: MockApplication["status"]
  ) => {
    try {
      setStatusUpdatingId(appId);
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredApps =
    selectedJobId === "all"
      ? applications
      : applications.filter((a) => {
          const jId = typeof a.jobId === "object" ? a.jobId?._id : a.jobId;
          return jId === selectedJobId;
        });

  const totalHired = applications.filter((a) => a.status === "Hired").length;
  const totalShortlisted = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interviewed"
  ).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Top Banner Card */}
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
            gap: 16,
          }}
        >
          <Space align="start" size={16}>
            <Avatar
              shape="square"
              size={58}
              icon={<BankOutlined />}
              style={{
                backgroundColor: "#ea580c",
                color: "#ffffff",
                fontSize: 26,
                borderRadius: 12,
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Title level={3} style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
                  {user?.companyName || "Corporate Employer"} Talent Console
                </Title>
                <VerifiedBadge size="sm" label="Verified Employer" />
              </div>
              <Text type="secondary" style={{ fontSize: 13, display: "block", marginTop: 4 }}>
                Lead Recruiter: <strong style={{ color: "#334155" }}>{user?.name}</strong> ({user?.email})
              </Text>
            </div>
          </Space>

          <Space wrap size={10}>
            {onOpenEditProfile && (
              <Button
                icon={<EditOutlined />}
                onClick={onOpenEditProfile}
                style={{
                  fontWeight: 600,
                  borderRadius: 8,
                  borderColor: "#fed7aa",
                  backgroundColor: "#fff7ed",
                  color: "#ea580c",
                }}
              >
                Company Profile &amp; Branches
              </Button>
            )}
            <Button
              icon={<ReloadOutlined spin={syncingJobs} />}
              loading={syncingJobs}
              onClick={handleSyncLiveJobs}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              Sync Live Jobs
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenPostJob}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              Post Job Opening
            </Button>
          </Space>
        </div>

        {syncMessage && (
          <Alert
            message={syncMessage}
            type="success"
            showIcon
            style={{ marginTop: 14, borderRadius: 8 }}
          />
        )}

        {/* Statistics Row */}
        <Row gutter={[16, 16]} style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <Statistic title="Active Openings" value={jobs.length} valueStyle={{ color: "#0f172a", fontWeight: 800 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <Statistic title="Total Candidates" value={applications.length} valueStyle={{ color: "#ea580c", fontWeight: 800 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <Statistic title="In Interviews" value={totalShortlisted} valueStyle={{ color: "#eab308", fontWeight: 800 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <Statistic title="Hired / Selected" value={totalHired} valueStyle={{ color: "#16a34a", fontWeight: 800 }} />
            </Card>
          </Col>
        </Row>

        {/* Zoho Company Profile & Multi-Branch Network Card */}
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <BankOutlined style={{ color: "#ea580c", fontSize: 16 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  {user?.employerDetails?.brandName || user?.companyName || "Corporate Profile"} — Company Details &amp; Office Network
                </span>
                {user?.employerDetails?.gstin && (
                  <Tag color="green" style={{ borderRadius: 4, fontSize: 10, margin: 0 }}>
                    GST: {user.employerDetails.gstin}
                  </Tag>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {user?.employerDetails?.industry || "IT & Software Services"} •{" "}
                {user?.employerDetails?.companyType || "Private Limited"} •{" "}
                {user?.employerDetails?.companySize || "Growth Entity"}
                {user?.employerDetails?.cin ? ` • CIN: ${user.employerDetails.cin}` : ""}
              </div>
            </div>

            {onOpenEditProfile && (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={onOpenEditProfile}
                style={{ fontWeight: 600, borderRadius: 6 }}
              >
                Manage Branches &amp; Profile
              </Button>
            )}
          </div>

          {/* Branches Network Display */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <EnvironmentOutlined style={{ color: "#ea580c" }} />
            <span>
              Hiring Branch Network ({(user?.employerDetails?.branches || []).length || 1} Locations Configured):
            </span>
          </div>

          <Row gutter={[12, 12]}>
            {(user?.employerDetails?.branches && user.employerDetails.branches.length > 0
              ? user.employerDetails.branches
              : [
                  {
                    id: "br-default-hq",
                    branchName: `${user?.employerDetails?.brandName || user?.companyName || "Corporate"} Headquarter`,
                    branchType: "Headquarters",
                    city: user?.location || "Bengaluru",
                    state: "Karnataka",
                    address: user?.employerDetails?.officeAddress || "Main Corporate Center",
                    contactPerson: user?.name,
                    contactPhone: user?.phone,
                    isHeadquarters: true,
                  },
                ]
            ).map((b: any) => (
              <Col xs={24} sm={12} md={8} key={b.id}>
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong style={{ fontSize: 12, color: "#1e293b" }}>{b.branchName}</strong>
                      <Tag
                        color={b.isHeadquarters || b.branchType === "Headquarters" ? "orange" : "blue"}
                        style={{ borderRadius: 4, fontSize: 10, margin: 0 }}
                      >
                        {b.branchType || "Branch"}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>
                      <EnvironmentOutlined style={{ color: "#ea580c", marginRight: 4 }} />
                      {b.city} {b.state ? `, ${b.state}` : ""} {b.pincode ? `- ${b.pincode}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={b.address}
                    >
                      {b.address}
                    </div>
                  </div>

                  {(b.contactPerson || b.contactPhone) && (
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 6, paddingTop: 4, borderTop: "1px dashed #f1f5f9" }}>
                      HR: {b.contactPerson} {b.contactPhone ? `(${b.contactPhone})` : ""}
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Card>

      {/* Candidate Pipeline Section */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>
              Candidate Pipeline &amp; Stage Board
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Review applicant resumes, message via WhatsApp, and manage hiring stages.
            </Text>
          </div>

          <Select
            value={selectedJobId}
            onChange={(val) => setSelectedJobId(val)}
            style={{ width: 240 }}
            options={[
              { value: "all", label: `All Positions (${applications.length})` },
              ...jobs.map((j) => ({
                value: j._id,
                label: `${j.title} (${j.company})`,
              })),
            ]}
          />
        </div>

        {/* Candidate List Cards */}
        {loading ? (
          <Card style={{ textAlign: "center", padding: 32, borderRadius: 14 }}>
            <Text type="secondary">Loading candidate applications...</Text>
          </Card>
        ) : filteredApps.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 36, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <TeamOutlined style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>No applicants yet for this filter</div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Candidates applying from the job board will appear here in real-time.
            </Text>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredApps.map((app) => {
              const jobTitle = typeof app.jobId === "object" ? app.jobId?.title : "Software Engineer";
              const companyName = typeof app.jobId === "object" ? app.jobId?.company : "Company";
              const phoneClean = app.applicantDetails?.phone?.replace(/[^0-9]/g, "") || "919876543210";

              return (
                <Card
                  key={app._id}
                  style={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  styles={{ body: { padding: 18 } }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 14,
                    }}
                  >
                    {/* Candidate Details */}
                    <Space align="start" size={14}>
                      <Avatar
                        size={44}
                        style={{ backgroundColor: "#ea580c", fontWeight: 800, fontSize: 18 }}
                      >
                        {app.applicantDetails?.name?.charAt(0) || "C"}
                      </Avatar>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                            {app.applicantDetails?.name}
                          </Text>
                          <Tag color="green" style={{ borderRadius: 6, fontWeight: 700 }}>
                            {app.applicantDetails?.noticePeriod || "Immediate Joiner"}
                          </Tag>
                        </div>

                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          Applied for: <strong style={{ color: "#334155" }}>{jobTitle}</strong> ({companyName})
                        </div>

                        <Space
                          size={12}
                          split={<span style={{ color: "#cbd5e1" }}>•</span>}
                          style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                        >
                          <span>
                            <MailOutlined /> {app.applicantDetails?.email}
                          </span>
                          {app.applicantDetails?.phone && (
                            <span>
                              <PhoneOutlined /> {app.applicantDetails?.phone}
                            </span>
                          )}
                          <span>Exp: {app.applicantDetails?.experienceYears} yrs</span>
                          {app.applicantDetails?.expectedCtc && (
                            <strong style={{ color: "#16a34a" }}>
                              CTC: ₹{app.applicantDetails?.expectedCtc} LPA
                            </strong>
                          )}
                        </Space>
                      </div>
                    </Space>

                    {/* Stage controller & WhatsApp */}
                    <Space size={8} wrap>
                      <Button
                        size="middle"
                        icon={<WhatsAppOutlined style={{ color: "#16a34a", fontSize: 16 }} />}
                        href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                          `Hi ${app.applicantDetails?.name}, this is ${user?.companyName || "HR"} regarding your application for ${jobTitle}.`
                        )}`}
                        target="_blank"
                        style={{
                          borderColor: "#bbf7d0",
                          backgroundColor: "#f0fdf4",
                          fontWeight: 600,
                          borderRadius: 6,
                        }}
                      >
                        WhatsApp
                      </Button>

                      <Select
                        size="middle"
                        value={app.status}
                        loading={statusUpdatingId === app._id}
                        onChange={(val) => handleUpdateStatus(app._id, val)}
                        style={{ width: 140 }}
                        options={[
                          { label: "Applied", value: "Applied" },
                          { label: "Shortlisted", value: "Shortlisted" },
                          { label: "Interviewing", value: "Interviewed" },
                          { label: "Hired / Offer", value: "Hired" },
                          { label: "Rejected", value: "Rejected" },
                        ]}
                      />
                    </Space>
                  </div>

                  {/* Cover note & Resume */}
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: "1px dashed #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <Text italic type="secondary" style={{ fontSize: 12 }}>
                      &ldquo;{app.coverNote || "Eager to discuss this position and contribute to the team."}&rdquo;
                    </Text>

                    <Button
                      size="small"
                      icon={<FilePdfOutlined style={{ color: "#ea580c" }} />}
                      href={app.resumeUrl || "https://example.com/resume.pdf"}
                      target="_blank"
                      style={{ fontWeight: 600, borderRadius: 6 }}
                    >
                      View Resume (PDF)
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Posted Jobs Grid */}
      <div>
        <Title level={4} style={{ margin: "0 0 16px", fontSize: 18, color: "#0f172a" }}>
          Active Open Positions ({jobs.length})
        </Title>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {jobs.map((job) => (
            <Card
              key={job._id}
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              styles={{ body: { padding: 18 } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Title level={5} ellipsis style={{ margin: 0, fontSize: 14, color: "#0f172a" }}>
                  {job.title}
                </Title>
                <Tag color="green" style={{ borderRadius: 6, fontWeight: 700 }}>
                  Active
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {job.company} • {job.location}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 10 }}>
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#94a3b8",
                  paddingTop: 8,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <span>{job.applicantsCount || 0} Applicants</span>
                <span>{timeAgo(job.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
