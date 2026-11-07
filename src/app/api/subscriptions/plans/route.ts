import { NextResponse } from "next/server";

export interface PricingPlan {
  id: string;
  targetRole: "employer" | "seeker";
  name: string;
  badge?: string;
  popular?: boolean;
  price: number;
  originalPrice: number;
  discountPercent: number;
  durationDays: number;
  durationLabel: string;
  credits: number;
  activeJobLimit?: number;
  jobBoostMultiplier?: number;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  // Employer Plans (WorkIndia structure)
  {
    id: "employer_starter",
    targetRole: "employer",
    name: "Starter Hire",
    badge: "Quick Hiring",
    popular: false,
    price: 2350,
    originalPrice: 3500,
    discountPercent: 33,
    durationDays: 30,
    durationLabel: "30 Days Validity",
    credits: 100,
    activeJobLimit: 3,
    jobBoostMultiplier: 2,
    features: [
      "100 Candidate Contact Unlocks",
      "Up to 3 Live Active Jobs",
      "Direct WhatsApp & Phone Connect",
      "2x Smart Job Booster",
      "Standard Email & Chat Support",
    ],
  },
  {
    id: "employer_growth",
    targetRole: "employer",
    name: "Growth Scaler",
    badge: "Most Popular",
    popular: true,
    price: 4900,
    originalPrice: 8500,
    discountPercent: 42,
    durationDays: 90,
    durationLabel: "90 Days Validity",
    credits: 300,
    activeJobLimit: 8,
    jobBoostMultiplier: 5,
    features: [
      "300 Candidate Contact Unlocks",
      "Up to 8 Live Active Jobs",
      "5x High Priority Job Rank",
      "Direct Recruiter WhatsApp Call Link",
      "Dedicated Account Manager",
      "Bulk Candidate Excel Export",
    ],
  },
  {
    id: "employer_enterprise",
    targetRole: "employer",
    name: "Enterprise Annual",
    badge: "Best Value",
    popular: false,
    price: 11999,
    originalPrice: 22000,
    discountPercent: 45,
    durationDays: 365,
    durationLabel: "365 Days (1 Year)",
    credits: 1200,
    activeJobLimit: 25,
    jobBoostMultiplier: 10,
    features: [
      "1,200 Candidate Contact Unlocks",
      "Up to 25 Live Active Jobs",
      "10x Maximum Applicant Boost",
      "Instant Candidate SMS Alerts",
      "Dedicated Talent Partner & Custom Branding",
      "Zero Downtime Replacement Support",
    ],
  },

  // Job Seeker Plans (WorkIndia VIP Pass)
  {
    id: "seeker_vip_monthly",
    targetRole: "seeker",
    name: "Job Seeker VIP Pass (Monthly)",
    badge: "Fast-Track",
    popular: true,
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    durationDays: 30,
    durationLabel: "30 Days",
    credits: 0,
    features: [
      "Direct WhatsApp Chat with Verified HRs",
      "Top 1% Priority Application Badge",
      "Instant SMS & WhatsApp Job Alerts for new openings",
      "Exclusive Access to High-Paying Verified Roles",
      "Profile Highlighted with Gold Verified Tick",
    ],
  },
  {
    id: "seeker_vip_quarterly",
    targetRole: "seeker",
    name: "Job Seeker VIP Pass (3 Months)",
    badge: "Save 60%",
    popular: false,
    price: 449,
    originalPrice: 1199,
    discountPercent: 62,
    durationDays: 90,
    durationLabel: "90 Days",
    credits: 0,
    features: [
      "All VIP Monthly Features included",
      "Guaranteed Recruiter Callback Guarantee",
      "Priority Interview Scheduling Assistance",
      "Dedicated Resume Scoring & ATS Optimization",
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    plans: PRICING_PLANS,
  });
}

