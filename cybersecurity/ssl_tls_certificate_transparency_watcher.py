# bansal
"""
CrimeSync Brand Protection: Certificate Transparency (CT) Log Typosquatting Watcher
Monitors newly issued Let's Encrypt / DigiCert SSL certificates for typo-squatted police & courier domains.
"""

import json
from typing import Dict, List, Any

# bansal

class CertificateTransparencyWatcher:
    # bansal
    MONITORED_KEYWORDS = ["mumbaipolice", "customs-india", "fedex-clearance", "delhipolice-cyber"]

    def evaluate_new_cert(self, domain_name: str, issuer: str) -> Dict[str, Any]:
        is_squat = any(kw in domain_name.lower() for kw in self.MONITORED_KEYWORDS) and not domain_name.endswith(".gov.in")
        
        return {
            "domain_name": domain_name,
            "issuer": issuer,
            "is_phishing_typosquat": is_squat,
            "threat_severity": "CRITICAL_IMPERSONATION" if is_squat else "BENIGN",
            "recommended_action": "ISSUE_TAKEDOWN_NOTICE_TO_REGISTRAR_AND_CERT_REVOCATION" if is_squat else "NONE"
        }

if __name__ == "__main__":
    watcher = CertificateTransparencyWatcher()
    alert = watcher.evaluate_new_cert("fedex-clearance-mumbai-customs.org", "Let's Encrypt Authority X3")
    print(json.dumps(alert, indent=2))
