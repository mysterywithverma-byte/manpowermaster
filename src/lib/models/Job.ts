import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  workplaceType: "Remote" | "On-site" | "Hybrid";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryMonthlyMin?: number;
  salaryMonthlyMax?: number;
  experienceLevel: "Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  openingsCount?: number;
  qualification?: string;
  shiftTiming?: string;
  workingDays?: string;
  genderPreference?: string;
  englishLevel?: string;
  requiredAssets?: string[];
  interviewMode?: string;
  interviewAddress?: string;
  interviewStartDate?: string;
  interviewEndDate?: string;
  interviewTimeSlot?: string;
  recruiterWhatsApp?: string;
  callingDays?: string[];
  callingTimeStart?: string;
  callingTimeEnd?: string;
  callingHoursSummary?: string;
  urgentHiring?: boolean;
  expiryDays?: number;
  expiresAt?: Date;
  postedBy: mongoose.Types.ObjectId | string;
  applicantsCount: number;
  featured: boolean;
  isVerified?: boolean;
  otherRequirements?: string;
  contactConsent?: boolean;
  contactPerson?: string;
  contactEmail?: string;
  jobCategory?: string;
  probationPeriod?: string;
  perkTags?: string[];
  agePreference?: string;
  languagesRequired?: string[];
  noticePeriod?: string;
  referralBonus?: string;
  branchId?: string;
  branchName?: string;
  status: "active" | "closed" | "filled" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    companyLogo: { type: String, default: "" },
    location: { type: String, required: true, index: true },
    workplaceType: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "Hybrid",
    },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    salaryCurrency: { type: String, default: "INR" },
    salaryMonthlyMin: { type: Number },
    salaryMonthlyMax: { type: Number },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Mid-Level", "Senior", "Lead", "Executive"],
      default: "Mid-Level",
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    openingsCount: { type: Number, default: 1 },
    qualification: { type: String, default: "Any Graduate" },
    shiftTiming: { type: String, default: "Day Shift" },
    workingDays: { type: String, default: "6 Days (Mon-Sat)" },
    genderPreference: { type: String, default: "Any" },
    englishLevel: { type: String, default: "Basic English" },
    requiredAssets: { type: [String], default: [] },
    interviewMode: { type: String, default: "Telephonic" },
    interviewAddress: { type: String, default: "" },
    interviewStartDate: { type: String, default: "" },
    interviewEndDate: { type: String, default: "" },
    interviewTimeSlot: { type: String, default: "" },
    recruiterWhatsApp: { type: String, default: "" },
    callingDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    callingTimeStart: { type: String, default: "09:30 AM" },
    callingTimeEnd: { type: String, default: "06:30 PM" },
    callingHoursSummary: { type: String, default: "Mon-Sat (09:30 AM - 06:30 PM)" },
    urgentHiring: { type: Boolean, default: false },
    otherRequirements: { type: String, default: "" },
    contactConsent: { type: Boolean, default: true },
    contactPerson: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    jobCategory: { type: String, default: "" },
    probationPeriod: { type: String, default: "" },
    perkTags: { type: [String], default: [] },
    agePreference: { type: String, default: "" },
    languagesRequired: { type: [String], default: [] },
    noticePeriod: { type: String, default: "" },
    referralBonus: { type: String, default: "" },
    branchId: { type: String, default: "" },
    branchName: { type: String, default: "" },
    expiryDays: { type: Number, default: 30 },
    expiresAt: { type: Date, index: true },
    postedBy: { type: Schema.Types.Mixed, required: true, index: true },
    applicantsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "closed", "filled", "expired"], default: "active", index: true },
  },
  {
    timestamps: true,
  }
);

export const Job = models.Job || model<IJob>("Job", JobSchema);
