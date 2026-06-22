-- ============================================================
-- BLOC 2 — RLS multi-tenant complet — Hazumi
-- À exécuter dans l'ordre dans Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Fonctions helper (SECURITY DEFINER pour éviter récursion)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_club_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT club_id FROM judokas WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(role, 'judoka') FROM judokas WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION is_club_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM judokas
    WHERE user_id = auth.uid()
    AND role IN ('responsable', 'prof')
  )
$$;

-- ────────────────────────────────────────────────────────────
-- 2. Colonne role sur judokas
-- ────────────────────────────────────────────────────────────

ALTER TABLE judokas ADD COLUMN IF NOT EXISTS role text DEFAULT 'judoka';

-- ────────────────────────────────────────────────────────────
-- 3. Ajouter club_id aux tables qui n'en ont pas
-- ────────────────────────────────────────────────────────────

ALTER TABLE competitions  ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);
ALTER TABLE evenements    ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);
ALTER TABLE bureau_cr     ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);
ALTER TABLE cours         ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);
ALTER TABLE seances       ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);

-- Migrer les données existantes vers le seul club non-test
DO $$
DECLARE v_club_id uuid;
BEGIN
  SELECT id INTO v_club_id FROM clubs WHERE nom NOT LIKE '__TEST_%' LIMIT 1;
  IF v_club_id IS NOT NULL THEN
    UPDATE competitions SET club_id = v_club_id WHERE club_id IS NULL;
    UPDATE evenements   SET club_id = v_club_id WHERE club_id IS NULL;
    UPDATE bureau_cr    SET club_id = v_club_id WHERE club_id IS NULL;
    UPDATE cours        SET club_id = v_club_id WHERE club_id IS NULL;
    UPDATE seances      SET club_id = v_club_id WHERE club_id IS NULL;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 4. judokas — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE judokas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Club lecture tous"        ON judokas;
DROP POLICY IF EXISTS "Lecture propre"           ON judokas;
DROP POLICY IF EXISTS "Insertion propre"         ON judokas;
DROP POLICY IF EXISTS "Mise à jour propre"       ON judokas;
DROP POLICY IF EXISTS "Read own judoka"          ON judokas;
DROP POLICY IF EXISTS "judokas_select"           ON judokas;
DROP POLICY IF EXISTS "judokas_insert"           ON judokas;
DROP POLICY IF EXISTS "judokas_update"           ON judokas;
DROP POLICY IF EXISTS "judokas_delete"           ON judokas;

-- Lecture : même club OU propre ligne (pour compte sans club encore assigné)
CREATE POLICY "judokas_select" ON judokas FOR SELECT TO authenticated
  USING (club_id = get_my_club_id() OR user_id = auth.uid());

-- Insertion : son propre profil uniquement (créé à l'inscription)
CREATE POLICY "judokas_insert" ON judokas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Mise à jour : sa propre ligne OU staff du même club
CREATE POLICY "judokas_update" ON judokas FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR (club_id = get_my_club_id() AND is_club_staff()))
  WITH CHECK (user_id = auth.uid() OR (club_id = get_my_club_id() AND is_club_staff()));

-- Suppression : staff du club uniquement
CREATE POLICY "judokas_delete" ON judokas FOR DELETE TO authenticated
  USING (club_id = get_my_club_id() AND is_club_staff());

-- ────────────────────────────────────────────────────────────
-- 5. clubs — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture clubs"            ON clubs;
DROP POLICY IF EXISTS "Insertion clubs"          ON clubs;
DROP POLICY IF EXISTS "Modification clubs"       ON clubs;
DROP POLICY IF EXISTS "clubs_select"             ON clubs;
DROP POLICY IF EXISTS "clubs_insert"             ON clubs;
DROP POLICY IF EXISTS "clubs_update"             ON clubs;

-- Lecture : son propre club seulement
CREATE POLICY "clubs_select" ON clubs FOR SELECT TO authenticated
  USING (id = get_my_club_id());

