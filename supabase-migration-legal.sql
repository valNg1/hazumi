-- ============================================================
-- Migration légale Hazumi — multi-club + DPA + RGPD
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Étendre la table clubs
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS adresse          text,
  ADD COLUMN IF NOT EXISTS email_contact    text,
  ADD COLUMN IF NOT EXISTS nom_representant text,
  ADD COLUMN IF NOT EXISTS dpa_accepted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS dpa_accepted_by  uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_at       timestamptz DEFAULT now();

-- 2. Étendre la table judokas
ALTER TABLE judokas
  ADD COLUMN IF NOT EXISTS club_id              uuid REFERENCES clubs(id),
  ADD COLUMN IF NOT EXISTS privacy_accepted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS is_minor             boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS guardian_confirmed   boolean DEFAULT false;

-- 3. Rattacher les judokas existants au seul club existant
UPDATE judokas
  SET club_id = (SELECT id FROM clubs LIMIT 1)
  WHERE club_id IS NULL;

-- 4. Fonction helper pour éviter la récursion infinie dans les policies
CREATE OR REPLACE FUNCTION get_my_club_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT club_id FROM judokas WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. RLS sur clubs
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Club members can read their club" ON clubs;
CREATE POLICY "Club members can read their club"
  ON clubs FOR SELECT TO authenticated
  USING (id = get_my_club_id());

DROP POLICY IF EXISTS "Authenticated can create club" ON clubs;
CREATE POLICY "Authenticated can create club"
  ON clubs FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Club admin can update club" ON clubs;
CREATE POLICY "Club admin can update club"
  ON clubs FOR UPDATE TO authenticated
  USING (dpa_accepted_by = auth.uid())
  WITH CHECK (dpa_accepted_by = auth.uid());

-- 6. RLS sur judokas
ALTER TABLE judokas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own club judokas" ON judokas;
CREATE POLICY "Read own club judokas"
  ON judokas FOR SELECT TO authenticated
  USING (club_id = get_my_club_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Update own judoka" ON judokas;
CREATE POLICY "Update own judoka"
  ON judokas FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Insert own judoka" ON judokas;
CREATE POLICY "Insert own judoka"
  ON judokas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
