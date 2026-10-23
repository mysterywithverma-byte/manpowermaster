"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { compressImageToWebP } from "@/lib/image-compressor";
import {
  FIRM_OWNERSHIP_CATEGORIES,
  BUSINESS_ORGANIZATION_NAMES,
  ALL_CATALOG_JOB_ROLES,
  getRolesForBusiness,
} from "@/data/businessCatalog";
import {
  Modal,
  Steps,
  Segmented,
  Radio,
  Input,
  Select,
  AutoComplete,
  Tag,
  Button,
  Upload,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Alert,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

export interface BranchItem {
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
}

interface NaukriOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const POPULAR_SKILLS = [
  "React.js",
  "Node.js",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Python",
  "Java",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Git",
  "Tally Prime",
  "GST Filing",
  "Accounting",
  "Financial Analysis",
  "B2B Sales",
  "Business Development",
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Customer Support",
  "Human Resources",
  "Talent Acquisition",
  "Graphic Design",
  "UI/UX Design",
  "Data Entry",
  "Office Administration",
];

const POPULAR_LOCATIONS = [
  "Bengaluru",
  "Delhi / NCR",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Chandigarh",
  "Jaipur",
  "Noida",
  "Gurugram",
  "Remote",
];

const POPULAR_DEGREES = [
  "B.Tech / B.E. (Computer Science)",
  "B.Tech / B.E. (Information Technology)",
  "B.Tech / B.E. (Mechanical)",
  "B.Tech / B.E. (Civil)",
  "B.Tech / B.E. (Electrical)",
  "B.Com / B.Com (Hons)",
  "BBA / BBM",
  "BCA",
  "B.Sc (IT / Computer Science)",
  "B.Sc (General)",
  "BA",
  "MBA / PGDM (Finance)",
  "MBA / PGDM (Marketing)",
  "MBA / PGDM (HR)",
  "MCA",
  "M.Tech",
  "M.Com",
  "Diploma / Polytechnic",
  "12th Pass",
  "Other Graduate",
];

const PASSING_YEARS = Array.from({ length: 2030 - 1985 + 1 }, (_, i) => String(2030 - i));

const COMMON_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Analyst",
  "Data Scientist",
  "Business Development Executive",
  "Sales Manager",
  "HR Recruiter / Manager",
  "Accountant / Finance",
  "Operations Executive",
  "Marketing Specialist",
  "Content Writer",
  "Customer Support",
];

const DEFAULT_INDUSTRIES = [
  "IT & Software Services",
  "Fintech & Banking",
  "E-Commerce & Retail",
  "Healthcare & Pharmaceuticals",
  "Manufacturing & Automotive",
  "EdTech & Education",
  "Logistics & Supply Chain",
  "Construction & Real Estate",
  "Hospitality & Tourism",
  "Renewable Energy & Solar",
  "Media & Entertainment",
  "Consulting & Professional Services",
  "Telecom & Networking",
  "Agriculture & Dairy",
  "Textiles & Garments",
];

const COMPANY_TYPES = [
  "Private Limited Company (Pvt Ltd)",
  "Public Limited Company",
  "Limited Liability Partnership (LLP)",
  "Partnership Firm",
  "Sole Proprietorship",
  "Startup (DPIIT Recognized)",
  "Multinational Corporation (MNC)",
  "Non-Profit / Trust / Section 8",
  "Government / PSU",
  "Joint Venture",
];

const COMPANY_SIZES = [
  "1-10 Employees",
  "11-50 Employees",
  "51-200 Employees",
  "201-500 Employees",
  "501-1000 Employees",
  "1000+ Employees",
];

const WORKPLACE_POLICIES = [
  "Hybrid (Office + WFH)",
  "On-site (Work From Office)",
  "Remote-First (Permanent WFH)",
  "Flexible / Role Dependent",
];

const WORKING_DAYS_OPTIONS = [
  "5 Days (Monday - Friday)",
  "5.5 Days (Alternate Saturdays)",
  "6 Days (Monday - Saturday)",
  "Rotational / Flexible Shifts",
];

const NOTICE_PERIOD_OPTIONS = [
  "Immediate Joiner",
  "15 Days or less",
  "1 Month (30 Days)",
  "2 Months (60 Days)",
  "3 Months (90 Days)",
  "Currently Serving Notice",
];

const COURSE_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Correspondence / Distance",
  "Executive / Online",
];

const BRANCH_TYPES = [
  "Branch Office",
  "Regional HQ",
  "R&D / Tech Center",
  "Warehouse / Plant",
  "Sales & Marketing Hub",
  "Co-working Space",
  "Client Site",
];

const HR_DESIGNATIONS = [
  "Head of Talent Acquisition",
  "HR Manager",
  "Director of People & Culture",
  "Lead Technical Recruiter",
  "Talent Acquisition Specialist",
  "HR Generalist",
  "Founder & CEO",
  "Co-Founder & COO",
  "Managing Director",
  "Operations Manager",
];

