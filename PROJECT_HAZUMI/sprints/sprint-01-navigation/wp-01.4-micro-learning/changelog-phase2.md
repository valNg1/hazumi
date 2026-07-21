# Changelog — WP 1.4 · Phase 2 (socle multi-médias)

- **Date :** 2026-07-20
- **Statut :** Livré — **prêt à recevoir les neuf horodatages**. Aucune donnée de production créée.

## Correction d'architecture — Learning Asset → N médias

Le modèle 1 ressource → 1 segment de la phase 1 est remplacé. Une ressource
pédagogique (la technique) peut porter **plusieurs médias** : démonstration,
ralenti, vue arrière, analyse, erreur fréquente, vidéo complète.

### Base de données

- **Migration `20260719230000_asset_media.sql`** appliquée en production :
  - table `asset_media` (`asset_id` FK CASCADE, `source_id` FK RESTRICT, `role`,
    `segment_start_s/end_s`, `est_principal`, `ordre`, `titre`) ;
  - **un seul média principal par asset** garanti par un index partiel unique
    `where est_principal` ;
  - unicité `(asset_id, role)`, contrainte de cohérence des bornes ;
  - **suppression des trois colonnes** `source_id`, `segment_start_s`,
    `segment_end_s` de `catalogue_hazumi` (jamais alimentées → aucune perte) ;
  - `ordre` et `aliases` conservés sur `catalogue_hazumi` (propriétés de l'asset).

### Code

| Module | Rôle |
|---|---|
| `src/lib/assetMedia.ts` | `pickPrincipal`, `sortMedias`, `roleLabel`, `mediaSegment`, `hasMultipleMedias` — le lecteur reçoit une **collection**, plus un média unique |
| `src/lib/nageNoKata.ts` | Roster canonique des 9 techniques (nom, famille, ordre) + source Kodokan — **source unique** |
| `src/lib/nageNoKataSeed.ts` | `buildSeedPlan` — valide les bornes, refuse tout ce qui est incomplet, incohérent ou chevauchant ; produit cartes, sections et médias |
| `src/pages/eleve/Lecon.tsx` | Charge `asset_media`, ouvre le principal, propose un sélecteur si plusieurs. Retombe sur `lesson.youtube_url` sans média — **rétrocompatible** |

### Vérification des exigences (§2 du prompt)

- ✅ une ressource peut posséder plusieurs médias ;
- ✅ un média principal est identifiable (`est_principal` + index partiel) ;
- ✅ le lecteur récupère une collection ;
- ✅ l'architecture ne suppose plus « 1 ressource = 1 vidéo ».

## Seed préparé, non exécuté

`scripts/seed-clips-nage-no-kata.ts` + `scripts/data/horodatages-nage-no-kata.ts`.

Immédiatement exécutable dès les bornes renseignées. **Garde-fou vérifié** : avec
les bornes vides, il s'arrête et ne crée rien (`ARRÊT — Aucune donnée créée`).

Une fois lancé, il crée : la source, 9 ressources-clips (vignette = carte
typographique), un média démonstration principal par clip, les sections
pédagogiques (issues de `lessonPremium`), une leçon publiée par clip, et le
rattachement au parcours « Préparer le 1er Dan ». Tout idempotent.

## Cartes typographiques définitives

Les 9 cartes sont générées depuis le roster. Aperçu ouvrable :
[cartes-preview.html](cartes-preview.html). Le seed écrit chaque carte dans
`thumbnail_url`, donc elle sert de vignette partout — Bibliothèque, playlists,
lecteur — sans câblage supplémentaire. **Aucune frame extraite de la vidéo.**

## Non fait — volontairement

Aucun clip, aucun Learning Asset, aucune donnée de production, aucun horodatage.
Vérifié : `media_sources`, `asset_media`, `asset_sections` = 0 ligne.

## Dette connue

| Sujet | Constat |
|---|---|
| **Arrêt non strict** | `end` YouTube arrête la lecture sans verrouiller la barre — inchangé depuis la phase 1. Point de recette SC-05 |
| `lessonPremium.ts` | ~70 % du contenu premium reste dans le code (HZ-908) |
| Pagination | Écartée (HZ-907) |

## Vérifications

| Contrôle | Résultat |
|---|---|
| Tests unitaires | **371 verts / 41 fichiers** (338 avant la phase 2, **+33**) |
| Build | **Vert** |
| Lint | **0 erreur ajoutée** |
| Migration | Appliquée, additive — les 3 ressources existantes inchangées |
| Données de production | **0** ligne créée |
