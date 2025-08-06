import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://jktbmygutktbjjuzuwgq.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdGJteWd1dGt0YmpqdXp1d2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjExMzEsImV4cCI6MjA2OTczNzEzMX0.WNrC3L-WSZEu68DtFPBDFzBZzB29th2Nvou5Vlwq6Lg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}
