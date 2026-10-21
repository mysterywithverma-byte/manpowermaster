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
  noticePeriod?: string;
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
  isVerified?: boolean;
  isBlocked?: boolean;
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
  isVerified?: boolean;
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
  }) {
    let list = [...this.jobs];

    if (filters?.postedBy) {
      list = list.filter(
        (j) =>
          j.postedBy === filters.postedBy ||
          (filters.company && j.company.toLowerCase() === filters.company.toLowerCase())
      );
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

