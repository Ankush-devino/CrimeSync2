import { pgPool } from "../../config/db";

export class CaseService {
  async getAllCases(filters: { status?: string; priority?: string; city?: string } = {}) {
    let query = `
      SELECT c.*, u.full_name as lead_investigator_name, u.badge_number, u.department
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
    return result.rows;
  }

  async getCaseById(id: string) {
    const caseQuery = `
      SELECT c.*, u.full_name as lead_investigator_name, u.badge_number, u.department, u.phone as investigator_phone
      FROM cases c
      LEFT JOIN users u ON c.lead_investigator_id = u.id
      WHERE c.id = $1
    `;
    const caseRes = await pgPool.query(caseQuery, [id]);
    if (caseRes.rows.length === 0) return null;

    // Fetch related evidence
    const evidenceRes = await pgPool.query(
      `SELECT * FROM evidence WHERE case_id = $1 ORDER BY collected_at DESC`,
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

    return {
      ...caseRes.rows[0],
      evidence: evidenceRes.rows,
      financial_transactions: finRes.rows,
      geo_events: geoRes.rows,
    };
  }

  async getCaseStats() {
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
  }
}

export const caseService = new CaseService();
