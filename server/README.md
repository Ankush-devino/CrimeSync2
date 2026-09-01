# CrimeSync Backend Architecture & Team Allocation

This backend is designed as a modular TypeScript API. The codebase is partitioned into 5 independent domain modules so that **5 developers can work in parallel without merge conflicts**.

---

## 👥 5-Member Branch Allocation

| Dev | Branch Name | Domain Responsibilities | Primary Directory |
|---|---|---|---|
| **Member 1** | `feat/backend-auth-cases` | Authentication, JWT/MFA, Users, Case Management, Realtime Notifications | `server/src/modules/auth`, `cases`, `notifications` |
| **Member 2** | `feat/backend-evidence-blockchain` | Evidence Vault, SHA-256 Hashing, DNA forensics, Chain of Custody, Blockchain Ledger | `server/src/modules/evidence`, `custody`, `blockchain` |
| **Member 3** | `feat/backend-threat-deception` | SIEM Threat Alerts, Attack Graph analysis, Deception Honeypots, Blast Radius Engine | `server/src/modules/threats`, `attack-graph`, `deception`, `blast-radius` |
| **Member 4** | `feat/backend-geo-financial-identity` | Geo-Spatial Crime Mapping, Financial AML Money Flow, Identity & Biometrics Security | `server/src/modules/geo-intel`, `financial-intel`, `identity` |
| **Member 5** | `feat/backend-ai-graph-reports` | AI Copilot (LLM), AI Agent Sandbox, Knowledge Graph DB, Court Reports, Audit Trail & Time Machine | `server/src/modules/ai-engine`, `knowledge-graph`, `reports`, `audit-trail` |

---

## 🛠️ Directory Structure

```
server/
├── .env.example
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts                         # Express application setup
    ├── server.ts                      # Server bootstrap & WebSocket listener
    ├── config/
    │   ├── db.ts                      # Database connection
    │   └── env.ts                     # Validated environment configs
    ├── middleware/
    │   ├── auth.middleware.ts         # JWT & RBAC guards
    │   ├── error.middleware.ts        # Central error handler
    │   └── validate.middleware.ts     # Schema validation (Zod/Joi)
    ├── utils/
    │   ├── api-response.ts            # Standardized API envelope
    │   └── logger.ts                  # Structured logging
    ├── routes/
    │   └── index.ts                   # Master route aggregator
    └── modules/
        ├── auth/                      # [Member 1]
        ├── cases/                     # [Member 1]
        ├── notifications/             # [Member 1]
        ├── evidence/                  # [Member 2]
        ├── custody/                   # [Member 2]
        ├── blockchain/                # [Member 2]
        ├── threats/                   # [Member 3]
        ├── attack-graph/              # [Member 3]
        ├── deception/                 # [Member 3]
        ├── blast-radius/              # [Member 3]
        ├── geo-intel/                 # [Member 4]
        ├── financial-intel/           # [Member 4]
        ├── identity/                  # [Member 4]
        ├── ai-engine/                 # [Member 5]
        ├── knowledge-graph/           # [Member 5]
        ├── reports/                   # [Member 5]
        └── audit-trail/               # [Member 5]
```
