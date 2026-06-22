# Déploiement Bloc 3 — Edge Functions Stripe

## 1. SQL à appliquer dans Supabase SQL Editor

Copier-coller le contenu de `scripts/bloc3-cotisation.sql`.

## 2. Secrets à configurer dans Supabase

Dashboard → Settings → Edge Functions → Secrets :

| Nom | Valeur |
|-----|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (depuis Stripe Dashboard) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (depuis Stripe → Webhooks) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role depuis Settings → API |

## 3. Déployer les Edge Functions

Installer Supabase CLI : https://supabase.com/docs/guides/cli

```bash
supabase login
supabase link --project-ref <votre-project-ref>

supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## 4. Configurer le Webhook Stripe

Dans Stripe Dashboard → Developers → Webhooks → Add endpoint :

- URL : `https://<votre-project>.supabase.co/functions/v1/stripe-webhook`
- Événements à écouter : `checkout.session.completed`
- Copier le Signing secret → mettre dans `STRIPE_WEBHOOK_SECRET`

## 5. Tester en local (optionnel)

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## 6. Prix de la cotisation

Le montant est codé à `12000` (centimes = 120 €) dans `create-checkout-session/index.ts`.
Modifier `amount` dans l'appel frontend (`Profil.tsx`) ou la valeur par défaut dans la Edge Function.
