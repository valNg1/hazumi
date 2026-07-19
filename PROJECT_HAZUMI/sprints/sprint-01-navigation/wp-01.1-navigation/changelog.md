# Changelog — WP 1.1 · Architecture de navigation

- **Sprint :** Sprint 1 — Nouvelle navigation
- **Date :** 2026-07-19
- **Statut :** Livré — en attente de recette du Product Owner

> Ce document décrit **ce qui a réellement été livré**.

## Ajouté

- **Navigation par usage** — la navigation principale judoka expose désormais quatre entrées :
  Accueil, Parcours, Bibliothèque, Mon espace.
- **Route `/parcours`** — rend le composant `Parcours` existant **sans filtre d'univers** : tous
  les parcours y sont exposés, quelle que soit leur dimension pédagogique.
- **Route `/bibliotheque`** — nouvelle page transitoire `src/pages/eleve/Bibliotheque.tsx`.
- **Route `/mon-espace`** — nouvelle page transitoire `src/pages/eleve/MonEspace.tsx`.
- **`src/lib/navigation.ts`** — type `NavItem` et fonction `isNavActive`, logique pure d'état
  actif de la navigation.
- **Redirections** `/eleve/bibliotheque` → `/bibliotheque` et `/eleve/mon-espace` → `/mon-espace`.
- **18 tests** : composition de la navigation, état actif, rendu des deux pages transitoires.
- **[ADR-002](../../../decisions/ADR-002-development-workflow.md)** — workflow séquentiel en 13
  étapes avec Impact Report.

## Modifié

- **`src/components/Layout.tsx`** — `NAV.eleve` réduite de 8 à 4 entrées. Les entrées portent une
  propriété `match` optionnelle listant les routes sur lesquelles elles restent actives. L'état
  actif est calculé par `isNavActive` plutôt que par le `isActive` de `NavLink`, afin qu'Accueil
  reste allumé après la redirection de `/` vers `/eleve/accueil`.
- **`src/App.tsx`** — déclaration des trois nouvelles routes. `/eleve/parcours` redirige désormais
  vers `/parcours` au lieu de `/eleve/accueil`.
- **`src/components/__tests__/Layout.nav.test.ts`** — les deux assertions codaient en dur
  l'ancienne décision produit (« ne contient plus Parcours », « expose les trois univers ») et
  contredisaient ACC-01 et ACC-02. Réécrites.
- **`PROJECT_HAZUMI/GOVERNANCE.md`** — matrice des rôles enrichie de l'étape Impact Report et du
  GO ; règle F ajoutée.
- **`PROJECT_HAZUMI/WORKFLOW.md`** — cycle porté à 13 étapes, points de contrôle mis à jour.
- **`PROJECT_HAZUMI/domains/navigation.md`**, **`CURRENT_STATE.md`**, **`BACKLOG.md`** — mis à
  jour conformément au livré.

### Conséquence d'implémentation à confirmer en recette

Le **badge de messages non lus** était rattaché à l'entrée « Messages », qui n'existe plus dans la
navigation. Il a été rattaché à **Mon espace**, seule entrée menant aux messages. Le supprimer
aurait constitué une régression fonctionnelle ; le déplacer relève d'un choix d'implémentation
minimal. **À confirmer par le Product Owner en recette.**

## Corrigé

Rien. Ce WP n'est pas correctif.

## Reporté

- Recherche, filtres, tags et sélection multiple dans la Bibliothèque — Sprint 3.
- Regroupement réel des fonctions dans Mon espace — décision D2, page transitoire seulement.
- Modèle d'Impact Report dans `templates/` — non demandé par le prompt.

## Dette connue

| Sujet | Constat |
|---|---|
| **Anomalie `/espace`** | `switchSpace()` navigue vers une route non déclarée. **Non corrigée sur décision du Product Owner** ; inscrite au backlog sous HZ-900 avec le statut « À traiter » |
| Bibliothèque transitoire | Page volontairement minimale (HZ-901) |
| Mon espace transitoire | Page volontairement minimale (HZ-902) |
| Vérification navigateur connectée | Non réalisée en local par le Lead Full Stack : l'accès nécessite une authentification, et la saisie d'identifiants lui est interdite. Les contrôles visuels connectés relèvent de la recette |
| Service worker PWA | Un judoka ayant installé la PWA peut voir l'ancienne navigation jusqu'au rafraîchissement du cache. Comportement non documenté dans le dépôt |

## Vérifications

| Contrôle | Résultat |
|---|---|
| Tests unitaires | **205 tests verts / 29 fichiers** (187 avant le WP) |
| Build | **Vert** — `tsc -b` puis `vite build` |
| Lint | 1 erreur sur `Layout.tsx` (`react-refresh/only-export-components`) — **préexistante**, liée à l'export de `NAV`. Aucune erreur ajoutée |
| Non-régression | Aucune régression connue. Seule adaptation : le test codant en dur l'ancienne décision produit |
| Console navigateur | Aucune erreur de navigation ou de routage. Seule erreur présente : enregistrement du service worker en mode développement, **préexistante et sans lien avec ce WP** |

## Livraison

| Élément | Valeur |
|---|---|
| Branche | `feature/wp-01-1-navigation` |
| Commit Impact Report | `a1a8f49` |
| Commit de développement | `6829f5fb7afe7417c3788dda37cc5f6590f0aa57` |
| Commit de merge | `bee857e594a185bbc44409e1548f870ea6358b38` |
| Date de déploiement | 2026-07-19 |
| Déploiement Vercel | https://hazumi-ic3bcia0m-hazumi1.vercel.app |
| URL de production | https://hazumi.org |
