# Impact Report — WP 1.2 · Navigation & Expérience utilisateur

- **WP :** 1.2 — Navigation & Expérience utilisateur
- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Base d'analyse :** `main` au commit `90a08a4`
- **Recommandation :** GO — exécuté dans la même séquence sur autorisation du Product Owner (ADR-002)

## 1. Compréhension du besoin

Remplacer les pages transitoires du WP 1.1 par l'expérience cible sur quatre domaines :
Bibliothèque (découverte façon streaming), Parcours (deux familles), Mon espace (navigation
interne), Ma progression (tableau de bord).

**Intention produit centrale :** séparer la **découverte** des contenus de leur **organisation
personnelle**. L'univers disparaît de la découverte et ne réapparaît qu'au moment où le judoka
crée une playlist.

## 2. État actuel constaté

| Élément | Constat |
|---|---|
| `catalogue_hazumi` | Porte une colonne `parcours` (univers). `PersonalLibrary` filtrait systématiquement dessus |
| `playlists_collections` | `{ id, judoka_id, nom, tags[], parcours }` — une playlist est un **filtre par tags** scopé à un univers, pas une liste explicite d'items |
| `user_parcours` | `{ parcours_id, ressources_terminees[], updated_at }` — porte la progression |
| Bibliothèque (WP 1.1) | Page transitoire : trois liens vers les univers |
| Mon espace (WP 1.1) | Page transitoire : cinq liens. Aucune navigation interne depuis les rubriques |
| Progression | Page centrée sur le curriculum par ceinture, sans vue des parcours commencés |
| Parcours | Une seule famille affichée |

**Découverte déterminante :** une playlist étant un filtre par tags, sa progression est calculable
sans nouvelle table — en croisant les tags de la playlist avec les ressources terminées.

## 3. Décision d'architecture

**Aucune migration de base de données.** Le modèle existant suffit :

- la Bibliothèque charge `catalogue_hazumi` **sans filtre** `parcours` ;
- la création de playlist agrège les tags des ressources sélectionnées et écrit dans
  `playlists_collections` avec l'univers choisi ;
- la progression d'une playlist se calcule par intersection tags ↔ ressources terminées.

C'est le choix le moins invasif : il respecte le hors-périmètre « ne pas modifier le modèle de
données » hérité du WP 1.1 tout en servant l'intention produit.

## 4. Fichiers impactés

**Créés** — `src/lib/bibliotheque.ts`, `src/lib/progressionDashboard.ts`,
`src/lib/monEspaceSections.ts`, `src/components/MonEspaceNav.tsx`,
`src/components/ProgressionDashboard.tsx`, `src/components/bibliotheque/ResourceRail.tsx`, plus
trois fichiers de tests.

**Modifiés** — `src/pages/eleve/Bibliotheque.tsx` (réécrite),
`src/pages/eleve/Parcours.tsx` (deux familles), `src/pages/eleve/Progression.tsx` (tableau de
bord), et les cinq pages de Mon espace (injection de la sous-navigation).

**Supprimés** — aucun.

## 5. Risques

| # | Risque | Prob. | Impact | Réduction |
|---|---|---|---|---|
| R1 | Playlist sans tag exploitable | Moyenne | Moyen | Message d'erreur explicite ; la création est bloquée |
| R2 | Volume du catalogue → rails trop longs | Faible | Faible | Défilement horizontal, recherche en tête de page |
| R3 | Test WP 1.1 de la Bibliothèque transitoire | **Certaine** | Faible | Connu : le test décrivait la page transitoire remplacée. Réécrit |
| R4 | Progression playlist approximative | Moyenne | Moyen | Le calcul par tags est une approximation assumée du modèle existant. Documenté en dette |
| R5 | Service worker PWA | Moyenne | Moyen | Rafraîchissement forcé nécessaire, comme au WP 1.1 |

## 6. Améliorations proposées par le Lead Full Stack

Dans le cadre de la latitude accordée, trois ajouts cohérents avec l'intention produit :

1. **Recherche tolérante aux accents** — le vocabulaire japonais est souvent mal orthographié ;
   « strategie » trouve « Stratégie ».
2. **Sélection multiple directement dans les rails** — la playlist se compose au fil de la
   navigation, sans écran intermédiaire.
3. **Retour explicite après création** — un message renvoie vers Parcours, matérialisant le lien
   entre les deux pages voulu par la spécification.

## 7. Points de décision

Aucun point bloquant. Deux sujets signalés pour la recette :

- **D1** — la progression d'une playlist repose sur les tags, pas sur une liste figée de
  ressources. Une ressource ajoutée au catalogue avec un tag correspondant entre donc dans la
  playlist. Comportement cohérent avec le modèle existant, à confirmer.
- **D2** — l'ancien contenu de « Ma progression » (curriculum par ceinture) est **conservé sous**
  le tableau de bord, pas supprimé.
