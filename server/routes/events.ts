import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Create a new event
router.post('/events', async (req, res) => {
  try {
    const { 
      name, 
      start_date, 
      end_date, 
      location, 
      description, 
      logo_url, 
      is_private 
    } = req.body;

    // Get user from auth header (you might need to implement auth middleware)
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
    if (!name || !start_date || !end_date || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, start_date, end_date, location' 
      });
    }

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        name,
        start_date,
        end_date,
        location,
        description: description || null,
        logo_url: logo_url || null,
        is_private: is_private || false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }

    res.json({ success: true, event: data });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      start_date, 
      end_date, 
      location, 
      description, 
      logo_url, 
      is_private 
    } = req.body;

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
    if (!name || !start_date || !end_date || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, start_date, end_date, location' 
      });
    }

    // Update event in database (only if user owns it)
    const { data, error } = await supabase
      .from('events')
      .update({
        name,
        start_date,
        end_date,
        location,
        description: description || null,
        logo_url: logo_url || null,
        is_private: is_private || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the event
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found or access denied' });
      }
      return res.status(500).json({ error: 'Failed to update event' });
    }

    res.json({ success: true, event: data });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events for a user
router.get('/events', async (req, res) => {
  try {
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

    // Get events for user
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    res.json({ success: true, events: data });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific event
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

    // Get specific event (only if user owns it)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found or access denied' });
      }
      return res.status(500).json({ error: 'Failed to fetch event' });
    }

    res.json({ success: true, event: data });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
