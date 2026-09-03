import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL || "",
  NEO4J_URI: process.env.NEO4J_URI || "",
  NEO4J_USER: process.env.NEO4J_USER || "neo4j",
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || "",
  JWT_SECRET: process.env.JWT_SECRET || "crimesync_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
};
