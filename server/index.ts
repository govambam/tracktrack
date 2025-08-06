import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSupabaseTest } from "./routes/supabase-test";
import { handleAuthTest } from "./routes/auth-test";
import { generateDescription } from "./routes/openai";
import eventsRouter from "./routes/events";
import { supabase } from "./lib/supabase.js";
import { EmailService } from "./lib/emailService.js";
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
    console.log("��� Invitations test endpoint hit");
    res.json({ success: true, message: "Invitations API is working" });
  });

  app.post("/api/invitations/send", async (req, res) => {
    console.log("📧 Invitations send endpoint hit");
    console.log("Request body:", req.body);

    try {
      const { event_id } = req.body;

      // Get user from auth header
      const authHeader = req.headers.authorization;
      console.log('🔍 Authorization header received:', authHeader ? 'Yes' : 'No');

      if (!authHeader) {
        console.error('❌ No authorization header provided');
        return res.status(401).json({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');
      console.log('🔑 Token length:', token.length);
      console.log('🔑 Token starts with:', token.substring(0, 20) + '...');

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.error('❌ Authentication failed:', {
          error: authError?.message,
          code: authError?.code,
          status: authError?.status
        });
        return res.status(401).json({
          error: 'Invalid token',
          details: authError?.message
        });
      }

      console.log('�� User authenticated:', user.id);

      // Validate required fields
      if (!event_id) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Get event details and verify user has permission
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, created_by, start_date, end_date, location, slug')
        .eq('id', event_id)
        .single();

      if (eventError || !event) {
        console.error('Event not found:', eventError);
        return res.status(404).json({ error: 'Event not found' });
      }

      console.log('📅 Event found:', event.name);

      // Check if user is event creator or admin
      const isEventCreator = event.created_by === user.id;
      console.log('👤 Is event creator:', isEventCreator);

      if (!isEventCreator) {
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .from('event_players')
          .select('role')
          .eq('event_id', event_id)
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .eq('status', 'accepted')
          .single();

        if (!adminCheck) {
          return res.status(403).json({ error: 'Only event creators and admins can send invitations' });
        }
      }

      // Get players with 'invited' status that have email addresses
      console.log('🔍 Looking for invited players...');

      // First, let's see ALL players for this event
      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('event_players')
        .select('id, full_name, invited_email, status, email')
        .eq('event_id', event_id);

      console.log('👥 All players for event:', allPlayers);

      const { data: invitedPlayers, error: playersError } = await supabase
        .from('event_players')
        .select('id, full_name, invited_email, status')
        .eq('event_id', event_id)
        .eq('status', 'invited')
        .not('invited_email', 'is', null);

      if (playersError) {
        console.error('Error fetching invited players:', playersError);
        return res.status(500).json({ error: 'Failed to fetch invited players' });
      }

      console.log('👥 Found invited players:', invitedPlayers?.length || 0);

      if (!invitedPlayers || invitedPlayers.length === 0) {
        return res.json({
          success: true,
          message: 'No pending invitations to send',
          sent_count: 0
        });
      }

      // Initialize email service and send emails
      const emailService = new EmailService();
      const emailResults = [];
      const baseUrl = process.env.BASE_URL || req.get('host') ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000';

      for (const player of invitedPlayers) {
        try {
          // Skip placeholder emails
          if (player.invited_email.includes('@placeholder.local') ||
              player.invited_email.includes('@example.com')) {
            console.log(`⏭️ Skipping placeholder email: ${player.invited_email}`);
            continue;
          }

          // Create invitation link
          const invitationLink = `${baseUrl}/invitation/${event_id}?email=${encodeURIComponent(player.invited_email)}`;

          // Send invitation email using email service
          const emailResult = await emailService.sendInvitationEmail({
            to: player.invited_email,
            playerName: player.full_name,
            eventName: event.name,
            eventStartDate: event.start_date,
            eventLocation: event.location,
            invitationLink
          });

          emailResults.push({
            player_id: player.id,
            email: player.invited_email,
            status: emailResult.success ? 'sent' : 'failed',
            invitation_link: invitationLink,
            message_id: emailResult.messageId,
            error: emailResult.error
          });

        } catch (emailError) {
          console.error(`❌ Error sending email to ${player.invited_email}:`, emailError);
          emailResults.push({
            player_id: player.id,
            email: player.invited_email,
            status: 'failed',
            error: emailError.message
          });
        }
      }

      const sentCount = emailResults.filter(r => r.status === 'sent').length;
      const failedCount = emailResults.filter(r => r.status === 'failed').length;

      console.log('📧 Invitation sending complete:', {
        total_results: emailResults.length,
        sent_count: sentCount,
        failed_count: failedCount
      });

      res.json({
        success: true,
        message: `Invitation emails prepared for ${emailResults.length} players`,
        sent_count: sentCount,
        failed_count: failedCount,
        results: emailResults
      });

    } catch (error) {
      console.error('❌ Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}
