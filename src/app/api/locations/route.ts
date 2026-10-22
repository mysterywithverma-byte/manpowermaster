import { NextRequest, NextResponse } from "next/server";

const INDIAN_CITIES_DATASET = [
  "All Locations",
  "Remote (Work from Home, India)",
  "Bengaluru, Karnataka",
  "Delhi, NCR",
  "New Delhi, Delhi",
  "Noida, Uttar Pradesh",
  "Greater Noida, Uttar Pradesh",
  "Gurugram (Gurgaon), Haryana",
  "Faridabad, Haryana",
  "Ghaziabad, Uttar Pradesh",
  "Mumbai, Maharashtra",
  "Navi Mumbai, Maharashtra",
  "Thane, Maharashtra",
  "Pune, Maharashtra",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Chandigarh, Tricity",
  "Mohali, Punjab",
  "Panchkula, Haryana",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Indore, Madhya Pradesh",
  "Kochi (Cochin), Kerala",
  "Bhopal, Madhya Pradesh",
  "Dehradun, Uttarakhand",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Surat, Gujarat",
  "Vadodara, Gujarat",
  "Rajkot, Gujarat",
  "Visakhapatnam, Andhra Pradesh",
  "Vijayawada, Andhra Pradesh",
  "Guntur, Andhra Pradesh",
  "Coimbatore, Tamil Nadu",
  "Madurai, Tamil Nadu",
  "Tiruchirappalli, Tamil Nadu",
  "Salem, Tamil Nadu",
  "Thiruvananthapuram, Kerala",
  "Kozhikode (Calicut), Kerala",
  "Thrissur, Kerala",
  "Mysuru (Mysore), Karnataka",
  "Mangaluru (Mangalore), Karnataka",
  "Hubballi-Dharwad, Karnataka",
  "Belagavi (Belgaum), Karnataka",
  "Patna, Bihar",
  "Gaya, Bihar",
  "Muzaffarpur, Bihar",
  "Ranchi, Jharkhand",
  "Jamshedpur, Jharkhand",
  "Dhanbad, Jharkhand",
  "Bhubaneswar, Odisha",
  "Cuttack, Odisha",
  "Rourkela, Odisha",
  "Raipur, Chhattisgarh",
  "Bilaspur, Chhattisgarh",
  "Guwahati, Assam",
  "Shillong, Meghalaya",
  "Jalandhar, Punjab",
  "Ludhiana, Punjab",
  "Amritsar, Punjab",
  "Patiala, Punjab",
  "Bathinda, Punjab",
  "Phagwara, Punjab",
  "Hoshiarpur, Punjab",
  "Kapurthala, Punjab",
  "Pathankot, Punjab",
  "Moga, Punjab",
  "Batala, Punjab",
  "Khanna, Punjab",
  "Rajpura, Punjab",
  "Varanasi, Uttar Pradesh",
  "Agra, Uttar Pradesh",
  "Prayagraj (Allahabad), Uttar Pradesh",
  "Meerut, Uttar Pradesh",
  "Bareilly, Uttar Pradesh",
  "Aligarh, Uttar Pradesh",
  "Moradabad, Uttar Pradesh",
  "Jodhpur, Rajasthan",
  "Udaipur, Rajasthan",
  "Kota, Rajasthan",
  "Bikaner, Rajasthan",
  "Ajmer, Rajasthan",
  "Gwalior, Madhya Pradesh",
  "Jabalpur, Madhya Pradesh",
  "Ujjain, Madhya Pradesh",
  "Nashik, Maharashtra",
  "Aurangabad (Chhatrapati Sambhaji Nagar), Maharashtra",
  "Solapur, Maharashtra",
  "Kolhapur, Maharashtra",
  "Goa (Panaji & Margao)",
  "Srinagar, Jammu & Kashmir",
  "Jammu, Jammu & Kashmir",
  "Shimla, Himachal Pradesh",
  "Dharamshala, Himachal Pradesh",
  "Haridwar, Uttarakhand",
  "Rishikesh, Uttarakhand",
  "Rohtak, Haryana",
  "Panipat, Haryana",
  "Karnal, Haryana",
  "Hisar, Haryana",
  "Ambala, Haryana",
  "Siliguri, West Bengal",
  "Durgapur, West Bengal",
  "Asansol, West Bengal",
  "Agartala, Tripura",
  "Imphal, Manipur",
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
