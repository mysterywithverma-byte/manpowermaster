import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { Application } from "@/lib/models/Application";
import { inMemoryStore, INITIAL_USERS } from "@/lib/mock-data";

export async function POST() {
  try {
    // 1. Purge from in-memory store
    inMemoryStore.jobs = [];
    inMemoryStore.applications = [];
    inMemoryStore.users = [...INITIAL_USERS];

    // 2. Purge from MongoDB if connected
    const db = await connectToDatabase();
    if (db) {
      await Job.deleteMany({});
      await Application.deleteMany({});
      // Remove mock test users while preserving real ones and admin
      await (await import("@/lib/models/User")).User.deleteMany({
        email: { $in: ["aarav@example.com", "recruiter@razorpay.com", "admin@jobnexus.in"] },
      });
    }

    return NextResponse.json({
      success: true,
      message: "All fake jobs and mock test data have been permanently removed. System is 100% clean for live production postings.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to purge mock data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
