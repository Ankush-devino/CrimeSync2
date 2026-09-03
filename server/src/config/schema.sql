-- ==========================================================
-- CrimeSync PostgreSQL Relational Schema (Neon Cloud)
-- ==========================================================

-- 1. Users & Law Enforcement Officers
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    badge_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'LEAD_INVESTIGATOR', 'CYBER_ANALYST', 'FIELD_OFFICER', 'FORENSIC_EXPERT')),
    department VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crime Cases & FIRs
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(50) PRIMARY KEY,
    fir_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    crime_category VARCHAR(50) NOT NULL CHECK (crime_category IN ('FINANCIAL_FRAUD', 'CYBER_ATTACK', 'ORGANIZED_SYNDICATE', 'NARCOTICS', 'TERROR_FINANCE', 'IDENTITY_THEFT')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'UNDER_REVIEW', 'CLOSED', 'ESCALATED')),
    lead_investigator_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    jurisdiction_city VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Digital & Physical Evidence Registry
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) REFERENCES cases(id) ON DELETE CASCADE,
    evidence_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('DIGITAL_HARDWARE', 'MOBILE_DEVICE', 'BANK_STATEMENT', 'CALL_RECORD', 'SERVER_LOG', 'FORENSIC_IMAGE', 'CCTV_FOOTAGE')),
    file_url TEXT,
    hash_sha256 VARCHAR(64) NOT NULL,
    collected_by_id VARCHAR(50) REFERENCES users(id),
    current_custody_officer_id VARCHAR(50) REFERENCES users(id),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL CHECK (status IN ('SECURED', 'IN_FORENSICS', 'COURT_SUBMITTED', 'ARCHIVED'))
);

-- 4. Evidence Chain of Custody (Immutable Ledger)
CREATE TABLE IF NOT EXISTS custody_chain (
    id VARCHAR(50) PRIMARY KEY,
    evidence_id VARCHAR(50) REFERENCES evidence(id) ON DELETE CASCADE,
    handled_by_id VARCHAR(50) REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('COLLECTED', 'TRANSFERRED', 'ANALYZED', 'SEALED', 'SUBMITTED_TO_COURT')),
    transferred_to_id VARCHAR(50) REFERENCES users(id),
    notes TEXT,
    digital_signature VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cyber Threats & Kill Chain Events
CREATE TABLE IF NOT EXISTS threats (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) REFERENCES cases(id) ON DELETE SET NULL,
    threat_name VARCHAR(150) NOT NULL,
    threat_type VARCHAR(50) NOT NULL CHECK (threat_type IN ('RANSOMWARE', 'PHISHING_CAMPAIGN', 'DDOS', 'CREDENTIAL_STUFFING', 'MALWARE_C2', 'DATA_EXFILTRATION')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'CONTAINED', 'MITIGATED', 'MONITORED')),
    origin_ip VARCHAR(50),
    origin_city VARCHAR(50),
    target_infrastructure VARCHAR(100),
    risk_score NUMERIC(4, 2) DEFAULT 0.0,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Financial Intelligence & Hawala/Mule Transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) REFERENCES cases(id) ON DELETE SET NULL,
    transaction_ref VARCHAR(50) UNIQUE NOT NULL,
    source_account VARCHAR(50) NOT NULL,
    source_holder_name VARCHAR(100) NOT NULL,
    target_account VARCHAR(50) NOT NULL,
    target_holder_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    amount_inr NUMERIC(14, 2) NOT NULL,
    channel VARCHAR(30) CHECK (channel IN ('NEFT', 'RTGS', 'IMPS', 'UPI', 'HAWALA', 'CRYPTO_CONVERSION')),
    suspicious_score NUMERIC(4, 2) DEFAULT 0.0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Geo-Intelligence & Crime Hotspots
CREATE TABLE IF NOT EXISTS geo_intel_events (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) REFERENCES cases(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Trail (Immutable System Activity)
CREATE TABLE IF NOT EXISTS audit_trail (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    ip_address VARCHAR(50),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);
CREATE INDEX IF NOT EXISTS idx_fin_source ON financial_transactions(source_account);
CREATE INDEX IF NOT EXISTS idx_fin_target ON financial_transactions(target_account);
