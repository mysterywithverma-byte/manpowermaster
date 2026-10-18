import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "seeker" | "employer" | "admin";
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  noticePeriod?: string;
  expectedCtc?: number;
  education?: any[];
  experienceHistory?: any[];
  savedJobs: string[];
  companyName?: string;
  companyLogo?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["seeker", "employer", "admin"],
      default: "seeker",
      required: true,
    },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    noticePeriod: { type: String, default: "Immediate" },
    expectedCtc: { type: Number, default: 0 },
    education: { type: Schema.Types.Mixed, default: [] },
    experienceHistory: { type: Schema.Types.Mixed, default: [] },
    savedJobs: { type: [String], default: [] },
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const User = models.User || model<IUser>("User", UserSchema);
