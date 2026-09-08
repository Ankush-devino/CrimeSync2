# 🛡️ CrimeSync / CRIMINALINK AI — National Forensic Intelligence & Cyber Defense Platform

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB_Graph-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**CRIMINALINK AI (CrimeSync)** is an enterprise-grade National Intelligence & Cyber Threat Response Platform engineered for the **National Crime Records Bureau (NCRB)** and the **Ministry of Home Affairs (MHA)**. It unifies multi-source law enforcement databases (PostgreSQL & Neo4j Graph), automated Section 65B BSA 2023 forensic dossier generation, cryptographic Merkle root blockchain integrity sealing, and autonomous AI reasoning.

---

## 🔐 Officer Login Credentials & Access Control (RBAC)

The portal enforces strict **Role-Based Access Control (RBAC)**. Officers only have visibility and operational authority over cases allotted to them in the central PostgreSQL registry.

### 🛡️ Pre-Registered Officer Credentials

| # | Officer Name | Government Email | Officer ID / Badge ID | Password | Role & Department | Authorized Allotted Cases | Clearance Level |
|:---:|---|---|---|---|---|---|:---:|
| 1 | **Inspector Priya Kulkarni** | `priya.kulkarni@mahapolice.gov.in` | `USR-102`<br>`MUM-CYB-4091` | `password123` | **Cyber Crime Analyst**<br>*Cyber Crime Investigation Cell, Mumbai* | **2 Cases Allotted:**<br>• `CASE-2026-002` (GridShield Power Grid Attack)<br>• `CASE-2026-005` (Operation Vajra Digital Arrest) | `LEVEL 3 (SECRET)` |
| 2 | **ACP Rajeshwar Sharma** | `rajesh.sharma@delhipolice.gov.in` | `USR-101`<br>`DEL-IPS-8821` | `password123` | **Lead Investigator / ACP**<br>*Special Cell / Cyber Crime Unit, Delhi* | **All Cases**<br>*(National Supervisory Scope)* | `LEVEL 5 (TOP SECRET)` |
| 3 | **DSP Arvind Swaminathan** | `arvind.s@ksp.gov.in` | `USR-103`<br>`BLR-INT-1102` | `password123` | **Forensic Expert**<br>*Forensic Science Laboratory (FSL), Bengaluru* | **2 Cases Allotted:**<br>• `CASE-2026-003` (Operation Garud SIM Farm)<br>• `CASE-2026-007` (National Critical Infra Threat) | `LEVEL 3 (SECRET)` |
| 4 | **SI Vikramaditya Reddy** | `vikram.reddy@tspolice.gov.in` | `USR-104`<br>`HYD-CID-7740` | `password123` | **Field & Cyber Ops Officer**<br>*CID Financial Fraud Division, Hyderabad* | **2 Cases Allotted:**<br>• `CASE-2026-006` (Hawala Layering Network)<br>• `CASE-2026-008` (Darknet Marketplace Breach) | `LEVEL 3 (SECRET)` |
| 5 | **Superintendent Ananya Sengupta** | `ananya.sengupta@cbi.gov.in` | `USR-105`<br>`CBI-HQ-0012` | `password123` | **Superintendent of Police (Admin)**<br>*Anti-Corruption & Economic Offences, CBI* | **All Cases**<br>*(National Admin Scope)* | `LEVEL 5 (TOP SECRET)` |

> **Login Tip:** You can sign in using either the **Government Email**, the **Officer ID** (e.g. `USR-102`), or the **Badge Number** (e.g. `MUM-CYB-4091`) along with `password123`.

---

## 🚀 Key System Capabilities

