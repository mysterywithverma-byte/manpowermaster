import { NextRequest, NextResponse } from "next/server";

export interface CompanyTypeItem {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  keywords: string[];
}

export const COMPANY_TYPES_DATASET: CompanyTypeItem[] = [
  {
    id: "corporate-mnc",
    name: "Corporate / Multinational Corporation (MNC)",
    shortLabel: "Corporate / MNC",
    description: "Large global or domestic enterprise with multi-country operations.",
    keywords: ["mnc", "corporate", "multinational", "global", "enterprise"],
  },
  {
    id: "foreign-gcc",
    name: "Foreign MNC / Global Capability Center (GCC)",
    shortLabel: "Foreign MNC (GCC)",
    description: "Offshore technology, analytics, and operational hub of global enterprises.",
    keywords: ["gcc", "offshore", "captive", "shared services", "global capability center"],
  },
  {
    id: "indian-conglomerate",
    name: "Indian Conglomerate / Top Business House",
    shortLabel: "Indian Conglomerate",
    description: "Diversified industrial or tech business groups in India.",
    keywords: ["conglomerate", "tata", "reliance", "birla", "mahindra", "adani"],
  },
  {
    id: "pvt-ltd",
    name: "Private Limited Company (Pvt Ltd)",
    shortLabel: "Private Limited",
    description: "Standard registered private limited corporate entity under MCA.",
    keywords: ["pvt ltd", "private limited", "sme", "mid-market", "mca"],
  },
  {
    id: "public-listed",
    name: "Public Limited / Stock Exchange Listed (BSE / NSE)",
    shortLabel: "Public Listed",
    description: "Publicly traded enterprise listed on Indian or international exchanges.",
    keywords: ["public", "listed", "bse", "nse", "ipo", "public limited"],
  },
  {
    id: "funded-startup",
    name: "Tech Startup (Funded / Growth Stage / Unicorn)",
    shortLabel: "Funded Startup",
    description: "Venture capital funded high-growth technology enterprise.",
    keywords: ["startup", "unicorn", "series a", "vc funded", "scaleup", "growth"],
  },
  {
    id: "early-startup",
    name: "Early-Stage Startup (Seed / Bootstrapped)",
    shortLabel: "Seed / Bootstrapped Startup",
    description: "Nimble innovative startup building minimum viable products and initial traction.",
    keywords: ["seed", "bootstrapped", "early stage", "incubated", "founding team"],
  },
  {
    id: "psu-govt",
    name: "Government Organization / Public Sector Undertaking (PSU)",
    shortLabel: "Government / PSU",
    description: "Central, state, or quasi-government enterprise with institutional stability.",
    keywords: ["psu", "government", "sarkari", "public sector", "ministry"],
  },
  {
    id: "recruitment-firm",
    name: "Recruitment, Staffing & HR Consultancy Firm",
    shortLabel: "Recruitment Firm",
    description: "Third-party talent agency hiring on behalf of multiple client organizations.",
    keywords: ["consultancy", "staffing", "recruitment firm", "headhunter", "agency"],
  },
  {
    id: "llp",
    name: "Limited Liability Partnership (LLP)",
    shortLabel: "LLP",
    description: "Structured partnership with limited personal liability for partners.",
    keywords: ["llp", "partnership", "law firm", "consultancy firm"],
  },
  {
    id: "ngo-trust",
    name: "Non-Profit Organization / NGO / Charitable Trust",
    shortLabel: "Non-Profit / NGO",
    description: "Registered section 8 company, trust, or foundation working for social impact.",
    keywords: ["ngo", "trust", "foundation", "charity", "society", "non-profit"],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: COMPANY_TYPES_DATASET,
      });
    }

    const filtered = COMPANY_TYPES_DATASET.filter((ct) => {
      const matchName = ct.name.toLowerCase().includes(query);
      const matchLabel = ct.shortLabel.toLowerCase().includes(query);
      const matchDesc = ct.description.toLowerCase().includes(query);
      const matchKeyword = ct.keywords.some((k) => k.toLowerCase().includes(query));
      return matchName || matchLabel || matchDesc || matchKeyword;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load company types";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
