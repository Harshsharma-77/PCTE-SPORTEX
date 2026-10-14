# PCTE SPORTEX — Major Project Technical Specification & Academic Design Report

**Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)**  
**Department of Computer Science & Engineering**  
**Punjab College of Technical Education (PCTE), Ludhiana**  

---

## 1. Executive Abstract
Modern collegiate sports departments face significant operational bottlenecks when managing athletic programs with paper-based scorecards, static spreadsheets, and unverified participation certificates. **PCTE SPORTEX** is an enterprise-grade, full-stack College Sports Management System designed to digitize the complete athletic lifecycle. The system provides role-based workspaces for **Super Administrators (Sports Director)**, **Sports Administrators**, **Team Coaches**, **Match Referees**, and **Student Athletes**, complemented by a low-latency real-time WebSocket scoring arena and a zero-auth cryptographic certificate verification engine.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Client Layer ["Client Tier (React 18 + Vite)"]
        UI_Admin["Admin & Directorate Portal"]
        UI_Coach["Coach Squad & Attendance Desk"]
        UI_Referee["Referee Live Scoring Arena"]
        UI_Student["Student Athlete Career Hub"]
        UI_Public["Public Scoreboard & Certificate Verifier"]
    end

    subgraph Transport Layer ["API Gateway & Transport"]
        HTTP_Gateway["REST API Router (/api/v1/*)"]
        WS_Gateway["Socket.IO WebSocket Server"]
        Auth_MW["JWT & RBAC Middleware"]
    end

    subgraph Service Tier ["Business & Logic Services"]
        AuthSvc["Auth & Security Service"]
        LiveScoreSvc["Real-Time Scoring Engine"]
        TournamentSvc["Tournament & Bracket Pairing Engine"]
        CertSvc["Cryptographic Certificate Engine"]
        VenueSvc["Conflict Detection Engine"]
        InventorySvc["Equipment Inventory Desk"]
        FeedbackSvc["Grievance Resolution Desk"]
        AuditSvc["Compliance Audit Logging"]
    end

    subgraph Data Tier ["Persistence & Storage"]
        PrismaORM["Prisma Relational ORM"]
        PostgreSQL[("PostgreSQL 16+ Database")]
    end

    UI_Admin --> HTTP_Gateway
    UI_Coach --> HTTP_Gateway
    UI_Referee --> HTTP_Gateway
    UI_Student --> HTTP_Gateway
    UI_Public --> HTTP_Gateway

    UI_Referee <--> WS_Gateway
    UI_Public <--> WS_Gateway

    HTTP_Gateway --> Auth_MW
    Auth_MW --> AuthSvc
    Auth_MW --> TournamentSvc
    Auth_MW --> CertSvc
    Auth_MW --> VenueSvc
    Auth_MW --> InventorySvc
    Auth_MW --> FeedbackSvc
    Auth_MW --> AuditSvc

    WS_Gateway <--> LiveScoreSvc
    LiveScoreSvc --> AuditSvc

    AuthSvc --> PrismaORM
    LiveScoreSvc --> PrismaORM
    TournamentSvc --> PrismaORM
    CertSvc --> PrismaORM
    VenueSvc --> PrismaORM
    InventorySvc --> PrismaORM
    FeedbackSvc --> PrismaORM
    AuditSvc --> PrismaORM

    PrismaORM <--> PostgreSQL
