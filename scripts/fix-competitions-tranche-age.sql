-- Ajoute la colonne tranche_age si elle n'existe pas encore
ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS tranche_age text[] DEFAULT '{}';

-- Ajoute aussi niveau si absent (échelon géographique)
ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS niveau text;
