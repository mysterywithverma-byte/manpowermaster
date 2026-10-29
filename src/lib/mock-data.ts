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
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  avatar?: string;
  savedJobs: string[];
  noticePeriod?: string;
  currentCtc?: number;
  expectedCtc?: number;
  workStatus?: "fresher" | "experienced";
  candidateType?: "fresher" | "experienced";
  profileCompleted?: boolean;
  education?: any[];
  experienceHistory?: any[];
  itSkills?: any[];
  projects?: any[];
  accomplishments?: any;
  careerPreferences?: any;
  personalDetails?: any;
  employerDetails?: {
    companyName?: string;
    brandName?: string;
    tagline?: string;
    companyLogo?: string;
    companyType?: string;
    industry?: string;
    companySize?: string;
    yearFounded?: string;
    website?: string;
    gstin?: string;
    cin?: string;
    officeAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    workplacePolicy?: string;
    workingDays?: string;
    workingHours?: string;
    perksAndBenefits?: string[];
    aboutCompany?: string;
    recruiterDesignation?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    hiringRoles?: string[];
    branches?: {
      id: string;
      branchName: string;
      branchType: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      isHeadquarters?: boolean;
    }[];
  };
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  companyName?: string;
  companyLogo?: string;
  whatsappAlerts?: boolean;
  isVerified?: boolean;
  isBlocked?: boolean;
  isReported?: boolean;
  reportReason?: string;
  blockedReason?: string;
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
  salaryMonthlyMin?: number;
  salaryMonthlyMax?: number;
  experienceLevel: "Fresher" | "Mid-Level" | "Senior" | "Lead" | "Executive";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  openingsCount?: number;
  qualification?: string;
  shiftTiming?: string;
  workingDays?: string;
  genderPreference?: string;
  englishLevel?: string;
  requiredAssets?: string[];
  interviewMode?: string;
  interviewAddress?: string;
  interviewStartDate?: string;
  interviewEndDate?: string;
  interviewTimeSlot?: string;
  recruiterWhatsApp?: string;
  urgentHiring?: boolean;
  expiryDays?: number;
  expiresAt?: string;
  postedBy: string;
  applicantsCount: number;
  featured: boolean;
  isVerified?: boolean;
  status: "active" | "closed" | "filled" | "expired";
  createdAt: string;
  updatedAt?: string;
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
    _id: "admin-master-1",
    name: "Master Admin",
    email: "admin@manpowermaster.com",
    role: "admin",
    headline: "System Administrator & Platform Operations",
    bio: "Official System Administrator of Manpower Master Platform.",
    phone: "+91 98726 20706",
    location: "Jalandhar, Punjab, India",
    skills: ["Platform Management", "Recruiter Verification", "Job Moderation"],
    resumeUrl: "",
    savedJobs: [],
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "user-employer-1",
    name: "Priya Sharma",
    email: "priya.sharma@techcorp.in",
    role: "employer",
    companyName: "TechCorp Global Technologies Pvt. Ltd.",
    companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
    phone: "",
    location: "Bengaluru, Karnataka",
    headline: "Head of Talent Acquisition & People Operations",
    bio: "Head of Talent Acquisition with 10+ years of corporate hiring experience.",
    skills: ["Talent Acquisition", "Technical Recruiting", "Executive Search"],
    resumeUrl: "",
    isVerified: true,
    profileCompleted: true,
    employerDetails: {
      companyName: "TechCorp Global Technologies Pvt. Ltd.",
      brandName: "TechCorp",
      tagline: "Building next-generation cloud native systems & AI assistants",
      companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
      companyType: "Private Limited",
      industry: "IT & Software Services",
      companySize: "201-500 Employees",
      yearFounded: "2018",
      website: "https://techcorpglobal.com",
      gstin: "29AABCT1332M1ZG",
      cin: "U72200KA2018PTC112345",
      officeAddress: "Tower B, 7th Floor, Embassy TechVillage, Outer Ring Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      workplacePolicy: "Hybrid",
      workingDays: "5 Days (Mon - Fri)",
      workingHours: "9:30 AM - 6:30 PM (Flexible)",
      perksAndBenefits: [
        "Comprehensive Health Insurance (₹7 Lakhs)",
        "Performance Bonus & ESOPs",
        "Free Gourmet Meals & Snacks",
        "Company Cab Facility",
        "Annual ₹50,000 Learning Allowance",
        "Wellness & Gym Reimbursement",
      ],
      aboutCompany:
        "TechCorp Global is a premier engineering solutions company architecting modern cloud-native systems and AI assistants for Fortune 500 enterprises across US, Europe, and Asia-Pacific.",
      recruiterDesignation: "Head of Talent Acquisition",
      linkedinUrl: "https://linkedin.com/company/techcorpglobal",
      twitterUrl: "https://x.com/techcorpglobal",
      hiringRoles: [
        "Senior React / Next.js Engineer",
        "Backend Python & Golang Developer",
        "DevOps & AWS Cloud Architect",
        "Product Designer (UI/UX)",
      ],
      branches: [
        {
          id: "br-hq-blr",
          branchName: "Corporate Headquarters - Bengaluru",
          branchType: "Headquarters",
          address: "Tower B, 7th Floor, Embassy TechVillage, Outer Ring Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560103",
          contactPerson: "Priya Sharma",
          contactPhone: "+91 98765 43210",
          contactEmail: "blr.recruiting@techcorpglobal.com",
          isHeadquarters: true,
        },
        {
          id: "br-ncr-ggn",
          branchName: "North India Innovation Hub - Gurugram",
          branchType: "Regional HQ",
          address: "Building 10C, 5th Floor, DLF Cyber City, Phase 2",
          city: "Gurugram",
          state: "Haryana",
          pincode: "122002",
          contactPerson: "Rohan Kapoor",
          contactPhone: "+91 98112 34567",
          contactEmail: "ncr.talent@techcorpglobal.com",
          isHeadquarters: false,
        },
        {
          id: "br-mum-bkc",
          branchName: "Western Financial Center - Mumbai",
          branchType: "Branch Office",
          address: "The Capital, Level 9, Bandra Kurla Complex (BKC), Bandra East",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400051",
          contactPerson: "Sneha Nair",
          contactPhone: "+91 98201 98765",
          contactEmail: "mumbai.careers@techcorpglobal.com",
          isHeadquarters: false,
        },
      ],
    },
    savedJobs: [],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "user-seeker-1",
    name: "Rohit Verma",
    email: "rohitverma@example.com",
    role: "seeker",
    phone: "+91 98726 20706",
    location: "Bengaluru, Karnataka",
    headline: "Full Stack Engineer (React, Node.js, Next.js, TypeScript)",
    bio: "Full Stack Engineer specializing in TypeScript, Next.js and high-performance cloud applications.",
    resumeUrl: "",
    skills: ["React.js", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB"],
    profileCompleted: true,
    savedJobs: [],
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_JOBS: MockJob[] = [];

export const INITIAL_APPLICATIONS: MockApplication[] = [];

// In-Memory Global Store with mutators for dynamic operation
class Store {
  users: MockUser[] = [...INITIAL_USERS];
  jobs: MockJob[] = [];
  applications: MockApplication[] = [];

  getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    workplaceType?: string;
    minSalary?: number;
    postedBy?: string;
    company?: string;
    allStatuses?: boolean;
    status?: string;
  }) {
    // Auto-expire jobs past their expiresAt date
    const now = Date.now();
    for (const j of this.jobs) {
      if (j.expiresAt && new Date(j.expiresAt).getTime() < now && j.status === "active") {
        j.status = "expired";
      }
    }

    let list = [...this.jobs];

    if (filters?.postedBy) {
      list = list.filter(
        (j) =>
          j.postedBy === filters.postedBy ||
          (filters.company && j.company.toLowerCase() === filters.company.toLowerCase())
      );
      if (filters?.status && filters.status !== "all") {
        list = list.filter((j) => j.status === filters.status);
      }
    } else if (!filters?.allStatuses) {
      // Public seeker search: only active and non-expired jobs
      list = list.filter((j) => j.status === "active");
    } else if (filters?.status && filters.status !== "all") {
      list = list.filter((j) => j.status === filters.status);
    }

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

  updateJob(id: string, updates: Partial<MockJob>) {
    const job = this.getJobById(id);
    if (!job) return undefined;
    Object.assign(job, updates);
    return job;
  }

  deleteJob(id: string) {
    const idx = this.jobs.findIndex((j) => j._id === id);
    if (idx === -1) return false;
    this.jobs.splice(idx, 1);
    return true;
  }

  getUsers(filters?: { search?: string; role?: string; isVerified?: boolean }) {
    let list = [...this.users];
    if (filters?.role && filters.role !== "all") {
      list = list.filter((u) => u.role === filters.role);
    }
    if (filters?.isVerified !== undefined) {
      list = list.filter((u) => Boolean(u.isVerified) === filters.isVerified);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyName && u.companyName.toLowerCase().includes(q))
      );
    }
    return list;
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

  updateUser(id: string, updates: Partial<MockUser>) {
    const user = this.getUser(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  deleteUser(id: string) {
    const idx = this.users.findIndex((u) => u._id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
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

  getApplications(applicantId?: string, jobId?: string, recruiterId?: string) {
    let list = [...this.applications];
    if (applicantId) {
      list = list.filter((a) => a.applicantId === applicantId);
    }
    if (jobId) {
      list = list.filter((a) => a.jobId === jobId);
    }
    if (recruiterId) {
      const recruiterJobIds = new Set(
        this.jobs.filter((j) => j.postedBy === recruiterId).map((j) => j._id)
      );
      list = list.filter((a) => recruiterJobIds.has(a.jobId));
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
// Immediately purge any cached fake jobs and fake applications
inMemoryStore.jobs = [];
inMemoryStore.applications = [];
inMemoryStore.users = [...INITIAL_USERS];

if (process.env.NODE_ENV !== "production") {
  global.memoryJobStore = inMemoryStore;
}

