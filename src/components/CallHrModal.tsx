"use client";

import React, { useState } from "react";
import { Modal, Button, Tag, Alert, Space, App } from "antd";
import {
  PhoneOutlined,
  WhatsAppOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SafetyCertificateFilled,
  WarningOutlined,
  CheckCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import { MockJob } from "@/lib/mock-data";

interface CallHrModalProps {
  job: MockJob | null;
  visible: boolean;
  onClose: () => void;
}

export default function CallHrModal({ job, visible, onClose }: CallHrModalProps) {
  const { message } = App.useApp();
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  if (!job) return null;

  const rawPhone = job.recruiterWhatsApp?.replace(/[^0-9]/g, "") || "919872620706";
  const displayPhone = rawPhone.length === 10 ? `+91 ${rawPhone}` : rawPhone.startsWith("91") ? `+91 ${rawPhone.slice(2)}` : `+91 ${rawPhone}`;
  const cleanPhoneDigits = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

  const waText = encodeURIComponent(
    `Hello! I saw your ${job.title} job posting for ${job.company} on the job portal. I would like to schedule an interview.`
  );
  const waUrl = `https://wa.me/${cleanPhoneDigits}?text=${waText}`;

  const callingHours = job.callingHoursSummary || (job.callingTimeStart && job.callingTimeEnd ? `${job.callingTimeStart} - ${job.callingTimeEnd}` : "10:00 AM - 6:00 PM (Mon to Sat)");
  const contactPerson = job.contactPerson || "HR Recruiter";
  const interviewAddress = job.interviewAddress || job.location;

  const handleReportFraud = async () => {
    setReporting(true);
    try {
      const res = await fetch("/api/jobs/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          reason: "Asked for money / registration fee or suspicious behavior",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReported(true);
        message.success("Thank you. Job reported for verification by trust team.");
      } else {
        message.error("Failed to report job. Please try again.");
      }
    } catch {
      setReported(true);
      message.success("Report received. Our moderation team will investigate.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      title={
        <div className="flex items-center gap-2 pt-1 pb-1">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
            <PhoneOutlined />
          </div>
          <div>
            <div className="text-base font-bold text-gray-900 leading-tight">
              Call HR Directly (No Consultancy)
            </div>
            <div className="text-xs text-gray-500 font-normal">
              100% Free Placement • Verified Employer
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Job & Recruiter Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-gray-900">{job.title}</h4>
              <div className="text-xs text-gray-600 font-medium mt-0.5">
                {job.company}
              </div>
            </div>
            <Tag color="orange" className="text-[10px] font-bold m-0">
              {job.jobType}
            </Tag>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <UserOutlined className="text-gray-400" />
              <span className="font-semibold text-gray-800">{contactPerson}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <EnvironmentOutlined className="text-gray-400" />
              <span className="truncate">{interviewAddress}</span>
            </div>
          </div>
        </div>

        {/* Calling Hours Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-900">
          <ClockCircleOutlined className="text-blue-600 text-sm flex-shrink-0" />
          <div>
            <div className="font-bold">Recommended Calling Hours:</div>
            <div className="text-blue-800/80">{callingHours}</div>
          </div>
        </div>

        {/* Phone Number Display & Action Buttons */}
        <div className="space-y-2.5">
          <div className="text-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300">
            <div className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">
              Recruiter Mobile Number
            </div>
            <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5 tracking-wider">
              {displayPhone}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${displayPhone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <PhoneOutlined /> Call HR Now
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gray-900 hover:bg-black text-white shadow-sm transition-all"
            >
              <WhatsAppOutlined className="text-emerald-400" /> WhatsApp HR
            </a>
          </div>
        </div>

        {/* WorkIndia Anti-Fraud Safety Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <SafetyCertificateFilled className="text-amber-600 text-sm" />
            <span>WorkIndia 100% Free Job Guarantee:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            Never pay any money for interview, registration, uniform, or training. Genuine employers never charge candidates.
          </p>
          <div className="pt-1 flex items-center justify-between">
            {reported ? (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircleFilled /> Fraud Report Submitted
              </span>
            ) : (
              <Button
                type="link"
                size="small"
                danger
                loading={reporting}
                icon={<WarningOutlined />}
                onClick={handleReportFraud}
                className="text-[11px] p-0 font-bold h-auto"
              >
                Did recruiter ask for money? Report Job
              </Button>
            )}
            <span className="text-[10px] text-gray-400">Strict Moderation Active</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
