-- Update existing scorecard schema to work better with golf scoring
-- Run this in your Supabase SQL Editor

-- First, drop the constraint that requires strokes > 0
-- This is needed because players should be able to have 0 strokes for holes not yet played
ALTER TABLE scorecards 
DROP CONSTRAINT IF EXISTS scorecards_strokes_check;

-- Add a new constraint that allows 0 but limits max strokes
ALTER TABLE scorecards 
ADD CONSTRAINT scorecards_strokes_valid 
CHECK (strokes >= 0 AND strokes <= 15);

-- Add updated_at column if it doesn't exist
ALTER TABLE scorecards 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_scorecards_updated_at ON scorecards;
CREATE TRIGGER update_scorecards_updated_at 
    BEFORE UPDATE ON scorecards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create or update course_holes table for par information
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

-- Enable RLS on course_holes
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;

-- RLS policy for course_holes - everyone can read
DROP POLICY IF EXISTS "Anyone can view course holes" ON course_holes;
CREATE POLICY "Anyone can view course holes" ON course_holes
  FOR SELECT USING (true);

-- Insert realistic par data for the courses in your event
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scorecards_event_round_player ON scorecards(event_id, event_round_id, event_player_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_hole_number ON scorecards(hole_number);
CREATE INDEX IF NOT EXISTS idx_course_holes_course ON course_holes(course_name);

-- Comments for documentation
COMMENT ON TABLE scorecards IS 'Individual hole scores for players in golf rounds. Each row represents one hole score.';
COMMENT ON TABLE course_holes IS 'Course hole information including par and yardage for each hole on each course.';
