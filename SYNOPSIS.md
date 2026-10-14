# PROJECT SYNOPSIS

## 1. PROJECT TITLE
**PCTE SPORTEX: An Enterprise-Grade College Sports Management, Real-Time Live Scoring & Cryptographic Certificate Verification SaaS Platform**

---

## 2. ACADEMIC DETAILS
* **Degree:** Bachelor of Technology (B.Tech)
* **Discipline:** Computer Science & Engineering (CSE)
* **Institution:** Punjab College of Technical Education (PCTE), Ludhiana
* **Academic Year:** 2025 – 2026

---

## 3. INTRODUCTION & BACKGROUND
Collegiate sports and athletic programs play an indispensable role in holistic student development, institutional reputation, and university physical education governance. However, the operational administration of sports programs across higher education institutes in India continues to rely heavily on legacy paperwork, uncoordinated spreadsheets, and physical notice boards. 

**PCTE SPORTEX** is a cloud-native, full-stack athletic governance and real-time match telemetry Software-as-a-Service (SaaS) platform. Designed specifically for university campuses, SPORTEX replaces fragmented administrative bottlenecks with an automated, synchronized digital ecosystem that unifies the Athletic Directorate, Coaches, Certified Referees, and Student Athletes on a single platform.

---

## 4. PROBLEM STATEMENT
Traditional collegiate sports administration faces multiple systemic inefficiencies:
1. **Inefficient Match Management:** Fixture scheduling, referee assignments, and ground bookings are vulnerable to double-booking and schedule collisions due to a lack of automated conflict detection.
2. **Delayed Match Results & Standings:** Spectators, athletes, and team managers must wait hours or days for tournament points tables and statistics to be manually tallied.
3. **Absence of Real-Time Telemetry:** There is no centralized digital mechanism for live, ball-by-ball or goal-by-goal event broadcasting for spectators unable to attend campus grounds.
4. **Fraud-Prone Physical Certificates:** Paper sports achievement certificates can easily be duplicated, altered, or forged without an instant cryptographic verification mechanism for employers and university authorities.
5. **Equipment Loss & Disorganized Inventory:** High university asset turnover causes loss of sports equipment due to manual paper registers and lack of item condition tracking.

---

