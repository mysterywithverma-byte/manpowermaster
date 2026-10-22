"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Modal,
  Segmented,
  Button,
  Alert,
  Divider,
  Space,
  Typography,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  GoogleOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetailedRegistration?: () => void;
  initialRole?: "seeker" | "employer";
  initialMode?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onOpenDetailedRegistration,
  initialRole = "seeker",
}: AuthModalProps) {
  const { loginAsDemo } = useAuth();
  const [role, setRole] = useState<"seeker" | "employer">(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError("");
    }
  }, [isOpen, initialRole]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("authError") === "google_env_missing") {
        setError("Google Sign-In configuration missing. Please verify GOOGLE_CLIENT_ID.");
      } else if (params.get("auth_error")) {
        setError(params.get("auth_error") || "Google Sign-In failed.");
      }
    }
  }, [isOpen]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = `/api/auth/google?role=${role}`;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      styles={{
        body: { padding: "28px 24px" },
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 50,
            height: 50,
            borderRadius: 14,
            background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            color: "#ffffff",
            fontSize: 24,
            boxShadow: "0 8px 16px -4px rgba(234, 88, 12, 0.35)",
            marginBottom: 12,
          }}
        >
          {role === "employer" ? <BankOutlined /> : <UserOutlined />}
        </div>

        <Title level={3} style={{ margin: "0 0 6px", fontSize: 22, color: "#0f172a", fontWeight: 700 }}>
          {role === "employer" ? "Employer & Recruiter Portal" : "Job Seeker Sign In"}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {role === "employer"
            ? "Post jobs, search candidate resumes & hire verified talent"
            : "Direct interview calls from top hiring companies • 100% Free"}
        </Text>
      </div>

      {/* Account Type Selector */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 6 }}>
          Select your profile type:
        </Text>
        <Segmented
          block
          size="large"
          value={role}
          onChange={(val) => setRole(val as "seeker" | "employer")}
          options={[
            {
              label: (
                <Space size={6} style={{ padding: "4px 0" }}>
                  <UserOutlined style={{ color: role === "seeker" ? "#ea580c" : undefined }} />
                  <span style={{ fontWeight: 600 }}>Candidate / Seeker</span>
                </Space>
              ),
              value: "seeker",
            },
            {
              label: (
                <Space size={6} style={{ padding: "4px 0" }}>
                  <BankOutlined style={{ color: role === "employer" ? "#ea580c" : undefined }} />
                  <span style={{ fontWeight: 600 }}>Employer / HR</span>
                </Space>
              ),
              value: "employer",
            },
          ]}
        />
      </div>

      {/* Feature Highlights for Selected Role */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 20,
        }}
      >
        {role === "seeker" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155" }}>
              <CheckCircleFilled style={{ color: "#16a34a", fontSize: 14 }} />
              <span>Full Naukri 360° Profile & automated resume parser</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155" }}>
              <CheckCircleFilled style={{ color: "#16a34a", fontSize: 14 }} />
              <span>Fresher or Experienced career track customization</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
              <SafetyCertificateOutlined style={{ fontSize: 14 }} />
              <span>100% Free • Verified companies • Real-time alerts</span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155" }}>
              <CheckCircleFilled style={{ color: "#ea580c", fontSize: 14 }} />
              <span>Company verification (GSTIN / CIN / Headquarter City)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155" }}>
              <CheckCircleFilled style={{ color: "#ea580c", fontSize: 14 }} />
              <span>Unlimited job vacancy postings with instant live indexing</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#ea580c", fontWeight: 600 }}>
              <SafetyCertificateOutlined style={{ fontSize: 14 }} />
              <span>Direct candidate resume access & interview scheduler</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Primary Google Login Button */}
      <Button
        type="default"
        block
        size="large"
        loading={loading}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8, verticalAlign: "middle" }}>
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.43l4.03-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
        }
        onClick={handleGoogleSignIn}
        style={{
          height: 52,
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: "#1e293b",
          borderColor: "#cbd5e1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Continue with Google
      </Button>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          By continuing, you agree to Manpower Master Terms of Service & Privacy Policy
        </Text>
      </div>

      {/* Quick Demo Switcher for Testing */}
      <Divider style={{ margin: "20px 0 14px" }}>
        <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Quick Demo Login
        </Text>
      </Divider>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Button
          size="middle"
          icon={<UserOutlined />}
          onClick={() => {
            loginAsDemo("seeker");
            onClose();
          }}
          style={{ fontSize: 12, fontWeight: 600, borderRadius: 8 }}
        >
          Demo Candidate
        </Button>
        <Button
          size="middle"
          icon={<BankOutlined />}
          onClick={() => {
            loginAsDemo("employer");
            onClose();
          }}
          style={{ fontSize: 12, fontWeight: 600, borderRadius: 8 }}
        >
          Demo Employer
        </Button>
      </div>
    </Modal>
  );
}
