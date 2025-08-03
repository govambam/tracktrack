-- Simple Event Courses Table Setup
-- Run this script in your Supabase SQL Editor

-- Create the event_courses table
CREATE TABLE IF NOT EXISTS event_courses (
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
CREATE INDEX IF NOT EXISTS idx_event_courses_event_id ON event_courses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_courses_display_order ON event_courses(event_id, display_order);

-- Enable RLS
ALTER TABLE event_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
DROP POLICY IF EXISTS "Users can view courses for own events" ON event_courses;
CREATE POLICY "Users can view courses for own events" ON event_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert courses for own events" ON event_courses;
CREATE POLICY "Users can insert courses for own events" ON event_courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update courses for own events" ON event_courses;
CREATE POLICY "Users can update courses for own events" ON event_courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete courses for own events" ON event_courses;
CREATE POLICY "Users can delete courses for own events" ON event_courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Create public read policy for published events  
DROP POLICY IF EXISTS "Published event courses are publicly viewable" ON event_courses;
CREATE POLICY "Published event courses are publicly viewable" ON event_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.is_published = true
    )
  );

-- Test the table creation
SELECT 'event_courses table created successfully!' as result;
