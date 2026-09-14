// CrimeSync Reactive Active Investigation Dataset Provider
// Maps active cases (PostgreSQL & Neo4j) to dynamic network graphs, AI insights, temporal events, and GIS coordinates.

import type { NetworkNode, NetworkEdge, TimelineEvent, Severity } from '../types/dashboard';

export interface CaseNetworkData {
  caseId: string;
  leadSuspect: {
    name: string;
    alias: string;
    role: string;
    riskScore: number;
    avatar: string;
    phone: string;
    location: string;
    bio: string;
  };
  nodes: (NetworkNode & { sublabel?: string; iconColor?: string; type?: string })[];
  edges: (NetworkEdge & { label?: string; flowSpeed?: number })[];
  aiInsight: {
    suspectName: string;
    syndicateName: string;
    confidenceScore: number;
    explanation: string;
    evidenceSummary: {
      id: string;
      iconType: 'biometric' | 'crypto' | 'telecom' | 'financial' | 'cctv' | 'cyber';
      title: string;
      detail: string;
    }[];
  };
  timeMachineEvents: {
    id: string;
    time: string;
    date: string;
    title: string;
    sub: string;
    category: 'call' | 'transaction' | 'location' | 'cctv' | 'cyber';
    riskSeverity: Severity;
  }[];
  geoHotspot: {
    cityName: string;
    state: string;
    coordinates: [number, number]; // [lat, lng]
    mapX: number; // percentage in svg
    mapY: number; // percentage in svg
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    recentIncidentsCount: number;
    activeSurveillanceUnit: string;
  };
  evidenceSummary: {
    total: number;
    verified: number;
    tampered: number;
    pending: number;
    section65bStatus: 'CERTIFIED' | 'SEALED';
  };
}

