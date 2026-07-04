ALTER TABLE videos ADD COLUMN IF NOT EXISTS parcours TEXT NOT NULL DEFAULT 'shiai' CHECK (parcours IN ('shiai','judo-ka','kyu'));
ALTER TABLE playlists_collections ADD COLUMN IF NOT EXISTS parcours TEXT NOT NULL DEFAULT 'shiai' CHECK (parcours IN ('shiai','judo-ka','kyu'));
