-- Add theme column to entrainements table
ALTER TABLE entrainements ADD COLUMN IF NOT EXISTS theme text DEFAULT 'autre';

-- Create enum-like check for themes
ALTER TABLE entrainements
ADD CONSTRAINT check_theme_valid
CHECK (theme IN ('technique', 'physique', 'video', 'recuperation', 'endurance', 'autre'));