-- Insertion : permis (onboarding crée le club)
CREATE POLICY "clubs_insert" ON clubs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Modification : membres du club (staff ou admin)
CREATE POLICY "clubs_update" ON clubs FOR UPDATE TO authenticated
  USING (id = get_my_club_id())
  WITH CHECK (id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 6. videos — RLS (club_id déjà ajouté par fix-rls-isolation.sql)
-- ────────────────────────────────────────────────────────────

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Club members read their videos" ON videos;
DROP POLICY IF EXISTS "Club admin insert videos"       ON videos;
DROP POLICY IF EXISTS "Club admin update videos"       ON videos;
DROP POLICY IF EXISTS "Club admin delete videos"       ON videos;
DROP POLICY IF EXISTS "videos_select"                  ON videos;
DROP POLICY IF EXISTS "videos_insert"                  ON videos;
DROP POLICY IF EXISTS "videos_update"                  ON videos;
DROP POLICY IF EXISTS "videos_delete"                  ON videos;

CREATE POLICY "videos_select" ON videos FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "videos_insert" ON videos FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "videos_update" ON videos FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "videos_delete" ON videos FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 7. cours — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE cours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cours_select" ON cours;
DROP POLICY IF EXISTS "cours_insert" ON cours;
DROP POLICY IF EXISTS "cours_update" ON cours;
DROP POLICY IF EXISTS "cours_delete" ON cours;

CREATE POLICY "cours_select" ON cours FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "cours_insert" ON cours FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "cours_update" ON cours FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "cours_delete" ON cours FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 8. seances — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE seances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seances_select" ON seances;
DROP POLICY IF EXISTS "seances_insert" ON seances;
DROP POLICY IF EXISTS "seances_update" ON seances;
DROP POLICY IF EXISTS "seances_delete" ON seances;

CREATE POLICY "seances_select" ON seances FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "seances_insert" ON seances FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "seances_update" ON seances FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "seances_delete" ON seances FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 9. presences — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE presences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture presences"  ON presences;
DROP POLICY IF EXISTS "Read club presences" ON presences;
DROP POLICY IF EXISTS "presences_select"   ON presences;
DROP POLICY IF EXISTS "presences_insert"   ON presences;
DROP POLICY IF EXISTS "presences_update"   ON presences;
DROP POLICY IF EXISTS "presences_delete"   ON presences;

CREATE POLICY "presences_select" ON presences FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()));

CREATE POLICY "presences_insert" ON presences FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()));

CREATE POLICY "presences_delete" ON presences FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()));

-- ────────────────────────────────────────────────────────────
-- 10. competitions — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture competitions"  ON competitions;
DROP POLICY IF EXISTS "Gestion competitions"  ON competitions;
DROP POLICY IF EXISTS "Read competitions"     ON competitions;
DROP POLICY IF EXISTS "Manage competitions"   ON competitions;
DROP POLICY IF EXISTS "competitions_select"   ON competitions;
DROP POLICY IF EXISTS "competitions_insert"   ON competitions;
DROP POLICY IF EXISTS "competitions_update"   ON competitions;
DROP POLICY IF EXISTS "competitions_delete"   ON competitions;

CREATE POLICY "competitions_select" ON competitions FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "competitions_insert" ON competitions FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "competitions_update" ON competitions FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "competitions_delete" ON competitions FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 11. evenements — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evenements_select" ON evenements;
DROP POLICY IF EXISTS "evenements_insert" ON evenements;
DROP POLICY IF EXISTS "evenements_update" ON evenements;
DROP POLICY IF EXISTS "evenements_delete" ON evenements;

CREATE POLICY "evenements_select" ON evenements FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "evenements_insert" ON evenements FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "evenements_update" ON evenements FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "evenements_delete" ON evenements FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 12. competition_participations — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE competition_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compparts_select" ON competition_participations;
DROP POLICY IF EXISTS "compparts_insert" ON competition_participations;
DROP POLICY IF EXISTS "compparts_delete" ON competition_participations;