## 5. OBJECTIVES OF THE PROPOSED SYSTEM
The primary objective of **PCTE SPORTEX** is to design, develop, and deploy an automated, real-time sports operations ecosystem with the following specific goals:
* **Role-Based Access Control (RBAC):** Implement strict cryptographic authorization across 6 distinct roles: `SUPER_ADMIN`, `SPORTS_ADMIN`, `COACH`, `REFEREE`, `STUDENT`, and `VIEWER`.
* **Real-Time Live Match Telemetry:** Build a zero-page-refresh live scoring engine using Socket.IO WebSockets that broadcasts game timers, sport-specific events (goals, runs, cards, sets), and text commentary to spectators with <50ms latency.
* **Automated Tournament & Standings Engine:** Support Single Elimination Knockouts, Round Robin Leagues, and automated seeding. Automatically cascade completed match results into dynamic points tables (Played, Won, Lost, Drawn, Points, Goal Difference, Form Guide) without human intervention.
* **Cryptographic QR Certificate Engine:** Generate verifiable achievement certificates equipped with a cryptographic UUID token and public zero-auth QR validation page (`/verify-certificate/:id`) querying PostgreSQL directly.
* **Venue Scheduling & Conflict Detection:** Mathematically verify and prevent overlapping fixture time slots across college sports grounds.
* **Equipment Inventory & Loan Ledger:** Track equipment catalog, condition ratings (`NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), and issue/return desk with fine calculations and low-stock alerts.
* **Global Omnisearch (`Ctrl + K`):** Provide rapid, debounced global search indexing students, teams, sports, tournaments, matches, and announcements.

---

## 6. SYSTEM ARCHITECTURE & METHODOLOGY

### 6.1 Architectural Pattern
The application adheres to a decoupled **Three-Tier Client-Server Architecture**:
1. **Presentation Layer (Frontend):** Developed in React 18, TypeScript, Tailwind CSS, shadcn/ui design language, and Framer Motion animations.
2. **Application & Business Logic Layer (Backend API & WebSockets):** Node.js and Express with modular service-controller architecture, Zod schema validation, Helmet security headers, and Socket.IO real-time event broadcasting.
3. **Persistence & Data Layer:** Relational PostgreSQL 16+ managed through Prisma ORM with 24 normalized data models and connection pooling.

```
┌────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (CLIENT)              │
│       React 18 + TypeScript + Vite + Tailwind CSS      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS (REST) & WSS (Socket.IO)
┌──────────────────────────▼─────────────────────────────┐
│                 APPLICATION GATEWAY & API               │
│       Node.js Express + Zod Validation + JWT/RBAC      │
│            Socket.IO Real-Time Event Broker            │
└──────────────────────────┬─────────────────────────────┘
                           │ Prisma ORM (24 Relational Models)
┌──────────────────────────▼─────────────────────────────┐
│                   PERSISTENCE LAYER                    │
│          Serverless PostgreSQL 16+ (Neon Cloud)        │
└────────────────────────────────────────────────────────┘
```

---

## 7. FUNCTIONAL MODULES

1. **Authentication & Security Directorate:**
   * Dual-token JWT (short-lived access tokens + secure refresh token rotation).
   * Irreversible salted password hashing via BcryptJS (10 rounds).
   * Strict route middleware enforcing RBAC permission matrices.

2. **Varsity Sports & Franchise Directory:**
   * Multi-sport catalog configuration (Football, Cricket, Basketball, Badminton, Volleyball).
   * Departmental team franchises, squad enrollments, jersey numbering, captaincy assignments, and tactical positions.

3. **Tournament & Fixture Scheduling Directorate:**
   * Single elimination knockout & round-robin tournament formats.
   * Automated fixture pairing engine based on team seeding.
   * Ground scheduling with mathematical conflict detection.

4. **Real-Time Live Match Arena:**
   * Referee scoring console with kickoff, pause, and extra-time clock controls.
   * Sport-specific event telemetry (goals, cards, runs, wickets, overs, quarters, set points).
   * Bidirectional room-based WebSocket broadcasting to public viewers.

5. **Automated Standings & Career Analytics:**
   * Automated post-match cascade updating points tables and form strings.
   * Top scorers (Golden Boot), tournament MVPs, and student career analytics.

6. **Cryptographic Certificate Verification:**
   * Institutional PDF certificate generator for Winner, Runner-Up, and Participation.
   * Zero-Auth QR verification portal confirming database authenticity and status.

7. **Equipment Inventory & Loan Ledger:**
   * Stock tracking, loan checkout desk with return due dates, and condition inspections.

8. **Grievance Desk & Audit Trail:**
   * Student dispute and feedback submission with administrative resolution tracking.
   * Immutable compliance audit ledger recording actor, action, IP address, and JSON diffs.

---

## 8. HARDWARE & SOFTWARE SPECIFICATIONS

### 8.1 Software Requirements
* **Operating System:** Windows 10/11, Linux (Ubuntu), or macOS
* **Runtime Environment:** Node.js (v18.0.0 or higher)
* **Frontend Framework:** React 18, TypeScript, Tailwind CSS, Vite
* **Backend Framework:** Express.js 4, TypeScript
* **Database Engine:** PostgreSQL 16+ (Serverless Neon Cloud)
* **Object-Relational Mapping (ORM):** Prisma ORM v5.22
* **Real-Time Streaming:** Socket.IO v4.8
* **Deployment Platforms:** Vercel (Frontend), Render (Backend API), Neon (Cloud DB)

### 8.2 Minimum Hardware Requirements
* **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
* **Memory (RAM):** Minimum 4 GB (8 GB recommended for local builds)
* **Storage:** 500 MB free hard disk space
* **Network:** Active internet connection (broadband/Wi-Fi for cloud API and WebSockets)

---

## 9. EXPECTED OUTCOMES & IMPACT
* **Operational Efficiency:** 90% reduction in paper administrative overhead for scheduling, team registrations, and tournament logistics.
* **Instant Information Dissemination:** Real-time match scores and points table standings available instantly across campus without physical delays.
* **Zero Certificate Forgery:** Absolute authenticity guarantee for student sports certificates through cryptographic QR verification.
* **Institutional Preparedness:** Delivers a deployable, scalable SaaS software solution ready for live campus adoption during athletic championships.

---

## 10. CONCLUSION
**PCTE SPORTEX** provides an end-to-end, resilient digital transformation for collegiate sports administration. By harmonizing modern web technologies, strict access control, low-latency WebSockets, and cryptographic validation, the platform bridges the divide between campus athletic departments, student participants, and collegiate sports enthusiasts.
