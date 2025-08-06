import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Send invitation emails to players
router.post('/invitations/send', async (req, res) => {
  try {
    console.log('📧 Invitation send request received');
    console.log('Request body:', req.body);
    const { event_id } = req.body;

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

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
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is event creator or admin
    const isEventCreator = event.created_by === user.id;
    let isEventAdmin = false;

    if (!isEventCreator) {
      const { data: adminCheck } = await supabase
        .from('event_players')
        .select('role')
        .eq('event_id', event_id)
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('status', 'accepted')
        .single();
      
      isEventAdmin = !!adminCheck;
    }

    if (!isEventCreator && !isEventAdmin) {
      return res.status(403).json({ error: 'Only event creators and admins can send invitations' });
    }

    // Get players with 'invited' status that have email addresses
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

    if (!invitedPlayers || invitedPlayers.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No pending invitations to send',
        sent_count: 0 
      });
    }

    // Send emails (for now, we'll use a simple email service)
    const emailResults = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    for (const player of invitedPlayers) {
      try {
        // Skip placeholder emails
        if (player.invited_email.includes('@placeholder.local') || 
            player.invited_email.includes('@example.com')) {
          console.log(`Skipping placeholder email: ${player.invited_email}`);
          continue;
        }

        // Create invitation link
        const invitationLink = `${baseUrl}/invitation/${event_id}?email=${encodeURIComponent(player.invited_email)}`;
        
        // For now, log the email details (in production, integrate with email service)
        const emailContent = {
          to: player.invited_email,
          subject: `You're invited to ${event.name}!`,
          html: `
            <h2>You're invited to join ${event.name}!</h2>
            <p>Hi ${player.full_name},</p>
            <p>You've been invited to participate in <strong>${event.name}</strong>.</p>
            
            <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Event Details:</h3>
              <p><strong>Event:</strong> ${event.name}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Dates:</strong> ${new Date(event.start_date).toLocaleDateString()} - ${new Date(event.end_date).toLocaleDateString()}</p>
            </div>
            
            <p>To accept this invitation and view all event details:</p>
            <a href="${invitationLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Accept Invitation
            </a>
            
            <p>If you don't have an account yet, you'll be prompted to create one.</p>
            
            <p>We're excited to have you join us!</p>
          `
        };

        // Log email for development (replace with actual email service in production)
        console.log('📧 INVITATION EMAIL TO SEND:');
        console.log('To:', emailContent.to);
        console.log('Subject:', emailContent.subject);
        console.log('Link:', invitationLink);
        console.log('---');

        emailResults.push({
          player_id: player.id,
          email: player.invited_email,
          status: 'sent', // In production, this would be the actual send result
          invitation_link: invitationLink
        });

      } catch (emailError) {
        console.error(`Error sending email to ${player.invited_email}:`, emailError);
        emailResults.push({
          player_id: player.id,
          email: player.invited_email,
          status: 'failed',
          error: emailError.message
        });
      }
    }

    res.json({
      success: true,
      message: `Invitation emails prepared for ${emailResults.length} players`,
      sent_count: emailResults.filter(r => r.status === 'sent').length,
      failed_count: emailResults.filter(r => r.status === 'failed').length,
      results: emailResults
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
