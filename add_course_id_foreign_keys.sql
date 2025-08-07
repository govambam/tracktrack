-- ============================================
-- ADD COURSE_ID FOREIGN KEYS TO EXISTING TABLES
-- ============================================
-- This migration adds course_id foreign key columns to existing tables
-- to link them with the existing courses table.

-- Add course_id to course_holes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'course_holes' AND column_name = 'course_id') THEN
    ALTER TABLE course_holes ADD COLUMN course_id UUID REFERENCES courses(id);
  END IF;
END $$;

-- Add course_id to event_rounds table if it doesn't exist  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'event_rounds' AND column_name = 'course_id') THEN
    ALTER TABLE event_rounds ADD COLUMN course_id UUID REFERENCES courses(id);
  END IF;
END $$;

-- Populate course_id in course_holes table from existing course names
UPDATE course_holes 
SET course_id = courses.id 
FROM courses 
WHERE course_holes.course_name = courses.name 
AND course_holes.course_id IS NULL;

-- Populate course_id in event_rounds table from existing course names
UPDATE event_rounds 
SET course_id = courses.id 
FROM courses 
WHERE event_rounds.course_name = courses.name 
AND event_rounds.course_id IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX IF NOT EXISTS idx_event_rounds_course_id ON event_rounds(course_id);

-- Add comments for documentation
COMMENT ON COLUMN course_holes.course_id IS 'Foreign key reference to courses table for centralized course data';
COMMENT ON COLUMN event_rounds.course_id IS 'Foreign key reference to courses table for centralized course data';
