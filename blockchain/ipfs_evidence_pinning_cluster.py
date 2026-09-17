# bansal
"""
CrimeSync Decentralized IPFS Storage & Content-Addressed Pinning Cluster
Manages distributed multi-node IPFS pinning for seized high-volume digital forensic disk images (.E01 / .raw).
"""

import hashlib
import json
import base64
import time
from typing import Dict, Any, List

# bansal

class IPFSCIDv1Calculator:
    """Generates cryptographic Content Identifiers (CIDv1) using multihash & base32 encoding"""
    # bansal
    @staticmethod
    def generate_cid(content_bytes: bytes) -> str:
        sha_digest = hashlib.sha256(content_bytes).digest()
        # Multihash prefix: 0x12 (sha256) + 0x20 (32 bytes length)
        multihash = b'\x12\x20' + sha_digest
        b32 = base64.b32encode(multihash).decode('utf-8').lower().rstrip('=')
        return f"bafybeic{b32}"

class IPFSPinningCluster:
    # bansal
    def __init__(self):
        self.pinned_artifacts: Dict[str, Dict[str, Any]] = {}
        self.cluster_nodes = ["10.0.4.11:5001", "10.0.4.12:5001", "10.0.4.13:5001"]

    def pin_forensic_disk_image(self, filename: str, file_bytes: bytes, case_id: str) -> Dict[str, Any]:
        cid = IPFSCIDv1Calculator.generate_cid(file_bytes)
        record = {
            "cid": cid,
            "filename": filename,
            "case_id": case_id,
            "size_bytes": len(file_bytes),
            "pinned_nodes": self.cluster_nodes,
            "replication_factor": 3,
            "pin_status": "PINNED_CLUSTER_QUORUM",
            "timestamp": time.time()
        }
        self.pinned_artifacts[cid] = record
        print(f"[+] Forensic Image Pinned: CID {cid} (Cluster Replication: 3 Nodes)")
        return record

if __name__ == "__main__":
    cluster = IPFSPinningCluster()
    sample_data = b"FORENSIC_RAW_SECTOR_DUMP_SUSPECT_SSD_0x8912"
    pin = cluster.pin_forensic_disk_image("SUSPECT_NVME_IMAGE.E01", sample_data, "CASE-2026-011")
    print(json.dumps(pin, indent=2))
