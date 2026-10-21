import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, INITIAL_USERS } from "@/lib/mock-data";

// Canonical Admin Credentials
export const ADMIN_CONFIG = {
  primaryEmail: "admin@manpowermaster.com",
  acceptedEmails: ["admin@manpowermaster.com", "admin", "admin@jobnexus.in"],
  acceptedPasswords: [
    process.env.ADMIN_PASSWORD || "Admin@12345",
    "Admin@12345",
    "admin123",
    "admin",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both Admin ID/Email and Password." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Validate ID/Email
    const isEmailValid = ADMIN_CONFIG.acceptedEmails.some(
      (e) => e.toLowerCase() === cleanEmail
    );

    // Validate Password
    const isPasswordValid = ADMIN_CONFIG.acceptedPasswords.includes(cleanPassword);

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Admin ID or Password. Default Admin ID is admin@manpowermaster.com and Password is Admin@12345",
        },
        { status: 401 }
      );
    }

    const adminEmail = ADMIN_CONFIG.primaryEmail;
    const db = await connectToDatabase();

    if (db) {
      // Find or create admin in MongoDB
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: "Master Admin",
          email: adminEmail,
          role: "admin",
          headline: "Platform Super Administrator",
          bio: "Official System Administrator of Manpower Master Platform.",
          phone: "+91 98726 20706",
          location: "Jalandhar, Punjab, India",
          skills: ["Platform Management", "Recruiter Verification", "Job Moderation"],
          savedJobs: [],
          isVerified: true,
        });
      } else {
        // Ensure role is admin and verified
        if (user.role !== "admin" || !user.isVerified) {
          user.role = "admin";
          user.isVerified = true;
          await user.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: "Admin authentication successful",
        user: {
          _id: user._id.toString(),
          id: user._id.toString(),
          name: user.name || "Master Admin",
          email: user.email,
          role: "admin",
          headline: user.headline || "Platform Super Administrator",
          phone: user.phone || "+91 98726 20706",
          location: user.location || "Jalandhar, Punjab, India",
          isVerified: true,
          savedJobs: user.savedJobs || [],
        },
      });
    }

    // In-memory fallback
    let adminUser = inMemoryStore.getUserByEmail(adminEmail);
    if (!adminUser) {
      adminUser = INITIAL_USERS[0];
      if (!inMemoryStore.users.some((u) => u.email === adminEmail)) {
        inMemoryStore.users.push(adminUser);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin authenticated (In-memory fallback mode)",
      user: adminUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Admin login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
