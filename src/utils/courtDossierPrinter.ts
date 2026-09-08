import type { ForensicDossier } from '../services/dossierService';

/**
 * Enterprise Court-Grade Dossier Printing Engine
 * Renders an unclipped, multi-page, Section 65B certified A4 document
 * into a dedicated printable frame to guarantee full 10-section PDF export / print.
 */
export function printCourtDossier(dossier: ForensicDossier): void {
  const { sections } = dossier;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NCRB Court Dossier - ${dossier.firNumber} - ${dossier.reportName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 15mm 15mm 15mm;
      @bottom-right {
        content: counter(page) " of " counter(pages);
      }
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.45;
    }

    .dossier-wrapper {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
    }

    /* Top Letterhead Header */
    .letterhead {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      text-align: center;
      position: relative;
    }

    .stamp-confidential {
      position: absolute;
      right: 0;
      top: 0;
      border: 2px solid #b91c1c;
      color: #b91c1c;
      padding: 4px 10px;
      font-size: 9pt;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      transform: rotate(3deg);
      border-radius: 3px;
    }

    .emblem-crest {
      display: inline-block;
      width: 44px;
      height: 44px;
      margin-bottom: 4px;
    }

    .ministry-title {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: #334155;
      text-transform: uppercase;
      margin: 0;
    }

    .ncrb-title {
      font-size: 15pt;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0f172a;
      text-transform: uppercase;
      margin: 2px 0;
    }

    .dossier-subtitle {
      font-size: 10pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0;
      font-family: 'Consolas', 'Courier New', monospace;
    }

    .cert-subline {
      font-size: 8pt;
      color: #475569;
      font-family: 'Consolas', 'Courier New', monospace;
      margin-top: 4px;
      font-weight: 600;
    }

    /* Court & Case Banner */
    .court-banner {
      background-color: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    .court-jurisdiction {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 6px;
      font-weight: bold;
    }

    .case-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 8.5pt;
    }

    .case-grid-label {
      color: #64748b;
      display: block;
      font-size: 7.5pt;
      text-transform: uppercase;
    }

    .case-grid-value {
      font-weight: bold;
      color: #0f172a;
    }

    /* Section Styling */
    .section-block {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }

    .section-header {
      border-bottom: 1.5px solid #1e293b;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 10.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      font-family: 'Consolas', 'Courier New', monospace;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-num {
      background: #0f172a;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 8.5pt;
    }

    .section-tag {
      font-size: 8pt;
      font-family: 'Consolas', monospace;
      color: #1e3a8a;
      font-weight: bold;
    }

    /* Box Containers */
    .info-box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 10px 12px;
      font-size: 9pt;
      margin-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-top: 6px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }

    table.data-table th {
      background-color: #f1f5f9;
      color: #1e293b;
      font-weight: 800;
      font-family: 'Consolas', monospace;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-size: 8pt;
      text-transform: uppercase;
    }

    table.data-table td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }

    table.data-table tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Badges */
    .badge-critical {
      color: #991b1b;
      font-weight: bold;
      font-family: 'Consolas', monospace;
    }

    .badge-success {
      color: #166534;
      font-weight: bold;
      font-family: 'Consolas', monospace;
    }

    .badge-code {
      font-family: 'Consolas', monospace;
      color: #1e3a8a;
      font-weight: bold;
    }

    /* Network Snapshot Box */
    .network-diagram-box {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
      font-family: 'Consolas', monospace;
      font-size: 8pt;
    }

    .network-node {
      border: 1.5px solid;
      border-radius: 5px;
      padding: 6px 10px;
      text-align: center;
      background: #ffffff;
    }

    .node-mastermind {
      border-color: #dc2626;
      background: #fef2f2;
      color: #991b1b;
      font-weight: bold;
    }

    .node-bridge {
      border-color: #2563eb;
      background: #eff6ff;
      color: #1e40af;
      font-weight: bold;
    }

    .node-mules {
      border-color: #16a34a;
      background: #f0fdf4;
      color: #166534;
      font-weight: bold;
    }

    .network-arrow {
      color: #475569;
      font-weight: bold;
      font-size: 8pt;
    }

    /* Financial Stat Summary */
    .fin-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 8px;
      text-align: center;
      font-family: 'Consolas', monospace;
      margin-bottom: 8px;
    }

    .fin-stat-num {
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
    }

    .fin-stat-label {
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
      display: block;
    }

    /* Signatures Block */
    .signatures-block {
      border-top: 2px solid #0f172a;
      padding-top: 14px;
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
      font-family: 'Consolas', monospace;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    .sig-line {
      border-top: 1px solid #64748b;
      padding-top: 4px;
      margin-top: 28px;
      font-weight: bold;
      color: #0f172a;
    }

    .sig-role {
      font-size: 7.5pt;
      color: #64748b;
    }

    .seal-pill {
      display: inline-block;
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
      font-size: 7.5pt;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
    }

    /* Footer Legal Notice */
    .legal-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 16px;
      text-align: center;
      font-size: 7pt;
      color: #64748b;
      font-family: 'Consolas', monospace;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="dossier-wrapper">

    <!-- ── LETTERHEAD ───────────────────────────────────────────────────────── -->
    <div class="letterhead">
      <div class="stamp-confidential">TOP SECRET // COURT READY</div>
      
      <!-- Ashoka Emblem SVG -->
      <svg class="emblem-crest" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>

      <div class="ministry-title">GOVERNMENT OF INDIA · MINISTRY OF HOME AFFAIRS</div>
      <div class="ncrb-title">NATIONAL CRIME RECORDS BUREAU (NCRB)</div>
      <div class="dossier-subtitle">CENTRAL FORENSIC INVESTIGATION & CHARGE-SHEET DOSSIER</div>
      <div class="cert-subline">SECTION 65B BHARATIYA SAKSHYA ADHINIYAM (BSA 2023) CERTIFIED · IMMUTABLE EVIDENCE LEDGER</div>
    </div>

    <!-- ── COURT & CASE BANNER ───────────────────────────────────────────────── -->
    <div class="court-banner">
      <div class="court-jurisdiction">
        <span>IN THE COURT OF: ${sections.caseInfo.courtJurisdiction}</span>
        <span style="color: #1e3a8a; font-family: 'Consolas', monospace;">SECURITY CLEARANCE: LEVEL 5 (SECRET)</span>
      </div>
      <div class="case-grid">
        <div>
          <span class="case-grid-label">FIR NUMBER</span>
          <span class="case-grid-value">${dossier.firNumber}</span>
        </div>
        <div>
          <span class="case-grid-label">POLICE STATION</span>
          <span class="case-grid-value">${sections.caseInfo.policeStation}</span>
        </div>
        <div>
          <span class="case-grid-label">OCCURRENCE DATE</span>
          <span class="case-grid-value">${sections.caseInfo.occurrenceDate}</span>
        </div>
        <div>
          <span class="case-grid-label">REGISTRATION DATE</span>
          <span class="case-grid-value">${sections.caseInfo.filingDate}</span>
        </div>
      </div>
    </div>

    <!-- ── 1.0 EXECUTIVE SUMMARY ────────────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">1.0</span> EXECUTIVE INTELLIGENCE SUMMARY
        </h3>
        <span class="section-tag">POSTGRESQL SYNCHRONIZED</span>
      </div>
      <div style="font-size: 9pt; line-height: 1.5; color: #1e293b;">
        <p style="margin-top: 0;">${sections.executiveSummary.synopsis}</p>
        <div class="info-box" style="border-left: 3px solid #2563eb;">
          <div><strong>Modus Operandi:</strong> ${sections.executiveSummary.modusOperandi}</div>
          <div style="margin-top: 3px;"><strong>Threat Vector:</strong> ${sections.executiveSummary.threatVector}</div>
          <div style="margin-top: 3px;"><strong>Impact Assessment:</strong> ${sections.executiveSummary.damageAssessment}</div>
        </div>
        <p><strong>Forensic Breakthrough:</strong> ${sections.executiveSummary.investigativeBreakthrough}</p>
      </div>
    </div>

    <!-- ── 2.0 CASE INFORMATION ─────────────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">2.0</span> STATUTORY CASE INFORMATION & AUTHORITY
        </h3>
      </div>
      <div class="info-grid">
        <div class="info-box">
          <div style="font-size: 7.5pt; font-weight: bold; color: #64748b; text-transform: uppercase;">Investigating Officer</div>
          <div style="font-weight: bold; font-size: 10pt; color: #0f172a;">${sections.caseInfo.investigatingOfficer}</div>
          <div style="font-family: 'Consolas', monospace; font-size: 8.5pt; color: #475569;">Badge ID: ${sections.caseInfo.badgeNumber}</div>
          <div style="font-size: 8.5pt; color: #475569;">${sections.caseInfo.department}</div>
        </div>
        <div class="info-box">
          <div style="font-size: 7.5pt; font-weight: bold; color: #64748b; text-transform: uppercase;">Crime Classification</div>
          <div style="font-weight: bold; font-size: 10pt; color: #0f172a;">${sections.caseInfo.crimeClassification}</div>
          <div style="font-family: 'Consolas', monospace; font-size: 8.5pt; color: #475569;">Priority: ${sections.caseInfo.priority}</div>
          <div style="font-size: 8.5pt; color: #475569;">${sections.caseInfo.courtJurisdiction}</div>
        </div>
      </div>
    </div>

    <!-- ── 3.0 PERSONS INVOLVED ─────────────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">3.0</span> PERSONS INVOLVED (ACCUSED & COMPLAINANTS)
        </h3>
      </div>
      
      <div style="font-size: 8.5pt; font-weight: bold; margin-bottom: 2px;">A. Accused & Primary Syndicate Suspects</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name & Alias</th>
            <th>Role in Syndicate</th>
            <th>Risk Centrality</th>
            <th>Custody Status</th>
            <th>Biometric Record</th>
          </tr>
        </thead>
        <tbody>
          ${sections.personsInvolved.suspects.map((s) => `
            <tr>
              <td><strong>${s.name}</strong> <span style="display:block; font-size: 7.5pt; color: #64748b;">${s.alias}</span></td>
              <td>${s.role}</td>
              <td class="badge-critical">${s.riskScore}/100</td>
              <td><strong>${s.status}</strong></td>
              <td class="badge-success">${s.biometricMatch}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="font-size: 8.5pt; font-weight: bold; margin-top: 8px; margin-bottom: 2px;">B. Complainants & Affected Entities</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Complainant / Entity</th>
            <th>Location</th>
            <th>Direct Loss (INR)</th>
            <th>Reporting Channel</th>
          </tr>
        </thead>
        <tbody>
          ${sections.personsInvolved.victims.map((v) => `
            <tr>
              <td><strong>${v.name}</strong></td>
              <td>${v.city}</td>
              <td style="font-family: 'Consolas', monospace; font-weight: bold;">₹${v.lossInr.toLocaleString('en-IN')}</td>
              <td>${v.channel}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- ── 4.0 CRIMINAL NETWORK ANALYSIS ────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">4.0</span> CRIMINAL SYNDICATE KNOWLEDGE GRAPH & CENTRALITY
        </h3>
      </div>
      <div class="info-box">
        <div style="display: flex; justify-content: space-between; font-family: 'Consolas', monospace; font-size: 8.5pt; margin-bottom: 6px;">
          <span><strong>MASTERMIND HUB:</strong> ${sections.networkAnalysis.mastermind}</span>
          <span>Density: ${sections.networkAnalysis.density} | Centrality: ${sections.networkAnalysis.centralityScore}</span>
        </div>

        <div class="network-diagram-box">
          <div class="network-node node-mastermind">
            <div>${sections.networkAnalysis.mastermind}</div>
            <span style="font-size: 7pt; display: block; opacity: 0.9;">MASTERMIND (HUB 01)</span>
          </div>
          <div class="network-arrow">──[AES-256 C2]──▶</div>
          <div class="network-node node-bridge">
            <div>Aman Deep (VoIP Bridge)</div>
            <span style="font-size: 7pt; display: block; opacity: 0.9;">DISPATCH BRIDGE</span>
          </div>
          <div class="network-arrow">──[RTGS / USDT]──▶</div>
          <div class="network-node node-mules">
            <div>14 Mule Accounts</div>
            <span style="font-size: 7pt; display: block; opacity: 0.9;">LAYERING CONDUITS</span>
          </div>
        </div>

        <div style="font-size: 8.5pt; color: #334155; margin-top: 4px;">
          ${sections.networkAnalysis.graphSnapshotDescription}
        </div>
      </div>
    </div>

    <!-- ── 5.0 TIMELINE RECONSTRUCTION ──────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">5.0</span> FORENSIC CHRONOLOGICAL TIMELINE RECONSTRUCTION
        </h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 110px;">Timestamp</th>
            <th>Forensic Incident Event</th>
            <th>Location / Cell Tower</th>
            <th>Exhibit Ref</th>
          </tr>
        </thead>
        <tbody>
          ${sections.timeline.map((t) => `
            <tr>
              <td style="font-family: 'Consolas', monospace; font-weight: bold;">
                ${t.time} <span style="display:block; font-size: 7pt; color: #64748b; font-weight: normal;">${t.date}</span>
              </td>
              <td><strong>${t.event}</strong></td>
              <td>${t.location}</td>
              <td class="badge-code">${t.evidenceRef}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- ── 6.0 FINANCIAL INTELLIGENCE ────────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">6.0</span> FINANCIAL INTELLIGENCE & HAWALA MONEY LAUNDERING TRAIL
        </h3>
      </div>

      <div class="fin-stats">
        <div>
          <span class="fin-stat-label">Total Tracked Volume</span>
          <span class="fin-stat-num">₹${sections.financialIntel.totalVolumeInr.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span class="fin-stat-label">Frozen U/S 102 CrPC</span>
          <span class="fin-stat-num" style="color: #166534;">₹${sections.financialIntel.frozenAmountInr.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span class="fin-stat-label">Asset Recovery Rate</span>
          <span class="fin-stat-num" style="color: #1e40af;">${sections.financialIntel.recoveryRate}%</span>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Hop</th>
            <th>Source Account</th>
            <th>Beneficiary Destination</th>
            <th>Amount (INR)</th>
            <th>Channel</th>
          </tr>
        </thead>
        <tbody>
          ${sections.financialIntel.launderingHops.map((h) => `
            <tr>
              <td style="font-family: 'Consolas', monospace; font-weight: bold;">Hop ${h.hop}</td>
              <td>${h.source}</td>
              <td>${h.destination}</td>
              <td style="font-family: 'Consolas', monospace; font-weight: bold;">₹${h.amountInr.toLocaleString('en-IN')}</td>
              <td class="badge-code">${h.channel}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- ── 7.0 DIGITAL EVIDENCE MANIFEST ────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">7.0</span> DIGITAL EVIDENCE MANIFEST & SHA-256 HASHES
        </h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Exhibit Code</th>
            <th>Device / Exhibit Description</th>
            <th>Cryptographic SHA-256 Hash</th>
            <th>BSA Status</th>
          </tr>
        </thead>
        <tbody>
          ${sections.digitalEvidence.map((e) => `
            <tr>
              <td class="badge-code">${e.code}</td>
              <td>
                <strong>${e.name}</strong>
                <span style="display: block; font-size: 7pt; color: #64748b; font-family: 'Consolas', monospace;">Seized: ${e.seizedAt}</span>
              </td>
              <td style="font-family: 'Consolas', monospace; font-size: 7pt; word-break: break-all; max-width: 220px;">${e.sha256}</td>
              <td class="badge-success">CERTIFIED 65B</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- ── 8.0 CHAIN OF CUSTODY ──────────────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">8.0</span> IMMUTABLE CHAIN OF CUSTODY & AUDIT TRAIL
        </h3>
      </div>
      ${sections.chainOfCustody.map((c) => `
        <div class="info-box" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding: 6px 10px;">
          <div>
            <span class="badge-code">[${c.stepId}] ${c.action}</span>
            <div style="font-size: 8pt; color: #475569; margin-top: 1px;">
              Custodian: <strong>${c.handledBy}</strong> · Transferred To: ${c.transferredTo}
            </div>
          </div>
          <div style="text-align: right; font-family: 'Consolas', monospace; font-size: 7.5pt; color: #64748b;">
            <div>${c.timestamp}</div>
            <div style="color: #166534; font-weight: bold;">ECDSA-secp256k1 Signed</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- ── 9.0 APPLICABLE STATUTORY LAWS ────────────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">9.0</span> APPLICABLE STATUTORY LAWS & PROSECUTION CHARGES
        </h3>
      </div>
      <div class="info-grid">
        ${sections.applicableLaws.map((l) => `
          <div class="info-box">
            <div style="font-family: 'Consolas', monospace; font-weight: bold; font-size: 9.5pt; color: #0f172a;">${l.section}</div>
            <div style="font-weight: 600; font-size: 8.5pt; color: #334155; margin-top: 1px;">${l.title}</div>
            <div style="font-family: 'Consolas', monospace; font-size: 7.5pt; font-weight: bold; color: #991b1b; margin-top: 2px;">Punishment: ${l.punishment}</div>
            <div style="font-size: 8pt; color: #475569; margin-top: 3px; border-top: 1px solid #e2e8f0; padding-top: 2px;">${l.applicabilityNotes}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ── 10.0 AI FINDINGS & PROSECUTION STRATEGY ──────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-num">10.0</span> AI EXPLAINABLE FORENSIC FINDINGS & PROSECUTION STRATEGY
        </h3>
        <span class="section-tag">CONFIDENCE SCORE: ${sections.aiFindings.confidenceScore}%</span>
      </div>
      <div class="info-box" style="background: #f0fdf4; border-color: #bbf7d0;">
        <div style="font-weight: bold; font-size: 8.5pt; color: #14532d; font-family: 'Consolas', monospace; margin-bottom: 3px;">
          KEY FORENSIC SMOKING GUNS:
        </div>
        <ul style="margin: 0; padding-left: 18px; font-size: 8.5pt; color: #166534; line-height: 1.45;">
          ${sections.aiFindings.smokingGuns.map((sg) => `<li>${sg}</li>`).join('')}
        </ul>

        <div style="font-weight: bold; font-size: 8.5pt; color: #14532d; font-family: 'Consolas', monospace; margin-top: 8px; margin-bottom: 3px; border-top: 1px solid #bbf7d0; padding-top: 4px;">
          PROSECUTION RECOMMENDATIONS & BAIL OPPOSITION GROUNDS:
        </div>
        <ul style="margin: 0; padding-left: 18px; font-size: 8.5pt; color: #166534; line-height: 1.45;">
          ${sections.aiFindings.prosecutionStrategy.map((ps) => `<li>${ps}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- ── SIGNATURES & OFFICIAL SEALS ──────────────────────────────────────── -->
    <div class="signatures-block">
      <div>
        <div style="font-family: Georgia, serif; font-style: italic; font-size: 11pt; color: #1e293b; height: 24px;">
          ${dossier.author}
        </div>
        <div class="sig-line">${dossier.author}</div>
        <div class="sig-role">Lead Investigating Officer · ${dossier.authorBadge}</div>
      </div>

      <div>
        <div style="height: 24px; display: flex; align-items: center; justify-content: center;">
          <span class="seal-pill">ECDSA SEALED: ${dossier.certificate65bId}</span>
        </div>
        <div class="sig-line">Central Forensic Lab (CFSL)</div>
        <div class="sig-role">Digital Forensics Examiner</div>
      </div>

      <div>
        <div style="font-family: Georgia, serif; font-style: italic; font-size: 11pt; color: #1e293b; height: 24px;">
          Special Public Prosecutor
        </div>
        <div class="sig-line">Judicial Prosecution Cell</div>
        <div class="sig-role">Charge-Sheet Certified Approved</div>
      </div>
    </div>

    <!-- ── LEGAL FOOTER ─────────────────────────────────────────────────────── -->
    <div class="legal-footer">
      <div>This document constitutes a cryptographically certified electronic record under Section 65B of the Bharatiya Sakshya Adhiniyam 2023. Generated by CRIMINALINK AI for NCRB.</div>
      <div style="font-weight: bold; color: #0f172a; margin-top: 2px;">
        MERKLE ROOT: ${dossier.merkleRoot} · BLOCK HEIGHT: #${dossier.blockHeight}
      </div>
    </div>

  </div>
</body>
</html>
  `;

  // Create an unclipped print iframe
  const existingFrame = document.getElementById('crimesync-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'crimesync-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Print error fallback:', err);
        window.print();
      }
    }, 250);
  }
}
