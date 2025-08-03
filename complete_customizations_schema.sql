-- Complete Database Schema for Event Customizations
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. CREATE EVENT_COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  course_id UUID DEFAULT NULL, -- Future reference to master courses table
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

-- Create indexes for event_courses
CREATE INDEX IF NOT EXISTS idx_event_courses_event_id ON event_courses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_courses_display_order ON event_courses(event_id, display_order);

-- ============================================
-- 2. CREATE EVENT_CUSTOMIZATION TABLE  
-- ============================================
CREATE TABLE IF NOT EXISTS event_customization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  home_headline TEXT DEFAULT NULL,
  home_enabled BOOLEAN DEFAULT true,
  courses_enabled BOOLEAN DEFAULT true,
  rules_enabled BOOLEAN DEFAULT true,
  leaderboard_enabled BOOLEAN DEFAULT true,
  travel_enabled BOOLEAN DEFAULT true,
  logo_url TEXT DEFAULT NULL,
  custom_domain TEXT DEFAULT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for event_customization
CREATE INDEX IF NOT EXISTS idx_event_customization_event_id ON event_customization(event_id);

-- ============================================
-- 3. CREATE EVENT_RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  rule_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for event_rules
CREATE INDEX IF NOT EXISTS idx_event_rules_event_id ON event_rules(event_id);

-- ============================================
-- 4. ADD MISSING COLUMNS TO EVENTS TABLE
-- ============================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS travel_lodging TEXT,
ADD COLUMN IF NOT EXISTS travel_notes TEXT,
ADD COLUMN IF NOT EXISTS travel_airport TEXT,
ADD COLUMN IF NOT EXISTS travel_distance TEXT;

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE event_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES FOR EVENT_COURSES
-- ============================================
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

-- ============================================
-- 7. CREATE RLS POLICIES FOR EVENT_CUSTOMIZATION
-- ============================================
DROP POLICY IF EXISTS "Users can view customization for own events" ON event_customization;
CREATE POLICY "Users can view customization for own events" ON event_customization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert customization for own events" ON event_customization;
CREATE POLICY "Users can insert customization for own events" ON event_customization
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update customization for own events" ON event_customization;
CREATE POLICY "Users can update customization for own events" ON event_customization
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete customization for own events" ON event_customization;
CREATE POLICY "Users can delete customization for own events" ON event_customization
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- ============================================
-- 8. CREATE RLS POLICIES FOR EVENT_RULES
-- ============================================
DROP POLICY IF EXISTS "Users can view rules for own events" ON event_rules;
CREATE POLICY "Users can view rules for own events" ON event_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert rules for own events" ON event_rules;
CREATE POLICY "Users can insert rules for own events" ON event_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update rules for own events" ON event_rules;
CREATE POLICY "Users can update rules for own events" ON event_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete rules for own events" ON event_rules;
CREATE POLICY "Users can delete rules for own events" ON event_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- ============================================
-- 9. PUBLIC ACCESS POLICIES FOR PUBLISHED EVENTS
-- ============================================
DROP POLICY IF EXISTS "Published event courses are publicly viewable" ON event_courses;
CREATE POLICY "Published event courses are publicly viewable" ON event_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_courses.event_id 
      AND events.is_published = true
    )
  );

DROP POLICY IF EXISTS "Published event customizations are publicly viewable" ON event_customization;
CREATE POLICY "Published event customizations are publicly viewable" ON event_customization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_customization.event_id 
      AND events.is_published = true
    )
  );

DROP POLICY IF EXISTS "Published event rules are publicly viewable" ON event_rules;
CREATE POLICY "Published event rules are publicly viewable" ON event_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rules.event_id 
      AND events.is_published = true
    )
  );

-- ============================================
-- 10. CREATE UPDATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_event_courses_updated_at ON event_courses;
CREATE TRIGGER update_event_courses_updated_at 
    BEFORE UPDATE ON event_courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_customization_updated_at ON event_customization;
CREATE TRIGGER update_event_customization_updated_at 
    BEFORE UPDATE ON event_customization 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_rules_updated_at ON event_rules;
CREATE TRIGGER update_event_rules_updated_at 
    BEFORE UPDATE ON event_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. VERIFICATION QUERIES
-- ============================================
-- Check if all tables were created successfully
SELECT 
  'event_courses' as table_name,
  count(*) as row_count
FROM event_courses
UNION ALL
SELECT 
  'event_customization' as table_name,
  count(*) as row_count  
FROM event_customization
UNION ALL
SELECT 
  'event_rules' as table_name,
  count(*) as row_count
FROM event_rules;

-- List all columns for verification
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('event_courses', 'event_customization', 'event_rules')
ORDER BY table_name, ordinal_position;

-- Success message
SELECT 'Database schema setup completed successfully!' as result;
