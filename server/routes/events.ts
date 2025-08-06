import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// Create a new event
router.post("/events", async (req, res) => {
  try {
    const {
      name,
      start_date,
      end_date,
      location,
      description,
      logo_url,
      is_private,
    } = req.body;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header provided");
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log("Auth error:", authError);
      return res
        .status(401)
        .json({ error: "Invalid token", details: authError?.message });
    }

    // Validate required fields
    if (!name || !start_date || !end_date || !location) {
      return res.status(400).json({
        error: "Missing required fields: name, start_date, end_date, location",
      });
    }

    // Insert event into database
    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        created_by: user.id,
        name,
        start_date,
        end_date,
        location,
        description: description || null,
        logo_url: logo_url || null,
        is_private: is_private || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create event" });
    }

    res.json({ success: true, event: data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an existing event
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      start_date,
      end_date,
      location,
      description,
      logo_url,
      is_private,
    } = req.body;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Validate required fields
    if (!name || !start_date || !end_date || !location) {
      return res.status(400).json({
        error: "Missing required fields: name, start_date, end_date, location",
      });
    }

    // Update event in database (only if user owns it)
    const { data, error } = await supabase
      .from("events")
      .update({
        name,
        start_date,
        end_date,
        location,
        description: description || null,
        logo_url: logo_url || null,
        is_private: is_private || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the event
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ error: "Event not found or access denied" });
      }
      return res.status(500).json({ error: "Failed to update event" });
    }

    res.json({ success: true, event: data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get events for a user
router.get("/events", async (req, res) => {
  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get events for user
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    res.json({ success: true, events: data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific event
router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get specific event (only if user owns it)
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ error: "Event not found or access denied" });
      }
      return res.status(500).json({ error: "Failed to fetch event" });
    }

    res.json({ success: true, event: data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Invite a player to an event
router.post("/events/:id/invite", async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { email, role = "player" } = req.body;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Set the RLS context by creating a client with the user's token
    const userSupabase = supabase.auth.admin.createClient({
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseKey: process.env.SUPABASE_ANON_KEY || "",
      options: {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!role || !["player", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be player or admin",
      });
    }

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc("invite_player_to_event", {
      p_event_id: eventId,
      p_email: email,
      p_role: role,
    });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to invite player" });
    }

    // The RPC function returns a JSON object with success/error info
    if (!data.success) {
      return res.status(400).json({ error: data.error });
    }

    res.json({
      success: true,
      message: data.message,
      user_exists: data.user_exists,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept an event invitation
router.post("/events/:id/accept-invitation", async (req, res) => {
  try {
    const { id: eventId } = req.params;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc("accept_event_invitation", {
      p_event_id: eventId,
    });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to accept invitation" });
    }

    // The RPC function returns a JSON object with success/error info
    if (!data.success) {
      return res.status(400).json({ error: data.error });
    }

    res.json({
      success: true,
      message: data.message,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get event players (including invitations)
router.get("/events/:id/players", async (req, res) => {
  try {
    const { id: eventId } = req.params;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get event players with user profile data where available
    const { data, error } = await supabase
      .from("event_players")
      .select(
        `
        id,
        event_id,
        user_id,
        role,
        invited_email,
        status,
        full_name,
        email,
        handicap,
        profile_image,
        team,
        created_at,
        updated_at,
        profiles:user_id (
          full_name,
          email,
          handicap,
          avatar_url
        )
      `,
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch event players" });
    }

    // Merge profile data with event player data
    const players = data.map((player) => ({
      id: player.id,
      event_id: player.event_id,
      user_id: player.user_id,
      role: player.role,
      invited_email: player.invited_email,
      status: player.status,
      full_name: player.profiles?.full_name || player.full_name,
      email: player.profiles?.email || player.email || player.invited_email,
      handicap: player.profiles?.handicap || player.handicap,
      profile_image: player.profiles?.avatar_url || player.profile_image,
      team: player.team,
      created_at: player.created_at,
      updated_at: player.updated_at,
      is_registered_user: !!player.user_id,
    }));

    res.json({ success: true, players });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
