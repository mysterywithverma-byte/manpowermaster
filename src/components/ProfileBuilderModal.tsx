"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Loader2,
  Camera,
  ImageIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

interface ProfileBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export function ProfileBuilderModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: ProfileBuilderModalProps) {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "Bengaluru, Karnataka");
  const [noticePeriod, setNoticePeriod] = useState(user?.noticePeriod || "Immediate");
  const [currentCtc, setCurrentCtc] = useState(user?.currentCtc?.toString() || "24");
  const [expectedCtc, setExpectedCtc] = useState(user?.expectedCtc?.toString() || "36");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");

  // Avatar Image & Lightweight WebP Compression state
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "/company-profile.jpeg");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSavings, setAvatarSavings] = useState("");

  // Resume state
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Education state
  const [education, setEducation] = useState(
    user?.education && user.education.length > 0
      ? user.education
      : [{ degree: "B.Tech in Computer Science", institution: "College of Engineering", year: "2021" }]
  );

  // Work experience state
  const [experienceHistory, setExperienceHistory] = useState(
    user?.experienceHistory && user.experienceHistory.length > 0
      ? user.experienceHistory
      : [
          {
            role: "Software Development Engineer",
            company: "Tech Systems Ltd",
            duration: "2021 - Present",
            description: "Built scalable frontend and backend payment services.",
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarSavings("");

    try {
      // Auto-compress heavy camera image to ultra-lightweight WebP format
      const compressed = await compressImageToWebP(file, 500, 0.82);

      const formData = new FormData();
      formData.append("file", compressed.file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setAvatarUrl(data.url);
        setAvatarSavings(
          `WebP optimized: ${formatBytes(compressed.originalSize)} to ${formatBytes(compressed.compressedSize)} (${compressed.savingsPercent}% lighter)`
        );
      } else {
        setAvatarSavings("Failed to upload image");
      }
    } catch {
      setAvatarSavings("Image compression error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setUploadMessage("");

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
        setUploadMessage("Resume uploaded successfully.");
      } else {
        setUploadMessage("Failed to upload resume file.");
      }
    } catch {
      setUploadMessage("Upload error occurred.");
    } finally {
      setUploadingResume(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperienceHistory([
      ...experienceHistory,
      { role: "", company: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperienceHistory(experienceHistory.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const profileData = {
        name,
        avatar: avatarUrl,
        headline,
        bio,
        phone,
        location,
        noticePeriod,
        currentCtc: Number(currentCtc) || 0,
        expectedCtc: Number(expectedCtc) || 0,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        resumeUrl,
        resumeFileName,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        education,
        experienceHistory,
      };

      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "user-seeker-1",
          profileData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#f97316", "#fb923c", "#10b981"],
        });

        if (user) {
          const updatedUser = { ...user, ...profileData };
          localStorage.setItem("jn_user", JSON.stringify(updatedUser));
        }

        setTimeout(() => {
          setSaveSuccess(false);
          onProfileUpdated();
          onClose();
        }, 1200);
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-5 sm:p-8 text-slate-900 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {saveSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Profile Updated!</h3>
            <p className="text-xs text-slate-500">
              Your resume, credentials, and notice period are updated for recruiters.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                Candidate Profile &amp; Resume Builder
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                Your Job Profile
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete your details to increase recruiter callbacks by 3.5x.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Photo / Avatar with Lightweight WebP Compressor */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt={name || "Profile"}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-400 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-orange-600 text-white shadow-xs">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Profile Photo (Lightweight WebP Format)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Images are automatically converted to WebP for instant phone loading.
                    </p>
                    {avatarSavings && (
                      <span className="inline-block mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {avatarSavings}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                        <span>Optimizing WebP...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                        <span>Upload Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Resume File Upload Block */}
              <div className="p-4 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {resumeFileName || "Upload Candidate Resume (PDF / Word)"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {resumeUrl
                          ? "Resume attached &amp; active for 1-Click Applications"
                          : "Upload your latest CV to store permanently"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="flex-1 sm:flex-initial cursor-pointer px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all">
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{resumeUrl ? "Change Resume" : "Upload File"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-orange-50"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>

                {uploadMessage && (
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    {uploadMessage}
                  </p>
                )}
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
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
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Notice Period *
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  >
                    <option value="Immediate">Immediate Joiner (0-7 Days)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days (1 Month)</option>
                    <option value="60 Days">60 Days (2 Months)</option>
                    <option value="Serving Notice">Serving Notice Period</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current CTC (₹ LPA)
                  </label>
                  <input
                    type="number"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Expected CTC (₹ LPA) *
                  </label>
                  <input
                    type="number"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>
              </div>

              {/* Headline & Skills */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, SQL, Java, Problem Solving"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                />
              </div>

              {/* Education Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                    <span>Education Qualifications</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Degree
                  </button>
                </div>

                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.Tech / BCA / MBA)"
                        value={edu.degree}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].degree = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 font-semibold text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Institution / University"
                        value={edu.institution}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].institution = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 font-semibold text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].year = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-center font-bold text-slate-900"
                      />
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                    <span>Work History</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Role
                  </button>
                </div>

                <div className="space-y-3">
                  {experienceHistory.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          placeholder="Job Title / Role"
                          value={exp.role}
                          onChange={(e) => {
                            const copy = [...experienceHistory];
                            copy[idx].role = e.target.value;
                            setExperienceHistory(copy);
                          }}
                          className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 font-bold text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={exp.company}
                          onChange={(e) => {
                            const copy = [...experienceHistory];
                            copy[idx].company = e.target.value;
                            setExperienceHistory(copy);
                          }}
                          className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 font-semibold text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 2022 - 2024)"
                          value={exp.duration}
                          onChange={(e) => {
                            const copy = [...experienceHistory];
                            copy[idx].duration = e.target.value;
                            setExperienceHistory(copy);
                          }}
                          className="w-full sm:w-36 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-center font-bold text-slate-900"
                        />
                        {experienceHistory.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Key responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) => {
                          const copy = [...experienceHistory];
                          copy[idx].description = e.target.value;
                          setExperienceHistory(copy);
                        }}
                        className="w-full p-2.5 text-xs rounded-lg bg-white border border-slate-200 leading-relaxed font-normal text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save &amp; Complete Profile</span>
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
