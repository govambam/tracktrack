-- Generate slugs for existing published events that don't have them
-- Run this in your Supabase SQL Editor

-- First, make sure the slug generation function exists
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

-- Generate slugs for all published events that don't have one
DO $$
DECLARE
  event_record RECORD;
  new_slug TEXT;
BEGIN
  FOR event_record IN 
    SELECT id, name 
    FROM events 
    WHERE is_published = true AND (slug IS NULL OR slug = '')
  LOOP
    new_slug := generate_slug(event_record.name, event_record.id);
    
    UPDATE events 
    SET slug = new_slug, updated_at = NOW()
    WHERE id = event_record.id;
    
    RAISE NOTICE 'Generated slug "%" for event "%"', new_slug, event_record.name;
  END LOOP;
END
$$;

-- Verify the results
SELECT id, name, slug, is_published 
FROM events 
WHERE is_published = true 
ORDER BY created_at DESC;
