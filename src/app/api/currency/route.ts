import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usdAmount = parseFloat(searchParams.get("usd") || "0");
    const lpaAmount = parseFloat(searchParams.get("lpa") || "0");

    // Fetch free live exchange rate from open.er-api.com (100% free, no key needed)
    let inrRate = 86.5; // Resilient fallback
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD", {
        next: { revalidate: 86400 }, // Cache 24 hours
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.INR) {
          inrRate = data.rates.INR;
        }
      }
    } catch {
      // Fallback rate
    }

    // Convert USD to INR ₹ LPA
    let calculatedLpa = lpaAmount;
    if (usdAmount > 0) {
      const totalInr = usdAmount * inrRate;
      calculatedLpa = Math.round((totalInr / 100000) * 10) / 10;
    }

    // Calculate In-Hand Monthly Take-Home (Indian New Tax Regime 2025-2026 simplified)
    // Standard deduction: ₹75,000, Tax rebates up to ₹7.75 LPA zero tax.
    const annualGross = calculatedLpa * 100000;
    let annualTax = 0;

    const taxableIncome = Math.max(0, annualGross - 75000);
    if (taxableIncome > 700000) {
      // Slabs: 0-3L (0%), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), >15L (30%)
      if (taxableIncome > 1500000) {
        annualTax += (taxableIncome - 1500000) * 0.3;
        annualTax += 300000 * 0.2; // 12-15L
        annualTax += 200000 * 0.15; // 10-12L
        annualTax += 300000 * 0.1; // 7-10L
        annualTax += 400000 * 0.05; // 3-7L
      } else if (taxableIncome > 1200000) {
        annualTax += (taxableIncome - 1200000) * 0.2;
        annualTax += 200000 * 0.15;
        annualTax += 300000 * 0.1;
        annualTax += 400000 * 0.05;
      } else if (taxableIncome > 1000000) {
        annualTax += (taxableIncome - 1000000) * 0.15;
        annualTax += 300000 * 0.1;
        annualTax += 400000 * 0.05;
      } else {
        annualTax += (taxableIncome - 700000) * 0.1;
        annualTax += 400000 * 0.05;
      }
      // 4% Health & Education cess
      annualTax *= 1.04;
    }

    // EPF deduction approx 12% on basic (assuming basic is 40% of CTC)
    const annualEpf = Math.min(annualGross * 0.4 * 0.12, 180000);
    const annualNet = Math.max(annualGross - annualTax - annualEpf, 0);
    const monthlyInHand = Math.round(annualNet / 12);

    return NextResponse.json({
      success: true,
      inrRate,
      usd: usdAmount,
      lpa: calculatedLpa,
      monthlyInHand,
      formattedInHand: `₹${monthlyInHand.toLocaleString("en-IN")}/month`,
      estimatedAnnualTax: Math.round(annualTax),
      estimatedAnnualEpf: Math.round(annualEpf),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Currency Calculation Failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
