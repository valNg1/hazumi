-- Architecture "Parcours-first" : categorisation des parcours en univers (vues),
-- + portes futures peu couteuses. 100% additif, aucune table de contenu touchee.

-- Univers = vues (SHIAI / KYU / JUDO-KA). Un parcours peut appartenir a
-- PLUSIEURS univers (N-N) -> on ne reproduit pas l'appartenance unique.
CREATE TABLE IF NOT EXISTS parcours_univers (
  parcours_id UUID NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
  univers TEXT NOT NULL CHECK (univers IN ('shiai', 'kyu', 'judo-ka')),
  PRIMARY KEY (parcours_id, univers)
);
CREATE INDEX IF NOT EXISTS idx_parcours_univers_univers ON parcours_univers(univers);

-- Portes futures (reservees, nullables, non utilisees pour l'instant) :
--  - parcours multi-club : NULL = parcours global.
ALTER TABLE parcours ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id);
--  - prerequis eventuels au sein d'un parcours (parcours non strictement lineaire).
ALTER TABLE parcours_ressources ADD COLUMN IF NOT EXISTS prerequis UUID[];

-- RLS : lecture pour tout judoka authentifie si le parcours est visible ;
-- ecriture reservee a l'admin (patron parcours_ressources).
ALTER TABLE parcours_univers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parcours_univers_select" ON parcours_univers;
DROP POLICY IF EXISTS "parcours_univers_admin" ON parcours_univers;
CREATE POLICY "parcours_univers_select" ON parcours_univers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM parcours p
    WHERE p.id = parcours_id
      AND (p.publie = true OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  ));
CREATE POLICY "parcours_univers_admin" ON parcours_univers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));
