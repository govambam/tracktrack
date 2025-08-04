import { createServer } from "./index";

const app = createServer();
const port = 8080;

app.listen(port, () => {
  console.log(`🚀 Development API server running on port ${port}`);
  console.log(`🔧 API endpoints available at: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Development server shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Development server shutting down gracefully");
  process.exit(0);
});
