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
  experienceLevel: "Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  postedBy: mongoose.Types.ObjectId | string;
  applicantsCount: number;
  featured: boolean;
  isVerified?: boolean;
  status: "active" | "closed";
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
    postedBy: { type: Schema.Types.Mixed, required: true, index: true },
    applicantsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production" && models.Job) {
  delete (models as Record<string, unknown>).Job;
}

export const Job = models.Job || model<IJob>("Job", JobSchema);
