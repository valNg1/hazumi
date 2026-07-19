# Changelog — WP 1.2 · Navigation & Expérience utilisateur

- **Date :** 2026-07-19
- **Statut :** Livré — en attente de recette du Product Owner

## Ajouté

### Bibliothèque — point d'entrée unique

- Chargement de **tout** `catalogue_hazumi`, sans filtre d'univers préalable.
- **Rayons horizontaux** façon plateforme de streaming, groupés par famille technique ; les
  ressources sans famille sont regroupées par univers. Aucune ressource ne peut disparaître.
- **Recherche** sur titre, famille, grade et tags, **tolérante aux accents**.
- **Mode sélection** : composition d'une playlist au fil de la navigation dans les rails.
- **Modale de création** : nom + choix de l'univers (Kyu / Shiai / Judo-Kâ). C'est le **seul**
  moment où l'univers intervient.
- Confirmation renvoyant vers Parcours après création.

### Parcours — deux familles

- Section **Parcours Hazumi**, badge rouge plein « Officiel ».
- Section **Mes Playlists**, bordure pointillée et badge contour « Perso », avec l'univers rappelé
  sur chaque carte.
- État vide invitant à créer une playlist depuis la Bibliothèque.

### Mon espace — navigation interne

- `MonEspaceNav` : barre de rubriques présente sur **les cinq pages** (entraînements, agenda,
  messages, profil, progression). Plus de retour arrière nécessaire.
- Rubrique courante signalée ; barre défilante sur mobile.

### Ma progression — tableau de bord

- Section **« Reprendre où tu en étais »** en tête de page : parcours Hazumi et playlists
  commencés, triés par activité la plus récente.
- Pourcentage, barre de progression, compteur `done / total`, bouton **Reprendre** menant
  directement au parcours ou à la playlist.
- Section **Terminés** distincte.
- État vide invitant à découvrir les parcours.

### Modules purs (testés)

`src/lib/bibliotheque.ts` (`buildRails`, `searchResources`, univers) ·
`src/lib/progressionDashboard.ts` (`buildDashboard`, `playlistProgress`) ·
`src/lib/monEspaceSections.ts`

## Modifié

- `src/pages/eleve/Bibliotheque.tsx` — page transitoire du WP 1.1 **remplacée**.
- `src/pages/eleve/Parcours.tsx` — chargement des playlists et rendu des deux familles.
- `src/pages/eleve/Progression.tsx` — tableau de bord ajouté en tête ; le curriculum par ceinture
  est **conservé en dessous**.
- Cinq pages de Mon espace — injection de `MonEspaceNav`.
- `src/pages/eleve/__tests__/NouvellesPages.test.tsx` — les trois tests décrivaient la
  Bibliothèque transitoire du WP 1.1, désormais remplacée. Réécrits.

## Corrigé — retours de recette du Product Owner

| # | Retour | Correctif |
|---|---|---|
| 2 | La vignette d'une playlist pointait vers la Bibliothèque générale, pas vers son contenu | `/bibliotheque?playlist=<id>` ouvre désormais une **vue playlist** : seules ses ressources sont listées, avec son nom, son univers et un retour « Toute la bibliothèque » |
| 3 | Navigation interne de Mon espace « rien vu » | Elle était bien déployée sur les cinq rubriques, mais **absente de la page d'accueil `/mon-espace`** — celle qu'on ouvre depuis le menu. Ajoutée |
| 5 | **Régression Bibliothèque** : rayons horizontaux façon streaming, sans possibilité d'ajouter une ressource | Page **refaite** avec l'UI d'origine : liste en lignes, vignette, titre, mots-clés, et bouton **« + Ajouter une ressource »** |
| 6 | Regroupement par famille technique non voulu | **Supprimé.** Seule distinction conservée : **Hazumi** (administration) ou **Perso** (judoka), matérialisée par un badge sur chaque ligne et un filtre Tout / Hazumi / Mes contenus |

### Deuxième série de retours

| # | Retour | Correctif |
|---|---|---|
| 6 | Les 35 ressources du référentiel 1er Dan ne sont pas exploitables en l'état | **Masquées, non supprimées.** Colonne `visible_bibliotheque` ajoutée à `catalogue_hazumi` (migration additive). 34 ressources masquées ; **Harai-goshi conservée** car elle porte une leçon publiée. Elles restent utilisables dans les parcours et les leçons. Réversible via `npx tsx scripts/masquer-referentiel-1er-dan.ts --restaurer` |
| 6 bis | Ne garder dans la Bibliothèque que Uchi Mata, O Ouchi Gari et Nage-no-kata | **45 ressources supprimées définitivement** après confirmation du PO, garde-fou vérifiant que le parcours Nage-no-kata ne perd rien. Sauvegarde JSON écrite avant suppression. La leçon Harai-goshi a été détruite avec sa ressource ; celle de Nage-no-kata est intacte (12 chapitres, 15 questions) |
| 11 | Ma progression : retirer le suivi par grade | Page réduite au **seul tableau de bord des parcours**. Le curriculum par ceinture est retiré de l'écran ; `lib/curriculum.ts` est conservé |

**Analyse du retour 5.** J'avais interprété « inspiré des plateformes de streaming » comme des
rayons horizontaux groupés par catégorie. L'intention était la mise en avant visuelle des
ressources — vignettes, lecture immédiate — pas un regroupement. Le regroupement supprimait aussi
l'ajout de contenu personnel, d'où la régression. `buildRails` a été retiré au profit de
`filterBySource` et `playlistResources`.

## Reporté

- Réordonnancement manuel des ressources d'une playlist.
- Suppression et renommage d'une playlist depuis Parcours (restent dans `PersonalLibrary`).
- Vignettes illustrées pour les cartes de ressources.

## Dette connue

| Sujet | Constat |
|---|---|
| **Progression des playlists** | Calculée par intersection **tags ↔ ressources terminées**, conformément au modèle existant. Une playlist n'étant pas une liste figée, une ressource ajoutée au catalogue avec un tag correspondant y entre automatiquement. **À confirmer en recette** |
| Pages transitoires | Mon espace reste un hub de liens : sa refonte n'était pas au périmètre |
| Service worker PWA | Rafraîchissement forcé nécessaire pour voir la nouvelle version |
| Vérification connectée | Non réalisée par le Lead Full Stack : l'application est derrière authentification et la saisie d'identifiants lui est interdite |

## Vérifications

| Contrôle | Résultat |
|---|---|
| Tests unitaires | **256 tests verts / 33 fichiers** (205 avant le WP, +51) |
| Build | **Vert** |
| Lint | **0 erreur ajoutée** — la constante `MON_ESPACE_SECTIONS` a été extraite vers `lib/` pour éviter une nouvelle infraction `react-refresh` |
| Migration base de données | Une seule, **additive et réversible** : `catalogue_hazumi.visible_bibliotheque` |

## Livraison

| Élément | Valeur |
|---|---|
| Commit de développement | `1aa9f0de3da30245b8bc4d83dec59bce0d3f450f` |
| Commit de merge | `13d78ade773ce6fe0f162ef753bfd7f9bfc6fcb7` |
| Déploiement Vercel | https://hazumi-7d7614jbn-hazumi1.vercel.app |
| Bundle servi | `/assets/index-C_0qxZEE.js` |
| Date de mise en production | 2026-07-19 |
| URL de production | https://hazumi.org |
