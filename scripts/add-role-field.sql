-- Add role field to judokas table

ALTER TABLE judokas ADD COLUMN IF NOT EXISTS role text DEFAULT 'judoka';

-- Update RLS policy if needed (judokas can only read their own row + club rows)
-- This is likely already handled by existing RLS
