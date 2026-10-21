import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://manpowermaster.com"),
  title: {
    default: "Manpower Master | Verified Corporate Jobs & Placement in India",
    template: "%s | Manpower Master",
  },
  description:
    "Official direct hiring & corporate talent placement portal by Manpower Master (Govt. GSTIN Regd: 03IPTPB9968A1ZJ). Find verified jobs in Jalandhar, Ludhiana, Chandigarh, Delhi NCR, and PAN-India with transparent ₹ LPA salary packages.",
  keywords: [
    "Jobs in Jalandhar",
    "Jobs in Punjab",
    "Jobs in Ludhiana",
    "Jobs in Chandigarh",
    "Accountant Jobs in Punjab",
    "Tally Accounts Jobs",
    "Direct Hiring Companies India",
    "Manpower Master",
    "Recruitment Agency Jalandhar",
    "Corporate Staffing India",
    "Sales Executive Vacancies",
    "Work From Home Jobs India",
  ],
  authors: [{ name: "Manpower Master Recruitment Team", url: "https://manpowermaster.com" }],
  creator: "Manpower Master (03IPTPB9968A1ZJ)",
  publisher: "Manpower Master",
  alternates: {
    canonical: "https://manpowermaster.com",
  },
  openGraph: {
    title: "Manpower Master | Direct Corporate Hiring & Verified Jobs in India",
    description:
      "Search verified career openings across Accounts, Sales, IT, Office Admin & Operations in Punjab & PAN-India with direct HR interview invites.",
    url: "https://manpowermaster.com",
    siteName: "Manpower Master",
    images: [
      {
        url: "https://manpowermaster.com/illustrations/hero-search.png",
        width: 1200,
        height: 630,
        alt: "Manpower Master Direct Hiring Portal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manpower Master | Verified Jobs in India",
    description:
      "Find verified jobs with direct employer callbacks. Govt. GSTIN Regd: 03IPTPB9968A1ZJ.",
    images: ["https://manpowermaster.com/illustrations/hero-search.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-PB",
    "geo.placename": "Jalandhar, Punjab, India",
    "geo.position": "31.3260;75.5762",
    "ICBM": "31.3260, 75.5762",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${plusJakartaSans.className} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                localStorage.removeItem('jn_theme');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-orange-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
