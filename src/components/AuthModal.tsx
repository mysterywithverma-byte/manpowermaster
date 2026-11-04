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
  LockOutlined,
  ExclamationCircleOutlined,
  ThunderboltFilled,
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isFallbackOtpMode, setIsFallbackOtpMode] = useState(false);
  const [showFirebaseConsoleHelp, setShowFirebaseConsoleHelp] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const phoneInputRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError("");
      setOtpSent(false);
      setOtpCode("");
      setPhoneNumber("");
      setConfirmationResult(null);
      setIsFallbackOtpMode(false);
      setShowFirebaseConsoleHelp(false);
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, initialRole]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      resetRecaptcha();
    };
  }, []);

  const resetRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {}
      recaptchaVerifierRef.current = null;
    }
    if (typeof document !== "undefined") {
      const wrapper = document.getElementById("recaptcha-wrapper");
      if (wrapper) wrapper.innerHTML = "";
    }
  };

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Initialize invisible reCAPTCHA with unique dynamic DOM target
  const setupRecaptcha = () => {
    if (typeof window === "undefined") return null;

    // Reuse existing active instance if available
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    try {
      let wrapper = document.getElementById("recaptcha-wrapper");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.id = "recaptcha-wrapper";
        document.body.appendChild(wrapper);
      }
      wrapper.innerHTML = "";

      const targetDiv = document.createElement("div");
      targetDiv.id = `recaptcha-target-${Date.now()}`;
      wrapper.appendChild(targetDiv);

      const verifier = new RecaptchaVerifier(auth, targetDiv, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try sending OTP again.");
          resetRecaptcha();
        },
      });

      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err: any) {
      console.error("Recaptcha init error:", err);
      resetRecaptcha();
      return null;
    }
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
        throw new Error("Security verification failed. Please refresh the page.");
      }

      const formattedPhone = `+91${cleaned}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setIsFallbackOtpMode(false);
      setResendCountdown(60);
      message.success(`OTP code sent to +91 ${cleaned}`);
    } catch (err: any) {
      console.error("Phone Auth Error Details:", err);
      
      let userMsg = `Failed to send OTP (${err?.code || err?.message || "Error"}).`;
      
      if (err.code === "auth/invalid-phone-number") {
        userMsg = "Invalid phone number format. Please check the 10 digits.";
      } else if (err.code === "auth/operation-not-allowed") {
        userMsg = "Firebase Console me 'Phone' sign-in method abhi ENABLE nahi hai. Please Firebase Console -> Authentication -> Sign-in method -> Phone Enable karein.";
        setShowFirebaseConsoleHelp(true);
        setIsFallbackOtpMode(true);
      } else if (err.code === "auth/too-many-requests") {
        userMsg = "Too many attempts on this number. Please wait 2 minutes or use Test OTP.";
        setIsFallbackOtpMode(true);
      } else if (err.code === "auth/quota-exceeded") {
        userMsg = "Daily SMS limit reached in Firebase. Use Test OTP (123456) to login.";
        setIsFallbackOtpMode(true);
      } else if (err.code === "auth/invalid-app-credential" || err.code === "auth/app-not-authorized") {
        userMsg = "Firebase configuration: Enable Phone Auth in Firebase Console (manpowermaster). Use Test OTP (123456) to proceed.";
        setShowFirebaseConsoleHelp(true);
        setIsFallbackOtpMode(true);
      } else {
        userMsg = `${err.message || err.code || "Verification service not ready"}. Click 'Continue with Test OTP (123456)' below to proceed immediately.`;
        setIsFallbackOtpMode(true);
      }
      
      setError(userMsg);
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Instant Test / Simulation OTP Trigger
  const handleProceedWithTestOtp = () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setError("");
    setConfirmationResult(null);
    setIsFallbackOtpMode(true);
    setOtpSent(true);
    setOtpCode("123456");
    message.info("Test OTP 123456 generated! Click 'Verify OTP & Login'.");
  };

  // Verify OTP & Synchronize with Database
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let firebaseUid = `phone-verified-${Date.now()}`;

      if (confirmationResult) {
        // Real Firebase confirmation
        const result = await confirmationResult.confirm(otpCode);
        firebaseUserUid: firebaseUid = result.user.uid;
      } else if (isFallbackOtpMode) {
        // Fallback test verification code check
        if (otpCode !== "123456") {
          throw new Error("Invalid Test OTP. Please enter '123456' to proceed.");
        }
        firebaseUid = `test-phone-${phoneNumber.replace(/[^0-9]/g, "")}`;
      } else {
        throw new Error("OTP session expired. Please request a new OTP.");
      }

      const formattedPhone = `+91 ${phoneNumber.replace(/[^0-9]/g, "")}`;

      // Synchronize with MongoDB database
      const res = await fetch("/api/auth/phone-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          role,
          firebaseUid,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Save user session in context & LocalStorage
        loginWithUser(data.user);

        message.success(data.isNewUser ? "Account created successfully!" : "Logged in successfully!");
        onClose();
      } else {
        throw new Error(data.error || "Failed to synchronize user account");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please enter the correct 6-digit code.");
      } else if (err.code === "auth/code-expired") {
        setError("This OTP has expired. Please click 'Resend OTP'.");
      } else {
        setError(err.message || "OTP verification failed. Please try again.");
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
      <div id="recaptcha-wrapper"></div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            color: "#ffffff",
            fontSize: 24,
            boxShadow: "0 8px 16px -4px rgba(234, 88, 12, 0.35)",
            marginBottom: 12,
          }}
        >
          {role === "employer" ? <BankOutlined /> : <PhoneOutlined />}
        </div>

        <Title level={3} style={{ margin: "0 0 6px", fontSize: 22, color: "#0f172a", fontWeight: 700 }}>
          {role === "employer" ? "Employer Sign In / Register" : "Candidate Sign In / Register"}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {role === "employer"
            ? "Log in with your Mobile Number to post jobs & hire staff"
            : "Log in with your Mobile Number to apply for jobs & get calls"}
        </Text>
      </div>

      {/* Account Type Selector (Employer vs Candidate) */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 6 }}>
          Select profile type:
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
                  <span style={{ fontWeight: 700 }}>Employer / HR</span>
                </Space>
              ),
              value: "employer",
            },
            {
              label: (
                <Space size={6} style={{ padding: "4px 0" }}>
                  <UserOutlined style={{ color: role === "seeker" ? "#ea580c" : undefined }} />
                  <span style={{ fontWeight: 700 }}>Job Candidate</span>
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

      {/* Firebase Console Setup Alert if provider is disabled */}
      {showFirebaseConsoleHelp && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 11,
            color: "#1e40af",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            ⚡ Firebase Console Setup Steps for Real SMS:
          </div>
          <div>
            1. Open Firebase Console: <a href="https://console.firebase.google.com/project/manpowermaster/authentication/providers" target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: 700 }}>Authentication &gt; Sign-in method</a>
          </div>
          <div>2. Click &quot;Phone&quot; &gt; Toggle &quot;Enable&quot; &gt; Click &quot;Save&quot;.</div>
          <div>3. In &quot;Phone numbers for testing&quot;, add <code>+91 7973369644</code> with code <code>123456</code> for free testing!</div>
        </div>
      )}

      {/* ─── PRIMARY: MOBILE NUMBER OTP AUTHENTICATION ─── */}
      {!otpSent ? (
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
            Mobile Number (10 Digits)
          </label>
          <Input
            ref={phoneInputRef}
            size="large"
            prefix={<span style={{ fontWeight: 700, color: "#475569", marginRight: 6 }}>🇮🇳 +91</span>}
            placeholder="Enter mobile number"
            maxLength={10}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
            onPressEnter={handleSendOtp}
            style={{ borderRadius: 10, marginBottom: 12 }}
          />

          {/* Value Prop Checklist */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 11,
              color: "#475569",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />
              <span>Instant 6-digit SMS OTP verification (No password needed)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />
              <span>Existing account data &amp; profile restored automatically</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SafetyCertificateOutlined style={{ color: "#ea580c", fontSize: 12 }} />
              <span>Direct WhatsApp alerts on application &amp; recruiter calls</span>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            icon={<PhoneOutlined />}
            onClick={handleSendOtp}
            style={{
              height: 48,
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              background: "#ea580c",
              borderColor: "#ea580c",
              boxShadow: "0 2px 6px rgba(234, 88, 12, 0.3)",
              marginBottom: isFallbackOtpMode ? 8 : 0,
            }}
          >
            Get OTP to Continue
          </Button>

          {/* Instant Test OTP / Fallback Bypass button if Firebase fails or in test */}
          {isFallbackOtpMode && (
            <Button
              type="dashed"
              block
              size="middle"
              icon={<ThunderboltFilled style={{ color: "#f59e0b" }} />}
              onClick={handleProceedWithTestOtp}
              style={{
                height: 40,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                borderColor: "#f59e0b",
                color: "#b45309",
                background: "#fef3c7",
              }}
            >
              Continue with Test OTP (123456)
            </Button>
          )}
        </div>
      ) : (
        /* OTP Verification Step */
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
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
            <Text style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>
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
            style={{ marginBottom: 18 }}
          />

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={handleVerifyOtp}
            style={{
              height: 48,
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              background: "#16a34a",
              borderColor: "#16a34a",
              marginBottom: 10,
            }}
          >
            Verify OTP &amp; Login
          </Button>

          <div style={{ marginTop: 8 }}>
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
          height: 44,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          color: "#1e293b",
          borderColor: "#cbd5e1",
        }}
      >
        Sign in with Google
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
