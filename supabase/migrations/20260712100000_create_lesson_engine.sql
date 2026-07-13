-- Moteur de "Lecon" : niveau superieur d'une ressource du catalogue.
-- Additif, generique, pilote par la base. Colonnes sans accent.

-- 1. Lecon associee a une ressource du catalogue (1 lecon par ressource).
CREATE TABLE IF NOT EXISTS lesson (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ressource_id UUID NOT NULL REFERENCES catalogue_hazumi(id) ON DELETE CASCADE,
  youtube_url TEXT,
  duree_estimee TEXT,
  objectif TEXT,
  fiche_hazumi TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ressource_id)
);

-- 2. Chapitres video (timestamps) — jamais codes en dur cote UI.
CREATE TABLE IF NOT EXISTS lesson_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL DEFAULT 0,
  titre TEXT NOT NULL,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  description TEXT
);

-- 3. Quiz. type: choix_unique | choix_multiple | vrai_faux.
--    reponses : jsonb = tableau des libelles d'options (ex. ["Avant","Arriere"]).
--    bonne_reponse : jsonb = tableau des index corrects (0-base), ex. [0] ou [0,2].
CREATE TABLE IF NOT EXISTS lesson_quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'choix_unique'
    CHECK (type IN ('choix_unique', 'choix_multiple', 'vrai_faux')),
  reponses JSONB NOT NULL DEFAULT '[]'::jsonb,
  bonne_reponse JSONB NOT NULL DEFAULT '[]'::jsonb,
  explication TEXT
);

-- 4. Suivi utilisateur (patron user_parcours). Prive par judoka.
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (judoka_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'etudiee')),
  progression INTEGER NOT NULL DEFAULT 0,
  derniere_reprise TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (judoka_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS lesson_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  reponses JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (judoka_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_ressource ON lesson(ressource_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chapters_lesson ON lesson_chapters(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_lesson ON lesson_quiz(lesson_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

-- Contenu Lecon : lecture pour tout judoka authentifie SI published ; admin gere tout.
ALTER TABLE lesson ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_select" ON lesson;
DROP POLICY IF EXISTS "lesson_admin" ON lesson;
CREATE POLICY "lesson_select" ON lesson FOR SELECT TO authenticated
  USING (published = true OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "lesson_admin" ON lesson FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE lesson_chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_chapters_select" ON lesson_chapters;
DROP POLICY IF EXISTS "lesson_chapters_admin" ON lesson_chapters;
CREATE POLICY "lesson_chapters_select" ON lesson_chapters FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lesson l WHERE l.id = lesson_id
      AND (l.published = true OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  ));
CREATE POLICY "lesson_chapters_admin" ON lesson_chapters FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));

ALTER TABLE lesson_quiz ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_quiz_select" ON lesson_quiz;
DROP POLICY IF EXISTS "lesson_quiz_admin" ON lesson_quiz;
CREATE POLICY "lesson_quiz_select" ON lesson_quiz FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lesson l WHERE l.id = lesson_id
      AND (l.published = true OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  ));
CREATE POLICY "lesson_quiz_admin" ON lesson_quiz FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin'));

-- Donnees personnelles : chaque judoka lit/ecrit UNIQUEMENT les siennes. Aucun acces admin.
CREATE OR REPLACE FUNCTION lesson_is_owner(jid UUID) RETURNS boolean
  LANGUAGE sql SECURITY INVOKER STABLE AS $$
    SELECT jid IN (SELECT id FROM judokas WHERE user_id = auth.uid())
  $$;

ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_notes_owner" ON lesson_notes;
CREATE POLICY "lesson_notes_owner" ON lesson_notes FOR ALL TO authenticated
  USING (lesson_is_owner(judoka_id)) WITH CHECK (lesson_is_owner(judoka_id));

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_progress_owner" ON lesson_progress;
CREATE POLICY "lesson_progress_owner" ON lesson_progress FOR ALL TO authenticated
  USING (lesson_is_owner(judoka_id)) WITH CHECK (lesson_is_owner(judoka_id));

ALTER TABLE lesson_quiz_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_quiz_results_owner" ON lesson_quiz_results;
CREATE POLICY "lesson_quiz_results_owner" ON lesson_quiz_results FOR ALL TO authenticated
  USING (lesson_is_owner(judoka_id)) WITH CHECK (lesson_is_owner(judoka_id));
