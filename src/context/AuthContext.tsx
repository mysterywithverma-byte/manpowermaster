"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_USERS, MockUser } from "@/lib/mock-data";

interface AuthContextType {
  user: MockUser | null;
  role: "seeker" | "employer" | "admin";
  savedJobs: string[];
  activeView: "explore" | "seeker-dashboard" | "employer-dashboard";
  setActiveView: (view: "explore" | "seeker-dashboard" | "employer-dashboard") => void;
  loginAsDemo: (role: "seeker" | "employer") => void;
  login: (email: string, name?: string, chosenRole?: "seeker" | "employer") => Promise<{ success: boolean; error?: string } | boolean>;
  register: (data: { name: string; email: string; role: "seeker" | "employer"; companyName?: string }) => Promise<{ success: boolean; error?: string } | boolean>;
  logout: () => void;
  clearDemoSession: () => void;
  updateUser: (data: Partial<MockUser>) => void;
  toggleSaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [activeView, setActiveView] = useState<"explore" | "seeker-dashboard" | "employer-dashboard">("explore");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("jn_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setSavedJobs(parsed.savedJobs || []);

        // Asynchronously fetch fresh live profile from MongoDB Atlas
        if (parsed.email) {
          fetch(`/api/users/profile?email=${encodeURIComponent(parsed.email)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.user) {
                const refreshed = {
                  ...parsed,
                  ...data.user,
                  _id: data.user._id || data.user.id || parsed._id,
                  id: data.user.id || data.user._id || parsed.id,
                  avatar: data.user.avatar || data.user.companyLogo || parsed.avatar,
                };
                setUser(refreshed);
                setSavedJobs(refreshed.savedJobs || []);
                localStorage.setItem("jn_user", JSON.stringify(refreshed));
              }
            })
            .catch(() => {});
        }
      } catch {
        // invalid JSON
      }
    }
    if (typeof window !== "undefined" && window.location.search.includes("google_auth_success")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("google_auth_success");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  const updateUser = (data: Partial<MockUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("jn_user", JSON.stringify(updated));
      return updated;
    });
  };

  const loginAsDemo = (demoRole: "seeker" | "employer") => {
    const found = INITIAL_USERS.find((u) => u.role === demoRole);
    if (found) {
      setUser(found);
      setSavedJobs(found.savedJobs || []);
      localStorage.setItem("jn_user", JSON.stringify(found));
    }

    if (demoRole === "employer") {
      setActiveView("employer-dashboard");
    } else {
      setActiveView("explore");
    }
  };

  const isDemoUser = Boolean(
    user && (
      user._id?.startsWith("user-") ||
      user.email === "demo.recruiter@example.com"
    )
  );

  const login = async (email: string, name?: string, chosenRole: "seeker" | "employer" = "seeker") => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role: chosenRole }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setSavedJobs(data.user.savedJobs || []);
        localStorage.setItem("jn_user", JSON.stringify(data.user));
        if (data.user.role === "employer") setActiveView("employer-dashboard");
        else setActiveView("explore");
        return { success: true };
      }
      return { success: false, error: data.error || "Authentication failed" };
    } catch (e: any) {
      return { success: false, error: e?.message || "Network error" };
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
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (e: any) {
      return { success: false, error: e?.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setSavedJobs([]);
    localStorage.removeItem("jn_user");
    setActiveView("explore");
  };

  const clearDemoSession = () => {
    logout();
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
        clearDemoSession,
        updateUser,
        toggleSaveJob,
        isJobSaved,
        isDemoUser,
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
