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

    await connectToDatabase();

    // 1. Try updating in MongoDB Atlas
    let updatedUser = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: profileData },
        { new: true, upsert: true }
      );
    } else if (email) {
      updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: profileData },
        { new: true, upsert: true }
      );
    }

    if (updatedUser) {
      return NextResponse.json({
        success: true,
        source: "mongodb",
        user: {
          _id: updatedUser._id.toString(),
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar || updatedUser.companyLogo || "",
          phone: updatedUser.phone || "",
          location: updatedUser.location || "",
          headline: updatedUser.headline || "",
          bio: updatedUser.bio || "",
          skills: updatedUser.skills || [],
          noticePeriod: updatedUser.noticePeriod || "Immediate",
          expectedCtc: updatedUser.expectedCtc || 0,
          currentCtc: updatedUser.currentCtc || 0,
          resumeUrl: updatedUser.resumeUrl || "",
          resumeFileName: updatedUser.resumeFileName || "",
          education: updatedUser.education || [],
          experienceHistory: updatedUser.experienceHistory || [],
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
    await connectToDatabase();
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (user) {
      return NextResponse.json({ success: true, user });
    }
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
