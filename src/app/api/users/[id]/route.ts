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

    // Allowed updates from Admin (e.g., isVerified / blue tick, role, isBlocked, companyName, name)
    const allowedFields = ["isVerified", "role", "isBlocked", "companyName", "name", "headline"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      if (updated) {
        return NextResponse.json({ success: true, source: "mongodb", user: updated });
      }
    }

    // In-memory fallback
    const memUpdated = inMemoryStore.updateUser(id, updates);
    if (memUpdated) {
      return NextResponse.json({ success: true, source: "in-memory", user: memUpdated });
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
