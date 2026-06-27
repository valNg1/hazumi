-- Migration complète B2C + Admin

-- 1. Ajouter les colonnes de subscription B2C
ALTER TABLE judokas
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'judoka'; -- 'judoka' ou 'admin'

-- 2. Créer les indexes
CREATE INDEX IF NOT EXISTS idx_judokas_subscription_active ON judokas(subscription_active);
CREATE INDEX IF NOT EXISTS idx_judokas_stripe_customer_id ON judokas(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_judokas_role ON judokas(role);

-- 3. Créer une table audit pour les transactions d'abonnement
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'activated', 'renewed', 'cancelled', 'expired'
  amount_cents INTEGER,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES judokas(id) -- admin qui a créé la transaction
);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_judoka_id ON subscription_transactions(judoka_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_created_at ON subscription_transactions(created_at);
