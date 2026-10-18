"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Briefcase,
  Bookmark,
  User,
  Building2,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenPostJob: () => void;
  onOpenAuth: () => void;
}

export function MobileBottomNav({ onOpenPostJob, onOpenAuth }: MobileBottomNavProps) {
  const { user, role, activeView, setActiveView, savedJobs } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Explore / Home */}
        <button
          onClick={() => setActiveView("explore")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeView === "explore"
              ? "text-orange-600 bg-orange-50 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* Role-specific Nav Item 2 */}
        {role === "seeker" && (
          <button
            onClick={() => setActiveView("seeker-dashboard")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              activeView === "seeker-dashboard"
                ? "text-orange-600 bg-orange-50 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Applied</span>
          </button>
        )}

        {role === "employer" && (
          <button
            onClick={onOpenPostJob}
            className="flex flex-col items-center justify-center py-1 px-3 -mt-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-900/20"
          >
            <PlusCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Post Job</span>
          </button>
        )}

        {role === "admin" && (
          <button
            onClick={() => setActiveView("admin-dashboard")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "admin-dashboard"
                ? "text-orange-700 bg-orange-50 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Admin</span>
          </button>
        )}

        {/* Saved Jobs (for seeker) */}
        {role === "seeker" && (
          <button
            onClick={() => setActiveView("seeker-dashboard")}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-600 hover:text-slate-900 relative transition-all"
          >
            <div className="relative">
              <Bookmark className="w-5 h-5 mb-0.5" />
              {savedJobs.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {savedJobs.length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight font-medium">Saved</span>
          </button>
        )}

        {/* Profile / Account */}
        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
            } else if (role === "seeker") {
              setActiveView("seeker-dashboard");
            } else if (role === "employer") {
              setActiveView("employer-dashboard");
            } else {
              setActiveView("admin-dashboard");
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeView !== "explore"
              ? "text-orange-700 bg-orange-50 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {user ? (
            <div className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center mb-0.5 shadow-xs">
              {user.name.charAt(0)}
            </div>
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] tracking-tight font-medium">
            {user ? "Profile" : "Sign In"}
          </span>
        </button>
      </div>
    </div>
  );
}
