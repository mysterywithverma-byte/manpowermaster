import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { inMemoryStore } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const job = await Job.findById(id).lean();
      if (!job) {
        return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, source: "mongodb", data: job });
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
