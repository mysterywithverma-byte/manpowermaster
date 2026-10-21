"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Building2,
  ShieldCheck,
  LogOut,
  PlusCircle,
  ChevronDown,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { TextLogo } from "@/components/TextLogo";
import { NotificationBell } from "@/components/NotificationBell";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenEmployerAuth?: () => void;
  onOpenRegister?: () => void;
  onOpenPostJob: () => void;
  onSelectJobId?: (jobId: string) => void;
}

export function Navbar({
  onOpenAuth,
  onOpenEmployerAuth,
  onOpenRegister,
  onOpenPostJob,
  onSelectJobId,
}: NavbarProps) {
  const { user, role, activeView, setActiveView, logout, savedJobs, updateUser } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchRole = (newRole: "seeker" | "employer") => {
    updateUser({ role: newRole });
    if (newRole === "employer") setActiveView("employer-dashboard");
    else setActiveView("seeker-dashboard");
    setProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-slate-200/90 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Text Logo */}
        <div
          onClick={() => setActiveView("explore")}
          className="cursor-pointer group select-none shrink-0"
        >
          <TextLogo size="md" showEmblem={true} />
        </div>

        {/* View Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/70 border border-slate-200/80">
          <button
            onClick={() => setActiveView("explore")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeView === "explore"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Jobs</span>
          </button>

          {role === "seeker" && (
            <button
              onClick={() => setActiveView("seeker-dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "seeker-dashboard"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>My Applications</span>
              {savedJobs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full font-bold">
                  {savedJobs.length}
                </span>
              )}
            </button>
          )}

          {/* Recruiter Console tab for employers */}
          {user && role === "employer" && (
            <button
              onClick={() => setActiveView("employer-dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === "employer-dashboard"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Recruiter Console</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Post Job Button / Employer Access */}
          {user && role === "employer" ? (
            <button
              onClick={onOpenPostJob}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white shadow-xs hover:bg-orange-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </button>
          ) : user && role === "seeker" ? (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-orange-200 bg-orange-50/70 text-orange-700 hover:bg-orange-100 transition-all cursor-pointer whitespace-nowrap"
              title="Post a job opening or hire talent"
            >
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Hire / Post Job</span>
            </button>
          ) : !user ? (
            <button
              onClick={onOpenEmployerAuth || onOpenPostJob}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Employer / Post Job</span>
            </button>
          ) : null}

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
              <NotificationBell onSelectJobId={onSelectJobId} />
              
              {/* Profile Trigger */}
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-200 cursor-pointer shrink-0 transition-all"
              >
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-orange-300 shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-black text-white shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                      {user.name.split(" ")[0]}
                    </span>
                    {user.isVerified && <VerifiedBadge size="xs" />}
                  </div>
                  <div className="text-[10px] text-orange-700 font-semibold leading-none capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border-2 border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
                    {user.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-orange-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {user.name}
                        </span>
                        {user.isVerified && <VerifiedBadge size="xs" />}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-orange-100 text-orange-800">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links inside dropdown */}
                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveView("explore");
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Explore Job Board</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView("seeker-dashboard");
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Candidate Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView("employer-dashboard");
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Employer Talent Console</span>
                    </button>

                    </div>

                  {/* Switch Role Quick Actions */}
                  <div className="pt-2 border-t border-slate-100 pb-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-3 mb-1">
                      Quick Mode Switch
                    </div>
                    {role !== "employer" && (
                      <button
                        onClick={() => handleSwitchRole("employer")}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-orange-700 hover:bg-orange-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Switch to Employer</span>
                        <Building2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {role !== "seeker" && (
                      <button
                        onClick={() => handleSwitchRole("seeker")}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Switch to Candidate</span>
                        <User className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onOpenAuth}
                className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl border border-orange-600 text-orange-700 hover:bg-orange-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRegister || onOpenAuth}
                className="px-2.5 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
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
