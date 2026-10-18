export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface MockUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "seeker" | "employer" | "admin";
  headline: string;
  bio: string;
  phone: string;
  location: string;
  skills: string[];
  resumeUrl: string;
  resumeFileName?: string;
  avatar?: string;
  savedJobs: string[];
  noticePeriod?: "Immediate" | "15 Days" | "30 Days" | "60 Days" | "Serving Notice";
  currentCtc?: number;
  expectedCtc?: number;
  education?: EducationItem[];
  experienceHistory?: ExperienceItem[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  companyName?: string;
  companyLogo?: string;
  whatsappAlerts?: boolean;
  createdAt: string;
}

export interface MockJob {
  _id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  workplaceType: "Remote" | "On-site" | "Hybrid";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experienceLevel: "Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  recruiterWhatsApp?: string;
  postedBy: string;
  applicantsCount: number;
  featured: boolean;
  status: "active" | "closed";
  createdAt: string;
}

export interface MockApplication {
  _id: string;
  jobId: string;
  applicantId: string;
  status: "Applied" | "Shortlisted" | "Interviewed" | "Hired" | "Rejected";
  coverNote: string;
  resumeUrl: string;
  applicantDetails: {
    name: string;
    email: string;
    phone: string;
    experienceYears: number;
    noticePeriod?: string;
    expectedCtc?: number;
    portfolioUrl?: string;
    currentCompany?: string;
  };
  appliedAt: string;
}