export function NaukriOnboardingModal({
  isOpen,
  onClose,
  onCompleted,
}: NaukriOnboardingModalProps) {
  const { user, updateUser, login } = useAuth();

  // Selected primary role: seeker (employee) or employer
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  // If seeker: fresher or experienced
  const [workStatus, setWorkStatus] = useState<"fresher" | "experienced">("fresher");

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Common Profile Fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.location || "");

  // Seeker - Fresher / Experienced Shared Fields
  const [highestDegree, setHighestDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [college, setCollege] = useState("");
  const [passingYear, setPassingYear] = useState("2024");
  const [courseType, setCourseType] = useState("Full Time");
  const [cgpaOrPercent, setCgpaOrPercent] = useState("");

  // Experienced Specific Fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [totalExpYears, setTotalExpYears] = useState("2");
  const [totalExpMonths, setTotalExpMonths] = useState("0");
  const [currentCtc, setCurrentCtc] = useState("12");
  const [noticePeriod, setNoticePeriod] = useState("30 Days");

  // Skills & Preferences
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React.js",
    "JavaScript",
    "Node.js",
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>(["Bengaluru", "Remote"]);
  const [expectedCtc, setExpectedCtc] = useState("18");
  const [headline, setHeadline] = useState("");

  // Resume Upload
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Employer Specific Fields - Complete Zoho Corporate Profile
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [companyLogo, setCompanyLogo] = useState(user?.companyLogo || "");
  const [companyType, setCompanyType] = useState("Private Limited");
  const [industry, setIndustry] = useState("IT & Software Services");
  const [companySize, setCompanySize] = useState("51-200 Employees");
  const [yearFounded, setYearFounded] = useState("2020");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [gstin, setGstin] = useState("");
  const [cin, setCin] = useState("");

  // Corporate HQ
  const [officeAddress, setOfficeAddress] = useState("");
  const [hqState, setHqState] = useState("");
  const [hqPincode, setHqPincode] = useState("");

  // Multi-Branch Network State
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchType, setNewBranchType] = useState("Branch Office");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [newBranchState, setNewBranchState] = useState("");
  const [newBranchPincode, setNewBranchPincode] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [newBranchContactPerson, setNewBranchContactPerson] = useState("");
  const [newBranchContactPhone, setNewBranchContactPhone] = useState("");
  const [newBranchContactEmail, setNewBranchContactEmail] = useState("");

  // Workplace Policy, Working Hours & Perks
  const [workplacePolicy, setWorkplacePolicy] = useState("Hybrid");
  const [workingDays, setWorkingDays] = useState("5 Days (Mon - Fri)");
  const [workingHours, setWorkingHours] = useState("9:30 AM - 6:30 PM (Flexible)");
  const [aboutCompany, setAboutCompany] = useState("");
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    "Comprehensive Health Insurance",
    "EPF & Gratuity Compliance",
    "Performance Bonuses & Incentives",
    "Free Gourmet Meals & Daily Snacks",
  ]);

  // Recruiter Details & Contacts
  const [recruiterDesignation, setRecruiterDesignation] = useState("Head of Talent Acquisition");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [hiringRoles, setHiringRoles] = useState<string[]>([
    "Frontend Developer",
    "Backend Developer",
  ]);
  const [customHiringRole, setCustomHiringRole] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Submission & Loading state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dynamic API Datasets for Location, Industry, and Company Type
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [industryOptions, setIndustryOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);

  const [companyTypeOptions, setCompanyTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCompanyTypes, setLoadingCompanyTypes] = useState(false);

  const searchCities = async (q: string = "") => {
    try {
      setLoadingCities(true);
      const res = await fetch(`/api/locations?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.suggestions && data.suggestions.length > 0) {
        setCityOptions(data.suggestions.map((c: string) => ({ label: c, value: c })));
      } else if (!q) {
        setCityOptions(POPULAR_LOCATIONS.map((c) => ({ label: c, value: c })));
      }
    } catch {
      setCityOptions(POPULAR_LOCATIONS.map((c) => ({ label: c, value: c })));
    } finally {
      setLoadingCities(false);
    }
  };

  const searchIndustries = async (q: string = "") => {
    try {
      setLoadingIndustries(true);
      const res = await fetch(`/api/industries?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setIndustryOptions(
          data.data.map((item: any) => ({
            label: `${item.name} (${item.category})`,
            value: item.name,
          }))
        );
      }
    } catch {
      // fallback
    } finally {
      setLoadingIndustries(false);
    }
  };

  const searchCompanyTypes = async (q: string = "") => {
    try {
      setLoadingCompanyTypes(true);
      const res = await fetch(`/api/company-types?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCompanyTypeOptions(
          data.data.map((item: any) => ({
            label: `${item.shortLabel} — ${item.description}`,
            value: item.shortLabel,
          }))
        );
      }
    } catch {
      // fallback
    } finally {
      setLoadingCompanyTypes(false);
    }
  };

  // Preload initial datasets when modal opens
  useEffect(() => {
    if (isOpen) {
      searchCities("");
      searchIndustries("");
      searchCompanyTypes("");
    }
  }, [isOpen]);

  // Sync initial user details when opening
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.location) setCity(user.location);
      if (user.role) setRole(user.role === "employer" ? "employer" : "seeker");
      if (user.companyName) setCompanyName(user.companyName);
      if (user.companyLogo) setCompanyLogo(user.companyLogo);
      if (user.resumeUrl) setResumeUrl(user.resumeUrl);
      if (user.resumeFileName) setResumeFileName(user.resumeFileName);
      if (user.headline) setHeadline(user.headline);
      if (user.skills && user.skills.length > 0) setSelectedSkills(user.skills);

      if (user.employerDetails) {
        const emp = user.employerDetails;
        if (emp.companyName) setCompanyName(emp.companyName);
        if (emp.brandName) setBrandName(emp.brandName);
        if (emp.tagline) setTagline(emp.tagline);
        if (emp.companyLogo) setCompanyLogo(emp.companyLogo);
        if (emp.companyType) setCompanyType(emp.companyType);
        if (emp.industry) setIndustry(emp.industry);
        if (emp.companySize) setCompanySize(emp.companySize);
        if (emp.yearFounded) setYearFounded(emp.yearFounded);
        if (emp.website) setCompanyWebsite(emp.website);
        if (emp.gstin) setGstin(emp.gstin);
        if (emp.cin) setCin(emp.cin);
        if (emp.officeAddress) setOfficeAddress(emp.officeAddress);
        if (emp.city) setCity(emp.city);
        if (emp.state) setHqState(emp.state);
        if (emp.pincode) setHqPincode(emp.pincode);
        if (emp.workplacePolicy) setWorkplacePolicy(emp.workplacePolicy);
        if (emp.workingDays) setWorkingDays(emp.workingDays);
        if (emp.workingHours) setWorkingHours(emp.workingHours);
        if (emp.aboutCompany) setAboutCompany(emp.aboutCompany);
        if (emp.perksAndBenefits && emp.perksAndBenefits.length > 0) {
          setSelectedPerks(emp.perksAndBenefits);
        }
        if (emp.recruiterDesignation) setRecruiterDesignation(emp.recruiterDesignation);
        if (emp.linkedinUrl) setLinkedinUrl(emp.linkedinUrl);
        if (emp.twitterUrl) setTwitterUrl(emp.twitterUrl);
        if (emp.hiringRoles && emp.hiringRoles.length > 0) {
          setHiringRoles(emp.hiringRoles);
        }
        if (emp.branches && emp.branches.length > 0) {
          setBranches(emp.branches);
        }
      }
    }
  }, [user, isOpen]);

  const togglePerk = (perk: string) => {
    if (selectedPerks.includes(perk)) {
      setSelectedPerks(selectedPerks.filter((p) => p !== perk));
    } else {
      setSelectedPerks([...selectedPerks, perk]);
    }
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim()) {
      setError("Please provide a Branch Name (e.g., Gurugram Cyber City Tech Hub).");
      return;
    }
    if (!newBranchCity.trim()) {
      setError("Please specify the Branch City.");
      return;
    }
    setError("");
    const branchItem: BranchItem = {
      id: `br-${Date.now()}`,
      branchName: newBranchName.trim(),
      branchType: newBranchType,
      address: newBranchAddress.trim() || newBranchCity.trim(),
      city: newBranchCity.trim(),
      state: newBranchState.trim(),
      pincode: newBranchPincode.trim(),
      contactPerson: newBranchContactPerson.trim() || name,
      contactPhone: newBranchContactPhone.trim() || phone,
      contactEmail: newBranchContactEmail.trim() || email,
      isHeadquarters: false,
    };

    setBranches((prev) => [...prev, branchItem]);
    setNewBranchName("");
    setNewBranchCity("");
    setNewBranchState("");
    setNewBranchPincode("");
    setNewBranchAddress("");
    setNewBranchContactPerson("");
    setNewBranchContactPhone("");
    setNewBranchContactEmail("");
    setShowAddBranch(false);
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setError("");
    try {
      // 1. Convert & compress image to lightweight WebP format
      const compressed = await compressImageToWebP(file, 400, 0.82);
      const formData = new FormData();
      formData.append("file", compressed.file);

      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setCompanyLogo(data.url);
      } else {
        // Fallback directly to client compressed WebP data URL
        setCompanyLogo(compressed.dataUrl);
      }
    } catch {
      setError("Error compressing and uploading company logo");
    } finally {
      setUploadingLogo(false);
    }
    return false;
  };

  // Auto-generate resume headline recommendation
  useEffect(() => {
    if (!headline || headline === "") {
      if (role === "seeker") {
        if (workStatus === "fresher") {
          const deg = highestDegree ? highestDegree.split("(")[0].trim() : "Recent Graduate";
          const skl = selectedSkills.slice(0, 3).join(", ");
          setHeadline(
            `${deg} skilled in ${skl || "modern tools"} seeking Entry-Level / Junior Opportunities.`
          );
        } else {
          const des = currentDesignation || "Software Professional";
          const comp = currentCompany ? ` at ${currentCompany}` : "";
          const skl = selectedSkills.slice(0, 3).join(", ");
          setHeadline(
            `${des}${comp} with ${totalExpYears}+ years experience in ${skl || "core technologies"}.`
          );
        }
      }
    }
  }, [role, workStatus, highestDegree, currentDesignation, currentCompany, selectedSkills, totalExpYears, headline]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length < 20) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleAddHiringRole = () => {
    if (customHiringRole.trim() && !hiringRoles.includes(customHiringRole.trim())) {
      setHiringRoles([...hiringRoles, customHiringRole.trim()]);
      setCustomHiringRole("");
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setResumeUrl(data.url);
        setResumeFileName(data.fileName || file.name);
      } else {
        setError(data.error || "Resume upload failed");
      }
    } catch {
      setError("Error uploading resume");
    } finally {
      setUploadingResume(false);
    }
    return false; // prevent AntD default upload
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let profilePayload: any = {
        name,
        email,
        phone,
        location: city,
        role,
        profileCompleted: true,
      };

      if (role === "seeker") {
        const educationRecord = highestDegree
          ? [
              {
                qualification: highestDegree,
                course: specialization || highestDegree,
                institute: college || "University",
                passingYear,
                courseType,
                percentageOrCgpa: cgpaOrPercent,
                degree: highestDegree,
                institution: college || "University",
                year: passingYear,
              },
            ]
          : [];

        const experienceRecord =
          workStatus === "experienced" && currentDesignation
            ? [
                {
                  role: currentDesignation,
                  company: currentCompany || "Current Organization",
                  duration: `${totalExpYears} yrs ${totalExpMonths} mos`,
                  description: `Working as ${currentDesignation} specializing in ${selectedSkills.slice(0, 4).join(", ")}.`,
                  isCurrent: true,
                },
              ]
            : [];

        profilePayload = {
          ...profilePayload,
          workStatus,
          candidateType: workStatus,
          headline:
            headline ||
            (workStatus === "fresher"
              ? `${highestDegree || "Graduate"} seeking entry level roles`
              : `${currentDesignation || "Professional"} with ${totalExpYears} years experience`),
          skills: selectedSkills,
          education: educationRecord,
          experienceHistory: experienceRecord,
          currentCtc: workStatus === "experienced" ? Number(currentCtc) || 0 : 0,
          expectedCtc: Number(expectedCtc) || 0,
          noticePeriod: workStatus === "experienced" ? noticePeriod : "Immediate",
          resumeUrl,
          resumeFileName,
          careerPreferences: {
            desiredRole: desiredRole || currentDesignation || "Software Professional",
            preferredLocations,
            expectedSalary: Number(expectedCtc) || 0,
            desiredJobType: "Permanent",
            desiredEmploymentType: "Full Time",
            preferredShift: "Day Shift",
          },
          personalDetails: {
            hometown: city,
            languages: [
              { language: "English", read: true, write: true, speak: true },
              { language: "Hindi", read: true, write: true, speak: true },
            ],
          },
        };
      } else {
        // Employer payload - Complete Zoho Corporate Profile & Multi-Branch Network
        let resolvedBranches = [...branches];
        if (resolvedBranches.length === 0 && (city || officeAddress)) {
          resolvedBranches = [
            {
              id: "br-headquarters",
              branchName: `${brandName || companyName || "Corporate"} - Head Office`,
              branchType: "Headquarters",
              address: officeAddress || city,
              city: city || "Corporate Location",
              state: hqState,
              pincode: hqPincode,
              contactPerson: name,
              contactPhone: phone,
              contactEmail: email,
              isHeadquarters: true,
            },
          ];
        }

        profilePayload = {
          ...profilePayload,
          companyName: companyName.trim(),
          companyLogo,
          headline: `${recruiterDesignation} at ${brandName || companyName}`,
          employerDetails: {
            companyName: companyName.trim(),
            brandName: (brandName || companyName).trim(),
            tagline: tagline.trim(),
            companyLogo,
            companyType,
            industry,
            companySize,
            yearFounded,
            website: companyWebsite.trim(),
            gstin: gstin.trim().toUpperCase(),
            cin: cin.trim().toUpperCase(),
            officeAddress: officeAddress.trim(),
            city: city.trim(),
            state: hqState.trim(),
            pincode: hqPincode.trim(),
            workplacePolicy,
            workingDays,
            workingHours,
            perksAndBenefits: selectedPerks,
            aboutCompany: aboutCompany.trim(),
            recruiterDesignation,
            linkedinUrl: linkedinUrl.trim(),
            twitterUrl: twitterUrl.trim(),
            hiringRoles,
            branches: resolvedBranches,
          },
        };
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          email: user?.email || email,
          profileData: profilePayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUser(data.user || profilePayload);
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ea580c", "#fb923c", "#16a34a", "#2563eb"],
        });

        setTimeout(() => {
          setSubmitting(false);
          if (onCompleted) onCompleted();
          onClose();
        }, 800);
      } else {
        setError(data.error || "Profile could not be saved.");
        setSubmitting(false);
      }
    } catch {
      setError("An unexpected error occurred while saving profile.");
      setSubmitting(false);
    }
  };

  // Steps definition for Employee vs Employer
  const seekerStepItems = [
    { title: "Work Status" },
    { title: "Basic Info" },
    { title: workStatus === "experienced" ? "Work & Education" : "Education" },
    { title: "Skills & Goals" },
  ];

  const employerStepItems = [
    { title: "Company Identity" },
    { title: "Branch Network" },
    { title: "Culture & Perks" },
    { title: "Recruiter & Hiring" },
  ];

  const stepItems = role === "seeker" ? seekerStepItems : employerStepItems;
  const maxSteps = stepItems.length;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      mask={{ closable: false }}
      styles={{
        body: { padding: "26px 28px" },
      }}
    >
      {/* Modal Header */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "#ea580c",
            color: "#ffffff",
            fontSize: 22,
            marginBottom: 8,
          }}
        >
          {role === "seeker" ? <UserOutlined /> : <BankOutlined />}
        </div>
        <Title level={3} style={{ margin: "4px 0 2px 0", color: "#0f172a" }}>
          {role === "seeker" ? "Complete Your Employee Profile" : "Complete Your Employer Profile"}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {role === "seeker"
            ? "Setup your verified candidate profile to get direct HR callbacks & 1-click applications."
            : "Setup your verified company console to start publishing vacancies & hiring talent."}
        </Text>

        {/* Quick Role Switcher (Employer Left, Employee Right) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <Segmented
            size="middle"
            value={role}
            onChange={(val) => {
              setRole(val as "seeker" | "employer");
              setCurrentStep(0);
              setError("");
            }}
            options={[
              {
                label: (
                  <Space size={6} style={{ padding: "2px 10px" }}>
                    <BankOutlined style={{ color: role === "employer" ? "#ea580c" : undefined }} />
                    <span style={{ fontWeight: 700 }}>Employer</span>
                  </Space>
                ),
                value: "employer",
              },
              {
                label: (
                  <Space size={6} style={{ padding: "2px 10px" }}>
                    <UserOutlined style={{ color: role === "seeker" ? "#ea580c" : undefined }} />
                    <span style={{ fontWeight: 700 }}>Employee</span>
                  </Space>
                ),
                value: "seeker",
              },
            ]}
          />
        </div>
      </div>

      {/* Steps Header */}
      <Steps
        current={currentStep}
        items={stepItems}
        size="small"
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {/* ============================================================== */}
      {/* STEP 0: EMPLOYEE WORK STATUS (NO REDUNDANT ROLE QUESTION)      */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={4} style={{ color: "#0f172a", margin: "0 0 6px" }}>
              What is your current work status?
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Select your career level to personalize your job feed and resume recommendations.
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div
                onClick={() => setWorkStatus("fresher")}
                style={{
                  border: workStatus === "fresher" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                  backgroundColor: workStatus === "fresher" ? "#fff7ed" : "#ffffff",
                  borderRadius: 14,
                  padding: "20px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
                className="hover:border-orange-400 active:scale-98"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: workStatus === "fresher" ? "#ea580c" : "#f1f5f9",
                    color: workStatus === "fresher" ? "#ffffff" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  <BookOutlined />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                    I am a Fresher
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Student or recently graduated college (0 years experience)
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div
                onClick={() => setWorkStatus("experienced")}
                style={{
                  border: workStatus === "experienced" ? "2px solid #ea580c" : "1px solid #e2e8f0",
                  backgroundColor: workStatus === "experienced" ? "#fff7ed" : "#ffffff",
                  borderRadius: 14,
                  padding: "20px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
                className="hover:border-orange-400 active:scale-98"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: workStatus === "experienced" ? "#ea580c" : "#f1f5f9",
                    color: workStatus === "experienced" ? "#ffffff" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  <SolutionOutlined />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                    I am Experienced
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Have work experience or currently working at an organization
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 1: BASIC INFO                                      */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Full Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Mobile Number <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Email Address <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 4, borderRadius: 10 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Current City <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <AutoComplete
                value={city}
                onChange={(val) => setCity(val)}
                onSearch={searchCities}
                options={cityOptions}
                filterOption={false}
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input
                  size="large"
                  prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
                  style={{ borderRadius: 10 }}
                />
              </AutoComplete>
            </Col>
          </Row>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 2: EDUCATION (FRESHER) / EXP & EDU (EXPERIENCED)   */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {workStatus === "experienced" && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
                Current / Most Recent Employment Details
              </Text>

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Designation / Role
                  </label>
                  <AutoComplete
                    value={currentDesignation}
                    onChange={(val) => setCurrentDesignation(val)}
                    options={COMMON_ROLES.map((r) => ({ label: r, value: r }))}
                    filterOption={(inputValue, option) =>
                      (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                    }
                    style={{ width: "100%", marginTop: 4 }}
                  >
                    <Input style={{ borderRadius: 8 }} />
                  </AutoComplete>
                </Col>
                <Col xs={24} sm={12}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Company Name
                  </label>
                  <Input
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </Col>
              </Row>

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Total Experience (Years)
                  </label>
                  <Select
                    value={totalExpYears}
                    onChange={(val) => setTotalExpYears(val)}
                    options={Array.from({ length: 30 }, (_, i) => ({
                      label: `${i} Years`,
                      value: String(i),
                    }))}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Current Annual CTC (₹ LPA)
                  </label>
                  <Input
                    prefix="₹"
                    suffix="LPA"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ marginTop: 4, borderRadius: 8 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    Notice Period
                  </label>
                  <AutoComplete
                    value={noticePeriod}
                    onChange={(val) => setNoticePeriod(val)}
                    options={NOTICE_PERIOD_OPTIONS.map((n) => ({ label: n, value: n }))}
                    filterOption={(inputValue, option) =>
                      (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                    }
                    style={{ width: "100%", marginTop: 4 }}
                  >
                    <Input style={{ borderRadius: 8 }} />
                  </AutoComplete>
                </Col>
              </Row>
            </div>
          )}

          {/* Education Block */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
              Highest Educational Qualification
            </Text>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Degree / Qualification
                </label>
                <AutoComplete
                  value={highestDegree}
                  onChange={(val) => setHighestDegree(val)}
                  options={POPULAR_DEGREES.map((d) => ({ label: d, value: d }))}
                  filterOption={(inputValue, option) =>
                    (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                  }
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <Input style={{ borderRadius: 8 }} />
                </AutoComplete>
              </Col>
              <Col xs={24} sm={12}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  College / Institute Name
                </label>
                <Input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Passing Year
                </label>
                <Select
                  value={passingYear}
                  onChange={(val) => setPassingYear(val)}
                  options={PASSING_YEARS.map((yr) => ({ label: yr, value: yr }))}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Course Type
                </label>
                <AutoComplete
                  value={courseType}
                  onChange={(val) => setCourseType(val)}
                  options={COURSE_TYPE_OPTIONS.map((c) => ({ label: c, value: c }))}
                  filterOption={(inputValue, option) =>
                    (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                  }
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <Input style={{ borderRadius: 8 }} />
                </AutoComplete>
              </Col>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  Grading (% or CGPA)
                </label>
                <Input
                  value={cgpaOrPercent}
                  onChange={(e) => setCgpaOrPercent(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 8 }}
                />
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEEKER STEP 3: SKILLS, SALARY, RESUME & PREFERENCES             */}
      {/* ============================================================== */}
      {role === "seeker" && currentStep === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Skills Picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
              Key Skills (Select or add skills for recruiter keyword matching)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 110, overflowY: "auto", marginBottom: 8 }}>
              {POPULAR_SKILLS.map((skl) => {
                const isSelected = selectedSkills.includes(skl);
                return (
                  <Tag.CheckableTag
                    key={skl}
                    checked={isSelected}
                    onChange={() => toggleSkill(skl)}
                    style={{
                      borderRadius: 16,
                      padding: "3px 10px",
                      fontSize: 11,
                      border: isSelected ? "1px solid #ea580c" : "1px solid #e2e8f0",
                    }}
                  >
                    {skl}
                  </Tag.CheckableTag>
                );
              })}
            </div>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                size="small"
                placeholder="Skill name"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onPressEnter={handleAddCustomSkill}
              />
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCustomSkill}
                style={{ fontWeight: 600 }}
              >
                Add Skill
              </Button>
            </Space.Compact>
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Target / Desired Job Role
              </label>
              <AutoComplete
                value={desiredRole}
                onChange={(val) => setDesiredRole(val)}
                options={ALL_CATALOG_JOB_ROLES.map((r) => ({ label: r, value: r }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Expected Annual CTC (₹ LPA)
              </label>
              <Input
                prefix="₹"
                suffix="LPA"
                value={expectedCtc}
                onChange={(e) => setExpectedCtc(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Resume Upload Box */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px dashed #cbd5e1",
              textAlign: "center",
            }}
          >
            <Upload
              beforeUpload={handleResumeUpload}
              showUploadList={false}
              accept=".pdf,.doc,.docx"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingResume}
                style={{ borderRadius: 8 }}
              >
                {resumeFileName ? "Replace Resume Document" : "Upload Resume (PDF, DOCX)"}
              </Button>
            </Upload>
            {resumeFileName && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                <CheckCircleFilled /> Attached: {resumeFileName}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              DOC, DOCX, PDF | Max size: 5 MB
            </div>
          </div>

          {/* Resume Headline */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
              Naukri Resume Headline
            </label>
            <Input.TextArea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              style={{ marginTop: 4, borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 0: COMPANY IDENTITY & LEGAL DETAILS              */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Company Identity &amp; Legal Entity
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Zoho-grade verified company setup for publishing jobs and managing team hiring.
              </div>
            </div>
            <Tag color="orange" style={{ borderRadius: 6, fontWeight: 700 }}>
              Step 1 of 4
            </Tag>
          </div>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={14}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Company Legal Registered Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<BankOutlined style={{ color: "#94a3b8" }} />}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={10}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Brand / Trade Name
              </label>
              <Input
                size="large"
                prefix={<ShopOutlined style={{ color: "#94a3b8" }} />}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Logo & Tagline Row */}
          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Company Logo URL or Upload
              </label>
              <Space.Compact style={{ width: "100%", marginTop: 4 }}>
                <Input
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <Upload
                  beforeUpload={handleLogoUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploadingLogo}
                    style={{ borderRadius: "0 8px 8px 0" }}
                  >
                    Upload
                  </Button>
                </Upload>
              </Space.Compact>
              {companyLogo && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={companyLogo}
                    alt="Logo Preview"
                    style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6, border: "1px solid #e2e8f0" }}
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                  <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                    Logo linked successfully
                  </span>
                </div>
              )}
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Company Tagline / Mission
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Category of Firm by Ownership <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <AutoComplete
                value={companyType}
                onChange={(val) => setCompanyType(val)}
                options={FIRM_OWNERSHIP_CATEGORIES.map((t) => ({ label: t, value: t }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input size="large" style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Industry / Organization Business Type
              </label>
              <AutoComplete
                value={industry}
                onChange={(val) => setIndustry(val)}
                onSearch={searchIndustries}
                options={
                  industryOptions.length > 0
                    ? industryOptions
                    : BUSINESS_ORGANIZATION_NAMES.map((name) => ({ label: name, value: name }))
                }
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input size="large" style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
          </Row>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Company Size
              </label>
              <AutoComplete
                value={companySize}
                onChange={(val) => setCompanySize(val)}
                options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input size="large" style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Year Founded
              </label>
              <Select
                size="large"
                value={yearFounded}
                onChange={(val) => setYearFounded(val)}
                options={PASSING_YEARS.slice(0, 45).map((yr) => ({ label: yr, value: yr }))}
                style={{ width: "100%", marginTop: 4 }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Official Website
              </label>
              <Input
                size="large"
                prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />}
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Legal / Tax Identification */}
          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                GSTIN (15 Digits Tax Number)
              </label>
              <Input
                value={gstin}
                maxLength={15}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                style={{ marginTop: 4, borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.5 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                CIN / Registration / MSME UDYAM No.
              </label>
              <Input
                value={cin}
                onChange={(e) => setCin(e.target.value.toUpperCase())}
                style={{ marginTop: 4, borderRadius: 8, textTransform: "uppercase" }}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 1: MULTI-BRANCH NETWORK & LOCATIONS               */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Multi-Branch Office Network &amp; Locations
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Add all your office branches so you can assign job openings to specific branch locations.
              </div>
            </div>
            <Tag color="orange" style={{ borderRadius: 6, fontWeight: 700 }}>
              Step 2 of 4
            </Tag>
          </div>

          {/* Primary Headquarters Box */}
          <div
            style={{
              border: "1px solid #fed7aa",
              backgroundColor: "#fffaf5",
              borderRadius: 10,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <BankOutlined style={{ color: "#ea580c", fontSize: 16 }} />
              <strong style={{ fontSize: 13, color: "#9a3412" }}>
                Corporate Headquarters (Primary Office)
              </strong>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={10}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  Headquarter City <span style={{ color: "#ea580c" }}>*</span>
                </label>
                <AutoComplete
                  value={city}
                  onChange={(val) => setCity(val)}
                  onSearch={searchCities}
                  options={cityOptions}
                  filterOption={false}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <Input
                    prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />}
                    style={{ borderRadius: 6 }}
                  />
                </AutoComplete>
              </Col>
              <Col xs={24} sm={8}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  State
                </label>
                <Input
                  value={hqState}
                  onChange={(e) => setHqState(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 6 }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  Pincode
                </label>
                <Input
                  maxLength={6}
                  value={hqPincode}
                  onChange={(e) => setHqPincode(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 6 }}
                />
              </Col>
              <Col xs={24}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  HQ Street Address / Tech Park / Floor <span style={{ color: "#ea580c" }}>*</span>
                </label>
                <Input
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  style={{ marginTop: 4, borderRadius: 6 }}
                />
              </Col>
            </Row>
          </div>

          {/* Additional Branches Header & List */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Registered Branch Offices ({branches.length})
              </span>
              {!showAddBranch && (
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setShowAddBranch(true)}
                  style={{ fontWeight: 600, borderRadius: 6 }}
                >
                  Add Another Branch
                </Button>
              )}
            </div>

            {branches.length === 0 && !showAddBranch && (
              <div
                style={{
                  padding: "16px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 10,
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 24, color: "#94a3b8", marginBottom: 6 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                  No extra branches added yet.
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  If your company has regional offices in other cities, add them here.
                </div>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddBranch(true)}
                  style={{ marginTop: 10, borderRadius: 6 }}
                >
                  Add Branch Office
                </Button>
              </div>
            )}

            {/* List of Branches */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {branches.map((b) => (
                <div
                  key={b.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 13, color: "#1e293b" }}>{b.branchName}</strong>
                      <Tag color="blue" style={{ borderRadius: 4, fontSize: 10, padding: "0 6px" }}>
                        {b.branchType}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      <EnvironmentOutlined style={{ color: "#ea580c", marginRight: 4 }} />
                      {b.address}, {b.city} {b.state ? `, ${b.state}` : ""} {b.pincode ? `- ${b.pincode}` : ""}
                    </div>
                    {(b.contactPerson || b.contactPhone) && (
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        Contact: {b.contactPerson} {b.contactPhone ? `(${b.contactPhone})` : ""}
                      </div>
                    )}
                  </div>

                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteBranch(b.id)}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add Branch Inline Form */}
          {showAddBranch && (
            <div
              style={{
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                borderRadius: 10,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>
                Add New Branch Office Details:
              </div>

              <Row gutter={[10, 10]}>
                <Col xs={24} sm={14}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch Display Name <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <Input
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>
                <Col xs={24} sm={10}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch Type
                  </label>
                  <AutoComplete
                    value={newBranchType}
                    onChange={(val) => setNewBranchType(val)}
                    options={BRANCH_TYPES.map((b) => ({ label: b, value: b }))}
                    filterOption={(inputValue, option) =>
                      (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                    }
                    style={{ width: "100%", marginTop: 2 }}
                  >
                    <Input style={{ borderRadius: 6 }} />
                  </AutoComplete>
                </Col>

                <Col xs={24} sm={10}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch City <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <AutoComplete
                    value={newBranchCity}
                    onChange={(val) => setNewBranchCity(val)}
                    onSearch={searchCities}
                    options={cityOptions}
                    filterOption={false}
                    style={{ width: "100%", marginTop: 2 }}
                  >
                    <Input style={{ borderRadius: 6 }} />
                  </AutoComplete>
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    State
                  </label>
                  <Input
                    value={newBranchState}
                    onChange={(e) => setNewBranchState(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Pincode
                  </label>
                  <Input
                    maxLength={6}
                    value={newBranchPincode}
                    onChange={(e) => setNewBranchPincode(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>

                <Col xs={24}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch Street Address
                  </label>
                  <Input
                    value={newBranchAddress}
                    onChange={(e) => setNewBranchAddress(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch Contact Person
                  </label>
                  <Input
                    value={newBranchContactPerson}
                    onChange={(e) => setNewBranchContactPerson(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Contact Phone
                  </label>
                  <Input
                    value={newBranchContactPhone}
                    onChange={(e) => setNewBranchContactPhone(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Branch Email
                  </label>
                  <Input
                    value={newBranchContactEmail}
                    onChange={(e) => setNewBranchContactEmail(e.target.value)}
                    style={{ marginTop: 2, borderRadius: 6 }}
                  />
                </Col>
              </Row>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <Button size="small" onClick={() => setShowAddBranch(false)}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={handleAddBranch}
                  style={{ fontWeight: 600 }}
                >
                  Save Branch
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 2: CULTURE, WORKPLACE POLICY & PERKS             */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Workplace Culture, Policy &amp; Employee Benefits
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Candidates evaluate perks, shift timings, and work environment before applying.
              </div>
            </div>
            <Tag color="orange" style={{ borderRadius: 6, fontWeight: 700 }}>
              Step 3 of 4
            </Tag>
          </div>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Work Model
              </label>
              <AutoComplete
                value={workplacePolicy}
                onChange={(val) => setWorkplacePolicy(val)}
                options={WORKPLACE_POLICIES.map((p) => ({ label: p, value: p }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input size="large" style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Working Days Policy
              </label>
              <AutoComplete
                value={workingDays}
                onChange={(val) => setWorkingDays(val)}
                options={WORKING_DAYS_OPTIONS.map((d) => ({ label: d, value: d }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input size="large" style={{ borderRadius: 8 }} />
              </AutoComplete>
            </Col>
            <Col xs={24} sm={8}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Standard Timings
              </label>
              <Input
                size="large"
                prefix={<ClockCircleOutlined style={{ color: "#94a3b8" }} />}
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
              About the Company &amp; Culture (Shown on Job Openings)
            </label>
            <Input.TextArea
              rows={3}
              value={aboutCompany}
              onChange={(e) => setAboutCompany(e.target.value)}
              style={{ marginTop: 4, borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
              Key Employee Perks &amp; Benefits Provided (Click to select)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Comprehensive Health Insurance",
                "EPF & Gratuity Compliance",
                "Performance Bonuses & Incentives",
                "ESOPs / Company Stock Options",
                "Free Gourmet Meals & Daily Snacks",
                "Cab / Transport Facility",
                "Learning & Certification Budget",
                "Paid Vacation & Sick Leaves",
                "Maternity & Paternity Benefits",
                "Gym & Wellness Allowances",
                "Annual Company Retreats",
                "Flexible Work Hours",
              ].map((perk) => {
                const isSelected = selectedPerks.includes(perk);
                return (
                  <button
                    key={perk}
                    type="button"
                    onClick={() => togglePerk(perk)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      border: isSelected ? "1px solid #ea580c" : "1px solid #cbd5e1",
                      backgroundColor: isSelected ? "#fff7ed" : "#ffffff",
                      color: isSelected ? "#ea580c" : "#475569",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? <CheckCircleFilled style={{ color: "#ea580c" }} /> : "+"}
                    <span>{perk}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYER STEP 3: RECRUITER & DIRECT HIRING NEEDS               */}
      {/* ============================================================== */}
      {role === "employer" && currentStep === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Lead Recruiter &amp; Hiring Communication
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Primary contact details for receiving candidate applications and scheduling interviews.
              </div>
            </div>
            <Tag color="green" style={{ borderRadius: 6, fontWeight: 700 }}>
              Final Step 4 of 4
            </Tag>
          </div>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Lead Recruiter / HR Contact Name <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Official Designation <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <AutoComplete
                value={recruiterDesignation}
                onChange={(val) => setRecruiterDesignation(val)}
                options={HR_DESIGNATIONS.map((d) => ({ label: d, value: d }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ width: "100%", marginTop: 4 }}
              >
                <Input
                  size="large"
                  prefix={<SolutionOutlined style={{ color: "#94a3b8" }} />}
                  style={{ borderRadius: 8 }}
                />
              </AutoComplete>
            </Col>
          </Row>

          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Official Work Email <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Contact Mobile / WhatsApp Number <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Social Links */}
          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                LinkedIn Company Page URL
              </label>
              <Input
                prefix={<LinkedinOutlined style={{ color: "#0077b5" }} />}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Twitter / X Company Profile
              </label>
              <Input
                prefix={<TwitterOutlined style={{ color: "#0284c7" }} />}
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                style={{ marginTop: 4, borderRadius: 8 }}
              />
            </Col>
          </Row>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
              Roles Currently Hiring For (Candidate matching active):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {hiringRoles.map((r, i) => (
                <Tag
                  key={i}
                  closable
                  onClose={() => setHiringRoles(hiringRoles.filter((_, idx) => idx !== i))}
                  style={{ borderRadius: 12, padding: "3px 10px", backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}
                >
                  {r}
                </Tag>
              ))}
            </div>

            {getRolesForBusiness(industry).length > 0 && (
              <div style={{ marginBottom: 10, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                  Suggested Roles for {industry || "Your Organization"} (Click to quick-add):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 110, overflowY: "auto" }}>
                  {getRolesForBusiness(industry)
                    .filter((r) => !hiringRoles.includes(r))
                    .map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setHiringRoles((prev) => [...prev, r])}
                        style={{
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          color: "#334155",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <PlusOutlined style={{ fontSize: 9, color: "#ea580c" }} />
                        <span>{r}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            <Space.Compact style={{ width: "100%" }}>
              <AutoComplete
                value={customHiringRole}
                onChange={(val) => setCustomHiringRole(val)}
                options={ALL_CATALOG_JOB_ROLES.map((r) => ({ label: r, value: r }))}
                filterOption={(inputValue, option) =>
                  (option?.value?.toUpperCase() || "").indexOf(inputValue.toUpperCase()) !== -1
                }
                style={{ flex: 1 }}
              >
                <Input
                  placeholder="Role title"
                  onPressEnter={handleAddHiringRole}
                />
              </AutoComplete>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddHiringRole}
                style={{ fontWeight: 600 }}
              >
                Add Role
              </Button>
            </Space.Compact>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {currentStep > 0 ? (
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            Previous
          </Button>
        ) : (
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
        )}

        <Space size={10}>
          {currentStep > 0 && (
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>
          )}

          {currentStep < maxSteps - 1 ? (
            <Button
              type="primary"
              size="large"
              style={{ fontWeight: 600, borderRadius: 8 }}
              onClick={() => {
                if (currentStep === 1 && role === "seeker" && (!name || !email)) {
                  setError("Please provide your name and email.");
                  return;
                }
                if (currentStep === 0 && role === "employer" && !companyName) {
                  setError("Please provide your company registered name.");
                  return;
                }
                if (currentStep === 1 && role === "employer" && (!city || !officeAddress)) {
                  setError("Please provide your Headquarter City and Corporate Address.");
                  return;
                }
                setError("");
                setCurrentStep((prev) => prev + 1);
              }}
            >
              <span>Next Step</span>
              <ArrowRightOutlined />
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              loading={submitting}
              icon={<CheckCircleFilled />}
              onClick={handleSubmit}
              style={{ fontWeight: 700, borderRadius: 8 }}
            >
              Save Company Profile &amp; Start
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
