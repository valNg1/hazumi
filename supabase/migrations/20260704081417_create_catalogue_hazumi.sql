CREATE TABLE IF NOT EXISTS catalogue_hazumi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL CHECK (length(trim(titre)) > 0),
  type TEXT NOT NULL CHECK (type IN ('video', 'article', 'pdf')),
  parcours TEXT NOT NULL CHECK (parcours IN ('shiai', 'judo-ka', 'kyu')),
  url TEXT,
  contenu TEXT,
  tags TEXT[],
  created_by UUID REFERENCES judokas(id),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE catalogue_hazumi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lecture catalogue" ON catalogue_hazumi;
CREATE POLICY "lecture catalogue"
ON catalogue_hazumi FOR SELECT
USING (
  EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "admin gere catalogue" ON catalogue_hazumi;
CREATE POLICY "admin gere catalogue"
ON catalogue_hazumi FOR ALL
USING (
  EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
);
