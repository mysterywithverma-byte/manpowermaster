"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  Upload,
  ImageIcon,
  Building2,
  User,
} from "lucide-react";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  onOpenEmployerAuth?: () => void;
}

export function PostJobModal({ isOpen, onClose, onJobCreated, onOpenEmployerAuth }: PostJobModalProps) {
  const { user, updateUser, loginAsDemo } = useAuth();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "Manpower Master");
  const [companyLogo, setCompanyLogo] = useState(
    user?.companyLogo || "/company-profile.jpeg"
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoSavings, setLogoSavings] = useState("");
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [workplaceType, setWorkplaceType] = useState<"Remote" | "On-site" | "Hybrid">("Hybrid");
  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive">("Senior");
  const [jobType, setJobType] = useState<"Full-time" | "Part-time" | "Contract" | "Internship">("Full-time");
  const [salaryMin, setSalaryMin] = useState("28");
  const [salaryMax, setSalaryMax] = useState("45");
  const [skills, setSkills] = useState("React, Node.js, SQL, AWS, Communication");
  const [description, setDescription] = useState(
    "We are seeking a talented professional to join our growing team. You will lead key technical initiatives and collaborate with cross-functional partners."
  );
  const [requirements, setRequirements] = useState(
    "3+ years relevant experience in your domain\nStrong communication and problem-solving skills\nTrack record of high ownership and delivery"
  );
  const [benefits, setBenefits] = useState(
    "Comprehensive Health Insurance\nAnnual Performance Bonus & ESOPs\nHome Office & Learning Allowance"
  );
  const [featured, setFeatured] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setLogoSavings("");

    try {
      // Auto-compress brand logo to ultra-lightweight WebP
      const compressed = await compressImageToWebP(file, 400, 0.85);

      const formData = new FormData();
      formData.append("file", compressed.file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setCompanyLogo(data.url);
        setLogoSavings(
          `WebP optimized: ${formatBytes(compressed.originalSize)} to ${formatBytes(compressed.compressedSize)} (${compressed.savingsPercent}% lighter)`
        );
      }
    } catch {
      setLogoSavings("Logo upload error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in or register as an employer to publish an opening.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          companyLogo,
          location,
          workplaceType,
          experienceLevel,
          jobType,
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          salaryCurrency: "INR",
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          description,
          requirements: requirements.split("\n").filter(Boolean),
          benefits: benefits.split("\n").filter(Boolean),
          featured,
          postedBy: user._id || user.id || user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish job");
      }

      if (user && user.role !== "employer") {
        updateUser({ role: "employer" });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onJobCreated();
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error publishing job";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-slate-200 shadow-2xl p-5 sm:p-8 text-slate-900 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Opening Published!</h3>
            <p className="text-xs text-slate-500">
              Your job is now broadcasted live across India&apos;s tech hubs.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                Recruiter Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Publish a New Job Opening
              </h2>
              <p className="text-xs text-slate-500">
                Target verified candidates across India with transparent compensation.
              </p>
            </div>

            {!user && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div>
                  <strong className="block font-black text-amber-900">Employer Account Required</strong>
                  <span>Please sign in or register your organization to broadcast this opening to candidates.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenEmployerAuth) onOpenEmployerAuth();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Employer Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => loginAsDemo("employer")}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Demo Employer
                  </button>
                </div>
              </div>
            )}

            {user && user.role === "seeker" && (
              <div className="mb-4 p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-2.5 text-xs text-orange-950">
                <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  Posting as <strong>{user.name}</strong> ({user.email}). Your account will automatically activate as an <strong>Employer</strong> so you can review incoming candidate applications!
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Job Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                {/* Brand Logo Upload with WebP Lightweight Optimizer */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={companyLogo}
                      alt="Brand Logo"
                      className="w-10 h-10 rounded-xl object-cover border border-orange-300 bg-white p-0.5 shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Company Brand Logo (Auto-Compressed WebP)
                      </span>
                      {logoSavings ? (
                        <span className="text-[10px] font-black text-emerald-700">
                          {logoSavings}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Uploaded images are optimized to lightweight WebP format.
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold transition-all shrink-0">
                    {uploadingLogo ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Optimizing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload Logo</span>
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Location & Workplace Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Work Mode
                  </label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  >
                    <option value="Fresher">Fresher (0-1 yr)</option>
                    <option value="Mid-Level">Mid-Level (2-4 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Lead">Lead / Architect (8+ yrs)</option>
                  </select>
                </div>
              </div>

              {/* Salary in LPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Min CTC (₹ LPA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Max CTC (₹ LPA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Sales, React, Negotiation, SQL"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 leading-relaxed font-normal"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Key Requirements (one per line)
                </label>
                <textarea
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-600 leading-relaxed font-normal"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-slate-100 border-slate-300 text-orange-600 focus:ring-0 accent-orange-600"
                />
                <label htmlFor="featuredToggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Highlight as <span className="text-orange-700 font-bold">Featured Role</span> (pinned with orange accent)
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing Opening...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Publish Job to Platform</span>
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
