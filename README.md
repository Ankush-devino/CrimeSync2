# 🛡️ CrimeSync (CRIMINALINK AI) — National Forensic Intelligence & Cyber Defense Platform

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB_Graph-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.2-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

**CrimeSync** (CRIMINALINK AI) is an enterprise-grade National Intelligence, Cyber Defense, and Forensic Investigation Platform engineered for Indian Law Enforcement Agencies, including the **National Crime Records Bureau (NCRB)**, State Cyber Cells, and the **Ministry of Home Affairs (MHA)**.

The system unifies relational case records (**PostgreSQL / Neon**), criminal syndicate relationship graphs (**Neo4j AuraDB**), Section 65B **Bharatiya Sakshya Adhiniyam (BSA 2023)** automated electronic evidence charge-sheets, cryptographic Merkle tree chain-of-custody logging, and autonomous multi-agent AI threat orchestration.

---

## 🧭 Architecture Highlights

- **Single Global Active Case Switcher**: Active investigations are controlled centrally via the top navigation bar (`Header.tsx` + `CaseContext`). All 16 analytical modules, widgets, and forensic vaults strictly and dynamically synchronize with the active case without fragmented per-page selectors.
- **Dual-Database Intelligence Engine**:
  - **Relational Ledger (PostgreSQL on Neon)**: Stores FIR registries, officer RBAC allotments, seized exhibits, case diary entries, and transaction records.
  - **Graph Engine (Neo4j AuraDB)**: Models multi-hop syndicate relationships, burner phone linkages, mule bank accounts, and degree centrality.
- **Statutory Legal Compliance**:
  - **Bharatiya Sakshya Adhiniyam (BSA 2023)** Section 65B electronic evidence certification.
  - **Information Technology Act 2000** (Sections 43, 66, 66F cyber-terrorism).
  - **Prevention of Money Laundering Act (PMLA 2002)** financial trail audit standards.

---

## 🔐 Officer Login Credentials & Access Control (RBAC)

The portal enforces **Role-Based Access Control (RBAC)**. Investigators have visibility and operational authority strictly over cases allotted to them in the central PostgreSQL registry. Supervisory officers (ACP, Superintendent) hold national supervisory scope.

| # | Officer Name | Government Email | Officer ID / Badge ID | Password | Role & Department | Authorized Allotted Cases | Clearance Level |
|:---:|---|---|---|---|---|---|:---:|
| 1 | **Inspector Priya Kulkarni** | `priya.kulkarni@mahapolice.gov.in` | `USR-102`<br>`MUM-CYB-4091` | `password123` | **Cyber Crime Analyst**<br>*Cyber Crime Investigation Cell, Mumbai* | **2 Cases Allotted:**<br>• `CASE-2026-002` (GridShield Power Grid Attack)<br>• `CASE-2026-005` (Operation Vajra Digital Arrest) | `LEVEL 3 (SECRET)` |
| 2 | **ACP Rajeshwar Sharma** | `rajesh.sharma@delhipolice.gov.in` | `USR-101`<br>`DEL-IPS-8821` | `password123` | **Lead Investigator / ACP**<br>*Special Cell / Cyber Crime Unit, Delhi* | **All Cases**<br>*(National Supervisory Scope)* | `LEVEL 5 (TOP SECRET)` |
| 3 | **DSP Arvind Swaminathan** | `arvind.s@ksp.gov.in` | `USR-103`<br>`BLR-INT-1102` | `password123` | **Forensic Expert**<br>*Forensic Science Laboratory (FSL), Bengaluru* | **2 Cases Allotted:**<br>• `CASE-2026-003` (Operation Garud SIM Farm)<br>• `CASE-2026-007` (National Critical Infra Threat) | `LEVEL 3 (SECRET)` |
| 4 | **SI Vikramaditya Reddy** | `vikram.reddy@tspolice.gov.in` | `USR-104`<br>`HYD-CID-7740` | `password123` | **Field & Cyber Ops Officer**<br>*CID Financial Fraud Division, Hyderabad* | **2 Cases Allotted:**<br>• `CASE-2026-006` (Hawala Layering Network)<br>• `CASE-2026-008` (Darknet Marketplace Breach) | `LEVEL 3 (SECRET)` |
| 5 | **Superintendent Ananya Sengupta** | `ananya.sengupta@cbi.gov.in` | `USR-105`<br>`CBI-HQ-0012` | `password123` | **Superintendent of Police (Admin)**<br>*Anti-Corruption & Economic Offences, CBI* | **All Cases**<br>*(National Admin Scope)* | `LEVEL 5 (TOP SECRET)` |

