"use client";

import React, { useState } from "react";
import { MockJob } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import {
  X,
  Send,
  FileText,
  CheckCircle,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";

interface ApplyJobModalProps {
  job: MockJob | null;
  onClose: () => void;
  onAppliedSuccessfully: () => void;
}

export function ApplyJobModal({
  job,
  onClose,
  onAppliedSuccessfully,
}: ApplyJobModalProps) {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "Aarav Sharma");
  const [email, setEmail] = useState(user?.email || "aarav@example.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [experienceYears, setExperienceYears] = useState("5");
  const [noticePeriod, setNoticePeriod] = useState(user?.noticePeriod || "Immediate");
  const [expectedCtc, setExpectedCtc] = useState(user?.expectedCtc?.toString() || "36");
  const [currentCompany, setCurrentCompany] = useState("Infosys Labs");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "/uploads/resumes/aarav_resume.pdf");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "aarav_sharma_cv.pdf");
  const [coverNote, setCoverNote] = useState(
    "I have proven hands-on experience building high-scale fintech systems. Excited to contribute to your engineering team!"
  );

  const [uploadingResume, setUploadingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!job) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setResumeUrl(data.url);
        setResumeFileName(data.fileName);
      }
    } catch {
      setError("Resume upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          applicantId: user?._id || "user-seeker-1",
          coverNote,
          resumeUrl,
          applicantDetails: {
            name,
            email,
            phone,
            experienceYears: Number(experienceYears) || 0,
            noticePeriod,
            expectedCtc: Number(expectedCtc) || 0,
            currentCompany,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 409) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#f59e0b", "#10b981"],
      });

      setTimeout(() => {
        onAppliedSuccessfully();
        onClose();
      }, 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-5 sm:p-8 text-slate-900 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Application Dispatched!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your resume, notice period, and application have been sent to the recruiter team at{" "}
              <strong className="text-orange-600">{job.company}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                1-Click Direct Application
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Apply for {job.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                at <span className="font-bold text-slate-800">{job.company}</span> • {job.location}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Attached Resume Selector */}
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {resumeFileName}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Attached from your profile</span>
                    </div>
                  </div>
                </div>

                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-orange-300 text-orange-600 text-xs font-bold hover:bg-orange-50 flex items-center gap-1">
                  {uploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Change</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Personal Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Notice Period
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  >
                    <option value="Immediate">Immediate Joiner</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Total Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Expected CTC (₹ LPA)
                  </label>
                  <input
                    type="number"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cover Note / Pitch to Hiring Manager
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 leading-relaxed font-normal"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit 1-Click Application</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
