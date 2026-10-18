import React from "react";
import { MockJob } from "@/lib/mock-data";

interface JobJsonLdProps {
  jobs: MockJob[];
}

export function JobJsonLd({ jobs }: JobJsonLdProps) {
  if (!jobs || jobs.length === 0) return null;

  const schemaList = jobs.slice(0, 25).map((job) => {
    const minSalaryInr = (job.salaryMin || 3) * 100000;
    const maxSalaryInr = (job.salaryMax || 6) * 100000;
    const locParts = (job.location || "Jalandhar, Punjab").split(",");
    const city = locParts[0]?.trim() || "Jalandhar";
    const region = locParts[1]?.trim() || "Punjab";

    const postedDate = job.createdAt
      ? new Date(job.createdAt).toISOString()
      : new Date().toISOString();
    const validThroughDate = new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000
    ).toISOString();

    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || `${job.title} vacancy at ${job.company}. Direct placement through Manpower Master.`,
      identifier: {
        "@type": "PropertyValue",
        name: "Manpower Master",
        value: job._id,
      },
      datePosted: postedDate,
      validThrough: validThroughDate,
      employmentType:
        job.jobType === "Full-time"
          ? "FULL_TIME"
          : job.jobType === "Part-time"
          ? "PART_TIME"
          : job.jobType === "Contract"
          ? "CONTRACTOR"
          : "OTHER",
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
        sameAs: "https://manpowermaster.com",
        logo: job.companyLogo || "https://manpowermaster.com/illustrations/hero-search.png",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: city,
          addressRegion: region,
          addressCountry: "IN",
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: minSalaryInr,
          maxValue: maxSalaryInr,
          unitText: "YEAR",
        },
      },
      applicantLocationRequirements: {
        "@type": "Country",
        name: "India",
      },
      directApply: true,
    };
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }}
    />
  );
}
