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
```
