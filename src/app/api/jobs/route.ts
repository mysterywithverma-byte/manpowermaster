import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { User } from "@/lib/models/User";
import { Notification } from "@/lib/models/Notification";
import { inMemoryStore } from "@/lib/mock-data";
import { escapeRegex } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("jobType") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const workplaceType = searchParams.get("workplaceType") || "";
    const minSalary = searchParams.get("minSalary") ? Number(searchParams.get("minSalary")) : 0;
    const postedBy = searchParams.get("postedBy");
    const company = searchParams.get("company");

    const db = await connectToDatabase();

    if (db) {
      // Query MongoDB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { status: "active" };

      if (postedBy) {
        query.status = { $in: ["active", "closed"] }; // Recruiters can view all their jobs
        query.$or = [
          { postedBy: postedBy },
          ...(mongoose.Types.ObjectId.isValid(postedBy) ? [{ postedBy: new mongoose.Types.ObjectId(postedBy) }] : []),
          ...(company ? [{ company: { $regex: escapeRegex(company), $options: "i" } }] : []),
        ];
      }

      if (search) {
        const escapedSearch = escapeRegex(search.trim());
        query.$or = [
          { title: { $regex: escapedSearch, $options: "i" } },
          { company: { $regex: escapedSearch, $options: "i" } },
          { skills: { $in: [new RegExp(escapedSearch, "i")] } },
        ];
      }

      if (location && location !== "All") {
        query.location = { $regex: escapeRegex(location.trim()), $options: "i" };
      }

      if (jobType && jobType !== "All") {
        query.jobType = jobType;
      }

      if (experienceLevel && experienceLevel !== "All") {
        query.experienceLevel = experienceLevel;
      }

      if (workplaceType && workplaceType !== "All") {
        query.workplaceType = workplaceType;
      }

      if (minSalary > 0) {
        query.salaryMax = { $gte: minSalary };
      }

      const jobs = await Job.find(query).sort({ featured: -1, createdAt: -1 }).lean();
      return NextResponse.json({ success: true, count: jobs.length, source: "mongodb", data: jobs });
    }

    // Graceful fallback store
    const fallbackJobs = inMemoryStore.getJobs({
      search,
      location,
      jobType,
      experienceLevel,
      workplaceType,
      minSalary,
      postedBy: postedBy || undefined,
      company: company || undefined,
    });

    return NextResponse.json({
      success: true,
      count: fallbackJobs.length,
      source: "in-memory",
      data: fallbackJobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      company,
      companyLogo,
      location,
      workplaceType,
      salaryMin,
      salaryMax,
      salaryCurrency = "INR",
      experienceLevel,
      jobType,
      description,
      requirements,
      skills,
      benefits,
      postedBy,
    } = body;

    if (!title || !company || !location || !salaryMin || !salaryMax || !description) {
      return NextResponse.json(
        { success: false, error: "Please fill in all mandatory job listing fields." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    if (db) {
      let resolvedPosterId = postedBy || "user-employer-1";
      if (postedBy) {
        try {
          const userDoc = await User.findOne({
            $or: [
              ...(mongoose.Types.ObjectId.isValid(postedBy) ? [{ _id: postedBy }] : []),
              { email: postedBy },
            ],
          });
          if (userDoc) {
            resolvedPosterId = userDoc._id.toString();
            if (userDoc.role === "seeker") {
              userDoc.role = "employer";
              await userDoc.save();
            }
          }
        } catch {
          // ignore lookup error
        }
      }

      const createdJob = await Job.create({
        title,
        company,
        companyLogo: companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
        location,
        workplaceType: workplaceType || "Hybrid",
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        salaryCurrency,
        experienceLevel: experienceLevel || "Mid-Level",
        jobType: jobType || "Full-time",
        description,
        requirements: Array.isArray(requirements) ? requirements : requirements?.split("\n").filter(Boolean) || [],
        skills: Array.isArray(skills) ? skills : skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || [],
        benefits: Array.isArray(benefits) ? benefits : benefits?.split("\n").filter(Boolean) || [],
        postedBy: resolvedPosterId,
        featured: Boolean(body.featured),
        status: "active",
      });

      // Free automated candidate notifications based on matching skills or location
      try {
        const jobSkills = Array.isArray(createdJob.skills) ? createdJob.skills : [];
        const matchConditions: any[] = [];

        if (jobSkills.length > 0) {
          matchConditions.push({ skills: { $in: jobSkills } });
        }
        if (createdJob.location && createdJob.location !== "All") {
          const city = createdJob.location.split(",")[0].trim();
          matchConditions.push({ location: { $regex: escapeRegex(city), $options: "i" } });
        }

        const candidateQuery: any = { role: "seeker" };
        if (matchConditions.length > 0) {
          candidateQuery.$or = matchConditions;
        }

        const matchedCandidates = await User.find(candidateQuery)
          .select("_id email name")
          .limit(50)
          .lean();

        if (matchedCandidates.length > 0) {
          const notificationsToInsert = matchedCandidates.map((c: any) => ({
            userId: c._id.toString(),
            jobId: createdJob._id.toString(),
            title: `New Role Matching Your Profile: ${createdJob.title}`,
            message: `${createdJob.company} has an active opening in ${createdJob.location} (₹${createdJob.salaryMin} - ₹${createdJob.salaryMax} LPA).`,
            type: "job_match",
            read: false,
            link: `/?job=${createdJob._id}`,
          }));
          await Notification.insertMany(notificationsToInsert);
        }
      } catch (notifError) {
        console.warn("Candidate matching alert notice:", notifError);
      }

      return NextResponse.json({ success: true, source: "mongodb", data: createdJob }, { status: 201 });
    }

    // In-memory fallback
    const newJob = inMemoryStore.addJob({
      title,
      company,
      companyLogo: companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
      location,
      workplaceType: workplaceType || "Hybrid",
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryCurrency,
      experienceLevel: experienceLevel || "Mid-Level",
      jobType: jobType || "Full-time",
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements?.split("\n").filter(Boolean) || [],
      skills: Array.isArray(skills) ? skills : skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || [],
      benefits: Array.isArray(benefits) ? benefits : benefits?.split("\n").filter(Boolean) || [],
      postedBy: postedBy || "user-employer-1",
      featured: Boolean(body.featured),
    });

    return NextResponse.json({ success: true, source: "in-memory", data: newJob }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
