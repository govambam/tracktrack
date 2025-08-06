-- ============================================
-- Event Invitations Schema Changes
-- Adds support for event ownership and player invitations with roles
-- ============================================

-- 1. ADD CREATED_BY TO EVENTS TABLE
-- ============================================
-- Add created_by column to events table to establish ownership
-- We'll use the existing user_id as default for created_by and keep user_id for backwards compatibility
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set created_by to user_id for existing events
UPDATE events 
SET created_by = user_id 
WHERE created_by IS NULL;

-- Make created_by NOT NULL after setting values
ALTER TABLE events 
ALTER COLUMN created_by SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- 2. UPDATE EVENT_PLAYERS TABLE FOR ROLES AND INVITATIONS
-- ============================================
-- Add new columns to support roles and invitation system
ALTER TABLE event_players 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
ADD COLUMN IF NOT EXISTS invited_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('invited', 'accepted', 'declined', 'pending'));

-- Create index for invited_email for lookups
CREATE INDEX IF NOT EXISTS idx_event_players_user_id ON event_players(user_id);
CREATE INDEX IF NOT EXISTS idx_event_players_invited_email ON event_players(invited_email);
CREATE INDEX IF NOT EXISTS idx_event_players_status ON event_players(status);
CREATE INDEX IF NOT EXISTS idx_event_players_role ON event_players(role);

-- Add constraint to ensure either user_id OR invited_email is present (but not both)
-- This ensures we can track both registered users and pending invitations
ALTER TABLE event_players 
ADD CONSTRAINT check_user_or_invited_email 
CHECK (
  (user_id IS NOT NULL AND invited_email IS NULL) OR 
  (user_id IS NULL AND invited_email IS NOT NULL)
);

-- Update existing event_players to link with users where email matches
-- This connects existing players to registered users
UPDATE event_players 
SET user_id = (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.email = event_players.email
)
WHERE event_players.email IS NOT NULL 
  AND event_players.user_id IS NULL;

-- For players not linked to users, set invited_email
UPDATE event_players 
SET invited_email = email,
    status = 'accepted'  -- Existing players are already "accepted"
WHERE user_id IS NULL 
  AND email IS NOT NULL 
  AND invited_email IS NULL;

-- 3. CREATE SUPABASE RPC FUNCTION FOR INVITING PLAYERS
-- ============================================
CREATE OR REPLACE FUNCTION invite_player_to_event(
  p_event_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'player'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_creator UUID;
  v_user_id UUID;
  v_existing_player UUID;
  v_result JSON;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Validate role parameter
  IF p_role NOT IN ('player', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be player or admin'
    );
  END IF;

  -- Get event creator and check if event exists
  SELECT created_by INTO v_event_creator
  FROM events
  WHERE id = p_event_id;

  IF v_event_creator IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Event not found'
    );
  END IF;

  -- Check if current user is the event creator or an admin of the event
  IF auth.uid() != v_event_creator AND NOT EXISTS (
    SELECT 1 FROM event_players 
    WHERE event_id = p_event_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only event creator or admins can invite players'
    );
  END IF;

  -- Check if player is already invited/added to event
  SELECT id INTO v_existing_player
  FROM event_players
  WHERE event_id = p_event_id
    AND (
      (user_id IS NOT NULL AND user_id = (SELECT id FROM profiles WHERE email = p_email)) OR
      (invited_email = p_email)
    );

  IF v_existing_player IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Player already invited or added to event'
    );
  END IF;

  -- Check if invited user exists (by email)
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_email;

  -- Insert the invitation
  IF v_user_id IS NOT NULL THEN
    -- User exists, link directly
    INSERT INTO event_players (event_id, user_id, role, status, full_name)
    VALUES (
      p_event_id, 
      v_user_id, 
      p_role, 
      'invited',
      (SELECT full_name FROM profiles WHERE id = v_user_id)
    );
  ELSE
    -- User doesn't exist, store invited_email
    INSERT INTO event_players (event_id, invited_email, role, status, full_name)
    VALUES (p_event_id, p_email, p_role, 'invited', p_email);
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Player invited successfully',
    'user_exists', v_user_id IS NOT NULL
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 4. CREATE FUNCTION TO ACCEPT INVITATIONS
-- ============================================
CREATE OR REPLACE FUNCTION accept_event_invitation(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_invitation_id UUID;
  v_result JSON;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Get user's email
  SELECT email INTO v_user_email
  FROM profiles
  WHERE id = auth.uid();

  -- Find pending invitation for this user
  SELECT id INTO v_invitation_id
  FROM event_players
  WHERE event_id = p_event_id
    AND invited_email = v_user_email
    AND status = 'invited';

  IF v_invitation_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No pending invitation found'
    );
  END IF;

  -- Update invitation to link user and accept
  UPDATE event_players
  SET user_id = auth.uid(),
      invited_email = NULL,
      status = 'accepted',
      full_name = (SELECT full_name FROM profiles WHERE id = auth.uid())
  WHERE id = v_invitation_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 5. UPDATE RLS POLICIES FOR NEW STRUCTURE
-- ============================================

-- Update events policies to use created_by
DROP POLICY IF EXISTS "Users can view own events" ON events;
CREATE POLICY "Users can view events they created or are invited to" ON events
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM event_players 
      WHERE event_players.event_id = events.id 
        AND event_players.user_id = auth.uid()
        AND event_players.status IN ('accepted', 'invited')
    )
  );

DROP POLICY IF EXISTS "Users can create own events" ON events;
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own events" ON events;
CREATE POLICY "Event creators and admins can update events" ON events
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM event_players 
      WHERE event_players.event_id = events.id 
        AND event_players.user_id = auth.uid()
        AND event_players.role = 'admin'
        AND event_players.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Users can delete own events" ON events;
CREATE POLICY "Event creators can delete events" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for event_players
ALTER TABLE event_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view event players" ON event_players;
CREATE POLICY "Users can view event players for events they have access to" ON event_players
  FOR SELECT USING (
    -- Can view if they created the event
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_players.event_id 
        AND events.created_by = auth.uid()
    ) OR
    -- Can view if they are a player/admin in the event
    EXISTS (
      SELECT 1 FROM event_players ep2
      WHERE ep2.event_id = event_players.event_id 
        AND ep2.user_id = auth.uid()
        AND ep2.status IN ('accepted', 'invited')
    )
  );

DROP POLICY IF EXISTS "Event creators and admins can manage players" ON event_players;
CREATE POLICY "Event creators and admins can manage players" ON event_players
  FOR ALL USING (
    -- Event creator can manage all players
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_players.event_id 
        AND events.created_by = auth.uid()
    ) OR
    -- Event admins can manage players
    EXISTS (
      SELECT 1 FROM event_players ep2
      WHERE ep2.event_id = event_players.event_id 
        AND ep2.user_id = auth.uid()
        AND ep2.role = 'admin'
        AND ep2.status = 'accepted'
    )
  );

-- ============================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- ============================================

-- Verify events table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'events' 
-- ORDER BY ordinal_position;

-- Verify event_players table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'event_players' 
-- ORDER BY ordinal_position;

-- Test the invite function (replace with real values)
-- SELECT invite_player_to_event('your-event-id', 'test@example.com', 'player');
