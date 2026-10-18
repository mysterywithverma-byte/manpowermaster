import mongoose, { Schema, model, models, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | string;
  jobId?: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: "job_match" | "application_status" | "system";
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    jobId: { type: Schema.Types.Mixed, ref: "Job" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["job_match", "application_status", "system"],
      default: "job_match",
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Notification =
  models.Notification || model<INotification>("Notification", NotificationSchema);
