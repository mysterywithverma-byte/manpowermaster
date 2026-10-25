"use client";

import React, { useState } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { monthlyToLpa, lpaToMonthly, formatMonthlySalary } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Alert,
  Result,
  Card,
  Space,
  Typography,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  UploadOutlined,
  FilePdfOutlined,
  CheckCircleFilled,
  LockOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface ApplyJobModalProps {
  job: MockJob | null;
  onClose: () => void;
  onAppliedSuccessfully: () => void;
  onOpenAuth?: () => void;
}

export function ApplyJobModal({
  job,
  onClose,
  onAppliedSuccessfully,
  onOpenAuth,
}: ApplyJobModalProps) {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [experienceYears, setExperienceYears] = useState("2");
  const [noticePeriod, setNoticePeriod] = useState(user?.noticePeriod || "Immediate");
  const [expectedCtc, setExpectedCtc] = useState(user?.expectedCtc ? String(user.expectedCtc) : "");
  const [expectedMonthly, setExpectedMonthly] = useState(
    user?.expectedCtc ? String(lpaToMonthly(Number(user.expectedCtc))) : ""
  );
  const [currentCompany, setCurrentCompany] = useState(user?.companyName || "");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [coverNote, setCoverNote] = useState("");

  const [uploadingResume, setUploadingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.noticePeriod) setNoticePeriod(user.noticePeriod);
      if (user.expectedCtc) {
        setExpectedCtc(String(user.expectedCtc));
        setExpectedMonthly(String(lpaToMonthly(Number(user.expectedCtc))));
      }
      if (user.companyName) setCurrentCompany(user.companyName);
      if (user.resumeUrl) setResumeUrl(user.resumeUrl);
      if (user.resumeFileName) setResumeFileName(user.resumeFileName);
    }
  }, [user]);

  if (!job) return null;

  const handleFileUpload = async (file: File) => {
    setError("");

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Invalid format. Please upload a PDF or DOCX resume.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit. Please upload a smaller document.");
      return false;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setResumeUrl(data.url);
        setResumeFileName(data.fileName);
      } else {
        setError(data.error || "Failed to upload resume.");
      }
    } catch {
      setError("Resume upload failed. Please try again.");
    } finally {
      setUploadingResume(false);
    }
    return false; // prevent default upload
  };

  const handleSubmit = async () => {
    if (!user) {
      if (onOpenAuth) {
        onOpenAuth();
        onClose();
      } else {
        setError("Please sign in or create an account to apply for jobs.");
      }
      return;
    }

    if (!resumeUrl) {
      setError("Please attach or upload your resume (PDF/DOCX max 5MB) before applying.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          applicantId: user._id,
          coverNote,
          resumeUrl,
          applicantDetails: {
            name: name || user.name,
            email: email || user.email,
            phone: phone || user.phone || "",
            experienceYears: Number(experienceYears) || 0,
            noticePeriod,
            expectedCtc: Number(expectedCtc) || 0,
            currentCompany,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 409) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#f59e0b", "#10b981"],
      });

      setTimeout(() => {
        onAppliedSuccessfully();
        onClose();
      }, 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      styles={{ body: { padding: 24 } }}
    >
      {!user ? (
        <Result
          icon={<LockOutlined style={{ color: "#ea580c" }} />}
          title={`Sign in to Apply for ${job.title}`}
          subTitle={
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Corporate employers at <strong style={{ color: "#0f172a" }}>{job.company}</strong>{" "}
              require verified applicant credentials. Sign in or register to submit with 1-click.
            </span>
          }
          extra={[
            <Button
              type="primary"
              key="auth"
              icon={<LoginOutlined />}
              onClick={() => {
                onClose();
                onOpenAuth?.();
              }}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              Sign In / Register
            </Button>,
            <Button key="cancel" onClick={onClose} style={{ borderRadius: 8 }}>
              Maybe Later
            </Button>,
          ]}
        />
      ) : submitted ? (
        <Result
          status="success"
          title="Application Dispatched!"
          subTitle={
            <span>
              Your profile, resume, and details have been transmitted directly to the recruiter team at{" "}
              <strong style={{ color: "#ea580c" }}>{job.company}</strong>.
            </span>
          }
        />
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#ea580c",
                letterSpacing: 0.5,
              }}
            >
              Direct 1-Click Application
            </span>
            <Title level={3} style={{ margin: "2px 0", fontSize: 20, color: "#0f172a" }}>
              Apply for {job.title}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              at <strong style={{ color: "#334155" }}>{job.company}</strong> • {job.location}
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 14, borderRadius: 8 }}
            />
          )}

          {/* Attached Resume Status Card */}
          <Card
            size="small"
            style={{
              backgroundColor: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Space align="center" size={10}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: "#ea580c",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  <FilePdfOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {resumeFileName || "No resume uploaded"}
                  </div>
                  <div style={{ fontSize: 11, color: resumeUrl ? "#15803d" : "#c2410c", fontWeight: 600 }}>
                    {resumeUrl ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircleFilled />
                        <span>Attached &amp; ready to transmit</span>
                      </span>
                    ) : (
                      "Please upload your PDF/DOCX resume"
                    )}
                  </div>
                </div>
              </Space>

              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".pdf,.doc,.docx"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadingResume}
                  style={{ fontWeight: 600, borderRadius: 8 }}
                >
                  {resumeUrl ? "Change Resume" : "Upload Resume"}
                </Button>
              </Upload>
            </div>
          </Card>

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Full Name
                </Text>
                <Input
                  size="middle"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Email Address
                </Text>
                <Input
                  size="middle"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Phone / WhatsApp
                </Text>
                <Input
                  size="middle"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Notice Period
                </Text>
                <Select
                  size="middle"
                  style={{ width: "100%" }}
                  value={noticePeriod}
                  onChange={(val) => setNoticePeriod(val)}
                  options={[
                    { label: "Immediate Joiner", value: "Immediate" },
                    { label: "15 Days", value: "15 Days" },
                    { label: "30 Days", value: "30 Days" },
                    { label: "60 Days", value: "60 Days" },
                  ]}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Experience (Years)
                </Text>
                <Input
                  size="middle"
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Expected Monthly (₹/month)
                </Text>
                <Input
                  size="middle"
                  type="number"
                  placeholder="e.g. 35000"
                  value={expectedMonthly}
                  onChange={(e) => {
                    const mo = e.target.value;
                    setExpectedMonthly(mo);
                    if (mo && !isNaN(Number(mo))) {
                      setExpectedCtc(String(monthlyToLpa(Number(mo))));
                    } else {
                      setExpectedCtc("");
                    }
                  }}
                  prefix="₹"
                  suffix="/mo"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 12 }}>
                    Expected Annual CTC
                  </Text>
                  {expectedCtc && Number(expectedCtc) > 0 && (
                    <span style={{ fontSize: 10, color: "#ea580c", fontWeight: 700 }}>
                      Auto: {expectedCtc} LPA
                    </span>
                  )}
                </div>
                <Input
                  size="middle"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 4.2"
                  value={expectedCtc}
                  onChange={(e) => {
                    const lpa = e.target.value;
                    setExpectedCtc(lpa);
                    if (lpa && !isNaN(Number(lpa))) {
                      setExpectedMonthly(String(lpaToMonthly(Number(lpa))));
                    } else {
                      setExpectedMonthly("");
                    }
                  }}
                  suffix="LPA"
                />
              </div>
            </div>

            <div>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Cover Note / Pitch to HR Manager (Optional)
              </Text>
              <TextArea
                rows={3}
                placeholder="Briefly state why you're a great fit for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
            </div>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              style={{
                marginTop: 6,
                fontWeight: 700,
                borderRadius: 10,
              }}
            >
              Submit 1-Click Application
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
