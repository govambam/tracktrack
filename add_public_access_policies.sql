-- Add public access policies for published events
-- This allows the public event page to load data for published events

-- Public access to event_players for published events
DROP POLICY IF EXISTS "Published event players are publicly viewable" ON event_players;
CREATE POLICY "Published event players are publicly viewable" ON event_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_players.event_id 
      AND events.is_published = true
    )
  );

-- Public access to event_rounds for published events
DROP POLICY IF EXISTS "Published event rounds are publicly viewable" ON event_rounds;
CREATE POLICY "Published event rounds are publicly viewable" ON event_rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rounds.event_id 
      AND events.is_published = true
    )
  );

-- Public access to event_prizes for published events
DROP POLICY IF EXISTS "Published event prizes are publicly viewable" ON event_prizes;
CREATE POLICY "Published event prizes are publicly viewable" ON event_prizes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_prizes.event_id 
      AND events.is_published = true
    )
  );

-- Public access to event_travel for published events
DROP POLICY IF EXISTS "Published event travel are publicly viewable" ON event_travel;
CREATE POLICY "Published event travel are publicly viewable" ON event_travel
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_travel.event_id 
      AND events.is_published = true
    )
  );

-- Public access to event_customization for published events
DROP POLICY IF EXISTS "Published event customization are publicly viewable" ON event_customization;
CREATE POLICY "Published event customization are publicly viewable" ON event_customization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.is_published = true
    )
  );

-- Public access to events table for published events (by slug)
DROP POLICY IF EXISTS "Published events are publicly viewable by slug" ON events;
CREATE POLICY "Published events are publicly viewable by slug" ON events
  FOR SELECT USING (is_published = true);
