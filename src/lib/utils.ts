import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthlyToLpa(monthly: number): number {
  if (!monthly || isNaN(monthly) || monthly <= 0) return 0;
  return Math.round(((monthly * 12) / 100000) * 10) / 10;
}

export function lpaToMonthly(lpa: number): number {
  if (!lpa || isNaN(lpa) || lpa <= 0) return 0;
  return Math.round((lpa * 100000) / 12);
}

export function formatMonthlySalary(monthly: number): string {
  if (!monthly || isNaN(monthly) || monthly <= 0) return "₹0/mo";
  if (monthly >= 100000) {
    return `₹${(monthly / 100000).toFixed(1)}L/mo`;
  }
  if (monthly >= 1000) {
    return `₹${Math.round(monthly / 1000)}k/mo`;
  }
  return `₹${monthly.toLocaleString("en-IN")}/mo`;
}

export function formatSalary(min: number, max: number, currency: string = "INR"): string {
  if (currency === "INR") {
    const minMo = lpaToMonthly(min);
    const maxMo = lpaToMonthly(max);
    if (minMo > 0 && maxMo > 0) {
      return `₹${min} - ₹${max} LPA (~${formatMonthlySalary(minMo)} - ${formatMonthlySalary(maxMo)})`;
    }
    return `₹${min} - ₹${max} LPA`;
  }
  return `$${min}k - $${max}k`;
}

export function formatSalaryDual(min: number, max: number): { lpa: string; monthly: string; full: string } {
  const minMo = lpaToMonthly(min);
  const maxMo = lpaToMonthly(max);
  const lpa = `₹${min} - ₹${max} LPA`;
  const monthly = `${formatMonthlySalary(minMo)} - ${formatMonthlySalary(maxMo)}`;
  return {
    lpa,
    monthly,
    full: `${lpa} (~${monthly})`,
  };
}

export function getDaysRemaining(expiresAt?: string | Date): { days: number; isExpired: boolean; label: string } {
  if (!expiresAt) {
    return { days: 30, isExpired: false, label: "Active" };
  }
  const expDate = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expDate - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return { days: 0, isExpired: true, label: "Expired" };
  }
  if (days === 1) {
    return { days: 1, isExpired: false, label: "Expires today" };
  }
  return { days, isExpired: false, label: `Expires in ${days} days` };
}

export function timeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export interface JobMatchBreakdown {
  score: number; // 35 to 99
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  roleMatch: boolean;
  salaryMatch: boolean;
  experienceMatch: boolean;
  reasons: string[];
  level: "Excellent Match" | "Strong Match" | "Good Match" | "Potential Match";
}

/**
 * Intelligent Job Recommendation & Profile Requirement Matcher.
 * Matches candidate's profile (skills, headline, location, experience, expected salary)
 * with the job opening's requirements and returns an accurate score & breakdown.
 */
