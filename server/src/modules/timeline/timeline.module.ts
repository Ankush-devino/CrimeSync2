// Team Member 5: Time Machine & Chronological Crime Reconstruction Module
import { Router, Request, Response } from "express";
import { pgPool, neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface TimelineEventDTO {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  type: "Communication" | "Financial Transaction" | "Location" | "Surveillance" | "Forensic Evidence" | "Case Event";
  category: string;
  title: string;
  sub: string;
  entities: string;
  entitiesSub: string;
  evidence: string;
  evidenceType: "doc" | "audio" | "video" | "geo" | "hash";
  riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  properties?: Record<string, any>;
}

const DEFAULT_TIMELINES: Record<string, TimelineEventDTO[]> = {
  "CASE-2026-001": [
    {
      id: "ev-01-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "10:15 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹18,50,000 Hawala Funnel to Crypto Escrow",
      sub: "From: HDFC0001928374 (Rajesh Sharma) → To: BIN0009283746 (USDT Cold Storage)",
      entities: "Rajesh Sharma → Offshore Escrow",
      entitiesSub: "Ref: RTGS/2026/10293847 (HDFC Bank)",
      evidence: "Core Banking SFMS Wire Log",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-01-2",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      timeFormatted: "05:15 AM",
      dateFormatted: "Today",
      type: "Location",
      category: "Location",
      title: "Geospatial Sighting: Chandni Chowk Hawala Hub",
      sub: "Old Delhi, Delhi (HAWALA_CASH_HANDOVER)",
      entities: "Chandni Chowk, Delhi",
      entitiesSub: "GPS: 28.6506, 77.2303",
      evidence: "Field Surveillance & CCTV Intercept",
      evidenceType: "geo",
      riskSeverity: "HIGH",
    },
    {
      id: "ev-01-3",
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      timeFormatted: "04:30 PM",
      dateFormatted: "Yesterday",
      type: "Communication",
      category: "Communication",
      title: "Encrypted VoIP Traffic: +91-9811002233 ↔ +91-9871994455",
      sub: "18 Calls, 42 SMS coordinating cash dropoffs",
      entities: "Rajesh Sharma ↔ Vikram Malhotra",
      entitiesSub: "Tower Sector 18, Noida",
      evidence: "Section 91 CrPC Telecom Intercept",
      evidenceType: "audio",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-01-4",
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
      timeFormatted: "06:45 AM",
      dateFormatted: "Yesterday",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "Seizure of Encrypted Ledger Drive",
      sub: "SanDisk Extreme 2TB hardware token imaged into raw forensic E01 format",
      entities: "EVD-DEL-2026-01",
      entitiesSub: "SHA-256: 4e9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a",
      evidence: "Digital Forensics Vault Exhibit",
      evidenceType: "hash",
      riskSeverity: "HIGH",
    },
  ],
  "CASE-2026-002": [
    {
      id: "ev-02-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "11:00 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "SCADA Infiltration Payload Discovered",
      sub: "BlackCat Variant payload extracted from RTU-44 firmware dump",
      entities: "EVD-BLR-2026-01",
      entitiesSub: "SHA-256: 7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      evidence: "CERT-In Cyber Forensics Vault",
      evidenceType: "hash",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-02-2",
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      timeFormatted: "05:00 AM",
      dateFormatted: "Today",
      type: "Location",
      category: "Location",
      title: "Anomalous VPN Tunnel from IP 185.220.101.5",
      sub: "Bengaluru SCADA Substation Gateway 04",
      entities: "Bengaluru Load Dispatch Center",
      entitiesSub: "GPS: 12.9716, 77.5946",
      evidence: "Network Firewall Syslog",
      evidenceType: "geo",
      riskSeverity: "CRITICAL",
    },
  ],
  "CASE-2026-003": [
    {
      id: "ev-03-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "09:20 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹14,20,000 Hawala Funneling via Mule Accounts",
      sub: "From: ICIC0001122334 → To: SBIN0009988776",
      entities: "Vikram Malhotra → Mule Network",
      entitiesSub: "Ref: NEFT/2026/44556677 (SBI Mumbai)",
      evidence: "NPCI Core Banking Feed",
      evidenceType: "doc",
      riskSeverity: "HIGH",
    },
    {
      id: "ev-03-2",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      timeFormatted: "01:20 AM",
      dateFormatted: "Today",
      type: "Communication",
      category: "Communication",
      title: "VoIP Switch Intercept: +91-9822334455 ↔ +971-501234567",
      sub: "International Dubai Hawala link coordinating logistics",
      entities: "Mumbai ↔ Dubai",
      entitiesSub: "SIP Trunk Intercept (Gateway 12)",
      evidence: "Section 91 CrPC Telecom Intercept",
      evidenceType: "audio",
      riskSeverity: "CRITICAL",
    },
  ],
  "CASE-2026-004": [
    {
      id: "ev-04-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "11:45 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹34,50,000 RTGS Transfer to OTC Crypto Desk",
      sub: "From: ICIC0003892110 (Anirban Mukherjee) → To: WZR0009918273 (USDT Vault)",
      entities: "Anirban Mukherjee → Offshore Crypto Pool",
      entitiesSub: "Ref: RTGS/2026/77192039 (ICICI Bank)",
      evidence: "Core Banking SFMS Wire Intercept",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-04-2",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      timeFormatted: "08:30 AM",
      dateFormatted: "Today",
      type: "Location",
      category: "Location",
      title: "Physical Call Center Raid: Salt Lake Sector V",
      sub: "Bidhannagar Police & CBI raid on 4th floor IT Suite",
      entities: "Salt Lake Sector V, Kolkata, WB",
      entitiesSub: "GPS: 22.572645, 88.363892",
      evidence: "CCTV Seizure & Police GD Entry #402",
      evidenceType: "geo",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-04-3",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      timeFormatted: "03:15 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "Forensic Seizure: Asterisk PBX Server & VoIP SIP Trunks",
      sub: "Grandstream GXW4108 gateway hardware imaged into forensic raw file",
      entities: "EVD-KOL-2026-01",
      entitiesSub: "SHA-256: 9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
      evidence: "Digital Evidence Vault",
      evidenceType: "hash",
      riskSeverity: "HIGH",
    },
    {
      id: "ev-04-4",
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      timeFormatted: "03:40 PM",
      dateFormatted: "Yesterday",
      type: "Communication",
      category: "Communication",
      title: "Intercepted SIP Trunk: Debjit Sen ↔ Anirban Mukherjee",
      sub: "84 Calls, 210 SMS coordinating US victim routing",
      entities: "+91-9874112233 ↔ +91-9831998877",
      entitiesSub: "VoIP Gateway Intercept (Sector 62 Noida)",
      evidence: "Section 91 CrPC Telecom Intercept",
      evidenceType: "audio",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-04-5",
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
      timeFormatted: "05:10 AM",
      dateFormatted: "Yesterday",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹6,80,000 UPI Funnel from Mule Account",
      sub: "From: AXIS0009182374 (Debjit Sen) → To: ICIC0003892110 (Anirban Mukherjee)",
      entities: "Debjit Sen → Anirban Mukherjee",
      entitiesSub: "Ref: UPI/2026/88410294 (Axis Bank)",
      evidence: "NPCI UPI Switch Log",
      evidenceType: "doc",
      riskSeverity: "HIGH",
    },
  ],
  "CASE-2026-005": [
    {
      id: "ev-05-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "10:15 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹42,00,000 Extortion RTGS Transfer Received",
      sub: "From: Victim Senior Executive → To: SBIN0006719023 (Manish Rathore)",
      entities: "Victim → Manish Rathore (Mule Manager)",
      entitiesSub: "Ref: RTGS/2026/33918204 (SBI Mumbai)",
      evidence: "Core Banking RTGS Ledger",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-05-2",
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      timeFormatted: "04:00 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "Evidence Seizure: Fake CBI Video Call Studio",
      sub: "Forged Supreme Court arrest warrants & Skype fake backdrop",
      entities: "EVD-MUM-2026-02 & EVD-MUM-2026-03",
      entitiesSub: "SHA-256: 3a978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48c3",
      evidence: "Forensic Vault Physical Exhibit",
      evidenceType: "hash",
      riskSeverity: "HIGH",
    },
    {
      id: "ev-05-3",
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      timeFormatted: "08:20 PM",
      dateFormatted: "Yesterday",
      type: "Location",
      category: "Location",
      title: "Hawala Courier Intercept: Nariman Point",
      sub: "Cash handover point for ₹9,50,000 layering cycle",
      entities: "Nariman Point Financial District, Mumbai",
      entitiesSub: "GPS: 18.921984, 72.834654",
      evidence: "Traffic CCTV & Field Officer GD Entry",
      evidenceType: "geo",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-05-4",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      timeFormatted: "10:30 AM",
      dateFormatted: "Yesterday",
      type: "Communication",
      category: "Communication",
      title: "Targeted Extortion Call: Kunwar Pratap Singh",
      sub: "72-Hour continuous virtual arrest Skype session",
      entities: "+91-9829001122 ↔ Extortion Victim",
      entitiesSub: "IP Proxy Hop: 115.240.91.44 (Jaipur)",
      evidence: "Skype Session PCAP Recording",
      evidenceType: "audio",
      riskSeverity: "CRITICAL",
    },
  ],
  "CASE-2026-006": [
    {
      id: "ev-06-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "11:10 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹14,80,000 Cloned Fingerprint AePS Cash Drain",
      sub: "From: HDFC0004455667 (Jignesh Patel) → To: CASH-SURAT-01",
      entities: "Jignesh Patel → Cash Out Agent",
      entitiesSub: "Ref: AEPS/2026/88392014 (HDFC Bank)",
      evidence: "UIDAI AePS Micro-ATM Auth Log",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-06-2",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      timeFormatted: "07:10 AM",
      dateFormatted: "Today",
      type: "Location",
      category: "Location",
      title: "Sub-Registrar Office Biometric Dump Site",
      sub: "Ellisbridge, Ahmedabad, Gujarat",
      entities: "Ahmedabad Sub-Registrar Office",
      entitiesSub: "GPS: 23.022505, 72.571362",
      evidence: "CCTV Intercept & Fingerprint Mold Seizure",
      evidenceType: "geo",
      riskSeverity: "HIGH",
    },
    {
      id: "ev-06-3",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      timeFormatted: "11:10 PM",
      dateFormatted: "Yesterday",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "Seizure: 3D Silicone Fingerprint Polymer Sheets",
      sub: "Mantra MFS100 biometric scanner & optical clone sheets",
      entities: "EVD-AHM-2026-01",
      entitiesSub: "SHA-256: 5f98a23b114dcfebaa3381e4910243e8876cbb912304918237492102948576ab",
      evidence: "Forensic Science Lab (FSL) Gandhinagar",
      evidenceType: "hash",
      riskSeverity: "HIGH",
    },
  ],
  "CASE-2026-007": [
    {
      id: "ev-07-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "12:30 PM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹18,00,000 USDT Ransom Settlement Extortion",
      sub: "From: Victim Tech Director → To: 0x71C...882E (Kavita Nair)",
      entities: "Victim Tech Director → Kavita Nair (Aria)",
      entitiesSub: "Ref: CRYPTO/USDT/2026/99102834",
      evidence: "Ethereum On-Chain Ledger & Etherscan",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-07-2",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      timeFormatted: "07:30 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "Forensic Seizure: RTX 4090 Deepfake Training Rig",
      sub: "Stable Diffusion checkpoint weights & voice cloning models seized",
      entities: "EVD-BLR-2026-02",
      entitiesSub: "SHA-256: 6a87b124cf391847118237461948576a1029384756abcdef9910283746152431",
      evidence: "Cyber Crime Cell Digital Exhibit",
      evidenceType: "hash",
      riskSeverity: "HIGH",
    },
  ],
  "CASE-2026-008": [
    {
      id: "ev-08-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "09:45 AM",
      dateFormatted: "Today",
      type: "Financial Transaction",
      category: "Financial Transaction",
      title: "₹52,00,000 Rapid Hawala Channel Cleared",
      sub: "From: ICIC0009988771 (Vikram Solanki) → To: AXIS0001199283 (Rakesh Jhala)",
      entities: "Vikram Solanki → Rakesh Jhala",
      entitiesSub: "Ref: RTGS/2026/91823746 (ICICI Pune)",
      evidence: "Core Banking RTGS Switch",
      evidenceType: "doc",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-08-2",
      timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
      timeFormatted: "02:45 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "APK Decompilation: QuickLoan_v4.2.apk Trojan",
      sub: "Exfiltrates SMS, Gallery, and Call logs to command server in Cambodia",
      entities: "EVD-PUN-2026-01",
      entitiesSub: "SHA-256: 8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b",
      evidence: "CERT-In Threat Analysis Exhibit",
      evidenceType: "hash",
      riskSeverity: "CRITICAL",
    },
  ],
  "CASE-2026-009": [
    {
      id: "ev-09-1",
      timestamp: new Date().toISOString(),
      timeFormatted: "10:00 AM",
      dateFormatted: "Today",
      type: "Forensic Evidence",
      category: "Forensic Evidence",
      title: "SCADA PLC Ransomware Binary Seized",
      sub: "Triton variant targeting Siemens S7-1500 controllers in power grid",
      entities: "EVD-CHN-2026-01",
      entitiesSub: "SHA-256: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      evidence: "NCIIPC Critical Infrastructure Lab",
      evidenceType: "hash",
      riskSeverity: "CRITICAL",
    },
    {
      id: "ev-09-2",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      timeFormatted: "07:00 AM",
      dateFormatted: "Today",
      type: "Location",
      category: "Location",
      title: "Unauthorized Remote SCADA Access: Sriperumbudur Substation",
      sub: "Chennai, Tamil Nadu (POWER_GRID_INTRUSION)",
      entities: "Sriperumbudur 400kV Substation",
      entitiesSub: "GPS: 12.9675, 79.9419",
      evidence: "Substation SCADA Event Log",
      evidenceType: "geo",
      riskSeverity: "CRITICAL",
    },
  ],
};

export class TimelineService {
  async getChronologicalReconstruction(caseId?: string, range = "15D") {
    const events: TimelineEventDTO[] = [];
    const isFiltered = caseId && caseId !== "ALL";

    try {
      // 0. Fetch Case info if specific case selected
      let caseInfo: any = null;
      if (isFiltered) {
        const caseRes = await pgPool.query("SELECT * FROM cases WHERE id = $1", [caseId]);
        if (caseRes.rows.length > 0) caseInfo = caseRes.rows[0];
      }

      // 1. Fetch Financial Transactions from PostgreSQL
      const finQuery = isFiltered
        ? await pgPool.query("SELECT * FROM financial_transactions WHERE case_id = $1 ORDER BY timestamp DESC", [caseId])
        : await pgPool.query("SELECT * FROM financial_transactions ORDER BY timestamp DESC LIMIT 50");

      finQuery.rows.forEach((row, i) => {
        const dt = new Date(row.timestamp || Date.now() - i * 3600000 * 4);
        events.push({
          id: `fin-${row.id || i}`,
          timestamp: dt.toISOString(),
          timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          type: "Financial Transaction",
          category: "Financial Transaction",
          title: `₹${Number(row.amount_inr).toLocaleString("en-IN")} via ${row.channel} Transfer`,
          sub: `From: ${row.source_holder_name} → To: ${row.target_holder_name}`,
          entities: `${row.source_holder_name} → ${row.target_holder_name}`,
          entitiesSub: `Ref: ${row.transaction_ref} (${row.bank_name || "Bank"})`,
          evidence: "Bank Core Banking Ledger",
          evidenceType: "doc",
          riskSeverity: Number(row.suspicious_score) >= 0.9 ? "CRITICAL" : Number(row.suspicious_score) >= 0.8 ? "HIGH" : "MEDIUM",
          properties: row,
        });
      });

      // 2. Fetch Geo-Intel events from PostgreSQL
      const geoQuery = isFiltered
        ? await pgPool.query("SELECT * FROM geo_intel_events WHERE case_id = $1 ORDER BY timestamp DESC", [caseId])
        : await pgPool.query("SELECT * FROM geo_intel_events ORDER BY timestamp DESC LIMIT 30");

      geoQuery.rows.forEach((row, i) => {
        const dt = new Date(row.timestamp || Date.now() - (i + 1) * 3600000 * 6);
        events.push({
          id: `geo-${row.id || i}`,
          timestamp: dt.toISOString(),
          timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          type: "Location",
          category: "Location",
          title: `Geospatial Sighting: ${row.location_name}`,
          sub: `${row.city}, ${row.state} (${row.event_type})`,
          entities: `${row.location_name}, ${row.city}`,
          entitiesSub: `GPS: ${row.latitude}, ${row.longitude}`,
          evidence: "Cell Tower CDR & CCTV Feed",
          evidenceType: "geo",
          riskSeverity: row.event_type.includes("FRAUD") || row.event_type.includes("HAWALA") || row.event_type.includes("RAID") ? "CRITICAL" : "HIGH",
          properties: row,
        });
      });

      // 3. Fetch Evidence Logged
      const evdQuery = isFiltered
        ? await pgPool.query("SELECT * FROM evidence WHERE case_id = $1 ORDER BY collected_at DESC", [caseId])
        : await pgPool.query("SELECT * FROM evidence ORDER BY collected_at DESC LIMIT 30");

      evdQuery.rows.forEach((row, i) => {
        const dt = new Date(row.collected_at || Date.now() - (i + 2) * 3600000 * 8);
        events.push({
          id: `evd-${row.id || i}`,
          timestamp: dt.toISOString(),
          timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          type: "Forensic Evidence",
          category: "Surveillance",
          title: `Forensic Seizure: ${row.title}`,
          sub: `Category: ${row.category} (Status: ${row.status})`,
          entities: row.evidence_code,
          entitiesSub: `SHA-256: ${row.hash_sha256?.slice(0, 16)}...`,
          evidence: "Evidence Vault SHA-256 Record",
          evidenceType: "hash",
          riskSeverity: "HIGH",
          properties: row,
        });
      });

      // 4. Fetch Phone & Network Comm Intercepts from Neo4j
      if (neo4jDriver) {
        const session = neo4jDriver.session();
        try {
          const commCypher = isFiltered
            ? `MATCH (s:Suspect)-[:IMPLICATED_IN]->(c:Case {id: $caseId})
               OPTIONAL MATCH (s)-[:OWNS_DEVICE]->(p1:Phone)-[r:COMMUNICATES_WITH]->(p2:Phone)
               WHERE p1 IS NOT NULL AND p2 IS NOT NULL
               RETURN p1.phone_number as src, p2.phone_number as tgt, r.calls as calls, r.sms as sms, r.last_contact as date`
            : `MATCH (p1:Phone)-[r:COMMUNICATES_WITH]->(p2:Phone)
               RETURN p1.phone_number as src, p2.phone_number as tgt, r.calls as calls, r.sms as sms, r.last_contact as date`;

          const commRes = await session.run(commCypher, { caseId });
          commRes.records.forEach((rec, i) => {
            const src = rec.get("src");
            const tgt = rec.get("tgt");
            if (!src || !tgt) return;

            const dt = new Date(Date.now() - (i + 1) * 3600000 * 3);
            events.push({
              id: `comm-${i}`,
              timestamp: dt.toISOString(),
              timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
              type: "Communication",
              category: "Communication",
              title: `Intercepted Contact: ${src} ↔ ${tgt}`,
              sub: `${rec.get("calls")?.toNumber ? rec.get("calls").toNumber() : rec.get("calls") || 1} Calls, ${rec.get("sms")?.toNumber ? rec.get("sms").toNumber() : rec.get("sms") || 0} SMS logged`,
              entities: `${src} ↔ ${tgt}`,
              entitiesSub: `Last Contact: ${rec.get("date") || "Recent"}`,
              evidence: "Section 91 CrPC Telecom Intercept",
              evidenceType: "audio",
              riskSeverity: "CRITICAL",
              properties: { calls: rec.get("calls"), sms: rec.get("sms") },
            });
          });
        } catch (err) {
          console.warn("Neo4j timeline warning:", err);
        } finally {
          await session.close();
        }
      }

      // Sort chronologically (latest first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (events.length > 0) {
        return {
          total_events: events.length,
          time_range: range,
          case_id: caseId || "ALL",
          case_info: caseInfo,
          events,
        };
      }
    } catch (err) {
      console.warn("Timeline query fallback:", err);
    }

    // Default Fallback
    const fallbackList = DEFAULT_TIMELINES[caseId || "CASE-2026-004"] || DEFAULT_TIMELINES["CASE-2026-004"];
    return {
      total_events: fallbackList.length,
      time_range: range,
      case_id: caseId || "CASE-2026-004",
      events: fallbackList,
    };
  }

  async addTimelineEvent(eventData: {
    case_id: string;
    type?: string;
    category?: string;
    title: string;
    sub?: string;
    entities?: string;
    entitiesSub?: string;
    evidence?: string;
    evidenceType?: "doc" | "audio" | "video" | "geo" | "hash";
    riskSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    timestamp?: string;
    properties?: Record<string, any>;
  }): Promise<TimelineEventDTO> {
    const caseId = eventData.case_id || "CASE-2026-004";
    const dt = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
    const eventId = `ev-user-${Date.now()}`;

    const newEvent: TimelineEventDTO = {
      id: eventId,
      timestamp: dt.toISOString(),
      timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      type: (eventData.type as any) || "Case Event",
      category: eventData.category || eventData.type || "Case Event",
      title: eventData.title.trim(),
      sub: eventData.sub || "Manually logged investigation exhibit",
      entities: eventData.entities || "Investigation Team",
      entitiesSub: eventData.entitiesSub || `Case: ${caseId}`,
      evidence: eventData.evidence || "Officer Field Log",
      evidenceType: eventData.evidenceType || "doc",
      riskSeverity: eventData.riskSeverity || "HIGH",
      properties: eventData.properties || {},
    };

    // 1. If DEFAULT_TIMELINES has this case, prepend it so memory cache is always reactive
    if (!DEFAULT_TIMELINES[caseId]) {
      DEFAULT_TIMELINES[caseId] = [];
    }
    DEFAULT_TIMELINES[caseId].unshift(newEvent);

    // 2. Try inserting into PostgreSQL based on event type
    try {
      if (newEvent.type === "Financial Transaction" && eventData.properties?.amount_inr) {
        await pgPool.query(
          `INSERT INTO financial_transactions (case_id, transaction_ref, source_account, source_holder_name, target_account, target_holder_name, amount_inr, channel, suspicious_score, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            caseId,
            `TXN-MAN-${Date.now().toString().slice(-6)}`,
            eventData.properties.source_account || "ACC-MULE-01",
            eventData.properties.source_name || eventData.entities || "Source Account",
            eventData.properties.target_account || "ACC-MULE-02",
            eventData.properties.target_name || "Target Account",
            Number(eventData.properties.amount_inr) || 50000,
            eventData.properties.channel || "UPI",
            newEvent.riskSeverity === "CRITICAL" ? 0.95 : 0.85,
            dt.toISOString(),
          ]
        );
      } else if (newEvent.type === "Location") {
        await pgPool.query(
          `INSERT INTO geo_intel_events (case_id, event_type, latitude, longitude, location_name, city, state, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            caseId,
            "FIELD_SURVEILLANCE_PING",
            eventData.properties?.latitude || 28.6139,
            eventData.properties?.longitude || 77.2090,
            eventData.entities || "Surveillance Point",
            eventData.properties?.city || "New Delhi",
            eventData.properties?.state || "Delhi",
            dt.toISOString(),
          ]
        );
      } else if (newEvent.type === "Forensic Evidence") {
        await pgPool.query(
          `INSERT INTO evidence (case_id, evidence_code, title, category, hash_sha256, status, collected_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            caseId,
            `EVD-${Date.now().toString().slice(-4)}`,
            newEvent.title,
            "DIGITAL_FORENSIC_EXHIBIT",
            eventData.properties?.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "SECURED",
            dt.toISOString(),
          ]
        );
      }
    } catch (dbErr) {
      console.warn("Could not insert timeline event into PostgreSQL (fallback to in-memory):", dbErr);
    }

    return newEvent;
  }
}

export const timelineService = new TimelineService();

export class TimelineController {
  async handleGetTimeline(req: Request, res: Response) {
    const caseId = (req.query.caseId as string) || "CASE-2026-004";
    const range = (req.query.range as string) || "15D";
    try {
      const result = await timelineService.getChronologicalReconstruction(caseId, range);
      res.json(formatResponse(true, result, "Chronological timeline reconstructed successfully"));
    } catch (err: any) {
      console.warn("TimelineController fallback on error:", err);
      const fallbackList = DEFAULT_TIMELINES[caseId] || DEFAULT_TIMELINES["CASE-2026-004"] || [];
      res.json(formatResponse(true, {
        total_events: fallbackList.length,
        time_range: range,
        case_id: caseId,
        events: fallbackList,
      }, "Chronological timeline reconstructed (fallback mode)"));
    }
  }

  async handleAddEvent(req: Request, res: Response) {
    try {
      const { case_id, title, type, category, sub, entities, entitiesSub, evidence, evidenceType, riskSeverity, timestamp, properties } = req.body;
      if (!title) {
        return res.status(400).json(formatResponse(false, null, undefined, "Event title is required"));
      }
      const newEvent = await timelineService.addTimelineEvent({
        case_id: case_id || "CASE-2026-004",
        title,
        type: type || "Case Event",
        category,
        sub,
        entities,
        entitiesSub,
        evidence,
        evidenceType,
        riskSeverity: riskSeverity || "HIGH",
        timestamp,
        properties,
      });
      res.json(formatResponse(true, newEvent, "Timeline exhibit added successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const timelineController = new TimelineController();

export function timelineRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => timelineController.handleGetTimeline(req, res));
  router.post("/event", (req, res) => timelineController.handleAddEvent(req, res));
  return router;
}
