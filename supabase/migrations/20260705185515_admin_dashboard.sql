-- US: Dashboard admin restructure - blocs Judokas/Catalogues/Messagerie/To Do

-- "Connectes recemment" ne peut pas etre calcule cote client via
-- auth.users.last_sign_in_at (necessite la service role key, indisponible
-- dans le bundle browser). On approx via une colonne last_active_at
-- mise a jour par le client authentifie (touch a chaque session judoka).
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES judokas(id) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (admin_id)
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin gere ses notes" ON admin_notes;
CREATE POLICY "admin gere ses notes"
ON admin_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM judokas
    WHERE judokas.id = admin_notes.admin_id
    AND judokas.user_id = auth.uid()
    AND judokas.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM judokas
    WHERE judokas.id = admin_notes.admin_id
    AND judokas.user_id = auth.uid()
    AND judokas.role = 'admin'
  )
);
