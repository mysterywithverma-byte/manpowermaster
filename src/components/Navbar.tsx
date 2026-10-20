"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Building2,
  ShieldCheck,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { TextLogo } from "@/components/TextLogo";
import { NotificationBell } from "@/components/NotificationBell";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenRegister?: () => void;
  onOpenPostJob: () => void;
  onSelectJobId?: (jobId: string) => void;
}

export function Navbar({ onOpenAuth, onOpenRegister, onOpenPostJob, onSelectJobId }: NavbarProps) {
  const { user, role, activeView, setActiveView, logout, savedJobs } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-orange-100 bg-white/95 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Text Logo (Clean Minimalist Style) */}
        <div
          onClick={() => setActiveView("explore")}
          className="cursor-pointer group select-none shrink-0"
        >
          <TextLogo size="md" showEmblem={true} />
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

          {/* Recruiter Console tab for employers */}
          {user && role === "employer" && (
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
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Post Job Button (Desktop for employers) */}
          {user && role === "employer" ? (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white shadow-xs hover:bg-orange-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </button>
          ) : !user ? (
            <button
              onClick={onOpenPostJob}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>For Employers</span>
            </button>
          ) : null}

          {/* User Profile or Sign In */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <NotificationBell onSelectJobId={onSelectJobId} />
              <div
                onClick={() => {
                  if (role === "seeker") setActiveView("seeker-dashboard");
                  else if (role === "employer") setActiveView("employer-dashboard");
                  else setActiveView("admin-dashboard");
                }}
                className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-xl hover:bg-orange-50 cursor-pointer shrink-0"
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
