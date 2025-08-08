-- ============================================
-- ELIMINATE EVENT_COURSES TABLE MIGRATION
-- ============================================
-- This migration moves customization fields from event_courses to event_rounds
-- and eliminates the redundant event_courses table.

-- Step 1: Add customization fields to event_rounds table
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS custom_description TEXT;
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS custom_image_url TEXT;
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;

-- Step 2: Migrate existing data from event_courses to event_rounds
-- Match courses by name and update corresponding rounds
UPDATE event_rounds 
SET 
    custom_description = ec.description,
    custom_image_url = ec.image_url,
    display_order = COALESCE(ec.display_order, 1)
FROM event_courses ec
WHERE event_rounds.event_id = ec.event_id 
    AND event_rounds.course_name = ec.name
    AND event_rounds.custom_description IS NULL; -- Only update if not already set

-- Step 3: Create index for display_order for better performance
CREATE INDEX IF NOT EXISTS idx_event_rounds_display_order ON event_rounds(event_id, display_order);

-- Step 4: Drop the event_courses table (this will cascade delete all related data)
DROP TABLE IF EXISTS event_courses CASCADE;

-- Step 5: Verify the migration
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as rounds_with_customizations
FROM event_rounds 
WHERE custom_description IS NOT NULL 
    OR custom_image_url IS NOT NULL 
    OR display_order != 1;

-- Step 6: Show sample data to verify
SELECT 
    event_id,
    course_name,
    custom_description,
    custom_image_url,
    display_order,
    round_date
FROM event_rounds 
WHERE custom_description IS NOT NULL OR custom_image_url IS NOT NULL
ORDER BY event_id, display_order
LIMIT 5;

-- Add comments for documentation
COMMENT ON COLUMN event_rounds.custom_description IS 'Event-specific custom description for this course/round';
COMMENT ON COLUMN event_rounds.custom_image_url IS 'Event-specific custom image URL for this course/round';
COMMENT ON COLUMN event_rounds.display_order IS 'Custom display order for this round within the event';
