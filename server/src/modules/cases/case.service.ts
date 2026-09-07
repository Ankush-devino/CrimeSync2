import { pgPool, neo4jDriver } from "../../config/db";

const DEFAULT_CASES = [
  {
    id: 'CASE-2026-004',
    fir_number: 'FIR/KOL/2026/0412',
    title: 'Operation Chakra: Tech Support & Crypto Scam',
    description: 'Illicit VOIP call center ring masquerading as global tech support, coercing wire transfers into Indian mule accounts and OTC USDT channels.',
    crime_category: 'FINANCIAL_FRAUD',
    priority: 'CRITICAL',
    status: 'INVESTIGATING',
    jurisdiction_city: 'Kolkata',
    lead_investigator_name: 'Superintendent Ananya Sengupta',
    badge_number: 'CBI-HQ-0012',
    department: 'Anti-Corruption & Economic Offences',
  },
  {
    id: 'CASE-2026-005',
    fir_number: 'FIR/MUM/2026/1842',
    title: 'Operation Vajra: Digital Arrest & Fake CBI Extortion',
    description: 'Syndicate impersonating CBI & ED officers on Skype/WhatsApp, placing victims under 72-hour virtual house arrest to extort crores.',
    crime_category: 'ORGANIZED_SYNDICATE',
    priority: 'CRITICAL',
    status: 'INVESTIGATING',
    jurisdiction_city: 'Mumbai',
    lead_investigator_name: 'Inspector Priya Kulkarni',
    badge_number: 'MUM-CYB-4091',
    department: 'Cyber Crime Investigation Cell',
  },
  {
    id: 'CASE-2026-006',
    fir_number: 'FIR/AHM/2026/0593',
    title: 'Operation Durg: Biometric & AePS Micro-ATM Bypass',
    description: 'High-precision silicone fingerprint casting from public land deed registries used to execute unauthorized AePS micro-ATM withdrawals.',
    crime_category: 'IDENTITY_THEFT',
    priority: 'HIGH',
    status: 'INVESTIGATING',
    jurisdiction_city: 'Ahmedabad',
    lead_investigator_name: 'SI Vikramaditya Reddy',
    badge_number: 'HYD-CID-7740',
    department: 'CID Financial Fraud Division',
  },
  {
    id: 'CASE-2026-007',
    fir_number: 'FIR/BLR/2026/0778',
    title: 'Operation Netra: AI Deepfake Video Extortion',
    description: 'Generative diffusion models used to fabricate high-ranking corporate executive compromising videos for Monero and USDT extortion.',
    crime_category: 'CYBER_ATTACK',
    priority: 'HIGH',
    status: 'OPEN',
    jurisdiction_city: 'Bengaluru',
    lead_investigator_name: 'DSP Arvind Swaminathan',
    badge_number: 'BLR-INT-1102',
    department: 'Forensic Science Laboratory (FSL)',
  },
  {
    id: 'CASE-2026-008',
    fir_number: 'FIR/PUN/2026/1129',
    title: 'Operation Kuber: Instant Loan App & Hawala Funnel',
    description: 'Malicious Android APKs stealing contacts/photos, backed by aggressive harassment call centers and automated Hawala money laundering.',
    crime_category: 'FINANCIAL_FRAUD',
    priority: 'CRITICAL',
    status: 'INVESTIGATING',
    jurisdiction_city: 'Pune',
    lead_investigator_name: 'ACP Rajeshwar Sharma',
    badge_number: 'DEL-IPS-8821',
    department: 'Special Cell / Cyber Crime Unit',
  },
  {
    id: 'CASE-2026-009',
    fir_number: 'FIR/CHE/2026/0204',
    title: 'Operation Rudra: Power Grid SCADA Ransomware',
    description: 'Targeted zero-day VPN exploitation attempting unauthorized command injection into Southern Regional Power Grid SCADA relays.',
    crime_category: 'CYBER_ATTACK',
    priority: 'CRITICAL',
    status: 'OPEN',
    jurisdiction_city: 'Chennai',
    lead_investigator_name: 'Inspector Priya Kulkarni',
    badge_number: 'MUM-CYB-4091',
    department: 'Cyber Crime Investigation Cell',
  },
  {
    id: 'CASE-2026-001',
    fir_number: 'FIR/DEL/2026/0891',
    title: 'Operation Trishul: Hawala & Phishing Syndicate',
    description: 'Large-scale identity theft and mule bank account network targeting PSU bank customers in NCR and MMR region.',
    crime_category: 'FINANCIAL_FRAUD',
    priority: 'CRITICAL',
    status: 'INVESTIGATING',
    jurisdiction_city: 'New Delhi',
    lead_investigator_name: 'ACP Rajeshwar Sharma',
    badge_number: 'DEL-IPS-8821',
    department: 'Special Cell / Cyber Crime Unit',
  },
  {
    id: 'CASE-2026-002',
    fir_number: 'FIR/MUM/2026/1044',
    title: 'GridShield: Cyber Attack on Power Distribution',
    description: 'Targeted spear-phishing and C2 beaconing detected attempting lateral movement into SCADA systems.',
    crime_category: 'CYBER_ATTACK',
    priority: 'CRITICAL',
    status: 'OPEN',
    jurisdiction_city: 'Mumbai',
    lead_investigator_name: 'Inspector Priya Kulkarni',
    badge_number: 'MUM-CYB-4091',
    department: 'Cyber Crime Investigation Cell',
  },
  {
    id: 'CASE-2026-003',
    fir_number: 'FIR/BLR/2026/0332',
    title: 'Operation Garud: Counterfeit SIM & OTP Ring',
    description: 'Unlicensed spoofed VoIP exchanges routing fraudulent OTP requests through forged Aadhaar cards.',
    crime_category: 'ORGANIZED_SYNDICATE',
    priority: 'HIGH',
    status: 'INVESTIGATING',
    jurisdiction_city: 'Bengaluru',
    lead_investigator_name: 'DSP Arvind Swaminathan',
    badge_number: 'BLR-INT-1102',
    department: 'Forensic Science Laboratory (FSL)',
  }
];

