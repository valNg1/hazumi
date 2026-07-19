# État actuel du produit

Photographie factuelle de l'existant, établie par analyse du dépôt sur la branche
`chore/product-repository`.

**Date du relevé :** 2026-07-19 (mis à jour après livraison du WP 1.1)
**Commit analysé :** `0f8684f` (branche `chore/product-repository`, identique à `main` côté code
applicatif)

## Méthode et limites

Ce document ne consigne que ce qui est **vérifiable dans le dépôt** : code source, configuration,
migrations, tests. Il ne décrit pas le contenu réellement présent en base de données de
production, qui n'est pas observable depuis le dépôt.

| Statut | Signification |
|---|---|
| **Disponible** | Vérifié dans le dépôt et fonctionnel |
| **Partiel** | Présent mais incomplet ou limité |
| **Prévu** | Structure présente, fonction non active |
| **À confirmer** | Non vérifiable depuis le dépôt seul |

## 1. Navigation et structure

| Élément | Statut | Constat |
|---|---|---|
| Navigation judoka | Disponible | **4 entrées** définies dans `src/components/Layout.tsx` : Accueil, Parcours, Bibliothèque, Mon espace (WP 1.1) |
| Espace club | Partiel | Un espace `club` existe dans la constante `NAV` (Effectifs, …) — périmètre exact **à confirmer** |
| Espace admin | Disponible | Routes `/admin/dashboard`, `/admin/catalogue`, `/admin/messages`, `/admin/messagerie` |
| Navigation par usage | Disponible | Livrée par le WP 1.1 ; routes `/`, `/parcours`, `/bibliotheque`, `/mon-espace` |
| Page Bibliothèque | Disponible | Point d'entrée unique : rayons par famille, recherche tolérante aux accents, sélection multiple, création de playlist (WP 1.2) |
| Page Mon espace | Partiel | Hub de liens + **navigation interne** sur les 5 rubriques (WP 1.2) |
| Univers dans le routage | Disponible | `/eleve/kyu`, `/eleve/shiai`, `/eleve/judoka-culture` restent fonctionnelles, hors navigation |
| Route `/eleve/parcours` | Disponible | Redirige désormais vers `/parcours` |

## 2. Parcours

| Élément | Statut | Constat |
|---|---|---|
| Moteur de parcours générique | Disponible | Tables `parcours`, `parcours_ressources`, `parcours_univers`, `user_parcours` |
| Réutilisation N-N des ressources | Disponible | `parcours_ressources` permet à une ressource d'appartenir à plusieurs parcours |
| Parcours accessibles par URL | Disponible | Paramètre `?p=<id>` géré dans `src/pages/eleve/Parcours.tsx` |
| Suivi de progression | Disponible | `src/lib/parcoursProgress.ts` + table `user_parcours` |
| Rattachement aux univers | Disponible | Table `parcours_univers` (kyu / shiai / judoka) |
| Parcours personnels créés par le judoka | Prévu | Backlog Sprint 3 — non implémenté |
| Parcours sans filtre d'univers | Disponible | `/parcours` expose l'ensemble des parcours |
| Nombre et contenu des parcours publiés | À confirmer | Donnée de production, non observable dans le dépôt |

## 3. Leçons et lecteur

| Élément | Statut | Constat |
|---|---|---|
| Moteur de leçon | Disponible | Table `lesson`, page `src/pages/eleve/Lecon.tsx` |
| Vidéo YouTube chapitrée | Disponible | Table `lesson_chapters`, `src/lib/youtube.ts`, `src/lib/lessonChapters.ts` |
| Navigation par chapitre (seek) | Disponible | Rechargement de l'iframe avec `?start=<s>` |
| Fiche Markdown | Disponible | Rendu maison dans `src/lib/markdown.tsx`, sans dépendance externe |
| Leçon premium structurée | Partiel | `src/lib/lessonPremium.ts` — une seule leçon couverte (Nage-no-kata), indexée par `ressource_id` |
| Publication d'une leçon | Disponible | Champ `lesson.published` |
| Nombre de leçons publiées en production | À confirmer | Donnée de production |

## 4. Quiz

| Élément | Statut | Constat |
|---|---|---|
| Moteur de quiz | Disponible | Tables `lesson_quiz`, `lesson_quiz_results` ; logique dans `src/lib/lessonQuiz.ts` |
| Types de questions | Disponible | `choix_unique`, `choix_multiple`, `vrai_faux` |
| Correction | Disponible | Égalité d'ensembles entre réponses données et attendues |
| Historique du score | Disponible | Dernier score restitué sans pré-révéler les réponses |
| Niveaux de quiz | Partiel | Regroupement par tranches de 5 questions, sans colonne dédiée en base |

## 5. Notes personnelles

| Élément | Statut | Constat |
|---|---|---|
| Notes par leçon | Disponible | Table `lesson_notes`, sauvegarde automatique différée (~800 ms) |
| Confidentialité | Disponible | Une note appartient à son judoka (RLS) |

## 6. Bibliothèque et catalogue

| Élément | Statut | Constat |
|---|---|---|
| Catalogue de ressources | Disponible | Table `catalogue_hazumi` (`tags` de type `TEXT[]`). **3 ressources** sur décision du Product Owner : Uchi Mata (Aaron Wolf), O Ouchi Gari (Aaron Wolf), Nage-no-kata. Les 45 autres ont été **supprimées** le 2026-07-19 (sauvegarde JSON conservée hors dépôt) |
| Vidéos | Disponible | Tables `videos`, `video_views` (`videos.tags` = chaîne séparée par virgules) |
| Playlists personnelles | Disponible | Créées depuis la Bibliothèque avec choix d'univers ; visibles dans Parcours (WP 1.2). Une playlist est un **filtre par tags** |
| Administration du catalogue | Disponible | Page `/admin/catalogue` |
| Recherche, filtres, sélection multiple | Prévu | Backlog Sprint 3 — périmètre exact **à confirmer** |
| Articulation playlists ↔ parcours personnels | À confirmer | Deux mécanismes coexistent ; la cible unifiée est décrite dans [domains/bibliotheque.md](domains/bibliotheque.md) |

