-- Add unique constraint to prevent duplicate courses per event
-- Run this script in your Supabase SQL Editor

-- First, let's see if there are any existing duplicates
SELECT event_id, name, COUNT(*) as duplicate_count
FROM event_courses 
GROUP BY event_id, name 
HAVING COUNT(*) > 1;

-- Remove any existing duplicates (keep the first one, delete the rest)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY event_id, name ORDER BY created_at) as rn
  FROM event_courses
)
DELETE FROM event_courses 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
-- This ensures each course name can only appear once per event
ALTER TABLE event_courses 
ADD CONSTRAINT unique_event_course_name 
UNIQUE (event_id, name);

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'event_courses' 
AND constraint_type = 'UNIQUE';

-- Test the constraint (this should fail if run twice)
-- INSERT INTO event_courses (event_id, name, display_order) 
-- VALUES ('abfc3566-3e01-4bc5-9f64-a14640d86728', 'Test Duplicate', 1);

SELECT 'Unique constraint added successfully!' as result;
