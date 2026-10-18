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
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  {
    timestamps: true,
  }
);

export const Job = models.Job || model<IJob>("Job", JobSchema);
