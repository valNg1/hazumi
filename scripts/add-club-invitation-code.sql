-- Ajoute le code d'invitation sur les clubs
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS code_invitation text UNIQUE;

-- Génère un code pour les clubs existants qui n'en ont pas
UPDATE clubs
SET code_invitation = UPPER(SUBSTRING(MD5(id::text || RANDOM()::text), 1, 6))
WHERE code_invitation IS NULL;
