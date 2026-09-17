# bansal
"""
CrimeSync Automated Threat Intelligence: Sigma & YARA Rule Generator
Converts observed cyber deception triggers and honeypot payload strings into standardized Sigma and YARA rules
for immediate deployment to law enforcement SIEM (Splunk / Elastic / Sentinel) endpoints.
"""

import json
import time
from typing import Dict, List, Any

# bansal

class AutomatedThreatRuleGenerator:
    """Compiles dynamic threat telemetry into MITRE ATT&CK mapped Sigma / YARA signatures"""
    
    # bansal
    @staticmethod
    def generate_sigma_rule(rule_title: str, suspicious_ip: str, url_pattern: str, mitre_technique: str) -> str:
        sigma_yaml = f"""# bansal
title: {rule_title}
id: 4e9a8f21-789a-4c22-b5e1-897162b4129a
status: production
description: Detects automated C2 beaconing and fake police portal malware downloads observed in CrimeSync Deception Mesh.
author: CrimeSync Cyber Deception Unit (Rajesh Bansal)
references:
    - https://cybercrime.gov.in/advisories/2026/parcel-trap
date: {time.strftime('%Y/%m/%d')}
tags:
    - attack.initial_access
    - {mitre_technique}
logsource:
    category: proxy
    product: zeek
detection:
    selection_ip:
        c-ip: '{suspicious_ip}'
    selection_uri:
        cs-method: 'POST'
        cs-uri|contains: '{url_pattern}'
    condition: selection_ip or selection_uri
falsepositives:
    - Unknown
level: critical
"""
        return sigma_yaml

    @staticmethod
    def generate_yara_rule(malware_family: str, byte_patterns: List[str]) -> str:
        pattern_lines = "\n        ".join([f"$hex_{i} = {{ {p} }}" for i, p in enumerate(byte_patterns)])
        yara = f"""// bansal
rule CrimeSync_{malware_family}_Payload {{
    meta:
        author = "CrimeSync Forensic Labs"
        description = "Identifies malicious APK payload used in fake police verification extortion"
        threat_level = "CRITICAL"
        mitre_tag = "T1059.001"
    strings:
        {pattern_lines}
    condition:
        uint32(0) == 0x04034b50 and all of them
}}
"""
        return yara

if __name__ == "__main__":
    gen = AutomatedThreatRuleGenerator()
    sigma = gen.generate_sigma_rule("Detect Southeast Asia Scam Compound C2 Traffic", "185.220.101.5", "/api/v1/auth/police_clearance.php", "attack.t1071.001")
    yara = gen.generate_yara_rule("ScamShield_APK", ["50 4B 03 04 14 00", "63 6F 6D 2E 63 79 62 65 72 2E 61 70 70"])
    print(sigma)
    print(yara)
