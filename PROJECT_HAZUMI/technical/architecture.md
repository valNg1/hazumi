# Architecture

Établie par analyse du dépôt au 2026-07-19. Les informations non vérifiables sont marquées
**« À documenter »**.

## Vue d'ensemble

Application web monopage (SPA) React, hébergée sur Vercel, s'appuyant sur Supabase pour
l'authentification, la base de données et les règles d'accès. Il n'y a **pas de backend applicatif
propre** : le client dialogue directement avec Supabase, la sécurité reposant sur les politiques
RLS.

```
Navigateur (PWA)
      │
      ├─ React 19 + React Router  ── UI, routage, état local
      │
      └─ @supabase/supabase-js
             │
             ▼
        Supabase
        ├─ Auth        (sessions, réinitialisation de mot de passe)
        ├─ PostgreSQL  (26 tables référencées)
        └─ RLS         (isolation par judoka et par rôle)
```

## Frontend

| Élément | Valeur |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Routage | `react-router-dom` |
| Style | Tailwind CSS v4 (plugin `@tailwindcss/vite`) |
| Graphiques | `recharts` |
| PWA | `vite-plugin-pwa` — service worker généré au build |

### Organisation

```
src/
  components/   Composants réutilisables (UI, sans logique métier)
  pages/        Une page par route
  lib/          Clients externes et logique métier pure
  types/        Types partagés
```

Les fonctions de `lib/` sont pures et testées isolément — c'est là que réside la logique métier
vérifiable : `training.ts`, `agendaVisibility.ts`, `parcoursProgress.ts`, `lessonQuiz.ts`,
`lessonChapters.ts`, `markdown.tsx`, `youtube.ts`, `curriculum.ts`, `lessonPremium.ts`.

### Conventions

- Aucune instanciation Supabase en ligne : tout passe par `src/lib/supabase.ts`.
- Pas de `any` : `unknown` + garde de type.
- Pas de commentaire sauf lorsque le *pourquoi* n'est pas évident.

## Backend

Il n'existe pas de serveur applicatif dédié. Les responsabilités habituelles d'un backend sont
assurées par Supabase :

| Responsabilité | Mise en œuvre |
|---|---|
| Authentification | Supabase Auth |
| Autorisation | Politiques RLS PostgreSQL |
| Persistance | PostgreSQL managé |
| Migrations | Fichiers SQL versionnés dans `supabase/migrations/` (16 fichiers) |

### Modèle d'autorisation

Deux motifs récurrents dans les politiques RLS :

- **Propriétaire** — `judoka_id IN (SELECT id FROM judokas WHERE user_id = auth.uid())`
- **Administrateur** — `EXISTS (SELECT 1 FROM judokas WHERE user_id = auth.uid() AND role = 'admin')`

Un script de vérification existe : `npm run test:rls` (`scripts/test-rls-isolation.ts`).

## Base de données

26 tables référencées depuis le code, regroupables ainsi :

| Domaine | Tables |
|---|---|
| Identité et club | `judokas`, `clubs` |
| Catalogue | `catalogue_hazumi`, `videos`, `video_views` |
| Parcours | `parcours`, `parcours_ressources`, `parcours_univers`, `user_parcours` |
| Leçons | `lesson`, `lesson_chapters`, `lesson_quiz`, `lesson_quiz_results`, `lesson_notes`, `lesson_progress` |
| Bibliothèque personnelle | `playlists`, `playlist_items`, `playlists_collections` |
| Entraînement et agenda | `planification_entrainements`, `evenements`, `competitions` |
| Progression technique | `technique_mastery` |
| Messagerie | `conversations`, `conversation_participants`, `messages` |
| Administration | `admin_notes` |

### Points de vigilance relevés

- `catalogue_hazumi.tags` est un `TEXT[]` ; `videos.tags` est une chaîne séparée par des virgules.
  Les deux ne se manipulent pas de la même façon.
- `parcours_ressources` porte une contrainte d'unicité `(parcours_id, ressource_id)` permettant la
  réutilisation N-N d'une ressource entre parcours.
- Le schéma complet (colonnes, contraintes, index de chaque table) n'est pas reconstitué ici :
  **À documenter**.

## Flux principaux

### Authentification

1. `/login` → Supabase Auth ;
2. session établie → lecture du `judoka` associé à `auth.uid()` ;
3. redirection selon le rôle vers l'espace judoka, club ou admin ;
4. si le profil est incomplet → `/eleve/onboarding`.

### Consultation d'une leçon

1. `/eleve/lecon/:ressourceId` ;
2. lecture de `lesson` filtrée sur `published = true` ;
3. chargement parallèle de la ressource, des chapitres et du quiz ;
4. restauration de l'état du judoka : notes, dernier score, progression ;
5. écriture de `lesson_progress` (création ou mise à jour de la date de reprise).

### Progression dans un parcours

1. lecture des ressources du parcours via `parcours_ressources` ;
2. calcul de l'avancement (`src/lib/parcoursProgress.ts`) ;
3. détermination de l'étape suivante ;
4. ouverture de la leçon si elle existe, sinon de la ressource.

### Planification d'entraînements

1. saisie d'une récurrence (jours, plage, exclusions) ;
2. génération des dates (`generateRecurrenceDates`, calcul mené en UTC) ;
3. insertion dans `planification_entrainements` ;
4. affichage calendaire sur des clés de date **locales** (`toStr`).

> La distinction entre calcul UTC et affichage local est intentionnelle : elle corrige un décalage
> d'un jour constaté en production.

## Sécurité

- La clé Supabase utilisée côté client est la clé **anonyme** ; la protection réelle repose sur
  les politiques RLS.
- Les pages légales (`/confidentialite`, `/mentions-legales`, `/cgu`, `/dpa`) sont présentes dans
  le dépôt.
- Aucun secret n'est stocké dans le dépôt ; les variables sont fournies par l'environnement.

## À documenter

- Schéma détaillé de chaque table (colonnes, types, contraintes, index).
- Inventaire exhaustif des politiques RLS par table.
- Périmètre fonctionnel exact de l'espace club.
- Rôle de la dépendance `@stripe/stripe-js` : aucun usage n'est trouvé dans `src/`.
- Stratégie de gestion des états hors ligne de la PWA.
