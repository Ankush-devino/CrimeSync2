// Entry point for CrimeSync HTTP & WebSocket Server
// Responsible for database connection and server initialization

export async function bootstrap() {
  console.log("Starting CrimeSync Backend Server...");
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