## 7. Authentification et rôles

| Élément | Statut | Constat |
|---|---|---|
| Authentification | Disponible | Supabase Auth ; routes `/login`, `/reset-password` |
| Onboarding judoka | Disponible | `/eleve/onboarding` |
| Rôles | Disponible | Champ `role` sur `judokas` ; espaces judoka, club et admin distincts |
| Isolation des données (RLS) | Disponible | Politiques RLS ; script de vérification `npm run test:rls` |
| Affiliation à un club | Disponible | Table `clubs` ; le judoka s'inscrit puis s'affilie |

## 8. Mon espace

| Élément | Statut | Constat |
|---|---|---|
| Entraînements | Disponible | `src/pages/eleve/Entrainements.tsx`, table `planification_entrainements` |
| Récurrence de séances | Disponible | `src/lib/training.ts` — jours fériés métropole / DOM-TOM inclus |
| Annulation et masquage | Disponible | `src/lib/agendaVisibility.ts` — les annulées sortent de la vue et des compteurs |
| Agenda | Disponible | `src/pages/eleve/MonAgenda.tsx`, tables `evenements`, `competitions` |
| Messagerie | Disponible | Tables `conversations`, `conversation_participants`, `messages` |
| Ma progression | Disponible | **Tableau de bord des parcours uniquement** : parcours et playlists commencés, progression, reprise directe. Le suivi par grade a été retiré (retour de recette WP 1.2) |
| Sensei Hazumi | À confirmer | Aucun module identifié sous ce nom dans `src/` |

## 9. Intégrations Supabase

| Élément | Statut | Constat |
|---|---|---|
| Client unique | Disponible | `src/lib/supabase.ts` — aucune instanciation en ligne |
| Migrations versionnées | Disponible | 16 fichiers dans `supabase/migrations/` |
| Tables référencées depuis le code | Disponible | 26 tables : `admin_notes`, `catalogue_hazumi`, `clubs`, `competitions`, `conversation_participants`, `conversations`, `evenements`, `judokas`, `lesson`, `lesson_chapters`, `lesson_notes`, `lesson_progress`, `lesson_quiz`, `lesson_quiz_results`, `messages`, `parcours`, `parcours_ressources`, `parcours_univers`, `planification_entrainements`, `playlist_items`, `playlists`, `playlists_collections`, `technique_mastery`, `user_parcours`, `video_views`, `videos` |

## 10. Tests

| Élément | Statut | Constat |
|---|---|---|
| Tests unitaires et composants | Disponible | Vitest + React Testing Library (jsdom) — **27 fichiers, 187 tests, tous verts** au relevé |
| Tests end-to-end | Partiel | Playwright configuré ; un seul scénario présent (`e2e/onboarding.spec.ts`) |
| Test d'isolation RLS | Disponible | `scripts/test-rls-isolation.ts` via `npm run test:rls` |
| Intégration continue | Prévu | Aucun workflow GitHub Actions dans le dépôt ; tests exécutés manuellement |

## 11. Déploiement

| Élément | Statut | Constat |
|---|---|---|
| Hébergement | Disponible | Vercel, projet `hazumi1/hazumi` |
| Domaine de production | Disponible | `hazumi.org` |
| Routage SPA | Disponible | `vercel.json` — réécriture de toutes les routes vers `index.html` |
| PWA | Disponible | `vite-plugin-pwa`, service worker généré au build |
| Pipeline automatisé | Prévu | Déploiement déclenché manuellement en ligne de commande |

## 12. Limitations et dette connues

Constats issus du dépôt, sans jugement de priorité.

| Sujet | Constat |
|---|---|
| Taille du bundle | Avertissement au build : certains chunks dépassent 500 ko après minification |
| Couverture E2E | Un seul scénario Playwright ; les parcours critiques ne sont pas couverts de bout en bout |
| Contenu premium | Le mécanisme premium est indexé sur un identifiant de ressource en dur — extensible mais non généralisé |
| Deux modèles de regroupement | `playlists` et `parcours` coexistent ; la cible produit ne retient que le parcours |
| Anomalie `/espace` | `switchSpace()` (`src/components/Layout.tsx`) navigue vers `/espace`, route non déclarée : le sélecteur d'espace renvoie silencieusement à l'accueil. **Statut : À traiter** — hors périmètre du WP 1.1 |
| Stripe | `@stripe/stripe-js` est une dépendance et `VITE_STRIPE_PUBLISHABLE_KEY` figure dans `.env.example`, mais **aucun usage n'est trouvé dans `src/`** — statut **à confirmer** |
| Formats de tags hétérogènes | `catalogue_hazumi.tags` est un tableau, `videos.tags` une chaîne à virgules |
| Absence de CI | Rien ne garantit automatiquement que les tests sont verts avant un déploiement |

## Éléments à confirmer

Récapitulatif des points non tranchables depuis le dépôt seul :

- périmètre exact de l'espace club ;
- nombre et contenu des parcours et leçons publiés en production ;
- articulation cible entre playlists et parcours personnels ;
- périmètre de la recherche et des filtres de la Bibliothèque ;
- existence et nature d'un module « Sensei Hazumi » ;
- usage réel de Stripe dans le produit.
