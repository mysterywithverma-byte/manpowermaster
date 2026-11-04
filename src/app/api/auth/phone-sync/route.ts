import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const { phone, role = "seeker", firebaseUid } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const userRole: "seeker" | "employer" = role === "employer" ? "employer" : "seeker";

    const db = await connectToDatabase();

    if (db) {
      // 1. Check if user with this phone number already exists
      let user = await User.findOne({ phone: cleanPhone });

      if (user) {
        // Existing user: return full profile data!
        const safeUser = user.toObject ? user.toObject() : { ...user };
        delete safeUser.password;
        return NextResponse.json({ success: true, isNewUser: false, user: safeUser });
      }

      // 2. New User: Auto-register with clean default values
      const defaultName = cleanPhone.replace(/[^0-9]/g, "").slice(-10);
      const generatedEmail = `${defaultName}@phone.manpowermaster.com`;

      // Check if email already taken (edge case)
      const existingEmail = await User.findOne({ email: generatedEmail });
      const finalEmail = existingEmail ? `${defaultName}_${Date.now()}@phone.manpowermaster.com` : generatedEmail;

      user = await User.create({
        name: `User ${defaultName.slice(-4)}`,
        phone: cleanPhone,
        email: finalEmail,
        role: userRole,
        headline: userRole === "employer" ? "Verified Recruiter" : "Job Candidate",
        companyName: userRole === "employer" ? "My Hiring Organization" : "",
        location: "India",
        skills: [],
        savedJobs: [],
        isVerified: true, // Phone verified by Firebase OTP
        profileCompleted: false,
      });

      const safeUser = user.toObject ? user.toObject() : { ...user };
      delete safeUser.password;
      return NextResponse.json({ success: true, isNewUser: true, user: safeUser });
    }

    // In-memory fallback
    let user = inMemoryStore.getUsers().find((u) => u.phone?.replace(/[^0-9]/g, "") === cleanPhone.replace(/[^0-9]/g, ""));
    if (user) {
      return NextResponse.json({ success: true, isNewUser: false, user });
    }

    const defaultName = cleanPhone.replace(/[^0-9]/g, "").slice(-10);
    const newUser = inMemoryStore.addUser({
      name: `User ${defaultName.slice(-4)}`,
      phone: cleanPhone,
      email: `${defaultName}@phone.manpowermaster.com`,
      role: userRole,
      companyName: userRole === "employer" ? "My Hiring Organization" : "",
      headline: userRole === "employer" ? "Verified Recruiter" : "Job Candidate",
      bio: "Member of Manpower Master platform.",
      location: "India",
      skills: [],
      resumeUrl: "",
      isVerified: true,
      profileCompleted: false,
    });

    return NextResponse.json({ success: true, isNewUser: true, user: newUser });
  } catch (error: any) {
    console.error("Phone Auth Sync Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}

