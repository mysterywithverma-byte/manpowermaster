import { NextRequest, NextResponse } from "next/server";
import { inMemoryStore, MockJob } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";

    const externalJobs: MockJob[] = [];

    // 1. Fetch from Remotive API (100% Free, no API key required)
    try {
      const remotiveUrl = category
        ? `https://remotive.com/api/remote-jobs?category=${encodeURIComponent(category)}&limit=15`
        : "https://remotive.com/api/remote-jobs?limit=15";

      const res = await fetch(remotiveUrl, {
        headers: { "User-Agent": "JobNexusIndia/1.0" },
        next: { revalidate: 1800 },
      });

      if (res.ok) {
        const data = await res.json();
        const rawJobs = data.jobs || [];

        rawJobs.forEach((item: any, idx: number) => {
          const isSenior = item.title.toLowerCase().includes("senior") || item.title.toLowerCase().includes("lead");
          const minLpa = isSenior ? 32 + (idx % 6) * 3 : 18 + (idx % 5) * 2;
          const maxLpa = minLpa + 14;

          externalJobs.push({
            _id: `ext-remotive-${item.id || Date.now() + idx}`,
            title: item.title,
            company: item.company_name || "Global Tech",
            companyLogo:
              item.company_logo ||
              `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                item.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
              )}&sz=128`,
            location: item.candidate_required_location || "Remote (India & Global)",
            workplaceType: "Remote",
            salaryMin: minLpa,
            salaryMax: maxLpa,
            salaryCurrency: "INR",
            experienceLevel: isSenior ? "Senior" : "Mid-Level",
            jobType: item.job_type === "full_time" ? "Full-time" : "Contract",
            description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 360) + "...",
            requirements: [
              "Demonstrated experience in production systems",
              "Strong written and verbal communication in English",
              "Collaborative problem solving and autonomous drive",
            ],
            skills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 5) : ["Remote", "Software", "Tech"],
            benefits: ["100% Work from Home", "Flexible Working Hours", "Global Team Culture", "Transparent CTC"],
            postedBy: "external-source",
            applicantsCount: 6 + (idx * 3),
            featured: idx % 3 === 0,
            status: "active",
            createdAt: item.publication_date || new Date().toISOString(),
          });
        });
      }
    } catch (e) {
      console.warn("Remotive fetch error:", e);
    }

    // 2. Fetch from Arbeitnow API (100% Free, no API key required)
    try {
      const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        headers: { "User-Agent": "JobNexusIndia/1.0" },
        next: { revalidate: 1800 },
      });

      if (res.ok) {
        const data = await res.json();
        const rawJobs = (data.data || []).slice(0, 15);

        rawJobs.forEach((item: any, idx: number) => {
          const isSenior = item.title.toLowerCase().includes("senior") || item.title.toLowerCase().includes("lead");
          const minLpa = isSenior ? 35 + (idx % 5) * 3 : 20 + (idx % 4) * 2;
          const maxLpa = minLpa + 16;

          externalJobs.push({
            _id: `ext-arbeit-${item.slug || Date.now() + idx}`,
            title: item.title,
            company: item.company_name || "Enterprise Systems",
            companyLogo: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
              item.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
            )}&sz=128`,
            location: item.location || (item.remote ? "Remote (India & Global)" : "Bengaluru, Karnataka"),
            workplaceType: item.remote ? "Remote" : "Hybrid",
            salaryMin: minLpa,
            salaryMax: maxLpa,
            salaryCurrency: "INR",
            experienceLevel: isSenior ? "Senior" : "Mid-Level",
            jobType: "Full-time",
            description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 360) + "...",
            requirements: [
              "Proficiency with modern web architecture and cloud deployments",
              "Proven track record in high-growth engineering teams",
            ],
            skills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 5) : ["Engineering", "Cloud", "Agile"],
            benefits: ["Flexible Hybrid / Remote", "Comprehensive Health Coverage", "Performance Bonus"],
            postedBy: "external-source",
            applicantsCount: 12 + idx,
            featured: idx % 4 === 0,
            status: "active",
            createdAt: new Date(item.created_at * 1000).toISOString(),
          });
        });
      }
    } catch (e) {
      console.warn("Arbeitnow fetch error:", e);
    }

    return NextResponse.json({
      success: true,
      count: externalJobs.length,
      data: externalJobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch live external jobs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST endpoint: Imports live external jobs into our in-memory platform store
export async function POST() {
  try {
    let importedCount = 0;

    // 1. Fetch from Remotive
    try {
      const res = await fetch("https://remotive.com/api/remote-jobs?limit=10", {
        headers: { "User-Agent": "JobNexusIndia/1.0" },
      });
      if (res.ok) {
        const data = await res.json();
        const rawJobs = data.jobs || [];

        for (const item of rawJobs) {
          const exists = inMemoryStore.jobs.some(
            (j) => j.title.toLowerCase() === item.title.toLowerCase() && j.company.toLowerCase() === item.company_name?.toLowerCase()
          );

          if (!exists) {
            const isSenior = item.title.toLowerCase().includes("senior") || item.title.toLowerCase().includes("lead");
            const minLpa = isSenior ? 35 : 22;

            inMemoryStore.addJob({
              title: item.title,
              company: item.company_name || "Tech Corp",
              companyLogo:
                item.company_logo ||
                `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                  item.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
                )}&sz=128`,
              location: "Remote (India & Global)",
              workplaceType: "Remote",
              salaryMin: minLpa,
              salaryMax: minLpa + 16,
              salaryCurrency: "INR",
              experienceLevel: isSenior ? "Senior" : "Mid-Level",
              jobType: "Full-time",
              description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 320) + "...",
              requirements: ["3+ years professional software development experience", "Strong analytical skills and ownership"],
              skills: item.tags?.slice(0, 4) || ["Engineering", "Remote"],
              benefits: ["100% Remote (WFH)", "Health Insurance", "Annual Learning Stipend"],
              postedBy: "user-employer-1",
              featured: true,
            });
            importedCount++;
          }
        }
      }
    } catch (e) {
      console.warn("Remotive import failed:", e);
    }

    // 2. Fetch from Arbeitnow
    try {
      const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        headers: { "User-Agent": "JobNexusIndia/1.0" },
      });
      if (res.ok) {
        const data = await res.json();
        const rawJobs = (data.data || []).slice(0, 10);

        for (const item of rawJobs) {
          const exists = inMemoryStore.jobs.some(
            (j) => j.title.toLowerCase() === item.title.toLowerCase() && j.company.toLowerCase() === item.company_name?.toLowerCase()
          );

          if (!exists) {
            const isSenior = item.title.toLowerCase().includes("senior") || item.title.toLowerCase().includes("lead");
            const minLpa = isSenior ? 38 : 24;

            inMemoryStore.addJob({
              title: item.title,
              company: item.company_name || "Global Systems",
              companyLogo: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                item.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
              )}&sz=128`,
              location: item.location || "Remote (India & Global)",
              workplaceType: item.remote ? "Remote" : "Hybrid",
              salaryMin: minLpa,
              salaryMax: minLpa + 18,
              salaryCurrency: "INR",
              experienceLevel: isSenior ? "Senior" : "Mid-Level",
              jobType: "Full-time",
              description: item.description?.replace(/<[^>]*>?/gm, "").slice(0, 320) + "...",
              requirements: ["Hands-on production problem solving", "Demonstrated software design competence"],
              skills: item.tags?.slice(0, 4) || ["Full-stack", "TypeScript", "Cloud"],
              benefits: ["Flexible Working Hours", "Competitive ₹ LPA Package", "Direct Leadership Access"],
              postedBy: "user-employer-1",
              featured: false,
            });
            importedCount++;
          }
        }
      }
    } catch (e) {
      console.warn("Arbeitnow import failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} live verified jobs from Free Public APIs!`,
      importedCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
