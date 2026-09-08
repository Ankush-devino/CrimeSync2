// Team Member 3: Deception Network & Honeypot Telemetry Module
import { Router, Request, Response } from "express";
import { formatResponse } from "../../utils/api-response";

export interface HoneypotSensorDTO {
  id: string;
  name: string;
  type: "fake_ssh" | "fake_db" | "fake_ad" | "decoy_credentials" | "canary_file";
  status: "active" | "triggered" | "offline";
  ipAddress: string;
  location: string;
  interactionCount: number;
  lastTriggeredAt?: string;
  deployedAt: string;
  targetAttacker?: string;
}

export interface TripwireIncidentDTO {
  id: string;
  sensorId: string;
  sensorName: string;
  attackerIp: string;
  attackerCity: string;
  actionTaken: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  payloadSample: string;
  timestamp: string;
}

const DECOY_SENSORS: HoneypotSensorDTO[] = [
  {
    id: "DEC-01",
    name: "Canary SQL Database (Fake PSU Bank Customer DB)",
    type: "fake_db",
    status: "active",
    ipAddress: "10.0.14.99",
    location: "Mumbai AWS Subnet",
    interactionCount: 42,
    lastTriggeredAt: "2026-09-08T02:14:00Z",
    deployedAt: "2026-08-15T00:00:00Z",
    targetAttacker: "185.191.171.42 (Frankfurt Proxy)"
  },
  {
    id: "DEC-02",
    name: "Decoy Domain Controller (AD Kerberoast Trap)",
    type: "fake_ad",
    status: "triggered",
    ipAddress: "10.0.22.10",
    location: "Delhi Police Data Center",
    interactionCount: 19,
    lastTriggeredAt: "2026-09-08T03:10:22Z",
    deployedAt: "2026-08-20T00:00:00Z",
    targetAttacker: "103.241.12.88 (ACT C2 Node)"
  },
  {
    id: "DEC-03",
    name: "Canary AWS IAM Secret Keys (AWS_SECRET_CRIMESYNC)",
    type: "decoy_credentials",
    status: "active",
    ipAddress: "Cloud Metadata (169.254.169.254)",
    location: "Bengaluru Cloud Node",
    interactionCount: 88,
    lastTriggeredAt: "2026-09-07T18:45:00Z",
    deployedAt: "2026-08-01T00:00:00Z",
    targetAttacker: "49.36.18.102 (Jio Proxy Hop)"
  }
];

const TRIPWIRE_INCIDENTS: TripwireIncidentDTO[] = [
  {
    id: "TRIP-101",
    sensorId: "DEC-02",
    sensorName: "Decoy Domain Controller (AD Kerberoast Trap)",
    attackerIp: "103.241.12.88",
    attackerCity: "Bengaluru",
    actionTaken: "Attacker Session Isolated & Sandbox Trapped",
    severity: "CRITICAL",
    payloadSample: "Invoke-Mimikatz -DumpCreds (Decoy krbtgt ticket requested)",
    timestamp: "2026-09-08T03:10:22Z"
  },
  {
    id: "TRIP-102",
    sensorId: "DEC-01",
    sensorName: "Canary SQL Database",
    attackerIp: "185.191.171.42",
    attackerCity: "Frankfurt",
    actionTaken: "Decoy Data Exfiltrated (Watermarked Records)",
    severity: "HIGH",
    payloadSample: "SELECT * FROM sbi_customers_vault WHERE balance > 1000000",
    timestamp: "2026-09-08T02:14:00Z"
  }
];

export class DeceptionService {
  async listDecoys(): Promise<HoneypotSensorDTO[]> {
    return DECOY_SENSORS;
  }

  async listIncidents(): Promise<TripwireIncidentDTO[]> {
    return TRIPWIRE_INCIDENTS;
  }

  async deployDecoy(config: {
    name: string;
    type: "fake_ssh" | "fake_db" | "fake_ad" | "decoy_credentials" | "canary_file";
    location?: string;
  }): Promise<HoneypotSensorDTO> {
    const newDecoy: HoneypotSensorDTO = {
      id: `DEC-${String(DECOY_SENSORS.length + 1).padStart(2, "0")}`,
      name: config.name,
      type: config.type,
      status: "active",
      ipAddress: `10.0.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 200)}`,
      location: config.location || "Delhi HQ Cyber Node",
      interactionCount: 0,
      deployedAt: new Date().toISOString()
    };
    DECOY_SENSORS.unshift(newDecoy);
    return newDecoy;
  }

  async simulateBreach(sensorId: string): Promise<TripwireIncidentDTO> {
    const sensor = DECOY_SENSORS.find((s) => s.id === sensorId) || DECOY_SENSORS[0];
    sensor.status = "triggered";
    sensor.interactionCount += 1;
    sensor.lastTriggeredAt = new Date().toISOString();

    const incident: TripwireIncidentDTO = {
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      sensorId: sensor.id,
      sensorName: sensor.name,
      attackerIp: "185.220.101.5",
      attackerCity: "St. Petersburg Proxy Hop",
      actionTaken: "Zero-Trust Firewall Quarantined Attacker IP",
      severity: "CRITICAL",
      payloadSample: "POST /admin/api/v1/vault-decrypt --token=BEARER_STOLEN_CANARY",
      timestamp: new Date().toISOString()
    };
    TRIPWIRE_INCIDENTS.unshift(incident);
    return incident;
  }

  async getStats() {
    return {
      activeDecoys: DECOY_SENSORS.length,
      tripwiresTriggered: TRIPWIRE_INCIDENTS.length,
      adversariesTrapped: 4,
      steganographicCanariesWatermarked: 89,
      meanTimeToDeceiveSec: 1.4
    };
  }
}

export const deceptionService = new DeceptionService();

export class DeceptionController {
  async handleListDecoys(_req: Request, res: Response) {
    try {
      const data = await deceptionService.listDecoys();
      res.json(formatResponse(true, data, "Deception sensors retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleListIncidents(_req: Request, res: Response) {
    try {
      const data = await deceptionService.listIncidents();
      res.json(formatResponse(true, data, "Tripwire incidents retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleDeployDecoy(req: Request, res: Response) {
    try {
      const { name, type, location } = req.body;
      if (!name || !type) {
        return res.status(400).json(formatResponse(false, null, undefined, "name and type are required"));
      }
      const data = await deceptionService.deployDecoy({ name, type, location });
      res.json(formatResponse(true, data, "Decoy successfully deployed in network"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleSimulate(req: Request, res: Response) {
    try {
      const sensorId = req.body.sensorId || "DEC-01";
      const data = await deceptionService.simulateBreach(sensorId);
      res.json(formatResponse(true, data, "Tripwire breach simulated"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetStats(_req: Request, res: Response) {
    try {
      const data = await deceptionService.getStats();
      res.json(formatResponse(true, data, "Deception network statistics"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const deceptionController = new DeceptionController();

export function deceptionRoutes(): Router {
  const router = Router();
  router.get("/decoys", (req, res) => deceptionController.handleListDecoys(req, res));
  router.get("/incidents", (req, res) => deceptionController.handleListIncidents(req, res));
  router.get("/stats", (req, res) => deceptionController.handleGetStats(req, res));
  router.post("/deploy", (req, res) => deceptionController.handleDeployDecoy(req, res));
  router.post("/simulate", (req, res) => deceptionController.handleSimulate(req, res));
  return router;
}
