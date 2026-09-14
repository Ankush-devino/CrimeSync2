import type { FIRCase, AnalysisResult } from '../types/fir';

/**
 * City coordinates / distance matrix reference (in kilometers)
 * Used to detect impossible transit velocity between incident and biometric checkpoints.
 */
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  hyderabad: { bengaluru: 570, delhi: 1580, mumbai: 710, kolkata: 1490, chennai: 630, pune: 560, ahmedabad: 1200 },
  bengaluru: { hyderabad: 570, delhi: 2150, mumbai: 980, kolkata: 1870, chennai: 350, pune: 840, ahmedabad: 1500 },
  mumbai: { delhi: 1400, bengaluru: 980, hyderabad: 710, kolkata: 1960, chennai: 1340, pune: 150, ahmedabad: 530 },
  delhi: { mumbai: 1400, bengaluru: 2150, hyderabad: 1580, kolkata: 1500, chennai: 2200, pune: 1440, ahmedabad: 950 },
  kolkata: { delhi: 1500, mumbai: 1960, bengaluru: 1870, hyderabad: 1490, chennai: 1670, pune: 1880, ahmedabad: 2080 },
  chennai: { bengaluru: 350, hyderabad: 630, mumbai: 1340, delhi: 2200, kolkata: 1670, pune: 1190, ahmedabad: 1830 },
  pune: { mumbai: 150, hyderabad: 560, bengaluru: 840, delhi: 1440, kolkata: 1880, chennai: 1190, ahmedabad: 660 },
  ahmedabad: { mumbai: 530, delhi: 950, hyderabad: 1200, bengaluru: 1500, kolkata: 2080, chennai: 1830, pune: 660 },
};

const KNOWN_CITIES = ['hyderabad', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'kolkata', 'chennai', 'pune', 'ahmedabad', 'surat', 'jaipur', 'gurugram', 'noida'];

const JURISDICTION_CODES: Record<string, string[]> = {
  hyd: ['hyderabad', 'telangana', 'ts', 'cyberabad', 'rachakonda'],
  blr: ['bengaluru', 'bangalore', 'karnataka', 'ka'],
  mum: ['mumbai', 'maharashtra', 'mh', 'bkc', 'bandra', 'nariman'],
  del: ['delhi', 'new delhi', 'dl', 'connaught', 'ncr'],
  kol: ['kolkata', 'west bengal', 'wb', 'salt lake'],
  che: ['chennai', 'tamil nadu', 'tn'],
  pun: ['pune', 'maharashtra', 'mh'],
  ahm: ['ahmedabad', 'gujarat', 'gj'],
};

/**
 * Normalizes and extracts city identifier from a location string.
 */
function extractCity(locationStr: string): string | null {
  const normalized = locationStr.toLowerCase();
  for (const city of KNOWN_CITIES) {
    if (normalized.includes(city)) {
      return city === 'bangalore' ? 'bengaluru' : city;
    }
  }
  return null;
}

/**
 * Parses time strings in formats like "14:00", "03:15 IST", "14:05:00", or ISO strings into minutes from midnight.
 */
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;

  // Clean time string from timezone tags (e.g. "03:15 IST" -> "03:15")
  const cleanStr = timeStr.replace(/\b(IST|UTC|GMT|AM|PM)\b/gi, '').trim();

  const timeMatch = cleanStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      return hours * 60 + minutes;
    }
  }

  // Fallback ISO timestamp parse
  const parsedDate = new Date(timeStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.getHours() * 60 + parsedDate.getMinutes();
  }

  return null;
}

/**
 * Calculates estimated travel distance in kilometers between two location strings.
 */
function estimateDistanceKm(locA: string, locB: string): number {
  const cityA = extractCity(locA);
  const cityB = extractCity(locB);

  if (!cityA || !cityB) {
    // If exact cities cannot be resolved, check if location strings match directly
    return locA.trim().toLowerCase() === locB.trim().toLowerCase() ? 0 : 300;
  }

  if (cityA === cityB) {
    return 0;
  }

  if (CITY_DISTANCES[cityA] && CITY_DISTANCES[cityA][cityB] !== undefined) {
    return CITY_DISTANCES[cityA][cityB];
  }

  if (CITY_DISTANCES[cityB] && CITY_DISTANCES[cityB][cityA] !== undefined) {
    return CITY_DISTANCES[cityB][cityA];
  }

  return 500; // Default inter-city distance fallback
}

/**
 * Pure evaluation function for the FIR Deception Detection System.
 * Performs rule-based cross-parameter anomaly checks:
 *  1. Velocity / Spatio-Temporal Physical Travel Feasibility Check
 *  2. Temporal Chronology Consistency Check
 *  3. Jurisdictional & Officer Consistency Check
 *
 * @param fir - The FIRCase object to evaluate.
 * @returns AnalysisResult containing compromised status, confidence score, and flagged parameters.
 */
