import { NextRequest, NextResponse } from "next/server";

const INDIAN_CITIES_DATASET = [
  "All Locations",
  "Remote (Work from Home, India)",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "New Delhi, Delhi",
  "Noida, Uttar Pradesh",
  "Greater Noida, Uttar Pradesh",
  "Gurugram (Gurgaon), Haryana",
  "Faridabad, Haryana",
  "Ghaziabad, Uttar Pradesh",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Jaipur, Rajasthan",
  "Chandigarh, Tricity",
  "Mohali, Punjab",
  "Indore, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Nashik, Maharashtra",
  "Navi Mumbai, Maharashtra",
  "Thane, Maharashtra",
  "Kochi (Cochin), Kerala",
  "Thiruvananthapuram, Kerala",
  "Coimbatore, Tamil Nadu",
  "Madurai, Tamil Nadu",
  "Visakhapatnam, Andhra Pradesh",
  "Vijayawada, Andhra Pradesh",
  "Bhubaneswar, Odisha",
  "Patna, Bihar",
  "Ranchi, Jharkhand",
  "Dehradun, Uttarakhand",
  "Vadodara, Gujarat",
  "Rajkot, Gujarat",
  "Ludhiana, Punjab",
  "Amritsar, Punjab",
  "Goa (Panaji & Margao)",
  "Guwahati, Assam",
  "Mysuru (Mysore), Karnataka",
  "Mangaluru, Karnataka",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        suggestions: INDIAN_CITIES_DATASET.slice(0, 10),
      });
    }

    // Local instant filtering
    const localMatches = INDIAN_CITIES_DATASET.filter((city) =>
      city.toLowerCase().includes(query)
    );

    // If local matches are sufficient, return immediately for instant <5ms response
    if (localMatches.length >= 3) {
      return NextResponse.json({
        success: true,
        source: "local-index",
        suggestions: localMatches.slice(0, 10),
      });
    }

    // Fallback: Query OpenStreetMap free API for any specialized district, town, or pin code in India
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&featuretype=city&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            "User-Agent": "JobNexusIndia/1.0",
          },
          // short timeout so UI stays snappy
          signal: AbortSignal.timeout(1800),
        }
      );

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const osmSuggestions: string[] = osmData.map(
          (item: { display_name: string }) => {
            const parts = item.display_name.split(",");
            return `${parts[0].trim()}, ${parts[parts.length - 2]?.trim() || "India"}`;
          }
        );

        const combined = Array.from(new Set([...localMatches, ...osmSuggestions]));
        return NextResponse.json({
          success: true,
          source: "osm-free-api",
          suggestions: combined.slice(0, 10),
        });
      }
    } catch {
      // If external call fails or times out, fallback to local matches
    }

    return NextResponse.json({
      success: true,
      source: "local-index",
      suggestions: localMatches.slice(0, 10),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Location lookup failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
