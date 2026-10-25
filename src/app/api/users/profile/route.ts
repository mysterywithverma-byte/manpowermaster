import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore } from "@/lib/mock-data";

async function handleProfileUpdate(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both nested { userId, profileData } and flat profile payload { name, email, ... }
    const profileData = body.profileData || body;
    const userId = body.userId || profileData.id || profileData._id;
    const email = (body.email || profileData.email)?.toLowerCase();

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "Either userId or email is required to update profile" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // 1. Try updating in MongoDB Atlas
    let updatedUser = null;
    if (db) {
      // Disallow updating critical system fields directly through general profile edit
      const sanitizedUpdates = { ...profileData };
      delete sanitizedUpdates.password;
      delete sanitizedUpdates._id;
      delete sanitizedUpdates.id;

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: sanitizedUpdates },
          { new: true, upsert: false }
        );
      } else if (email) {
        updatedUser = await User.findOneAndUpdate(
          { email },
          { $set: sanitizedUpdates },
          { new: true, upsert: false }
        );
      }
    }

    if (updatedUser) {
      const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      delete userObj.password;
      return NextResponse.json({
        success: true,
        source: "mongodb",
        user: {
          ...userObj,
          _id: updatedUser._id.toString(),
          id: updatedUser._id.toString(),
        },
      });
    }

    // 2. Fallback to in-memory store
    const memId = userId || (email ? "user-seeker-1" : undefined);
    const memUser = inMemoryStore.getUser(memId);
    if (memUser) {
      Object.assign(memUser, profileData);
      return NextResponse.json({ success: true, source: "in-memory", user: memUser });
    }

    return NextResponse.json({ success: true, source: "mock", user: profileData });
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    const message = error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase();
  const userId = searchParams.get("userId");

  try {
    const db = await connectToDatabase();
    let user = null;

    if (db) {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId).lean();
      } else if (email) {
        user = await User.findOne({ email }).lean();
      }
    }

    // In-memory fallback
    if (!user) {
      user = (email ? inMemoryStore.getUserByEmail(email) : null) || (userId ? inMemoryStore.getUser(userId) : null);
    }

    if (user) {
      return NextResponse.json({ success: true, user });
    }
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Profile fetch error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
