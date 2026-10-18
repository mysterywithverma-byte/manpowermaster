import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, INITIAL_USERS } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return NextResponse.json({ success: true, user });
      }
    }

    // Fallback store
    const user = inMemoryStore.getUserByEmail(email) || INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return NextResponse.json({ success: true, user });
    }

    // Quick auto-provision for test accounts if user typed something new
    const newUser = inMemoryStore.addUser({
      name: email.split("@")[0],
      email: email.toLowerCase(),
      role: "seeker",
      headline: "Software Professional",
      bio: "Passionate developer exploring exciting opportunities.",
      phone: "+91 98000 00000",
      location: "Bengaluru, India",
      skills: ["React", "JavaScript", "TypeScript"],
      resumeUrl: "",
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
