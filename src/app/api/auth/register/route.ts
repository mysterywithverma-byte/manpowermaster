import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      headline,
      companyName,
      location,
      skills,
      phone,
      noticePeriod,
      expectedCtc,
      currentCtc,
      resumeUrl,
      resumeFileName,
      education,
      experienceHistory,
    } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: "Name, email and role are required." }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const db = await connectToDatabase();

    if (db) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        headline: headline || (role === "employer" ? `Hiring Manager @ ${companyName || "Tech Co"}` : "Job Candidate"),
        companyName: companyName || "",
        location: location || "Jalandhar, Punjab",
        skills: Array.isArray(skills) ? skills : skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || [],
        phone: phone || "",
        noticePeriod: noticePeriod || "Immediate",
        expectedCtc: Number(expectedCtc) || 0,
        currentCtc: Number(currentCtc) || 0,
        resumeUrl: resumeUrl || "",
        resumeFileName: resumeFileName || "",
        education: education || [],
        experienceHistory: experienceHistory || [],
        savedJobs: [],
      });

      return NextResponse.json({ success: true, source: "mongodb", user }, { status: 201 });
    }

    // In-memory fallback
    const existing = inMemoryStore.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }

    const user = inMemoryStore.addUser({
      name,
      email: email.toLowerCase(),
      role,
      headline: headline || (role === "employer" ? `Hiring Manager @ ${companyName || "Tech Co"}` : "Software Engineer"),
      companyName: companyName || "",
      location: location || "Bengaluru, India",
      skills: Array.isArray(skills) ? skills : skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || [],
      bio: "New member of the JobNexus India ecosystem.",
      phone: "+91 98765 00000",
      resumeUrl: "",
    });

    return NextResponse.json({ success: true, source: "in-memory", user }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
