import { pgPool } from "../../config/db";

export class ThreatService {
  async getActiveAlerts(filter: { severity?: string; status?: string } = {}) {
    let query = `
      SELECT t.*, c.title as case_title, c.fir_number
      FROM threats t
      LEFT JOIN cases c ON t.case_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filter.severity) {
      params.push(filter.severity);
      query += ` AND t.severity = $${params.length}`;
    }
    if (filter.status) {
      params.push(filter.status);
      query += ` AND t.status = $${params.length}`;
    }

    query += ` ORDER BY t.risk_score DESC, t.detected_at DESC`;
    const result = await pgPool.query(query, params);
    return result.rows;
  }

  async getThreatById(id: string) {
    const query = `
      SELECT t.*, c.title as case_title, c.fir_number
      FROM threats t
      LEFT JOIN cases c ON t.case_id = c.id
      WHERE t.id = $1
    `;
    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }
}

export const threatService = new ThreatService();
