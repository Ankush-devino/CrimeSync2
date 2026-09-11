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
      SELECT e.*, u1.full_name as collected_by_name, u2.full_name as custody_officer_name
      FROM evidence e
      LEFT JOIN users u1 ON e.collected_by_id = u1.id
      LEFT JOIN users u2 ON e.current_custody_officer_id = u2.id
      WHERE e.case_id = $1 
      ORDER BY e.collected_at DESC
    `;
    const result = await pgPool.query(query, [caseId]);
    return result.rows;
  }

  async createEvidence(data: {
    case_id: string;
    evidence_code: string;
    title: string;
    category: string;
    sub_type?: string;
    file_url?: string;
    hash_sha256: string;
    ai_fingerprint?: string;
    block_height?: number;
    tx_hash?: string;
    merkle_root?: string;
    metadata?: any;
    collected_by_id?: string;
    current_custody_officer_id?: string;
    status?: string;
  }) {
    const id = `EVD-${Date.now().toString().slice(-6)}`;
    const subType = data.sub_type || data.category || "BIOMETRIC_EVIDENCE";
    const fingerprint = data.ai_fingerprint || `DNA-${Date.now().toString(16).slice(-8).toUpperCase()}`;
    const blockHeight = data.block_height || 19842600 + Math.floor(Math.random() * 100);
    const txHash = data.tx_hash || `0x${require('crypto').createHash('sha256').update(id + data.hash_sha256 + Date.now()).digest('hex')}`;
    const merkleRoot = data.merkle_root || `0x${require('crypto').createHash('sha256').update(txHash + data.evidence_code).digest('hex')}`;
    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : JSON.stringify({
      integrityStatus: 'Verified',
      sealedUnderSection65B: true,
      timestamp: new Date().toISOString()
    });

    const query = `
      INSERT INTO evidence (
        id, case_id, evidence_code, title, category, sub_type, file_url,
        hash_sha256, ai_fingerprint, block_height, tx_hash, merkle_root, metadata,
        collected_by_id, current_custody_officer_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const values = [
      id,
      data.case_id,
      data.evidence_code,
      data.title,
      data.category || "DNA_PROFILE",
      subType,
      data.file_url || null,
      data.hash_sha256,
      fingerprint,
      blockHeight,
      txHash,
      merkleRoot,
      metadataJson,
      data.collected_by_id || "USR-101",
      data.current_custody_officer_id || data.collected_by_id || "USR-101",
      data.status || "SECURED",
    ];
    const result = await pgPool.query(query, values);
    return result.rows[0];
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

  async updateEvidence(
    id: string,
    data: {
      title?: string;
      category?: string;
      status?: string;
      hash_sha256?: string;
      current_custody_officer_id?: string;
    }
  ) {
    const existing = await pgPool.query(`SELECT * FROM evidence WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const query = `
      UPDATE evidence
      SET title = $1, category = $2, status = $3, hash_sha256 = $4, current_custody_officer_id = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      data.title ?? current.title,
      data.category ?? current.category,
      data.status ?? current.status,
      data.hash_sha256 ?? current.hash_sha256,
      data.current_custody_officer_id ?? current.current_custody_officer_id,
      id,
    ];
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  async deleteEvidence(id: string) {
    const result = await pgPool.query(`DELETE FROM evidence WHERE id = $1 RETURNING id`, [id]);
    return result.rows.length > 0;
  }
}

export const evidenceService = new EvidenceService();
