CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judoka_id UUID REFERENCES judokas(id) NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('judoka', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP DEFAULT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "judoka voit ses messages" ON messages;
CREATE POLICY "judoka voit ses messages"
ON messages FOR SELECT
USING (
  judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "judoka peut envoyer" ON messages;
CREATE POLICY "judoka peut envoyer"
ON messages FOR INSERT
WITH CHECK (
  judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
);