```

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : "owns"
    USER }|--|| ROLE : "assigned"
    USER ||--o| STUDENT : "profile"
    USER ||--o| COACH : "profile"
    USER ||--o| REFEREE : "profile"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ FEEDBACK : "submits"
    USER ||--o{ NOTIFICATION : "receives"

    ROLE ||--o{ ROLE_PERMISSION : "grants"
    PERMISSION ||--o{ ROLE_PERMISSION : "maps"

    SPORT ||--o{ TEAM : "sanctions"
    SPORT ||--o{ TOURNAMENT : "categorizes"
    SPORT ||--o{ EQUIPMENT : "uses"

    COACH ||--o{ TEAM : "coaches"
    COACH ||--o{ ATTENDANCE : "marks"

    STUDENT ||--o{ TEAM_MEMBER : "rostered"
    STUDENT ||--o{ MATCH_EVENT : "scores"
    STUDENT ||--o{ PLAYER_STATISTIC : "records"
    STUDENT ||--o{ CERTIFICATE : "awarded"
    STUDENT ||--o{ ATTENDANCE : "attends"

    TEAM ||--o{ TEAM_MEMBER : "contains"
    TEAM ||--o{ TOURNAMENT_TEAM : "enrolled"
    TEAM ||--o{ POINTS_TABLE_ENTRY : "ranks"
    TEAM ||--o{ MATCH : "plays_home"
    TEAM ||--o{ MATCH : "plays_away"

    TOURNAMENT ||--o{ TOURNAMENT_TEAM : "registers"
    TOURNAMENT ||--o{ MATCH : "schedules"
    TOURNAMENT ||--o{ POINTS_TABLE_ENTRY : "tallies"
    TOURNAMENT ||--o{ CERTIFICATE : "issues"

    MATCH ||--o{ MATCH_EVENT : "logs"
    MATCH }|--o| VENUE : "hosted_at"
    MATCH }|--o| REFEREE : "officiated_by"

    EQUIPMENT ||--o{ EQUIPMENT_ISSUE : "loans"
    USER ||--o{ EQUIPMENT_ISSUE : "borrows"
```

---

## 4. Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        SuperAdmin["Super Admin (Director)"]
        SportsAdmin["Sports Admin"]
        Coach["Team Coach"]
        Referee["Match Official / Referee"]
        Student["Student Athlete"]
        PublicUser["Public Spectator / Employer"]
    end

    subgraph Use Cases
        UC1["Configure Sports Codes & Rules"]
        UC2["Create Tournaments & Pair Brackets"]
        UC3["Schedule Matches & Check Venue Conflicts"]
        UC4["Manage Team Squad & Jersey Roster"]
        UC5["Take Training Attendance"]
        UC6["Control Live Scoring & Clock Console"]
        UC7["Post-Match Result & Points Table Cascade"]
        UC8["Generate Verifiable QR Certificates"]
        UC9["Verify Certificate Publicly (Zero-Auth)"]
        UC10["Equipment Issue & Loan Tracking"]
        UC11["Submit Grievance / Feedback Ticket"]
        UC12["Inspect System Compliance Audit Trail"]
        UC13["Perform Global CTRL+K Omnisearch"]
    end

    SuperAdmin --> UC1
    SuperAdmin --> UC2
    SuperAdmin --> UC8
    SuperAdmin --> UC10
    SuperAdmin --> UC12
    SuperAdmin --> UC13

    SportsAdmin --> UC2
    SportsAdmin --> UC3
    SportsAdmin --> UC8
    SportsAdmin --> UC10
    SportsAdmin --> UC13

    Coach --> UC4
    Coach --> UC5
    Coach --> UC11
    Coach --> UC13

    Referee --> UC6
    Referee --> UC7
    Referee --> UC13

    Student --> UC9
    Student --> UC11
    Student --> UC13

    PublicUser --> UC9
    PublicUser --> UC13
```

---

## 5. Data Flow Diagrams (DFD)

### A. Level 0 Context Diagram (DFD Level 0)

```mermaid
graph TD
    User["Stakeholder / Athlete / Referee"] <-->|"Credentials / Auth Requests"| SPORTEX["SPORTEX Core System"]
    SPORTEX <-->|"Live Match Scores / Events"| SocketIO["WebSocket Broadcast Engine"]
    SPORTEX <-->|"Relational Data Transactions"| DB[("PostgreSQL 16")]
    Verifier["External Verifier / Employer"] <-->|"Certificate Token Lookup"| SPORTEX
