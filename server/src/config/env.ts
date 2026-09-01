// Validated Environment Variables Configuration
export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "crimesync_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
};