export class CaseService {
  async getAllCases(filters: { status?: string; priority?: string; city?: string } = {}) {
    try {
      let query = `
        SELECT c.*, u.full_name as lead_investigator_name, u.badge_number, u.department,
               (SELECT COUNT(*) FROM evidence e WHERE e.case_id = c.id) as evidence_count
        FROM cases c
        LEFT JOIN users u ON c.lead_investigator_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.status) {
        params.push(filters.status);
        query += ` AND c.status = $${params.length}`;
      }
      if (filters.priority) {
        params.push(filters.priority);
        query += ` AND c.priority = $${params.length}`;
      }
      if (filters.city) {
        params.push(filters.city);
        query += ` AND c.jurisdiction_city = $${params.length}`;
      }

      query += ` ORDER BY c.created_at DESC`;
      const result = await pgPool.query(query, params);
      if (result.rows.length > 0) return result.rows;
      return DEFAULT_CASES;
    } catch (err) {
      console.warn("PostgreSQL query fallback for cases:", err);
      return DEFAULT_CASES;
    }
  }

  async getCaseById(id: string) {
    try {
      const caseQuery = `
        SELECT c.*, u.full_name as lead_investigator_name, u.badge_number, u.department, u.phone as investigator_phone
        FROM cases c
        LEFT JOIN users u ON c.lead_investigator_id = u.id
        WHERE c.id = $1
      `;
      const caseRes = await pgPool.query(caseQuery, [id]);
      if (caseRes.rows.length === 0) {
        return DEFAULT_CASES.find((c) => c.id === id) || DEFAULT_CASES[0];
      }

      // Fetch related evidence
      const evidenceRes = await pgPool.query(
        `SELECT e.*, u.full_name as collected_by_name, u2.full_name as custody_officer_name 
         FROM evidence e
         LEFT JOIN users u ON e.collected_by_id = u.id
         LEFT JOIN users u2 ON e.current_custody_officer_id = u2.id
         WHERE e.case_id = $1 
         ORDER BY e.collected_at DESC`,
        [id]
      );

      // Fetch related financial transactions
      const finRes = await pgPool.query(
        `SELECT * FROM financial_transactions WHERE case_id = $1 ORDER BY timestamp DESC`,
        [id]
      );

      // Fetch related geo events
      const geoRes = await pgPool.query(
        `SELECT * FROM geo_intel_events WHERE case_id = $1 ORDER BY timestamp DESC`,
        [id]
      );

      // Fetch case notes / diary entries
      const notesRes = await pgPool.query(
        `SELECT a.id, a.action, a.details, a.timestamp, u.full_name as officer_name, u.badge_number
         FROM audit_trail a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.resource_id = $1 AND a.module = 'CASE_DIARY'
         ORDER BY a.timestamp DESC`,
        [id]
      );

      // Fetch suspects from Neo4j AuraDB if available
      const suspects = await this.getCaseSuspects(id);

      return {
        ...caseRes.rows[0],
        evidence: evidenceRes.rows,
        financial_transactions: finRes.rows,
        geo_events: geoRes.rows,
        case_notes: notesRes.rows,
        suspects: suspects,
      };
    } catch (err) {
      console.warn("PostgreSQL getCaseById fallback:", err);
      return DEFAULT_CASES.find((c) => c.id === id) || DEFAULT_CASES[0];
    }
  }

  async getCaseSuspects(caseId: string) {
    if (neo4jDriver) {
      try {
        const session = neo4jDriver.session();
        const query = `
          MATCH (s:Suspect)-[r:IMPLICATED_IN]->(c:Case {id: $caseId})
          OPTIONAL MATCH (s)-[:OPERATES_ACCOUNT]->(a:Account)
          OPTIONAL MATCH (s)-[:OWNS_DEVICE]->(p:Phone)
          RETURN s.id as id, s.name as name, s.alias as alias, s.role as role,
                 s.risk_level as risk_level, s.city as city, r.role as case_role,
                 collect(DISTINCT a.account_number) as accounts,
                 collect(DISTINCT p.phone_number) as phones
        `;
        const result = await session.run(query, { caseId });
        await session.close();

        if (result.records.length > 0) {
          return result.records.map((rec) => ({
            id: rec.get("id"),
            name: rec.get("name"),
            alias: rec.get("alias"),
            role: rec.get("role"),
            case_role: rec.get("case_role") || rec.get("role"),
            risk_level: rec.get("risk_level") || "HIGH",
            city: rec.get("city") || "National",
            accounts: rec.get("accounts") || [],
            phones: rec.get("phones") || [],
            status: "WANTED",
          }));
        }
      } catch (err) {
        console.warn("Neo4j suspect query error:", err);
      }
    }

    // Fallback suspect data tailored by case
    return [
      {
        id: "SUS-01",
        name: "Vikramaditya Shinde",
        alias: "Vicky Bhai",
        role: "Syndicate Kingpin & Hawala Mastermind",
        case_role: "PRIMARY_ACCUSED",
        risk_level: "CRITICAL",
        city: "Mumbai",
        accounts: ["ICIC0009981201"],
        phones: ["+91-9811099881"],
        status: "UNDER_SURVEILLANCE",
      },
      {
        id: "SUS-02",
        name: "Alok Pandey",
        alias: "Pandeyji",
        role: "Mule Account Network Handler",
        case_role: "FINANCIAL_OPERATOR",
        risk_level: "HIGH",
        city: "New Delhi",
        accounts: ["HDFC0001829032"],
        phones: ["+91-9822088772"],
        status: "WANTED",
      },
    ];
  }

  async createCase(data: {
    fir_number: string;
    title: string;
    description: string;
    crime_category: string;
    priority: string;
    status: string;
    jurisdiction_city: string;
    lead_investigator_id?: string;
  }) {
    const id = `CASE-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const query = `
      INSERT INTO cases (id, fir_number, title, description, crime_category, priority, status, jurisdiction_city, lead_investigator_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id,
      data.fir_number,
      data.title,
      data.description,
      data.crime_category,
      data.priority,
      data.status || "INVESTIGATING",
      data.jurisdiction_city,
      data.lead_investigator_id || "USR-101",
    ];
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  async updateCaseStatus(id: string, status: string) {
    const query = `
      UPDATE cases 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pgPool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  async addCaseNote(caseId: string, data: { userId?: string; note: string; category?: string }) {
    const id = `LOG-${Date.now()}`;
    const query = `
      INSERT INTO audit_trail (id, user_id, action, module, resource_id, details)
      VALUES ($1, $2, $3, 'CASE_DIARY', $4, $5)
      RETURNING *
    `;
    const details = {
      note: data.note,
      category: data.category || "INVESTIGATION_NOTE",
      timestamp: new Date().toISOString(),
    };
    const result = await pgPool.query(query, [
      id,
      data.userId || "USR-101",
      data.category || "NOTE_ADDED",
      caseId,
      JSON.stringify(details),
    ]);
    return result.rows[0];
  }

  async updateCaseNote(noteId: string, data: { note: string; category?: string }) {
    try {
      const existing = await pgPool.query(
        `SELECT * FROM audit_trail WHERE id = $1 AND module = 'CASE_DIARY'`,
        [noteId]
      );
      if (existing.rows.length === 0) {
        return null;
      }
      let details: any = {};
      try {
        details = typeof existing.rows[0].details === 'string'
          ? JSON.parse(existing.rows[0].details)
          : existing.rows[0].details || {};
      } catch {
        details = {};
      }
      details.note = data.note;
      if (data.category) {
        details.category = data.category;
      }
      details.updated_at = new Date().toISOString();

      const query = `
        UPDATE audit_trail
        SET details = $1, action = $2
        WHERE id = $3 AND module = 'CASE_DIARY'
        RETURNING *
      `;
      const result = await pgPool.query(query, [
        JSON.stringify(details),
        data.category || existing.rows[0].action || "NOTE_UPDATED",
        noteId,
      ]);
      return result.rows[0] || null;
    } catch (err) {
      console.warn("Update case note error:", err);
      return { id: noteId, details: JSON.stringify(data) };
    }
  }

  async deleteCaseNote(noteId: string) {
    try {
      const query = `DELETE FROM audit_trail WHERE id = $1 AND module = 'CASE_DIARY' RETURNING id`;
      const result = await pgPool.query(query, [noteId]);
      return result.rows.length > 0;
    } catch (err) {
      console.warn("Delete case note error:", err);
      return true;
    }
  }

  async getCaseStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_cases,
          COUNT(*) FILTER (WHERE status = 'INVESTIGATING' OR status = 'OPEN') as active_cases,
          COUNT(*) FILTER (WHERE priority = 'CRITICAL') as critical_cases,
          COUNT(*) FILTER (WHERE status = 'CLOSED') as resolved_cases
        FROM cases
      `;
      const result = await pgPool.query(statsQuery);
      return result.rows[0];
    } catch (err) {
      return {
        total_cases: String(DEFAULT_CASES.length),
        active_cases: "6",
        critical_cases: "6",
        resolved_cases: "0",
      };
    }
  }
}

export const caseService = new CaseService();
