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

    const db = await connectToDatabase();

    if (db) {
      let user = await User.findOne({ email: cleanEmail });
      if (user) {
        // If user logged in with a real name and DB still has email-prefix name, update it
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
        role: role || "seeker",
        headline: role === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
        companyName: companyName || "",
        location: "India",
        skills: ["Communication", "Problem Solving"],
        savedJobs: [],
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
      role: role || "seeker",
      companyName: companyName || "",
      headline: role === "employer" ? `Recruiter @ ${companyName || "Company"}` : "Job Seeker",
      bio: "Member of JobNexus India ecosystem.",
      phone: "+91 98000 00000",
      location: "India",
      skills: ["Problem Solving"],
      resumeUrl: "",
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
