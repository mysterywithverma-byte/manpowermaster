"use client";

import React, { useEffect, useState } from "react";
import { MockJob } from "@/lib/mock-data";
import { formatSalary } from "@/lib/utils";
import {
  ShieldCheck,
  Server,
  Users,
  Briefcase,
  Activity,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

export function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [seedRes, jobsRes] = await Promise.all([
        fetch("/api/seed"),
        fetch("/api/jobs"),
      ]);

      const seedData = await seedRes.json();
      const jobsData = await jobsRes.json();

      setDbStatus(seedData);
      if (jobsData.success) {
        setJobs(jobsData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMessage("");
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSeedMessage(data.message || "Data synced successfully!");
      loadData();
    } catch {
      setSeedMessage("Seeding action encountered an error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-[80vh]">
      {/* Admin Header (Pure White) */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Platform Operations &amp; Moderation
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ecosystem health, database status, and verified employer listings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
              <span>{seeding ? "Seeding..." : "Seed / Reset Mock Data"}</span>
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{seedMessage}</span>
          </div>
        )}

        {/* Database Status & Health Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Database Engine</span>
              <Server className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">
              {dbStatus?.database || "MongoDB Engine"}
            </div>
            <div className="text-[10px] text-emerald-700 font-black mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {dbStatus?.status === "connected" ? "Live Cluster Online" : "Resilient Engine Active"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Total Accounts</span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus?.metrics?.users || 3} Users
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Seekers &amp; Recruiters</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Active Openings</span>
              <Briefcase className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-600">{jobs.length} Positions</div>
            <div className="text-[10px] text-slate-500 mt-1">Across 8+ Tech Hubs</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-bold">Applications</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {dbStatus?.metrics?.applications || 2} Sent
            </div>
            <div className="text-[10px] text-slate-500 mt-1">100% Free Pipeline</div>
          </div>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Platform Listings Governance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect active listings, compensation compliance, and moderation status.
            </p>
          </div>
          <span className="text-xs font-black text-orange-600">{jobs.length} Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-black">Role &amp; Company</th>
                <th className="pb-3 font-black">Location</th>
                <th className="pb-3 font-black">CTC (₹ LPA)</th>
                <th className="pb-3 font-black">Work Mode</th>
                <th className="pb-3 font-black">Applicants</th>
                <th className="pb-3 font-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{job.title}</div>
                    <div className="text-[11px] font-bold text-orange-600">{job.company}</div>
                  </td>
                  <td className="py-3 text-slate-700">{job.location}</td>
                  <td className="py-3 font-black text-slate-900">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </td>
                  <td className="py-3 text-slate-700">{job.workplaceType}</td>
                  <td className="py-3 text-slate-900 font-bold">{job.applicantsCount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