> **Login Authentication:** Officers can sign in with their **Government Email**, **Officer ID** (e.g., `USR-101`), or **Badge Number** (e.g., `DEL-IPS-8821`) using password `password123`.

---

## 🖥️ Operational Modules Breakdown

The platform is structured into distinct tactical suites accessible from the unified sidebar and command center:

### 1. Command Center (Live Overview)
- **Top Metrics**: Real-time KPI telemetry (Active FIRs, High-Risk Suspects, Seized Exhibits, Layered Funds, System Health).
- **Live Network Graph**: Centerpiece graph canvas showcasing active case nodes, edge relationships, and risk centrality.
- **AI Assistant Insights**: Live neural briefings summarizing modus operandi, syndicate hierarchy, and next investigative actions.
- **National Geo Map**: Leaflet GIS preview plotting active case hotspots, coordinates, and suspect coordinates.
- **Crime Timeline**: Chronological event ticker detailing financial, telecom, and forensic seizures.
- **Cyber Defense Summary**: Live decoy tripwires, canary token alarms, and infrastructure defense score.
- **Digital Fingerprint Integrity**: Cryptographic Merkle root validation for tamper-evident digital evidence.
- **Quick Actions Launcher**: Direct shortcuts to lodge FIRs, ingest evidence, trigger threat hunts, and export dossiers.

---

### 2. Investigate Suite
- **Cases** (`InvestigationsPage.tsx`):
  Full-width master case dossier workbench displaying statutory FIR information, 1-click case status toggle (`INVESTIGATING`, `UNDER_REVIEW`, `CLOSED`), seized evidence exhibit table, syndicate suspects, and case diary notes.
- **AI Assistant** (`AiCopilotPage.tsx`):
  Natural language law enforcement AI copilot that dynamically greets the officer upon case selection, answering complex queries on bank transactions, telecom CDRs, suspect networks, and legal precedents.
- **Network Graph** (`KnowledgeGraphPage.tsx`):
  Interactive entity-link graph (Neo4j connected) mapping suspects, mule accounts, burner devices, vehicles, and offshore shell companies with degree centrality calculations and manual entity creation.
- **Timeline** (`TimeMachinePage.tsx`):
  4D chronological event scrubber reconstructing crime progression with multi-speed simulation playback (1x, 2x, 4x), category filters (Financial, VoIP, GPS, Exhibits), and CSV exports.
- **Geo Map** (`GeoIntelligencePage.tsx`):
  National geospatial GIS mapping interface with city clustering (Delhi, Mumbai, Bengaluru, Kolkata, Hyderabad, etc.), suspect movement tracking vectors, CCTV node overlays, and custom GPS pin dropping.
- **Money Trail** (`FinancialIntelligencePage.tsx`):
  PMLA / FIU-synced financial intelligence tracker analyzing multi-hop Hawala layering, mule account rings, OTC crypto off-ramps, and 1-click bank account freezing under Section 102 CrPC.

---

### 3. Cyber Defense Suite
- **Identity Shield** (`IdentitySecurityPage.tsx`):
  Identity Doppelgänger detection engine identifying synthetic identities, forged Aadhaar/PAN credentials, biometric replay attacks, and compromised law enforcement sessions.
