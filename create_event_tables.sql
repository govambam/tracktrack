-- ============================================
-- Complete Event Management Tables Setup
-- No RLS policies during MVP phase
-- ============================================

-- 1. EVENT_ROUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  round_date DATE NOT NULL,
  tee_time TIME,
  holes INTEGER DEFAULT 18 CHECK (holes > 0),
  scoring_type TEXT DEFAULT 'stroke_play' CHECK (scoring_type IN ('stroke_play', 'stableford', 'match_play')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. EVENT_PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  handicap NUMERIC(4,1) CHECK (handicap >= 0 AND handicap <= 54),
  profile_image TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. EVENT_PRIZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES event_rounds(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'overall_champion', 'runner_up', 'third_place',
    'closest_to_pin', 'longest_drive', 'most_improved',
    'team_winner', 'low_net', 'low_gross', 'custom'
  )),
  amount DECIMAL(10,2) CHECK (amount >= 0),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. EVENT_TRAVEL TABLE (One per event)
-- ============================================
CREATE TABLE IF NOT EXISTS event_travel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  flight_info TEXT,
  accommodations TEXT,
  daily_schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. EVENT_CUSTOMIZATION TABLE (One per event)
-- ============================================
CREATE TABLE IF NOT EXISTS event_customization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  logo_url TEXT,
  custom_domain TEXT,
  theme_color TEXT DEFAULT '#059669' CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  is_private BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Event Rounds indexes
CREATE INDEX IF NOT EXISTS idx_event_rounds_event_id ON event_rounds(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rounds_date ON event_rounds(round_date);
CREATE INDEX IF NOT EXISTS idx_event_rounds_scoring ON event_rounds(scoring_type);

-- Event Players indexes
CREATE INDEX IF NOT EXISTS idx_event_players_event_id ON event_players(event_id);
CREATE INDEX IF NOT EXISTS idx_event_players_email ON event_players(email);
CREATE INDEX IF NOT EXISTS idx_event_players_team ON event_players(team);
CREATE INDEX IF NOT EXISTS idx_event_players_handicap ON event_players(handicap);

-- Event Prizes indexes
CREATE INDEX IF NOT EXISTS idx_event_prizes_event_id ON event_prizes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_prizes_round_id ON event_prizes(round_id);
CREATE INDEX IF NOT EXISTS idx_event_prizes_category ON event_prizes(category);

-- Event Travel indexes (minimal since one per event)
CREATE INDEX IF NOT EXISTS idx_event_travel_event_id ON event_travel(event_id);

-- Event Customization indexes (minimal since one per event)
CREATE INDEX IF NOT EXISTS idx_event_customization_event_id ON event_customization(event_id);
CREATE INDEX IF NOT EXISTS idx_event_customization_domain ON event_customization(custom_domain);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Apply update triggers to all new tables
CREATE TRIGGER update_event_rounds_updated_at 
    BEFORE UPDATE ON event_rounds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_players_updated_at 
    BEFORE UPDATE ON event_players 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_prizes_updated_at 
    BEFORE UPDATE ON event_prizes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_travel_updated_at 
    BEFORE UPDATE ON event_travel 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_customization_updated_at 
    BEFORE UPDATE ON event_customization 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USEFUL CONSTRAINTS AND VALIDATIONS
-- ============================================

-- Ensure email format is valid (basic check)
ALTER TABLE event_players 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure custom domain format is valid (basic check)
ALTER TABLE event_customization 
ADD CONSTRAINT check_domain_format 
CHECK (custom_domain IS NULL OR custom_domain ~* '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Ensure round date is not in the distant past
ALTER TABLE event_rounds 
ADD CONSTRAINT check_reasonable_date 
CHECK (round_date >= '2020-01-01');

-- ============================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- ============================================

-- Verify all tables exist with correct columns
-- SELECT table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name IN ('event_rounds', 'event_players', 'event_prizes', 'event_travel', 'event_customization')
-- ORDER BY table_name, ordinal_position;

-- Verify foreign key relationships
-- SELECT 
--   tc.table_name, 
--   kcu.column_name, 
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('event_rounds', 'event_players', 'event_prizes', 'event_travel', 'event_customization');

-- Verify indexes
-- SELECT indexname, tablename, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('event_rounds', 'event_players', 'event_prizes', 'event_travel', 'event_customization')
-- ORDER BY tablename, indexname;
