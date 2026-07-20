# Impact Report — WP 1.3 · Couvertures de playlists & audit des vignettes

- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Recommandation :** GO — exécuté dans la même séquence (ADR-002, autorisation permanente du PO)

## 1. Compréhension du besoin

Trois objectifs : générer automatiquement les couvertures de playlists à partir de leur contenu
réel, auditer les vignettes manquantes du catalogue, et corriger le pipeline en profondeur plutôt
que ponctuellement.

## 2. Audit — trois causes racines distinctes

L'audit du catalogue et des 43 vidéos personnelles a révélé que les vignettes manquantes ne
relevaient pas d'un défaut unique, mais de **trois causes indépendantes**.

### Cause A — Nage-no-kata : la vidéo n'est pas sur la ressource

`catalogue_hazumi.url` vaut `NULL`. La vidéo de Nage-no-kata vit sur `lesson.youtube_url`
(`bkhBZzE2HpM`). Le pipeline ne regardait **que** l'URL de la ressource et ignorait la leçon
rattachée.

### Cause B — « Judô, la voie de la souplesse » : Google Docs non reconnu

L'URL est `docs.google.com/document/d/…`. `detectVideoType` ne reconnaissait que
`drive.google.com`, jamais `docs.google.com` : la ressource tombait en `direct`, donc sans
vignette.

### Cause C — Vimeo : bug latent

`getThumbnailUrl` renvoyait `https://vimeo.com/api/v2/video/{id}.json`, une **URL d'API JSON**
utilisée comme `src` d'une balise `<img>`. Aucune ressource Vimeo n'existe aujourd'hui, mais la
première aurait affiché une image cassée.

### Constat transverse — aucune stratégie de repli

`getThumbnailUrl` renvoyait `null` pour tout ce qui n'était pas reconnu. L'appelant affichait
alors une icône générique. **C'est ce `null` qui produisait les icônes génériques**, dans la
Bibliothèque comme sur les cartes de playlists.

## 3. Décision d'architecture

Plutôt que de corriger les deux ressources signalées, le pipeline est refait autour d'un
**résolveur unique à chaîne de secours** (`src/lib/thumbnails.ts`) :

1. `thumbnail_url` explicite (nouvelle colonne, override manuel) ;
2. URL de la ressource (YouTube, Vimeo, Drive, Docs, image directe) ;
3. **vidéo de la leçon rattachée** ;
4. **vignette générée** — SVG déterministe, initiales sur fond gris.

`resolveThumbnail` ne renvoie **jamais `null`**. C'est la garantie structurelle qu'aucune icône
générique ne peut réapparaître, y compris pour une ressource future d'un type non prévu.

## 4. Fichiers impactés

**Créés** — `src/lib/thumbnails.ts`, `src/components/PlaylistCover.tsx`,
`scripts/audit-vignettes.ts`, deux fichiers de tests, une migration.

**Modifiés** — `src/pages/eleve/Parcours.tsx` (couvertures), `src/pages/eleve/Bibliotheque.tsx`
(résolveur).

**Supprimés** — aucun. `getThumbnailUrl` reste en place pour les appelants existants.

## 5. Risques

| # | Risque | Prob. | Impact | Réduction |
|---|---|---|---|---|
| R1 | Vignette externe indisponible (403, suppression) | Moyenne | Faible | `onError` masque l'image ; la mosaïque reste lisible |
| R2 | Coût réseau des mosaïques | Faible | Faible | `loading="lazy"`, 4 images maximum |
| R3 | Facebook et Instagram sans vignette dérivable | Certaine | Faible | Vignette générée ; override manuel possible |
| R4 | Playlist sans ressource | Moyenne | Faible | État « Playlist vide » explicite, pas d'icône générique |
