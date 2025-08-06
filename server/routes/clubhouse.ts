import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// Verify clubhouse password
router.post("/verify-password", async (req, res) => {
  try {
    const { eventId, password } = req.body;

    if (!eventId || !password) {
      return res.status(400).json({ error: "Event ID and password are required" });
    }

    // Get event with clubhouse password (handle missing column gracefully)
    let event;
    let error;

    try {
      const result = await supabase
        .from("events")
        .select("clubhouse_password, is_published")
        .eq("id", eventId)
        .single();

      event = result.data;
      error = result.error;
    } catch (dbError) {
      // If clubhouse_password column doesn't exist, try without it
      const fallbackResult = await supabase
        .from("events")
        .select("is_published")
        .eq("id", eventId)
        .single();

      if (fallbackResult.error || !fallbackResult.data) {
        return res.status(404).json({ error: "Event not found" });
      }

      return res.status(403).json({ error: "Clubhouse feature not available (database migration required)" });
    }

    console.log("Event retrieval debug:", {
      eventFound: !!event,
      error: error?.message,
      eventId,
      isPublished: event?.is_published,
      hasPassword: !!event?.clubhouse_password
    });

    if (error || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.is_published) {
      return res.status(403).json({ error: "Event is not published" });
    }

    if (!event.clubhouse_password) {
      return res.status(403).json({ error: "Clubhouse is not enabled for this event" });
    }

    console.log("Password verification debug:", {
      providedPassword: password,
      storedPassword: event.clubhouse_password,
      providedLength: password?.length,
      storedLength: event.clubhouse_password?.length,
      match: event.clubhouse_password === password
    });

    if (event.clubhouse_password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying clubhouse password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create clubhouse session
router.post("/create-session", async (req, res) => {
  try {
    const { eventId, displayName, sessionId } = req.body;

    if (!eventId || !displayName || !sessionId) {
      return res.status(400).json({ 
        error: "Event ID, display name, and session ID are required" 
      });
    }

    // Validate display name length
    if (displayName.length > 50) {
      return res.status(400).json({ error: "Display name must be 50 characters or less" });
    }

    // Check if event exists and clubhouse is enabled (handle missing column gracefully)
    let event;
    let eventError;

    try {
      const result = await supabase
        .from("events")
        .select("id, clubhouse_password, is_published")
        .eq("id", eventId)
        .single();

      event = result.data;
      eventError = result.error;
    } catch (dbError) {
      // If clubhouse_password column doesn't exist, try without it
      const fallbackResult = await supabase
        .from("events")
        .select("id, is_published")
        .eq("id", eventId)
        .single();

      if (fallbackResult.error || !fallbackResult.data) {
        return res.status(404).json({ error: "Event not found" });
      }

      return res.status(403).json({ error: "Clubhouse feature not available (database migration required)" });
    }

    if (eventError || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.is_published) {
      return res.status(403).json({ error: "Event is not published" });
    }

    if (!event.clubhouse_password) {
      return res.status(403).json({ error: "Clubhouse is not enabled for this event" });
    }

    // Create or update session
    const { data: session, error: sessionError } = await supabase
      .from("clubhouse_sessions")
      .upsert({
        event_id: eventId,
        display_name: displayName,
        session_id: sessionId,
        last_accessed: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: "session_id",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    res.json({ 
      success: true, 
      session: {
        id: session.id,
        displayName: session.display_name,
        sessionId: session.session_id,
      }
    });
  } catch (error) {
    console.error("Error creating clubhouse session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify existing session
router.post("/verify-session", async (req, res) => {
  try {
    const { eventId, sessionId } = req.body;

    if (!eventId || !sessionId) {
      return res.status(400).json({ error: "Event ID and session ID are required" });
    }

    // Check if session exists and is active
    const { data: session, error } = await supabase
      .from("clubhouse_sessions")
      .select("id, display_name, is_active")
      .eq("event_id", eventId)
      .eq("session_id", sessionId)
      .eq("is_active", true)
      .single();

    if (error || !session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Update last accessed time
    await supabase
      .from("clubhouse_sessions")
      .update({ last_accessed: new Date().toISOString() })
      .eq("id", session.id);

    res.json({ 
      success: true, 
      session: {
        id: session.id,
        displayName: session.display_name,
      }
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update session activity
router.post("/update-session", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const { error } = await supabase
      .from("clubhouse_sessions")
      .update({ last_accessed: new Date().toISOString() })
      .eq("session_id", sessionId)
      .eq("is_active", true);

    if (error) {
      return res.status(500).json({ error: "Failed to update session" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
