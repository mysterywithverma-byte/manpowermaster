import { NextRequest, NextResponse } from "next/server";

export interface IndustryItem {
  id: string;
  name: string;
  category: string;
  keywords: string[];
}

export const INDUSTRIES_DATASET: IndustryItem[] = [
  {
    id: "it-software",
    name: "IT & Software Services (SaaS / Product / Services)",
    category: "Technology",
    keywords: ["it", "software", "tech", "saas", "coding", "web", "ai", "cloud", "developer"],
  },
  {
    id: "bfsi",
    name: "Banking & Financial Services (BFSI / Investment)",
    category: "Finance",
    keywords: ["banking", "finance", "bfsi", "bank", "loans", "wealth", "mutual funds", "insurance"],
  },
  {
    id: "fintech",
    name: "FinTech & Digital Payments / Crypto",
    category: "Finance",
    keywords: ["fintech", "payments", "upi", "wallet", "crypto", "lending", "neobank"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce, D2C & Modern Retail",
    category: "Commerce",
    keywords: ["ecommerce", "retail", "d2c", "shopping", "marketplace", "quick commerce"],
  },
  {
    id: "healthcare",
    name: "Healthcare, Hospitals & Life Sciences",
    category: "Healthcare",
    keywords: ["health", "hospital", "medical", "clinic", "doctor", "diagnostics"],
  },
  {
    id: "pharma",
    name: "Pharmaceuticals & Biotechnology",
    category: "Healthcare",
    keywords: ["pharma", "biotech", "drugs", "medicines", "clinical research", "formulations"],
  },
  {
    id: "edtech",
    name: "Education, Higher Ed & EdTech",
    category: "Education",
    keywords: ["edtech", "education", "school", "college", "university", "e-learning", "tuition"],
  },
  {
    id: "automobile",
    name: "Automobile, Electric Vehicles (EV) & Auto Components",
    category: "Manufacturing",
    keywords: ["auto", "automobile", "car", "ev", "electric vehicle", "motor", "oem"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing, Heavy Engineering & Industrial Automation",
    category: "Manufacturing",
    keywords: ["manufacturing", "factory", "plant", "industrial", "machinery", "automation"],
  },
  {
    id: "telecom",
    name: "Telecommunications & Networking",
    category: "Technology",
    keywords: ["telecom", "broadband", "5g", "networking", "telephony", "isp"],
  },
  {
    id: "fmcg",
    name: "FMCG, Food & Beverage & Consumer Goods",
    category: "Consumer",
    keywords: ["fmcg", "consumer goods", "food", "beverage", "dairy", "packaged goods"],
  },
  {
    id: "real-estate",
    name: "Real Estate, Construction & Infrastructure",
    category: "Construction",
    keywords: ["real estate", "property", "construction", "infra", "builder", "housing"],
  },
  {
    id: "consulting",
    name: "Management Consulting & Professional Advisory",
    category: "Professional Services",
    keywords: ["consulting", "advisory", "strategy", "big 4", "audit", "management"],
  },
  {
    id: "logistics",
    name: "Logistics, Supply Chain, Shipping & Warehousing",
    category: "Logistics",
    keywords: ["logistics", "supply chain", "freight", "courier", "shipping", "warehouse"],
  },
  {
    id: "media-entertainment",
    name: "Media, Entertainment, Advertising & OTT Platforms",
    category: "Media",
    keywords: ["media", "entertainment", "ott", "film", "advertising", "marketing", "pr", "broadcasting"],
  },
  {
    id: "hospitality",
    name: "Hospitality, Travel, Tourism & Aviation",
    category: "Hospitality",
    keywords: ["hotel", "hospitality", "tourism", "travel", "airlines", "aviation", "resort"],
  },
  {
    id: "energy-cleantech",
    name: "Renewable Energy, Solar, Cleantech & Utilities",
    category: "Energy",
    keywords: ["energy", "solar", "renewable", "cleantech", "power", "electricity", "green"],
  },
  {
    id: "oil-gas",
    name: "Oil, Gas, Petrochemicals & Mining",
    category: "Energy",
    keywords: ["oil", "gas", "petroleum", "refinery", "mining", "drilling", "minerals"],
  },
  {
    id: "agritech",
    name: "Agriculture, Farming & AgriTech",
    category: "Agriculture",
    keywords: ["agriculture", "agritech", "farming", "crops", "seeds", "fertilizers"],
  },
  {
    id: "hr-staffing",
    name: "Recruitment, HR Solutions & Staffing Services",
    category: "Professional Services",
    keywords: ["recruitment", "staffing", "hr", "manpower", "talent acquisition", "headhunting"],
  },
  {
    id: "gaming",
    name: "Gaming, Esports & Animation / VFX",
    category: "Entertainment",
    keywords: ["gaming", "game dev", "esports", "animation", "vfx", "cgi"],
  },
  {
    id: "legal",
    name: "Legal Services, Law Firms & Compliance",
    category: "Legal",
    keywords: ["legal", "law", "lawyer", "advocate", "compliance", "regulatory"],
  },
  {
    id: "ngo",
    name: "Non-Profit, NGO & Social Impact",
    category: "Social",
    keywords: ["ngo", "non-profit", "foundation", "charity", "social impact", "csr"],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: INDUSTRIES_DATASET,
      });
    }

    const filtered = INDUSTRIES_DATASET.filter((ind) => {
      const matchName = ind.name.toLowerCase().includes(query);
      const matchCategory = ind.category.toLowerCase().includes(query);
      const matchKeyword = ind.keywords.some((k) => k.toLowerCase().includes(query));
      return matchName || matchCategory || matchKeyword;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load industries";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
