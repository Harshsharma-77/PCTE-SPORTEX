# PCTE SPORTEX — College Sports Management System

> **Final-Year BTech CSE Capstone Project**  
> **Institution**: Punjab College of Technical Education (PCTE)  
> **Platform**: Production-Grade Sports Management, Live Match Telemetry & Athletic Analytics SaaS  
> 
> 🌐 **Live Web Application**: [https://pcte-sportex.vercel.app](https://pcte-sportex.vercel.app)  
> ⚡ **Live Production API**: [https://pcte-sportex-api.onrender.com](https://pcte-sportex-api.onrender.com)  
> 🗄️ **Database**: Serverless PostgreSQL (Neon Cloud)  

---

## 🌟 Executive Overview
**PCTE SPORTEX** is a full-stack, enterprise-grade college sports management platform designed to replace legacy paper records and disconnected spreadsheets with a unified, real-time digital sports ecosystem. Built from the ground up using **TypeScript**, **React 18**, **Node.js/Express**, **PostgreSQL**, **Prisma ORM**, and **Socket.IO**, SPORTEX powers the complete athletic lifecycle across collegiate sports.

---

## 🎯 Key Capabilities & Modules

### 1. 🛡️ Role-Based Access Control (RBAC) & Security
* Dual-token authentication (short-lived access tokens with secure refresh token architecture).
* 6 Granular Role Scopes:
  * `SUPER_ADMIN` (Director of Sports): Full platform authority, compliance audit logs, and sports catalog.
  * `SPORTS_ADMIN` (Sports Coordinator): Tournament administration, ground bookings, and certificates.
  * `COACH`: Assigned team roster management, tactical positions, and training attendance.
  * `REFEREE`: Certified match officiating and WebSocket live score control.
  * `STUDENT`: Medical clearances, squad rosters, career telemetry, and QR certificates.
  * `VIEWER`: Public live scoreboards, match commentary, and tournament points tables.

### 2. ⚡ Real-Time Live Scoring Engine (Zero Page Refresh)
* Socket.IO room-based WebSocket broadcasting architecture.
* Real-time timer control (kickoff, pause, extra time, half time, full time).
* Sport-specific event telemetry:
  * **Football**: Goals, assists, yellow/red cards, penalties, substitutions.
  * **Cricket**: Ball-by-ball scoring, runs, wickets, overs, extras, boundaries.
  * **Basketball**: 1-pt / 2-pt / 3-pt field goals, quarters, timeouts, team fouls.
  * **Sets (Badminton / Volleyball)**: Set points, game points, set victory cascades.
  * **Generic Scoring**: Universal point increments with live text commentary.

### 3. 🏆 Tournaments, Brackets & Automated Fixtures
* Tournament cup formats: Single Elimination Knockout, Round Robin League, and League-cum-Knockout.
* Automated fixture generator with seed-based pairings.
* Automated post-match cascade: updates Points Table (`Played`, `Won`, `Drawn`, `Lost`, `GD`, `Points`, `Form Guide`), team leaderboards, and player career statistics.

### 4. 📜 Cryptographic QR Verification & PDF Certificates
* Institutional certificate issuing engine for 7 honor categories: `WINNER`, `RUNNER_UP`, `THIRD_PLACE`, `PARTICIPATION`, `BEST_PLAYER`, `BEST_GOALKEEPER`, `FAIR_PLAY`.
* Cryptographic `verificationUuid` token and unique registry number (`SPORTEX/2026/{SPORT}/{XXXX}`).
* **Public Zero-Auth Verification Portal** (`/verify-certificate/:certificateId`) querying PostgreSQL directly with live emerald authenticity seal and revocation protection.

### 5. 📦 Sports Equipment & Inventory Management
* Equipment catalog tracking total vs available stock, condition ratings (`NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), and storage locations.
* Loan checkout desk with return due dates and recipient notifications.
* Return processor with condition updates, fine assessment, and low-stock warnings.

### 6. 🏟️ Venues & Schedule Conflict Detection Engine
* Multi-sport campus grounds directory (capacities, indoor/outdoor categorization, floodlights).
* Automated mathematical conflict detector preventing double-booking of grounds during match time slots.

### 7. 💬 Grievance & Feedback Desk
* Student athlete dispute submission across 6 categories with priority tagging (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
* Administrative response desk with resolution notes and status tracking (`PENDING`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`).

### 8. 🔍 Global Omnisearch (`CTRL + K` / `CMD + K`)
* Universal debounced search modal across Students, Teams, Sports, Tournaments, Matches, and Announcements.

### 9. 🔒 Security & Compliance Audit Trail
* Immutable audit ledger recording actor, action, entity scope, IP address, timestamp, and JSON state diffs.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui design language, Framer Motion, Lucide Icons, Recharts, Vite |
| **Backend API** | Node.js, Express, TypeScript, Zod validation, JWT, BcryptJS, Helmet, CORS |
| **Real-Time Stream** | Socket.IO (WebSockets with polling fallback) |
| **Database & ORM** | PostgreSQL 16+, Prisma ORM (24 relational data models) |
| **Tooling & Build** | Vite, Rollup manual chunking, ESLint, TypeScript Strict Mode |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: v14.0 or higher
* **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/pcte/sportex.git
cd pcte-sportex
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env

# Run Prisma migrations & seed demo data
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start development client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🕹️ System Walkthrough & How to Use

### 1. How to Schedule ("Plot") a Match
1. Log in as **Super Admin** (`superadmin@pcte.edu.in`) or **Sports Admin** (`sportsadmin@pcte.edu.in`).
2. Navigate to **Fixtures & Scheduling** (`/admin/fixtures`) from the left sidebar.
3. Click the **"Schedule New Match"** button.
4. Select the **Tournament**, **Home Team**, **Away Team**, **Venue Complex**, **Match Referee**, and **Date/Time**.
5. The system automatically executes a **Venue Conflict Check** — if the ground is already booked for another match at that time, it prevents double-booking!
6. Click **Schedule Fixture**. Your match will instantly appear in the schedule and public calendar!
7. *Alternative:* Go to **Tournaments** (`/admin/tournaments`), select any cup, and click **"Generate Fixtures"** to automatically pair all registered teams in a knockout or round-robin bracket.

### 2. How to Manage Teams & Sports Club Members
1. Log in as **Super Admin** or **Sports Admin** and go to **Teams Directorate** (`/admin/teams`).
2. Click **"Register New Team"** to create a departmental franchise (e.g., *CSE Cyber Strikers*, *ME Mechanical Titans*).
3. Assign the head coach and select team jersey colors.
4. To add student members to a team squad:
   * Click on the team card or click **"Add Member"**.
   * Select a registered student athlete, enter their **Jersey Number** (e.g., #10), set their tactical **Position** (Forward, Midfielder, Goalkeeper), and toggle whether they are **Team Captain**.
5. *Coach Perspective:* The assigned coach (`coach.football@pcte.edu.in`) can log in, view their squad at `/coach/team`, and mark daily training attendance at `/coach/attendance`.

### 3. How to Generate & Verify Certificates
1. Log in as **Super Admin** or **Sports Admin** and go to **Certificate Issuer Hub** (`/admin/certificates`).
2. Click the **"Issue New Certificate"** button.
3. Choose the **Student Athlete**, the **Sport**, the **Tournament**, and the **Honor Type** (`WINNER`, `RUNNER_UP`, `THIRD_PLACE`, `PARTICIPATION`, `BEST_PLAYER`, `BEST_GOALKEEPER`, `FAIR_PLAY`).
4. Click **"Generate & Issue Certificate"**.
5. The system cryptographically generates a unique UUID verification token and official registry number (e.g. `SPORTEX/2026/FOOTBALL/0042`).
6. The student athlete instantly receives an in-app notification and can view/download their certificate with an authentic QR code at `/student/certificates`.
7. **Verification Test:** Anyone (including your professor) can open `/verify-certificate/:certificateId` or scan the QR code with a phone to verify the certificate against PostgreSQL with a green authenticity seal.

### 4. How to Run Live Match Scoring (Real-Time WebSockets)
1. Log in as **Referee** (`referee.sharma@pcte.edu.in` / `Password@123`).
2. Navigate to **Referee Matches** (`/referee/matches`) and click **"Open Live Scoring Console"** on any scheduled match.
3. Open a second browser tab (or student mobile browser) to `/live`.
4. In the referee console, click **"Kickoff / Start Match"**, add a **Goal**, **Card**, or **Points**.
5. Watch the viewer screen update **instantly in real time without refreshing the page!**

---

## 🔑 Demo User Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@pcte.edu.in` | `AdminPassword@2026` | Full platform authority, sports codes, audit trail |
| **Sports Admin** | `sportsadmin@pcte.edu.in` | `Password@123` | Tournaments, fixtures, equipment, certificates |
| **Coach** | `coach.football@pcte.edu.in` | `Password@123` | Assigned football squad, roster, attendance |
| **Referee** | `referee.sharma@pcte.edu.in` | `Password@123` | Certified officiating & live match scoring |
| **Student Athlete** | `harsh.cse@pcte.edu.in` | `Password@123` | Athlete profile, clearances, QR certificates |

---

## 📁 Repository Structure

```
pcte-sportex/
├── client/                      # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components, modals, layout
│   │   ├── context/             # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/               # Module pages (Admin, Coach, Referee, Student, Live)
│   │   ├── services/            # Axios API clients & WebSocket listeners
│   │   ├── types/               # TypeScript data definitions
│   │   ├── App.tsx              # Application route registry
│   │   └── main.tsx             # Entry point
│   ├── vite.config.ts           # Vite build & chunking config
│   └── package.json
│
├── server/                      # Node.js + Express API Backend
│   ├── prisma/
│   │   ├── schema.prisma        # 24 Prisma relational database models
│   │   └── seed.ts              # Institutional seed dataset
│   ├── src/
│   │   ├── config/              # Database & environment configuration
│   │   ├── controllers/         # Express HTTP route controllers
│   │   ├── middleware/          # JWT auth, RBAC, error handlers
│   │   ├── routes/              # Modular Express route declarations
│   │   ├── services/            # Core business logic & database queries
│   │   ├── sockets/             # Socket.IO live scoring room broadcaster
│   │   └── index.ts             # Express & HTTP server bootstrap
│   └── package.json
│
└── README.md                    # System documentation
```

---

## 🛡️ Security Best Practices
* **Zero Plaintext Passwords**: Password hashing via BcryptJS (10 salt rounds).
* **Role-Based Authorization**: Enforced on every mutation via `authenticateJwt` and `authorizeRoles`.
* **Zero-Auth Verification Safety**: Certificate verification queries only public metadata; student PII and internal credentials remain protected.
* **SQL Injection & XSS Protection**: Parameterized queries via Prisma ORM and HTTP security headers via Helmet.

---

## 🎓 Academic Capstone Details
* **Project**: BTech CSE Major Project (Final Year)
* **College**: Punjab College of Technical Education (PCTE)
* **Author**: PCTE BTech CSE Batch 2023-2027
