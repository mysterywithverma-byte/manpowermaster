"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Spin,
  Empty,
  Badge,
  App,
} from "antd";
import {
  SearchOutlined,
  UnlockOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BookOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface Candidate {
  id: string;
  name: string;
  role: string;
  category: string;
  city: string;
  locality: string;
  state: string;
  experience: string;
  experienceMonths: number;
  qualification: string;
  englishLevel: string;
  expectedSalary: string;
  gender: string;
  age: number;
  maskedPhone: string;
  displayPhone: string;
  isUnlocked: boolean;
  whatsappUrl: string | null;
  verified: boolean;
  immediateJoiner: boolean;
  skills: string[];
  lastActive: string;
  preferredLocations: string[];
  summary: string;
}

interface CandidateDatabaseSearchProps {
  employerId?: string;
  onOpenPricingModal?: () => void;
}

export default function CandidateDatabaseSearch({
  employerId = "user-employer-1",
  onOpenPricingModal,
}: CandidateDatabaseSearchProps) {
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [employerCredits, setEmployerCredits] = useState<number>(5);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [role, setRole] = useState("all");
  const [qualification, setQualification] = useState("all");
  const [gender, setGender] = useState("all");
  const [minExp, setMinExp] = useState(0);

  // Unlocking state
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city && city !== "all") params.append("city", city);
      if (role && role !== "all") params.append("role", role);
      if (qualification && qualification !== "all") params.append("qualification", qualification);
      if (gender && gender !== "all") params.append("gender", gender);
      if (minExp > 0) params.append("minExp", minExp.toString());
      params.append("employerId", employerId);

      const res = await fetch(`/api/candidates/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        setEmployerCredits(data.employerCredits);
        setUnlockedCount(data.unlockedCount);
      } else {
        message.error(data.error || "Failed to load candidate database");
      }
    } catch {
      message.error("Network error fetching candidate profiles");
    } finally {
      setLoading(false);
    }
  }, [search, city, role, qualification, gender, minExp, employerId, message]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleUnlockCandidate = (candidate: Candidate) => {
    if (employerCredits < 1) {
      modal.confirm({
        title: "Insufficient Unlock Credits",
        icon: <ThunderboltFilled style={{ color: "#fa8c16" }} />,
        content:
          "You have 0 candidate unlock credits remaining. Upgrade to a WorkIndia Employer Package to unlock candidate contact numbers and WhatsApp direct connect.",
        okText: "View Packages & Recharge",
        cancelText: "Later",
        okButtonProps: { className: "bg-blue-600 hover:bg-blue-700" },
        onOk: () => {
          if (onOpenPricingModal) onOpenPricingModal();
        },
      });
      return;
    }

    modal.confirm({
      title: `Unlock Contact for ${candidate.name}?`,
      icon: <UnlockOutlined style={{ color: "#1890ff" }} />,
      content: (
        <div className="text-sm text-gray-600 space-y-2 mt-2">
          <p>
            You are unlocking the verified contact info for <strong>{candidate.name}</strong> ({candidate.role}).
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-xs text-blue-900">
            <strong>1 Credit</strong> will be deducted. You will have{" "}
            <strong>{employerCredits - 1} credits</strong> remaining. Once unlocked, this candidate is permanently accessible in your account.
          </div>
        </div>
      ),
      okText: "Unlock Now (1 Credit)",
      cancelText: "Cancel",
      okButtonProps: { className: "bg-emerald-600 hover:bg-emerald-700" },
      onOk: async () => {
        setUnlockingId(candidate.id);
        try {
          const res = await fetch("/api/candidates/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ candidateId: candidate.id, employerId }),
          });
          const result = await res.json();
          if (result.success) {
            message.success(`Contact unlocked for ${candidate.name}!`);
            setEmployerCredits(result.remainingCredits);
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === candidate.id
                  ? {
                      ...c,
                      isUnlocked: true,
                      displayPhone: result.candidate.realPhone,
                      whatsappUrl: result.candidate.whatsappUrl,
                    }
                  : c
              )
            );
          } else {
            message.error(result.error || "Failed to unlock candidate");
          }
        } catch {
          message.error("Failed to unlock candidate due to server error");
        } finally {
          setUnlockingId(null);
        }
      },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCity("all");
    setRole("all");
    setQualification("all");
    setGender("all");
    setMinExp(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Credit Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 md:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              WorkIndia Candidate Database
            </span>
            <span className="text-xs text-slate-300">10,00,000+ Verified Job Seekers</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mt-1 text-white">
            Direct Candidate Search & Resume Bank
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Proactively search active frontline & executive talent. Instant mobile number unlock & WhatsApp chat.
          </p>
        </div>

        {/* Credit Badge & Recharge Button */}
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-3.5 flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-start">
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Available Credits
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ThunderboltFilled className="text-amber-400 text-base" />
              <span className="text-2xl font-black text-amber-300">{employerCredits}</span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                ({unlockedCount} unlocked)
              </span>
            </div>
          </div>
          <Button
            type="primary"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none shadow px-4"
            onClick={onOpenPricingModal}
          >
            Recharge Credits
          </Button>
        </div>
      </div>

      {/* Structured Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Input
            placeholder="Search candidate name, role, or skills (e.g., Telecaller, Tally, Sales, React)..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 text-sm flex-1"
            allowClear
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              icon={<FilterOutlined />}
              onClick={fetchCandidates}
              type="primary"
              className="bg-blue-600 hover:bg-blue-700 h-10 px-5"
            >
              Search
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
              className="h-10"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-[11px] text-gray-500 font-medium mb-1">City</label>
            <Select
              value={city}
              onChange={setCity}
              className="w-full"
              size="middle"
              options={[
                { value: "all", label: "All Cities" },
                { value: "Delhi", label: "Delhi NCR" },
                { value: "Mumbai", label: "Mumbai" },
                { value: "Bengaluru", label: "Bengaluru" },
                { value: "Pune", label: "Pune" },
                { value: "Hyderabad", label: "Hyderabad" },
                { value: "Kolkata", label: "Kolkata" },
                { value: "Chennai", label: "Chennai" },
                { value: "Ahmedabad", label: "Ahmedabad" },
                { value: "Jaipur", label: "Jaipur" },
                { value: "Kanpur", label: "Kanpur" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 font-medium mb-1">Category / Role</label>
            <Select
              value={role}
              onChange={setRole}
              className="w-full"
              size="middle"
              options={[
                { value: "all", label: "All Roles" },
                { value: "Telecaller", label: "Telecaller / BPO" },
                { value: "Back Office", label: "Back Office / Data Entry" },
                { value: "Sales", label: "Field Sales & Marketing" },
                { value: "Accountant", label: "Accountant / GST" },
                { value: "Delivery", label: "Delivery & Logistics" },
                { value: "Driver", label: "Driver" },
                { value: "Security", label: "Security Guard" },
                { value: "Retail", label: "Retail / Counter Sales" },
                { value: "Developer", label: "Software / IT" },
                { value: "Nurse", label: "Healthcare / Nurse" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 font-medium mb-1">Min Experience</label>
            <Select
              value={minExp}
              onChange={setMinExp}
              className="w-full"
              size="middle"
              options={[
                { value: 0, label: "Any Experience" },
                { value: 1, label: "1+ Years" },
                { value: 2, label: "2+ Years" },
                { value: 3, label: "3+ Years" },
                { value: 5, label: "5+ Years" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 font-medium mb-1">Education</label>
            <Select
              value={qualification}
              onChange={setQualification}
              className="w-full"
              size="middle"
              options={[
                { value: "all", label: "Any Qualification" },
                { value: "10th Pass", label: "10th Pass" },
                { value: "12th Pass", label: "12th Pass" },
                { value: "Diploma", label: "Diploma / ITI" },
                { value: "Graduate", label: "Graduate" },
                { value: "Post Graduate", label: "Post Graduate" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 font-medium mb-1">Gender</label>
            <Select
              value={gender}
              onChange={setGender}
              className="w-full"
              size="middle"
              options={[
                { value: "all", label: "All Genders" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Result Count Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong>{candidates.length}</strong> matching candidates
        </span>
        <span className="text-[11px]">
          1 Contact Unlock = 1 Credit • Permanent Access
        </span>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" tip="Loading verified candidate database..." />
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Empty
            description={
              <div className="space-y-1">
                <p className="font-semibold text-gray-700">No candidates found for selected criteria</p>
                <p className="text-xs text-gray-400">Try broadening your search or resetting filters</p>
              </div>
            }
          >
            <Button onClick={resetFilters} type="primary" className="bg-blue-600">
              Clear All Filters
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header: Name, Verified Tag, Last Active */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-gray-900 text-sm">{candidate.name}</h3>
                        {candidate.verified && (
                          <CheckCircleFilled className="text-emerald-500 text-xs" title="WorkIndia Verified Profile" />
                        )}
                      </div>
                      <div className="text-xs text-blue-700 font-medium">{candidate.role}</div>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {candidate.lastActive}
                  </span>
                </div>

                {/* Candidate Vital Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <EnvironmentOutlined className="text-gray-400 text-xs" />
                    <span className="truncate">{candidate.locality}, {candidate.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockCircleOutlined className="text-gray-400 text-xs" />
                    <span>{candidate.experience}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOutlined className="text-gray-400 text-xs" />
                    <span>{candidate.qualification}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserOutlined className="text-gray-400 text-xs" />
                    <span>{candidate.gender}, {candidate.age} yrs</span>
                  </div>
                </div>

                {/* Expected Salary & English */}
                <div className="flex items-center justify-between text-xs mt-2.5 px-0.5">
                  <span className="text-emerald-700 font-semibold">{candidate.expectedSalary}</span>
                  <Tag className="mr-0 text-[10px] text-gray-600 bg-white border-gray-200">
                    {candidate.englishLevel}
                  </Tag>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {candidate.summary}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {candidate.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-[10px] text-gray-400 self-center">
                      +{candidate.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer: Locked vs Unlocked */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                {candidate.isUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <PhoneOutlined />
                        <span>{candidate.displayPhone}</span>
                      </div>
                      <Badge status="success" text="Unlocked" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${candidate.displayPhone}`}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-black text-white transition-colors"
                      >
                        <PhoneOutlined /> Call Now
                      </a>
                      {candidate.whatsappUrl && (
                        <a
                          href={candidate.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          <WhatsAppOutlined /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-mono text-gray-400 tracking-wider">
                      {candidate.displayPhone}
                    </div>
                    <Button
                      type="primary"
                      icon={<UnlockOutlined />}
                      loading={unlockingId === candidate.id}
                      onClick={() => handleUnlockCandidate(candidate)}
                      className="bg-blue-600 hover:bg-blue-700 text-xs font-medium h-8"
                    >
                      Unlock Contact (1 Credit)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

