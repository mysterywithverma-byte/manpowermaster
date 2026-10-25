import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
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
      const user = await User.findById(id).lean();
      if (user) {
        return NextResponse.json({ success: true, source: "mongodb", user });
      }
    }

    const user = inMemoryStore.getUser(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, source: "in-memory", user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve user";
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

    // Allowed updates from Admin (e.g., isVerified / blue tick, role, isBlocked, isReported, reportReason, blockedReason)
    const allowedFields = [
      "isVerified",
      "role",
      "isBlocked",
      "isReported",
      "reportReason",
      "blockedReason",
      "companyName",
      "name",
      "headline",
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    let deletedJobsCount = 0;

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const userDoc = await User.findById(id);
      if (userDoc) {
        Object.assign(userDoc, updates);
        await userDoc.save();

        // If employer is blocked and deleteJobs requested, delete all their posted jobs
        if (updates.isBlocked === true && body.deleteJobs) {
          const res = await Job.deleteMany({
            $or: [
              { postedBy: id },
              { postedBy: userDoc.email },
              { company: userDoc.companyName || "" },
            ],
          });
          deletedJobsCount = res.deletedCount || 0;
        }

        return NextResponse.json({
          success: true,
          source: "mongodb",
          user: userDoc.toObject(),
          deletedJobsCount,
        });
      }
    }

    // In-memory fallback
    const memUser = inMemoryStore.getUser(id);
    const userEmail = memUser?.email;
    const userCompany = memUser?.companyName;

    const memUpdated = inMemoryStore.updateUser(id, updates);
    if (memUpdated) {
      if (updates.isBlocked === true && body.deleteJobs) {
        const initialCount = inMemoryStore.jobs.length;
        inMemoryStore.jobs = inMemoryStore.jobs.filter((j) => {
          const matchPoster = j.postedBy === id || (userEmail && j.postedBy === userEmail);
          const matchCompany = userCompany && j.company?.toLowerCase() === userCompany.toLowerCase();
          return !matchPoster && !matchCompany;
        });
        deletedJobsCount = initialCount - inMemoryStore.jobs.length;
      }

      return NextResponse.json({
        success: true,
        source: "in-memory",
        user: memUpdated,
        deletedJobsCount,
      });
    }

    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user";
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
      await User.findByIdAndDelete(id);
      // Clean up jobs posted by user
      await Job.deleteMany({ postedBy: id });
      return NextResponse.json({ success: true, source: "mongodb", message: "User deleted successfully" });
    }

    const removed = inMemoryStore.deleteUser(id);
    if (removed) {
      return NextResponse.json({ success: true, source: "in-memory", message: "User deleted successfully" });
    }

    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
