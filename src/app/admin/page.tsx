"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AdminDashboard } from "@/components/AdminDashboard";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminPage() {
  const { user, updateUser, logout } = useAuth();

  // Secure Login form state (empty by default, zero leaks)
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password) {
      setErrorMessage("Please enter both Administrator Email and Security Password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminId.trim(), password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setSuccessMessage("Administrator authorized. Entering Console...");
        localStorage.setItem("jn_user", JSON.stringify(data.user));
        updateUser(data.user);
      } else {
        setErrorMessage(data.error || "Invalid credentials. Access denied.");
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated with role 'admin', show Admin Dashboard
  if (user && user.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Secure Admin Top Bar */}
        <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-xs">
                MM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white">
                    MANPOWER MASTER
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    ADMIN CONSOLE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Secure Administrative Management
                </div>
              </div>
            </div>

            {/* Admin Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-white text-[11px] font-bold">
                  {user.email}
                </span>
                <span className="text-[10px] uppercase font-black text-orange-400 bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-800/40">
                  Super Admin
                </span>
              </div>

              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                title="Go to candidate/employer main website"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Public Website</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // Strictly Protected Admin Authentication Gate
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            MM
          </div>
          <span className="font-black text-sm tracking-tight text-white group-hover:text-orange-400 transition-colors">
            MANPOWER MASTER
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Portal</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
          {/* Header Emblem */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mx-auto shadow-lg shadow-orange-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Administrator Console
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Restricted management area. Authorized administrative credentials required.
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Admin Email / ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Administrator Email / ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@manpowermaster.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="max-w-5xl mx-auto w-full pt-6 text-center text-[11px] text-slate-600">
        © 2026 Manpower Master. Restricted system for authorized administrative personnel only.
      </div>
    </div>
  );
}
