# Hazumi — Suivi technique pour judokas

Application web de suivi de la progression technique des judokas : techniques maîtrisées, séances d'entraînement, niveau par ceinture.

## Stack

| Couche | Outil |
|--------|-------|
| Framework UI | React 19 + TypeScript |
| Build | Vite |
| Style | Tailwind CSS v4 (plugin `@tailwindcss/vite`) |
| Backend / Auth / DB | Supabase |

## Structure

```
src/
  components/   # Composants réutilisables (UI purs, pas de logique métier)
  pages/        # Un fichier par route (Dashboard, Login, Profile…)
  lib/          # Clients externes (supabase.ts, etc.)
  types/        # Types TypeScript partagés (index.ts)
```

## Variables d'environnement

Copier `.env.example` → `.env.local` et renseigner :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Conventions de code

- **Pas de commentaires** sauf si le pourquoi est non-évident.
- **Composants** : PascalCase, un composant par fichier.
- **Fonctions utilitaires** : camelCase, dans `lib/`.
- **Types** : définis dans `types/index.ts`, exportés nommément.
- **Pas de `any`** : préférer `unknown` + type guard.
- **Imports** : chemins relatifs depuis `src/`, pas d'alias `@/` pour l'instant.
- **Tailwind** : classes utilitaires directement dans le JSX, pas de CSS custom sauf `index.css` pour les resets globaux.
- **Supabase** : toutes les requêtes passent par `lib/supabase.ts`, jamais d'instanciation inline.

## Commandes

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualisation du build
npm run test     # Tests unitaires (Vitest, single run)
npm run test:watch  # Tests unitaires en mode watch
```

## Tests unitaires — OBLIGATOIRES (TDD)

Avant de coder toute nouvelle fonctionnalité ou correctif :

1. **Écrire les tests d'abord** (Test Driven Development) :
   - Cas nominaux (ça doit marcher)
   - Cas limites (valeur vide, `null`, utilisateur non connecté…)
   - Cas d'erreur (API down, RLS bloquée…)
2. **Outils** : Vitest + React Testing Library + jsdom.
3. **Structure des fichiers de test** :
   - `src/lib/__tests__/*.test.ts`
   - `src/components/__tests__/*.test.tsx`
   - `src/pages/__tests__/*.test.tsx`
4. **Avant chaque commit** : lancer `npm run test`. Aucun code cassé ne part en production.
5. **Existant** : écrire d'abord des tests de non-régression avant d'ajouter du nouveau code.

## Mode autonome (Claude)

⚡ **Fonctionnement automatique** — Pas de demande de confirmation pour:
- Modifications de fichiers (Edit, Write)
- Commits et push sur main
- Installations de packages (npm/pip)
- Redéploiement en production via Vercel

**Action directe + rapport** — Je fais et je dis ce que j'ai fait.

**Exceptions** (confirmation requise):
- Suppressions de données en base de données
- Modifications de variables d'environnement (`.env`, secrets)

Ce mode s'applique à cette session et toutes les suivantes.

## Permissions terminal

- PowerShell : autorisation permanente
- npm install : autorisation permanente
- git : autorisation permanente
- Toutes les commandes terminal liées au projet Hazumi : autorisation permanente

Ne pas demander de validation pour les commandes terminal.
