# Environnements

> ⚠️ **Aucune valeur de variable ne doit figurer dans ce document.** Les variables sont citées par
> leur nom uniquement. Voir la règle E de [GOVERNANCE.md](../GOVERNANCE.md).

## Environnements identifiés

| Environnement | Statut | Constat |
|---|---|---|
| **Local** | Vérifié | `npm run dev` — serveur Vite, port 5173 par défaut |
| **Test / recette** | À documenter | Aucun environnement de recette dédié n'est identifiable dans le dépôt |
| **Production** | Vérifié | Vercel, projet `hazumi1/hazumi`, domaine `hazumi.org` |

### Sur l'absence d'environnement de recette

Le dépôt ne contient aucune configuration d'environnement intermédiaire. Vercel génère des
déploiements de prévisualisation par déploiement, mais rien n'atteste d'un environnement de
recette stable et distinct de la production.

Le [workflow](../WORKFLOW.md) prévoit une recette avant mise en production : **la cible de cette
recette est à documenter**.

## Variables d'environnement

### Attendues côté application

Configuration locale : copier `.env.example` vers `.env.local` et renseigner les valeurs.

| Variable | Usage | Vérifié dans `src/` |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Oui |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | **Non — présente dans `.env.example`, aucun usage trouvé dans `src/`** |

> Le préfixe `VITE_` rend une variable accessible dans le bundle client : **aucune valeur secrète
> ne doit porter ce préfixe**. La clé anonyme Supabase est publique par conception ; la protection
> repose sur les politiques RLS.

### Utilisées par les scripts d'administration

Les scripts de `scripts/` lisent `.env.local`. Certains requièrent une clé de service disposant de
privilèges élevés (`SUPABASE_SERVICE_ROLE_KEY`).

> Cette clé contourne les politiques RLS. Elle ne doit jamais être exposée côté client, ni
> committée, ni reportée dans le référentiel.

### Côté Vercel

Les variables de production sont configurées dans le projet Vercel. Leur inventaire exact n'est
pas observable depuis le dépôt : **À documenter**.

## Outils requis en local

| Outil | Usage |
|---|---|
| Node.js | Exécution — version imposée **à documenter** (aucun `.nvmrc` ni champ `engines`) |
| npm | Dépendances et scripts |
| Supabase CLI | Application des migrations (`npx supabase db push`) |
| Vercel CLI | Déploiement |
| Playwright | Tests end-to-end |

## À documenter

- Existence et adresse d'un environnement de recette dédié.
- Inventaire des variables configurées dans Vercel.
- Version de Node.js requise.
- Procédure de mise à disposition d'un jeu de données de test.
