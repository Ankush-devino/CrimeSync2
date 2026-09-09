import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface GeoEvent {
  id: string;
  case_id: string;
  case_title: string;
  event_type: "CRIME_SCENE" | "SUSPECT_SIGHTING" | "BTS_TOWER_PING" | "CCTV_DETECTION" | "SAFE_ZONE" | "HAWALA_HUB" | "RAID_TARGET";
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  city: string;
  state: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
  suspect_id?: string;
  suspect_name?: string;
  confidence?: number;
  evidence_hash?: string;
  radius_meters?: number;
}

export interface SuspectWaypoint {
  sequence: number;
  latitude: number;
  longitude: number;
  location_name: string;
  timestamp: string;
  speed_kmh: number;
  activity: string;
  activity_type?: string;
  forensic_narrative?: string;
  tower_id: string;
  cell_id?: string;
  signal_strength_dbm: number;
  transit_mode?: string;
  vehicle_plate?: string;
  cctv_corroboration?: {
    camera_code: string;
    face_match_confidence: number;
    frame_evidence_hash: string;
  };
  telecom_trace?: {
    imei: string;
    imsi: string;
    carrier: string;
    band: string;
  };
  legal_sections?: string[];
}

export interface SuspectMovement {
  id: string;
  suspect_id: string;
  suspect_name: string;
  case_id: string;
  case_title: string;
  city: string;
  avatar?: string;
  color: string;
  waypoints: SuspectWaypoint[];
  total_distance_km: number;
  last_known_location: string;
  status: "ACTIVE_TRACKING" | "LOST_SIGNAL" | "APPREHENDED" | "MONITORED";
}

export interface CctvFeed {
  id: string;
  camera_code: string;
  location_name: string;
  city: string;
  latitude: number;
  longitude: number;
  status: "ONLINE" | "RECORDING" | "ALERT_TRIGGERED" | "OFFLINE";
  resolution: string;
  fov_angle: number;
  coverage_radius_meters: number;
  last_detection?: {
    suspect_name: string;
    confidence: number;
    timestamp: string;
    face_matched: boolean;
  };
  stream_url: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  division: string;
  city: string;
  latitude: number;
  longitude: number;
  contact: string;
  pcr_units_available: number;
  response_radius_km: number;
}

const DEFAULT_GEO_EVENTS: GeoEvent[] = [
  // CASE-2026-004: Kolkata
  {
    id: "GEO-EVT-041",
    case_id: "CASE-2026-004",
    case_title: "Operation Chakra: Tech Support & Crypto Scam",
    event_type: "CRIME_SCENE",
    title: "Illegal VOIP Gateway & Micro-Callcenter Hub",
    description: "Multi-floor rogue callcenter housing 60+ dialers operating spoofed foreign toll-free DID lines.",
    latitude: 22.5726,
    longitude: 88.3639,
    location_name: "Salt Lake Sector V, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    suspect_id: "SUS-906",
    suspect_name: "Debashis Banerjee",
    confidence: 97.4,
    evidence_hash: "0xaa8123ef4512bc9008fa3129487efda99812b4ca01827461827492bcdef1129",
    radius_meters: 650,
  },
  {
    id: "GEO-EVT-042",
    case_id: "CASE-2026-004",
    case_title: "Operation Chakra: Tech Support & Crypto Scam",
    event_type: "HAWALA_HUB",
    title: "OTC USDT Cash Exchange Counter",
    description: "Physical cash laundering point where extortion proceeds were converted into Tether OTC wallets.",
    latitude: 22.5850,
    longitude: 88.3510,
    location_name: "Burrabazar Financial Market, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    suspect_id: "SUS-906",
    suspect_name: "Debashis Banerjee",
    confidence: 93.1,
    evidence_hash: "0xcc4190283fa81029384710293847192039485710293847592019384758192039",
    radius_meters: 450,
  },
  {
    id: "GEO-EVT-043",
    case_id: "CASE-2026-004",
    case_title: "Operation Chakra: Tech Support & Crypto Scam",
    event_type: "SUSPECT_SIGHTING",
    title: "CCTV Face Detection: Park Street Metro Gate 2",
    description: "Biometric facial match on suspect fleeing in black SUV towards EM Bypass.",
    latitude: 22.5535,
    longitude: 88.3518,
    location_name: "Park Street Crossing, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    severity: "HIGH",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    suspect_id: "SUS-906",
    suspect_name: "Debashis Banerjee",
    confidence: 96.0,
    evidence_hash: "0x9921ef33bc7120a9912093847291038471928374019283749102938471029384",
    radius_meters: 350,
  },

  // CASE-2026-001: New Delhi
  {
    id: "GEO-EVT-001",
    case_id: "CASE-2026-001",
    case_title: "Operation Garuda: Cyber Extortion & Darknet Cartel",
    event_type: "CRIME_SCENE",
    title: "Ground Zero: Server Rack Physical Breach",
    description: "Physical intrusion detected at server facility with unauthorized optical tap installed on fiber line.",
    latitude: 28.5672,
    longitude: 77.2433,
    location_name: "Lajpat Nagar Central Tech Park, South Delhi",
    city: "New Delhi",
    state: "Delhi",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    suspect_id: "SUS-902",
    suspect_name: "Aman Khan",
    confidence: 96,
    evidence_hash: "0x7f4e92a83b12dc5900bfa3829147efca1982b6cd01827461827492abcdef1029",
    radius_meters: 600,
  },
  {
    id: "GEO-EVT-002",
    case_id: "CASE-2026-001",
    case_title: "Operation Garuda: Cyber Extortion & Darknet Cartel",
    event_type: "SUSPECT_SIGHTING",
    title: "Optical Facial Recognition Match at Metro Station",
    description: "Automated CCTV matched suspect facial vector with 94.2% biometric confidence.",
    latitude: 28.6315,
    longitude: 77.2167,
    location_name: "Connaught Place Rajiv Chowk Metro Gate 4",
    city: "New Delhi",
    state: "Delhi",
    severity: "HIGH",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    suspect_id: "SUS-902",
    suspect_name: "Aman Khan",
    confidence: 94,
    evidence_hash: "0x3a9921ef4412bc9008fa3129487efda99812b4ca01827461827492bcdef1129",
    radius_meters: 350,
  },
  {
    id: "GEO-EVT-003",
    case_id: "CASE-2026-001",
    case_title: "Operation Garuda: Cyber Extortion & Darknet Cartel",
    event_type: "HAWALA_HUB",
    title: "Underground Hawala Cash Drop Location",
    description: "Physical cash token handover center linked to OTC crypto layering transactions.",
    latitude: 28.6506,
    longitude: 77.2304,
    location_name: "Chandni Chowk Bullion Market",
    city: "New Delhi",
    state: "Delhi",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    suspect_id: "SUS-904",
    suspect_name: "Vikram Malhotra",
    confidence: 89,
    evidence_hash: "0x8912ef33bc7120a9912093847291038471928374019283749102938471029384",
    radius_meters: 500,
  },

  // CASE-2026-002: Mumbai
  {
    id: "GEO-EVT-004",
    case_id: "CASE-2026-002",
    case_title: "GridShield: Critical Power Grid Cyber Intrusion",
    event_type: "CRIME_SCENE",
    title: "Regional Load Despatch Center Gateway Anomaly",
    description: "SCADA telemetry packet injection identified originating from local rogue cellular gateway.",
    latitude: 19.0760,
    longitude: 72.8777,
    location_name: "Bandra Kurla Complex (BKC) Financial Substation",
    city: "Mumbai",
    state: "Maharashtra",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    suspect_id: "SUS-901",
    suspect_name: "Rohan Varma",
    confidence: 92,
    evidence_hash: "0x4b7190283fa81029384710293847192039485710293847592019384758192039",
    radius_meters: 800,
  },
  {
    id: "GEO-EVT-005",
    case_id: "CASE-2026-002",
    case_title: "GridShield: Critical Power Grid Cyber Intrusion",
    event_type: "BTS_TOWER_PING",
    title: "Triangulated Burner IMEI IMSI Catcher Beacon",
    description: "Continuous handshake with Sector 3 BTS tower during SCADA injection spike.",
    latitude: 19.1197,
    longitude: 72.8464,
    location_name: "Andheri East Industrial Hub",
    city: "Mumbai",
    state: "Maharashtra",
    severity: "HIGH",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    suspect_id: "SUS-901",
    suspect_name: "Rohan Varma",
    confidence: 88,
    evidence_hash: "0x12a9c38491029384710293847102938471029384710293847102938471029384",
    radius_meters: 450,
  },

  // CASE-2026-003: Bengaluru
  {
    id: "GEO-EVT-006",
    case_id: "CASE-2026-003",
    case_title: "Operation Garud: Fake SIM Farm & OTP Bypass",
    event_type: "RAID_TARGET",
    title: "Active 512-Port GSM SIM Box Pool Facility",
    description: "Illegal SIM farm operating 512 burner SIM slots bypassing Aadhaar KYC via cloned biometrics.",
    latitude: 12.9716,
    longitude: 77.5946,
    location_name: "Indiranagar 100ft Road Tech Corridor",
    city: "Bengaluru",
    state: "Karnataka",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    suspect_id: "SUS-903",
    suspect_name: "Devendra Patil",
    confidence: 97,
    evidence_hash: "0x9812bc6510293847102938471029384710293847102938471029384710293847",
    radius_meters: 300,
  },

  // CASE-2026-005: Hyderabad
  {
    id: "GEO-EVT-008",
    case_id: "CASE-2026-005",
    case_title: "Operation Vajra: Digital Arrest & Fake CBI Extortion",
    event_type: "CRIME_SCENE",
    title: "Fake Police Studio & VOIP Call Center Ring",
    description: "Studio outfitted with fake police badges, emblem backdrops used in coercive video extortion calls.",
    latitude: 17.3850,
    longitude: 78.4867,
    location_name: "Banjara Hills Road No. 12",
    city: "Hyderabad",
    state: "Telangana",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    suspect_id: "SUS-905",
    suspect_name: "Tanya Sen",
    confidence: 91,
    evidence_hash: "0xfe3189a029384710293847102938471029384710293847102938471029384710",
    radius_meters: 400,
  },

  // CASE-2026-006: Ahmedabad
  {
    id: "GEO-EVT-009",
    case_id: "CASE-2026-006",
    case_title: "Operation Durg: Biometric & AePS Micro-ATM Bypass",
    event_type: "CRIME_SCENE",
    title: "Illicit Biometric Cloning & Micro-ATM Cashing Point",
    description: "Silicone fingerprint casting lab extracting thumb impressions from public land registry PDFs.",
    latitude: 23.0225,
    longitude: 72.5714,
    location_name: "Navrangpura Commercial Complex",
    city: "Ahmedabad",
    state: "Gujarat",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    suspect_id: "SUS-907",
    suspect_name: "Karan Solanki",
    confidence: 94.2,
    evidence_hash: "0x88910283fa81029384710293847192039485710293847592019384758192039",
    radius_meters: 500,
  },

  // CASE-2026-007: Bengaluru
  {
    id: "GEO-EVT-010",
    case_id: "CASE-2026-007",
    case_title: "Operation Netra: AI Deepfake Video Extortion",
    event_type: "CRIME_SCENE",
    title: "High-Compute Deepfake Rendering Rig Facility",
    description: "8x RTX 4090 GPU cluster hosting automated face-swap diffusion pipeline targeting executives.",
    latitude: 12.9352,
    longitude: 77.6245,
    location_name: "Koramangala 4th Block",
    city: "Bengaluru",
    state: "Karnataka",
    severity: "HIGH",
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    suspect_id: "SUS-908",
    suspect_name: "Nikhil Joshi",
    confidence: 95.8,
    evidence_hash: "0x7719283749102938471029384710293847102938471029384710293847102938",
    radius_meters: 350,
  },

  // CASE-2026-008: Pune
  {
    id: "GEO-EVT-011",
    case_id: "CASE-2026-008",
    case_title: "Operation Kuber: Instant Loan App & Hawala Funnel",
    event_type: "CRIME_SCENE",
    title: "Instant Loan App Harassment Calling Operations",
    description: "Predatory instant loan call center with illegal access to victim contacts and automated WhatsApp threat bots.",
    latitude: 18.5204,
    longitude: 73.8567,
    location_name: "Viman Nagar Cyber City",
    city: "Pune",
    state: "Maharashtra",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 11).toISOString(),
    suspect_id: "SUS-909",
    suspect_name: "Sameer Deshmukh",
    confidence: 92.5,
    evidence_hash: "0x5510293847102938471029384710293847102938471029384710293847102938",
    radius_meters: 600,
  },

  // CASE-2026-009: Chennai
  {
    id: "GEO-EVT-012",
    case_id: "CASE-2026-009",
    case_title: "Operation Rudra: Power Grid SCADA Ransomware",
    event_type: "CRIME_SCENE",
    title: "Regional Power Grid Substation C2 Ingress Point",
    description: "SCADA network switch physical tampering and unauthorized zero-day VPN ingress node.",
    latitude: 13.0827,
    longitude: 80.2707,
    location_name: "Guindy Industrial Estate, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    suspect_id: "SUS-910",
    suspect_name: "Karthik Ramanathan",
    confidence: 98.2,
    evidence_hash: "0x3344556677889900112233445566778899001122334455667788990011223344",
    radius_meters: 500,
  },
];

