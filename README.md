# Manpower Master 💼
### Advanced Corporate Job & Placement Platform (Govt. GSTIN Regd: 03IPTPB9968A1ZJ)

Manpower Master is a high-speed, direct hiring and talent placement portal designed for verified corporate staffing across Punjab, Delhi NCR, and PAN-India. 

---

## 🌟 Key Highlights & Design Aesthetics
- **Linear/Vercel Futuristic UI/UX**: Deep dark palette (`#06080e`), subtle glowing ambient gradients, glassmorphism (`backdrop-blur-xl`), crisp glowing borders, and smooth micro-interactions.
- **Compensation Transparency**: Indian compensation standards displayed in **₹ LPA** (e.g. ₹32 - ₹48 LPA) with dynamic CTC filtering.
- **1-Click Evaluation Personas**: Seamless 1-click persona switcher in the top navigation bar to toggle between:
  - 👤 **Job Seeker**: Aarav Sharma (Senior Full Stack Engineer)
  - 🏢 **Employer**: Priya Nair (Head of Talent Acquisition @ Razorpay)
  - 🛡️ **Admin**: Vikram Malhotra (Root Operations & Moderation)
- **1-Click Fast Apply**: Pre-filled candidate details, cover note pitch, resume link, and celebratory `canvas-confetti` animation upon submission.
- **Recruiter Review Board**: Live candidate pipeline management where employers can review resumes and move candidates between stages (`Applied` ➔ `Shortlisted` ➔ `Interviewed` ➔ `Hired` ➔ `Rejected`).
- **Dark / Light Mode**: Seamless theme switching with persistent localStorage preference.
- **Dual Database Resilience**: Native MongoDB & Mongoose schemas with a high-fidelity in-memory fallback store so the entire application works immediately out-of-the-box even without a local MongoDB daemon running.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript)
- **Styling**: Tailwind CSS with custom glassmorphism and glow tokens
- **Database**: MongoDB with Mongoose (with automated fallback store)
- **Icons**: Lucide React
- **Animations**: Framer Motion & Canvas Confetti

---

## 📁 Project Architecture
```
src/
├── app/
│   ├── api/
│   │   ├── applications/          # Applications GET, POST
│   │   │   └── [id]/              # PATCH hiring stage (Shortlist, Hire, etc.)
│   │   ├── auth/
│   │   │   ├── login/             # Login & instant demo authentication
│   │   │   └── register/          # Dual-role signup (Seeker vs Employer)
│   │   ├── jobs/                  # Jobs search, filtering & creation
│   │   │   └── [id]/              # Single job details
│   │   ├── seed/                  # Diagnostics & database seeder
│   │   └── users/saved-jobs/      # Bookmark & saved jobs persistence
│   ├── globals.css                # Glassmorphism & Linear glow styles
│   ├── layout.tsx                 # Root layout with Theme & Auth providers
│   └── page.tsx                   # Master page coordinating board & dashboards
├── components/
│   ├── Navbar.tsx                 # Glow logo, view switcher, demo persona pill
│   ├── HeroSection.tsx            # Glowing search bar, metrics ticker & tags
│   ├── JobCard.tsx                # Glassmorphic job card with ₹ LPA & quick apply
│   ├── JobFilters.tsx             # CTC slider, work mode, city & experience filters
│   ├── JobDetailsModal.tsx        # Comprehensive job drawer with requirements & perks
│   ├── ApplyJobModal.tsx          # 1-Click apply with confetti celebration
│   ├── PostJobModal.tsx           # Employer opening publisher
│   ├── SeekerDashboard.tsx        # Application pipeline stage tracker & bookmarks
│   ├── EmployerDashboard.tsx      # Recruiter candidate review board & analytics
│   ├── AdminDashboard.tsx         # Platform telemetry, DB status & moderation
│   ├── AuthModal.tsx              # Role-based login and registration
│   └── Footer.tsx                 # Indian tech hubs directory & links
├── context/
│   ├── AuthContext.tsx            # Multi-role authentication & state synchronization
│   └── ThemeContext.tsx           # Dark/Light theme provider
└── lib/
    ├── db.ts                      # Resilient Mongoose connection cache
    ├── mock-data.ts               # Indian tech ecosystem dataset & in-memory engine
    ├── models/
    │   ├── User.ts                # Seeker, Employer & Admin Mongoose schema
    │   ├── Job.ts                 # Job listing Mongoose schema
    │   └── Application.ts         # Application pipeline Mongoose schema
    └── utils.ts                   # Salary in ₹ LPA, timeAgo, clsx/tailwindMerge
```

---

## 🚀 Running Locally
1. Start the development server:
```bash
npm run dev
```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. (Optional) To connect your MongoDB cluster, copy `.env.example` to `.env.local`:
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
```
