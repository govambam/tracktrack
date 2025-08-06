import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSupabaseTest } from "./routes/supabase-test";
import { handleAuthTest } from "./routes/auth-test";
import { generateDescription } from "./routes/openai";
import eventsRouter from "./routes/events";
import invitationsRouter from "./routes/invitations";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/supabase-test", handleSupabaseTest);
  app.post("/api/auth-test", handleAuthTest);
  app.post("/api/generate-description", generateDescription);

  // Events API routes
  app.use("/api", eventsRouter);

  // Invitations API routes
  app.use("/api", invitationsRouter);

  return app;
}
