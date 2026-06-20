-- ============================================================
-- Corrections d'isolation RLS multi-club — Hazumi
-- À exécuter dans Supabase SQL Editor
-- Relancer scripts/test-rls-isolation.ts pour vérifier
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. judokas — supprimer l'ancienne policy permissive
-- ────────────────────────────────────────────────────────────
-- "Club lecture tous" avec USING (true) permet à tout utilisateur
-- authentifié de lire TOUS les judokas de TOUS les clubs.
-- La migration supabase-migration-legal.sql a ajouté la bonne
-- policy basée sur club_id, mais l'ancienne reste active et
-- les policies PERMISSIVE se combinent en OR → la faille persiste.

DROP POLICY IF EXISTS "Club lecture tous" ON judokas;
DROP POLICY IF EXISTS "Lecture propre" ON judokas;
DROP POLICY IF EXISTS "Insertion propre" ON judokas;
DROP POLICY IF EXISTS "Mise à jour propre" ON judokas;

-- Recréer des policies claires et non-conflictuelles
-- (les policies de supabase-migration-legal.sql restent)
-- Ajout d'une policy pour permettre au judoka de lire son propre profil
-- même si get_my_club_id() retourne NULL (compte sans club assigné)
DROP POLICY IF EXISTS "Read own judoka" ON judokas;
CREATE POLICY "Read own judoka"
  ON judokas FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 2. clubs — supprimer l'ancienne policy permissive
-- ────────────────────────────────────────────────────────────
-- "Lecture clubs" avec USING (auth.role() = 'authenticated')
-- expose tous les clubs à tous les utilisateurs.

DROP POLICY IF EXISTS "Lecture clubs" ON clubs;
DROP POLICY IF EXISTS "Insertion clubs" ON clubs;
DROP POLICY IF EXISTS "Modification clubs" ON clubs;
-- Les policies de supabase-migration-legal.sql prennent le relais.

-- ────────────────────────────────────────────────────────────
-- 3. videos — ajouter club_id pour isolation par club
-- ────────────────────────────────────────────────────────────
-- La table videos n'a pas de club_id : toutes les vidéos sont
-- visibles et modifiables par tous les utilisateurs authentifiés.

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);

-- Rattacher les vidéos existantes au seul club existant
UPDATE videos
  SET club_id = (SELECT id FROM clubs WHERE nom NOT LIKE '__TEST_%' LIMIT 1)
  WHERE club_id IS NULL;

-- Supprimer les anciennes policies permissives sur videos
DROP POLICY IF EXISTS "Lecture videos" ON videos;
DROP POLICY IF EXISTS "Auth update videos" ON videos;
DROP POLICY IF EXISTS "Gestion videos" ON videos;
-- (adapter les noms si différents dans votre instance)

-- Nouvelles policies basées sur club_id
CREATE POLICY "Club members read their videos"
  ON videos FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "Club admin insert videos"
  ON videos FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "Club admin update videos"
  ON videos FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id())
  WITH CHECK (club_id = get_my_club_id());

CREATE POLICY "Club admin delete videos"
  ON videos FOR DELETE TO authenticated
  USING (club_id = get_my_club_id());

-- ────────────────────────────────────────────────────────────
-- 4. entrainements — restreindre au judoka propriétaire
-- ────────────────────────────────────────────────────────────
-- "Lecture entrainements" USING (true) expose les entraînements
-- de tous les judokas. "Gestion entrainements" permet à n'importe
-- quel utilisateur authentifié de modifier n'importe quel entrainement.

DROP POLICY IF EXISTS "Lecture entrainements" ON entrainements;
DROP POLICY IF EXISTS "Gestion entrainements" ON entrainements;

CREATE POLICY "Read own entrainements"
  ON entrainements FOR SELECT TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "Insert own entrainements"
  ON entrainements FOR INSERT TO authenticated
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "Update own entrainements"
  ON entrainements FOR UPDATE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()))
  WITH CHECK (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

CREATE POLICY "Delete own entrainements"
  ON entrainements FOR DELETE TO authenticated
  USING (judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 5. presences — restreindre la lecture au club
-- ────────────────────────────────────────────────────────────
-- "Lecture presences" USING (auth.role() = 'authenticated') expose
-- les présences de tous les judokas de tous les clubs.

DROP POLICY IF EXISTS "Lecture presences" ON presences;

CREATE POLICY "Read club presences"
  ON presences FOR SELECT TO authenticated
  USING (
    judoka_id IN (
      SELECT id FROM judokas WHERE club_id = get_my_club_id()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 6. competitions, bureau_cr, cours, seances
-- ────────────────────────────────────────────────────────────
-- Ces tables n'ont pas de club_id. Elles sont actuellement globales
-- (partagées entre tous les clubs). Deux options :
--
-- Option A (court terme) : restreindre en lecture/écriture aux
--   utilisateurs authentifiés — acceptable si vous restez mono-club.
--
-- Option B (long terme) : ajouter une colonne club_id à chacune,
--   migrer les données, et appliquer des policies basées sur get_my_club_id().
--
-- Ce script applique l'Option A pour sécuriser les écritures,
-- en attendant la migration Option B.

-- competitions : garder la lecture publique (affiches, calendriers)
-- mais restreindre les écritures
DROP POLICY IF EXISTS "Lecture competitions" ON competitions;
DROP POLICY IF EXISTS "Gestion competitions" ON competitions;

CREATE POLICY "Read competitions"
  ON competitions FOR SELECT TO authenticated
  USING (true); -- lecture ouverte à tous les membres

CREATE POLICY "Manage competitions"
  ON competitions FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
  -- TODO Option B : ajouter club_id et filtrer par get_my_club_id()

-- bureau_cr : restreindre aux authentifiés (déjà le cas, inchangé)
-- cours / seances : idem, pas de changement tant que pas de club_id

-- ────────────────────────────────────────────────────────────
-- 7. Vérification post-migration
-- ────────────────────────────────────────────────────────────
-- Après avoir exécuté ce script, relancez :
--   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/test-rls-isolation.ts
--
-- Résultats attendus :
--   ✅ judokas    SELECT cross-club  → bloqué
--   ✅ judokas    UPDATE cross-club  → bloqué
--   ✅ clubs      SELECT cross-club  → bloqué
--   ✅ clubs      UPDATE cross-club  → bloqué
--   ✅ videos     SELECT cross-club  → bloqué (après ajout club_id)
--   ✅ videos     INSERT             → bloqué
--   ✅ entrainements SELECT/UPDATE   → bloqué cross-club
--   ✅ playlists  SELECT cross-club  → déjà OK (policy par judoka_id)
--   ⚠  competitions SELECT          → global (intentionnel Option A)
