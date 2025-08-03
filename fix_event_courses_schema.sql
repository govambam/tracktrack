-- Fix event_courses table schema
-- Run this script in your Supabase SQL Editor

-- First, check current table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'event_courses'
ORDER BY ordinal_position;

-- Drop and recreate the table with correct schema
DROP TABLE IF EXISTS event_courses CASCADE;

-- Create the table with proper UUID auto-generation
CREATE TABLE event_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  par INTEGER DEFAULT NULL,
  yardage INTEGER DEFAULT NULL,
  description TEXT DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  weather_note TEXT DEFAULT NULL,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_event_courses_event_id ON event_courses(event_id);
CREATE INDEX idx_event_courses_display_order ON event_courses(event_id, display_order);

-- Enable RLS
ALTER TABLE event_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view courses for own events" ON event_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert courses for own events" ON event_courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update courses for own events" ON event_courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete courses for own events" ON event_courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Create public read policy for published events  
CREATE POLICY "Published event courses are publicly viewable" ON event_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.is_published = true
    )
  );

-- Test the UUID generation
INSERT INTO event_courses (event_id, name, display_order) 
VALUES ('abfc3566-3e01-4bc5-9f64-a14640d86728', 'Test Course', 1);

-- Verify the insert worked and UUID was generated
SELECT id, event_id, name FROM event_courses WHERE name = 'Test Course';

-- Clean up test data
DELETE FROM event_courses WHERE name = 'Test Course';

-- Final verification - show the correct table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'event_courses'
ORDER BY ordinal_position;

SELECT 'event_courses table fixed successfully!' as result;
