-- Création table playlists_collections pour Shiai
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS playlists_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE playlists_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlists_collections_select" ON playlists_collections;
DROP POLICY IF EXISTS "playlists_collections_insert" ON playlists_collections;
DROP POLICY IF EXISTS "playlists_collections_delete" ON playlists_collections;

CREATE POLICY "playlists_collections_select" ON playlists_collections
  FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "playlists_collections_insert" ON playlists_collections
  FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "playlists_collections_delete" ON playlists_collections
  FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
