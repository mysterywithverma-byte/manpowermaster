import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, INITIAL_USERS } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const { email, name, role = "seeker", companyName } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || cleanEmail.split("@")[0];

    // Block any attempt to log in as admin via public candidate/employer login form
    if (cleanEmail === "admin@manpowermaster.com" || cleanEmail === "admin" || role === "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator authentication is strictly restricted to the official Admin Portal at /admin",
        },
        { status: 403 }
      );
    }

    const userRole: "seeker" | "employer" = role === "employer" ? "employer" : "seeker";

    const db = await connectToDatabase();

    if (db) {
      let user = await User.findOne({ email: cleanEmail });
      if (user) {
        if (name && name.trim() && user.name !== name.trim()) {
          user.name = name.trim();
          await user.save();
        }
        return NextResponse.json({ success: true, user });
      }

      // Create new user in MongoDB directly
      user = await User.create({
        name: displayName,
        email: cleanEmail,
        role: userRole,
        headline: userRole === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
        companyName: companyName || "",
        location: "India",
        skills: ["Communication", "Problem Solving"],
        savedJobs: [],
        isVerified: false,
      });
      return NextResponse.json({ success: true, user });
    }

    // Fallback store
    let user = inMemoryStore.getUserByEmail(cleanEmail) || INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      if (name && name.trim() && user.name !== name.trim()) {
        user = inMemoryStore.updateUser(user._id, { name: name.trim() }) || user;
      }
      return NextResponse.json({ success: true, user });
    }

    // Auto-provision with real name and chosen role
    const newUser = inMemoryStore.addUser({
      name: displayName,
      email: cleanEmail,
      role: userRole,
      companyName: companyName || "",
      headline: userRole === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
      bio: "Member of Manpower Master platform.",
      phone: "+91 98000 00000",
      location: "India",
      skills: ["Problem Solving"],
      resumeUrl: "",
      isVerified: false,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