export function analyzeFIRCase(fir: FIRCase): AnalysisResult {
  const flaggedParameters: string[] = [];

  const incidentTimeMin = parseTimeToMinutes(fir.timestamp);
  const biometricTimeMin = parseTimeToMinutes(fir.biometricTimestamp || fir.timestamp);

  // -------------------------------------------------------------
  // 1. VELOCITY / SPATIO-TEMPORAL TRAVEL FEASIBILITY CHECK
  // -------------------------------------------------------------
  const distanceKm = estimateDistanceKm(fir.location, fir.biometricLocation);

  if (distanceKm > 0) {
    if (incidentTimeMin !== null && biometricTimeMin !== null) {
      const timeDeltaMinutes = Math.abs(biometricTimeMin - incidentTimeMin);
      const hoursDelta = timeDeltaMinutes / 60;

      // Max commercial aviation velocity threshold: ~900 km/h (including airport transit)
      // Realistic ground/urban transit threshold: ~120 km/h
      const requiredSpeedKmh = hoursDelta > 0 ? Math.round(distanceKm / hoursDelta) : Infinity;

      if (timeDeltaMinutes <= 15 && distanceKm >= 100) {
        flaggedParameters.push(
          `Impossible Transit Velocity: Incident in ${fir.location} (${fir.timestamp}) but Biometric Check in ${fir.biometricLocation} (${fir.biometricTimestamp || fir.timestamp}) - ${distanceKm}km delta in ${timeDeltaMinutes} mins (${requiredSpeedKmh === Infinity ? 'Instant' : `${requiredSpeedKmh.toLocaleString()} km/h`} required travel speed)`
        );
      } else if (requiredSpeedKmh > 900) {
        flaggedParameters.push(
          `Supersonic Kinematic Anomaly: Required travel velocity of ${requiredSpeedKmh.toLocaleString()} km/h between ${fir.location} and ${fir.biometricLocation} exceeds physical civilian aviation threshold.`
        );
      } else if (timeDeltaMinutes <= 5 && distanceKm > 0) {
        flaggedParameters.push(
          `Biometric Geolocation Collision: Simultaneous presence logged at ${fir.location} and ${fir.biometricLocation} within a ${timeDeltaMinutes}-minute window.`
        );
      }
    } else {
      // Locations differ but time delta is negligible/unspecified
      const cityA = extractCity(fir.location);
      const cityB = extractCity(fir.biometricLocation);
      if (cityA && cityB && cityA !== cityB) {
        flaggedParameters.push(
          `Cross-Jurisdiction Location Discrepancy: Crime registered in ${fir.location} while biometric scan verified in ${fir.biometricLocation}.`
        );
      }
    }
  }

  // -------------------------------------------------------------
  // 2. TEMPORAL ANOMALY & CHRONOLOGY CHECK
  // -------------------------------------------------------------
  if (incidentTimeMin !== null && biometricTimeMin !== null) {
    const rawTimeDelta = biometricTimeMin - incidentTimeMin;

    // Check for impossible inverted chronology (e.g. biometric authentication claimed hours before crime start with claim of continuous alibi)
    if (rawTimeDelta < 0 && Math.abs(rawTimeDelta) > 720) {
      flaggedParameters.push(
        `Chronological Discontinuity: Inverted timestamp sequence detected between incident timeline (${fir.timestamp}) and biometric verification (${fir.biometricTimestamp}).`
      );
    }
  }

  // -------------------------------------------------------------
  // 3. JURISDICTIONAL & REPORTING OFFICER CONSISTENCY CHECK
  // -------------------------------------------------------------
  const officerStr = fir.reportingOfficer.toLowerCase();
  const firNumberStr = (fir.firNumber || fir.id).toLowerCase();
  const incidentLocStr = fir.location.toLowerCase();

  // Extract officer jurisdiction tag (e.g. HYD-CYB, MUM-CYB, DEL-IPS, BLR-CID, KOL-CID)
  const officerBadgeMatch = officerStr.match(/\b(hyd|blr|mum|del|kol|che|pun|ahm)-[a-z0-9]+\b/i);
  const firPrefixMatch = firNumberStr.match(/\bfir\/(hyd|blr|mum|del|kol|che|pun|ahm)\b/i);

  if (officerBadgeMatch && firPrefixMatch) {
    const officerJurisdiction = officerBadgeMatch[1].toLowerCase();
    const firJurisdiction = firPrefixMatch[1].toLowerCase();

    if (officerJurisdiction !== firJurisdiction) {
      flaggedParameters.push(
        `Jurisdictional Routing Conflict: Reporting officer badge (#${officerBadgeMatch[0].toUpperCase()}) jurisdiction does not match registered FIR station code (${firPrefixMatch[0].toUpperCase()}).`
      );
    }
  } else if (officerBadgeMatch) {
    const officerJurisdiction = officerBadgeMatch[1].toLowerCase();
    const allowedJurisdictionKeywords = JURISDICTION_CODES[officerJurisdiction] || [];

    const isLocationAligned = allowedJurisdictionKeywords.some(keyword => incidentLocStr.includes(keyword));
    if (!isLocationAligned && allowedJurisdictionKeywords.length > 0) {
      const cityOfIncident = extractCity(fir.location);
      if (cityOfIncident && !allowedJurisdictionKeywords.includes(cityOfIncident)) {
        flaggedParameters.push(
          `Unassigned Officer Jurisdiction: Officer (${fir.reportingOfficer}) stationed under ${officerJurisdiction.toUpperCase()} filing primary incident in ${fir.location} without inter-state transfer authorization.`
        );
      }
    }
  }

  // -------------------------------------------------------------
  // COMPOSE ANALYSIS RESULT
  // -------------------------------------------------------------
  const isCompromised = flaggedParameters.length > 0;

  let confidenceScore = 10;
  let anomalySummary = 'Nominal profile: Spatio-temporal and biometric parameters within standard operational thresholds.';

  if (isCompromised) {
    // Confidence score scaled between 88% and 99% based on number of triggered flags
    confidenceScore = Math.min(99, 85 + flaggedParameters.length * 5);
    anomalySummary = `Autonomous Doppelgänger AI engine flagged ${flaggedParameters.length} critical ${flaggedParameters.length === 1 ? 'anomaly' : 'anomalies'}: ${flaggedParameters[0]}`;
  }

  return {
    ...fir,
    isCompromised,
    status: isCompromised ? 'compromised' : 'nominal',
    flaggedParameters,
    confidenceScore,
    anomalySummary,
    firCase: fir,
  };
}

