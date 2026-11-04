import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { CANDIDATE_DATABASE } from "@/data/candidateDatabaseSeed";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, MockUser } from "@/lib/mock-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, employerId = "user-employer-1" } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, error: "Candidate ID is required" }, { status: 400 });
    }

    const candidate = CANDIDATE_DATABASE.find((c) => c.id === candidateId);
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }

    let remainingCredits = 0;
    let unlockedList: string[] = [];
    let isDbConnected = false;

    try {
      const conn = await connectToDatabase();
      isDbConnected = !!conn;
    } catch {
      isDbConnected = false;
    }

    if (isDbConnected && mongoose.isValidObjectId(employerId)) {
      const employer = await User.findById(employerId);
      if (employer) {
        unlockedList = employer.unlockedCandidates || [];
        const currentCredits = employer.candidateUnlockCredits ?? 5;

        // If already unlocked, return phone without deducting credit
        if (unlockedList.includes(candidateId)) {
          const cleanPhoneDigits = candidate.realPhone.replace(/\D/g, "");
          const waMessage = encodeURIComponent(
            `Hello ${candidate.name}, I found your verified profile on the portal for ${candidate.role}. Are you available for a discussion?`
          );
          return NextResponse.json({
            success: true,
            alreadyUnlocked: true,
            remainingCredits: currentCredits,
            candidate: {
              id: candidate.id,
              name: candidate.name,
              realPhone: candidate.realPhone,
              whatsappUrl: `https://wa.me/${cleanPhoneDigits}?text=${waMessage}`,
            },
          });
        }

        // Check credits
        if (currentCredits < 1) {
          return NextResponse.json(
            {
              success: false,
              insufficientCredits: true,
              error: "Insufficient candidate unlock credits. Please purchase a credit package to unlock contact details.",
            },
            { status: 402 }
          );
        }

        // Deduct 1 credit & append candidateId
        employer.candidateUnlockCredits = currentCredits - 1;
        employer.unlockedCandidates = [...unlockedList, candidateId];
        await employer.save();

        remainingCredits = employer.candidateUnlockCredits;
      }
    }

    // Fallback or sync with mock store
    const mockEmployer = inMemoryStore.users.find((u: MockUser) => u._id === employerId);
    if (mockEmployer) {
      if (!mockEmployer.unlockedCandidates) mockEmployer.unlockedCandidates = [];
      if (typeof mockEmployer.candidateUnlockCredits !== "number") mockEmployer.candidateUnlockCredits = 5;

      if (!mockEmployer.unlockedCandidates.includes(candidateId)) {
        if (mockEmployer.candidateUnlockCredits < 1 && !isDbConnected) {
          return NextResponse.json(
            {
              success: false,
              insufficientCredits: true,
              error: "Insufficient candidate unlock credits. Please purchase a credit package to unlock contact details.",
            },
            { status: 402 }
          );
        }
        mockEmployer.candidateUnlockCredits -= 1;
        mockEmployer.unlockedCandidates.push(candidateId);
      }
      remainingCredits = mockEmployer.candidateUnlockCredits;
    }

    const cleanPhoneDigits = candidate.realPhone.replace(/\D/g, "");
    const waMessage = encodeURIComponent(
      `Hello ${candidate.name}, I found your verified profile on the portal for ${candidate.role}. Are you available for a discussion?`
    );

    return NextResponse.json({
      success: true,
      message: "Candidate contact unlocked successfully!",
      remainingCredits,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        realPhone: candidate.realPhone,
        whatsappUrl: `https://wa.me/${cleanPhoneDigits}?text=${waMessage}`,
      },
    });
  } catch (error) {
    console.error("Candidate unlock error:", error);
    return NextResponse.json({ success: false, error: "Failed to unlock candidate contact" }, { status: 500 });
  }
}
