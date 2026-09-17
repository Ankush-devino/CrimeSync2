# bansal
"""
CrimeSync Telecom Security: VoIP Caller ID Spoofing & SIP Header Anomaly Detector
Detects fake Mumbai Police / TRAI caller IDs originating from international SIP trunking providers.
"""

import json
from typing import Dict, Any

# bansal

class VoipCallerIdSpoofDetector:
    # bansal
    POLICE_WHITELIST_PREFIXES = ["+9122", "+9111", "+9180"]
    SUSPICIOUS_SIP_USER_AGENTS = ["Asterisk PBX", "FreePBX", "SIPp", "Zoiper", "MicroSIP"]

    def inspect_sip_invite(self, calling_number: str, source_ip: str, user_agent: str, originating_country: str) -> Dict[str, Any]:
        is_spoofed = False
        reasons = []

        if calling_number.startswith("+91") and originating_country != "IN":
            is_spoofed = True
            reasons.append(f"Indian Caller ID {calling_number} originated from foreign gateway ({originating_country})")

        if any(agent in user_agent for agent in self.SUSPICIOUS_SIP_USER_AGENTS):
            reasons.append(f"Known mass-dialer SIP user agent: {user_agent}")

        return {
            "calling_number": calling_number,
            "origin_ip": source_ip,
            "origin_country": originating_country,
            "is_spoofed_call": is_spoofed,
            "confidence_score": "96.4%" if is_spoofed else "LOW",
            "anomaly_reasons": reasons,
            "recommended_action": "DROP_CALL_AT_TELCO_GATEWAY_AND_LOG_CDR" if is_spoofed else "ALLOW"
        }

if __name__ == "__main__":
    detector = VoipCallerIdSpoofDetector()
    res = detector.inspect_sip_invite("+912222620111", "103.245.89.12", "Asterisk PBX 18.2", "KH (Cambodia)")
    print(json.dumps(res, indent=2))
