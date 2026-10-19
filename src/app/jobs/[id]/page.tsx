import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

// Allow blocking render for this route (uses params at prerender time)
export const instant = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Job Opening | Manpower Master",
    description: "View this job opening and apply on Manpower Master - India's leading job portal.",
    openGraph: {
      title: "Job Opening | Manpower Master",
      description: "Find and apply for top jobs across India on Manpower Master.",
      type: "website",
    },
    alternates: {
      canonical: `/jobs/${id}`,
    },
  };
}

function JobRedirectContent({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-600/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Opening Shared Job</h1>
          <p className="text-slate-500 text-sm">
            This shared job link will open in the Manpower Master job portal where you can view full details and apply instantly.
          </p>
        </div>
        <Link
          href={`/?job=${id}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/25 transition-all"
        >
          View Job &amp; Apply Now
        </Link>
        <Link href="/" className="block text-xs text-slate-400 hover:text-orange-600 transition-colors">
          Browse all open positions on Manpower Master
        </Link>
      </div>
    </div>
  );
}

export default async function JobDeepLinkPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
      </div>
    }>
      <JobRedirectContent id={id} />
    </Suspense>
  );
}