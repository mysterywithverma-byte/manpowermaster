import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthlyToLpa(monthly: number): number {
  if (!monthly || isNaN(monthly) || monthly <= 0) return 0;
  return Math.round(((monthly * 12) / 100000) * 10) / 10;
}

export function lpaToMonthly(lpa: number): number {
  if (!lpa || isNaN(lpa) || lpa <= 0) return 0;
  return Math.round((lpa * 100000) / 12);
}

export function formatMonthlySalary(monthly: number): string {
  if (!monthly || isNaN(monthly) || monthly <= 0) return "₹0/mo";
  if (monthly >= 100000) {
    return `₹${(monthly / 100000).toFixed(1)}L/mo`;
  }
  if (monthly >= 1000) {
    return `₹${Math.round(monthly / 1000)}k/mo`;
  }
  return `₹${monthly.toLocaleString("en-IN")}/mo`;
}

export function formatSalary(min: number, max: number, currency: string = "INR"): string {
  if (currency === "INR") {
    const minMo = lpaToMonthly(min);
    const maxMo = lpaToMonthly(max);
    if (minMo > 0 && maxMo > 0) {
      return `₹${min} - ₹${max} LPA (~${formatMonthlySalary(minMo)} - ${formatMonthlySalary(maxMo)})`;
    }
    return `₹${min} - ₹${max} LPA`;
  }
  return `$${min}k - $${max}k`;
}

export function formatSalaryDual(min: number, max: number): { lpa: string; monthly: string; full: string } {
  const minMo = lpaToMonthly(min);
  const maxMo = lpaToMonthly(max);
  const lpa = `₹${min} - ₹${max} LPA`;
  const monthly = `${formatMonthlySalary(minMo)} - ${formatMonthlySalary(maxMo)}`;
  return {
    lpa,
    monthly,
    full: `${lpa} (~${monthly})`,
  };
}

export function getDaysRemaining(expiresAt?: string | Date): { days: number; isExpired: boolean; label: string } {
  if (!expiresAt) {
    return { days: 30, isExpired: false, label: "Active" };
  }
  const expDate = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expDate - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return { days: 0, isExpired: true, label: "Expired" };
  }
  if (days === 1) {
    return { days: 1, isExpired: false, label: "Expires today" };
  }
  return { days, isExpired: false, label: `Expires in ${days} days` };
}

export function timeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
