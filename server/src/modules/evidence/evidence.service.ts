import { pgPool } from "../../config/db";

export class EvidenceService {
  async getAllEvidence() {
    const query = `
      SELECT e.*, c.title as case_title, c.fir_number, 
             u1.full_name as collected_by_name, u2.full_name as custody_officer_name
      FROM evidence e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN users u1 ON e.collected_by_id = u1.id
      LEFT JOIN users u2 ON e.current_custody_officer_id = u2.id
      ORDER BY e.collected_at DESC
    `;
    const result = await pgPool.query(query);
    return result.rows;
  }

  async getEvidenceByCase(caseId: string) {
    const query = `
      SELECT * FROM evidence WHERE case_id = $1 ORDER BY collected_at DESC
    `;
    const result = await pgPool.query(query, [caseId]);
    return result.rows;
  }

  async verifyEvidenceHash(evidenceId: string, providedHash: string) {
    const query = `SELECT id, evidence_code, hash_sha256 FROM evidence WHERE id = $1`;
    const result = await pgPool.query(query, [evidenceId]);
    if (result.rows.length === 0) return null;

    const storedHash = result.rows[0].hash_sha256;
    const isTamperFree = storedHash.toLowerCase() === providedHash.toLowerCase();

    return {
      evidence_id: evidenceId,
      stored_hash: storedHash,
      provided_hash: providedHash,
      is_valid: isTamperFree,
      status: isTamperFree ? "VERIFIED_INTEGRITY" : "HASH_MISMATCH_ALERT",
    };
  }
}

export const evidenceService = new EvidenceService();
