-- Bloc 3b : Abonnements Stripe (judoka 1€/mois, club 10€/mois)

-- Judokas : colonnes Stripe
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE judokas ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Clubs : plan + colonnes Stripe
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS plan text DEFAULT 'basic';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
