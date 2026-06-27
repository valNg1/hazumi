# Setup Migration B2C + Admin Dashboard

## État actuel

L'app a été complètement restructurée pour passer d'un modèle **club centralisé** à un modèle **B2C direct** avec **gestion admin**. Voici ce qui a été fait :

### ✅ Complété côté code
1. Modèle B2C mis en place
   - Suppression du blocage SubscriptionGate (contenu accessible à tous)
   - Colonnes de B2C préparées (subscription_active, stripe_customer_id, etc.)
   
2. Dashboard Admin créé
   - Route `/admin/dashboard` pour gérer les judokas
   - Route `/admin/setup` pour initialiser le premier admin
   - Gestion des abonnements (créer, révoquer, générer lien Stripe)
   - Table d'audit `subscription_transactions` pour tracer les opérations

3. Fonctions Stripe mises à jour
   - `create-checkout-session` supporte les liens d'admin pour d'autres judokas

### ⚠️ À FAIRE : Exécuter la migration Supabase

**IMPORTANT** : La base de données Supabase n'a pas les colonnes nécessaires. Vous DEVEZ exécuter cette migration.

### Option 1 : Via Supabase SQL Editor (Recommended)

1. Allez sur [console.supabase.com](https://console.supabase.com)
2. Sélectionnez votre projet Hazumi
3. Aller dans **SQL Editor** → **New Query**
4. Copier-coller le contenu du fichier `supabase_migration_complete.sql`
5. Cliquer **Run**

### Option 2 : Via CLI Supabase

```bash
cd hazumi
supabase db push
```

(Nécessite d'avoir les migrations dans `supabase/migrations/`)

### Option 3 : SQL manuel (si migration auto échoue)

```sql
-- Ajouter les colonnes de subscription B2C
ALTER TABLE judokas
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'judoka';

-- Créer les indexes
CREATE INDEX IF NOT EXISTS idx_judokas_subscription_active ON judokas(subscription_active);
CREATE INDEX IF NOT EXISTS idx_judokas_stripe_customer_id ON judokas(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_judokas_role ON judokas(role);

-- Créer la table d'audit
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judoka_id UUID NOT NULL REFERENCES judokas(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  amount_cents INTEGER,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES judokas(id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_judoka_id ON subscription_transactions(judoka_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_created_at ON subscription_transactions(created_at);
```

---

## Après la migration : Initialiser l'admin

1. **Connectez-vous** avec votre compte judoka (celui du directeur technique)
2. Allez à `https://hazumi.app/admin/setup` (ou `http://localhost:5173/admin/setup` en dev)
3. Entrez le code secret : `hazumi-admin-2025`
4. Cliquez "Devenir admin"
5. Vous serez redirigé vers `/admin/dashboard`

---

## Dashboard Admin : Fonctionnalités

### Liste des judokas
- Voir tous les élèves (role='judoka')
- Voir le statut d'abonnement de chacun
- Voir les dates d'expiration

### Gérer les abonnements
1. Sélectionnez un judoka
2. Entrez une date d'expiration
3. Choisissez l'action :
   - **Activer abonnement** : Met subscription_active=true directement (usage interne)
   - **Copier lien Stripe** : Génère un lien de paiement à copier/envoyer à l'élève
   - **Révoquer abonnement** : Désactive l'accès

---

## Variables d'environnement

Assurez-vous que `.env.local` contient :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PRICE_JUDOKA=price_... # ID du produit Stripe 1€/mois
```

Sans `VITE_STRIPE_PRICE_JUDOKA`, le lien Stripe ne fonctionnera pas.

---

## Flux complet (quand tout est setup)

### Pour un élève : Accès direct
1. Élève se crée un compte
2. Accès immédiat à tout le contenu
3. Dossier de progression, entraînements, etc. = libre

### Quand vous décidez de facturer cet élève :
1. Allez au dashboard admin (`/admin/dashboard`)
2. Sélectionnez l'élève
3. Entrez une date d'expiration (ex: fin du mois)
4. Cliquez "Copier lien Stripe"
5. Envoyez le lien à l'élève par email/message
6. L'élève paie via Stripe
7. Son abonnement devient actif jusqu'à la date d'expiration

### Gestion continue
- Renouveler manuellement ou via webhook Stripe
- Révoquer l'accès si non-paiement
- Tracker les transactions dans `subscription_transactions`

---

## Notes importantes

1. **Pas de blocage de contenu** : L'app est complètement ouverte. Seul le statut `subscription_active` est tracé, c'est à vous de l'utiliser pour vos règles métier.

2. **Modèle "recrutement"** : Vous invitez des élèves, ils jouent gratuitement, puis vous leur proposez un plan en fonction de leurs interactions.

3. **Code secret d'admin** : `hazumi-admin-2025`
   - À CHANGER en production dans `src/pages/admin/Setup.tsx`
   - Utilisé une seule fois pour créer le premier admin

4. **Migration SQL** : À faire immédiatement après ce message.

---

## Support & Troubleshooting

### "Erreur : Accès refusé. Vous devez être admin."
→ La colonne `role` n'existe pas. Exécutez la migration.

### "Erreur Stripe : price not found"
→ `VITE_STRIPE_PRICE_JUDOKA` n'est pas configuré ou incorrect. Vérifiez `.env.local`.

### "Judoka introuvable"
→ Assurez-vous que la table judokas a bien les colonnes (voir migration).

