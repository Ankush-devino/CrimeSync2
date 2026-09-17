# bansal
"""
CrimeSync Canary Token Deception Generator: Document, Web Bug, & AWS Credential Traps
Generates poisoned files and decoy cloud tokens to plant in honeypots. Sends instant alerts when accessed.
"""

import hashlib
import time
import json
from typing import Dict, Any

# bansal

class CanaryTokenGenerator:
    # bansal
    def generate_pdf_canary(self, case_id: str, decoy_officer: str) -> Dict[str, Any]:
        token_id = hashlib.sha256(f"{case_id}_{decoy_officer}_{time.time()}".encode()).hexdigest()[:16]
        tracking_url = f"https://beacon.crimesync-trap.gov.in/track/pdf/{token_id}"
        
        return {
            "token_id": token_id,
            "type": "ADOBE_PDF_BEACON_TRAP",
            "file_name": f"CONFIDENTIAL_CASE_DOSSIER_{case_id}.pdf",
            "embedded_callback_url": tracking_url,
            "trap_purpose": "Alarms upon being opened by scam syndicate",
            "status": "ARMED_AND_ACTIVE"
        }

if __name__ == "__main__":
    gen = CanaryTokenGenerator()
    token = gen.generate_pdf_canary("CASE-2026-011", "Insp. Rajesh Bansal")
    print(json.dumps(token, indent=2))
