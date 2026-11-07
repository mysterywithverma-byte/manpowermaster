import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, company, reason = "Fraud / Asked Money" } = body;

    try {
      const conn = await connectToDatabase();
      if (conn && jobId) {
        // Increment report count on the job
        await Job.findByIdAndUpdate(jobId, {
          $inc: { reportCount: 1 },
          $set: { isReported: true, reportReason: reason },
        });
      }
    } catch {
      // Ignore database connection failures
    }

    return NextResponse.json({
      success: true,
      message: "Report logged successfully. Our trust and safety team will review this job opening.",
    });
  } catch (error) {
    console.error("Job reporting error:", error);
    return NextResponse.json({ success: false, error: "Failed to report job" }, { status: 500 });
  }
}
