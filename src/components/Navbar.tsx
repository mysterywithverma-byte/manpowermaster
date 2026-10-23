"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  Dropdown,
  Avatar,
  Badge,
  Space,
  Tag,
  Divider,
} from "antd";
import type { MenuProps } from "antd";
import {
  Compass,
  User,
  Building2,
  LogOut,
  Plus,
  ChevronDown,
  ArrowLeftRight,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { TextLogo } from "@/components/TextLogo";
import { NotificationBell } from "@/components/NotificationBell";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenEmployerAuth?: () => void;
  onOpenRegister?: () => void;
  onOpenPostJob: () => void;
  onOpenOnboarding?: () => void;
  onSelectJobId?: (jobId: string) => void;
}

export function Navbar({
  onOpenAuth,
  onOpenEmployerAuth,
  onOpenRegister,
  onOpenPostJob,
  onOpenOnboarding,
  onSelectJobId,
}: NavbarProps) {
  const { user, role, activeView, setActiveView, logout, savedJobs, updateUser } = useAuth();

  const handleSwitchRole = (newRole: "seeker" | "employer") => {
    updateUser({ role: newRole });
    if (newRole === "employer") setActiveView("employer-dashboard");
    else setActiveView("seeker-dashboard");
  };

  // Ant Design Dropdown items
  const menuItems: MenuProps["items"] = [
    {
      key: "user-header",
      disabled: true,
      label: (
        <div style={{ padding: "4px 0", cursor: "default" }}>
          <Space align="center" size={10}>
            <Avatar
              size={38}
              src={user?.avatar}
              style={{
                backgroundColor: "#ea580c",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                {user?.name}
                {user?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{user?.email}</div>
              <Tag color="orange" variant="filled" style={{ marginTop: 4, textTransform: "uppercase", fontSize: 10, fontWeight: 700 }}>
                {user?.role === "seeker" ? "Employee" : "Employer"}
              </Tag>
            </div>
          </Space>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "explore",
      icon: <Compass className="w-4 h-4" />,
      label: "Explore Job Board",
      onClick: () => setActiveView("explore"),
    },
    {
      key: "seeker-dash",
      icon: <User className="w-4 h-4" />,
      label: "Profile Dashboard",
      onClick: () => setActiveView("seeker-dashboard"),
    },
    {
      key: "employer-dash",
      icon: <Building2 className="w-4 h-4" />,
      label: "Employer Console",
      onClick: () => setActiveView("employer-dashboard"),
    },
    ...(role === "employer"
      ? [
          {
            key: "employer-profile",
            icon: <Building2 className="w-4 h-4 text-orange-600" />,
            label: "Company Profile & Branches",
            onClick: () => {
              if (onOpenOnboarding) {
                onOpenOnboarding();
              } else {
                setActiveView("employer-dashboard");
              }
            },
          },
        ]
      : []),
    { type: "divider" as const },
    {
      key: "switch-role",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      label: role === "seeker" ? "Switch to Employer Mode" : "Switch to Employee Mode",
      onClick: () => handleSwitchRole(role === "seeker" ? "employer" : "seeker"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      label: "Sign Out",
      onClick: logout,
    },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Brand Text Logo */}
        <div
          onClick={() => setActiveView("explore")}
          style={{ cursor: "pointer", userSelect: "none", flexShrink: 0 }}
        >
          <TextLogo size="md" showEmblem={true} />
        </div>

        {/* View Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
          <Button
            type={activeView === "explore" ? "primary" : "text"}
            size="small"
            icon={<Compass className="w-3.5 h-3.5" />}
            onClick={() => setActiveView("explore")}
            style={{
              fontWeight: 600,
              boxShadow: activeView === "explore" ? "0 2px 4px rgba(234, 88, 12, 0.2)" : "none",
            }}
          >
            Jobs
          </Button>

          {role === "seeker" && (
            <Badge count={savedJobs.length} size="small" offset={[-4, 4]}>
              <Button
                type={activeView === "seeker-dashboard" ? "primary" : "text"}
                size="small"
                icon={<User className="w-3.5 h-3.5" />}
                onClick={() => setActiveView("seeker-dashboard")}
                style={{
                  fontWeight: 600,
                  boxShadow: activeView === "seeker-dashboard" ? "0 2px 4px rgba(234, 88, 12, 0.2)" : "none",
                }}
              >
                Dashboard
              </Button>
            </Badge>
          )}

          {user && role === "employer" && (
            <Button
              type={activeView === "employer-dashboard" ? "primary" : "text"}
              size="small"
              icon={<Building2 className="w-3.5 h-3.5" />}
              onClick={() => setActiveView("employer-dashboard")}
              style={{
                fontWeight: 600,
                boxShadow: activeView === "employer-dashboard" ? "0 2px 4px rgba(234, 88, 12, 0.2)" : "none",
              }}
            >
              Recruiter Console
            </Button>
          )}
        </nav>

        {/* Right Actions */}
        <Space size={8} align="center">
          {/* Post Job Button / Employer Access (Only for Employers or Guest visitors) */}
          {(!user || role === "employer") && (
            <div className="hidden sm:inline-flex">
              {role === "employer" ? (
                <Button
                  type="primary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={onOpenPostJob}
                  style={{ fontWeight: 600, borderRadius: 8 }}
                >
                  Post Job
                </Button>
              ) : (
                <Button
                  icon={<Building2 className="w-3.5 h-3.5 text-orange-600" />}
                  onClick={onOpenEmployerAuth || onOpenPostJob}
                  style={{ borderColor: "#fed7aa", backgroundColor: "#fff7ed", fontWeight: 600, borderRadius: 8 }}
                >
                  Post Job
                </Button>
              )}
            </div>
          )}

          {/* User Profile or Sign In */}
          {user ? (
            <Space size={6} align="center">
              <NotificationBell onSelectJobId={onSelectJobId} />

              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px 4px 4px",
                    borderRadius: 20,
                    cursor: "pointer",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-orange-400 hover:shadow-xs active:scale-95"
                >
                  <Avatar
                    size={30}
                    src={user.avatar}
                    style={{ backgroundColor: "#ea580c", fontWeight: 700, fontSize: 12 }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="hidden md:block text-left" style={{ lineHeight: 1.15 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 3 }}>
                      <span className="truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
                      {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div style={{ fontSize: 10, color: "#ea580c", fontWeight: 600, textTransform: "capitalize" }}>
                      {user.role === "seeker" ? "Employee" : "Employer"}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Button
              type="primary"
              size="middle"
              icon={<LogIn className="w-3.5 h-3.5" />}
              onClick={onOpenAuth}
              style={{ fontWeight: 600, borderRadius: 8, padding: "0 16px" }}
              className="active:scale-95"
            >
              Sign In
            </Button>
          )}
        </Space>
      </div>
    </header>
  );
}
