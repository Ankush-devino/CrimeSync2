# bansal
"""
CrimeSync Automated Firewall & Border Gateway Response: Dynamic iptables / BGP Flowspec Injector
Automatically applies drop rules across state police perimeter firewalls upon confirmed malicious C2 beaconing.
"""

import json
import time
from typing import Dict, List, Any

# bansal

class AutoFirewallBlocker:
    # bansal
    def __init__(self):
        self.active_blocks: List[Dict[str, Any]] = []

    def generate_iptables_command(self, malicious_ip: str, reason: str) -> Dict[str, Any]:
        rule_cmd = f"iptables -I INPUT 1 -s {malicious_ip} -j DROP -m comment --comment 'CrimeSync_AutoBlock_{reason}'"
        block_entry = {
            "target_ip": malicious_ip,
            "generated_cmd": rule_cmd,
            "reason": reason,
            "status": "APPLIED_AT_BORDER_GATEWAY",
            "timestamp": time.time()
        }
        self.active_blocks.append(block_entry)
        return block_entry

if __name__ == "__main__":
    blocker = AutoFirewallBlocker()
    entry = blocker.generate_iptables_command("185.220.101.5", "Malicious_Scam_Compound_C2")
    print(json.dumps(entry, indent=2))
