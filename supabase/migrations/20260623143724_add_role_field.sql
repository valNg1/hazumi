-- Add role field to judokas table
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS role text DEFAULT 'judoka';