### 1. 📄 Reports & Dossiers (Court-Ready Charge-Sheets)
- **Section 65B Bharatiya Sakshya Adhiniyam (BSA 2023) Compliance:** Automated generation of tamper-proof, court-admissible electronic evidence dossiers.
- **Complete 10-Section Legal Dossier:**
  1. Executive Intelligence Summary & Modus Operandi
  2. Statutory Case Information & Court Jurisdiction
  3. Persons Involved (Accused Suspects & Complainants Table)
  4. Criminal Syndicate Knowledge Graph & Centrality
  5. Forensic Chronological Timeline Reconstruction
  6. Financial Intelligence & Hawala Multi-Hop Layering
  7. Digital Evidence Manifest & Cryptographic SHA-256 Hashes
  8. Immutable Chain of Custody & Transfer Logs
  9. Applicable Statutory Penal Laws (BNS 2023, IT Act 2000, PMLA 2002)
  10. AI Explainable Forensic Findings & Prosecution Strategy
- **Isolated Iframe A4 Print Engine:** 100% full-document PDF export without screen clipping or missing sections.
- **On-Chain Merkle Sealing:** Real-time AI collation pipeline that hashes evidence artifacts and commits Merkle roots to the immutable ledger.

### 2. 🎛️ Command Center & Real-Time Case Scoping
- Header switcher dynamically scopes active investigations to the logged-in officer's authorized cases.
- Live Geo-Intelligence GIS mapping with suspect proximity radii and CCTV feed integration.
- Instant suspect dossier modal with behavioral flags, biometric indicators, and evidence manifest.

### 3. 🧠 Knowledge Graph & Neural Entity Traversal
- Neo4j graph visualization mapping suspects, mule bank accounts, burner IMEI nodes, and offshore shell companies.
- Eigenvector and degree centrality algorithms to identify mastermind syndicate hubs.

### 4. 🪤 Deception Network (Active Cyber Defense)
- Live radar sweep monitoring decoy breadcrumbs, fake database tables, and AWS canary tokens.
- Real-time tripwire incident stream with MITRE ATT&CK technique attribution.
- Cryptographic Steganography & Watermarking Lab embedding zero-width Unicode seals into sensitive FIR documents.

### 5. 💥 Threat Blast Radius Simulator
- Radial shockwave graph visualizing Hop-0 Ground Zero breach propagation across network layers.
- Automated Disaster Recovery Playbook with instant host isolation and firewall lockdown.

### 6. 🤖 AI Agent Sandbox & Red-Team Simulation
- Secure gVisor microVM runtime for containerized autonomous AI agents (`DeepSeek-R1`, `Gemini-1.5-Pro`, `Llama-3.3-CyberRed`).
- eBPF kernel syscall monitor intercepting unauthorized socket egress attempts (`sys_connect`, `sys_ptrace`).

### 7. ⏱️ 4D Crime Time Machine
- Chronological forensic event slider reconstructing case timelines minute-by-minute with synchronized CCTV logs and CDR tower handoffs.

---

## 🛠️ Architecture & Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Portal (`document.body`)
- **Backend API**: Node.js, Express, TypeScript, JWT (RFC 7519 HMAC-SHA256)
- **Relational Storage**: PostgreSQL (Neon Cloud) with Connection Pooling
- **Graph Database**: Neo4j AuraDB (Cypher Query Engine)
- **Printing Engine**: Isolated Hidden Iframe with `@page { size: A4 portrait; margin: 14mm 15mm; }`
- **Security Protocols**: Role-Based Access Control (RBAC), NIC Secure Gateway TLS 1.3, Section 65B BSA 2023 Certification

---

## ⚡ Quick Start / Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ankush-devino/Crimesync.git

# 2. Navigate to project directory
cd Crimesync

# 3. Install frontend and backend dependencies
npm install
cd server && npm install && cd ..
```

### Running the Application

```bash
# Start both Frontend (Vite) and Backend (Express) concurrently
npm run dev:all
```

- **Frontend Application:** `http://localhost:5173/`
- **Backend API Gateway:** `http://localhost:5000/api`

### Production Build

```bash
npm run build
```

---

## 📄 Compliance & License
This project complies with the **Bharatiya Sakshya Adhiniyam (BSA 2023)** and **Information Technology Act 2000** for digital electronic evidence handling.
Licensed under the MIT License.