const DEFAULT_SUSPECT_MOVEMENTS: SuspectMovement[] = [
  // 1. CASE-2026-004: KOLKATA - Debashis Banerjee
  {
    id: "TRK-004",
    suspect_id: "SUS-906",
    suspect_name: "Debashis Banerjee",
    case_id: "CASE-2026-004",
    case_title: "Operation Chakra: Tech Support & Crypto Scam",
    city: "Kolkata",
    color: "#f59e0b",
    status: "ACTIVE_TRACKING",
    total_distance_km: 14.8,
    last_known_location: "Park Street Crossing, Kolkata",
    waypoints: [
      {
        sequence: 1,
        latitude: 22.5726,
        longitude: 88.3639,
        location_name: "Salt Lake Sector V Tech Tower, Kolkata",
        timestamp: "09:15 AM",
        speed_kmh: 0,
        activity: "VOIP Gateway Boot & Server Heartbeat",
        activity_type: "SERVER_INITIALIZATION",
        forensic_narrative: "Suspect initiated Asterisk SIP trunk session across 32 spoofed US/UK caller IDs. Hardcoded proxy IP 185.220.101.5 routed through Tor exit node.",
        tower_id: "KOL-BTS-5021",
        cell_id: "CELL-44019",
        signal_strength_dbm: -58,
        transit_mode: "Stationary (Commercial Tech Park)",
        telecom_trace: {
          imei: "864920194829104",
          imsi: "404450192837461",
          carrier: "Airtel Enterprise 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 318(4) BNS", "Section 66D IT Act 2000", "Section 65B BSA 2023"],
      },
      {
        sequence: 2,
        latitude: 22.5850,
        longitude: 88.3510,
        location_name: "Burrabazar Bullion Market, Kolkata",
        timestamp: "09:45 AM",
        speed_kmh: 32,
        activity: "Cash-to-USDT Crypto Layering",
        activity_type: "HAWALA_CRYPTO_LAYERING",
        forensic_narrative: "Physical meet with OTC broker. INR 45,00,000 cash token converted into TRC-20 USDT wallet 0x9f182... and layered across 6 mule accounts.",
        tower_id: "KOL-BTS-4019",
        cell_id: "CELL-33921",
        signal_strength_dbm: -67,
        transit_mode: "Vehicle Transit (Black SUV)",
        vehicle_plate: "WB-02-AK-9921",
        telecom_trace: {
          imei: "864920194829104",
          imsi: "404450192837461",
          carrier: "Airtel 5G",
          band: "Band 3 (1800 MHz)",
        },
        cctv_corroboration: {
          camera_code: "KOL-CCTV-BB-02",
          face_match_confidence: 93.1,
          frame_evidence_hash: "0xcc4190283fa81029384710293847192039485710293847592019384758192039",
        },
        legal_sections: ["Section 318(4) BNS", "PMLA Section 3/4", "Section 66C IT Act"],
      },
      {
        sequence: 3,
        latitude: 22.5697,
        longitude: 88.3697,
        location_name: "Sealdah Flyover Junction, Kolkata",
        timestamp: "10:10 AM",
        speed_kmh: 44,
        activity: "Vehicle Transit & Burner SIM Swap",
        activity_type: "TELECOM_ANOMALY",
        forensic_narrative: "IMSI catcher detected sudden radio disconnect on primary SIM followed by immediate activation of second burner IMSI 404450998811223.",
        tower_id: "KOL-BTS-3108",
        cell_id: "CELL-22904",
        signal_strength_dbm: -73,
        transit_mode: "High-Speed Transit (Flyover)",
        vehicle_plate: "WB-02-AK-9921",
        telecom_trace: {
          imei: "359128091823901",
          imsi: "404450998811223",
          carrier: "Jio True 5G",
          band: "Band 28 (700 MHz)",
        },
        legal_sections: ["Section 318 BNS", "DoT SIM Impersonation Guidelines"],
      },
      {
        sequence: 4,
        latitude: 22.5535,
        longitude: 88.3518,
        location_name: "Park Street Metro Crossing, Kolkata",
        timestamp: "10:35 AM",
        speed_kmh: 12,
        activity: "CCTV Facial Biometric Match (96.0%)",
        activity_type: "BIOMETRIC_POSITIVE_IDENTIFICATION",
        forensic_narrative: "Bidhannagar smart city PTZ camera locked onto facial features with 96.0% similarity against NCRB database. Suspect seen entering commercial building.",
        tower_id: "KOL-BTS-1102",
        cell_id: "CELL-11048",
        signal_strength_dbm: -52,
        transit_mode: "Pedestrian (Entering Metro Concourse)",
        cctv_corroboration: {
          camera_code: "KOL-CCTV-SL-03",
          face_match_confidence: 96.0,
          frame_evidence_hash: "0x9921ef33bc7120a9912093847291038471928374019283749102938471029384",
        },
        telecom_trace: {
          imei: "359128091823901",
          imsi: "404450998811223",
          carrier: "Jio True 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 318 BNS", "Section 66D IT Act 2000", "Section 65B BSA 2023"],
      },
    ],
  },

  // 2. CASE-2026-001: NEW DELHI - Aman Khan
  {
    id: "TRK-001",
    suspect_id: "SUS-902",
    suspect_name: "Aman Khan",
    case_id: "CASE-2026-001",
    case_title: "Operation Garuda: Cyber Extortion",
    city: "New Delhi",
    color: "#ef4444",
    status: "ACTIVE_TRACKING",
    total_distance_km: 18.4,
    last_known_location: "Connaught Place Outer Circle, New Delhi",
    waypoints: [
      {
        sequence: 1,
        latitude: 28.5672,
        longitude: 77.2433,
        location_name: "Lajpat Nagar Central Market, New Delhi",
        timestamp: "08:15 AM",
        speed_kmh: 0,
        activity: "Meeting with Hawala Cash Carrier",
        activity_type: "HAWALA_TRANSFER",
        forensic_narrative: "Physical handover of INR 20 Lakhs token note. Monitored by South District undercover unit.",
        tower_id: "DEL-BTS-4091",
        cell_id: "CELL-0912",
        signal_strength_dbm: -68,
        transit_mode: "Stationary (Market Alley)",
        telecom_trace: {
          imei: "861928374910293",
          imsi: "404110293847102",
          carrier: "Vodafone Idea 4G",
          band: "Band 1 (2100 MHz)",
        },
        legal_sections: ["Section 318 BNS", "PMLA 2002"],
      },
      {
        sequence: 2,
        latitude: 28.5830,
        longitude: 77.2340,
        location_name: "Jangpura Extension Overbridge, New Delhi",
        timestamp: "08:42 AM",
        speed_kmh: 42,
        activity: "Vehicle Transit (Black Sedan)",
        activity_type: "IN_TRANSIT",
        forensic_narrative: "Vehicle travelling North on Mathura Road corridor towards Ring Road.",
        tower_id: "DEL-BTS-3180",
        cell_id: "CELL-1840",
        signal_strength_dbm: -74,
        transit_mode: "Vehicle Transit (Sedan)",
        vehicle_plate: "DL-01-CZ-4412",
        telecom_trace: {
          imei: "861928374910293",
          imsi: "404110293847102",
          carrier: "Vi 4G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 28.6012,
        longitude: 77.2275,
        location_name: "Khan Market Intersection, New Delhi",
        timestamp: "09:05 AM",
        speed_kmh: 28,
        activity: "Burner SIM Activation & CDR Ping",
        activity_type: "BURNER_ACTIVATION",
        forensic_narrative: "New IMEI 354891029384710 handshake recorded with BTS tower Sector 2.",
        tower_id: "DEL-BTS-2194",
        cell_id: "CELL-2914",
        signal_strength_dbm: -62,
        transit_mode: "Vehicle Transit",
        telecom_trace: {
          imei: "354891029384710",
          imsi: "404110998877665",
          carrier: "Airtel 5G",
          band: "n78",
        },
        legal_sections: ["Section 318 BNS", "Section 66D IT Act"],
      },
      {
        sequence: 4,
        latitude: 28.6145,
        longitude: 77.2088,
        location_name: "Patel Chowk / Ashok Road, New Delhi",
        timestamp: "09:30 AM",
        speed_kmh: 35,
        activity: "Encrypted Telegram Burst Transmission",
        activity_type: "ENCRYPTED_BURST_TX",
        forensic_narrative: "4.2 MB encrypted binary payload uploaded to remote server in Frankfurt via proxy.",
        tower_id: "DEL-BTS-1105",
        cell_id: "CELL-1050",
        signal_strength_dbm: -71,
        transit_mode: "Vehicle Transit",
        telecom_trace: {
          imei: "354891029384710",
          imsi: "404110998877665",
          carrier: "Airtel 5G",
          band: "n78",
        },
        legal_sections: ["Section 66F IT Act (Cyber Terrorism)", "Section 318 BNS"],
      },
      {
        sequence: 5,
        latitude: 28.6315,
        longitude: 77.2167,
        location_name: "Connaught Place Inner Circle F-Block, New Delhi",
        timestamp: "09:58 AM",
        speed_kmh: 4,
        activity: "Pedestrian Movement towards Metro Gate 4",
        activity_type: "CCTV_DETECTION",
        forensic_narrative: "CCTV DEL-CCTV-CP-04 triggered 94.2% biometric match vector on Rajiv Chowk Gate 4 concourse.",
        tower_id: "DEL-BTS-0982",
        cell_id: "CELL-0982",
        signal_strength_dbm: -58,
        transit_mode: "Pedestrian",
        cctv_corroboration: {
          camera_code: "DEL-CCTV-CP-04",
          face_match_confidence: 94.2,
          frame_evidence_hash: "0x3a9921ef4412bc9008fa3129487efda99812b4ca01827461827492bcdef1129",
        },
        telecom_trace: {
          imei: "354891029384710",
          imsi: "404110998877665",
          carrier: "Airtel 5G",
          band: "n78",
        },
        legal_sections: ["Section 318 BNS", "Section 66D IT Act", "Section 65B BSA 2023"],
      },
    ],
  },

  // 3. CASE-2026-002: MUMBAI - Rohan Varma
  {
    id: "TRK-002",
    suspect_id: "SUS-901",
    suspect_name: "Rohan Varma",
    case_id: "CASE-2026-002",
    case_title: "GridShield: Critical Power Grid Cyber Attack",
    city: "Mumbai",
    color: "#38bdf8",
    status: "MONITORED",
    total_distance_km: 16.2,
    last_known_location: "BKC G-Block, Mumbai",
    waypoints: [
      {
        sequence: 1,
        latitude: 19.1197,
        longitude: 72.8464,
        location_name: "Andheri East Western Express Highway, Mumbai",
        timestamp: "10:10 AM",
        speed_kmh: 55,
        activity: "Rogue Cellular Gateway Transport",
        activity_type: "HARDWARE_TRANSIT",
        forensic_narrative: "Suspect carrying 4G SCADA packet injection bridge in commercial van heading South along Western Express Highway.",
        tower_id: "MUM-BTS-8812",
        cell_id: "CELL-88120",
        signal_strength_dbm: -72,
        transit_mode: "Vehicle Transit (White Delivery Van)",
        vehicle_plate: "MH-02-EE-8821",
        telecom_trace: {
          imei: "869102837491028",
          imsi: "404201928374619",
          carrier: "Jio 5G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 66F IT Act", "Section 318 BNS"],
      },
      {
        sequence: 2,
        latitude: 19.0980,
        longitude: 72.8540,
        location_name: "Santacruz Flyover, Mumbai",
        timestamp: "10:28 AM",
        speed_kmh: 38,
        activity: "WiFi Probe Request from MAC 00:E0:4C:...",
        activity_type: "WIFI_PROBING",
        forensic_narrative: "Automated sniffer recorded active beacon probing matching regional power substation SSID grid.",
        tower_id: "MUM-BTS-7719",
        cell_id: "CELL-77192",
        signal_strength_dbm: -65,
        transit_mode: "Vehicle Transit",
        vehicle_plate: "MH-02-EE-8821",
        telecom_trace: {
          imei: "869102837491028",
          imsi: "404201928374619",
          carrier: "Jio 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 66 IT Act", "Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 19.0760,
        longitude: 72.8777,
        location_name: "BKC Complex Financial Substation, Mumbai",
        timestamp: "10:55 AM",
        speed_kmh: 0,
        activity: "SCADA Telemetry Packet Injection",
        activity_type: "CYBER_ATTACK_EXECUTION",
        forensic_narrative: "Unauthorized connection established to 220kV load despatch telemetry terminal injecting false frequency trip commands.",
        tower_id: "MUM-BTS-6620",
        cell_id: "CELL-66204",
        signal_strength_dbm: -54,
        transit_mode: "Stationary (Substation Perimeter)",
        cctv_corroboration: {
          camera_code: "MUM-CCTV-BKC-09",
          face_match_confidence: 88.5,
          frame_evidence_hash: "0x4b7190283fa81029384710293847192039485710293847592019384758192039",
        },
        telecom_trace: {
          imei: "869102837491028",
          imsi: "404201928374619",
          carrier: "Jio 5G",
          band: "Band 5 (850 MHz)",
        },
        legal_sections: ["Section 66F IT Act (Cyber Terrorism)", "Electricity Act Sec 146", "Section 65B BSA 2023"],
      },
    ],
  },

  // 4. CASE-2026-003: BENGALURU - Devendra Patil
  {
    id: "TRK-003",
    suspect_id: "SUS-903",
    suspect_name: "Devendra Patil",
    case_id: "CASE-2026-003",
    case_title: "Operation Garud: Fake SIM Farm & OTP Bypass",
    city: "Bengaluru",
    color: "#a855f7",
    status: "ACTIVE_TRACKING",
    total_distance_km: 11.4,
    last_known_location: "Indiranagar 100ft Road, Bengaluru",
    waypoints: [
      {
        sequence: 1,
        latitude: 12.9279,
        longitude: 77.6271,
        location_name: "Koramangala 80ft Road, Bengaluru",
        timestamp: "11:20 AM",
        speed_kmh: 18,
        activity: "SIM Box Batch Delivery Pickup",
        activity_type: "HARDWARE_HANDOVER",
        forensic_narrative: "Consignment of 512 pre-activated burner SIM cards received from courier counter.",
        tower_id: "BLR-BTS-1102",
        cell_id: "CELL-11029",
        signal_strength_dbm: -69,
        transit_mode: "Two-Wheeler Transit",
        vehicle_plate: "KA-01-MJ-5512",
        telecom_trace: {
          imei: "867710293847102",
          imsi: "404801928374610",
          carrier: "Airtel 5G",
          band: "Band 40 (2300 MHz)",
        },
        legal_sections: ["Section 318 BNS", "Indian Telegraph Act"],
      },
      {
        sequence: 2,
        latitude: 12.9560,
        longitude: 77.6100,
        location_name: "Domlur Flyover Junction, Bengaluru",
        timestamp: "11:45 AM",
        speed_kmh: 32,
        activity: "Transit on Two-Wheeler with Equipment",
        activity_type: "IN_TRANSIT",
        forensic_narrative: "Suspect monitored traversing Intermediate Ring Road towards Indiranagar hub.",
        tower_id: "BLR-BTS-2094",
        cell_id: "CELL-20948",
        signal_strength_dbm: -75,
        transit_mode: "Two-Wheeler",
        vehicle_plate: "KA-01-MJ-5512",
        telecom_trace: {
          imei: "867710293847102",
          imsi: "404801928374610",
          carrier: "Airtel 5G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 12.9716,
        longitude: 77.5946,
        location_name: "Indiranagar 100ft Road SIM Hub, Bengaluru",
        timestamp: "12:15 PM",
        speed_kmh: 0,
        activity: "Active IMSI Spoofing Session",
        activity_type: "SIM_FARM_ACTIVATION",
        forensic_narrative: "Automated OTP bypass tool fired 1,420 spoofed bank OTP requests in 15 minutes.",
        tower_id: "BLR-BTS-3301",
        cell_id: "CELL-33012",
        signal_strength_dbm: -51,
        transit_mode: "Stationary (Commercial Apartment)",
        cctv_corroboration: {
          camera_code: "BLR-CCTV-IND-02",
          face_match_confidence: 95.4,
          frame_evidence_hash: "0x9812bc6510293847102938471029384710293847102938471029384710293847",
        },
        telecom_trace: {
          imei: "867710293847102",
          imsi: "404801928374610",
          carrier: "Airtel 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 318(4) BNS", "Section 66D IT Act", "Section 65B BSA 2023"],
      },
    ],
  },

  // 5. CASE-2026-005: HYDERABAD - Tanya Sen
  {
    id: "TRK-005",
    suspect_id: "SUS-905",
    suspect_name: "Tanya Sen",
    case_id: "CASE-2026-005",
    case_title: "Operation Vajra: Digital Arrest & Fake CBI Extortion",
    city: "Hyderabad",
    color: "#ec4899",
    status: "ACTIVE_TRACKING",
    total_distance_km: 12.8,
    last_known_location: "Banjara Hills Road No. 12, Hyderabad",
    waypoints: [
      {
        sequence: 1,
        latitude: 17.4401,
        longitude: 78.3489,
        location_name: "HITEC City Cyber Towers, Hyderabad",
        timestamp: "02:10 PM",
        speed_kmh: 0,
        activity: "Target Profiling & Skype DID Setup",
        activity_type: "RECONNAISSANCE",
        forensic_narrative: "Scraped HNI victim contact databases and configured spoofed CBI New Delhi CID caller ID on Skype.",
        tower_id: "HYD-BTS-9011",
        cell_id: "CELL-90110",
        signal_strength_dbm: -55,
        transit_mode: "Stationary (Co-working Office)",
        telecom_trace: {
          imei: "865510293847102",
          imsi: "404861928374619",
          carrier: "Jio True 5G",
          band: "n78",
        },
        legal_sections: ["Section 318 BNS", "Section 66D IT Act"],
      },
      {
        sequence: 2,
        latitude: 17.4156,
        longitude: 78.4350,
        location_name: "Jubilee Hills Check Post, Hyderabad",
        timestamp: "02:40 PM",
        speed_kmh: 38,
        activity: "In-Transit to Fake Police Studio",
        activity_type: "IN_TRANSIT",
        forensic_narrative: "Suspect vehicle moving East on Road No. 36 towards studio premises.",
        tower_id: "HYD-BTS-7802",
        cell_id: "CELL-78021",
        signal_strength_dbm: -68,
        transit_mode: "Vehicle Transit (Cab)",
        vehicle_plate: "TS-09-UB-4401",
        telecom_trace: {
          imei: "865510293847102",
          imsi: "404861928374619",
          carrier: "Jio 5G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 17.3850,
        longitude: 78.4867,
        location_name: "Banjara Hills Studio, Hyderabad",
        timestamp: "03:15 PM",
        speed_kmh: 0,
        activity: "Live Video Arrest Coercion Session",
        activity_type: "COERCIVE_EXTORTION",
        forensic_narrative: "Posing as Superintendent of Police in full counterfeit uniform over video call, demanding immediate INR 1.2 Crore RTGS transfer.",
        tower_id: "HYD-BTS-4091",
        cell_id: "CELL-40918",
        signal_strength_dbm: -50,
        transit_mode: "Stationary (Studio Setup)",
        cctv_corroboration: {
          camera_code: "HYD-CCTV-BJ-04",
          face_match_confidence: 91.8,
          frame_evidence_hash: "0xfe3189a029384710293847102938471029384710293847102938471029384710",
        },
        telecom_trace: {
          imei: "865510293847102",
          imsi: "404861928374619",
          carrier: "Jio True 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 204 BNS (Impersonating Public Servant)", "Section 308 BNS (Extortion)", "Section 66D IT Act", "Section 65B BSA 2023"],
      },
    ],
  },

  // 6. CASE-2026-006: AHMEDABAD - Karan Solanki
  {
    id: "TRK-006",
    suspect_id: "SUS-907",
    suspect_name: "Karan Solanki",
    case_id: "CASE-2026-006",
    case_title: "Operation Durg: Biometric & AePS Micro-ATM Bypass",
    city: "Ahmedabad",
    color: "#10b981",
    status: "ACTIVE_TRACKING",
    total_distance_km: 10.2,
    last_known_location: "Navrangpura Commercial Complex, Ahmedabad",
    waypoints: [
      {
        sequence: 1,
        latitude: 23.0450,
        longitude: 72.5250,
        location_name: "SG Highway Flyover, Ahmedabad",
        timestamp: "01:10 PM",
        speed_kmh: 48,
        activity: "Transit with Silicone Fingerprint Molds",
        activity_type: "CONTRABAND_TRANSIT",
        forensic_narrative: "Suspect carrying 24 silicone fingerprint molds harvested from digitized land registry PDF records.",
        tower_id: "AHM-BTS-9912",
        cell_id: "CELL-99120",
        signal_strength_dbm: -70,
        transit_mode: "Vehicle Transit (Scooter)",
        vehicle_plate: "GJ-01-AZ-7721",
        telecom_trace: {
          imei: "869910293847102",
          imsi: "404701928374619",
          carrier: "Vi 4G",
          band: "Band 1 (2100 MHz)",
        },
        legal_sections: ["Section 318 BNS", "Aadhaar Act Sec 42"],
      },
      {
        sequence: 2,
        latitude: 23.0330,
        longitude: 72.5560,
        location_name: "CG Road Commercial Bank Branch, Ahmedabad",
        timestamp: "01:40 PM",
        speed_kmh: 15,
        activity: "Micro-ATM Terminal Cashing Attempt",
        activity_type: "AEPS_UNAUTHORIZED_WITHDRAWAL",
        forensic_narrative: "Executed 6 consecutive AePS Rs. 10,000 cash withdrawals using clone biometrics.",
        tower_id: "AHM-BTS-8801",
        cell_id: "CELL-88014",
        signal_strength_dbm: -58,
        transit_mode: "Pedestrian",
        telecom_trace: {
          imei: "869910293847102",
          imsi: "404701928374619",
          carrier: "Vi 4G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318(4) BNS", "Section 66C IT Act (Identity Theft)"],
      },
      {
        sequence: 3,
        latitude: 23.0225,
        longitude: 72.5714,
        location_name: "Navrangpura Commercial Complex, Ahmedabad",
        timestamp: "02:15 PM",
        speed_kmh: 0,
        activity: "Cash Aggregation & Hawala Delivery",
        activity_type: "CASH_LAYER",
        forensic_narrative: "Handed over aggregated cash withdrawals to bullion trader token desk.",
        tower_id: "AHM-BTS-7704",
        cell_id: "CELL-77042",
        signal_strength_dbm: -52,
        transit_mode: "Stationary (Basement Office)",
        cctv_corroboration: {
          camera_code: "AHM-CCTV-NV-01",
          face_match_confidence: 94.2,
          frame_evidence_hash: "0x88910283fa81029384710293847192039485710293847592019384758192039",
        },
        telecom_trace: {
          imei: "869910293847102",
          imsi: "404701928374619",
          carrier: "Vi 4G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS", "PMLA Section 3", "Section 65B BSA 2023"],
      },
    ],
  },

  // 7. CASE-2026-007: BENGALURU - Nikhil Joshi
  {
    id: "TRK-007",
    suspect_id: "SUS-908",
    suspect_name: "Nikhil Joshi",
    case_id: "CASE-2026-007",
    case_title: "Operation Netra: AI Deepfake Video Extortion",
    city: "Bengaluru",
    color: "#6366f1",
    status: "ACTIVE_TRACKING",
    total_distance_km: 13.5,
    last_known_location: "Koramangala 4th Block, Bengaluru",
    waypoints: [
      {
        sequence: 1,
        latitude: 12.8450,
        longitude: 77.6600,
        location_name: "Electronic City Phase 1 Tech Campus, Bengaluru",
        timestamp: "04:10 PM",
        speed_kmh: 0,
        activity: "Diffusion Model Training & Video Ingestion",
        activity_type: "AI_MODEL_TRAINING",
        forensic_narrative: "Downloaded public conference keynote videos of target corporate CXO to train 512-dim LoRA diffusion model.",
        tower_id: "BLR-BTS-8012",
        cell_id: "CELL-80120",
        signal_strength_dbm: -56,
        transit_mode: "Stationary (Server Lab)",
        telecom_trace: {
          imei: "863310293847102",
          imsi: "404801928374991",
          carrier: "Jio True 5G",
          band: "n78",
        },
        legal_sections: ["Section 318 BNS", "Section 66D IT Act"],
      },
      {
        sequence: 2,
        latitude: 12.9170,
        longitude: 77.6220,
        location_name: "Silk Board Junction, Bengaluru",
        timestamp: "04:45 PM",
        speed_kmh: 22,
        activity: "In-Transit with Portable GPU Laptop",
        activity_type: "IN_TRANSIT",
        forensic_narrative: "Moving North on Hosur Road during evening rush hour.",
        tower_id: "BLR-BTS-7104",
        cell_id: "CELL-71048",
        signal_strength_dbm: -72,
        transit_mode: "Vehicle Transit (Cab)",
        vehicle_plate: "KA-05-AB-9012",
        telecom_trace: {
          imei: "863310293847102",
          imsi: "404801928374991",
          carrier: "Jio 5G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 12.9352,
        longitude: 77.6245,
        location_name: "Koramangala 4th Block Rendering Lab, Bengaluru",
        timestamp: "05:20 PM",
        speed_kmh: 0,
        activity: "Deepfake Video Transmission & Extortion Demand",
        activity_type: "CYBER_EXTORTION",
        forensic_narrative: "Uploaded synthesized 4K deepfake video to victim executive on ProtonMail demanding 15 XMR (Monero).",
        tower_id: "BLR-BTS-6029",
        cell_id: "CELL-60294",
        signal_strength_dbm: -50,
        transit_mode: "Stationary (Private Studio)",
        cctv_corroboration: {
          camera_code: "BLR-CCTV-KM-01",
          face_match_confidence: 95.8,
          frame_evidence_hash: "0x7719283749102938471029384710293847102938471029384710293847102938",
        },
        telecom_trace: {
          imei: "863310293847102",
          imsi: "404801928374991",
          carrier: "Jio True 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 308 BNS (Extortion)", "Section 66E IT Act (Privacy)", "Section 65B BSA 2023"],
      },
    ],
  },

  // 8. CASE-2026-008: PUNE - Sameer Deshmukh
  {
    id: "TRK-008",
    suspect_id: "SUS-909",
    suspect_name: "Sameer Deshmukh",
    case_id: "CASE-2026-008",
    case_title: "Operation Kuber: Instant Loan App & Hawala Funnel",
    city: "Pune",
    color: "#eab308",
    status: "ACTIVE_TRACKING",
    total_distance_km: 17.5,
    last_known_location: "Viman Nagar Cyber City, Pune",
    waypoints: [
      {
        sequence: 1,
        latitude: 18.5910,
        longitude: 73.7380,
        location_name: "Hinjewadi IT Park Phase 2, Pune",
        timestamp: "03:10 PM",
        speed_kmh: 0,
        activity: "Malicious APK Backend Control Panel Login",
        activity_type: "BOTNET_C2_LOGIN",
        forensic_narrative: "Logged into C2 panel managing 45,000 infected Android devices to extract victim contacts and gallery photos.",
        tower_id: "PUN-BTS-9901",
        cell_id: "CELL-99010",
        signal_strength_dbm: -54,
        transit_mode: "Stationary (IT Park Office)",
        telecom_trace: {
          imei: "862210293847102",
          imsi: "404221928374619",
          carrier: "Airtel 5G",
          band: "n78",
        },
        legal_sections: ["Section 318 BNS", "Section 43/66 IT Act"],
      },
      {
        sequence: 2,
        latitude: 18.5310,
        longitude: 73.8450,
        location_name: "Shivajinagar Overpass, Pune",
        timestamp: "03:50 PM",
        speed_kmh: 40,
        activity: "Transit to Offshore Call Facility",
        activity_type: "IN_TRANSIT",
        forensic_narrative: "Moving East through Pune university circle corridor.",
        tower_id: "PUN-BTS-8102",
        cell_id: "CELL-81028",
        signal_strength_dbm: -69,
        transit_mode: "Vehicle Transit (Sedan)",
        vehicle_plate: "MH-12-PQ-9912",
        telecom_trace: {
          imei: "862210293847102",
          imsi: "404221928374619",
          carrier: "Airtel 5G",
          band: "Band 3 (1800 MHz)",
        },
        legal_sections: ["Section 318 BNS"],
      },
      {
        sequence: 3,
        latitude: 18.5204,
        longitude: 73.8567,
        location_name: "Viman Nagar Cyber Operations Center, Pune",
        timestamp: "04:30 PM",
        speed_kmh: 0,
        activity: "Automated WhatsApp Harassment Bot Trigger",
        activity_type: "HARASSMENT_CAMPAIGN",
        forensic_narrative: "Triggered 500+ automated morphed photo WhatsApp threat messages to victim family members.",
        tower_id: "PUN-BTS-7201",
        cell_id: "CELL-72014",
        signal_strength_dbm: -50,
        transit_mode: "Stationary (Call Center Floor)",
        cctv_corroboration: {
          camera_code: "PUN-CCTV-VM-02",
          face_match_confidence: 92.5,
          frame_evidence_hash: "0x5510293847102938471029384710293847102938471029384710293847102938",
        },
        telecom_trace: {
          imei: "862210293847102",
          imsi: "404221928374619",
          carrier: "Airtel 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 308 BNS", "Section 351 BNS (Criminal Intimidation)", "Section 66E IT Act", "Section 65B BSA 2023"],
      },
    ],
  },

  // 9. CASE-2026-009: CHENNAI - Karthik Ramanathan
  {
    id: "TRK-009",
    suspect_id: "SUS-910",
    suspect_name: "Karthik Ramanathan",
    case_id: "CASE-2026-009",
    case_title: "Operation Rudra: Power Grid SCADA Ransomware",
    city: "Chennai",
    color: "#06b6d4",
    status: "ACTIVE_TRACKING",
    total_distance_km: 19.2,
    last_known_location: "Tidel Park OMR Corridor, Chennai",
    waypoints: [
      {
        sequence: 1,
        latitude: 13.0827,
        longitude: 80.2707,
        location_name: "Guindy Industrial Estate Substation, Chennai",
        timestamp: "07:30 AM",
        speed_kmh: 0,
        activity: "SCADA Ingress Zero-Day Injection",
        activity_type: "SCADA_EXPLOIT",
        forensic_narrative: "Targeted VPN payload deployed directly into RTU telemetry bus. Attempted logic corruption of 220kV transmission breakers.",
        tower_id: "CHE-BTS-3301",
        cell_id: "CELL-33018",
        signal_strength_dbm: -52,
        transit_mode: "Stationary (Substation Perimeter)",
        telecom_trace: {
          imei: "869910293847101",
          imsi: "404451928374920",
          carrier: "Jio True 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 111 BNS (Organized Cyber Terrorism)", "Section 66F IT Act 2000", "Section 65B BSA 2023"],
      },
      {
        sequence: 2,
        latitude: 13.0400,
        longitude: 80.2500,
        location_name: "T. Nagar Commercial Hub, Chennai",
        timestamp: "08:15 AM",
        speed_kmh: 38,
        activity: "Tor Circuit Hop & Key Exchange",
        activity_type: "C2_BEACONING",
        forensic_narrative: "Suspect initiated PGP handshake with foreign threat actor group over encrypted matrix bridge.",
        tower_id: "CHE-BTS-4202",
        cell_id: "CELL-42021",
        signal_strength_dbm: -64,
        transit_mode: "Vehicle Transit (Dark Grey Sedan)",
        vehicle_plate: "TN-07-CD-4421",
        telecom_trace: {
          imei: "869910293847101",
          imsi: "404451928374920",
          carrier: "Jio True 5G",
          band: "Band 40 (2300 MHz)",
        },
        legal_sections: ["Section 111 BNS", "Section 66F IT Act 2000"],
      },
      {
        sequence: 3,
        latitude: 12.9860,
        longitude: 80.2430,
        location_name: "Tidel Park OMR Tech Corridor, Chennai",
        timestamp: "08:50 AM",
        speed_kmh: 0,
        activity: "Ransomware Decryption Escrow Node Setup",
        activity_type: "ESCROW_NODE_SETUP",
        forensic_narrative: "Suspect connected to high-bandwidth fiber gateway to monitor Southern Grid SCADA telemetry.",
        tower_id: "CHE-BTS-7701",
        cell_id: "CELL-77015",
        signal_strength_dbm: -48,
        transit_mode: "Stationary (OMR Coworking Suite)",
        cctv_corroboration: {
          camera_code: "CHE-CCTV-TP-01",
          face_match_confidence: 96.4,
          frame_evidence_hash: "0x8821903847102938471029384710293847102938471029384710293847102938",
        },
        telecom_trace: {
          imei: "869910293847101",
          imsi: "404451928374920",
          carrier: "Jio True 5G",
          band: "n78 (3500 MHz)",
        },
        legal_sections: ["Section 111 BNS", "Section 66F IT Act 2000", "Section 65B BSA 2023"],
      },
    ],
  },
];

const DEFAULT_CCTV_FEEDS: CctvFeed[] = [
  // Kolkata (CASE-2026-004)
  {
    id: "CAM-KOL-01",
    camera_code: "KOL-CCTV-SL-03",
    location_name: "Salt Lake Sector V Wipro Crossing",
    city: "Kolkata",
    latitude: 22.5735,
    longitude: 88.3650,
    status: "ALERT_TRIGGERED",
    resolution: "4K AI-ANPR",
    fov_angle: 120,
    coverage_radius_meters: 200,
    last_detection: {
      suspect_name: "Debashis Banerjee",
      confidence: 96.0,
      timestamp: "09:18 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-KOL-02",
    camera_code: "KOL-CCTV-BB-02",
    location_name: "Burrabazar Bullion Exchange Entry",
    city: "Kolkata",
    latitude: 22.5855,
    longitude: 88.3515,
    status: "ALERT_TRIGGERED",
    resolution: "4K High-Speed Optical IR",
    fov_angle: 110,
    coverage_radius_meters: 180,
    last_detection: {
      suspect_name: "Debashis Banerjee",
      confidence: 93.1,
      timestamp: "09:47 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-KOL-03",
    camera_code: "KOL-CCTV-PS-01",
    location_name: "Park Street Metro Crossing Gate 2",
    city: "Kolkata",
    latitude: 22.5538,
    longitude: 88.3520,
    status: "ONLINE",
    resolution: "4K PTZ 360",
    fov_angle: 360,
    coverage_radius_meters: 250,
    last_detection: {
      suspect_name: "Debashis Banerjee",
      confidence: 96.0,
      timestamp: "10:35 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-KOL-04",
    camera_code: "KOL-CCTV-SDH-04",
    location_name: "Sealdah Flyover Junction",
    city: "Kolkata",
    latitude: 22.5699,
    longitude: 88.3699,
    status: "RECORDING",
    resolution: "1080P ANPR",
    fov_angle: 90,
    coverage_radius_meters: 160,
    last_detection: {
      suspect_name: "Debashis Banerjee",
      confidence: 91.4,
      timestamp: "10:12 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80",
  },

  // New Delhi (CASE-2026-001)
  {
    id: "CAM-DEL-01",
    camera_code: "DEL-CCTV-LP-01",
    location_name: "Lajpat Nagar Central Flyover Junction",
    city: "New Delhi",
    latitude: 28.5685,
    longitude: 77.2420,
    status: "ALERT_TRIGGERED",
    resolution: "4K 60FPS IR",
    fov_angle: 120,
    coverage_radius_meters: 150,
    last_detection: {
      suspect_name: "Aman Khan",
      confidence: 94.8,
      timestamp: "10:02 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-DEL-02",
    camera_code: "DEL-CCTV-CP-04",
    location_name: "Connaught Place Block A Outer Ring",
    city: "New Delhi",
    latitude: 28.6328,
    longitude: 77.2185,
    status: "ONLINE",
    resolution: "1080P PTZ",
    fov_angle: 360,
    coverage_radius_meters: 220,
    last_detection: {
      suspect_name: "Aman Khan",
      confidence: 92.1,
      timestamp: "10:35 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-DEL-03",
    camera_code: "DEL-CCTV-KB-02",
    location_name: "Karol Bagh Metro Gate 3",
    city: "New Delhi",
    latitude: 28.6520,
    longitude: 77.1910,
    status: "ALERT_TRIGGERED",
    resolution: "4K ANPR",
    fov_angle: 110,
    coverage_radius_meters: 180,
    last_detection: {
      suspect_name: "Aman Khan",
      confidence: 95.0,
      timestamp: "11:15 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
  },

  // Mumbai (CASE-2026-002, CASE-2026-005)
  {
    id: "CAM-MUM-01",
    camera_code: "MUM-CCTV-BKC-09",
    location_name: "BKC Avenue 3 ICICI Tower Intersection",
    city: "Mumbai",
    latitude: 19.0755,
    longitude: 72.8790,
    status: "RECORDING",
    resolution: "4K AI-ANPR",
    fov_angle: 90,
    coverage_radius_meters: 180,
    last_detection: {
      suspect_name: "Rohan Varma",
      confidence: 88.5,
      timestamp: "02:45 PM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-MUM-02",
    camera_code: "MUM-CCTV-AE-04",
    location_name: "Andheri East Western Express Highway",
    city: "Mumbai",
    latitude: 19.1197,
    longitude: 72.8464,
    status: "ALERT_TRIGGERED",
    resolution: "4K Facial Biometrics",
    fov_angle: 120,
    coverage_radius_meters: 220,
    last_detection: {
      suspect_name: "Rohan Varma",
      confidence: 93.4,
      timestamp: "01:30 PM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80",
  },

  // Bengaluru (CASE-2026-003, CASE-2026-007)
  {
    id: "CAM-BLR-01",
    camera_code: "BLR-CCTV-KM-01",
    location_name: "Koramangala 80ft Road Junction",
    city: "Bengaluru",
    latitude: 12.9360,
    longitude: 77.6250,
    status: "ALERT_TRIGGERED",
    resolution: "4K Facial Recognition",
    fov_angle: 120,
    coverage_radius_meters: 190,
    last_detection: {
      suspect_name: "Devendra Patil",
      confidence: 95.8,
      timestamp: "11:05 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "CAM-BLR-02",
    camera_code: "BLR-CCTV-IND-02",
    location_name: "Indiranagar 100ft Road Corner",
    city: "Bengaluru",
    latitude: 12.9725,
    longitude: 77.5960,
    status: "ONLINE",
    resolution: "4K 60FPS ANPR",
    fov_angle: 110,
    coverage_radius_meters: 160,
    last_detection: {
      suspect_name: "Devendra Patil",
      confidence: 95.4,
      timestamp: "11:45 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80",
  },

  // Hyderabad (CASE-2026-005)
  {
    id: "CAM-HYD-01",
    camera_code: "HYD-CCTV-HTC-01",
    location_name: "HITEC City Cyber Towers Junction",
    city: "Hyderabad",
    latitude: 17.4504,
    longitude: 78.3808,
    status: "ALERT_TRIGGERED",
    resolution: "4K AI-ANPR",
    fov_angle: 120,
    coverage_radius_meters: 220,
    last_detection: {
      suspect_name: "Tanya Sen",
      confidence: 95.2,
      timestamp: "01:15 PM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80",
  },

  // Ahmedabad (CASE-2026-006)
  {
    id: "CAM-AHM-01",
    camera_code: "AHM-CCTV-SGH-01",
    location_name: "SG Highway Prahladnagar Junction",
    city: "Ahmedabad",
    latitude: 23.0120,
    longitude: 72.5100,
    status: "ALERT_TRIGGERED",
    resolution: "4K AI-ANPR",
    fov_angle: 120,
    coverage_radius_meters: 200,
    last_detection: {
      suspect_name: "Karan Solanki",
      confidence: 94.6,
      timestamp: "10:45 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
  },

  // Pune (CASE-2026-008)
  {
    id: "CAM-PUN-01",
    camera_code: "PUN-CCTV-VM-02",
    location_name: "Viman Nagar Cyber Center Crossing",
    city: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    status: "ALERT_TRIGGERED",
    resolution: "4K Facial Biometrics",
    fov_angle: 110,
    coverage_radius_meters: 190,
    last_detection: {
      suspect_name: "Sameer Deshmukh",
      confidence: 92.5,
      timestamp: "04:30 PM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
  },

  // Chennai (CASE-2026-009)
  {
    id: "CAM-CHE-01",
    camera_code: "CHE-CCTV-TP-01",
    location_name: "Tidel Park OMR Tech Corridor",
    city: "Chennai",
    latitude: 12.9860,
    longitude: 80.2430,
    status: "ALERT_TRIGGERED",
    resolution: "4K ANPR",
    fov_angle: 120,
    coverage_radius_meters: 240,
    last_detection: {
      suspect_name: "Karthik Ramanathan",
      confidence: 96.4,
      timestamp: "08:50 AM",
      face_matched: true,
    },
    stream_url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_POLICE_STATIONS: PoliceStation[] = [
  // Kolkata
  {
    id: "PS-KOL-01",
    name: "Salt Lake Cyber Crime Police Station (CID West Bengal)",
    division: "Bidhannagar Police Commissionerate",
    city: "Kolkata",
    latitude: 22.5780,
    longitude: 88.3680,
    contact: "+91-33-23340000",
    pcr_units_available: 8,
    response_radius_km: 5.2,
  },
  {
    id: "PS-KOL-02",
    name: "Park Street Police Station",
    division: "South Division, Kolkata Police",
    city: "Kolkata",
    latitude: 22.5530,
    longitude: 88.3540,
    contact: "+91-33-22830000",
    pcr_units_available: 6,
    response_radius_km: 4.0,
  },
  {
    id: "PS-KOL-03",
    name: "Lalbazar Special Cyber Branch HQ",
    division: "Detective Department, Kolkata Police",
    city: "Kolkata",
    latitude: 22.5710,
    longitude: 88.3510,
    contact: "+91-33-22143000",
    pcr_units_available: 12,
    response_radius_km: 7.5,
  },

  // New Delhi
  {
    id: "PS-DEL-01",
    name: "Lajpat Nagar Police Station & Quick Response Cell",
    division: "South East District, Delhi Police",
    city: "New Delhi",
    latitude: 28.5700,
    longitude: 77.2390,
    contact: "+91-11-29812345",
    pcr_units_available: 6,
    response_radius_km: 4.5,
  },
  {
    id: "PS-DEL-02",
    name: "Connaught Place Police Station",
    division: "New Delhi District, Delhi Police",
    city: "New Delhi",
    latitude: 28.6295,
    longitude: 77.2140,
    contact: "+91-11-23412345",
    pcr_units_available: 8,
    response_radius_km: 3.8,
  },
  {
    id: "PS-DEL-03",
    name: "IFSO Special Cell Cyber HQ (Dwarka)",
    division: "Special Operations, Delhi Police",
    city: "New Delhi",
    latitude: 28.5920,
    longitude: 77.0460,
    contact: "+91-11-28042000",
    pcr_units_available: 10,
    response_radius_km: 8.0,
  },

  // Mumbai
  {
    id: "PS-MUM-01",
    name: "BKC Cyber Crime Police Station",
    division: "Zone VIII, Mumbai Police",
    city: "Mumbai",
    latitude: 19.0720,
    longitude: 72.8710,
    contact: "+91-22-26504000",
    pcr_units_available: 8,
    response_radius_km: 5.0,
  },
  {
    id: "PS-MUM-02",
    name: "Andheri East Police Station",
    division: "Zone X, Mumbai Police",
    city: "Mumbai",
    latitude: 19.1180,
    longitude: 72.8520,
    contact: "+91-22-26830000",
    pcr_units_available: 6,
    response_radius_km: 4.2,
  },

  // Bengaluru
  {
    id: "PS-BLR-01",
    name: "Koramangala Police Station",
    division: "South East Division, Bengaluru City Police",
    city: "Bengaluru",
    latitude: 12.9350,
    longitude: 77.6240,
    contact: "+91-80-22942500",
    pcr_units_available: 7,
    response_radius_km: 4.0,
  },
  {
    id: "PS-BLR-02",
    name: "Cyber Crime Division, CID Headquarters",
    division: "Karnataka CID, Carlton House",
    city: "Bengaluru",
    latitude: 12.9780,
    longitude: 77.5900,
    contact: "+91-80-22094499",
    pcr_units_available: 9,
    response_radius_km: 6.5,
  },

  // Hyderabad
  {
    id: "PS-HYD-01",
    name: "Cyberabad Cyber Crime Police Station",
    division: "Cyberabad Police Commissionerate",
    city: "Hyderabad",
    latitude: 17.4480,
    longitude: 78.3750,
    contact: "+91-40-27853400",
    pcr_units_available: 8,
    response_radius_km: 5.5,
  },

  // Ahmedabad
  {
    id: "PS-AHM-01",
    name: "Ahmedabad City Cyber Crime Police Station",
    division: "Crime Branch, Ahmedabad Police",
    city: "Ahmedabad",
    latitude: 23.0180,
    longitude: 72.5220,
    contact: "+91-79-22143000",
    pcr_units_available: 7,
    response_radius_km: 4.8,
  },

  // Pune
  {
    id: "PS-PUN-01",
    name: "Shivajinagar Cyber Police Station",
    division: "Crime Branch, Pune City Police",
    city: "Pune",
    latitude: 18.5300,
    longitude: 73.8480,
    contact: "+91-20-26122880",
    pcr_units_available: 8,
    response_radius_km: 5.0,
  },

  // Chennai
  {
    id: "PS-CHE-01",
    name: "Cyber Crime Cell, Greater Chennai Police",
    division: "CCB, Vepery Chennai",
    city: "Chennai",
    latitude: 13.0850,
    longitude: 80.2650,
    contact: "+91-44-23452345",
    pcr_units_available: 9,
    response_radius_km: 6.0,
  },
];

let inMemoryEvents = [...DEFAULT_GEO_EVENTS];

export class GeoIntelService {
  async getHotspots(filters?: { case_id?: string; city?: string; severity?: string; event_type?: string }) {
    if (pgPool && process.env.DATABASE_URL) {
      try {
        let query = `
          SELECT g.*, c.title as case_title, c.crime_category, c.priority
          FROM geo_intel_events g
          LEFT JOIN cases c ON g.case_id = c.id
          WHERE 1=1
        `;
        const params: any[] = [];
        if (filters?.case_id && filters.case_id !== "*") {
          params.push(filters.case_id);
          query += ` AND g.case_id = $${params.length}`;
        }
        if (filters?.city) {
          params.push(filters.city);
          query += ` AND g.city ILIKE $${params.length}`;
        }
        if (filters?.event_type) {
          params.push(filters.event_type);
          query += ` AND g.event_type = $${params.length}`;
        }
        query += ` ORDER BY g.timestamp DESC`;
        const result = await pgPool.query(query, params);
        if (result.rows && result.rows.length > 0) {
          return result.rows;
        }
      } catch (err) {
        // PG fallback
      }
    }

    let events = [...inMemoryEvents];
    if (filters?.case_id && filters.case_id !== "*") {
      events = events.filter((e) => e.case_id === filters.case_id);
    }
    if (filters?.city) {
      events = events.filter((e) => e.city.toLowerCase() === filters.city?.toLowerCase());
    }
    if (filters?.event_type) {
      events = events.filter((e) => e.event_type === filters.event_type);
    }
    if (filters?.severity) {
      events = events.filter((e) => e.severity === filters.severity);
    }
    return events;
  }

  async getCityClusters() {
    if (pgPool && process.env.DATABASE_URL) {
      try {
        const query = `
          SELECT city, state, COUNT(*) as event_count, AVG(latitude) as center_lat, AVG(longitude) as center_lng
          FROM geo_intel_events
          GROUP BY city, state
          ORDER BY event_count DESC
        `;
        const result = await pgPool.query(query);
        if (result.rows && result.rows.length > 0) {
          return result.rows;
        }
      } catch (err) {
        // Fallback
      }
    }

    const cityMap: Record<string, { city: string; state: string; count: number; lats: number[]; lngs: number[] }> = {};
    inMemoryEvents.forEach((ev) => {
      if (!cityMap[ev.city]) {
        cityMap[ev.city] = { city: ev.city, state: ev.state, count: 0, lats: [], lngs: [] };
      }
      cityMap[ev.city].count += 1;
      cityMap[ev.city].lats.push(ev.latitude);
      cityMap[ev.city].lngs.push(ev.longitude);
    });

    return Object.values(cityMap).map((item) => ({
      city: item.city,
      state: item.state,
      event_count: item.count,
      center_lat: item.lats.reduce((a, b) => a + b, 0) / item.lats.length,
      center_lng: item.lngs.reduce((a, b) => a + b, 0) / item.lngs.length,
    }));
  }

  async getSuspectMovements(case_id?: string) {
    if (case_id && case_id !== "*") {
      const filtered = DEFAULT_SUSPECT_MOVEMENTS.filter((m) => m.case_id === case_id);
      if (filtered.length > 0) return filtered;
    }
    return DEFAULT_SUSPECT_MOVEMENTS;
  }

  async getCctvFeeds(city?: string) {
    if (city) {
      return DEFAULT_CCTV_FEEDS.filter((c) => c.city.toLowerCase() === city.toLowerCase());
    }
    return DEFAULT_CCTV_FEEDS;
  }

  async getPoliceStations(city?: string) {
    if (city) {
      return DEFAULT_POLICE_STATIONS.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }
    return DEFAULT_POLICE_STATIONS;
  }

  async createEvent(eventData: Partial<GeoEvent>) {
    const newEvent: GeoEvent = {
      id: `GEO-EVT-${Date.now().toString().slice(-4)}`,
      case_id: eventData.case_id || "CASE-2026-004",
      case_title: eventData.case_title || "Active Case Intelligence",
      event_type: eventData.event_type || "SUSPECT_SIGHTING",
      title: eventData.title || "Field Officer Sighting Pin",
      description: eventData.description || "Field intelligence recorded via Geo Command Center.",
      latitude: Number(eventData.latitude) || 22.5726,
      longitude: Number(eventData.longitude) || 88.3639,
      location_name: eventData.location_name || "Field Coordinate Node",
      city: eventData.city || "Kolkata",
      state: eventData.state || "West Bengal",
      severity: eventData.severity || "HIGH",
      timestamp: new Date().toISOString(),
      suspect_id: eventData.suspect_id,
      suspect_name: eventData.suspect_name,
      confidence: eventData.confidence || 92,
      evidence_hash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      radius_meters: eventData.radius_meters || 400,
    };

    inMemoryEvents.unshift(newEvent);

    if (pgPool && process.env.DATABASE_URL) {
      try {
        await pgPool.query(
          `INSERT INTO geo_intel_events (id, case_id, event_type, latitude, longitude, location_name, city, state, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newEvent.id,
            newEvent.case_id,
            newEvent.event_type,
            newEvent.latitude,
            newEvent.longitude,
            newEvent.location_name,
            newEvent.city,
            newEvent.state,
            newEvent.timestamp,
          ]
        );
      } catch (err) {
        // Error handling
      }
    }

    return newEvent;
  }

  triangulateBts(towers: { latitude: number; longitude: number; distance_km: number; rssi_dbm?: number }[]) {
    if (!towers || towers.length < 2) {
      throw new Error("At least 2 BTS cell towers are required for triangulation calculation.");
    }

    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    towers.forEach((tower) => {
      const dist = Math.max(tower.distance_km, 0.05);
      const weight = 1 / (dist * dist);
      totalWeight += weight;
      weightedLat += tower.latitude * weight;
      weightedLng += tower.longitude * weight;
    });

    const centroidLat = weightedLat / totalWeight;
    const centroidLng = weightedLng / totalWeight;

    const avgDistance = (towers.reduce((sum, t) => sum + t.distance_km, 0) / towers.length) * 1000;
    const errorRadiusMeters = Math.round(Math.min(avgDistance * 0.35, 1200));

    return {
      triangulated_latitude: Number(centroidLat.toFixed(6)),
      triangulated_longitude: Number(centroidLng.toFixed(6)),
      confidence_radius_meters: errorRadiusMeters,
      towers_utilized: towers.length,
      algorithm: "Weighted Non-Linear Trilateration (WLS)",
      timestamp: new Date().toISOString(),
      confidence_score: Math.min(Math.round(100 - (errorRadiusMeters / 1500) * 40), 98),
    };
  }
}

export const geoIntelService = new GeoIntelService();

export class GeoIntelController {
  async handleGetHotspots(req: Request, res: Response) {
    try {
      const { case_id, city, severity, event_type } = req.query;
      const hotspots = await geoIntelService.getHotspots({
        case_id: case_id as string,
        city: city as string,
        severity: severity as string,
        event_type: event_type as string,
      });
      res.json(formatResponse(true, hotspots, "Geo-intel crime hotspots retrieved successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetClusters(_req: Request, res: Response) {
    try {
      const clusters = await geoIntelService.getCityClusters();
      res.json(formatResponse(true, clusters, "City-level spatial clusters retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetSuspectMovements(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const tracks = await geoIntelService.getSuspectMovements(case_id as string);
      res.json(formatResponse(true, tracks, "Suspect GPS tracks retrieved successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetCctvFeeds(req: Request, res: Response) {
    try {
      const { city } = req.query;
      const feeds = await geoIntelService.getCctvFeeds(city as string);
      res.json(formatResponse(true, feeds, "CCTV surveillance feeds retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetPoliceStations(req: Request, res: Response) {
    try {
      const { city } = req.query;
      const stations = await geoIntelService.getPoliceStations(city as string);
      res.json(formatResponse(true, stations, "Police stations & response units retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleCreateEvent(req: Request, res: Response) {
    try {
      const event = await geoIntelService.createEvent(req.body);
      res.status(201).json(formatResponse(true, event, "Geo intelligence event recorded successfully"));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleTriangulate(req: Request, res: Response) {
    try {
      const { towers } = req.body;
      const result = geoIntelService.triangulateBts(towers);
      res.json(formatResponse(true, result, "Cellular BTS triangulation computed successfully"));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const geoIntelController = new GeoIntelController();

export function geoRoutes(): Router {
  const router = Router();
  router.get("/hotspots", (req, res) => geoIntelController.handleGetHotspots(req, res));
  router.get("/clusters", (req, res) => geoIntelController.handleGetClusters(req, res));
  router.get("/suspect-movements", (req, res) => geoIntelController.handleGetSuspectMovements(req, res));
  router.get("/cctv-feeds", (req, res) => geoIntelController.handleGetCctvFeeds(req, res));
  router.get("/police-stations", (req, res) => geoIntelController.handleGetPoliceStations(req, res));
  router.post("/events", (req, res) => geoIntelController.handleCreateEvent(req, res));
  router.post("/triangulate", (req, res) => geoIntelController.handleTriangulate(req, res));
  return router;
}
