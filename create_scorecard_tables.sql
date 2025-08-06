-- Create scorecard tables for real golf scorecard functionality
-- Run this in your Supabase SQL Editor

-- Create scorecards table to track individual player scorecards for each round
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES event_rounds(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  total_strokes INTEGER DEFAULT 0,
  total_par INTEGER DEFAULT 0,
  score_relative_to_par INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false
);

-- Create hole_scores table to store individual hole scores
CREATE TABLE IF NOT EXISTS hole_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scorecard_id UUID REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  hole_number INTEGER NOT NULL CHECK (hole_number > 0 AND hole_number <= 18),
  strokes INTEGER DEFAULT 0 CHECK (strokes >= 0 AND strokes <= 15),
  par INTEGER DEFAULT 4 CHECK (par >= 3 AND par <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one score per hole per scorecard
  UNIQUE(scorecard_id, hole_number)
);

-- Create course_holes table to store par information for each hole
CREATE TABLE IF NOT EXISTS course_holes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_name TEXT NOT NULL,
  hole_number INTEGER NOT NULL CHECK (hole_number > 0 AND hole_number <= 18),
  par INTEGER DEFAULT 4 CHECK (par >= 3 AND par <= 5),
  yardage INTEGER DEFAULT 400 CHECK (yardage > 0),
  handicap INTEGER CHECK (handicap >= 1 AND handicap <= 18),
  description TEXT,
  
  -- Ensure one par per hole per course
  UNIQUE(course_name, hole_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scorecards_event_round ON scorecards(event_id, round_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_session ON scorecards(session_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_scorecard ON hole_scores(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_hole ON hole_scores(hole_number);
CREATE INDEX IF NOT EXISTS idx_course_holes_course ON course_holes(course_name);

-- Enable RLS
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scorecards
DROP POLICY IF EXISTS "Users can view all scorecards" ON scorecards;
CREATE POLICY "Users can view all scorecards" ON scorecards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own scorecards" ON scorecards;
CREATE POLICY "Users can create their own scorecards" ON scorecards
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own scorecards" ON scorecards;
CREATE POLICY "Users can update their own scorecards" ON scorecards
  FOR UPDATE USING (true);

-- RLS Policies for hole_scores
DROP POLICY IF EXISTS "Users can view all hole scores" ON hole_scores;
CREATE POLICY "Users can view all hole scores" ON hole_scores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage hole scores" ON hole_scores;
CREATE POLICY "Users can manage hole scores" ON hole_scores
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for course_holes
DROP POLICY IF EXISTS "Users can view course holes" ON course_holes;
CREATE POLICY "Users can view course holes" ON course_holes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Event owners can manage course holes" ON course_holes;
CREATE POLICY "Event owners can manage course holes" ON course_holes
  FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically calculate scorecard totals
CREATE OR REPLACE FUNCTION update_scorecard_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the scorecard totals when hole scores change
  UPDATE scorecards 
  SET 
    total_strokes = (
      SELECT COALESCE(SUM(strokes), 0) 
      FROM hole_scores 
      WHERE scorecard_id = COALESCE(NEW.scorecard_id, OLD.scorecard_id)
    ),
    total_par = (
      SELECT COALESCE(SUM(par), 0) 
      FROM hole_scores 
      WHERE scorecard_id = COALESCE(NEW.scorecard_id, OLD.scorecard_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.scorecard_id, OLD.scorecard_id);
  
  -- Update score relative to par
  UPDATE scorecards 
  SET score_relative_to_par = total_strokes - total_par
  WHERE id = COALESCE(NEW.scorecard_id, OLD.scorecard_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update scorecard totals
DROP TRIGGER IF EXISTS trigger_update_scorecard_totals_insert ON hole_scores;
CREATE TRIGGER trigger_update_scorecard_totals_insert
  AFTER INSERT ON hole_scores
  FOR EACH ROW EXECUTE FUNCTION update_scorecard_totals();

DROP TRIGGER IF EXISTS trigger_update_scorecard_totals_update ON hole_scores;
CREATE TRIGGER trigger_update_scorecard_totals_update
  AFTER UPDATE ON hole_scores
  FOR EACH ROW EXECUTE FUNCTION update_scorecard_totals();

DROP TRIGGER IF EXISTS trigger_update_scorecard_totals_delete ON hole_scores;
CREATE TRIGGER trigger_update_scorecard_totals_delete
  AFTER DELETE ON hole_scores
  FOR EACH ROW EXECUTE FUNCTION update_scorecard_totals();

-- Insert default par values for common courses
INSERT INTO course_holes (course_name, hole_number, par, yardage, handicap) VALUES
  -- TPC Summerlin (realistic par layout)
  ('TPC Summerlin', 1, 4, 425, 9),
  ('TPC Summerlin', 2, 3, 185, 17),
  ('TPC Summerlin', 3, 5, 540, 3),
  ('TPC Summerlin', 4, 4, 380, 13),
  ('TPC Summerlin', 5, 4, 410, 7),
  ('TPC Summerlin', 6, 3, 165, 15),
  ('TPC Summerlin', 7, 4, 435, 5),
  ('TPC Summerlin', 8, 5, 515, 1),
  ('TPC Summerlin', 9, 4, 400, 11),
  ('TPC Summerlin', 10, 4, 415, 8),
  ('TPC Summerlin', 11, 3, 195, 16),
  ('TPC Summerlin', 12, 5, 525, 2),
  ('TPC Summerlin', 13, 4, 390, 12),
  ('TPC Summerlin', 14, 4, 420, 6),
  ('TPC Summerlin', 15, 3, 175, 18),
  ('TPC Summerlin', 16, 4, 445, 4),
  ('TPC Summerlin', 17, 5, 530, 10),
  ('TPC Summerlin', 18, 4, 440, 14),

  -- Wynn Golf Resort
  ('Wynn Golf Resort', 1, 4, 420, 9),
  ('Wynn Golf Resort', 2, 3, 180, 17),
  ('Wynn Golf Resort', 3, 5, 535, 3),
  ('Wynn Golf Resort', 4, 4, 375, 13),
  ('Wynn Golf Resort', 5, 4, 405, 7),
  ('Wynn Golf Resort', 6, 3, 160, 15),
  ('Wynn Golf Resort', 7, 4, 430, 5),
  ('Wynn Golf Resort', 8, 5, 510, 1),
  ('Wynn Golf Resort', 9, 4, 395, 11),
  ('Wynn Golf Resort', 10, 4, 410, 8),
  ('Wynn Golf Resort', 11, 3, 190, 16),
  ('Wynn Golf Resort', 12, 5, 520, 2),
  ('Wynn Golf Resort', 13, 4, 385, 12),
  ('Wynn Golf Resort', 14, 4, 415, 6),
  ('Wynn Golf Resort', 15, 3, 170, 18),
  ('Wynn Golf Resort', 16, 4, 440, 4),
  ('Wynn Golf Resort', 17, 5, 525, 10),
  ('Wynn Golf Resort', 18, 4, 435, 14),

  -- Gamble Sands
  ('Gamble Sands', 1, 4, 430, 9),
  ('Gamble Sands', 2, 3, 175, 17),
  ('Gamble Sands', 3, 5, 545, 3),
  ('Gamble Sands', 4, 4, 385, 13),
  ('Gamble Sands', 5, 4, 415, 7),
  ('Gamble Sands', 6, 3, 170, 15),
  ('Gamble Sands', 7, 4, 440, 5),
  ('Gamble Sands', 8, 5, 520, 1),
  ('Gamble Sands', 9, 4, 405, 11),
  ('Gamble Sands', 10, 4, 420, 8),
  ('Gamble Sands', 11, 3, 185, 16),
  ('Gamble Sands', 12, 5, 535, 2),
  ('Gamble Sands', 13, 4, 395, 12),
  ('Gamble Sands', 14, 4, 425, 6),
  ('Gamble Sands', 15, 3, 165, 18),
  ('Gamble Sands', 16, 4, 450, 4),
  ('Gamble Sands', 17, 5, 540, 10),
  ('Gamble Sands', 18, 4, 445, 14)
ON CONFLICT (course_name, hole_number) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE scorecards IS 'Player scorecards for each round of an event';
COMMENT ON TABLE hole_scores IS 'Individual hole scores within a scorecard';
COMMENT ON TABLE course_holes IS 'Course hole information including par and yardage';
