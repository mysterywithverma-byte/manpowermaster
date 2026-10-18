"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Briefcase, Check, Sparkles, ExternalLink } from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "job_match" | "application_status" | "system";
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationBellProps {
  onSelectJobId?: (jobId: string) => void;
}

export function NotificationBell({ onSelectJobId }: NotificationBellProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const id = user._id || user.id || user.email;
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(id)}&email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s polling
    return () => clearInterval(interval);
  }, [user]);

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setBrowserPerm(permission);
      if (permission === "granted") {
        new Notification("Manpower Master Alerts Active", {
          body: "You will receive instant alerts whenever jobs matching your profile are posted!",
          icon: "/illustrations/hero-search.png",
        });
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      const id = user._id || user.id || user.email;
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, userId: id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    // Mark as read
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif._id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }

    setIsOpen(false);

    if (notif.link && notif.link.includes("job=")) {
      const jobId = notif.link.split("job=")[1];
      if (jobId && onSelectJobId) {
        onSelectJobId(jobId);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-orange-50 transition-colors cursor-pointer"
        title="Job Alerts & Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-black text-white shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-black text-slate-900">
                Job Alerts for You
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-orange-100 text-orange-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Web Push Prompt */}
          {browserPerm !== "granted" && (
            <div className="mb-2 p-2 rounded-xl bg-orange-50/80 border border-orange-200 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-700 font-medium leading-tight">
                Get instant desktop &amp; phone alerts for new roles
              </span>
              <button
                onClick={requestBrowserPermission}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-orange-600 text-white shrink-0 hover:bg-orange-700 shadow-xs cursor-pointer"
              >
                Turn On
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No alerts yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  We will notify you immediately when jobs matching your skills are posted.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                    !notif.read
                      ? "bg-orange-50/60 border-orange-200"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </h5>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-orange-600 font-bold flex items-center gap-0.5">
                      View opening <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
