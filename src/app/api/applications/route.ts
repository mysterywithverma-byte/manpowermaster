import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { inMemoryStore } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get("applicantId");
    const jobId = searchParams.get("jobId");

    // If applicantId is provided but not a valid MongoDB ObjectId (e.g. demo "user-seeker-1")
    if (applicantId && !mongoose.Types.ObjectId.isValid(applicantId)) {
      const apps = inMemoryStore.getApplications(applicantId, jobId || undefined);
      const hydrated = apps.map((app) => ({
        ...app,
        jobId: inMemoryStore.getJobById(app.jobId) || { _id: app.jobId, title: "Role", company: "Company" },
      }));
      return NextResponse.json({ success: true, count: hydrated.length, source: "in-memory", data: hydrated });
    }

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      if (applicantId) query.applicantId = applicantId;
      if (jobId && mongoose.Types.ObjectId.isValid(jobId)) query.jobId = jobId;

      const applications = await Application.find(query)
        .populate("jobId")
        .sort({ appliedAt: -1 })
        .lean();

      return NextResponse.json({ success: true, count: applications.length, source: "mongodb", data: applications });
    }

    // In-memory fallback
    const apps = inMemoryStore.getApplications(
      applicantId || undefined,
      jobId || undefined
    );

    // Hydrate job details for UI convenience
    const hydrated = apps.map((app) => ({
      ...app,
      jobId: inMemoryStore.getJobById(app.jobId) || { _id: app.jobId, title: "Role", company: "Company" },
    }));

    return NextResponse.json({ success: true, count: hydrated.length, source: "in-memory", data: hydrated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch applications";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, applicantId, coverNote, resumeUrl, applicantDetails } = body;

    if (!jobId || !applicantId || !applicantDetails?.name || !applicantDetails?.email) {
      return NextResponse.json(
        { success: false, error: "Missing required application parameters." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    if (db) {
      const existing = await Application.findOne({ jobId, applicantId });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "You have already submitted an application for this position." },
          { status: 409 }
        );
      }

      const application = await Application.create({
        jobId,
        applicantId,
        coverNote,
        resumeUrl,
        applicantDetails,
        status: "Applied",
        appliedAt: new Date(),
      });

      // Increment applicants count on Job
      await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

      return NextResponse.json({ success: true, source: "mongodb", data: application }, { status: 201 });
    }

    // Fallback in-memory
    const newApp = inMemoryStore.addApplication({
      jobId,
      applicantId,
      coverNote: coverNote || "",
      resumeUrl: resumeUrl || "",
      applicantDetails,
    });

    return NextResponse.json({ success: true, source: "in-memory", data: newApp }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Application failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
