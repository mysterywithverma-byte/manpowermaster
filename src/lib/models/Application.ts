import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId | string;
  applicantId: mongoose.Types.ObjectId | string;
  status: "Applied" | "Shortlisted" | "Interviewed" | "Hired" | "Rejected";
  coverNote?: string;
  resumeUrl?: string;
  applicantDetails: {
    name: string;
    email: string;
    phone?: string;
    experienceYears?: number;
    portfolioUrl?: string;
    currentCompany?: string;
  };
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.Mixed, required: true, index: true },
    applicantId: { type: Schema.Types.Mixed, required: true, index: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"],
      default: "Applied",
      index: true,
    },
    coverNote: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    applicantDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      experienceYears: { type: Number, default: 0 },
      portfolioUrl: { type: String, default: "" },
      currentCompany: { type: String, default: "" },
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && models.Application) {
  delete (models as Record<string, unknown>).Application;
}

export const Application = models.Application || model<IApplication>("Application", ApplicationSchema);
