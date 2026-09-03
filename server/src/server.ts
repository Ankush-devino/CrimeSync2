import { createApp } from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

export async function bootstrap() {
  try {
    logger.info(`Starting CrimeSync Backend Server on port ${ENV.PORT}...`);
    
    // Connect to databases
    await connectDB();

    // Initialize Express App
    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 CrimeSync Server is listening on http://localhost:${ENV.PORT}`);
      logger.info(`📡 API Endpoints available at http://localhost:${ENV.PORT}/api/v1`);
    });

    return server;
  } catch (error) {
    logger.error("Failed to start CrimeSync Server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
