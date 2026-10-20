"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  Building2,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetailedRegistration?: () => void;
}

export function AuthModal({ isOpen, onClose, onOpenDetailedRegistration }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("authError") === "google_env_missing") {
        setError(
          "Google Sign-In requires GOOGLE_CLIENT_ID in Vercel environment variables. Please use Email below."
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Redirect to real Google OAuth 2.0 flow
    window.location.href = `/api/auth/google?role=${role}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const result = await login(email);
        const ok = typeof result === "boolean" ? result : result.success;
        if (ok) {
          onClose();
        } else {
          const errMsg = typeof result === "object" && result.error ? result.error : "Could not authenticate account.";
          setError(errMsg);
        }
      } else {
        const result = await register({
          name,
          email,
          role,
          companyName: role === "employer" ? companyName : undefined,
        });
        const ok = typeof result === "boolean" ? result : result.success;
        if (ok) {
          onClose();
        } else {
          const errMsg = typeof result === "object" && result.error ? result.error : "Registration could not be completed.";
          setError(errMsg);
        }
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white border-2 border-orange-400 shadow-2xl p-6 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-orange-600 text-white mb-2 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {mode === "login" ? "Welcome Back" : "Join Manpower Master"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            100% Free for candidates • Direct verified placements
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 mb-3">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold text-center">
            {error}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("seeker")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      role === "seeker"
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Job Seeker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      role === "employer"
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Employer</span>
                  </button>
                </div>
              </div>

              {role === "seeker" && onOpenDetailedRegistration && (
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-700 font-medium">
                    <strong className="text-orange-700 block font-bold">Recommended for Candidates:</strong>
                    Build complete profile with custom degree, passing year &amp; resume.
                  </div>
                  <button
                    type="button"
                    onClick={onOpenDetailedRegistration}
                    className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-bold shrink-0 hover:bg-orange-700 transition-all cursor-pointer shadow-2xs"
                  >
                    Full Registration
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600"
                />
              </div>

              {role === "employer" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Razorpay, Swiggy"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{mode === "login" ? "Sign In" : "Register Profile"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
