# Cahier de recette — WP 1.3 · Couvertures de playlists & vignettes

- **Recetteur :** Product Owner — Sensei Hazumi
- **URL :** https://hazumi.org

> Prérempli par le Lead Full Stack : environnement et preuves de tests uniquement (règle B).
> **La recette fonctionnelle n'est pas déclarée acceptée.**

## Prérequis

- `Ctrl + Shift + R` — le service worker peut servir l'ancienne version.
- Disposer d'au moins une playlist contenant 1, 2 puis 3 ressources ou plus.

## Preuves de tests (prérempli)

| Contrôle | Résultat |
|---|---|
| `npm run test` | **283 verts / 35 fichiers** |
| `npm run build` | Vert |
| `npx tsx scripts/audit-vignettes.ts` | 3/3 catalogue, 42/43 vidéos perso |

## SC-01 — Couvertures de playlists

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Parcours → Mes Playlists | **Aucune icône générique** (🥊 🎌 🥋) | | ⬜ |
| 2 | Playlist à 1 ressource | Sa vignette occupe toute la couverture | | ⬜ |
| 3 | Playlist à 2 ressources | Deux vignettes côte à côte | | ⬜ |
| 4 | Playlist à 3+ ressources | Mosaïque de 4 cases, aucune case vide | | ⬜ |
| 5 | Rendu visuel | Noir et blanc + voile sombre, cohérent premium | | ⬜ |
| 6 | Playlist sans ressource | Mention « Playlist vide », pas d'icône | | ⬜ |

## SC-02 — Vignettes du catalogue

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Bibliothèque | **Toutes** les lignes ont une vignette | | ⬜ |
| 2 | Nage-no-kata | Vignette de la vidéo Kodokan (issue de la leçon) | | ⬜ |
| 3 | Uchi Mata / O Ouchi Gari | Vignettes YouTube | | ⬜ |
| 4 | Filtre « Mes contenus » | Vidéos personnelles avec vignettes | | ⬜ |
| 5 | Vidéo Facebook | Vignette générée sobre (initiales), pas d'image cassée | | ⬜ |

## SC-03 — Non-régression

| # | Étape | Attendu | Obtenu | Statut |
|---|---|---|---|---|
| 1 | Ouvrir une playlist | Affiche ses ressources | | ⬜ |
| 2 | Créer une playlist | Fonctionne, couverture générée aussitôt | | ⬜ |
| 3 | Ajouter une ressource | Fonctionne, vignette immédiate | | ⬜ |
| 4 | Leçon Nage-no-kata | Vidéo, chapitres et quiz intacts | | ⬜ |
| 5 | Console navigateur | Aucune erreur d'image | | ⬜ |

**Légende :** ⬜ non exécuté · ✅ conforme · ❌ non conforme · ⚠️ réserve

## Décision finale du Product Owner

- **Statut :** En attente
- **Décision :** ⬜ Acceptée · ⬜ Acceptée avec réserves · ⬜ Refusée
- **Commentaire :** —
