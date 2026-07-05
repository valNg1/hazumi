-- US 9.5: support des conversations de groupe en plus du 1:1 judoka<->admin existant.
-- La table `messages` existante (judoka_id, sender, content, created_at, read_at) est
-- conservee telle quelle pour le flux 1:1 historique. On l'etend de facon additive
-- (colonnes nullable) plutot que de dupliquer une table `messages` en conflit de nom
-- avec un schema different (conversation_id/sender_id).

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE messages ALTER COLUMN judoka_id DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN sender DROP NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES judokas(id);

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_shape_check;
ALTER TABLE messages ADD CONSTRAINT messages_shape_check CHECK (
  (judoka_id IS NOT NULL AND sender IS NOT NULL)
  OR
  (conversation_id IS NOT NULL AND sender_id IS NOT NULL)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant voit ses conversations" ON conversations;
CREATE POLICY "participant voit ses conversations"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "participant voit sa participation" ON conversation_participants;
CREATE POLICY "participant voit sa participation"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "participant met a jour last_read_at" ON conversation_participants;
CREATE POLICY "participant met a jour last_read_at"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "participant lit messages conversation" ON messages;
CREATE POLICY "participant lit messages conversation"
ON messages FOR SELECT
USING (
  conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "participant envoie messages conversation" ON messages;
CREATE POLICY "participant envoie messages conversation"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IS NOT NULL AND sender_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);