```

### B. Level 1 Operational DFD (Match & Scoring Engine)

```mermaid
graph TD
    Referee["Referee / Official"] -->|"1. Start Match (POST /live/:id/start)"| MatchController
    MatchController -->|"2. Validate Permissions"| AuthMW["Auth & Role Guard"]
    AuthMW -->|"3. Update Status to LIVE"| MatchService
    MatchService -->|"4. Record in DB"| DB[("PostgreSQL")]
    MatchService -->|"5. Emit match:live_update"| SocketServer["Socket.IO Server"]
    SocketServer -->|"6. Broadcast Room Payload"| Spectators["Spectators & Public Screens"]
    Referee -->|"7. Log Goal / Run / Point Event"| MatchController
    MatchController -->|"8. Calculate & Append Event"| MatchService
    MatchService -->|"9. Complete Match"| StandingsCascade["Post-Match Cascade Engine"]
    StandingsCascade -->|"10. Update Points Table & Stats"| DB
```

---

## 6. Real-Time Scoring State Machine

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED : Fixture Created
    SCHEDULED --> WARMUP : Teams Arrive
    WARMUP --> LIVE : Referee Starts Clock
    LIVE --> PAUSED : Half-Time / Timeout / Injury
    PAUSED --> LIVE : Clock Resumed
    LIVE --> COMPLETED : Final Whistle / Match End
    COMPLETED --> [*] : Results & Points Table Cascaded
    SCHEDULED --> POSTPONED : Inclement Weather
    SCHEDULED --> CANCELLED : Forfeit / Mutual Agreement
```

---

## 7. Security Implementation & Compliance Matrix

| Security Domain | Implementation Standard | Defense Technique |
|---|---|---|
| **Authentication** | Dual-Token JWT (HS256) | Short-lived Access Tokens (15m) + Secure Refresh Tokens |
| **Password Storage** | BcryptJS (10 Salt Rounds) | Irreversible salted hashing with brute-force resistance |
| **Authorization** | Strict RBAC Middleware | Route-level role enforcement via `authorizeRoles(...)` |
| **Public Verification** | Zero-Auth Token Resolver | Exposes only verified honor details without exposing PII |
| **SQL Injection** | Parameterized Prisma ORM | 100% prepared queries; zero dynamic raw string concatenation |
| **HTTP Security** | Helmet Middleware | Secure headers, DNS prefetch control, X-Frame-Options |
| **API Auditing** | Centralized AuditService | Immutable ledger capturing user ID, action, entity, and IP address |

---

## 8. Verification & Testing Methodology

### A. Unit & Integration Testing
* **Authentication Flow**: Verified register, login, access token expiry, and refresh rotation.
* **Role Guards**: Verified that unauthorized roles receive `403 Forbidden` and unauthenticated requests receive `401 Unauthorized`.
* **Schedule Conflict Engine**: Verified that overlapping matches at the same venue trigger `409 Conflict`.
* **Post-Match Standings**: Verified mathematical correctness of points calculations (`Win = 3, Draw = 1, Loss = 0`), goal differences, and form strings (`W-W-D-L-W`).

### B. Production Build Results
* **Frontend (`client/`)**: `npm run build` completed with **0 errors**. Rolled up into optimized code chunks (`vendor-react`, `vendor-ui`, `vendor-socket`, `index`).
* **Backend (`server/`)**: `npm run build` completed with **0 errors**. Transpiled TypeScript output to `dist/`.

---

## 9. Conclusion & Future Roadmap
**PCTE SPORTEX** fulfills all requirements for a final-year B.Tech CSE Capstone Project. It represents a fully functional, production-grade SaaS architecture ready for institutional deployment across universities. Future enhancements may include AI-based athletic performance prediction, automated live video highlight generation, and biometric attendance integration.
