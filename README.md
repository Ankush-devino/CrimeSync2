# 🛡️ CrimeSync (CRIMINALINK AI) — National Forensic Intelligence & Cyber Defense Platform

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-v0.3-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi_Agent-FF6F61?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4_CUDA-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB_Graph-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Ethereum](https://img.shields.io/badge/Ethereum-EVM_Mainnet-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger-Fabric_v2.5-2F3134?style=flat-square&logo=hyperledger&logoColor=white)](https://www.hyperledger.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![HashiCorp Vault](https://img.shields.io/badge/HashiCorp_Vault-v1.17-000000?style=flat-square&logo=vault&logoColor=white)](https://www.vaultproject.io/)
[![AES-256-GCM](https://img.shields.io/badge/Encryption-AES--256--GCM-00C853?style=flat-square&logo=lock&logoColor=white)](https://csrc.nist.gov/)
[![Wazuh](https://img.shields.io/badge/Wazuh-SIEM_%26_XDR-0072C6?style=flat-square&logo=wazuh&logoColor=white)](https://wazuh.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x_Mobile-02569B?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.2-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

**CrimeSync** (CRIMINALINK AI) is an enterprise-grade National Intelligence, Cyber Defense, and Forensic Investigation Platform engineered for Indian Law Enforcement Agencies, including the **National Crime Records Bureau (NCRB)**, State Cyber Cells, and the **Ministry of Home Affairs (MHA)**.

The system unifies relational case records (**PostgreSQL / Neon**), criminal syndicate relationship graphs (**Neo4j AuraDB**), autonomous agentic AI swarms (**LangChain, LangGraph, CrewAI, AutoGen**), military-grade **AES-256-GCM** forensic vault encryption, centralized secrets leasing (**HashiCorp Vault**), enterprise SIEM/XDR telemetry (**Wazuh**), Section 65B **Bharatiya Sakshya Adhiniyam (BSA 2023)** automated electronic evidence charge-sheets, dual-layer cryptographic chain-of-custody ledgers (**Ethereum EVM, Hyperledger Fabric, Solidity Smart Contracts, zk-SNARKs**), and deep-packet cyber deception radar.

---

## 🧭 Architecture Highlights

- **Single Global Active Case Switcher**: Active investigations are controlled centrally via the top navigation bar (`Header.tsx` + `CaseContext`). All 16 analytical modules, widgets, and forensic vaults strictly and dynamically synchronize with the active case without fragmented per-page selectors.
- **Dual-Database Intelligence Engine**:
  - **Relational Ledger (PostgreSQL on Neon)**: Stores FIR registries, officer RBAC allotments, seized exhibits, case diary entries, and transaction records with `pgvector` semantic embeddings.
  - **Graph Engine (Neo4j AuraDB)**: Models multi-hop syndicate relationships, burner phone linkages, mule bank accounts, and degree centrality via Cypher queries and Graph Data Science (GDS).
- **Dual-Layer Blockchain Architecture (Hyperledger Fabric + Ethereum EVM)**:
  - **Hyperledger Fabric (Permissioned)**: Inter-state police consortium network for private evidence exchange and consensus between State Cyber Cells, CBI, and NCRB.
  - **Ethereum & Solidity (Public Verifiable)**: Tamper-proof public anchoring of SHA-256 / BLAKE3 exhibit Merkle roots and automated victim restitution escrow contracts.
- **Zero-Trust Security & Key Management**:
  - **HashiCorp Vault**: Manages dynamic database credentials, ephemeral API tokens, HSM root keys, and officer session certificates with automatic lease revocation.
  - **AES-256-GCM Envelope Encryption**: Protects all seized electronic evidence (hard drives, wiretap audio, mobile dumps) and biometric templates at rest.
  - **Wazuh SIEM / XDR**: Real-time host intrusion detection (HIDS), automated File Integrity Monitoring (FIM) across evidence lockers, and SOC audit telemetry.
- **Autonomous Agentic Swarm (LangGraph & MCP)**: Deploys stateful, cyclic AI agents for automated OSINT social graph infiltration, telecom IPDR correlation, darknet crawler triage, and real-time bank freeze order generation.
- **Statutory Legal Compliance**:
  - **Bharatiya Sakshya Adhiniyam (BSA 2023)** Section 65B electronic evidence certification.
  - **Bharatiya Nyaya Sanhita (BNS 2023)** & **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)** statutory FIR and seizure workflows.
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

## 🛠️ Complete Enterprise Technology Stack

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CRIMESYNC PLATFORM                                   │
├───────────────────────┬──────────────────────────┬─────────────────────────────────────┤
│  AI & Agentic Swarm   │  Graph & Forensic ML     │  Blockchain & Cryptographic Trust   │
│  • LangChain / Graph  │  • Neo4j AuraDB / Cypher │  • Solidity Contracts (BSA 2023)    │
│  • AutoGen & CrewAI   │  • PyTorch Geometric GNN │  • AES-256-GCM Envelope Encryption  │
│  • MCP Protocol       │  • ArcFace / Whisper v3  │  • HashiCorp Vault & zk-SNARKs      │
├───────────────────────┼──────────────────────────┴─────────────────────────────────────┤
│  Cyber Defense & SIEM │  • Wazuh SIEM / XDR • MITRE ATT&CK Matrix • Honeypot Deception │
├───────────────────────┴────────────────────────────────────────────────────────────────┤
│  Backend & Telemetry: Node.js 22 LTS, Express 5.2, PostgreSQL 16 (pgvector), Redis 7   │
│  Frontend Command UI: React 19, TypeScript 6, Vite 8, Tailwind CSS, Leaflet GIS, Framer│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🤖 Agentic AI, LLM & Multi-Agent Swarms
| Technology | Version / Module | Operational Purpose & Integration |
|---|---|---|
| **LangChain** | `v0.3.x` | Core framework for LCEL prompt pipelines, dynamic document loaders, RAG retrievers, and tool abstraction interfaces. |
| **LangGraph** | `v0.2.x` | Stateful, cyclic multi-agent graph orchestrating autonomous forensic case resolution, human-in-the-loop sign-offs, and checkpoint memory. |
| **Microsoft AutoGen** | `v0.4.x` | Multi-agent conversational reasoning architecture simulating collaborative investigation teams (Lead Detective, Cyber Forensics, Legal Counsel). |
| **CrewAI** | `v0.80.x` | Role-based autonomous agents deployed for darkweb syndicate infiltration, OSINT reconnaissance, and courtroom cross-examination prep. |
| **Model Context Protocol (MCP)** | Anthropic Standard | Standardized protocol enabling autonomous AI agents to dynamically query the live PostgreSQL registry, Neo4j graph, and file vaults securely. |
| **Multimodal RAG & Guardrails** | Hybrid Dense/Sparse | BGE-M3 + ColBERT reranking with Cypher-RAG integration for querying FIR dossiers and NeMo Guardrails to prevent hallucinations in statutory documents. |
| **Fine-Tuned Legal LLMs** | DeepSeek-R1 / Llama-3.3 | LoRA / QLoRA fine-tuned on **Bharatiya Nyaya Sanhita (BNS)**, **BNSS**, **BSA 2023**, and landmark Supreme Court of India precedents. |
| **OpenAI Whisper v3** | `large-v3` | Automatic Speech Recognition (ASR) engine for regional law enforcement wiretaps (Hindi, Marathi, Bengali, Telugu, Punjabi). |

---

### 2. 🧠 Machine Learning & Deep Forensic Analytics
| Framework | Focus Area | Implementation Details |
|---|---|---|
| **PyTorch & PyTorch Geometric (PyG)** | Graph Neural Networks (GNN) | Heterogeneous GNN models detecting multi-hop Hawala money laundering, mule account rings, and crypto mixer de-anonymization. |
| **InsightFace & ArcFace** | Biometric Facial Embeddings | 512-dimensional facial recognition vectors matched against national criminal mugshot repositories with cosine distance scoring. |
| **Vision Transformers (ViT)** | Document Tampering Detection | Pixel-level error level analysis (ELA) and transformer attention maps detecting forged government seals, signatures, and modified Aadhaar cards. |
| **Scikit-Learn & HDBSCAN** | Geospatial Clustering | Spatial-temporal clustering of telecom CDR tower dumps, identifying suspect convergence coordinates and handover speed anomalies. |
| **Volatility 3 & Scapy** | Memory & Network Forensics | Deep packet inspection for JA4 TLS fingerprinting, C2 beaconing entropy calculations, and automated Volatility RAM dump extraction. |

---

### 3. 🕸️ Graph Intelligence & Database Layer
| Engine | Deployment | Role in CrimeSync |
|---|---|---|
| **Neo4j 5.x & Neo4j AuraDB** | Cloud Enterprise Graph | High-performance graph database storing entity nodes (Suspects, Mules, Burners, Bank Accounts, Shell Orgs) and executing Cypher path traversals. |
| **Graph Data Science (GDS)** | In-Memory Graph Algorithms | Louvain community detection, Betweenness & Degree Centrality, and Link Prediction algorithms identifying syndicate kingpins. |
| **PostgreSQL 16 (Neon Cloud)** | Serverless Relational DB | Primary ACID-compliant ledger for FIRs, evidence lockers, officer RBAC allotments, case diary notes, and `pgvector` similarity search. |
| **Redis 7** | In-Memory Cache & Pub/Sub | Sub-millisecond session caching, live active officer presence, real-time threat feed broadcasting, and rate-limiting queues. |

---

### 4. ⛓️ Blockchain, Smart Contracts & Cryptographic Integrity
| Component | Protocol / Standard | Tactical Purpose |
|---|---|---|
| **Solidity Smart Contracts** | `v0.8.24` (EVM Compatible) | Court-admissible smart contracts deployed for Section 65B BSA electronic evidence custody (`EvidenceCustodyLedger.sol`), automated Section 102 CrPC bank account freezes (`AssetFreezingRegistry.sol`), inter-state police consensus voting (`InterStatePoliceConsensus.sol`), and victim restitution escrows (`VictimRestitutionEscrow.sol`). |
| **Ethereum (EVM)** | Public Decentralized Ledger | Public blockchain anchoring layer providing decentralized consensus, immutable Merkle root block timestamps, and transparent verification of Section 65B cryptographic certificates for court presentation. |
| **Hyperledger Fabric** | `v2.5` Enterprise Permissioned | Inter-state police consortium distributed ledger network enabling private data collections (PDC) and channel-based access control for highly sensitive FIR exhibits shared between State Cyber Cells, CBI, and MHA nodes. |
| **HashiCorp Vault** | `v1.17` Enterprise | Centralized secrets management, dynamic database credential leasing, PKI certificate authority for officers, and automated key lifecycle rotation. |
| **AES-256-GCM Encryption** | NIST SP 800-38D | Military-grade authenticated envelope encryption protecting digital evidence exhibits, seized disk images, and biometric DNA vaults at rest. |
| **Zero-Knowledge Proofs** | zk-SNARKs (`circom` & `snarkjs`) | Privacy-preserving inter-state identity verification allowing police units to prove suspect watchlist matches without revealing undercover sources. |
| **IPFS Cluster & Merkle Trees** | Decentralized Content Storage | Content-addressed cryptographic pinning of seized hard drives, CCTV footage, and call recordings with Merkle audit tree proofs. |
| **Hardware Security Module (HSM)** | PKCS#11 Standards | Cryptographic digital signature generator guaranteeing non-repudiation of Section 65B certificates by authorized forensic custodians. |

---

### 5. 🛡️ Cyber Defense, SIEM / XDR & Incident Response
| Technology | Architecture | Operational Capability |
|---|---|---|
| **Wazuh SIEM / XDR** | `v4.8` Distributed Cluster | Real-time security information and event management, Host-based Intrusion Detection (HIDS), File Integrity Monitoring (FIM) for evidence folders, and automated compliance tracking. |
| **MITRE ATT&CK Matrix** | `v15` Enterprise Framework | Dynamic kill-chain mapping correlating observed indicators of compromise (IoCs) to tactical adversary techniques. |
| **Sigma Rule Engine** | Standardized SIEM Signatures | Automated generation and cross-compilation of threat detection rules for Splunk, Elastic, and Sentinel SIEM deployments. |
| **Deception & Canary Grid** | Multi-Layer Honeypots | Decoy honey documents, ghost database tables, fake AWS IAM credentials, and invisible zero-width steganographic document tripwires. |
| **Telecom CDR / IPDR Engine** | Telecom Analytics | Automated correlation of Call Detail Records, IMEI-IMSI swapping alerts, SIM-farm detection, and spoofed VoIP caller ID discovery. |

---

### 6. 💻 Frontend Web & Command Center UI
| Technology | Version | Key Contributions |
|---|---|---|
| **React** | `19.2.8` | Component-driven reactive user interface with state management via Context API (`CaseContext`, `AuthContext`, `AuditLogContext`). |
| **TypeScript** | `6.0.2` | Strict end-to-end type safety across 16 analytical modules, data models, and API interfaces. |
| **Vite** | `8.2.2` | Ultra-fast build pipeline with optimized Hot Module Replacement (HMR) and tree-shaken production bundles. |
| **Tailwind CSS** | `3.4.17` | Bespoke cyber-tactical design system featuring glassmorphism, responsive grid layouts, and custom theme tokens. |
| **Framer Motion** | `13.2.0` | Fluid tactical micro-animations, collapsible sidebars, glowing alert badges, and telemetry transitions. |
| **Leaflet & React-Leaflet** | `1.9.4` | Interactive national GIS geospatial mapping, dynamic suspect movement vectors, CCTV overlays, and custom GPS coordinates. |
| **Canvas-Confetti** | `1.9.4` | Visual celebration triggers for successful case resolution and suspect apprehension milestones. |
| **Lucide Icons** | `1.35.0` | Unified tactical SVG iconography across navigation, analytical tools, and alert feeds. |

---

### 7. 🚀 Backend API & Microservices Runtime
| Technology | Component | Functional Scope |
|---|---|---|
| **Node.js** | `22.x LTS` | Asynchronous event-driven JavaScript/TypeScript runtime for high-concurrency API handling. |
| **Express** | `5.2.1` | REST API gateway routing domain endpoints (`/api/cases`, `/api/auth`, `/api/graph`, `/api/evidence`, `/api/reports`). |
| **Python Services** | `Python 3.11` | Dedicated microservices executing AI agent notebooks, GNN training, audio transcription, and biometric inference. |
| **Security & JWT** | RFC 7519 HMAC-SHA256 | Secure session tokens with role-based access control (RBAC), clearance level enforcement, and request sanitization. |
| **Isolated Print Engine** | Headless Hidden Iframe | Specialized A4-formatted PDF generation engine ensuring pixel-perfect Section 65B BSA legal charge-sheet printouts. |

---

### 8. 📱 Mobile Field App & DevOps Infrastructure
| Layer | Technologies | Description |
|---|---|---|
| **Mobile Field App** | Flutter 3.x, Dart | Cross-platform ground officer app for offline exhibit seizure, GPS geo-tagging, biometric capture, and live field telemetry sync. |
| **Containerization** | Docker, Docker Compose | Multi-stage Docker builds orchestrating frontend web, backend API gateway, PostgreSQL, Neo4j, and Python agent workers. |
| **Reverse Proxy & TLS** | Nginx, Let's Encrypt | Reverse proxying, TLS 1.3 encryption, rate limiting, and HTTP/2 performance optimization. |
| **Code Quality & Linter** | Oxlint, ESLint | Rust-powered ultra-fast static analysis ensuring strict code quality and security standards. |

---

## 📁 Repository Structure

```
CrimeSync/
├── .env                                # Environment variable configuration
├── package.json                        # Root scripts & frontend dependencies
├── index.html                          # Single-page application entry point
├── vite.config.ts                      # Vite build & proxy configuration
├── tailwind.config.js                  # Cyber-tactical Tailwind CSS theme
├── ai_agent_notebooks/                 # Autonomous Multi-Agent AI Swarms
│   ├── 01_autogen_multi_agent_investigation_team.ipynb
│   ├── 02_langgraph_autonomous_case_resolution_graph.ipynb
│   ├── 03_crewai_darkweb_syndicate_infiltrator_agent.ipynb
│   ├── 04_mcp_autonomous_database_interrogator_agent.ipynb
│   ├── 05_autonomous_osint_social_graph_agent.ipynb
│   ├── 06_financial_restitution_negotiator_agent.ipynb
│   ├── 07_autonomous_honeynet_deception_agent.ipynb
│   ├── 08_interpol_red_notice_generator_agent.ipynb
│   ├── 09_mule_account_rapid_freeze_bot_agent.ipynb
│   ├── 10_multi_jurisdiction_extradition_legal_agent.ipynb
│   ├── 11_audio_deepfake_disinformation_takedown_agent.ipynb
│   └── 12_forensic_evidence_court_cross_examiner_agent.ipynb
├── gen_ai_notebooks/                   # Generative AI, RAG & Legal LLM Models
│   ├── 01_multimodal_rag_fir_dossier_synthesizer.ipynb
│   ├── 02_legal_llm_fine_tuning_lora_bnss_ipc.ipynb
│   ├── 03_cross_lingual_transcription_whisper_hindi_marathi.ipynb
│   ├── 04_synthetic_evidence_diffusion_reconstruction.ipynb
│   ├── 05_knowledge_graph_rag_cypher_agent.ipynb
│   ├── 06_deepseek_forensic_code_deobfuscator.ipynb
│   ├── 07_vision_transformer_document_tampering_detector.ipynb
│   └── 08_llm_hallucination_guardrails_rag_eval.ipynb
├── notebooks/                          # Forensic ML & Graph Neural Network Models
│   ├── 01_ml_criminal_network_link_prediction.ipynb
│   ├── 02_genai_autonomous_investigator_agent.ipynb
│   ├── 03_financial_forensics_layering_gnn.ipynb
│   ├── 04_multimodal_audio_voice_cloning_forensics.ipynb
│   ├── 05_nlp_cyber_fraud_transcript_extractor.ipynb
│   ├── 06_geo_spatial_tower_dump_clustering.ipynb
│   ├── 07_crypto_mixer_transaction_demixing_gnn.ipynb
│   ├── 08_cctv_facial_recognition_arcface_embeddings.ipynb
│   └── 09_telecom_cdr_tower_handover_speed_anomaly.ipynb
├── blockchain/                         # Smart Contracts & Cryptographic Chain of Custody
│   ├── EvidenceCustodyLedger.sol       # Immutable exhibit custody smart contract
│   ├── AssetFreezingRegistry.sol       # PMLA bank account freeze registry
│   ├── InterStatePoliceConsensus.sol   # Multi-jurisdiction cross-state ledger
│   ├── VictimRestitutionEscrow.sol     # Automated fraud restitution escrow
│   ├── custody_merkle_verifier.py      # Merkle tree audit root validator
│   ├── zk_snark_range_proof.py         # Zero-knowledge range verifier
│   ├── zero_knowledge_identity_verifier.py # ZK identity verification
│   ├── hyperledger_fabric_adapter.py   # Permissioned enterprise bridge
│   ├── solana_evidence_anchor.py       # High-throughput Solana anchor
│   └── ipfs_evidence_pinning_cluster.py# IPFS decentralized file pinning
├── cybersecurity/                      # SOC Telemetry, Deception & Cyber Defense
│   ├── honeypot_telemetry_engine.py    # Deception grid & tripwire telemetry
│   ├── mitre_attack_mapper.py          # Dynamic MITRE kill-chain mapper
│   ├── sigma_rule_generator.py         # Automated SIEM rule synthesis
│   ├── tls_ja4_fingerprint_engine.py   # Client TLS JA4 fingerprinting
│   ├── packet_entropy_c2_detector.py   # C2 beaconing & exfiltration detection
│   ├── sim_swap_telecom_cdr_monitor.py # SIM-swap & tower dump analyzer
│   ├── steganography_payload_extractor.py # Document watermarking & payload extractor
│   ├── memory_dump_volatility_plugin.py# Volatility RAM dump analyzer
│   └── voip_caller_id_spoofer_detector.py # VoIP call spoofing detection
├── flutter_app/                        # Ground Officer Mobile Field Application
├── docker-compose.yml                  # Multi-container orchestration
├── src/                                # Frontend Single Page Application (React 19)
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

## ⚡ Complete Setup & Execution Guide

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM EXECUTION PIPELINE                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. 🔑 Security Layer: HashiCorp Vault (AppRole) + AES-256-GCM Envelope Encryption      │
│ 2. 🗄️ Dual-Data Layer: PostgreSQL 16 (Neon Cloud) + Neo4j AuraDB (Cypher GDS)          │
│ 3. ⛓️ Blockchain Layer: Solidity EVM Contracts + Hyperledger Fabric Consortium Bridge   │
│ 4. 🤖 AI Agent Engine: LangGraph Swarms + Python Microservices (Whisper, GNNs)         │
│ 5. 🛡️ SOC Telemetry: Wazuh SIEM / XDR Agent + Deception Honeynet Engine                │
│ 6. 💻 Command Center: React 19 / Vite 8 Web Interface + Express 5.2 API Gateway        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 📋 Prerequisites & System Requirements
- **Node.js**: `v20.x` or `v22.x LTS`
- **Python**: `v3.10` or `v3.11` (for AI agents, GNN models & cyber forensic scripts)
- **Git**: `v2.40+`
- **Docker & Docker Compose**: `v24.0+` *(optional for 1-click containerized deployment)*
- **Hardhat / Foundry**: *(optional for compiling Solidity smart contracts)*
- **Wazuh Agent & HashiCorp Vault CLI**: *(optional for local enterprise security testing)*

---

### 1. 📥 Clone Repository & Install Dependencies

```bash
# 1. Clone the master repository
git clone https://github.com/Ankush-devino/CrimeSync2.git
cd CrimeSync2

# 2. Install Frontend dependencies (React 19, Vite, Tailwind CSS, Leaflet)
npm install

# 3. Install Backend API dependencies (Express 5.2, Neo4j Driver, PG Pool)
cd server && npm install && cd ..

# 4. (Optional) Install Python AI / ML & Blockchain Dependencies
pip install -r cybersecurity/requirements.txt \
            torch torchvision torchaudio torch-geometric \
            langchain langgraph langchain-community \
            web3 eth-account hvac
```

---

### 2. 🔐 Environment Configuration (`.env`)

Create or update the `.env` configuration file in the project root:

```env
# ==============================================================================
# 🌐 CORE NETWORK & API GATEWAY
# ==============================================================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ==============================================================================
# 🗄️ DUAL-DATABASE INTELLIGENCE TIER
# ==============================================================================
# PostgreSQL (Neon Cloud / Local Instance)
DATABASE_URL="postgresql://<user>:<password>@<endpoint>.neon.tech/neondb?sslmode=require"
PGVECTOR_DIMENSION=1536

# Neo4j Enterprise Graph Database (AuraDB / Local Bolt)
NEO4J_URI="neo4j+s://<db_id>.databases.neo4j.io"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="<neo4j_password>"
NEO4J_DATABASE="neo4j"

# ==============================================================================
# 🔒 ZERO-TRUST SECURITY & KEY MANAGEMENT
# ==============================================================================
# HashiCorp Vault
VAULT_ADDR="http://127.0.0.1:8200"
VAULT_ROLE_ID="crimesync-forensic-engine"
VAULT_SECRET_ID="<vault_secret_token>"
VAULT_SECRETS_PATH="secret/data/crimesync/production"

# AES-256-GCM Envelope Encryption
AES_256_MASTER_KEY="<64_hex_char_256_bit_cryptographic_master_key>"
EVIDENCE_VAULT_ENCRYPTION=AES-256-GCM

# Officer JWT Authentication
JWT_SECRET=crimesync_jwt_secret_key_2026_mha_ncrb_secure
JWT_EXPIRES_IN=7d

# ==============================================================================
# 🛡️ WAZUH SIEM / XDR & CYBER TELEMETRY
# ==============================================================================
WAZUH_MANAGER_IP="127.0.0.1"
WAZUH_AGENT_PORT=1514
WAZUH_FIM_WATCH_DIRECTORIES="/var/evidence_vault,/var/log/crimesync"
DECEPTION_GRID_HONEYPOT_ENABLED=true

# ==============================================================================
# ⛓️ BLOCKCHAIN & CHAIN OF CUSTODY (BSA 2023)
# ==============================================================================
# Ethereum / EVM Network
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/<api_key>"
ETH_CUSTODY_CONTRACT_ADDRESS="0x71C...4e8"
ETH_ASSET_FREEZE_CONTRACT="0x34A...9b2"
ETH_CONSENSUS_CONTRACT="0x18F...7c1"
POLICE_SIGNER_PRIVATE_KEY="<hsm_or_enclave_backed_private_key>"

# Hyperledger Fabric Consortium Bridge
FABRIC_MSP_ID="NCRBPoliceMSP"
FABRIC_CHANNEL_NAME="interstate-evidence-channel"
FABRIC_CHAINCODE_NAME="evidence_custody_cc"
FABRIC_PEER_ENDPOINT="grpc://localhost:7051"

# IPFS Evidence Storage Cluster
IPFS_NODE_ENDPOINT="http://127.0.0.1:5001"

# ==============================================================================
# 🤖 AGENTIC AI & MULTI-AGENT SWARMS (LANGCHAIN / LANGGRAPH)
# ==============================================================================
OPENAI_API_KEY="<sk-...>"
ANTHROPIC_API_KEY="<sk-ant-...>"
DEEPSEEK_API_KEY="<sk-...>"
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
LANGCHAIN_API_KEY="<langsmith_key>"
LANGCHAIN_PROJECT="CrimeSync-Forensic-Investigation-Swarm"
```

---

### 3. 🚀 Database Seeding & Tactical Intelligence Ingestion

Initialize case registries, graph nodes, and forensic exhibits:

```bash
# Seed Operation Garud (SIM Farm & VoIP Fraud Syndicate)
npm run seed:garud

# Seed Operation Task Trap (Telegram Part-Time Task Scams)
npm run seed:tasktrap

# Seed Operation Parcel Trap (Digital Arrest & Custom Courier Extortion)
npm run seed:parceltrap
```

---

### 4. ⚙️ Running the Platform

#### Option A: ⚡ High-Speed Local Development (Recommended)

Run the full-stack system concurrently:

```bash
npm run dev:all
```

Or launch services in dedicated terminals:

```bash
# Terminal 1: Backend API Gateway & WebSocket Telemetry (Port 5000)
cd server
npm run build && npm run start

# Terminal 2: Frontend Command Center Web Portal (Port 5173)
npm run dev

# Terminal 3 (Optional): Launch LangGraph Multi-Agent Swarm
python ai_agent_notebooks/02_langgraph_autonomous_case_resolution_graph.py

# Terminal 4 (Optional): Start Honeypot & Wazuh FIM Deception Radar
python cybersecurity/honeypot_telemetry_engine.py
```

- **Frontend Command Center UI:** [http://localhost:5173/](http://localhost:5173/)
- **Backend REST API Gateway:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check & Diagnostics:** [http://localhost:5000/health](http://localhost:5000/health)

---

#### Option B: 🐳 1-Click Containerized Deployment (Docker Compose)

Spin up the entire CrimeSync architecture (Frontend, Backend, PostgreSQL, Neo4j, HashiCorp Vault, Redis, and Wazuh agent):

```bash
# Build and launch all containerized microservices
docker compose -f docker-compose.yml up --build -d

# View live container logs
docker compose logs -f
```

---

### 5. 🔍 Security, Forensic & Blockchain Verification Commands

```bash
# Verify AES-256-GCM exhibit hashes and Merkle Tree root integrity
python blockchain/custody_merkle_verifier.py --verify-all

# Execute zk-SNARK zero-knowledge identity match verification
python blockchain/zero_knowledge_identity_verifier.py --test-identity

# Validate Wazuh File Integrity Monitoring (FIM) & TLS JA4 signatures
python cybersecurity/tls_ja4_fingerprint_engine.py --audit

# Validate smart contract compilation & Section 65B gas benchmarks
npx hardhat test
```

---

### 6. 📦 Production Build Verification

```bash
# Validate TypeScript schemas and compile optimized production bundle
npm run build
```

---

## ⚖️ Statutory Legal Disclaimer & Compliance

This platform is strictly restricted to authorized Indian Law Enforcement Agencies, Defense Establishments, and Statutory Forensic Laboratories. All electronic evidence processing, hashing, chain-of-custody logging, and automated Section 65B certificates strictly comply with:

- **Bharatiya Sakshya Adhiniyam, 2023 (BSA)** — Section 65B Electronic Record Admissibility
- **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)** — Search, Seizure & Digital FIR Protocols
- **Information Technology Act, 2000 (Amended 2008)** — Cyber Crime, Interception & 66F Cyber-Terrorism
- **Prevention of Money Laundering Act, 2002 (PMLA)** — Financial Intelligence Unit (FIU) Hawala Layering Standards

Licensed under the MIT License.
