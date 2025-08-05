-- Add theme column to events table
ALTER TABLE events 
ADD COLUMN theme TEXT DEFAULT 'GolfOS';

-- Update existing events to have the default theme
UPDATE events 
SET theme = 'GolfOS' 
WHERE theme IS NULL;
