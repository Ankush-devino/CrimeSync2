import { Pool } from "pg";
import neo4j, { Driver } from "neo4j-driver";
import { ENV } from "./env";

// 1. PostgreSQL Connection Pool (Neon Cloud)
export const pgPool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: ENV.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// 2. Neo4j Graph Driver Client
export let neo4jDriver: Driver | null = null;

if (ENV.NEO4J_URI && ENV.NEO4J_PASSWORD) {
  neo4jDriver = neo4j.driver(
    ENV.NEO4J_URI,
    neo4j.auth.basic(ENV.NEO4J_USER, ENV.NEO4J_PASSWORD)
  );
}

// Database Connection Orchestrator
export async function connectDB(): Promise<void> {
  // Test PostgreSQL
  if (ENV.DATABASE_URL) {
    try {
      const client = await pgPool.connect();
      const res = await client.query("SELECT NOW() as current_time, current_database() as db_name");
      console.log(`✅ [PostgreSQL] Connected to Neon DB "${res.rows[0].db_name}" successfully at ${res.rows[0].current_time}`);
      client.release();
    } catch (err) {
      console.error("❌ [PostgreSQL] Failed to connect:", err);
    }
  } else {
    console.warn("⚠️  [PostgreSQL] DATABASE_URL is not defined in .env");
  }

  // Test Neo4j
  if (neo4jDriver) {
    try {
      const serverInfo = await neo4jDriver.getServerInfo();
      console.log(`✅ [Neo4j] Connected to AuraDB: ${serverInfo.agent}`);
    } catch (err) {
      console.error("❌ [Neo4j] Failed to connect:", err);
    }
  } else {
    console.log("ℹ️  [Neo4j] Credentials not configured yet in .env (add NEO4J_URI & NEO4J_PASSWORD when ready).");
  }
}

export async function disconnectDB(): Promise<void> {
  await pgPool.end();
  if (neo4jDriver) {
    await neo4jDriver.close();
  }
  console.log("Database connections closed.");
}
