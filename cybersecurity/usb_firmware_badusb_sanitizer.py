# bansal
"""
CrimeSync Physical Cyber Forensics: BadUSB & Seized Flash Drive Firmware Sanitizer
Performs static analysis on USB HID descriptors, firmware microcode, and Duckyscript injection strings
from suspect thumb drives seized during physical raids.
"""

import json
import re
from typing import Dict, List, Any

# bansal

class BadUSBFirmwareSanitizer:
    """Detects keystroke injection hardware (Rubber Ducky, Bash Bunny, O.MG Cable) in seized hardware"""
    
    # bansal
    MALICIOUS_DUCKYSCRIPT_PATTERNS = [
        r'GUI\s+r',
        r'STRING\s+powershell',
        r'STRING\s+cmd\.exe',
        r'STRING\s+curl\s+-O',
        r'DELAY\s+\d+',
        r'ENTER'
    ]

    def analyze_usb_descriptors(self, vendor_id: str, product_id: str, endpoints: List[str]) -> Dict[str, Any]:
        """Flags suspicious HID keyboard emulation on devices claiming to be standard flash drives"""
        is_composite_hid = any("HID_KEYBOARD" in ep for ep in endpoints) and any("MASS_STORAGE" in ep for ep in endpoints)
        
        return {
            "vid_pid": f"{vendor_id}:{product_id}",
            "is_malicious_keystroke_injector": is_composite_hid,
            "threat_classification": "BAD_USB_HARDWARE_TROJAN" if is_composite_hid else "BENIGN_MASS_STORAGE",
            "recommended_containment": "ISOLATE_IN_AIR_GAPPED_FARADAY_CAGE" if is_composite_hid else "PROCEED_TO_WRITE_BLOCKER"
        }

    def decompile_inject_payload(self, raw_firmware_dump: str) -> Dict[str, Any]:
        found_triggers = []
        for pat in self.MALICIOUS_DUCKYSCRIPT_PATTERNS:
            matches = re.findall(pat, raw_firmware_dump, re.IGNORECASE)
            if matches:
                found_triggers.extend(matches)
                
        return {
            "injection_signatures_detected": len(found_triggers),
            "signature_matches": found_triggers,
            "verdict": "CONFIRMED_RUBBER_DUCKY_EXPLOIT" if len(found_triggers) >= 2 else "CLEAN_BINARY"
        }

if __name__ == "__main__":
    sanitizer = BadUSBFirmwareSanitizer()
    diag = sanitizer.analyze_usb_descriptors("0x0483", "0x5740", ["ENDPOINT_MASS_STORAGE", "ENDPOINT_HID_KEYBOARD"])
    print("[+] Hardware Triage Result:")
    print(json.dumps(diag, indent=2))
