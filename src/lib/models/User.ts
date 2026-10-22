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
  currentCtc?: number;
  workStatus?: "fresher" | "experienced";
  candidateType?: "fresher" | "experienced";
  profileCompleted?: boolean;
  education?: any[];
  experienceHistory?: any[];
  itSkills?: any[];
  projects?: any[];
  accomplishments?: any;
  careerPreferences?: any;
  personalDetails?: any;
  employerDetails?: {
    companyName?: string;
    companyType?: string;
    industry?: string;
    recruiterDesignation?: string;
    website?: string;
    gstin?: string;
    cin?: string;
    companySize?: string;
    officeAddress?: string;
    city?: string;
    state?: string;
    hiringRoles?: string[];
  };
  savedJobs: string[];
  companyName?: string;
  companyLogo?: string;
  avatar?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
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
    currentCtc: { type: Number, default: 0 },
    workStatus: { type: String, enum: ["fresher", "experienced"], default: "fresher" },
    candidateType: { type: String, enum: ["fresher", "experienced"], default: "fresher" },
    profileCompleted: { type: Boolean, default: false },
    education: { type: Schema.Types.Mixed, default: [] },
    experienceHistory: { type: Schema.Types.Mixed, default: [] },
    itSkills: { type: Schema.Types.Mixed, default: [] },
    projects: { type: Schema.Types.Mixed, default: [] },
    accomplishments: { type: Schema.Types.Mixed, default: {} },
    careerPreferences: { type: Schema.Types.Mixed, default: {} },
    personalDetails: { type: Schema.Types.Mixed, default: {} },
    employerDetails: { type: Schema.Types.Mixed, default: {} },
    savedJobs: { type: [String], default: [] },
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const User = models.User || model<IUser>("User", UserSchema);
