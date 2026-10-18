import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get("code") || "").trim();

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    // 100% Free Official Indian Postal PIN Code API
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      headers: { "User-Agent": "JobNexusIndia/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error("Pincode API unavailable");
    }

    const data = await res.json();
    if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const office = data[0].PostOffice[0];
      const city = office.District || office.Block || office.Name;
      const state = office.State;
      const formatted = `${city}, ${state}`;

      return NextResponse.json({
        success: true,
        pincode: code,
        city,
        state,
        formatted,
        postOffice: office.Name,
      });
    }

    return NextResponse.json(
      { success: false, error: "No Indian location found for this pincode." },
      { status: 404 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Pincode lookup failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
