-- ============================================
-- CENTRALIZED COURSES TABLE MIGRATION
-- ============================================
-- This migration creates a centralized courses table with is_official column
-- and migrates existing course data from course_holes and event_courses tables.

-- Create the centralized courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  description TEXT,
  website_url TEXT,
  phone TEXT,
  total_holes INTEGER DEFAULT 18 CHECK (total_holes > 0),
  total_par INTEGER,
  total_yardage INTEGER,
  course_rating DECIMAL(4,1),
  slope_rating INTEGER,
  is_official BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_courses_official ON courses(is_official);

-- Add index for course_holes.course_id for better performance
CREATE INDEX IF NOT EXISTS idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX IF NOT EXISTS idx_event_rounds_course_id ON event_rounds(course_id);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses table
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create unofficial courses" ON courses;
CREATE POLICY "Authenticated users can create unofficial courses" ON courses
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND is_official = false);

DROP POLICY IF EXISTS "Only admins can create official courses" ON courses;
CREATE POLICY "Only admins can create official courses" ON courses
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND is_official = true);

DROP POLICY IF EXISTS "Authenticated users can update unofficial courses" ON courses;
CREATE POLICY "Authenticated users can update unofficial courses" ON courses
  FOR UPDATE 
  USING (auth.role() = 'authenticated' AND is_official = false)
  WITH CHECK (auth.role() = 'authenticated' AND is_official = false);

-- Migrate existing courses from course_holes table
INSERT INTO courses (name, total_holes, total_par, total_yardage, is_official)
SELECT 
  course_name,
  COUNT(*) as total_holes,
  SUM(par) as total_par,
  SUM(yardage) as total_yardage,
  true as is_official -- Assume existing courses are official for now
FROM course_holes 
WHERE course_name IS NOT NULL
GROUP BY course_name
ON CONFLICT (name) DO NOTHING;

-- Update course_holes table to reference courses table
ALTER TABLE course_holes ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Populate course_id in course_holes table
UPDATE course_holes 
SET course_id = courses.id 
FROM courses 
WHERE course_holes.course_name = courses.name 
AND course_holes.course_id IS NULL;

-- Update event_rounds table to reference courses table
ALTER TABLE event_rounds ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Populate course_id in event_rounds table
UPDATE event_rounds 
SET course_id = courses.id 
FROM courses 
WHERE event_rounds.course_name = courses.name 
AND event_rounds.course_id IS NULL;

-- Update event_courses table to reference courses table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_courses') THEN
    -- Add course_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_courses' AND column_name = 'course_id') THEN
      ALTER TABLE event_courses ADD COLUMN course_id UUID REFERENCES courses(id);
    END IF;
    
    -- Populate course_id in event_courses table
    UPDATE event_courses 
    SET course_id = courses.id 
    FROM courses 
    WHERE event_courses.name = courses.name 
    AND event_courses.course_id IS NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE courses IS 'Centralized courses table containing all golf course information';
COMMENT ON COLUMN courses.is_official IS 'Whether this course is officially approved by TrackTrack (true) or user-created (false)';
COMMENT ON COLUMN courses.total_holes IS 'Total number of holes for the course (usually 18 or 9)';
COMMENT ON COLUMN courses.course_rating IS 'USGA course rating for scratch golfers';
COMMENT ON COLUMN courses.slope_rating IS 'USGA slope rating indicating difficulty relative to bogey golfer';

-- Create a view for course statistics
CREATE OR REPLACE VIEW course_stats AS
SELECT 
  c.id,
  c.name,
  c.location,
  c.total_holes,
  c.total_par,
  c.total_yardage,
  c.is_official,
  COUNT(DISTINCT er.event_id) as events_count,
  COUNT(DISTINCT er.id) as rounds_count
FROM courses c
LEFT JOIN event_rounds er ON c.id = er.course_id
GROUP BY c.id, c.name, c.location, c.total_holes, c.total_par, c.total_yardage, c.is_official;

COMMENT ON VIEW course_stats IS 'Course statistics including usage counts across events and rounds';
