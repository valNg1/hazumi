-- Ajout additif de metadonnees techniques au catalogue Hazumi.
-- Colonnes nullables : n'altere ni ne supprime l'existant.
ALTER TABLE catalogue_hazumi ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE catalogue_hazumi ADD COLUMN IF NOT EXISTS famille TEXT;
