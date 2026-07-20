# WP 1.4 — Micro-learning : bibliothèque de clips

- **Statut :** `In Development` — phase 1 (socle) livrée ; les 9 clips attendent les horodatages
- **Implémentation :** **aucune**

## Objectif

Remplacer la longue vidéo unique par des clips courts, un par mouvement, réutilisables entre
leçons et parcours. La vidéo intégrale reste disponible comme « Démonstration complète ».

## Documents

| Document | Statut |
|---|---|
| [impact-report.md](impact-report.md) | V1 — architecture de segmentation (validée par le PO) |
| [architecture-v2.md](architecture-v2.md) | **V2 — Learning Assets, échelle, miniatures, découpage assisté** |
| `recette.md` | À rédiger après GO |
| `changelog.md` | À rédiger après implémentation |

## Architecture proposée en une phrase

Un clip est une **ressource du catalogue** portant un triplet
`(source vidéo, début, fin)` — segmentation par métadonnées, aucune duplication de fichier,
réutilisation héritée de `parcours_ressources`.

## Recommandation

**GO SOUS CONDITION** — l'architecture est prête ; il manque les **horodatages par technique**,
qui n'existent nulle part : les 12 chapitres actuels découpent la vidéo par série, pas par
mouvement.

## Décision attendue du Product Owner

| Voie | Description |
|---|---|
| **1** *(recommandée)* | Fournir les 9 couples début/fin → implémentation complète |
| **2** | Découper par série (3 clips) à partir des chapitres existants → immédiat, partiel |
| **3** | Vérifier l'existence d'un chapitrage officiel par technique |
