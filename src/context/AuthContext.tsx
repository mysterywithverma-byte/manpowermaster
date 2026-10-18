"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_USERS, MockUser } from "@/lib/mock-data";

interface AuthContextType {
  user: MockUser | null;
  role: "seeker" | "employer" | "admin";
  savedJobs: string[];
  activeView: "explore" | "seeker-dashboard" | "employer-dashboard" | "admin-dashboard";
  setActiveView: (view: "explore" | "seeker-dashboard" | "employer-dashboard" | "admin-dashboard") => void;
  loginAsDemo: (role: "seeker" | "employer" | "admin") => void;
  login: (email: string) => Promise<boolean>;
  register: (data: { name: string; email: string; role: "seeker" | "employer"; companyName?: string }) => Promise<boolean>;
  logout: () => void;
  toggleSaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(INITIAL_USERS[0]); // Default to Seeker for instant rich experience
  const [activeView, setActiveView] = useState<"explore" | "seeker-dashboard" | "employer-dashboard" | "admin-dashboard">("explore");
  const [savedJobs, setSavedJobs] = useState<string[]>(INITIAL_USERS[0].savedJobs);

  useEffect(() => {
    const stored = localStorage.getItem("jn_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setSavedJobs(parsed.savedJobs || []);
      } catch {
        // use default
      }
    }
    if (typeof window !== "undefined" && window.location.search.includes("google_auth_success")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("google_auth_success");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  const loginAsDemo = (demoRole: "seeker" | "employer" | "admin") => {
    const found = INITIAL_USERS.find((u) => u.role === demoRole) || INITIAL_USERS[0];
    setUser(found);
    setSavedJobs(found.savedJobs || []);
    localStorage.setItem("jn_user", JSON.stringify(found));

    if (demoRole === "employer") {
      setActiveView("employer-dashboard");
    } else if (demoRole === "admin") {
      setActiveView("admin-dashboard");
    } else {
      setActiveView("explore");
    }
  };

  const login = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setSavedJobs(data.user.savedJobs || []);
        localStorage.setItem("jn_user", JSON.stringify(data.user));
        if (data.user.role === "employer") setActiveView("employer-dashboard");
        else if (data.user.role === "admin") setActiveView("admin-dashboard");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; role: "seeker" | "employer"; companyName?: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setSavedJobs([]);
        localStorage.setItem("jn_user", JSON.stringify(data.user));
        if (data.user.role === "employer") setActiveView("employer-dashboard");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setSavedJobs([]);
    localStorage.removeItem("jn_user");
    setActiveView("explore");
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;
    const isSaved = savedJobs.includes(jobId);
    const updated = isSaved ? savedJobs.filter((id) => id !== jobId) : [...savedJobs, jobId];
    setSavedJobs(updated);

    if (user) {
      const updatedUser = { ...user, savedJobs: updated };
      setUser(updatedUser);
      localStorage.setItem("jn_user", JSON.stringify(updatedUser));
    }

    try {
      await fetch("/api/users/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, jobId }),
      });
    } catch {
      // optimistic update maintained
    }
  };

  const isJobSaved = (jobId: string) => savedJobs.includes(jobId);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "seeker",
        savedJobs,
        activeView,
        setActiveView,
        loginAsDemo,
        login,
        register,
        logout,
        toggleSaveJob,
        isJobSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
