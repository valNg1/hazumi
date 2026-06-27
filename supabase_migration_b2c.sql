-- Migration B2C : Simplifier judokas pour modèle direct

-- Ajouter colonnes subscription
ALTER TABLE judokas
ADD COLUMN subscription_active BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN subscription_expires_at TIMESTAMPTZ;

-- Ajouter colonnes nom/prénom séparés (optionnel, sinon garder full_name)
ALTER TABLE judokas
ADD COLUMN first_name TEXT DEFAULT '',
ADD COLUMN last_name TEXT DEFAULT '';

-- Note: Les colonnes club_id, role, is_minor, guardian_confirmed,
-- email, cotisation_paid sont supprimées manuellement en Supabase dashboard
-- car elles ne sont plus nécessaires pour le modèle B2C.

-- Update RLS policies pour subscription_active
-- À faire dans Supabase dashboard ou via SQL :
-- - SELECT/INSERT/UPDATE : auth.uid() = user_id ET subscription_active = true

CREATE INDEX idx_judokas_subscription_active ON judokas(subscription_active);
CREATE INDEX idx_judokas_stripe_customer_id ON judokas(stripe_customer_id);