- **Attack Map** (`AttackGraphPage.tsx`):
  MITRE ATT&CK kill-chain graph mapping initial access, credential dumping, lateral movement, and data exfiltration paths across critical national infrastructure.
- **Honeypot** (`DeceptionNetworkPage.tsx`):
  Active deception network managing decoy honeypots (honey documents, ghost database tables, fake IAM keys, AWS canary tokens), tripwire alerts, and invisible zero-width steganographic document watermarking.
- **Impact Zone** (`BlastRadiusPage.tsx`):
  Radial Hop-0 Ground Zero blast radius simulation modeling cascading lateral intrusion across subnet perimeters with automated emergency containment playbooks.
- **AI Sandbox** (`AiAgentSandboxPage.tsx`):
  Multi-agent autonomous orchestrator deploying specialized bots (Financial Fraud Detective, Syndicate Link Discovery, Telecom Analyst) to inspect databases and generate investigative intelligence.
- **Live Alerts** (`ThreatAlertsPage.tsx`):
  Real-time SOC alert feed classifying threat severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), insider mole flags, and instant containment action modals.

---

### 4. Blockchain & Integrity Suite
- **Digital Fingerprint** (`EvidenceDnaPage.tsx`):
  Forensic biometric and biological evidence vault managing blood, saliva, hair, latent prints, facial landmarks, volatile RAM captures, and disk images secured with SHA-256 / BLAKE3 cryptographic hashes.
- **Custody Log** (`ChainOfCustodyPage.tsx`):
  Court-admissible tamper-proof chain of custody ledger recording evidence transfers, physical locker deposits, custodian sign-offs, and immutable block anchor hashes.

---

### 5. Reports & Records Suite
- **Reports** (`ReportsPage.tsx`):
  Court-ready Section 65B BSA 2023 legal charge-sheet dossier generator featuring an isolated iframe A4 print engine for flawless PDF exports with 10 comprehensive statutory sections.
- **Activity Log** (`AuditTrailPage.tsx`):
  Tamper-proof system activity log and officer audit trail recording authenticated access, search queries, status changes, and export actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti |
| **Mapping & GIS** | Leaflet, React Leaflet GIS |
| **Backend Runtime** | Node.js, Express 5.2, TypeScript |
| **Relational Database** | PostgreSQL 16 (Neon Cloud Serverless with connection pooling) |
| **Graph Database** | Neo4j AuraDB (Cypher query language) |
| **Security & Auth** | JSON Web Tokens (JWT, RFC 7519 HMAC-SHA256), Role-Based Access Control (RBAC) |
| **Document Export** | Hidden Isolated A4 Iframe Print Engine (`@page { size: A4 portrait; margin: 14mm 15mm; }`) |

---

## 📁 Repository Structure

