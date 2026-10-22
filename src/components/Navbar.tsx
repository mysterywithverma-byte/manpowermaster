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
  UserOutlined,
  BankOutlined,
  LogoutOutlined,
  PlusOutlined,
  DownOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  SwapOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { TextLogo } from "@/components/TextLogo";
import { NotificationBell } from "@/components/NotificationBell";

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
                {user?.isVerified && <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{user?.email}</div>
              <Tag color="orange" bordered={false} style={{ marginTop: 4, textTransform: "uppercase", fontSize: 10, fontWeight: 700 }}>
                {user?.role}
              </Tag>
            </div>
          </Space>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "explore",
      icon: <AppstoreOutlined />,
      label: "Explore Job Board",
      onClick: () => setActiveView("explore"),
    },
    {
      key: "seeker-dash",
      icon: <UserOutlined />,
      label: "Candidate Dashboard",
      onClick: () => setActiveView("seeker-dashboard"),
    },
    {
      key: "employer-dash",
      icon: <BankOutlined />,
      label: "Employer Talent Console",
      onClick: () => setActiveView("employer-dashboard"),
    },
    { type: "divider" },
    {
      key: "switch-role",
      icon: <SwapOutlined />,
      label: role === "seeker" ? "Switch to Employer Mode" : "Switch to Candidate Mode",
      onClick: () => handleSwitchRole(role === "seeker" ? "employer" : "seeker"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
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
            icon={<AppstoreOutlined />}
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
                icon={<UserOutlined />}
                onClick={() => setActiveView("seeker-dashboard")}
                style={{
                  fontWeight: 600,
                  boxShadow: activeView === "seeker-dashboard" ? "0 2px 4px rgba(234, 88, 12, 0.2)" : "none",
                }}
              >
                My Applications
              </Button>
            </Badge>
          )}

          {user && role === "employer" && (
            <Button
              type={activeView === "employer-dashboard" ? "primary" : "text"}
              size="small"
              icon={<BankOutlined />}
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
        <Space size={10} align="center">
          {/* Post Job Button / Employer Access */}
          {user && role === "employer" ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenPostJob}
              style={{ fontWeight: 600, borderRadius: 8 }}
            >
              Post a Job
            </Button>
          ) : user && role === "seeker" ? (
            <Button
              icon={<BankOutlined style={{ color: "#ea580c" }} />}
              onClick={onOpenPostJob}
              style={{ borderColor: "#fed7aa", backgroundColor: "#fff7ed", fontWeight: 600, borderRadius: 8 }}
            >
              Post a Job
            </Button>
          ) : !user ? (
            <Button
              icon={<BankOutlined style={{ color: "#ea580c" }} />}
              onClick={onOpenEmployerAuth || onOpenPostJob}
              style={{ borderColor: "#fed7aa", backgroundColor: "#fff7ed", fontWeight: 600, borderRadius: 8 }}
            >
              Post a Job
            </Button>
          ) : null}

          {/* User Profile or Sign In */}
          {user ? (
            <Space size={8} align="center">
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
                    gap: 8,
                    padding: "4px 8px 4px 4px",
                    borderRadius: 20,
                    cursor: "pointer",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-orange-400 hover:shadow-xs"
                >
                  <Avatar
                    size={30}
                    src={user.avatar}
                    style={{ backgroundColor: "#ea580c", fontWeight: 700, fontSize: 12 }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="hidden lg:block text-left" style={{ lineHeight: 1.15 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 3 }}>
                      <span className="truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
                      {user.isVerified && <CheckCircleFilled style={{ color: "#16a34a", fontSize: 11 }} />}
                    </div>
                    <div style={{ fontSize: 10, color: "#ea580c", fontWeight: 600, textTransform: "capitalize" }}>
                      {user.role}
                    </div>
                  </div>
                  <DownOutlined style={{ fontSize: 10, color: "#94a3b8" }} />
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space size={8}>
              <Button
                icon={<LoginOutlined />}
                onClick={onOpenAuth}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Sign In
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={onOpenRegister || onOpenAuth}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Register
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </header>
  );
}
