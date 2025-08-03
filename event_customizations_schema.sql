-- Event Customizations Database Schema
-- Run this in your Supabase SQL Editor

-- Add homepage_headline to events table if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS homepage_headline TEXT;

-- Add travel fields to events table if they don't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS travel_lodging TEXT,
ADD COLUMN IF NOT EXISTS travel_notes TEXT,
ADD COLUMN IF NOT EXISTS travel_airport TEXT,
ADD COLUMN IF NOT EXISTS travel_distance TEXT;

-- Add course customization fields to event_rounds table if they don't exist
ALTER TABLE event_rounds 
ADD COLUMN IF NOT EXISTS course_image_url TEXT,
ADD COLUMN IF NOT EXISTS course_description TEXT,
ADD COLUMN IF NOT EXISTS yardage TEXT,
ADD COLUMN IF NOT EXISTS par INTEGER;

-- Create event_rules table to store tournament rules
CREATE TABLE IF NOT EXISTS event_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  rule_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add page visibility settings to event_customization table if they don't exist
ALTER TABLE event_customization 
ADD COLUMN IF NOT EXISTS home_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS courses_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rules_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS leaderboard_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS travel_enabled BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rules_event_id ON event_rules(event_id);

-- Enable RLS on event_rules table
ALTER TABLE event_rules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for event_rules
DROP POLICY IF EXISTS "Users can view rules for own events" ON event_rules;
CREATE POLICY "Users can view rules for own events" ON event_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert rules for own events" ON event_rules;
CREATE POLICY "Users can insert rules for own events" ON event_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update rules for own events" ON event_rules;
CREATE POLICY "Users can update rules for own events" ON event_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete rules for own events" ON event_rules;
CREATE POLICY "Users can delete rules for own events" ON event_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Add update trigger for event_rules
DROP TRIGGER IF EXISTS update_event_rules_updated_at ON event_rules;
CREATE TRIGGER update_event_rules_updated_at 
    BEFORE UPDATE ON event_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Allow public access to rules for published events
DROP POLICY IF EXISTS "Published event rules are publicly viewable" ON event_rules;
CREATE POLICY "Published event rules are publicly viewable" ON event_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.is_published = true
    )
  );

-- Sample data for testing (optional - uncomment to insert)
-- INSERT INTO event_rules (event_id, rule_text) VALUES 
-- ('your-event-id-here', 'All players must arrive 30 minutes before tee time'),
-- ('your-event-id-here', 'USGA rules apply unless otherwise noted'),
-- ('your-event-id-here', 'Maximum handicap of 36 for all participants');
