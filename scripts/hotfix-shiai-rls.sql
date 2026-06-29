-- HOTFIX: RLS pour Shiai — permettre lecture/insertion par uploaded_by
-- À exécuter dans Supabase SQL Editor

DROP POLICY IF EXISTS "videos_select" ON videos;
DROP POLICY IF EXISTS "videos_insert" ON videos;
DROP POLICY IF EXISTS "videos_update" ON videos;
DROP POLICY IF EXISTS "videos_delete" ON videos;

-- SELECT: club_id OU vidéo personnelle (uploaded_by = user)
CREATE POLICY "videos_select" ON videos FOR SELECT TO authenticated
  USING (club_id = get_my_club_id() OR uploaded_by = auth.uid());

-- INSERT: vidéos personnelles avec uploaded_by = user
CREATE POLICY "videos_insert" ON videos FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- UPDATE: club_id OU propre vidéo
CREATE POLICY "videos_update" ON videos FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id() OR uploaded_by = auth.uid())
  WITH CHECK (club_id = get_my_club_id() OR uploaded_by = auth.uid());

-- DELETE: club_id OU propre vidéo
CREATE POLICY "videos_delete" ON videos FOR DELETE TO authenticated
  USING (club_id = get_my_club_id() OR uploaded_by = auth.uid());
