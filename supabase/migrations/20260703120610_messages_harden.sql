ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_content_check;

ALTER TABLE messages
ADD CONSTRAINT messages_content_check
CHECK (length(trim(content)) > 0);

DROP POLICY IF EXISTS "marquer comme lu" ON messages;
CREATE POLICY "marquer comme lu"
ON messages FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')
  OR judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())
)
WITH CHECK (true);
