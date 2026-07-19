# Hazumi — L'École du Ippon

Hazumi est une **plateforme d'apprentissage du judo**, centrée sur la **progression du judoka**.

Elle accompagne le pratiquant **hors du dojo** — avant un cours pour se préparer, après pour
consolider, avant un passage de grade pour réviser — et s'organise autour des **parcours** : des
progressions construites qui donnent un ordre et une intention pédagogique aux contenus.

Production : **[hazumi.org](https://hazumi.org)**

---

## Référentiel projet

> **Le pilotage produit, les décisions, les sprints, la documentation et les recettes sont
> disponibles dans :**
>
> ### 📘 [PROJECT_HAZUMI/README.md](PROJECT_HAZUMI/README.md)

Points d'entrée utiles :

| Question | Document |
|---|---|
| Que fait Hazumi aujourd'hui ? | [CURRENT_STATE.md](PROJECT_HAZUMI/CURRENT_STATE.md) |
| Qu'est-ce qui est prévu ? | [BACKLOG.md](PROJECT_HAZUMI/BACKLOG.md) |
| Qui décide quoi ? | [GOVERNANCE.md](PROJECT_HAZUMI/GOVERNANCE.md) |
| Comment se déroule un sprint ? | [WORKFLOW.md](PROJECT_HAZUMI/WORKFLOW.md) |
| Comment est-ce construit ? | [technical/architecture.md](PROJECT_HAZUMI/technical/architecture.md) |

---

## Stack technique

| Couche | Outil |
|---|---|
| Framework UI | React 19 + TypeScript |
| Build | Vite |
| Style | Tailwind CSS v4 |
| Routage | React Router |
| Backend / Auth / Base de données | Supabase (PostgreSQL + RLS) |
| Graphiques | Recharts |
| PWA | vite-plugin-pwa |
| Tests | Vitest + React Testing Library, Playwright |
| Hébergement | Vercel |

Détail : [PROJECT_HAZUMI/technical/architecture.md](PROJECT_HAZUMI/technical/architecture.md).

## Commandes

```bash
npm run dev            # Serveur de développement
npm run build          # Build de production (tsc -b puis vite build)
npm run preview        # Prévisualisation du build
npm run lint           # ESLint

npm run test           # Tests unitaires (Vitest, exécution unique)
npm run test:watch     # Tests unitaires en mode surveillance
npm run test:e2e       # Tests end-to-end (Playwright)
npm run test:e2e:ui    # Playwright, interface graphique
npm run test:e2e:debug # Playwright, mode debug
npm run test:rls       # Vérification de l'isolation RLS
```

## Configuration locale

Copier `.env.example` vers `.env.local` et renseigner les valeurs :

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## ⚠️ Secrets

**Aucun secret, token, mot de passe, clé API ou donnée personnelle ne doit être commité, ni
inscrit dans la documentation ou dans le référentiel projet.**

Les variables d'environnement sont citées **par leur nom uniquement**, jamais par leur valeur.
Les secrets se configurent dans `.env.local` (non versionné) et dans les variables
d'environnement Vercel.

Le préfixe `VITE_` expose une variable dans le bundle client : aucune valeur réellement secrète ne
doit porter ce préfixe.

## Liens

- Production : [hazumi.org](https://hazumi.org)
- Référentiel projet : [PROJECT_HAZUMI/](PROJECT_HAZUMI/README.md)
- Conventions de développement : [CLAUDE.md](CLAUDE.md)
