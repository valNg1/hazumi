-- Add numero_enregistrement to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS numero_enregistrement text UNIQUE;
