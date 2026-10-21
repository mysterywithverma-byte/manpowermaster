import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { inMemoryStore } from "@/lib/mock-data";
import mongoose from "mongoose";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const job = await Job.findById(id).lean();
      if (job) {
        return NextResponse.json({ success: true, source: "mongodb", data: job });
      }
    }

    const job = inMemoryStore.getJobById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, source: "in-memory", data: job });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await connectToDatabase();

    const allowed = ["featured", "status", "isVerified", "title", "company", "location", "salaryMin", "salaryMax"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Job.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      if (updated) {
        return NextResponse.json({ success: true, source: "mongodb", data: updated });
      }
    }

    const memUpdated = inMemoryStore.updateJob(id, updates);
    if (memUpdated) {
      return NextResponse.json({ success: true, source: "in-memory", data: memUpdated });
    }

    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      await Job.findByIdAndDelete(id);
      return NextResponse.json({ success: true, source: "mongodb", message: "Job deleted successfully" });
    }

    const removed = inMemoryStore.deleteJob(id);
    if (removed) {
      return NextResponse.json({ success: true, source: "in-memory", message: "Job deleted successfully" });
    }

    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
