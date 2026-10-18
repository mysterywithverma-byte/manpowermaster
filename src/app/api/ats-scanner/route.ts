import { NextRequest, NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userSkills = [], userResumeText = "", jobId, jobTitle, jobRequirements = [] } = body;

    let targetJob = null;
    if (jobId) {
      targetJob = inMemoryStore.jobs.find((j) => j._id === jobId);
    }

    const jobSkills: string[] = Array.isArray(targetJob?.skills)
      ? targetJob.skills
      : Array.isArray(body.jobSkills)
      ? body.jobSkills
      : ["React", "TypeScript", "Node.js", "Git", "Problem Solving"];

    const requirements: string[] = Array.isArray(targetJob?.requirements)
      ? targetJob.requirements
      : Array.isArray(jobRequirements)
      ? jobRequirements
      : [];

    const allJobKeywords = Array.from(
      new Set([
        ...jobSkills.map((s: string) => s.toLowerCase()),
        ...requirements
          .join(" ")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w: string) => w.length > 3),
      ])
    );

    const userSkillsLower = (userSkills as string[]).map((s) => s.toLowerCase().trim());
    const resumeTextLower = (userResumeText as string).toLowerCase();

    // Check matches
    const matched: string[] = [];
    const missing: string[] = [];

    jobSkills.forEach((skill: string) => {
      const lower = skill.toLowerCase();
      const inSkills = userSkillsLower.some((s) => s.includes(lower) || lower.includes(s));
      const inText = resumeTextLower.includes(lower);

      if (inSkills || inText) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Calculate score
    const skillMatchRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0.7;
    let baseScore = Math.round(skillMatchRatio * 80);

    // Bonus for having resume uploaded
    if (userResumeText && userResumeText.length > 50) {
      baseScore += 15;
    } else {
      baseScore += 5;
    }

    const finalScore = Math.min(Math.max(baseScore, 35), 98);

    let feedback = "";
    if (finalScore >= 80) {
      feedback = "Excellent match! Your profile and skills strongly align with this recruiter's requirements.";
    } else if (finalScore >= 60) {
      feedback = "Good match. Adding the missing technical keywords will significantly boost shortlisting.";
    } else {
      feedback = "Moderate match. Consider updating your profile summary with the key tools mentioned below.";
    }

    return NextResponse.json({
      success: true,
      score: finalScore,
      matchedSkills: matched,
      missingSkills: missing.slice(0, 5),
      feedback,
      targetRole: targetJob?.title || jobTitle || "Target Role",
    });
  } catch (error: unknown) {
    console.error("ATS Scanner error:", error);
    const message = error instanceof Error ? error.message : "ATS Analysis Failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
