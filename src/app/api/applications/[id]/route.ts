import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Application } from "@/lib/models/Application";
import { inMemoryStore, MockApplication } from "@/lib/mock-data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const updated = await Application.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, source: "mongodb", data: updated });
    }

    // In-memory fallback
    const updated = inMemoryStore.updateApplicationStatus(
      id,
      status as MockApplication["status"]
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, source: "in-memory", data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
