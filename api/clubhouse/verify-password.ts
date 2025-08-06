import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    if (error || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.is_published) {
      return res.status(403).json({ error: "Event is not published" });
    }

    if (!event.clubhouse_password) {
      return res.status(403).json({ error: "Clubhouse is not enabled for this event" });
    }

    if (event.clubhouse_password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying clubhouse password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
