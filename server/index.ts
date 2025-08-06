import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSupabaseTest } from "./routes/supabase-test";
import { handleAuthTest } from "./routes/auth-test";
import { generateDescription } from "./routes/openai";
import eventsRouter from "./routes/events";
// import invitationsRouter from "./routes/invitations.js";

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

  // Debug route to test invitations API
  app.get("/api/invitations/debug", (req, res) => {
    console.log("🔍 Debug invitations route hit");
    res.json({ success: true, message: "Debug route is working", timestamp: new Date().toISOString() });
  });

  // Events API routes
  app.use("/api", eventsRouter);

  // Invitations API routes (embedded for debugging)
  app.get("/api/invitations/test", (req, res) => {
    console.log("📧 Invitations test endpoint hit");
    res.json({ success: true, message: "Invitations API is working" });
  });

  app.post("/api/invitations/send", async (req, res) => {
    console.log("📧 Invitations send endpoint hit");
    console.log("Request body:", req.body);

    try {
      // For now, just return a success response for testing
      res.json({
        success: true,
        message: "Invitations endpoint is working (test mode)",
        sent_count: 0,
        debug: true
      });
    } catch (error) {
      console.error("Error in invitations send:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}
