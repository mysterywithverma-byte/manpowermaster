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
  urgentHiring?: boolean;
  expiryDays?: number;
  expiresAt?: Date;
  postedBy: mongoose.Types.ObjectId | string;
  applicantsCount: number;
  featured: boolean;
  isVerified?: boolean;
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
    urgentHiring: { type: Boolean, default: false },
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
