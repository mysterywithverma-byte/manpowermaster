import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobId } = body;

    if (!userId || !jobId) {
      return NextResponse.json({ success: false, error: "userId and jobId required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      } else {
        user = await User.findOne({ email: userId });
      }
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      const index = user.savedJobs.indexOf(jobId);
      if (index > -1) {
        user.savedJobs.splice(index, 1);
      } else {
        user.savedJobs.push(jobId);
      }
      await user.save();

      return NextResponse.json({
        success: true,
        source: "mongodb",
        savedJobs: user.savedJobs,
      });
    }

    // In-memory fallback
    const savedJobs = inMemoryStore.toggleSaveJob(userId, jobId);
    return NextResponse.json({
      success: true,
      source: "in-memory",
      savedJobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle bookmark";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
