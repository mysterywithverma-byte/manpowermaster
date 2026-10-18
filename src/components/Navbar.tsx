"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  Sparkles,
  User,
  Building2,
  ShieldCheck,
  LogOut,
  PlusCircle,
  Bookmark,
  ChevronDown,
  Phone,
} from "lucide-react";
import { TextLogo } from "@/components/TextLogo";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenRegister?: () => void;
  onOpenPostJob: () => void;
}

export function Navbar({ onOpenAuth, onOpenRegister, onOpenPostJob }: NavbarProps) {
  const { user, role, activeView, setActiveView, loginAsDemo, logout, savedJobs } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-orange-100 bg-white/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Text Logo (Indeed Style) with DP */}
        <div
          onClick={() => setActiveView("explore")}
          className="cursor-pointer group select-none"
        >
          <TextLogo size="md" showDomain={true} showBadge={true} showEmblem={true} />
        </div>

        {/* View Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveView("explore")}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeView === "explore"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-orange-50"
            }`}
          >
            Explore Jobs
          </button>

          {role === "seeker" && (
            <button
              onClick={() => setActiveView("seeker-dashboard")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeView === "seeker-dashboard"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-orange-50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Applications</span>
              {savedJobs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-orange-100 text-orange-700 rounded-full font-extrabold">
                  {savedJobs.length}
                </span>
              )}
            </button>
          )}

          {role === "employer" && (
            <button
              onClick={() => setActiveView("employer-dashboard")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeView === "employer-dashboard"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-orange-50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiter Console</span>
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => setActiveView("admin-dashboard")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeView === "admin-dashboard"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-orange-50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer"
              title="Switch Persona"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline font-medium text-slate-500">Role:</span>
              <span className="capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setDemoMenuOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  Test Personas
                </div>
                <button
                  onClick={() => loginAsDemo("seeker")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl text-left transition-colors ${
                    role === "seeker" ? "bg-orange-50 text-orange-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900">Job Seeker (Aarav)</div>
                    <div className="text-[10px] text-slate-500">Search, Apply, Manage Resume</div>
                  </div>
                </button>

                <button
                  onClick={() => loginAsDemo("employer")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl text-left transition-colors ${
                    role === "employer" ? "bg-orange-50 text-orange-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-bold text-slate-900">Recruiter (Razorpay)</div>
                    <div className="text-[10px] text-slate-500">Post Openings &amp; Hire</div>
                  </div>
                </button>

                <button
                  onClick={() => loginAsDemo("admin")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl text-left transition-colors ${
                    role === "admin" ? "bg-orange-50 text-orange-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold text-slate-900">Platform Admin</div>
                    <div className="text-[10px] text-slate-500">Database &amp; Moderation</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Post Job Button (Desktop for employers) */}
          {role === "employer" && (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white shadow-xs hover:bg-orange-700 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </button>
          )}

          {/* User Profile or Sign In */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => {
                  if (role === "seeker") setActiveView("seeker-dashboard");
                  else if (role === "employer") setActiveView("employer-dashboard");
                  else setActiveView("admin-dashboard");
                }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-orange-50 cursor-pointer"
              >
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-orange-300 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-black text-white shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-orange-700 font-semibold leading-none capitalize">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl border border-orange-600 text-orange-700 hover:bg-orange-50 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRegister || onOpenAuth}
                className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
