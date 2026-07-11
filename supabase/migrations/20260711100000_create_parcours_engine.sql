-- Moteur de parcours pedagogiques (generique, illimite).
-- Additif : ne touche a aucune table existante.

-- 1. Un parcours = un chemin pedagogique ordonne de ressources du catalogue.
CREATE TABLE IF NOT EXISTS parcours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL CHECK (length(trim(titre)) > 0),
  description TEXT,
  niveau TEXT,
  image TEXT,
  duree_estimee TEXT,
  ordre INTEGER NOT NULL DEFAULT 0,
  publie BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Association N-N parcours <-> ressource (catalogue_hazumi). Une ressource
--    peut appartenir a plusieurs parcours. Pas de doublon dans un parcours.
CREATE TABLE IF NOT EXISTS parcours_ressources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcours_id UUID NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
  ressource_id UUID NOT NULL REFERENCES catalogue_hazumi(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL DEFAULT 0,
  obligatoire BOOLEAN NOT NULL DEFAULT true,
  commentaire TEXT,
  UNIQUE (parcours_id, ressource_id)
);

-- 3. Suivi utilisateur (par judoka). ressources_terminees garde l'etat par
--    ressource pour la progression automatique.
CREATE TABLE IF NOT EXISTS user_parcours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  parcours_id UUID NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
  progression INTEGER NOT NULL DEFAULT 0,
  termine BOOLEAN NOT NULL DEFAULT false,
  ressources_terminees UUID[] NOT NULL DEFAULT '{}',
  date_debut TIMESTAMPTZ DEFAULT now(),
  date_fin TIMESTAMPTZ,
  UNIQUE (judoka_id, parcours_id)
);

CREATE INDEX IF NOT EXISTS idx_parcours_ressources_parcours ON parcours_ressources(parcours_id);
CREATE INDEX IF NOT EXISTS idx_user_parcours_judoka ON user_parcours(judoka_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE parcours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parcours_select" ON parcours;
DROP POLICY IF EXISTS "parcours_admin" ON parcours;
CREATE POLICY "parcours_select" ON parcours FOR SELECT TO authenticated
  USING (
    publie = true
    OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "parcours_admin" ON parcours FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE parcours_ressources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parcours_ressources_select" ON parcours_ressources;
DROP POLICY IF EXISTS "parcours_ressources_admin" ON parcours_ressources;
CREATE POLICY "parcours_ressources_select" ON parcours_ressources FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parcours p
      WHERE p.id = parcours_id
        AND (p.publie = true
          OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
    )
  );
CREATE POLICY "parcours_ressources_admin" ON parcours_ressources FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE user_parcours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_parcours_select" ON user_parcours;
DROP POLICY IF EXISTS "user_parcours_insert" ON user_parcours;
DROP POLICY IF EXISTS "user_parcours_update" ON user_parcours;
DROP POLICY IF EXISTS "user_parcours_delete" ON user_parcours;
CREATE POLICY "user_parcours_select" ON user_parcours FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "user_parcours_insert" ON user_parcours FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "user_parcours_update" ON user_parcours FOR UPDATE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()))
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "user_parcours_delete" ON user_parcours FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
