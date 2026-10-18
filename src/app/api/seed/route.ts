import { NextResponse } from "next/server";
import { connectToDatabase, isDbConnected } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import { Application } from "@/lib/models/Application";
import { INITIAL_USERS, INITIAL_JOBS, INITIAL_APPLICATIONS, inMemoryStore } from "@/lib/mock-data";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const connected = isDbConnected();

    if (connected && db) {
      const userCount = await User.countDocuments();
      const jobCount = await Job.countDocuments();
      const appCount = await Application.countDocuments();

      return NextResponse.json({
        success: true,
        database: "MongoDB (Live Connection)",
        status: "connected",
        metrics: {
          users: userCount,
          jobs: jobCount,
          applications: appCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      database: "In-Memory Resilient Engine",
      status: "fallback_active",
      note: "MongoDB URI not configured or server offline. Using persistent in-memory data store with live state updates.",
      metrics: {
        users: inMemoryStore.users.length,
        jobs: inMemoryStore.jobs.length,
        applications: inMemoryStore.applications.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Diagnostics check failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        message: "Operating on In-Memory store. Initial test records are pre-loaded and active.",
        mode: "in-memory",
      });
    }

    // Seed into MongoDB
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createdUsers = await User.insertMany(INITIAL_USERS.map(({ _id, ...u }) => u));
    const employerId = createdUsers.find((u) => u.role === "employer")?._id;
    const seekerId = createdUsers.find((u) => u.role === "seeker")?._id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createdJobs = await Job.insertMany(
      INITIAL_JOBS.map(({ _id, postedBy: _p, ...j }) => ({
        ...j,
        postedBy: employerId,
      }))
    );

    if (createdJobs.length > 0 && seekerId) {
      await Application.insertMany(
        INITIAL_APPLICATIONS.map(({ _id, jobId: _j, applicantId: _a, ...a }, idx) => ({
          ...a,
          jobId: createdJobs[idx % createdJobs.length]._id,
          applicantId: seekerId,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with realistic Indian tech ecosystem profiles & job listings!",
      mode: "mongodb",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seeding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
