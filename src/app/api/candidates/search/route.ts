import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { CANDIDATE_DATABASE, CandidateProfile } from "@/data/candidateDatabaseSeed";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore, MockUser } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const qualification = searchParams.get("qualification")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const minExp = parseInt(searchParams.get("minExp") || "0", 10);
    const employerId = searchParams.get("employerId") || "user-employer-1";

    // Retrieve employer profile to check unlocked candidates & available credits
    let unlockedList: string[] = [];
    let unlockCredits = 5;

    try {
      const conn = await connectToDatabase();
      if (conn && mongoose.isValidObjectId(employerId)) {
        const employer = await User.findById(employerId);
        if (employer) {
          unlockedList = employer.unlockedCandidates || [];
          unlockCredits = employer.candidateUnlockCredits ?? 5;
        } else {
          const mockEmployer = inMemoryStore.users.find((u: MockUser) => u._id === employerId);
          if (mockEmployer) {
            unlockedList = mockEmployer.unlockedCandidates || [];
            unlockCredits = mockEmployer.candidateUnlockCredits ?? 5;
          }
        }
      } else {
        const mockEmployer = inMemoryStore.users.find((u: MockUser) => u._id === employerId);
        if (mockEmployer) {
          unlockedList = mockEmployer.unlockedCandidates || [];
          unlockCredits = mockEmployer.candidateUnlockCredits ?? 5;
        }
      }
    } catch {
      const mockEmployer = inMemoryStore.users.find((u: MockUser) => u._id === employerId);
      if (mockEmployer) {
        unlockedList = mockEmployer.unlockedCandidates || [];
        unlockCredits = mockEmployer.candidateUnlockCredits ?? 5;
      }
    }

    // Filter candidate catalog
    const filtered = CANDIDATE_DATABASE.filter((cand: CandidateProfile) => {
      if (search) {
        const matchesName = cand.name.toLowerCase().includes(search);
        const matchesRole = cand.role.toLowerCase().includes(search);
        const matchesSkills = cand.skills.some((s) => s.toLowerCase().includes(search));
        const matchesLoc = cand.locality.toLowerCase().includes(search) || cand.city.toLowerCase().includes(search);
        if (!matchesName && !matchesRole && !matchesSkills && !matchesLoc) return false;
      }

      if (city && city.toLowerCase() !== "all") {
        if (!cand.city.toLowerCase().includes(city.toLowerCase())) return false;
      }

      if (role && role.toLowerCase() !== "all") {
        if (!cand.role.toLowerCase().includes(role.toLowerCase()) && !cand.category.toLowerCase().includes(role.toLowerCase())) {
          return false;
        }
      }

      if (qualification && qualification.toLowerCase() !== "all") {
        if (cand.qualification !== qualification) return false;
      }

      if (gender && gender.toLowerCase() !== "all") {
        if (cand.gender.toLowerCase() !== gender.toLowerCase()) return false;
      }

      if (minExp > 0) {
        if (cand.experienceMonths < minExp * 12) return false;
      }

      return true;
    });

    // Decorate candidate objects with unlocked status
    const decoratedCandidates = filtered.map((cand) => {
      const isUnlocked = unlockedList.includes(cand.id);
      const cleanPhoneDigits = cand.realPhone.replace(/\D/g, "");
      const waMessage = encodeURIComponent(
        `Hello ${cand.name}, I reviewed your verified profile on our portal for the ${cand.role} position. Are you available for an immediate interview?`
      );

      return {
        ...cand,
        isUnlocked,
        displayPhone: isUnlocked ? cand.realPhone : cand.maskedPhone,
        whatsappUrl: isUnlocked ? `https://wa.me/${cleanPhoneDigits}?text=${waMessage}` : null,
      };
    });

    return NextResponse.json({
      success: true,
      totalCount: decoratedCandidates.length,
      employerCredits: unlockCredits,
      unlockedCount: unlockedList.length,
      candidates: decoratedCandidates,
    });
  } catch (error) {
    console.error("Candidate search error:", error);
    return NextResponse.json({ success: false, error: "Failed to search candidates" }, { status: 500 });
  }
}
