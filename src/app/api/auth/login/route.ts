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

    const isAdminEmail = cleanEmail === "admin@manpowermaster.com" || cleanEmail === "admin" || role === "admin";
    const userRole = isAdminEmail ? "admin" : (role || "seeker");

    const db = await connectToDatabase();

    if (db) {
      let user = await User.findOne({ email: cleanEmail });
      if (user) {
        if (isAdminEmail && user.role !== "admin") {
          user.role = "admin";
          user.isVerified = true;
          await user.save();
        } else if (name && name.trim() && user.name !== name.trim()) {
          user.name = name.trim();
          await user.save();
        }
        return NextResponse.json({ success: true, user });
      }

      // Create new user in MongoDB directly
      user = await User.create({
        name: isAdminEmail ? "Master Admin" : displayName,
        email: cleanEmail,
        role: userRole,
        headline: isAdminEmail ? "Platform Super Administrator" : role === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
        companyName: companyName || "",
        location: isAdminEmail ? "Jalandhar, Punjab, India" : "India",
        skills: isAdminEmail ? ["Platform Management", "Recruiter Verification"] : ["Communication", "Problem Solving"],
        savedJobs: [],
        isVerified: isAdminEmail ? true : false,
      });
      return NextResponse.json({ success: true, user });
    }

    // Fallback store
    let user = inMemoryStore.getUserByEmail(cleanEmail) || INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      if (isAdminEmail && user.role !== "admin") {
        user = inMemoryStore.updateUser(user._id, { role: "admin", isVerified: true }) || user;
      } else if (name && name.trim() && user.name !== name.trim()) {
        user = inMemoryStore.updateUser(user._id, { name: name.trim() }) || user;
      }
      return NextResponse.json({ success: true, user });
    }

    // Auto-provision with real name and chosen role
    const newUser = inMemoryStore.addUser({
      name: isAdminEmail ? "Master Admin" : displayName,
      email: cleanEmail,
      role: userRole,
      companyName: companyName || "",
      headline: isAdminEmail ? "Platform Super Administrator" : role === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
      bio: "Member of Manpower Master platform.",
      phone: "+91 98726 20706",
      location: "India",
      skills: ["Problem Solving"],
      resumeUrl: "",
      isVerified: isAdminEmail ? true : false,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
