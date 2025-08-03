-- Add buy_in column to events table and create skills_contests table
-- Run this in your Supabase SQL Editor

-- Add buy_in column to events table if it doesn't exist
ALTER TABLE events
ADD COLUMN IF NOT EXISTS buy_in INTEGER DEFAULT 0;

-- Add course_url column to event_rounds table if it doesn't exist
ALTER TABLE event_rounds
ADD COLUMN IF NOT EXISTS course_url TEXT;

-- Create skills_contests table to store hole contests
CREATE TABLE IF NOT EXISTS skills_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  round_id TEXT NOT NULL, -- This will store the round ID from the frontend
  hole INTEGER NOT NULL,
  contest_type TEXT NOT NULL CHECK (contest_type IN ('longest_drive', 'closest_to_pin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one contest per hole per round
  UNIQUE(event_id, round_id, hole, contest_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_contests_event_id ON skills_contests(event_id);
CREATE INDEX IF NOT EXISTS idx_skills_contests_round_id ON skills_contests(round_id);

-- Enable RLS
ALTER TABLE skills_contests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for skills_contests
DROP POLICY IF EXISTS "Users can view skills contests for own events" ON skills_contests;
CREATE POLICY "Users can view skills contests for own events" ON skills_contests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = skills_contests.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert skills contests for own events" ON skills_contests;
CREATE POLICY "Users can insert skills contests for own events" ON skills_contests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = skills_contests.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update skills contests for own events" ON skills_contests;
CREATE POLICY "Users can update skills contests for own events" ON skills_contests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = skills_contests.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete skills contests for own events" ON skills_contests;
CREATE POLICY "Users can delete skills contests for own events" ON skills_contests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = skills_contests.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Add update trigger for skills_contests
DROP TRIGGER IF EXISTS update_skills_contests_updated_at ON skills_contests;
CREATE TRIGGER update_skills_contests_updated_at 
    BEFORE UPDATE ON skills_contests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Allow public access to skills contests for published events
DROP POLICY IF EXISTS "Published event skills contests are publicly viewable" ON skills_contests;
CREATE POLICY "Published event skills contests are publicly viewable" ON skills_contests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = skills_contests.event_id 
      AND events.is_published = true
    )
  );