export const CASE_INTELLIGENCE_REGISTRY: Record<string, CaseNetworkData> = {
  // 1. GridShield SCADA Attack (CASE-2026-002)
  'CASE-2026-002': {
    caseId: 'CASE-2026-002',
    leadSuspect: {
      name: 'Tariq "Zero-Day" Qureshi',
      alias: 'DarkVolt',
      role: 'SCADA Intrusion Specialist & APT Broker',
      riskScore: 96,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98201 10440',
      location: 'Mumbai Suburbs (Bandra Kurla)',
      bio: 'Ex-telecom contractor operating darknet exploit pipelines targeting regional power dispatch SCADA telemetry.',
    },
    nodes: [
      {
        id: 'tariq_q',
        label: 'Tariq Qureshi',
        sublabel: 'Lead APT Actor (96 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 96,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        details: {
          role: 'APT Syndicate Lead',
          phone: '+91 98201 10440',
          location: 'BKC, Mumbai',
          notes: 'Intercepted exploiting CVE-2026-8812 against Kalwa 400kV SCADA gateway.',
        },
      },
      {
        id: 'c2_server',
        label: '194.26.29.112 (C2 Server)',
        sublabel: 'Bulgarian Bulletproof Host',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 94,
        x: 50,
        y: 18,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: { role: 'Command & Control Relay', notes: 'Active Cobalt Strike beacon relaying SCADA telemetry commands.' },
      },
      {
        id: 'farhan_m',
        label: 'Farhan Mirza',
        sublabel: 'Malware Developer',
        category: 'People',
        risk: 'HIGH',
        riskScore: 88,
        x: 24,
        y: 30,
        type: 'person',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Payload Obfuscator', phone: '+91 98204 99182', location: 'Thane, MH' },
      },
      {
        id: 'xmr_wallet',
        label: '888tXMR...3fA9',
        sublabel: 'Monero Escrow Pool',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 91,
        x: 76,
        y: 28,
        type: 'account',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Cryptocurrency Ransom Escrow', notes: 'Received 14.5 XMR ransom installment from offshore pool.' },
      },
      {
        id: 'veh_mh01',
        label: 'MH01EA4091 (Skoda Octavia)',
        sublabel: 'Signal Recon Vehicle',
        category: 'Vehicles',
        risk: 'MEDIUM',
        riskScore: 72,
        x: 18,
        y: 62,
        type: 'vehicle',
        iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
        details: { vehicleNumber: 'MH-01-EA-4091', role: 'War-driving / WiFi sniffing rig', location: 'Navi Mumbai' },
      },
      {
        id: 'scada_relay',
        label: 'Kalwa 400kV SCADA Node',
        sublabel: 'Target Substation Bus',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 98,
        x: 82,
        y: 58,
        type: 'location',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: { location: 'Kalwa Grid Control Station', role: 'Critical National Infrastructure' },
      },
      {
        id: 'burner_imei',
        label: 'IMEI: 864910284719201',
        sublabel: 'Satellite VoIP Link',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 85,
        x: 32,
        y: 80,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { phone: 'Encrypted Thuraya Uplink', role: 'Out-of-band C2 Trigger' },
      },
      {
        id: 'mule_bank',
        label: 'HDFC AC: 50100491820',
        sublabel: 'Mule Account (Layer 1)',
        category: 'Accounts',
        risk: 'MEDIUM',
        riskScore: 78,
        x: 68,
        y: 82,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Domestic Mule Funnel', notes: 'Frozen under PMLA 2002 by Cyber Cell.' },
      },
    ],
    edges: [
      { from: 'tariq_q', to: 'c2_server', relation: 'C2_BEACON_TRANSMIT', isHighRisk: true, label: 'TCP/443 SSL Tunnel' },
      { from: 'tariq_q', to: 'farhan_m', relation: 'CO_CONSPIRATOR', isHighRisk: true, label: 'Payload Transfer' },
      { from: 'tariq_q', to: 'xmr_wallet', relation: 'CRYPTO_ESCROW', isHighRisk: true, label: '14.5 XMR Transferred' },
      { from: 'tariq_q', to: 'veh_mh01', relation: 'OPERATES_VEHICLE', isHighRisk: false, label: 'Observed Near Substation' },
      { from: 'c2_server', to: 'scada_relay', relation: 'EXPLOIT_PIVOT', isHighRisk: true, label: 'CVE-2026-8812 Injection' },
      { from: 'tariq_q', to: 'burner_imei', relation: 'BURNT_SIM_CALL', isHighRisk: true, label: '42 Satellite Pings' },
      { from: 'farhan_m', to: 'mule_bank', relation: 'MULE_CASHOUT', isHighRisk: false, label: '₹14,50,000 Layered' },
    ],
    aiInsight: {
      suspectName: 'Tariq "Zero-Day" Qureshi',
      syndicateName: 'GridShield SCADA APT Cell',
      confidenceScore: 96.4,
      explanation: 'Autonomous neural correlation confirmed Tariq Qureshi as the central operative orchestrating lateral movement into Maharashtra State Load Despatch SCADA relays. Network packet signatures match zero-day VPN reverse shell injection.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'cyber', title: 'Zero-Day VPN Shell', detail: 'Reverse TLS payload targeting SCADA relay firmware (Kalwa 400kV)' },
        { id: 'ev-2', iconType: 'telecom', title: '42 Satellite Uplinks', detail: 'Thuraya satellite burst transmissions synchronized with grid load drop' },
        { id: 'ev-3', iconType: 'crypto', title: '14.5 XMR Darknet Escrow', detail: 'Cryptographic ransom escrow unlocked 12 minutes prior to intrusion attempt' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '23:42:10 IST',
        date: '10 Sep 2026',
        title: 'SCADA Relay Command Injection Detected',
        sub: 'Kalwa Substation 400kV Bus • Port 502 Modbus',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '23:18:04 IST',
        date: '10 Sep 2026',
        title: 'C2 Beaconing from Bulgarian Host',
        sub: 'IP 194.26.29.112 • TLS Handshake with Tariq Rig',
        category: 'cyber',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '22:50:33 IST',
        date: '10 Sep 2026',
        title: 'Thuraya Satellite Tower Burst Triangulation',
        sub: 'Bandra-Kurla Complex Tower #MH-4091',
        category: 'call',
        riskSeverity: 'HIGH',
      },
    ],
    geoHotspot: {
      cityName: 'Mumbai',
      state: 'Maharashtra',
      coordinates: [19.0760, 72.8777],
      mapX: 28,
      mapY: 56,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 39,
      activeSurveillanceUnit: 'Cyber Crime Investigation Cell (Unit 3)',
    },
    evidenceSummary: {
      total: 8,
      verified: 8,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },

  // 2. Operation Trishul: Hawala & Phishing Syndicate (CASE-2026-001)
  'CASE-2026-001': {
    caseId: 'CASE-2026-001',
    leadSuspect: {
      name: 'Harshvardhan Singhania',
      alias: 'Bada Babu / Sethji',
      role: 'Hawala Syndicate Mastermind & Mule Coordinator',
      riskScore: 94,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98101 22891',
      location: 'Old Delhi / Chandni Chowk',
      bio: 'Orchestrates 4-tier Hawala cash layering funnel laundering cyber extortion proceeds across NCR, Mumbai, and Dubai.',
    },
    nodes: [
      {
        id: 'harsh_s',
        label: 'Harshvardhan Singhania',
        sublabel: 'Hawala Mastermind (94 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 94,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        details: { role: 'Chief Syndicate Operator', phone: '+91 98101 22891', location: 'Chandni Chowk, Delhi' },
      },
      {
        id: 'deepak_courier',
        label: 'Deepak Soni (Angadia)',
        sublabel: 'Cash Courier Network',
        category: 'People',
        risk: 'HIGH',
        riskScore: 86,
        x: 26,
        y: 26,
        type: 'person',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Physical Cash Courier', location: 'Zaveri Bazaar, Mumbai' },
      },
      {
        id: 'hdfc_mule_1',
        label: 'HDFC AC: 502000491823',
        sublabel: 'Tier-1 Mule Account (₹82L)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 92,
        x: 74,
        y: 24,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Mule Aggregator', notes: 'Received 140 micro-deposits from phishing victims.' },
      },
      {
        id: 'icici_mule_2',
        label: 'ICICI AC: 001901599201',
        sublabel: 'Tier-2 Layering Account',
        category: 'Accounts',
        risk: 'MEDIUM',
        riskScore: 78,
        x: 82,
        y: 56,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Layering Account', notes: 'Automated split transfers to Dubai export shells.' },
      },
      {
        id: 'dubai_shell',
        label: 'Al-Baraka General Trading FZE',
        sublabel: 'Offshore Shell Entity',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 95,
        x: 66,
        y: 82,
        type: 'account',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Dubai Export Shell', location: 'Deira, Dubai, UAE' },
      },
      {
        id: 'burner_delhi',
        label: '+91 98110 49182',
        sublabel: 'VoIP Spoofed Calling SIM',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 89,
        x: 22,
        y: 60,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { role: 'Mule Command Line', location: 'Lajpat Nagar IV, Delhi' },
      },
      {
        id: 'veh_dl3c',
        label: 'DL3CAY8819 (Toyota Fortuner)',
        sublabel: 'Cash Transport Vehicle',
        category: 'Vehicles',
        risk: 'MEDIUM',
        riskScore: 68,
        x: 34,
        y: 84,
        type: 'vehicle',
        iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
        details: { vehicleNumber: 'DL-3C-AY-8819', location: 'Karol Bagh Cash Drop' },
      },
    ],
    edges: [
      { from: 'harsh_s', to: 'deepak_courier', relation: 'ANGADIA_COURIER', isHighRisk: true, label: '₹1.8 Cr Cash Transit' },
      { from: 'harsh_s', to: 'hdfc_mule_1', relation: 'CONTROLS_ACCOUNT', isHighRisk: true, label: 'Layer-1 Ingestion' },
      { from: 'hdfc_mule_1', to: 'icici_mule_2', relation: 'HAWALA_LAYERING', isHighRisk: true, label: 'Instant RTGS Layering' },
      { from: 'icici_mule_2', to: 'dubai_shell', relation: 'OFFSHORE_WIRE', isHighRisk: true, label: 'Over-Invoiced Export Wire' },
      { from: 'harsh_s', to: 'burner_delhi', relation: 'VOIP_COMMAND', isHighRisk: true, label: 'Encrypted WhatsApp Calls' },
      { from: 'deepak_courier', to: 'veh_dl3c', relation: 'OPERATES_TRANSPORT', isHighRisk: false, label: 'Cash Drop Route' },
    ],
    aiInsight: {
      suspectName: 'Harshvardhan Singhania',
      syndicateName: 'Operation Trishul Hawala Matrix',
      confidenceScore: 94.8,
      explanation: 'Graph centrality algorithms isolated Harshvardhan Singhania as the chief architect of 14 mule bank accounts across Delhi and Mumbai. Transaction velocity reveals automated layering into Dubai shell accounts within 4 minutes of victim deposits.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'financial', title: '₹1.84 Cr Layering Flow', detail: 'Rapid smurfing across 14 PSU mule bank accounts using synthetic Aadhaar IDs' },
        { id: 'ev-2', iconType: 'cctv', title: 'CCTV Facial Match (98.6%)', detail: 'Deepak Soni identified at Karol Bagh cash vault carrying sealed currency consignments' },
        { id: 'ev-3', iconType: 'telecom', title: 'Call Detail Record Intercept', detail: 'Over 180 encrypted calls linked to Dubai exporter phone numbers (+971-4-288190)' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '21:15:22 IST',
        date: '10 Sep 2026',
        title: 'Bulk Hawala Layering Transfer (₹48,50,000)',
        sub: 'HDFC AC 502000491823 ➔ ICICI Layering Pool',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '20:45:10 IST',
        date: '10 Sep 2026',
        title: 'Angadia Cash Drop at Karol Bagh Vault',
        sub: 'Deepak Soni in Vehicle DL3CAY8819',
        category: 'location',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '19:30:00 IST',
        date: '10 Sep 2026',
        title: 'Mule Phone Intercept with Dubai Number',
        sub: '+91 98110 49182 ➔ +971 4 288190',
        category: 'call',
        riskSeverity: 'HIGH',
      },
    ],
    geoHotspot: {
      cityName: 'New Delhi',
      state: 'Delhi NCR',
      coordinates: [28.6139, 77.2090],
      mapX: 38,
      mapY: 32,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 48,
      activeSurveillanceUnit: 'Special Cell / Cyber Crime Unit, Delhi',
    },
    evidenceSummary: {
      total: 12,
      verified: 12,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },

  // 3. Operation Vajra: Digital Arrest & Fake CBI Extortion (CASE-2026-005)
  'CASE-2026-005': {
    caseId: 'CASE-2026-005',
    leadSuspect: {
      name: 'Kunwar Pratap Singh',
      alias: 'Rana Saheb / SP Verma (Fake)',
      role: 'Digital Arrest Ring Leader & Fake Law Enforcement Operator',
      riskScore: 98,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98202 18420',
      location: 'Jaipur & Mumbai',
      bio: 'Impersonates CBI Directors and ED Joint Directors on Skype video calls, holding senior citizens under 72-hour fake virtual custody.',
    },
    nodes: [
      {
        id: 'kunwar_p',
        label: 'Kunwar Pratap Singh',
        sublabel: 'Digital Arrest Boss (98 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 98,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        details: { role: 'Ring Leader', phone: '+91 98202 18420', location: 'C-Scheme, Jaipur' },
      },
      {
        id: 'fake_cbi_skype',
        label: 'cbi.cyber.hq.gov (Fake Skype)',
        sublabel: 'Virtual Custody Video Room',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 97,
        x: 50,
        y: 18,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: { role: 'Skype Deception Channel', notes: 'Uses AI voice modulation & fake CBI backdrop studio.' },
      },
      {
        id: 'ravi_script',
        label: 'Ravi Teja (Call Scripting)',
        sublabel: 'Psychological Coercion Writer',
        category: 'People',
        risk: 'HIGH',
        riskScore: 84,
        x: 24,
        y: 32,
        type: 'person',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Script Writer & Operator', location: 'Hyderabad' },
      },
      {
        id: 'axis_mule',
        label: 'Axis Bank AC: 921020038102',
        sublabel: 'RTI "RBI Escrow" Mule (₹51.5L)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 93,
        x: 76,
        y: 30,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Mule Escrow Acct', notes: 'Posing as "RBI Verification Safe Account".' },
      },
      {
        id: 'spoofed_mha',
        label: '+91 11 2309 2011 (MHA Spoof)',
        sublabel: 'Spoofed Caller ID Gate',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 90,
        x: 20,
        y: 64,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { role: 'VoIP PBX Caller ID Spoof', location: 'Noida VoIP Exchange' },
      },
      {
        id: 'usdt_p2p',
        label: 'Binance P2P: Merchant_Kuber',
        sublabel: 'OTC USDT Conversion',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 92,
        x: 80,
        y: 66,
        type: 'account',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'P2P Crypto Cashout', notes: 'Converted ₹51.5L into 62,000 USDT.' },
      },
      {
        id: 'studio_loc',
        label: 'Mansarovar Studio, Jaipur',
        sublabel: 'Fake Police Station Setup',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 88,
        x: 48,
        y: 84,
        type: 'location',
        iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
        details: { location: 'Mansarovar, Jaipur', role: 'Physical Video Studio Raid Target' },
      },
    ],
    edges: [
      { from: 'kunwar_p', to: 'fake_cbi_skype', relation: 'OPERATES_VIDEO_CALL', isHighRisk: true, label: '72-Hour Virtual Arrest' },
      { from: 'kunwar_p', to: 'ravi_script', relation: 'CO_CONSPIRATOR', isHighRisk: true, label: 'Coercion Protocol' },
      { from: 'kunwar_p', to: 'axis_mule', relation: 'FUNDS_ROUTING', isHighRisk: true, label: '₹51,50,000 Extorted' },
      { from: 'fake_cbi_skype', to: 'spoofed_mha', relation: 'CALLER_ID_SPOOF', isHighRisk: true, label: 'Spoofed MHA Landline' },
      { from: 'axis_mule', to: 'usdt_p2p', relation: 'P2P_CASHOUT', isHighRisk: true, label: 'Instant USDT Offramp' },
      { from: 'kunwar_p', to: 'studio_loc', relation: 'PHYSICAL_BASE', isHighRisk: true, label: 'CCTV Studio Location' },
    ],
    aiInsight: {
      suspectName: 'Kunwar Pratap Singh',
      syndicateName: 'Operation Vajra Digital Arrest Ring',
      confidenceScore: 98.1,
      explanation: 'AI biometric audio analysis matched Kunwar Pratap Singh voice frequency to 6 recorded extortion sessions. The syndicate deployed simulated CBI studio backdrops and spoofed MHA Delhi numbers to intimidate high-net-worth retirees.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'cctv', title: 'Fake CBI Studio Video Recording', detail: 'Tamper-proof recording of suspect wearing forged IPS uniform with Delhi Police insignia' },
        { id: 'ev-2', iconType: 'telecom', title: 'MHA Spoofed Caller ID Logs', detail: 'VoIP PBX routing records showing fake +91 11 2309 2011 injected into victim PRI line' },
        { id: 'ev-3', iconType: 'crypto', title: '62,000 USDT Binance P2P Trail', detail: 'Extorted funds converted to Tether within 18 minutes across 3 OTC merchant accounts' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '18:40:15 IST',
        date: '10 Sep 2026',
        title: 'USDT P2P Conversion of Extorted Funds',
        sub: 'Axis Bank ➔ Binance Merchant_Kuber (62,000 USDT)',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '17:10:00 IST',
        date: '10 Sep 2026',
        title: 'Skype Virtual Arrest Video Call Terminated',
        sub: 'cbi.cyber.hq.gov • Victim Coerced into ₹51.5L RTGS',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-3',
        time: '14:22:45 IST',
        date: '10 Sep 2026',
        title: 'VoIP Caller ID Spoof Initiated',
        sub: 'Spoofed +91 11 2309 2011 from Noida Gateway',
        category: 'call',
        riskSeverity: 'HIGH',
      },
    ],
    geoHotspot: {
      cityName: 'Mumbai',
      state: 'Maharashtra / Rajasthan',
      coordinates: [19.0760, 72.8777],
      mapX: 28,
      mapY: 56,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 34,
      activeSurveillanceUnit: 'Cyber Crime Investigation Cell, Mumbai',
    },
    evidenceSummary: {
      total: 10,
      verified: 10,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },

  // 4. Operation Chakra: Call Center & Crypto Scam (CASE-2026-004)
  'CASE-2026-004': {
    caseId: 'CASE-2026-004',
    leadSuspect: {
      name: 'Anirban Mukherjee',
      alias: 'Bobby / Alex Turner',
      role: 'Illicit Call Center Kingpin & OTC Broker',
      riskScore: 92,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98315 04120',
      location: 'Kolkata (Salt Lake Sector V)',
      bio: 'Manages 60-seat illegal VOIP call center targeting international victims via fake Microsoft and banking popups.',
    },
    nodes: [
      {
        id: 'anirban_m',
        label: 'Anirban Mukherjee (Bobby)',
        sublabel: 'Call Center Kingpin (92 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 92,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        details: { role: 'Center Operator', phone: '+91 98315 04120', location: 'Salt Lake Sec V, Kolkata' },
      },
      {
        id: 'asterisk_pbx',
        label: 'Asterisk VoIP PBX (Sec 62)',
        sublabel: '64-Channel SIP Trunk',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 91,
        x: 50,
        y: 18,
        type: 'cyber',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { role: 'VOIP Dialler Server', notes: 'Routes 12,000 robocalls/day with spoofed US/UK caller IDs.' },
      },
      {
        id: 'vicky_walia',
        label: 'Vicky Walia (OTC Broker)',
        sublabel: 'USDT Liquidator',
        category: 'People',
        risk: 'HIGH',
        riskScore: 87,
        x: 26,
        y: 30,
        type: 'person',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Cash-to-USDT Liquidator', location: 'Noida Sec 18' },
      },
      {
        id: 'icici_mule_kol',
        label: 'ICICI AC: 004101882910',
        sublabel: 'Domestic Ingestion Pool (₹41.3L)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 89,
        x: 74,
        y: 28,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Primary Mule Account', notes: 'Connected to 6 POS merchant terminals.' },
      },
      {
        id: 'georgia_wire',
        label: 'Bank of Georgia Shell Wire',
        sublabel: 'Offshore Remittance Channel',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 93,
        x: 78,
        y: 62,
        type: 'account',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Offshore Escrow', location: 'Tbilisi, Georgia' },
      },
      {
        id: 'saltlake_facility',
        label: 'Infinity Benchmark 8th Fl',
        sublabel: 'Physical Call Floor Raid Hub',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 85,
        x: 24,
        y: 68,
        type: 'location',
        iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
        details: { location: 'Salt Lake Sec V, Kolkata', role: 'Operations Facility' },
      },
      {
        id: 'veh_wb02',
        label: 'WB02AJ1190 (Mercedes C200)',
        sublabel: 'Kingpin Transport',
        category: 'Vehicles',
        risk: 'MEDIUM',
        riskScore: 70,
        x: 48,
        y: 84,
        type: 'vehicle',
        iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
        details: { vehicleNumber: 'WB-02-AJ-1190', location: 'Park Street, Kolkata' },
      },
    ],
    edges: [
      { from: 'anirban_m', to: 'asterisk_pbx', relation: 'CONTROLS_VOIP', isHighRisk: true, label: '12,000 Robocalls/Day' },
      { from: 'anirban_m', to: 'vicky_walia', relation: 'CO_CONSPIRATOR', isHighRisk: true, label: 'USDT Liquidation' },
      { from: 'anirban_m', to: 'icici_mule_kol', relation: 'FUNDS_ROUTING', isHighRisk: true, label: '₹41,30,000 Ingestion' },
      { from: 'icici_mule_kol', to: 'georgia_wire', relation: 'OFFSHORE_SWIFT', isHighRisk: true, label: 'SWIFT MT103 Transfer' },
      { from: 'anirban_m', to: 'saltlake_facility', relation: 'PHYSICAL_CALL_FLOOR', isHighRisk: true, label: '60 Seat Operations' },
      { from: 'anirban_m', to: 'veh_wb02', relation: 'OPERATES_VEHICLE', isHighRisk: false, label: 'Registered Under Sister' },
    ],
    aiInsight: {
      suspectName: 'Anirban Mukherjee',
      syndicateName: 'Operation Chakra Tech Support Ring',
      confidenceScore: 92.6,
      explanation: 'Neural log parsing correlated Asterisk VoIP SIP trunk logs with 14 consumer complaint dossiers. Anirban Mukherjee laundered wire fraud revenues into Indian mule accounts before executing immediate SWIFT wires to Eastern European accounts.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'telecom', title: 'SIP Trunk PCAP Intercept', detail: 'Captured audio streams showing automated popup scripts coercing victim screen sharing' },
        { id: 'ev-2', iconType: 'financial', title: '₹41.3 Lakhs Domestic Smurfing', detail: 'Incoming wires split into 6 fake merchant accounts to evade automated FIU flags' },
        { id: 'ev-3', iconType: 'crypto', title: 'USDT Telegram OTC Ledger', detail: 'Exported chat records with broker Vicky Walia confirming cash-for-crypto handovers' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '20:12:00 IST',
        date: '10 Sep 2026',
        title: 'SWIFT MT103 Wire to Bank of Georgia',
        sub: 'ICICI ➔ Tbilisi Offshore Holding ($48,000 USD)',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '19:05:30 IST',
        date: '10 Sep 2026',
        title: 'SIP Trunk Spike: 64 Active International Calls',
        sub: 'Asterisk PBX • Salt Lake Sector V Facility',
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '16:40:12 IST',
        date: '10 Sep 2026',
        title: 'CCTV Arrival of Anirban Mukherjee in WB02AJ1190',
        sub: 'Infinity Benchmark Parking B2 Gate',
        category: 'cctv',
        riskSeverity: 'MEDIUM',
      },
    ],
    geoHotspot: {
      cityName: 'Kolkata',
      state: 'West Bengal',
      coordinates: [22.5726, 88.3639],
      mapX: 74,
      mapY: 48,
      riskLevel: 'HIGH',
      recentIncidentsCount: 21,
      activeSurveillanceUnit: 'Anti-Corruption & Economic Offences, CBI',
    },
    evidenceSummary: {
      total: 9,
      verified: 9,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },
  // 5. Operation Maya: Synthetic Identity & Deceptive FIR Ingestion (CRS-2026-HNY-047)
  'CRS-2026-HNY-047': {
    caseId: 'CRS-2026-HNY-047',
    leadSuspect: {
      name: 'satyakiran "Phantom" Sen',
      alias: 'Phantom Sen / Ghost Actor',
      role: 'Synthetic Identity Operator & Infiltration Specialist',
      riskScore: 99,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 94440 91820',
      location: 'Chennai & Hyderabad Triangulation',
      bio: 'Operates automated generative model pipeline injecting forged FIR dossiers into judicial registry.',
    },
    nodes: [
      {
        id: 'sen_phantom',
        label: 'satyakiran',
        sublabel: 'Synthetic Identity Master (99 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 99,
        x: 50,
        y: 50,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        details: { role: 'Lead Doppelgänger Operator', location: 'Chennai & Hyderabad', notes: 'Fabricated FIR dossier generated via recursive LLM hallucination.' },
      },
      {
        id: 'aadhaar_iris_col',
        label: 'Aadhaar IRIS Scanner',
        sublabel: 'Biometric Collision Terminal',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 96,
        x: 22,
        y: 28,
        type: 'cyber',
        iconColor: 'bg-rose-600 border-rose-400 text-rose-100',
        details: { role: 'Biometric Scanner #HYD-992', location: 'HITEC Terminal, Hyderabad' },
      },
      {
        id: 'honeypot_db_47',
        label: 'Canary DB: HNY-47',
        sublabel: 'Honeypot Tripwire Table',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 98,
        x: 78,
        y: 24,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: { role: 'Canary Token Ingestion Trap', notes: 'Triggered automated alert upon unauthorized SQL read.' },
      },
      {
        id: 'ghost_sim_che',
        label: '+91 94440 91820',
        sublabel: 'Ghost Burner SIM',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 89,
        x: 84,
        y: 58,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { phone: '+91 94440 91820', role: 'Cell Tower Mismatch (Chennai)' },
      },
      {
        id: 'darknet_relay_c2',
        label: '103.241.11.90 (Relay)',
        sublabel: 'C2 Reverse Tunnel',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 94,
        x: 20,
        y: 68,
        type: 'cyber',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Anonymized Proxy Gateway', location: 'Offshore Proxy Pool' },
      },
      {
        id: 'mule_shell_hyd',
        label: 'Canara AC: 10892049182',
        sublabel: 'Phantom Escrow Mule',
        category: 'Accounts',
        risk: 'MEDIUM',
        riskScore: 84,
        x: 52,
        y: 82,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Layered Extortion Ingestion', location: 'Hyderabad' },
      },
      {
        id: 'forged_badge_che',
        label: 'Badge #CHE-CYB-0947',
        sublabel: 'Forged Police PKI Seal',
        category: 'People',
        risk: 'HIGH',
        riskScore: 92,
        x: 74,
        y: 80,
        type: 'person',
        iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
        details: { role: 'Spoofed Investigating Officer Badge' },
      },
    ],
    edges: [
      { from: 'sen_phantom', to: 'aadhaar_iris_col', relation: 'BIOMETRIC_COLLISION', isHighRisk: true, label: '6,300 km/h Kinematic Impossibility' },
      { from: 'sen_phantom', to: 'honeypot_db_47', relation: 'HONEYPOT_TRIPWIRE', isHighRisk: true, label: 'Canary Ingestion Alert' },
      { from: 'sen_phantom', to: 'ghost_sim_che', relation: 'ENCRYPTED_SIGNAL', isHighRisk: true, label: 'Anna Salai Cell Tower Ping' },
      { from: 'sen_phantom', to: 'darknet_relay_c2', relation: 'C2_RELAY_UPLINK', isHighRisk: true, label: 'Tor Hidden Service Bridge' },
      { from: 'sen_phantom', to: 'mule_shell_hyd', relation: 'MULE_FUNNEL', isHighRisk: true, label: '₹87.5L Layered Wire' },
      { from: 'sen_phantom', to: 'forged_badge_che', relation: 'PKI_IMPERSONATION', isHighRisk: true, label: 'Spoofed Officer Signature' },
      { from: 'aadhaar_iris_col', to: 'forged_badge_che', relation: 'CROSS_JURISDICTION', isHighRisk: true, label: 'Chennai vs Hyderabad' },
    ],
    aiInsight: {
      suspectName: 'satyakiran "Phantom" Sen',
      syndicateName: 'Operation Maya Deception Ring',
      confidenceScore: 99.4,
      explanation: 'Doppelgänger AI engine flagged impossible physical travel: Suspect satyakiran reported physical server tampering in Chennai at 14:00 IST, but Aadhaar IRIS biometric terminal authentication registered in Hyderabad at 14:06 IST (630km delta in 6 mins requiring 6,300 km/h velocity).',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'biometric', title: 'Aadhaar IRIS Telemetry Collision', detail: 'Simultaneous biometric scan in Hyderabad while CDR cell towers localized device in Chennai' },
        { id: 'ev-2', iconType: 'cyber', title: 'Synthetic NLP Syntactic Fingerprint', detail: '98% structural correlation with known recursive LLM automated FIR generator template' },
        { id: 'ev-3', iconType: 'crypto', title: 'Merkle Block #19,401 Hash Invalidation', detail: 'Evidence ledger hash signature mismatch confirmed tamper attempt on FIR records' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '14:06:12 IST',
        date: '10 Sep 2026',
        title: 'Biometric Scan Authenticated in Hyderabad',
        sub: 'Aadhaar Terminal #HYD-992 • Electronic City Hub',
        category: 'location',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '14:00:00 IST',
        date: '10 Sep 2026',
        title: 'Reported Crime Scene in Chennai',
        sub: 'Anna Salai Substation • Claimed Physical Breach',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-3',
        time: '13:45:20 IST',
        date: '10 Sep 2026',
        title: 'Canary Honeypot Token Triggered',
        sub: 'Ghost DB HNY-47 Accessed by Unauthorized Proxy',
        category: 'cyber',
        riskSeverity: 'HIGH',
      },
    ],
    geoHotspot: {
      cityName: 'Chennai',
      state: 'Tamil Nadu & Telangana',
      coordinates: [13.0827, 80.2707],
      mapX: 42,
      mapY: 76,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 14,
      activeSurveillanceUnit: 'Special Cyber Crime & Counter-Deception Unit',
    },
    evidenceSummary: {
      total: 3,
      verified: 3,
      tampered: 1,
      pending: 0,
      section65bStatus: 'SEALED',
    },
  },

  // 6. Deceptive FIR Anomaly (FIR-2026-HYD-9942)
  'FIR-2026-HYD-9942': {
    caseId: 'FIR-2026-HYD-9942',
    leadSuspect: {
      name: 'Dr. Armaan "Cipher" Qureshi',
      alias: 'Cipher Qureshi / Quantum Actor',
      role: 'Banking Gateway Intrusion Operator',
      riskScore: 99,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98450 11920',
      location: 'Hyderabad & Bengaluru Corridor',
      bio: 'Core financial banking gateway intrusion specialist flagged for impossible spatio-temporal transit.',
    },
    nodes: [
      {
        id: 'armaan_q',
        label: 'Dr. Armaan Qureshi',
        sublabel: 'Gateway Intruder (99 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 99,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        details: { role: 'Lead Intrusion Actor', location: 'Hyderabad / Bengaluru' },
      },
      {
        id: 'state_bank_api',
        label: 'State Banking Core API',
        sublabel: 'Intrusion Target Point',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 98,
        x: 24,
        y: 24,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: { location: 'HITEC Cyber Towers, Hyderabad', role: 'Target Banking System' },
      },
      {
        id: 'blr_iris_term',
        label: 'Bengaluru Biometric Terminal',
        sublabel: 'Aadhaar IRIS Scan Point',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 95,
        x: 76,
        y: 22,
        type: 'cyber',
        iconColor: 'bg-rose-600 border-rose-400 text-rose-100',
        details: { location: 'Electronic City Terminal, Bengaluru', role: 'Biometric Authenticator' },
      },
      {
        id: 'vpn_exit_nl',
        label: 'VPN Exit: 185.220.101.5',
        sublabel: 'Darknet Anonymizer Node',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 91,
        x: 82,
        y: 60,
        type: 'cyber',
        iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
        details: { role: 'Encrypted Proxy Relay', location: 'Amsterdam Exit Node' },
      },
      {
        id: 'escrow_contract',
        label: 'DeFi Bridge: 0x9f8a...33a1',
        sublabel: 'Automated USDT Mixer',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 88,
        x: 20,
        y: 66,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: { role: 'Cross-Chain Escrow Mixer', notes: 'Converted ₹92L to USDT across 4 bridges.' },
      },
      {
        id: 'burner_hyd_sim',
        label: '+91 98450 11920',
        sublabel: 'Burner Intercept Line',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 84,
        x: 50,
        y: 84,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: { phone: '+91 98450 11920', role: 'VoIP Burner Signal' },
      },
    ],
    edges: [
      { from: 'armaan_q', to: 'state_bank_api', relation: 'API_BREACH_CLAIM', isHighRisk: true, label: '03:15 IST Incident Claim' },
      { from: 'armaan_q', to: 'blr_iris_term', relation: 'BIOMETRIC_AUTH_HIT', isHighRisk: true, label: '03:20 IST Biometric IRIS Scan' },
      { from: 'state_bank_api', to: 'blr_iris_term', relation: 'KINEMATIC_ANOMALY', isHighRisk: true, label: '6,840 km/h Velocity Delta' },
      { from: 'armaan_q', to: 'vpn_exit_nl', relation: 'DARKNET_UPLINK', isHighRisk: true, label: 'TLS Encrypted Session' },
      { from: 'armaan_q', to: 'escrow_contract', relation: 'FUNDS_SMURFING', isHighRisk: true, label: 'Cross-Chain Mixer' },
      { from: 'armaan_q', to: 'burner_hyd_sim', relation: 'VOIP_INTERCEPT', isHighRisk: false, label: 'Active CDR Intercept' },
    ],
    aiInsight: {
      suspectName: 'Dr. Armaan "Cipher" Qureshi',
      syndicateName: 'Central Banking Gateway Intrusion Cell',
      confidenceScore: 99.1,
      explanation: 'Doppelgänger AI engine flagged impossible physical travel: Suspect reported committing crime in Hyderabad at 03:15 IST, but Aadhaar IRIS biometric scan authenticated in Bengaluru at 03:20 IST (570km delta in 5 mins requiring 6,840 km/h velocity).',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'biometric', title: 'Aadhaar IRIS Timestamped Telemetry', detail: 'Electronic City Terminal authentication at 03:20 IST with 99.8% biometric iris confidence' },
        { id: 'ev-2', iconType: 'telecom', title: '570km Velocity Discrepancy', detail: 'Physical impossibility confirmed: travel speed calculation yields 6,840 km/h' },
        { id: 'ev-3', iconType: 'cyber', title: '96% Synthetic LLM Syntax Match', detail: 'Automated FIR text narrative generation detected matching recursive hallucination pattern' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '03:20:00 IST',
        date: '10 Sep 2026',
        title: 'Biometric IRIS Authenticated in Bengaluru',
        sub: 'Electronic City Terminal #BLR-401 • Physical IRIS Match',
        category: 'location',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '03:15:00 IST',
        date: '10 Sep 2026',
        title: 'Reported Incident at Banking Gateway in Hyderabad',
        sub: 'HITEC Cyber Towers • Claimed Ledger Tampering',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-3',
        time: '02:55:10 IST',
        date: '10 Sep 2026',
        title: 'VPN Session Egress from Amsterdam Node',
        sub: 'IP 185.220.101.5 • Encrypted TLS Ingress',
        category: 'cyber',
        riskSeverity: 'HIGH',
      },
    ],
    geoHotspot: {
      cityName: 'Hyderabad',
      state: 'Telangana / Karnataka',
      coordinates: [17.3850, 78.4867],
      mapX: 45,
      mapY: 65,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 29,
      activeSurveillanceUnit: 'National Financial Intelligence Unit (FIU-IND)',
    },
    evidenceSummary: {
      total: 6,
      verified: 6,
      tampered: 1,
      pending: 0,
      section65bStatus: 'SEALED',
    },
  },

  // Operation Garud: Fake Electricity Bill Scam & SIM Card Fraud (CASE-2026-003)
  'CASE-2026-003': {
    caseId: 'CASE-2026-003',
    leadSuspect: {
      name: 'Sunil Yadav',
      alias: 'Sunny / BESCOM Officer Ravi',
      role: 'SIM Farm Operator & Phishing OTP Ring Leader',
      riskScore: 82,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98450 11020',
      location: 'Shivajinagar, Bengaluru',
      bio: 'Operates an illegal SIM card activation shop using forged Aadhaar documents. Runs bulk SMS phishing campaigns impersonating BESCOM electricity department to harvest OTPs and drain victim bank accounts.',
    },
    nodes: [
      {
        id: 'sunil_y',
        label: 'Sunil Yadav',
        sublabel: 'SIM Farm Boss (82 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 82,
        x: 50,
        y: 48,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        details: {
          role: 'Ring Leader',
          phone: '+91 98450 11020',
          location: 'Shivajinagar Mobile Shop, Bengaluru',
          notes: 'Activated 200+ fraudulent SIMs using scanned Aadhaar photos pasted over his own image.',
        },
      },
      {
        id: 'bulk_sms_gateway',
        label: 'BulkSMS Pro Gateway',
        sublabel: 'BESCOM Phishing Portal',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 88,
        x: 50,
        y: 16,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: {
          role: 'Bulk SMS Attack Infrastructure',
          notes: 'API account registered using stolen Aadhaar. Sent 4,800+ fake "electricity disconnection" SMSes.',
        },
      },
      {
        id: 'fake_sim_card',
        label: '+91 98450 11020',
        sublabel: 'Forged Aadhaar SIM (BESCOM Caller)',
        category: 'Phones',
        risk: 'HIGH',
        riskScore: 85,
        x: 20,
        y: 30,
        type: 'phone',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: {
          role: 'Fraudulent Caller SIM',
          location: 'Jio Koramangala Tower, Bengaluru',
          notes: 'SIM registered in name of fictitious "Ramesh Kumar" with Sunil\'s photo on forged Aadhaar.',
        },
      },
      {
        id: 'otp_phish_app',
        label: 'BESCOM-Pay.apk',
        sublabel: 'OTP Harvesting Malware',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 91,
        x: 80,
        y: 28,
        type: 'cyber',
        iconColor: 'bg-orange-600 border-orange-400 text-orange-100',
        details: {
          role: 'Android RAT / OTP Stealer',
          notes: 'Fake payment app grants SMS_READ permission. Forwards all bank OTPs to Sunil\'s Telegram bot in real time.',
        },
      },
      {
        id: 'victim_account',
        label: 'Canara Bank AC: 7891234560',
        sublabel: 'Victim Account (K. Subramanian)',
        category: 'Accounts',
        risk: 'MEDIUM',
        riskScore: 55,
        x: 78,
        y: 66,
        type: 'account',
        iconColor: 'bg-yellow-600 border-yellow-400 text-yellow-100',
        details: {
          role: 'Victim Source Account',
          notes: '₹1,80,000 drained in 3 rapid UPI transfers after OTP was harvested via BESCOM-Pay.apk.',
        },
      },
      {
        id: 'sbi_mule',
        label: 'SBI AC: 55002198410',
        sublabel: 'Mule Account (Student Name)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 87,
        x: 22,
        y: 68,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: {
          role: 'Layer-1 Mule Drain Account',
          notes: 'Account opened using a forged student ID. ₹1,80,000 received; rapidly cashed out at Indiranagar ATM.',
        },
      },
      {
        id: 'atm_indiranagar',
        label: 'SBI ATM — Indiranagar',
        sublabel: 'Cash Withdrawal Point',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 78,
        x: 48,
        y: 84,
        type: 'location',
        iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
        details: {
          location: '100 Feet Road, Indiranagar, Bengaluru',
          role: 'Final Cash-out Location',
          notes: 'CCTV footage captured suspect (helmet on) at 11:05 AM withdrawing in 4 tranches of ₹40K–₹50K.',
        },
      },
    ],
    edges: [
      { from: 'sunil_y', to: 'bulk_sms_gateway', relation: 'OPERATES_PHISHING', isHighRisk: true, label: '4,800 Fake BESCOM SMSes' },
      { from: 'sunil_y', to: 'fake_sim_card', relation: 'CONTROLS_SIM', isHighRisk: true, label: 'Forged Aadhaar KYC' },
      { from: 'bulk_sms_gateway', to: 'otp_phish_app', relation: 'DELIVERS_MALWARE', isHighRisk: true, label: 'APK Link in SMS' },
      { from: 'otp_phish_app', to: 'victim_account', relation: 'OTP_INTERCEPT', isHighRisk: true, label: 'Stole Net Banking OTP' },
      { from: 'victim_account', to: 'sbi_mule', relation: 'FRAUDULENT_TRANSFER', isHighRisk: true, label: '₹1,80,000 via UPI' },
      { from: 'sbi_mule', to: 'atm_indiranagar', relation: 'CASH_WITHDRAWAL', isHighRisk: true, label: 'ATM Cash-out 11:05 AM' },
      { from: 'sunil_y', to: 'atm_indiranagar', relation: 'PHYSICALLY_PRESENT', isHighRisk: false, label: 'CCTV Sighting' },
    ],
    aiInsight: {
      suspectName: 'Sunil Yadav',
      syndicateName: 'Operation Garud BESCOM OTP Ring',
      confidenceScore: 87.4,
      explanation: 'AI SMS metadata analysis confirmed BulkSMS Pro API account linked to an Aadhaar number reported stolen in 2025. BESCOM-Pay.apk signature matches a known OTP stealer family ("SmsStealer.IN v3"). Tower CDR triangulates caller SIM to within 200m of the Shivajinagar mobile shop. ATM CCTV face-match with 94.2% certainty to Sunil Yadav from existing NCRB photo database.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'telecom', title: 'Bulk SMS Gateway API Logs', detail: '4,812 SMS messages dispatched from stolen Aadhaar API account between 09:00–10:30 AM on 10 Sep 2026' },
        { id: 'ev-2', iconType: 'cyber', title: 'BESCOM-Pay.apk Static Analysis', detail: 'Malware reads SMS_READ, SEND_SMS permissions; forwards OTPs via Telegram Bot ID: 9912837465' },
        { id: 'ev-3', iconType: 'cctv', title: 'ATM CCTV Face Match (94.2%)', detail: 'Suspect photographed at Indiranagar SBI ATM at 11:05 AM; facial geometry matches Sunil Yadav NCRB record' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '10:15:00 IST',
        date: '10 Sep 2026',
        title: 'Phishing SMS Received by Victim',
        sub: 'Fake BESCOM: "Your power will be cut tonight. Pay ₹10 now via BESCOM-Pay app."',
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-2',
        time: '10:22:31 IST',
        date: '10 Sep 2026',
        title: 'Victim Calls Scammer — Coercion Call Begins',
        sub: '+91 98450 11020 (Fake BESCOM Officer "Ravi") • 18-minute call recorded',
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '10:30:44 IST',
        date: '10 Sep 2026',
        title: 'BESCOM-Pay.apk Installed by Victim',
        sub: 'Android malware installs; SMS_READ granted; OTP forwarding active via Telegram bot',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-4',
        time: '10:34:12 IST',
        date: '10 Sep 2026',
        title: '₹1,80,000 UPI Transfer — Victim Account Drained',
        sub: 'Canara Bank 7891234560 ➔ SBI Mule 55002198410 (3 UPI transactions)',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-5',
        time: '11:05:18 IST',
        date: '10 Sep 2026',
        title: 'ATM Cash Withdrawal — Indiranagar, Bengaluru',
        sub: 'Suspect (helmet-wearing) withdraws ₹40K + ₹40K + ₹50K + ₹50K in 4 tranches',
        category: 'location',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-6',
        time: '14:20:00 IST',
        date: '10 Sep 2026',
        title: 'FIR Lodged by Victim at Koramangala PS',
        sub: 'FIR/BLR/2026/0332 registered by K. Subramanian, retired school teacher, 63 years old',
        category: 'location',
        riskSeverity: 'MEDIUM',
      },
    ],
    geoHotspot: {
      cityName: 'Bengaluru',
      state: 'Karnataka',
      coordinates: [12.9716, 77.5946],
      mapX: 44,
      mapY: 70,
      riskLevel: 'HIGH',
      recentIncidentsCount: 23,
      activeSurveillanceUnit: 'Forensic Science Laboratory (FSL) & Bengaluru Cyber Crime PS',
    },
    evidenceSummary: {
      total: 7,
      verified: 7,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },

  // Operation Task Trap: Fake YouTube Like Job Scam (CASE-2026-010)
  'CASE-2026-010': {
    caseId: 'CASE-2026-010',
    leadSuspect: {
      name: 'Rohit Verma',
      alias: '@crypto_tasks_admin / Ricky Boss',
      role: 'Telegram Scam Syndicate Kingpin',
      riskScore: 89,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 96500 71028',
      location: 'Mewat / Nuh, Haryana',
      bio: 'Operates a cross-state fake "work from home" syndicate via Telegram. Recruits college students as money mules, rents their bank accounts, and runs a phishing website (task-rewards-vip.xyz) displaying fake crypto profits to extract large UPI payments from victims. Traced via IMEI handset binding to a prior Jamtara cyber case.',
    },
    nodes: [
      {
        id: 'rohit_v',
        label: 'Rohit Verma',
        sublabel: 'Kingpin (89 Risk)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 89,
        x: 50,
        y: 46,
        type: 'center',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        details: {
          role: 'Syndicate Operator',
          phone: '+91 96500 71028',
          location: 'Nuh, Mewat, Haryana',
          notes: 'IMEI 867381024917624 matched to a prior Jamtara Cyber Crime case (FIR/JAM/2024/0882). Triangulated to Mewat tower during active Telegram chat windows.',
        },
      },
      {
        id: 'telegram_bot',
        label: 'Telegram: @crypto_tasks_admin',
        sublabel: 'Phishing Command Channel',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 86,
        x: 50,
        y: 14,
        type: 'cyber',
        iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
        details: {
          role: 'Victim Recruitment & Task Distribution',
          notes: 'Bot automated ₹150 payouts to build trust. Group had 200+ fake bot accounts simulating "profit withdrawals" to create social proof.',
        },
      },
      {
        id: 'phish_site',
        label: 'task-rewards-vip.xyz',
        sublabel: 'Fake Crypto Task Portal',
        category: 'Organisations',
        risk: 'HIGH',
        riskScore: 84,
        x: 20,
        y: 26,
        type: 'cyber',
        iconColor: 'bg-red-600 border-red-400 text-red-100',
        details: {
          role: 'Phishing Web Portal',
          notes: 'Hosted on Russian bulletproof server. Hardcoded fake balance shown to victim: ₹14,20,000. Withdrawal always blocked with "Tax Freeze" error.',
        },
      },
      {
        id: 'victim_pooja',
        label: 'Pooja (Victim, 21 yrs)',
        sublabel: 'Bengaluru College Student',
        category: 'People',
        risk: 'MEDIUM',
        riskScore: 10,
        x: 80,
        y: 26,
        type: 'person',
        iconColor: 'bg-green-600 border-green-400 text-green-100',
        details: {
          role: 'Victim — Total Loss: ₹5,00,000',
          location: 'Koramangala, Bengaluru',
          notes: 'Sent 3 UPI transfers over 2 days after being shown ₹14.2L fake balance. Complaint filed on 1930 Cybercrime Portal.',
        },
      },
      {
        id: 'mule_canara',
        label: 'Canara Bank AC: ****1102',
        sublabel: 'Mule Account 1 (₹3,00,000)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 85,
        x: 22,
        y: 70,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: {
          role: 'Layer-1 Mule Account',
          notes: 'Account holder: Amit Kumar (Mule). Account rented for ₹5,000/month. Received ₹50,000 + ₹2,50,000 from victim across 2 days.',
        },
      },
      {
        id: 'mule_icici',
        label: 'ICICI Bank AC: ****8841',
        sublabel: 'Mule Account 2 (₹2,00,000)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 83,
        x: 78,
        y: 70,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: {
          role: 'Layer-1 Mule Account',
          notes: 'Account holder: Rahul Sharma (Mule). Received ₹2,00,000 on Day 2. Withdrew ₹1,80,000 cash from Jaipur ATM within 30 minutes of receipt.',
        },
      },
      {
        id: 'atm_jaipur',
        label: 'ATM — Malviya Nagar, Jaipur',
        sublabel: 'Cash Withdrawal Point',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 79,
        x: 50,
        y: 86,
        type: 'location',
        iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
        details: {
          location: 'ICICI ATM, Malviya Nagar, Jaipur, Rajasthan',
          role: 'Final Cash-out Location',
          notes: 'Rahul Sharma withdrew ₹1,80,000 in cash at 12:15 PM on Day 2. CCTV captured face clearly. ₹20,000 mule commission retained in account.',
        },
      },
    ],
    edges: [
      { from: 'rohit_v', to: 'telegram_bot', relation: 'OPERATES_CHANNEL', isHighRisk: true, label: 'Runs Bot & Fake Group' },
      { from: 'rohit_v', to: 'phish_site', relation: 'CONTROLS_SERVER', isHighRisk: true, label: 'Admin Credentials' },
      { from: 'telegram_bot', to: 'victim_pooja', relation: 'RECRUITED_VICTIM', isHighRisk: true, label: '₹150 Trust Bait' },
      { from: 'phish_site', to: 'victim_pooja', relation: 'DISPLAYED_FAKE_BALANCE', isHighRisk: true, label: 'Showed ₹14.2L Profit' },
      { from: 'victim_pooja', to: 'mule_canara', relation: 'UPI_TRANSFER', isHighRisk: true, label: '₹3,00,000 (2 transfers)' },
      { from: 'victim_pooja', to: 'mule_icici', relation: 'UPI_TRANSFER', isHighRisk: true, label: '₹2,00,000 (Day 2)' },
      { from: 'mule_icici', to: 'atm_jaipur', relation: 'CASH_WITHDRAWAL', isHighRisk: true, label: '₹1,80,000 ATM Cash-out' },
      { from: 'rohit_v', to: 'mule_canara', relation: 'CONTROLS_MULE', isHighRisk: false, label: 'Recruited Amit Kumar' },
      { from: 'rohit_v', to: 'mule_icici', relation: 'CONTROLS_MULE', isHighRisk: false, label: 'Recruited Rahul Sharma' },
    ],
    aiInsight: {
      suspectName: 'Rohit Verma',
      syndicateName: 'Operation Task Trap — Fake Job Syndicate',
      confidenceScore: 94.2,
      explanation: 'Cross-case IMEI correlation matched the burner Airtel SIM (+91-96500-71028) used by the Telegram admin to IMEI handset 867381024917624 — the same physical device used in FIR/JAM/2024/0882 (Jamtara Cyber Case). CDR tower records place this handset within 300m of Rohit Verma\'s known address in Nuh, Mewat, during the entire 48-hour fraud window. The phishing domain (task-rewards-vip.xyz) DNS registrant email matches a disposable ID previously associated with Rohit Verma\'s alias "Ricky Boss".',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'telecom', title: 'IMEI Cross-Case Match (94.2%)', detail: 'Burner SIM IMEI 867381024917624 linked to Rohit Verma via prior Jamtara FIR/2024/0882. CDR confirms handset active in Mewat during entire fraud window.' },
        { id: 'ev-2', iconType: 'financial', title: 'UPI Trail — 3 Transfers Traced', detail: 'All 3 UPI UTR IDs from victim\'s bank statement traced to Canara (₹3L) and ICICI (₹2L) mule accounts registered to Amit Kumar & Rahul Sharma.' },
        { id: 'ev-3', iconType: 'cctv', title: 'Jaipur ATM CCTV — Mule Identified', detail: 'Rahul Sharma\'s face clearly visible at ICICI ATM Malviya Nagar at 12:15 PM. Timestamp matches withdrawal transaction within 2 minutes.' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '10:00 AM',
        date: '12 Sep 2026',
        title: 'WhatsApp Hook — "Earn ₹2,000 Daily"',
        sub: 'Victim Pooja (21, Student, Bengaluru) receives unsolicited WhatsApp message from spoofed number (+1-202-555-0143) offering ₹50 per YouTube like task.',
        category: 'call',
        riskSeverity: 'MEDIUM',
      },
      {
        id: 'tm-2',
        time: '11:15 AM',
        date: '12 Sep 2026',
        title: '₹150 Bait Payout Credited via UPI',
        sub: 'Scammer credits ₹150 bait payout to Pooja\'s SBI account after 3 video likes to establish legitimacy. Tricked into joining VIP Telegram Group @vip_yt_tasks.',
        category: 'transaction',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '02:00 PM',
        date: '12 Sep 2026',
        title: 'Task Tier 1 — ₹50,000 Transferred to Canara Mule',
        sub: 'Scammer demands ₹50,000 prepaid deposit for \'Level 1 VIP Task\'. Pooja transfers ₹50,000 to Canara Bank Mule A/C (Amit Kumar). Fake dashboard reflects ₹65,000 balance.',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-4',
        time: '09:30 AM',
        date: '13 Sep 2026',
        title: 'Task Tier 2 — ₹2,50,000 Transferred to Canara Mule',
        sub: 'Scammer blocks withdrawal, claiming ₹2,50,000 required to \'unlock VIP Tier 2 commission\'. Pooja transfers ₹2,50,000 to same Canara Mule. Total on Mule 1: ₹3,00,000.',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-5',
        time: '11:45 AM',
        date: '13 Sep 2026',
        title: 'Task Tier 3 — ₹2,00,000 Transferred to ICICI Mule',
        sub: 'Scammer claims \'system score error, one final clearance deposit needed\'. Pooja borrows and transfers ₹2,00,000 to ICICI Bank Mule A/C (Rahul Sharma). Total scammed: ₹5,00,000.',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-6',
        time: '12:15 PM',
        date: '13 Sep 2026',
        title: 'ATM Cash-out — ₹1,80,000 Withdrawn in Jaipur',
        sub: 'Mule Rahul Sharma withdraws ₹1,80,000 cash from ICICI Bank ATM, MI Road, Jaipur within 30 minutes. Keeps ₹20,000 commission. CCTV captures clear facial identification.',
        category: 'location',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-7',
        time: '01:00 PM',
        date: '13 Sep 2026',
        title: 'Account Deleted & IMEI Cross-Case Match to Rohit Verma',
        sub: 'Telegram Admin (@crypto_tasks_admin) deletes account and vanishes. Victim files complaint on 1930 portal. CDR/IPDR analysis links burner SIM (+91-96500-71028) & IMEI 867381024917624 directly to Kingpin Rohit Verma (Mewat), cross-matching prior Jamtara FIR/JAM/2024/0882.',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
    ],
    geoHotspot: {
      cityName: 'Bengaluru',
      state: 'Karnataka',
      coordinates: [12.9352, 77.6245],
      mapX: 44,
      mapY: 70,
      riskLevel: 'HIGH',
      recentIncidentsCount: 31,
      activeSurveillanceUnit: 'Bengaluru Cyber Crime PS & Jaipur Cyber Cell',
    },
    evidenceSummary: {
      total: 5,
      verified: 5,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },
  'CASE-2026-011': {
    caseId: 'CASE-2026-011',
    leadSuspect: {
      name: 'Vikram Gurjar',
      alias: 'DCP Vikram Rathore / Bharatpur Syndicate Leader',
      role: 'Digital Arrest Syndicate Kingpin & Fake IPS Officer',
      riskScore: 98,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces',
      phone: '+91-98290-11842',
      location: 'Deeg Road Cyber Belt, Bharatpur, Rajasthan',
      bio: 'Operates an industrial-scale "Digital Arrest" extortion syndicate from a soundproofed fake police studio in Bharatpur/Deeg. Impersonates senior IPS officers over Skype/WhatsApp video with authentic backdrops and fake Supreme Court secrecy warrants. Traced via DoT LIMS VoIP voiceprint matching Rajasthan FIR/BHR/2023/0419.',
    },
    nodes: [
      {
        id: 'vikram_g',
        label: 'Vikram Gurjar (Alias: DCP Rathore)',
        sublabel: 'Syndicate Kingpin (Bharatpur)',
        category: 'People',
        risk: 'HIGH',
        riskScore: 98,
        x: 50,
        y: 12,
        type: 'person',
        iconColor: 'bg-rose-600 border-rose-400 text-rose-100',
        details: {
          role: 'Syndicate Kingpin & Fake IPS Officer',
          location: 'Deeg Road Cyber Belt, Bharatpur, Rajasthan',
          phone: '+91-98290-11842',
          notes: 'Impersonated DCP Rathore on Skype video wearing full IPS uniform. Voiceprint confirmed 96.8% match against Rajasthan Police biometric database.',
        },
      },
      {
        id: 'voip_studio',
        label: 'Fake CBI Studio / Asterisk SIP',
        sublabel: 'VoIP Gateway (BKC / Deeg)',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 89,
        x: 18,
        y: 28,
        type: 'server',
        iconColor: 'bg-indigo-600 border-indigo-400 text-indigo-100',
        details: {
          location: 'Bandra-Kurla Complex Colocation & Deeg Safehouse',
          role: 'VoIP Spoofing & Fake Police Studio (IP: 103.212.44.89)',
          notes: 'Unauthenticated Asterisk SIP trunk spoofing FedEx landline +91-80-4920-8812. Soundproofed studio with official state emblem and police wireless sound effects.',
        },
      },
      {
        id: 'victim_aruna',
        label: 'Dr. Aruna Rao (Victim)',
        sublabel: 'Retired Principal, Hyderabad',
        category: 'People',
        risk: 'LOW',
        riskScore: 10,
        x: 50,
        y: 45,
        type: 'person',
        iconColor: 'bg-amber-500 border-amber-300 text-amber-950',
        details: {
          role: 'Primary Extortion Victim (SBI Banjara Hills)',
          location: 'Banjara Hills Road No. 12, Hyderabad, Telangana',
          notes: 'Kept under 6-hour continuous Skype "Digital Arrest" under threat of physical SWAT raid and asset confiscation. Coerced into ₹10,00,000 RTGS transfers.',
        },
      },
      {
        id: 'mule_hdfc',
        label: 'HDFC Bank AC: ****4421',
        sublabel: 'Mule 1 (₹6,00,000 FROZEN)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 88,
        x: 22,
        y: 70,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: {
          role: 'Layer-1 Mule Account (Dinesh Patel, Ahmedabad)',
          notes: 'Received ₹6,00,000 RTGS at 11:30 AM. Successfully frozen under Section 106 BNSS by Hyderabad Cyber Police within 4 hours.',
        },
      },
      {
        id: 'mule_axis',
        label: 'Axis Bank AC: ****9912',
        sublabel: 'Mule 2 (₹4,00,000 Layering)',
        category: 'Accounts',
        risk: 'HIGH',
        riskScore: 92,
        x: 78,
        y: 70,
        type: 'account',
        iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
        details: {
          role: 'Layer-1 Mule Account (Mukesh Solanki, Surat)',
          notes: 'Received ₹4,00,000 RTGS at 01:15 PM. Balance checked at Majura Gate branch, followed by immediate cash withdrawal.',
        },
      },
      {
        id: 'atm_surat',
        label: 'ICICI ATM — Ring Road, Surat',
        sublabel: 'Cash-out Point (₹3,60,000)',
        category: 'Locations',
        risk: 'HIGH',
        riskScore: 84,
        x: 78,
        y: 88,
        type: 'location',
        iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
        details: {
          location: 'Ring Road Textile Market, Surat, Gujarat',
          role: 'Final Cash-out Location',
          notes: 'Mukesh Solanki withdrew ₹3,60,000 in cash (9 x ₹40,000) at 01:50 PM. Retained ₹40,000 (10% fee). 4K CCTV frame matched face vector at 97.1%.',
        },
      },
    ],
    edges: [
      { from: 'vikram_g', to: 'voip_studio', relation: 'OPERATES_STUDIO', isHighRisk: true, label: 'VoIP SIP & Fake Set' },
      { from: 'voip_studio', to: 'victim_aruna', relation: 'SKYPE_DIGITAL_ARREST', isHighRisk: true, label: '6-Hour Coercive Call' },
      { from: 'victim_aruna', to: 'mule_hdfc', relation: 'RTGS_TRANSFER', isHighRisk: true, label: '₹6,00,000 (Sec 106 Frozen)' },
      { from: 'victim_aruna', to: 'mule_axis', relation: 'RTGS_TRANSFER', isHighRisk: true, label: '₹4,00,000 (Tranche 2)' },
      { from: 'mule_axis', to: 'atm_surat', relation: 'CASH_WITHDRAWAL', isHighRisk: true, label: '₹3,60,000 (9 ATM Txns)' },
      { from: 'vikram_g', to: 'mule_hdfc', relation: 'CONTROLS_MULE', isHighRisk: false, label: 'Recruited Dinesh Patel' },
      { from: 'vikram_g', to: 'mule_axis', relation: 'CONTROLS_MULE', isHighRisk: false, label: 'Recruited Mukesh Solanki' },
      { from: 'atm_surat', to: 'vikram_g', relation: 'ANGADIA_COURIER', isHighRisk: true, label: 'Cash Transit to Bharatpur' },
    ],
    aiInsight: {
      suspectName: 'Vikram Gurjar',
      syndicateName: 'Operation Parcel Trap — Digital Arrest Syndicate',
      confidenceScore: 96.8,
      explanation: 'DoT Telecom LIMS triangulated the Asterisk SIP proxy server gateway and VoIP SIP traffic to a fake police studio in Deeg, Bharatpur (Rajasthan). AI Voiceprint acoustic spectrogram analysis matched the voice of "DCP Rathore" on the Skype call to suspect Vikram Gurjar with 96.8% biometric similarity, corroborating prior Rajasthan extortion FIR/BHR/2023/0419. Surat Ring Road ATM CCTV captured mule runner Mukesh Solanki withdrawing ₹3,60,000 with a 97.1% facial vector match.',
      evidenceSummary: [
        { id: 'ev-1', iconType: 'telecom', title: 'VoIP Voiceprint Biometric (96.8%)', detail: 'DoT LIMS & CFSL voice spectrogram matched Skype caller audio to Vikram Gurjar, linking him to Rajasthan FIR/BHR/2023/0419.' },
        { id: 'ev-2', iconType: 'financial', title: 'RTGS Trail & ₹6L Freeze', detail: '₹6,00,000 frozen under Section 106 BNSS at HDFC Bank Ahmedabad. ₹4,00,000 traced to Axis Bank Surat mule account.' },
        { id: 'ev-3', iconType: 'cctv', title: 'Surat ATM CCTV (97.1% Match)', detail: '4K CCTV from ICICI ATM Ring Road confirmed mule runner Mukesh Solanki withdrawing ₹3,60,000 across 9 transactions.' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '09:15 AM',
        date: '14 Sep 2026',
        title: 'FedEx IVR Robocall — "Narcotics Seized"',
        sub: 'Victim Dr. Aruna Rao (Banjara Hills, Hyderabad) receives automated call from +91-80-4920-8812 alleging an international parcel with 140g MDMA was seized under her Aadhaar.',
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-2',
        time: '10:00 AM',
        date: '14 Sep 2026',
        title: 'Skype "Digital Arrest" Video Session',
        sub: 'Scammer in full IPS uniform on Skype video orders victim into a 6-hour virtual house arrest. Displays forged Supreme Court Secrecy Order.',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-3',
        time: '11:30 AM',
        date: '14 Sep 2026',
        title: 'Transfer 1 — ₹6,00,000 to HDFC Mule',
        sub: 'Victim transfers ₹6,00,000 via RTGS from SBI to HDFC Bank A/C ****4421 (Dinesh Patel, Ahmedabad) for "RBI Sovereign Escrow Verification".',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-4',
        time: '01:15 PM',
        date: '14 Sep 2026',
        title: 'Transfer 2 — ₹4,00,000 to Axis Mule',
        sub: 'Scammer claims "second bank clearance required". Victim transfers remaining ₹4,00,000 to Axis Bank A/C ****9912 (Mukesh Solanki, Surat).',
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-5',
        time: '01:50 PM',
        date: '14 Sep 2026',
        title: 'ATM Cash-Out — ₹3,60,000 in Surat',
        sub: 'Mule runner Mukesh Solanki executes 9 consecutive ATM withdrawals of ₹40,000 at ICICI ATM Ring Road, Surat. Retains ₹40,000 cut.',
        category: 'location',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-6',
        time: '03:00 PM',
        date: '14 Sep 2026',
        title: 'Victim Realizes Scam & Dials 1930',
        sub: 'Scammer demands another ₹5 Lakh from fixed deposits. Victim alerts family; FIR registered on National Cyber Crime Portal.',
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-7',
        time: '03:45 PM',
        date: '14 Sep 2026',
        title: 'VoIP Intercept & Cross-Case Match',
        sub: 'DoT LIMS & AI Voiceprint match Skype caller audio to Vikram Gurjar, linking him to Rajasthan FIR/BHR/2023/0419. HDFC account frozen with ₹6,00,000 intact.',
        category: 'cyber',
        riskSeverity: 'CRITICAL',
      },
    ],
    geoHotspot: {
      cityName: 'Hyderabad',
      state: 'Telangana',
      coordinates: [17.4156, 78.4350],
      mapX: 48,
      mapY: 60,
      riskLevel: 'CRITICAL',
      recentIncidentsCount: 42,
      activeSurveillanceUnit: 'CID Cyber Crime Division Hyderabad & Surat Cyber Cell',
    },
    evidenceSummary: {
      total: 5,
      verified: 5,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  },
};

// Seeded deterministic random generator to build dynamic, varied graph topologies for any report
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Fallback generator for other cases
export function getActiveCaseIntelligence(caseObj: any): CaseNetworkData {
  if (!caseObj) {
    return CASE_INTELLIGENCE_REGISTRY['CASE-2026-002'];
  }
  const id = caseObj.id;
  if (CASE_INTELLIGENCE_REGISTRY[id]) {
    return CASE_INTELLIGENCE_REGISTRY[id];
  }

  // Dynamic generator based on case metadata
  const title = caseObj.title || 'Active Investigation';
  const suspectName = caseObj.lead_suspect || caseObj.suspectName || 'Key Syndicate Operative';
  const city = caseObj.jurisdiction_city || caseObj.location || 'National Jurisdiction';
  const fir = caseObj.fir_number || caseObj.firNumber || id;
  const category = caseObj.crime_category || (caseObj.isCompromised ? 'DECEPTIVE_FIR' : 'CYBER_ATTACK');

  // Compute seed from case ID string
  const seedNum = (id + fir + title).split('').reduce((acc: number, char: string, idx: number) => acc + char.charCodeAt(0) * (idx + 1) * 31, 1013);
  const rand = seededRandom(seedNum);

  // Dynamic peripheral nodes with unique polar layout coordinates
  const nodeCount = 5 + Math.floor(rand() * 3); // 5 to 7 peripheral nodes
  const dynamicNodes: (NetworkNode & { sublabel?: string; iconColor?: string; type?: string })[] = [];
  const dynamicEdges: (NetworkEdge & { label?: string; flowSpeed?: number })[] = [];

  const centerNodeId = `${id}_center`;
  dynamicNodes.push({
    id: centerNodeId,
    label: suspectName,
    sublabel: `Lead Target (${caseObj.priority === 'CRITICAL' ? '98' : '88'} Risk)`,
    category: 'People',
    risk: caseObj.priority === 'CRITICAL' || caseObj.isCompromised ? 'HIGH' : 'MEDIUM',
    riskScore: caseObj.priority === 'CRITICAL' ? 98 : 88,
    x: 50,
    y: 48,
    type: 'center',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    details: { role: caseObj.lead_suspect_role || 'Prime Operative', location: city, notes: `Central entity linked to ${fir}` },
  });

  const categoryPool: NetworkNode['category'][] = ['Phones', 'Accounts', 'Locations', 'Vehicles', 'Organisations', 'People'];
  const baseRadius = 32 + rand() * 6; // 32% to 38% radius

  for (let i = 0; i < nodeCount; i++) {
    const angle = ((2 * Math.PI * i) / nodeCount) + (rand() * 0.4 - 0.2) - Math.PI / 2;
    const radiusVariation = baseRadius + (i % 2 === 0 ? 5 : -4);
    const nodeX = Math.round(Math.min(88, Math.max(12, 50 + radiusVariation * Math.cos(angle))));
    const nodeY = Math.round(Math.min(86, Math.max(14, 48 + (radiusVariation * 0.85) * Math.sin(angle))));

    const nodeCategory = categoryPool[i % categoryPool.length];
    const peripheralNodeId = `${id}_node_${i + 1}`;
    const riskScore = 70 + Math.floor(rand() * 26);
    const isHighRisk = riskScore >= 85;

    let label = '';
    let sublabel = '';
    let type = 'person';
    let iconColor = 'bg-purple-600 border-purple-400 text-purple-100';
    let edgeRelation = 'LINKED_TO';
    let edgeLabel = 'Active Channel';

    if (nodeCategory === 'Phones') {
      label = `+91 98${Math.floor(100 + rand() * 899)} ${Math.floor(10000 + rand() * 89999)}`;
      sublabel = 'Intercepted CDR Line';
      type = 'phone';
      iconColor = 'bg-blue-600 border-blue-400 text-blue-100';
      edgeRelation = 'TELECOM_INTERCEPT';
      edgeLabel = 'Encrypted Voice & CDR';
    } else if (nodeCategory === 'Accounts') {
      label = `HDFC AC: ${Math.floor(50100000000 + rand() * 8999999999)}`;
      sublabel = `Mule Escrow (₹${(12 + Math.floor(rand() * 60))}L)`;
      type = 'account';
      iconColor = 'bg-emerald-600 border-emerald-400 text-emerald-100';
      edgeRelation = 'MULE_FUNDS_TRANSFER';
      edgeLabel = 'Proceeds Layering';
    } else if (nodeCategory === 'Locations') {
      label = `${city} Sector ${Math.floor(1 + rand() * 40)}`;
      sublabel = 'Suspect Stash / Base';
      type = 'location';
      iconColor = 'bg-cyan-600 border-cyan-400 text-cyan-100';
      edgeRelation = 'GEOGRAPHIC_BASE';
      edgeLabel = 'Cell Tower Overlap';
    } else if (nodeCategory === 'Vehicles') {
      label = `DL${Math.floor(1 + rand() * 12)}AB${Math.floor(1000 + rand() * 8999)}`;
      sublabel = 'ANPR Surveillance Match';
      type = 'vehicle';
      iconColor = 'bg-amber-600 border-amber-400 text-amber-100';
      edgeRelation = 'OPERATES_VEHICLE';
      edgeLabel = 'CCTV License Plate Hit';
    } else if (nodeCategory === 'Organisations') {
      label = `Relay ${Math.floor(100 + rand() * 899)}.${Math.floor(10 + rand() * 89)}.10.45`;
      sublabel = 'Darknet C2 Node';
      type = 'cyber';
      iconColor = 'bg-red-600 border-red-400 text-red-100';
      edgeRelation = 'C2_BEACON';
      edgeLabel = 'Reverse TLS Socket';
    } else {
      label = `Co-Accused #${i + 1}`;
      sublabel = 'Syndicate Accomplice';
      type = 'person';
      iconColor = 'bg-purple-600 border-purple-400 text-purple-100';
      edgeRelation = 'CO_CONSPIRATOR';
      edgeLabel = 'Encrypted Signal Chat';
    }

    dynamicNodes.push({
      id: peripheralNodeId,
      label,
      sublabel,
      category: nodeCategory,
      risk: isHighRisk ? 'HIGH' : 'MEDIUM',
      riskScore,
      x: nodeX,
      y: nodeY,
      type,
      iconColor,
      details: { role: sublabel, location: city },
    });

    dynamicEdges.push({
      from: centerNodeId,
      to: peripheralNodeId,
      relation: edgeRelation,
      isHighRisk,
      label: edgeLabel,
    });
  }

  // Cross-link one pair of peripheral nodes for richer realistic topology
  if (dynamicNodes.length > 3) {
    dynamicEdges.push({
      from: dynamicNodes[1].id,
      to: dynamicNodes[2].id,
      relation: 'INTER_ENTITY_FLOW',
      isHighRisk: false,
      label: 'Secondary Link',
    });
  }

  return {
    caseId: id,
    leadSuspect: {
      name: suspectName,
      alias: 'Unknown Operator',
      role: caseObj.lead_suspect_role || 'Syndicate Prime Target',
      riskScore: caseObj.priority === 'CRITICAL' ? 98 : 88,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98453 34455',
      location: city,
      bio: `Prime suspect identified in connection with ${fir} (${title}).`,
    },
    nodes: dynamicNodes,
    edges: dynamicEdges,
    aiInsight: {
      suspectName,
      syndicateName: `${title} Syndicate`,
      confidenceScore: 93.4,
      explanation: `AI cross-correlator mapped ${dynamicNodes.length} high-frequency nodes associating ${suspectName} with active ${category.replace('_', ' ')} operations in ${city}. Cryptographic verification on ledger confirms tamper-proof evidence custody.`,
      evidenceSummary: [
        { id: 'ev-1', iconType: 'financial', title: 'Layered Bank Transactions', detail: 'Suspicious fund routing detected through regional accounts' },
        { id: 'ev-2', iconType: 'telecom', title: 'Cell Tower Triangulation', detail: 'Synchronized location handoffs matching active crime timestamps' },
        { id: 'ev-3', iconType: 'crypto', title: 'Cryptographic Chain Seal', detail: 'All digital evidence hashed and committed to tamper-proof Merkle ledger' },
      ],
    },
    timeMachineEvents: [
      {
        id: 'tm-1',
        time: '22:15:00 IST',
        date: '10 Sep 2026',
        title: 'High-Value Financial Transaction Logged',
        sub: `Core Banking Network • ${city}`,
        category: 'transaction',
        riskSeverity: 'CRITICAL',
      },
      {
        id: 'tm-2',
        time: '20:30:15 IST',
        date: '10 Sep 2026',
        title: 'Cell Tower Handoff and Intercept',
        sub: `${city} Central Cellular Sector B`,
        category: 'call',
        riskSeverity: 'HIGH',
      },
      {
        id: 'tm-3',
        time: '18:45:00 IST',
        date: '10 Sep 2026',
        title: 'CCTV Vehicle ANPR Hit',
        sub: `Automated License Plate Match at Junction 4`,
        category: 'cctv',
        riskSeverity: 'MEDIUM',
      },
    ],
    geoHotspot: {
      cityName: city.split('&')[0].trim(),
      state: 'India Jurisdiction',
      coordinates: [20.5937, 78.9629],
      mapX: 45,
      mapY: 55,
      riskLevel: 'HIGH',
      recentIncidentsCount: 19,
      activeSurveillanceUnit: `${caseObj.department || 'National Cyber Cell'}`,
    },
    evidenceSummary: {
      total: caseObj.evidence_count || 6,
      verified: caseObj.evidence_count || 6,
      tampered: 0,
      pending: 0,
      section65bStatus: 'CERTIFIED',
    },
  };
}

