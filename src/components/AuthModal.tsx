"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Modal,
  Segmented,
  Button,
  Alert,
  Divider,
  Space,
  Typography,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const { Text, Title } = Typography;

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
  initialRole = "seeker",
}: AuthModalProps) {
  const { loginAsDemo, loginWithUser } = useAuth();
  const [role, setRole] = useState<"seeker" | "employer">(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone Auth State
  const [authMethod, setAuthMethod] = useState<"phone" | "google">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError("");
      setOtpSent(false);
      setOtpCode("");
      setPhoneNumber("");
      setConfirmationResult(null);
    }
  }, [isOpen, initialRole]);

  // Clean up recaptcha on unmount/close
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch {}
      }
    };
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Initialize invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (typeof window === "undefined") return null;

    if (!recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try sending OTP again.");
          },
        });
      } catch (err: any) {
        console.error("Recaptcha init error:", err);
      }
    }
    return recaptchaVerifierRef.current;
  };

  // Send SMS OTP
  const handleSendOtp = async () => {
    setError("");
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");

    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const verifier = setupRecaptcha();
      if (!verifier) {
        throw new Error("reCAPTCHA initialization failed. Please refresh the page.");
      }

      const formattedPhone = `+91${cleaned}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setResendCountdown(60);
      message.success(`OTP sent to +91 ${cleaned}`);
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      let userMsg = "Failed to send OTP. Please check your phone number.";
      if (err.code === "auth/invalid-phone-number") {
        userMsg = "Invalid phone number format.";
      } else if (err.code === "auth/too-many-requests") {
        userMsg = "Too many attempts. Please try again after some time.";
      } else if (err.code === "auth/quota-exceeded") {
        userMsg = "SMS quota exceeded for today. Please try again later or use Google Login.";
      }
      setError(userMsg);

      // Reset recaptcha on error so user can retry
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Synchronize with MongoDB Database
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otpCode);
      const firebaseUser = result.user;

      const formattedPhone = `+91 ${phoneNumber.replace(/[^0-9]/g, "")}`;

      // Sync verified phone with backend MongoDB Database
      const res = await fetch("/api/auth/phone-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          role,
          firebaseUid: firebaseUser.uid,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Save user session in State & LocalStorage
        loginWithUser(data.user);

        message.success(data.isNewUser ? "Account created successfully!" : "Welcome back!");
        onClose();
      } else {
        throw new Error(data.error || "Failed to synchronize profile");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please enter the correct 6-digit code.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please click 'Resend OTP'.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = `/api/auth/google?role=${role}`;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={440}
      centered
      styles={{
        body: { padding: "28px 24px" },
      }}
    >
      {/* Invisible reCAPTCHA container required by Firebase */}
      <div id="recaptcha-container"></div>

      {/* Header */}
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
          {role === "employer" ? "Employer Sign In" : "Candidate Sign In"}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {role === "employer"
            ? "Post verified jobs, review applicant resumes & hire talent"
            : "Find verified corporate jobs & get direct recruiter calls"}
        </Text>
      </div>

      {/* Account Type Selector (Employer vs Candidate) */}
      <div style={{ marginBottom: 18 }}>
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
                  <BankOutlined style={{ color: role === "employer" ? "#ea580c" : undefined }} />
                  <span style={{ fontWeight: 700 }}>Employer</span>
                </Space>
              ),
              value: "employer",
            },
            {
              label: (
                <Space size={6} style={{ padding: "4px 0" }}>
                  <UserOutlined style={{ color: role === "seeker" ? "#ea580c" : undefined }} />
                  <span style={{ fontWeight: 700 }}>Candidate</span>
                </Space>
              ),
              value: "seeker",
            },
          ]}
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
          closable
          onClose={() => setError("")}
        />
      )}

      {/* ─── PHONE OTP AUTHENTICATION FLOW ─── */}
      {!otpSent ? (
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
            Mobile Number (10 Digits)
          </label>
          <Input
            size="large"
            prefix={<span style={{ fontWeight: 700, color: "#64748b", marginRight: 4 }}>+91</span>}
            placeholder="Enter mobile number"
            maxLength={10}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
            onPressEnter={handleSendOtp}
            style={{ borderRadius: 10, marginBottom: 12 }}
          />

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            icon={<PhoneOutlined />}
            onClick={handleSendOtp}
            style={{
              height: 46,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#ea580c",
              borderColor: "#ea580c",
              boxShadow: "0 2px 4px rgba(234, 88, 12, 0.25)",
            }}
          >
            Send OTP Verification SMS
          </Button>
        </div>
      ) : (
        /* OTP Verification Step */
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
                setError("");
              }}
              style={{ fontSize: 12, color: "#64748b" }}
            >
              Change Number
            </Button>
            <Text style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>
              Sent to +91 {phoneNumber}
            </Text>
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
            Enter 6-Digit OTP Code
          </label>

          <Input.OTP
            length={6}
            size="large"
            value={otpCode}
            onChange={(val) => setOtpCode(val)}
            style={{ marginBottom: 16 }}
          />

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={handleVerifyOtp}
            style={{
              height: 46,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#16a34a",
              borderColor: "#16a34a",
              marginBottom: 10,
            }}
          >
            Verify &amp; Continue
          </Button>

          <div style={{ marginTop: 6 }}>
            {resendCountdown > 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Resend OTP in <strong>{resendCountdown}s</strong>
              </Text>
            ) : (
              <Button type="link" size="small" onClick={handleSendOtp} style={{ fontSize: 12 }}>
                Didn&apos;t receive code? Resend OTP
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Alternative Login Divider */}
      <Divider style={{ margin: "18px 0 14px", fontSize: 12, color: "#94a3b8" }}>
        or continue with
      </Divider>

      {/* Google Login Option */}
      <Button
        type="default"
        block
        size="large"
        loading={loading}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8, verticalAlign: "middle" }}>
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
          height: 46,
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          color: "#1e293b",
          borderColor: "#cbd5e1",
        }}
      >
        Continue with Google
      </Button>

      {/* Quick Demo Switcher for Testing */}
      <Divider style={{ margin: "16px 0 10px" }}>
        <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Quick Demo Login
        </Text>
      </Divider>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
      </div>
    </Modal>
  );
}
