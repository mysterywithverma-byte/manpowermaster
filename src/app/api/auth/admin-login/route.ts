import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, INITIAL_USERS } from "@/lib/mock-data";

// Canonical Admin Credentials
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@manpowermaster.com").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Constant time dummy compare
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both Administrator ID and Password." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Validate strictly using constant-time comparison
    const isEmailValid = cleanEmail === ADMIN_EMAIL || cleanEmail === "admin";
    const isPasswordValid = safeCompare(cleanPassword, ADMIN_PASSWORD);

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Administrator ID or Password. Access denied.",
        },
        { status: 401 }
      );
    }

    const adminEmail = ADMIN_EMAIL;
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
