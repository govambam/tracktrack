-- Add publishing fields to events table for public event websites
-- Run this in your Supabase SQL Editor

-- Add the new columns if they don't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);

-- Add constraint to ensure slug is lowercase and URL-friendly
ALTER TABLE events 
ADD CONSTRAINT IF NOT EXISTS check_slug_format 
CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$');

-- Function to generate URL-friendly slug from event name
CREATE OR REPLACE FUNCTION generate_slug(event_name TEXT, event_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug: lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(event_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'golf-event';
  END IF;
  
  -- Check for uniqueness and append counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug AND id != event_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug when event is first published
CREATE OR REPLACE FUNCTION set_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug when is_published is being set to true and slug is null
  IF NEW.is_published = true AND OLD.is_published = false AND NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.name, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_event_slug_trigger ON events;
CREATE TRIGGER set_event_slug_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_event_slug();

-- Add RLS policy for public access to published events
DROP POLICY IF EXISTS "Published events are publicly viewable" ON events;
CREATE POLICY "Published events are publicly viewable" ON events
  FOR SELECT USING (is_published = true);
