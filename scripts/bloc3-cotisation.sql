-- Bloc 3 : Cotisation judoka + Stripe

ALTER TABLE judokas ADD COLUMN IF NOT EXISTS cotisation_paid boolean DEFAULT false;
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS cotisation_paid_at timestamptz;
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS cotisation_session_id text;

-- Vue utile côté club pour voir les cotisations
CREATE OR REPLACE VIEW v_cotisations AS
SELECT
  j.id,
  j.full_name,
  j.belt,
  j.club_id,
  j.cotisation_paid,
  j.cotisation_paid_at,
  j.license_number
FROM judokas j;
