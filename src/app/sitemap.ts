import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { Job } from "@/lib/models/Job";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://manpowermaster.com";

  // Static high-priority URLs
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?category=Accounts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?category=Sales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?category=Technical`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?location=Jalandhar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?location=Ludhiana`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?location=Chandigarh`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?location=Delhi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];

  // Dynamically include active job postings from MongoDB Atlas
  try {
    await connectToDatabase();
    const activeJobs = await Job.find({ status: "active" })
      .select("_id updatedAt")
      .limit(100)
      .lean();

    const jobRoutes: MetadataRoute.Sitemap = activeJobs.map((job: any) => ({
      url: `${baseUrl}/?job=${job._id}`,
      lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...routes, ...jobRoutes];
  } catch {
    return routes;
  }
}