export function calculateJobMatchScore(
  user: any | null,
  job: any
): JobMatchBreakdown {
  if (!job) {
    return {
      score: 50,
      matchedSkills: [],
      missingSkills: [],
      locationMatch: false,
      roleMatch: false,
      salaryMatch: false,
      experienceMatch: false,
      reasons: [],
      level: "Potential Match",
    };
  }

  // Baseline if guest (no candidate profile yet)
  if (!user || user.role === "employer") {
    const seed = (job._id ? job._id.charCodeAt(job._id.length - 1) : 7) % 20;
    const score = 75 + seed;
    return {
      score,
      matchedSkills: (job.skills || []).slice(0, 2),
      missingSkills: [],
      locationMatch: true,
      roleMatch: true,
      salaryMatch: true,
      experienceMatch: true,
      reasons: ["Top trending opening in your region"],
      level: score >= 88 ? "Excellent Match" : score >= 75 ? "Strong Match" : "Good Match",
    };
  }

  const userSkills: string[] = Array.isArray(user.skills)
    ? user.skills.map((s: string) => s.toLowerCase().trim())
    : [];
  const jobSkills: string[] = Array.isArray(job.skills)
    ? job.skills.map((s: string) => s.toLowerCase().trim())
    : [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((jSkill: string) => {
    const isMatch = userSkills.some(
      (uSkill) => uSkill === jSkill || uSkill.includes(jSkill) || jSkill.includes(uSkill)
    );
    if (isMatch) matchedSkills.push(jSkill);
    else missingSkills.push(jSkill);
  });

  const reasons: string[] = [];
  let score = 0;

  // 1. Skill Match (up to 40 pts)
  if (jobSkills.length > 0) {
    const skillRatio = matchedSkills.length / jobSkills.length;
    const skillScore = Math.round(skillRatio * 40);
    score += skillScore;
    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} of ${jobSkills.length} key skills match`);
    }
  } else {
    score += 30; // no rigid skills specified
  }

  // 2. Role / Headline Match (up to 25 pts)
  const userHeadline = `${user.headline || ""} ${user.role || ""} ${user.careerPreferences?.desiredRole || ""}`.toLowerCase();
  const jobTitle = (job.title || "").toLowerCase();
  const titleTokens = jobTitle.split(/[\s,/-]+/).filter((w: string) => w.length > 2);
  const roleMatch = titleTokens.some((token: string) => userHeadline.includes(token));
  if (roleMatch) {
    score += 25;
    reasons.push("Matches your desired job title and role headline");
  } else if (matchedSkills.length >= 2) {
    score += 15;
    reasons.push("Relevant domain expertise");
  } else {
    score += 8;
  }

  // 3. Location Match (up to 15 pts)
  const isRemote = job.workplaceType === "Remote" || (job.location || "").toLowerCase().includes("remote");
  const userLoc = (user.location || "").toLowerCase();
  const jobLoc = (job.location || "").toLowerCase();
  let locationMatch = isRemote;
  if (!locationMatch && userLoc && jobLoc) {
    const userCities = userLoc.split(/[\s,]+/).filter((c: string) => c.length > 2);
    locationMatch = userCities.some((c: string) => jobLoc.includes(c));
  }

  if (locationMatch) {
    score += 15;
    reasons.push(isRemote ? "Remote / Work From Home friendly" : "Located in your preferred city");
  } else {
    score += 5;
  }

  // 4. Experience Match (up to 10 pts)
  const userExpYears = Number(user.experienceYears) || (user.experienceHistory?.length || 0);
  const jobExp = (job.experienceLevel || "").toLowerCase();
  let experienceMatch = false;
  if (jobExp.includes("fresher") && userExpYears <= 1) experienceMatch = true;
  else if (jobExp.includes("mid") && userExpYears >= 1) experienceMatch = true;
  else if (jobExp.includes("senior") && userExpYears >= 3) experienceMatch = true;
  else if (userExpYears > 0) experienceMatch = true;

  if (experienceMatch) {
    score += 10;
    reasons.push("Experience requirement matches your profile");
  } else {
    score += 5;
  }

  // 5. Salary Match (up to 10 pts)
  const userCtc = Number(user.expectedCtc) || 0;
  let salaryMatch = false;
  if (userCtc > 0 && job.salaryMax) {
    salaryMatch = userCtc <= job.salaryMax * 1.25;
  } else {
    salaryMatch = true;
  }

  if (salaryMatch) {
    score += 10;
    reasons.push("Compensation aligns with your expected salary");
  } else {
    score += 4;
  }

  const finalScore = Math.min(Math.max(score, 35), 99);

  let level: "Excellent Match" | "Strong Match" | "Good Match" | "Potential Match" = "Potential Match";
  if (finalScore >= 88) level = "Excellent Match";
  else if (finalScore >= 75) level = "Strong Match";
  else if (finalScore >= 60) level = "Good Match";

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    locationMatch,
    roleMatch,
    salaryMatch,
    experienceMatch,
    reasons,
    level,
  };
}
