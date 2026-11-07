"use client";

import React from "react";
import { ShieldAlert, CheckCircle, Phone, ArrowUpRight } from "lucide-react";

interface WorkIndiaFooterDirectoryProps {
  onSelectCity?: (city: string) => void;
  onSelectRole?: (role: string) => void;
  isHindi?: boolean;
}

export default function WorkIndiaFooterDirectory({
  onSelectCity,
  onSelectRole,
  isHindi = false,
}: WorkIndiaFooterDirectoryProps) {
  const cities = [
    "Delhi NCR",
    "Mumbai",
    "Bengaluru",
    "Pune",
    "Hyderabad",
    "Kolkata",
    "Chennai",
    "Ahmedabad",
    "Surat",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Indore",
    "Chandigarh",
    "Jalandhar",
    "Nagpur",
    "Patna",
    "Bhopal",
    "Vadodara",
    "Ludhiana",
  ];

  const roles = [
    "Telecaller Jobs",
    "Back Office Jobs",
    "Data Entry Jobs",
    "Delivery Partner Jobs",
    "Field Sales Jobs",
    "Accountant Jobs",
    "Tally Operator Jobs",
    "Cook & Chef Jobs",
    "Driver Jobs",
    "Security Guard Jobs",
    "Receptionist Jobs",
    "Retail Store Sales Jobs",
    "Electrician Jobs",
    "Staff Nurse Jobs",
    "Warehouse Staff Jobs",
    "Graphic Designer Jobs",
    "Software Developer Jobs",
    "Office Boy / Peon Jobs",
    "Housekeeping Jobs",
    "Computer Operator Jobs",
  ];

  const qualifications = [
    "10th Pass Jobs",
    "12th Pass Jobs",
    "Freshers Welcome Jobs",
    "Graduate Jobs",
    "ITI / Diploma Jobs",
    "Post Graduate Jobs",
    "Night Shift Jobs",
    "Work From Home Jobs",
    "Part Time Jobs",
    "Female Special Jobs",
  ];

  return (
    <div className="w-full bg-slate-900 text-slate-300 py-10 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-8 text-xs">
        {/* Anti-Fraud Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {isHindi ? "वर्कइंडिया कैंडिडेट सुरक्षा सलाह (WorkIndia Safety Warning)" : "100% Free Candidate Job Guarantee & Anti-Fraud Advisory"}
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                {isHindi
                  ? "कभी भी किसी भी नौकरी या इंटरव्यू के लिए पैसे (रजिस्ट्रेशन फीस, यूनिफॉर्म, ट्रेनिंग) न दें। असली कंपनियाँ कभी पैसे नहीं मांगती।"
                  : "Never pay any registration fee, interview charge, uniform cost, or training fee for getting a job. Verified direct employers never demand money."}
              </p>
            </div>
          </div>
          <a
            href="tel:+919872620706"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Report Suspicious HR
          </a>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Popular Cities */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              {isHindi ? "प्रमुख शहरों में नौकरियां (Jobs by City)" : "Jobs by Top Indian Cities"}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-slate-400">
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectCity && onSelectCity(c.split(" ")[0])}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  Jobs in {c}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Roles */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              {isHindi ? "लोकप्रिय भूमिकाएं (Jobs by Role)" : "Jobs by Popular Categories"}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-slate-400">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSelectRole && onSelectRole(r.replace(" Jobs", ""))}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* By Qualification */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              {isHindi ? "योग्यता अनुसार नौकरियां (By Qualification)" : "Jobs by Qualification & Work Mode"}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-slate-400">
              {qualifications.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSelectRole && onSelectRole(q.replace(" Jobs", ""))}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Credits & Verification */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Manpower Master Job Ecosystem. Inspired by WorkIndia direct hiring model.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 100% Free for Candidates
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Direct HR Dialing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
