import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId | string;
  userRole: "employer" | "seeker";
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  creditsAdded: number;
  durationDays: number;
  status: "active" | "expired" | "cancelled";
  paymentMethod: string;
  paymentStatus: "completed" | "pending" | "failed";
  transactionId: string;
  activeJobLimit: number;
  jobBoostMultiplier: number;
  features: string[];
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    userRole: { type: String, enum: ["employer", "seeker"], required: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    creditsAdded: { type: Number, default: 0 },
    durationDays: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    paymentMethod: { type: String, default: "UPI" },
    paymentStatus: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    transactionId: { type: String, required: true, unique: true },
    activeJobLimit: { type: Number, default: 1 },
    jobBoostMultiplier: { type: Number, default: 1 },
    features: { type: [String], default: [] },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Subscription =
  models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);
