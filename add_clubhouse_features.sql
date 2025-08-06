-- Add clubhouse features to events table and create clubhouse sessions table
-- Run this in your Supabase SQL Editor

-- Add clubhouse password to events table if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS clubhouse_password TEXT;

-- Create clubhouse_sessions table for user sessions
CREATE TABLE IF NOT EXISTS clubhouse_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clubhouse_sessions_event_id ON clubhouse_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_clubhouse_sessions_session_id ON clubhouse_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_clubhouse_sessions_active ON clubhouse_sessions(is_active);

-- Enable RLS for clubhouse_sessions
ALTER TABLE clubhouse_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clubhouse_sessions
-- Allow authenticated users to read all sessions for events they own
DROP POLICY IF EXISTS "Event owners can view clubhouse sessions" ON clubhouse_sessions;
CREATE POLICY "Event owners can view clubhouse sessions" ON clubhouse_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = clubhouse_sessions.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Allow anyone to insert sessions (for guest access)
DROP POLICY IF EXISTS "Anyone can create clubhouse sessions" ON clubhouse_sessions;
CREATE POLICY "Anyone can create clubhouse sessions" ON clubhouse_sessions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update their own sessions
DROP POLICY IF EXISTS "Users can update their own sessions" ON clubhouse_sessions;
CREATE POLICY "Users can update their own sessions" ON clubhouse_sessions
  FOR UPDATE USING (true);

-- Create function to clean up old inactive sessions
CREATE OR REPLACE FUNCTION cleanup_old_clubhouse_sessions()
RETURNS void AS $$
BEGIN
  -- Delete sessions older than 24 hours that haven't been accessed in the last 6 hours
  DELETE FROM clubhouse_sessions 
  WHERE last_accessed < NOW() - INTERVAL '6 hours'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment the tables and columns for documentation
COMMENT ON TABLE clubhouse_sessions IS 'Stores active clubhouse user sessions for events';
COMMENT ON COLUMN clubhouse_sessions.event_id IS 'Foreign key to events table';
COMMENT ON COLUMN clubhouse_sessions.display_name IS 'User-chosen display name for clubhouse';
COMMENT ON COLUMN clubhouse_sessions.session_id IS 'Unique session identifier for browser storage';
COMMENT ON COLUMN clubhouse_sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN events.clubhouse_password IS 'Password required to access event clubhouse';