```
CrimeSync/
├── .env                                # Root environment variables
├── package.json                        # Root scripts & frontend dependencies
├── index.html                          # Single-page application entry point
├── vite.config.ts                      # Vite build configuration
├── tailwind.config.js                  # Tailwind CSS theme configuration
├── src/
│   ├── App.tsx                         # Master routing & layout controller
│   ├── main.tsx                        # React application bootstrap
│   ├── components/                     # Reusable UI widgets, cards & modals
│   │   ├── Header.tsx                  # Top bar with Global Active Case Switcher
│   │   ├── Sidebar.tsx                 # Navigation bar (16 modules)
│   │   ├── CriminalNetworkGraph.tsx    # Live Network Graph widget
│   │   ├── AiInsight.tsx               # AI Assistant Insights widget
│   │   ├── ThreatHeatmap.tsx           # National Geo Map widget
│   │   ├── CrimeTimeMachine.tsx        # Crime Timeline widget
│   │   ├── EvidenceIntegrity.tsx       # Digital Fingerprint widget
│   │   ├── TopMetrics.tsx              # Executive KPI row
│   │   ├── PriorityAlerts.tsx          # Live Alerts feed widget
│   │   ├── QuickActions.tsx            # Fast action launchers
│   │   ├── Modals/                     # Threat hunt, new FIR, evidence ingestion modals
│   │   └── Reports/                    # 10-section forensic dossier preview component
│   ├── context/
│   │   ├── AuthContext.tsx             # RBAC authentication & clearance state
│   │   ├── CaseContext.tsx             # Global Active Case state & database synchronization
│   │   └── AuditLogContext.tsx         # Activity log state
│   ├── pages/                          # Primary view controllers (16 modules)
│   │   ├── CommandCenterPage.tsx       # Command Center (Live Overview)
│   │   ├── InvestigationsPage.tsx      # Cases (Full-width dossier workbench)
│   │   ├── AiCopilotPage.tsx           # AI Assistant
│   │   ├── KnowledgeGraphPage.tsx      # Network Graph
│   │   ├── TimeMachinePage.tsx         # Timeline
│   │   ├── GeoIntelligencePage.tsx     # Geo Map
│   │   ├── FinancialIntelligencePage.tsx # Money Trail
│   │   ├── IdentitySecurityPage.tsx    # Identity Shield
│   │   ├── AttackGraphPage.tsx         # Attack Map
│   │   ├── DeceptionNetworkPage.tsx    # Honeypot
│   │   ├── BlastRadiusPage.tsx         # Impact Zone
│   │   ├── AiAgentSandboxPage.tsx      # AI Sandbox
│   │   ├── ThreatAlertsPage.tsx        # Live Alerts
│   │   ├── EvidenceDnaPage.tsx         # Digital Fingerprint
│   │   ├── ChainOfCustodyPage.tsx      # Custody Log
│   │   ├── ReportsPage.tsx             # Reports
│   │   └── AuditTrailPage.tsx          # Activity Log
│   ├── services/                       # API client, database service & offline fallbacks
│   └── types/                          # TypeScript definitions for cases, nodes, and alerts
└── server/                             # Express REST API backend
    ├── package.json                    # Backend dependencies & scripts
    ├── tsconfig.json                   # Server TypeScript configuration
    └── src/
        ├── app.ts                      # Express app setup & CORS configuration
        ├── server.ts                   # HTTP server entry point (Port 5000)
        ├── routes/                     # Domain route aggregator
        └── modules/                    # Controllers & services for cases, auth, graph, etc.
```

---

## ⚡ Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Git

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Ankush-devino/Crimesync.git

# Enter workspace
cd Crimesync

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Environment Configuration

Ensure `.env` in the project root contains the appropriate database credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Database (Neon Cloud)
DATABASE_URL="postgresql://<user>:<password>@<endpoint>.neon.tech/neondb?sslmode=require"

# Neo4j Graph Database (AuraDB)
NEO4J_URI="neo4j+s://<db_id>.databases.neo4j.io"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="<password>"
NEO4J_DATABASE="neo4j"

# JWT Authentication
JWT_SECRET=crimesync_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Running Locally

You can launch both the frontend and backend simultaneously or independently:

#### Option A: Run Both Services Concurrently
```bash
npm run dev:all
```

#### Option B: Run Services in Separate Terminals
```bash
# Terminal 1: Backend API Gateway (Port 5000)
cd server
npm run build && npm run start

# Terminal 2: Frontend Vite Server (Port 5173)
npm run dev
```

- **Frontend Web Portal:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API Gateway:** [http://localhost:5000/api](http://localhost:5000/api)

### 4. Verifying Production Build

```bash
npm run build
```

---

## ⚖️ Legal Disclaimer & Compliance

This platform is developed strictly for authorized law enforcement and national defense personnel. Data processing, evidence handling, and cryptographic logs strictly adhere to:
- **Bharatiya Sakshya Adhiniyam, 2023 (BSA)** — Section 65B
- **Information Technology Act, 2000 (Amended 2008)**
- **Prevention of Money Laundering Act, 2002 (PMLA)**

Licensed under the MIT License.
