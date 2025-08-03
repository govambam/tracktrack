-- Add missing fields to existing profiles table
-- Run this in your Supabase SQL Editor if you need these additional fields

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS handicap DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update the updated_at column to have a default value
ALTER TABLE profiles 
ALTER COLUMN updated_at SET DEFAULT NOW();
