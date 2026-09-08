// Team Member 3: Attack Graph & Lateral Movement Path Visualizer
import { Router, Request, Response } from "express";
import { formatResponse } from "../../utils/api-response";

export interface AttackNodeDTO {
  id: string;
  name: string;
  stage: "Reconnaissance" | "Initial Access" | "Execution" | "Persistence" | "Lateral Movement" | "Exfiltration";
  type: "host" | "credential" | "cve" | "target_asset" | "c2_server";
  ipOrAsset: string;
  riskScore: number;
  status: "compromised" | "at_risk" | "isolated" | "secure";
  cveId?: string;
}

export interface AttackEdgeDTO {
  id: string;
  source: string;
  target: string;
  technique: string;
  mitreId: string;
  lateralRisk: "CRITICAL" | "HIGH" | "MEDIUM";
}

const ATTACK_NODES: AttackNodeDTO[] = [
  {
    id: "node-1",
    name: "Phishing Spear-Email Attachment",
    stage: "Initial Access",
    type: "host",
    ipOrAsset: "103.241.12.88 (ACT Fibernet C2)",
    riskScore: 92,
    status: "compromised",
    cveId: "CVE-2026-1182 (MS Office RCE)"
  },
  {
    id: "node-2",
    name: "Workstation WS-DEL-04 (Finance Officer)",
    stage: "Execution",
    type: "host",
    ipOrAsset: "10.0.8.44 (Internal Subnet)",
    riskScore: 86,
    status: "compromised"
  },
  {
    id: "node-3",
    name: "Domain Admin NTLM Hash Dump",
    stage: "Persistence",
    type: "credential",
    ipOrAsset: "LSASS Memory Dump",
    riskScore: 98,
    status: "compromised"
  },
  {
    id: "node-4",
    name: "SMB Lateral Movement (PsExec Pivot)",
    stage: "Lateral Movement",
    type: "host",
    ipOrAsset: "10.0.12.100 (Core Router)",
    riskScore: 95,
    status: "at_risk"
  },
  {
    id: "node-5",
    name: "SCADA HMI Relay Substation #4",
    stage: "Exfiltration",
    type: "target_asset",
    ipOrAsset: "192.168.4.1 (Isolated Grid Node)",
    riskScore: 99,
    status: "at_risk"
  }
];

const ATTACK_EDGES: AttackEdgeDTO[] = [
  {
    id: "edge-1-2",
    source: "node-1",
    target: "node-2",
    technique: "Spear-phishing Link / Macro Execution",
    mitreId: "T1566.001",
    lateralRisk: "HIGH"
  },
  {
    id: "edge-2-3",
    source: "node-2",
    target: "node-3",
    technique: "OS Credential Dumping (Mimikatz)",
    mitreId: "T1003.001",
    lateralRisk: "CRITICAL"
  },
  {
    id: "edge-3-4",
    source: "node-3",
    target: "node-4",
    technique: "Pass-the-Hash Lateral Movement",
    mitreId: "T1550.002",
    lateralRisk: "CRITICAL"
  },
  {
    id: "edge-4-5",
    source: "node-4",
    target: "node-5",
    technique: "SCADA Command Injection Pivot",
    mitreId: "T0885 (ICS Exploit)",
    lateralRisk: "CRITICAL"
  }
];

export class AttackGraphService {
  async getKillChainGraph() {
    return {
      nodes: ATTACK_NODES,
      edges: ATTACK_EDGES,
      criticalChokepoints: [
        {
          nodeId: "node-4",
          nodeName: "SMB Lateral Movement (PsExec Pivot)",
          severity: "CRITICAL",
          impactIfIsolated: "Blocks 100% of attack paths towards SCADA HMI Substation #4"
        }
      ]
    };
  }

  async isolateChokepoint(nodeId: string) {
    const node = ATTACK_NODES.find((n) => n.id === nodeId) || ATTACK_NODES[3];
    node.status = "isolated";
    return {
      success: true,
      isolatedNode: node.name,
      nodeId: node.id,
      isolationStatus: "CONTAINED_BY_HOST_FIREWALL",
      quarantineTime: new Date().toISOString(),
      activeMitreDefenses: ["Network Segmentation (M1030)", "Account Access Removal (M1018)"]
    };
  }

  async getStats() {
    return {
      totalKillChainNodes: ATTACK_NODES.length,
      compromisedAssets: ATTACK_NODES.filter((n) => n.status === "compromised").length,
      isolatedAssets: ATTACK_NODES.filter((n) => n.status === "isolated").length,
      criticalPathsToTarget: 2,
      mitreCoverage: "94.2%"
    };
  }
}

export const attackGraphService = new AttackGraphService();

export class AttackGraphController {
  async handleGetKillChain(_req: Request, res: Response) {
    try {
      const data = await attackGraphService.getKillChainGraph();
      res.json(formatResponse(true, data, "MITRE ATT&CK kill-chain graph retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleIsolate(req: Request, res: Response) {
    try {
      const { nodeId } = req.body;
      const data = await attackGraphService.isolateChokepoint(nodeId || "node-4");
      res.json(formatResponse(true, data, "Chokepoint isolation applied"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetStats(_req: Request, res: Response) {
    try {
      const data = await attackGraphService.getStats();
      res.json(formatResponse(true, data, "Attack graph statistics retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const attackGraphController = new AttackGraphController();

export function attackGraphRoutes(): Router {
  const router = Router();
  router.get("/kill-chain", (req, res) => attackGraphController.handleGetKillChain(req, res));
  router.get("/stats", (req, res) => attackGraphController.handleGetStats(req, res));
  router.post("/isolate", (req, res) => attackGraphController.handleIsolate(req, res));
  return router;
}