CREATE POLICY "compparts_select" ON competition_participations FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()));

CREATE POLICY "compparts_insert" ON competition_participations FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "compparts_delete" ON competition_participations FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 13. evenement_participations — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE evenement_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evtparts_select" ON evenement_participations;
DROP POLICY IF EXISTS "evtparts_insert" ON evenement_participations;
DROP POLICY IF EXISTS "evtparts_delete" ON evenement_participations;

CREATE POLICY "evtparts_select" ON evenement_participations FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()));

CREATE POLICY "evtparts_insert" ON evenement_participations FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "evtparts_delete" ON evenement_participations FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 14. bureau_cr — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE bureau_cr ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bureau_cr_select" ON bureau_cr;
DROP POLICY IF EXISTS "bureau_cr_insert" ON bureau_cr;
DROP POLICY IF EXISTS "bureau_cr_update" ON bureau_cr;
DROP POLICY IF EXISTS "bureau_cr_delete" ON bureau_cr;

CREATE POLICY "bureau_cr_select" ON bureau_cr FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "bureau_cr_insert" ON bureau_cr FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "bureau_cr_update" ON bureau_cr FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id()) WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "bureau_cr_delete" ON bureau_cr FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 15. entrainements — RLS (judoka propre uniquement)
-- ────────────────────────────────────────────────────────────

ALTER TABLE entrainements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture entrainements"  ON entrainements;
DROP POLICY IF EXISTS "Gestion entrainements"  ON entrainements;
DROP POLICY IF EXISTS "Read own entrainements"   ON entrainements;
DROP POLICY IF EXISTS "Insert own entrainements" ON entrainements;
DROP POLICY IF EXISTS "Update own entrainements" ON entrainements;
DROP POLICY IF EXISTS "Delete own entrainements" ON entrainements;
DROP POLICY IF EXISTS "entrainements_select" ON entrainements;
DROP POLICY IF EXISTS "entrainements_insert" ON entrainements;
DROP POLICY IF EXISTS "entrainements_update" ON entrainements;
DROP POLICY IF EXISTS "entrainements_delete" ON entrainements;

CREATE POLICY "entrainements_select" ON entrainements FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
    OR (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()) AND is_club_staff()));

CREATE POLICY "entrainements_insert" ON entrainements FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "entrainements_update" ON entrainements FOR UPDATE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "entrainements_delete" ON entrainements FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 16. playlists, technique_mastery, video_views — RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "playlists_select" ON playlists;
DROP POLICY IF EXISTS "playlists_insert" ON playlists;
DROP POLICY IF EXISTS "playlists_update" ON playlists;
DROP POLICY IF EXISTS "playlists_delete" ON playlists;

CREATE POLICY "playlists_select" ON playlists FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "playlists_insert" ON playlists FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "playlists_update" ON playlists FOR UPDATE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));
CREATE POLICY "playlists_delete" ON playlists FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

ALTER TABLE technique_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tm_select" ON technique_mastery;
DROP POLICY IF EXISTS "tm_insert" ON technique_mastery;
DROP POLICY IF EXISTS "tm_update" ON technique_mastery;
DROP POLICY IF EXISTS "tm_delete" ON technique_mastery;

CREATE POLICY "tm_select" ON technique_mastery FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
    OR (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()) AND is_club_staff()));
CREATE POLICY "tm_insert" ON technique_mastery FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
    OR (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()) AND is_club_staff()));
CREATE POLICY "tm_update" ON technique_mastery FOR UPDATE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
    OR (judoka_id IN (SELECT id FROM judokas WHERE club_id = get_my_club_id()) AND is_club_staff()));
CREATE POLICY "tm_delete" ON technique_mastery FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vv_select" ON video_views;
DROP POLICY IF EXISTS "vv_insert" ON video_views;

CREATE POLICY "vv_select" ON video_views FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "vv_insert" ON video_views FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
