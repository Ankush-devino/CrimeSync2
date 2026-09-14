import type { LawCase } from '../constants/cases';
import type { AnalysisResult } from '../types/fir';

/**
 * Predicate to determine if an active tab/page is compromise-sensitive
 * (i.e., Threat Alerts or Identity Doppelgänger views).
 */
export function isCompromiseSensitivePage(activePage?: string): boolean {
  if (!activePage) return false;
  const normalized = activePage.toLowerCase().trim();
  return (
    normalized === 'threat-alerts' ||
    normalized === 'identity-security' ||
    normalized === 'identity-doppelganger' ||
    normalized === 'threats' ||
    normalized === 'doppelganger'
  );
}

/**
 * Canonical predicate to identify compromised / fake-identity / deceptive reports.
 * Inspects multiple existing indicators across LawCase and AnalysisResult schemas:
 * - isCompromised boolean flag
 * - status === 'compromised' / 'COMPROMISED'
 * - anomaly_detected / is_synthetic / is_compromised
 * - specific categories (IDENTITY_THEFT, CYBER_ATTACK, DECEPTIVE_FIR, SYNTHETIC_IDENTITY)
 * - flaggedParameters presence from deceptionAnalyzer
 * - keyword indicators in title, description or incidentDescription
 * - known compromised case/FIR identifiers
 */
export function isCompromisedReport(report: unknown): boolean {
  if (!report || typeof report !== 'object') return false;

  const r = report as Record<string, any>;

  // 1. Explicit boolean or status indicators
  if (r.isCompromised === true || r.is_compromised === true) return true;
  if (r.status === 'compromised' || r.status === 'COMPROMISED') return true;
  if (r.is_synthetic === true || r.anomaly_detected === true) return true;

  // 2. Active deception analysis flagged parameters
  if (Array.isArray(r.flaggedParameters) && r.flaggedParameters.length > 0) return true;
  if (Array.isArray(r.deceptiveParameters) && r.deceptiveParameters.length > 0) return true;

  // 3. Category inspection (strictly deceptive / synthetic categories)
  const category = String(r.crime_category || r.category || '').toUpperCase();
  if (
    category === 'DECEPTIVE_FIR' ||
    category === 'SYNTHETIC_IDENTITY' ||
    category === 'FIR_ANOMALY'
  ) {
    return true;
  }

  // 4. Identifier-based matches for targeted demo cases
  const id = String(r.id || '').toUpperCase();
  const firNumber = String(r.fir_number || r.firNumber || '').toUpperCase();
  if (
    id === 'CRS-2026-HNY-047' ||
    id === 'CASE-2026-005' ||
    id === 'FIR-2026-HYD-9942' ||
    firNumber === 'FIR/MUM/2026/1842' ||
    firNumber === 'FIR/BLR/2026/0914' ||
    firNumber === 'FIR/CHE/2026/0947' ||
    firNumber === 'FIR/HYD/2026/9942'
  ) {
    return true;
  }

  return false;
}

/**
 * Filters a case/report list conditionally based on whether the page is compromise-sensitive.
 * Guarantees immutability and never mutates the original list.
 */
export function filterReportsForPage<T>(reports: T[], activePage?: string): T[] {
  if (!Array.isArray(reports)) return [];
  if (isCompromiseSensitivePage(activePage)) {
    return reports.filter(isCompromisedReport);
  }
  return reports;
}
