"use client";

import React from "react";
import { Phone, Mail, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { TextLogo } from "@/components/TextLogo";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info & Govt Registration */}
          <div className="space-y-3">
            <TextLogo size="sm" showDomain={true} showBadge={false} showEmblem={true} />

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Official job recruitment and career staffing ecosystem connecting genuine job seekers directly with verified employers across Punjab, Delhi NCR, Bengaluru &amp; Pan-India.
            </p>

            {/* Govt GSTIN Verified Badge */}
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 space-y-1">
              <div className="flex items-center gap-1.5 text-orange-800 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Govt of India Form GST REG-06</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900">
                GSTIN: <span className="text-orange-700">03IPTPB9968A1ZJ</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Legal Name: <strong>Kiran Bala</strong> (Proprietor)
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Trade Name: <strong>MANPOWER MASTER</strong>
              </div>
            </div>
          </div>

          {/* Official Contact & Head Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact &amp; Head Office
            </h4>
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  199, Neela Mahal, Jalandhar, Punjab - 144008
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <a
                  href="tel:+919872620706"
                  className="hover:text-orange-700 font-bold text-slate-800 transition-colors"
                >
                  +91 98726 20706
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <a
                  href="tel:+916280182046"
                  className="hover:text-orange-700 font-bold text-slate-800 transition-colors"
                >
                  +91 62801 82046
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="text-slate-600">contact@manpowermaster.com</span>
              </div>

              {/* WhatsApp Fast Connect */}
              <div className="pt-1">
                <a
                  href="https://wa.me/919872620706?text=Hello%20Manpower%20Master!%20I%20am%20looking%20for%20a%20job%20opportunity."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>WhatsApp: 98726 20706</span>
                </a>
              </div>
            </div>
          </div>

          {/* For Candidates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Job Seekers
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li className="hover:text-orange-700 cursor-pointer transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600" />
                Immediate Joiner Openings
              </li>
              <li className="hover:text-orange-700 cursor-pointer transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600" />
                1-Click Apply with Profile
              </li>
              <li className="hover:text-orange-700 cursor-pointer transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600" />
                Free Lightweight Resume &amp; DP Upload
              </li>
              <li className="hover:text-orange-700 cursor-pointer transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600" />
                Direct Recruiter Calling &amp; WhatsApp
              </li>
              <li className="hover:text-orange-700 cursor-pointer transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600" />
                Transparent ₹ LPA Compensation
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              For Employers &amp; HR
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li className="hover:text-orange-600 cursor-pointer transition-colors">Post Job Vacancy on ManpowerMaster</li>
              <li className="hover:text-orange-600 cursor-pointer transition-colors">Screen Verified Punjab &amp; Pan-India Profiles</li>
              <li className="hover:text-orange-600 cursor-pointer transition-colors">Notice Period &amp; CTC Filtering</li>
              <li className="hover:text-orange-600 cursor-pointer transition-colors">Direct WhatsApp Candidate Connect</li>
              <li className="hover:text-orange-600 cursor-pointer transition-colors">Zero Spam Hiring Experience</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Manpower Master (Manpowermaster.com). Govt. GSTIN: 03IPTPB9968A1ZJ. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Verified Registration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
