# Identity Doppelgänger — Adaptive Account Protection & Containment System
**Module:** Behavioral Trust Engine, Adaptive Account Protection & Honey Evidence Deception  
**Platform:** CrimeSync (NCRB Cyber Intelligence Platform)  
**System Law:** Non-Biometric • Rule-Based Math • PostgreSQL Relational Schema • Autonomous Containment

---

## 1. Quick Start & Prerequisites

Ensure both the Frontend and Backend services are running:

| Service | Address | Command to Start (if needed) |
| :--- | :--- | :--- |
| **Frontend (Vite + React)** | [http://localhost:5173/](http://localhost:5173/) | `npm run dev` (in project root) |
| **Backend (Express + PostgreSQL)** | [http://localhost:5000/](http://localhost:5000/) | `node server/dist/server.js` |

---

## 2. How to Access the Module in the UI

1. Open your browser and go to: **`http://localhost:5173/`**
2. In the left navigation sidebar under the **`CYBER DEFENSE`** section, click on **`Identity Doppelgänger`** (with the user shield icon).
3. The dashboard displays the full **Adaptive Account Protection System** with 6 synchronized cybersecurity modules.

---

## 3. Step-by-Step Verification Test Cases

### Test Case 1: Baseline Trusted Session (Score: 100/100)
1. **Action:** In the top header scenario switcher bar, click **`🟢 Trusted (100)`**.
2. **Under the Hood:**
   - The backend validates the officer's telemetry against historical PostgreSQL baselines (`user_behavior_profile`).
   - Formula: $\text{Base Auth }(+40) + \text{Device }(+20) + \text{Location }(+15) + \text{Normal Hours }(+10) + \text{Browser }(+15) = \mathbf{100}$.
3. **What You Will See:**
   - **Hero Gauge:** Glowing **Emerald Green (`#10b981`)** ring showing **100**.
   - **Containment Pipeline:** Shows **04: Normal Clearance (Unrestricted)**.
   - **Automatic Response Engine:** All 7 capabilities (Export, CDR Download, Blockchain Write, Bulk Report) are in **`Allowed (Green)`** state.

---

### Test Case 2: Behavioral Drift / Suspicious Session (Score: 65/100)
1. **Action:** Click **`🟡 Suspicious (65)`** in the header.
2. **Under the Hood:**
   - Detects non-critical drift: session initiated via Firefox Developer Edition ($-10$) after normal duty shift ($-10$).
   - Formula: $\text{Base Auth }(+40) + \text{Device }(+20) + \text{Location }(+15) + \text{Baseline Standing }(+10) - \text{Browser }(-10) - \text{Off-Hours }(-10) = \mathbf{65}$.
3. **What You Will See:**
   - **Hero Gauge:** Counts down smoothly to **65** in **Amber (`#f59e0b`)**.
   - **Risk Status:** `Status: Suspicious Drift` • `Session Risk: Medium (Monitoring Drift)`.
   - **Behavioral Table:** Browser row turns amber (`Firefox Developer v129 - Different Browser (-10)`).

---

### Test Case 3: High-Risk Account Takeover & Adaptive Containment (Score: 40/100)
1. **Action:** Click **`🔴 High Risk (40)`** in the header.
2. **Under the Hood:**
   - Severe deviations detected: Egress from Frankfurt Tor node ($-25$), unregistered Apple MacBook without TPM ($-20$), 02:17 AM nocturnal login ($-15$), and untracked browser engine ($-10$).
   - Total Trust Score drops to **40/100** (below the 50-point threshold).
3. **Autonomous Containment Reaction:**
   - **Hero Gauge:** Pulsing in **Crimson Red (`#ef4444`)** showing **40**.
   - **Containment Pipeline:** Step 04 illuminates in red: **`CONTAINED (Exfiltration & Writes Blocked)`**.
   - **Explainable Risk Ledger:** Displays the mathematical ledger proving why the score dropped to 40.
   - **Automatic Response Engine (Dynamic Exfiltration Quarantine):**
     - `Evidence Export (Section 65B Dossier)` $\rightarrow$ **`🔒 Blocked (Red)`**
     - `Download Raw CDR Dumps` $\rightarrow$ **`🔒 Blocked (Red)`**
     - `Anchor State to Blockchain Ledger` $\rightarrow$ **`🔒 Blocked (Red)`**
     - `Bulk Report Generation & Multi-Dossier Export` $\rightarrow$ **`🔒 Blocked (Red)`**
     - `View Assigned Case Records` $\rightarrow$ **`✅ Allowed (Read-Only context preserved)`**
     - `Knowledge Graph Cypher Query` $\rightarrow$ **`⚠️ Read Only (Masked Entities)`**
4. **Interactive Action Simulator:**
   - Hover your mouse over any **`Blocked`** badge to see the tooltip: *"Action restricted due to High-Risk session behavior."*
   - Click the button **`Attempt Action (Denied)`** next to *Bulk Report Generation* or *Export Section 65B Dossier*.
   - A red animated banner appears at the top:
     > 🔒 **ACTION CONTAINED & BLOCKED: Bulk Report Generation & Multi-Dossier Export**  
     > *Action restricted due to High-Risk session behavior (Trust Score < 50). Exfiltration vectors automatically contained by Adaptive Protection Engine.*

---

### Test Case 4: Honey Evidence Deception Tripwire (`EV9999`)
1. **Action:** Click **`🍯 Honey Trap (EV9999)`** in the header, OR click **`Trigger Decoy Trap`** on the Honey Decoy Artifact card.
2. **Under the Hood:**
   - Decoy record `EV9999: Swiss Secret Banking Hawala Ledger & Wiretap Dump` is accessed by the suspicious session.
   - $-30$ deception penalty enforced, dropping the score to **10/100 (Critical)**.
3. **What You Will See:**
   - **Live Session Activity Timeline:** The top audit entry *`Viewed Evidence EV9999 (Decoy Artifact)`* turns into a glowing **pulsing Crimson Red bar** with a bouncing **`🚨 TRIPWIRE ACTIVATED`** badge.
   - **Threat Feed:** Adds a critical alert: *TRIPWIRE ACTIVATED: Honey Evidence EV9999 Accessed*.
   - **Autonomous Interconnect:** Anomaly is linked to the **Attack Graph** (`ANOMALY-DOPPELGANGER-HONEY-EV9999`).

---

### Test Case 5: Inspect PostgreSQL Database Queries & SOAR Quarantine
1. **Action:** Click the **`DB Tables`** button in the top right.
2. **Result:** An expandable drawer opens revealing the relational queries mapped to the PostgreSQL database (`users`, `user_behavior_profile`, `login_history`, `audit_logs`).
3. **Action:** Click the red **`Quarantine`** button.
4. **Result:** Enforces autonomous SOAR session quarantine, revoking Kerberos tickets across all nodes.

---

## 4. Verifying via Terminal / API (Optional)

```bash
# 1. Fetch current behavioral session data
curl http://localhost:5000/api/v1/identity/behavioral-session

# 2. Simulate High-Risk mode (Score: 40 - Containment active)
curl -X POST http://localhost:5000/api/v1/identity/behavioral-session/simulate -H "Content-Type: application/json" -d "{\"mode\":\"COMPROMISED\"}"

# 3. Trigger Honey Trap EV9999 (Score: 10)
curl -X POST http://localhost:5000/api/v1/identity/behavioral-session/honey-trap

# 4. Reset to Trusted mode (Score: 100)
curl -X POST http://localhost:5000/api/v1/identity/behavioral-session/simulate -H "Content-Type: application/json" -d "{\"mode\":\"TRUSTED\"}"
```