export const INITIAL_USERS: MockUser[] = [
  {
    _id: "user-seeker-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "seeker",
    headline: "Senior Full Stack Engineer | Next.js, Node.js, Cloud Architect",
    bio: "Passionate engineer with 5+ years building scalable SaaS applications and fintech systems across Bangalore.",
    phone: "+91 98765 43210",
    location: "Bengaluru, Karnataka",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    resumeUrl: "/uploads/resumes/aarav_sharma_resume.pdf",
    resumeFileName: "aarav_sharma_lead_dev.pdf",
    noticePeriod: "Immediate",
    currentCtc: 24,
    expectedCtc: 38,
    portfolioUrl: "https://aaravsharma.dev",
    githubUrl: "https://github.com/aaravsharma",
    linkedinUrl: "https://linkedin.com/in/aaravsharma-dev",
    whatsappAlerts: true,
    education: [
      {
        degree: "B.Tech in Computer Science & Engineering",
        institution: "PES Institute of Technology, Bangalore",
        year: "2019",
      },
    ],
    experienceHistory: [
      {
        role: "Senior Software Engineer",
        company: "Infosys Labs (Fintech Division)",
        duration: "2022 - Present",
        description: "Architected microservices processing ₹500Cr+ monthly transactions with sub-40ms P99 latencies.",
      },
      {
        role: "Software Engineer",
        company: "StartupX Mobility",
        duration: "2019 - 2022",
        description: "Built the customer-facing booking portal using Next.js and React Native.",
      },
    ],
    savedJobs: ["job-1", "job-3"],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: "user-employer-1",
    name: "Priya Nair",
    email: "recruiter@razorpay.com",
    role: "employer",
    headline: "Head of Talent Acquisition @ Razorpay",
    bio: "Hiring exceptional builders, designers, and systems architects to power the financial backbone of India.",
    phone: "+91 99887 76655",
    location: "Bengaluru, Karnataka",
    companyName: "Razorpay",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
    skills: ["Technical Recruitment", "Executive Hiring", "Talent Strategy"],
    resumeUrl: "",
    savedJobs: [],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    _id: "user-admin-1",
    name: "Vikram Malhotra",
    email: "admin@jobnexus.in",
    role: "admin",
    headline: "System Administrator & Platform Operations",
    bio: "Overseeing job ecosystem integrity, recruiter verification, and platform telemetry.",
    phone: "+91 91234 56789",
    location: "Gurugram, NCR",
    skills: ["DevOps", "Platform Moderation", "Data Governance"],
    resumeUrl: "",
    savedJobs: [],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const INITIAL_JOBS: MockJob[] = [
  {
    _id: "job-1",
    title: "Senior Full Stack Engineer (Next.js & Go)",
    company: "Razorpay",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
    location: "Bengaluru, Karnataka",
    workplaceType: "Hybrid",
    salaryMin: 32,
    salaryMax: 48,
    salaryCurrency: "INR",
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Razorpay is seeking an elite Senior Full Stack Engineer to build high-throughput payment checkout infrastructure handling 100,000+ RPS. You will collaborate with design, product, and platform engineering to craft frictionless merchant experiences.",
    requirements: [
      "5+ years crafting enterprise web platforms using React/Next.js and Go or Node.js",
      "Deep understanding of distributed systems, ACID transactions, and idempotency",
      "Experience with Redis, Kafka, and Postgres tuning at scale",
      "Proven ability to mentor junior engineers and write RFCs",
    ],
    skills: ["Next.js", "React", "TypeScript", "Go", "PostgreSQL", "Kafka", "Docker"],
    benefits: ["Comprehensive Health Cover (₹15L)", "Annual ESOP Grants", "₹1.5L Home Office Setup", "Gym & Wellness Allowance"],
    postedBy: "user-employer-1",
    applicantsCount: 14,
    featured: true,
    status: "active",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: "job-2",
    title: "Lead UI/UX Product Designer",
    company: "CRED",
    companyLogo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=128&auto=format&fit=crop&q=80",
    location: "Bengaluru, Karnataka",
    workplaceType: "On-site",
    salaryMin: 35,
    salaryMax: 55,
    salaryCurrency: "INR",
    experienceLevel: "Lead",
    jobType: "Full-time",
    description: "CRED redefines consumer aesthetics in India. We are looking for an obsessive Lead Product Designer who crafts bespoke interactions, fluid motion design, and tactile interfaces that feel like art.",
    requirements: [
      "6+ years designing consumer mobile/web products with iconic brand polish",
      "Mastery of Figma, Framer, and micro-interaction prototyping",
      "Strong portfolio demonstrating typography, spatial design, and dark UI patterns",
      "Experience collaborating closely with frontend engineers to ship pixel-perfect code",
    ],
    skills: ["Figma", "Design Systems", "Prototyping", "Framer", "Micro-interactions", "User Research"],
    benefits: ["Generous ESOP Pool", "Unlimited PTO", "World-class Chef-prepared Meals", "Annual Design Conferences"],
    postedBy: "user-employer-1",
    applicantsCount: 8,
    featured: true,
    status: "active",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    _id: "job-3",
    title: "Staff Machine Learning Engineer (LLMs & Search)",
    company: "Swiggy",
    companyLogo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&auto=format&fit=crop&q=80",
    location: "Hyderabad, Telangana",
    workplaceType: "Hybrid",
    salaryMin: 45,
    salaryMax: 70,
    salaryCurrency: "INR",
    experienceLevel: "Lead",
    jobType: "Full-time",
    description: "Join Swiggy's Core Intelligence Lab to architect conversational commerce and neural search engines. You will train custom embeddings, fine-tune open-weight models, and optimize retrieval pipelines for 50M+ monthly active users.",
    requirements: [
      "7+ years in Applied Machine Learning, NLP, or Vector Search",
      "Deep expertise in PyTorch, Hugging Face, vLLM, and Milvus/Pinecone",
      "Track record of deploying models serving sub-20ms P99 latencies",
      "M.Tech or PhD in Computer Science, AI, or equivalent experience",
    ],
    skills: ["Python", "PyTorch", "LLMs", "Vector Search", "vLLM", "Kubernetes"],
    benefits: ["Performance Bonus up to 30%", "Top-tier Health Insurance", "Learning Stipend of ₹1L/year"],
    postedBy: "user-employer-1",
    applicantsCount: 19,
    featured: true,
    status: "active",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: "job-4",
    title: "DevOps & Cloud Platform Architect",
    company: "Zepto",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
    location: "Mumbai, Maharashtra",
    workplaceType: "Hybrid",
    salaryMin: 30,
    salaryMax: 45,
    salaryCurrency: "INR",
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Speed is everything at Zepto. We need a Platform Architect who treats infrastructure as code with utmost discipline. You will manage multi-region AWS clusters, automated canary deployments, and zero-downtime database upgrades.",
    requirements: [
      "5+ years scaling Kubernetes (EKS), Terraform, and ArgoCD",
      "Mastery of Datadog, Prometheus, Grafana, and distributed tracing",
      "Extensive experience defending against DDoS and implementing SOC-2 compliance",
    ],
    skills: ["AWS", "Kubernetes", "Terraform", "ArgoCD", "CI/CD", "Datadog", "Prometheus"],
    benefits: ["Lucrative Stock Options", "Free 10-minute Zepto Pass", "Flexible Work Hours"],
    postedBy: "user-employer-1",
    applicantsCount: 11,
    featured: false,
    status: "active",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: "job-5",
    title: "Frontend Engineer - React / WebGL (Remote India)",
    company: "Atlassian",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80",
    location: "Remote (India)",
    workplaceType: "Remote",
    salaryMin: 28,
    salaryMax: 42,
    salaryCurrency: "INR",
    experienceLevel: "Mid-Level",
    jobType: "Full-time",
    description: "Atlassian's TEAM Anywhere program lets you work from any city in India! Build next-generation interactive whiteboards and collaborative canvas features using React, Canvas API, and WebGL.",
    requirements: [
      "3+ years building high-performance frontend interfaces",
      "Deep understanding of browser rendering pipelines, Web Workers, and state synchronization",
      "Strong skills with TypeScript, React 19, and CSS animations",
    ],
    skills: ["React", "TypeScript", "Canvas API", "Performance Tuning", "Tailwind CSS"],
    benefits: ["100% Work from Anywhere in India", "WFH Setup Grant ($1500)", "Annual Global Team Retreats"],
    postedBy: "user-employer-1",
    applicantsCount: 32,
    featured: true,
    status: "active",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: "job-6",
    title: "Backend Engineering Intern (Go & Microservices)",
    company: "PhonePe",
    companyLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80",
    location: "Pune, Maharashtra",
    workplaceType: "On-site",
    salaryMin: 8,
    salaryMax: 12,
    salaryCurrency: "INR",
    experienceLevel: "Fresher",
    jobType: "Internship",
    description: "PhonePe is looking for enthusiastic engineering interns to join our Payments Core team. Get hands-on exposure writing Go microservices, handling real UPI traffic, and learning industrial engineering practices.",
    requirements: [
      "Final year B.Tech/M.Tech student in CS/IT or recent graduate (2025/2026 batch)",
      "Strong command of Data Structures, Algorithms, and Concurrency in Go or C++",
      "Curiosity about distributed databases and low-latency networking",
    ],
    skills: ["Go", "Data Structures", "SQL", "Git", "REST APIs"],
    benefits: ["PPO opportunity upon completion", "Stipend ₹75,000/month", "Subsidized Accommodation & Meals"],
    postedBy: "user-employer-1",
    applicantsCount: 64,
    featured: false,
    status: "active",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    _id: "job-7",
    title: "Staff Data Engineer (ClickHouse & dbt)",
    company: "Flipkart",
    companyLogo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80",
    location: "Bengaluru, Karnataka",
    workplaceType: "Hybrid",
    salaryMin: 38,
    salaryMax: 60,
    salaryCurrency: "INR",
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Flipkart's Big Billion Days scale is legendary. As Staff Data Engineer, you will own the analytical warehouse architectures serving real-time bidding, supply-chain predictions, and executive KPI reporting.",
    requirements: [
      "6+ years building petabyte-scale data platforms using Spark, ClickHouse, or Snowflake",
      "Expertise in modern ELT using dbt, Airflow, and stream processing with Flink",
      "Strong background in data modeling and query cost optimization",
    ],
    skills: ["ClickHouse", "dbt", "Apache Spark", "Python", "SQL", "Kafka", "Airflow"],
    benefits: ["Subsidized Daycare", "Comprehensive Medical Shield", "Employee Discount on Flipkart"],
    postedBy: "user-employer-1",
    applicantsCount: 16,
    featured: false,
    status: "active",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: "job-8",
    title: "Senior Product Manager - Fintech & UPI",
    company: "Google India",
    companyLogo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=128&auto=format&fit=crop&q=80",
    location: "Gurugram, NCR",
    workplaceType: "Hybrid",
    salaryMin: 50,
    salaryMax: 80,
    salaryCurrency: "INR",
    experienceLevel: "Lead",
    jobType: "Full-time",
    description: "Google Pay connects hundreds of millions of Indians to financial freedom. We are looking for a visionary Senior PM to lead merchant credit, micro-insurance integrations, and Soundbox voice-tech advancements.",
    requirements: [
      "6+ years of Product Management experience in high-growth Indian fintech",
      "Proven ability to navigate RBI regulatory frameworks and NPCI specifications",
      "Obsession with customer empathy and data-driven product telemetry",
    ],
    skills: ["Product Strategy", "UPI Ecosystem", "A/B Testing", "Fintech Regulations", "User Journeys"],
    benefits: ["Google Stock Units (GSUs)", "World-class Healthcare & Wellness", "On-site Creche & Gyms"],
    postedBy: "user-employer-1",
    applicantsCount: 22,
    featured: true,
    status: "active",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export const INITIAL_APPLICATIONS: MockApplication[] = [
  {
    _id: "app-1",
    jobId: "job-1",
    applicantId: "user-seeker-1",
    status: "Shortlisted",
    coverNote: "I have 5 years building scalable Next.js apps and payment gateways at high scale. Razorpay's technical culture is a dream fit.",
    resumeUrl: "https://example.com/aarav-resume.pdf",
    applicantDetails: {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91 98765 43210",
      experienceYears: 5,
      portfolioUrl: "https://aaravsharma.dev",
      currentCompany: "Infosys Labs",
    },
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: "app-2",
    jobId: "job-3",
    applicantId: "user-seeker-1",
    status: "Applied",
    coverNote: "Passionate about vector embeddings and conversational retrieval. Looking forward to discussing Swiggy's LLM roadmap.",
    resumeUrl: "https://example.com/aarav-resume.pdf",
    applicantDetails: {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91 98765 43210",
      experienceYears: 5,
      portfolioUrl: "https://aaravsharma.dev",
      currentCompany: "Infosys Labs",
    },
    appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// In-Memory Global Store with mutators for dynamic operation
class Store {
  users: MockUser[] = [...INITIAL_USERS];
  jobs: MockJob[] = [...INITIAL_JOBS];
  applications: MockApplication[] = [...INITIAL_APPLICATIONS];

  getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    workplaceType?: string;
    minSalary?: number;
  }) {
    let list = [...this.jobs];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters?.location && filters.location !== "All") {
      const loc = filters.location.toLowerCase();
      list = list.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (filters?.jobType && filters.jobType !== "All") {
      list = list.filter((j) => j.jobType === filters.jobType);
    }

    if (filters?.experienceLevel && filters.experienceLevel !== "All") {
      list = list.filter((j) => j.experienceLevel === filters.experienceLevel);
    }

    if (filters?.workplaceType && filters.workplaceType !== "All") {
      list = list.filter((j) => j.workplaceType === filters.workplaceType);
    }

    if (filters?.minSalary && filters.minSalary > 0) {
      list = list.filter((j) => j.salaryMax >= filters.minSalary!);
    }

    return list;
  }

  getJobById(id: string) {
    return this.jobs.find((j) => j._id === id);
  }

  addJob(job: Omit<MockJob, "_id" | "createdAt" | "applicantsCount" | "status">) {
    const newJob: MockJob = {
      ...job,
      _id: `job-${Date.now()}`,
      applicantsCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    this.jobs.unshift(newJob);
    return newJob;
  }

  getUser(id: string) {
    return this.users.find((u) => u._id === id);
  }

  getUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: Omit<MockUser, "_id" | "createdAt" | "savedJobs">) {
    const newUser: MockUser = {
      ...user,
      _id: `user-${Date.now()}`,
      savedJobs: [],
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  toggleSaveJob(userId: string, jobId: string) {
    const user = this.getUser(userId);
    if (!user) return [];
    if (user.savedJobs.includes(jobId)) {
      user.savedJobs = user.savedJobs.filter((id) => id !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    return user.savedJobs;
  }

  getApplications(applicantId?: string, jobId?: string) {
    let list = [...this.applications];
    if (applicantId) {
      list = list.filter((a) => a.applicantId === applicantId);
    }
    if (jobId) {
      list = list.filter((a) => a.jobId === jobId);
    }
    return list;
  }

  addApplication(data: Omit<MockApplication, "_id" | "appliedAt" | "status">) {
    const existing = this.applications.find(
      (a) => a.jobId === data.jobId && a.applicantId === data.applicantId
    );
    if (existing) {
      return existing;
    }
    const newApp: MockApplication = {
      ...data,
      _id: `app-${Date.now()}`,
      status: "Applied",
      appliedAt: new Date().toISOString(),
    };
    this.applications.unshift(newApp);

    // Bump applicant count
    const job = this.jobs.find((j) => j._id === data.jobId);
    if (job) {
      job.applicantsCount += 1;
    }
    return newApp;
  }

  updateApplicationStatus(
    appId: string,
    status: MockApplication["status"]
  ) {
    const app = this.applications.find((a) => a._id === appId);
    if (app) {
      app.status = status;
    }
    return app;
  }
}

// Global persistent instance across hot-reloading in dev mode
declare global {
  // eslint-disable-next-line no-var
  var memoryJobStore: Store | undefined;
}

export const inMemoryStore = global.memoryJobStore || new Store();
if (process.env.NODE_ENV !== "production") {
  global.memoryJobStore = inMemoryStore;
}
