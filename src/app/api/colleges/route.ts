import { NextRequest, NextResponse } from "next/server";

// Comprehensive curated list of top Indian Universities, Colleges, and Institutes
const TOP_INDIAN_COLLEGES = [
  // Punjab & North India
  "Guru Nanak Dev University (GNDU), Amritsar",
  "Panjab University (PU), Chandigarh",
  "Lovely Professional University (LPU), Jalandhar",
  "Dr. B.R. Ambedkar National Institute of Technology (NIT), Jalandhar",
  "Punjab Agricultural University (PAU), Ludhiana",
  "Thapar Institute of Engineering and Technology, Patiala",
  "Punjabi University, Patiala",
  "Chandigarh University (CU), Mohali",
  "Chitkara University, Punjab",
  "DAV University, Jalandhar",
  "Apeejay Institute of Management, Jalandhar",
  "Khalsa College, Amritsar",
  "IK Gujral Punjab Technical University (IKGPTU), Kapurthala",
  "Indian Institute of Technology (IIT), Ropar",
  "Rayat Bahra University, Mohali",
  "RIMT University, Mandi Gobindgarh",

  // Delhi NCR
  "University of Delhi (DU), New Delhi",
  "St. Stephen's College (DU), New Delhi",
  "Shri Ram College of Commerce (SRCC), Delhi",
  "Hindu College (DU), New Delhi",
  "Hansraj College (DU), New Delhi",
  "Miranda House (DU), New Delhi",
  "Lady Shri Ram College for Women (LSR), New Delhi",
  "Indian Institute of Technology (IIT), Delhi",
  "Delhi Technological University (DTU), Delhi",
  "Netaji Subhas University of Technology (NSUT), Delhi",
  "Guru Gobind Singh Indraprastha University (GGSIPU), Delhi",
  "Jawaharlal Nehru University (JNU), New Delhi",
  "Jamia Millia Islamia, New Delhi",
  "Amity University, Noida",
  "Sharda University, Greater Noida",
  "Galgotias University, Greater Noida",
  "Shiv Nadar University, Greater Noida",

  // Premier Engineering & Management Institutes
  "Indian Institute of Technology (IIT), Bombay",
  "Indian Institute of Technology (IIT), Madras",
  "Indian Institute of Technology (IIT), Kharagpur",
  "Indian Institute of Technology (IIT), Kanpur",
  "Indian Institute of Technology (IIT), Roorkee",
  "Indian Institute of Technology (IIT), Guwahati",
  "Birla Institute of Technology and Science (BITS), Pilani",
  "National Institute of Technology (NIT), Tiruchirappalli",
  "National Institute of Technology (NIT), Surathkal",
  "National Institute of Technology (NIT), Warangal",
  "National Institute of Technology (NIT), Kurukshetra",
  "Indian Institute of Management (IIM), Ahmedabad",
  "Indian Institute of Management (IIM), Bangalore",
  "Indian Institute of Management (IIM), Calcutta",
  "Indian Institute of Management (IIM), Lucknow",
  "Indian Institute of Management (IIM), Amritsar",

  // West & South India
  "University of Mumbai, Mumbai",
  "St. Xavier's College, Mumbai",
  "Savitribai Phule Pune University, Pune",
  "Symbiosis International University, Pune",
  "College of Engineering Pune (COEP), Pune",
  "Christ University, Bengaluru",
  "Indian Institute of Science (IISc), Bengaluru",
  "RV College of Engineering, Bengaluru",
  "PES University, Bengaluru",
  "Manipal Academy of Higher Education (MAHE), Manipal",
  "Anna University, Chennai",
  "Loyola College, Chennai",
  "Madras Christian College (MCC), Chennai",
  "Vellore Institute of Technology (VIT), Vellore",
  "SRM Institute of Science and Technology, Chennai",
  "Osmania University, Hyderabad",
  "International Institute of Information Technology (IIIT), Hyderabad",

  // Central & East India
  "Banaras Hindu University (BHU), Varanasi",
  "Aligarh Muslim University (AMU), Aligarh",
  "University of Lucknow, Lucknow",
  "Jadavpur University, Kolkata",
  "St. Xavier's College, Kolkata",
  "University of Calcutta, Kolkata",
  "Indian Statistical Institute (ISI), Kolkata",
  "KIIT University, Bhubaneswar",
  "National Institute of Technology (NIT), Rourkela",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    // Return top popular recommendations
    return NextResponse.json({
      success: true,
      colleges: TOP_INDIAN_COLLEGES.slice(0, 15),
    });
  }

  // 1. Instant local match (zero-latency)
  const localMatches = TOP_INDIAN_COLLEGES.filter((c) =>
    c.toLowerCase().includes(q)
  );

  // 2. Fetch from free public HipoLabs Universities API (with 1.5s timeout)
  let externalMatches: string[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(
      `http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(q)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        externalMatches = data.map((item: any) => item.name);
      }
    }
  } catch {
    // network timeout or offline fallback
  }

  // 3. Deduplicate results
  const combined = Array.from(new Set([...localMatches, ...externalMatches]));

  return NextResponse.json({
    success: true,
    colleges: combined.slice(0, 12),
  });
}
