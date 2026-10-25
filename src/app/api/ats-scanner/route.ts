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

    // Calculate accurate score based on actual skills match
    const skillMatchRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0.5;
    let baseScore = Math.round(skillMatchRatio * 80);

    // Bonus for having resume uploaded and detailed keywords
    if (userResumeText && userResumeText.length > 100) {
      baseScore += 20;
    } else if (userResumeText && userResumeText.length > 30) {
      baseScore += 10;
    }

    // Realistic score: 0 to 100
    const finalScore = Math.min(Math.max(baseScore, 0), 100);

    let feedback = "";
    if (finalScore >= 80) {
      feedback = "Excellent match! Your profile and skills strongly align with this recruiter's requirements.";
    } else if (finalScore >= 50) {
      feedback = "Moderate match. Adding the missing technical keywords and experience details will boost your shortlisting chance.";
    } else {
      feedback = "Low match. Consider customizing your resume and profile skills to better align with this role's requirements.";
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
