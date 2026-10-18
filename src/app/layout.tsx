import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manpower Master | Verified Jobs in Punjab, Delhi NCR, Bengaluru & Pan-India",
  description:
    "Official career staffing & job recruitment ecosystem by Manpower Master (Manpowermaster.com). Govt. GSTIN Verified (03IPTPB9968A1ZJ). Find verified jobs across IT, Sales, Marketing, Accounts, Technical & Remote roles with transparent ₹ LPA compensation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
