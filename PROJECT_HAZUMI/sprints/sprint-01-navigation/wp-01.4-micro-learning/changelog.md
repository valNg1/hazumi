# Changelog — WP 1.4 · Phase 1 (socle micro-learning)

- **Date :** 2026-07-19
- **Statut :** Phase 1 livrée — **les neuf clips restent bloqués par les horodatages**

## Ajouté

### Base de données — migration additive

`20260719210000_micro_learning_segments.sql`, appliquée en production :

- **`media_sources`** — la vidéo maîtresse. RLS : lecture authentifiée, écriture admin.
- **`catalogue_hazumi`** — `source_id`, `segment_start_s`, `segment_end_s`, `ordre`, `aliases`,
  contrainte `catalogue_segment_coherent` (`fin > début`, début ≥ 0), index sur
  `(source_id, segment_start_s)`.
- **`asset_sections`** — socle Learning Asset : `id`, `asset_id` (FK **ON DELETE CASCADE**),
  `type` (`fiche` · `points_attention` · `erreurs`), `ordre`, `titre`, `contenu`, `created_at`,
  `updated_at`. Unicité `(asset_id, type, ordre)` → **ordre déterministe, aucune section
  orpheline**. RLS identique.

### Code

| Module | Rôle |
|---|---|
| `src/lib/segments.ts` | `parseTimecode` (`mm:ss`, `hh:mm:ss`, secondes), `formatTimecode`, `validateSegment`, `segmentDuration`, `hasSegment`, `segmentLabel`, `detectOverlaps` |
| `src/lib/techniqueCards.ts` | `techniqueCard` — carte typographique SVG ; `canonicalTechniqueName` et `techniqueAliases` — gestion des variantes |
| `src/lib/youtube.ts` | `youtubeEmbedUrl(url, start?, **end?**)` — rétrocompatible |
| `src/lib/thumbnails.ts` | Un niveau inséré : une séquence reçoit sa carte typographique |
| `src/lib/bibliotheque.ts` | La recherche accepte les `aliases` |
| `src/pages/eleve/Lecon.tsx` | Lecture d'un segment + bandeau « Séquence » + « ↻ Revoir la séquence » |

### Cartes typographiques

Fond dégradé sombre, filet rouge Hazumi, parcours parent, nom de la technique, famille, rang dans
la série, marqueur « séquence vidéo ». **Aucune frame extraite, aucune image hébergée** —
conforme à la décision sur le contenu tiers.

### Nommage (D2)

Noms canoniques **Seoi-nage** et **Tsurikomi-goshi**. Variantes gérées en alias, sans doublon :
`Ippon-seoi-nage`, `Morote-seoi-nage`, `Tsuri-komi-goshi`, `Okuri-ashi-barai`,
`Sasae-tsuri-komi-ashi`.

## Corrigé

**Documentation — contrainte `CHECK` sur `asset_sections.type`.** Ma formulation initiale
(« ajouter un type ne demande pas de migration ») était **inexacte** : avec un `CHECK`, ajouter un
type **exige une migration**. Corrigé dans `plan-implementation.md` et `architecture-v2.md`. La
solution `CHECK` est conservée, comme demandé.

## Non fait — volontairement

| Élément | Raison |
|---|---|
| Les 9 clips en production | **Horodatages non disponibles.** Aucune borne approximative n'a été écrite |
| `media_sources` : ligne Nage-no-kata | Sera créée avec les clips |
| `asset_sections` : contenu des 9 techniques | Idem |
| Pagination serveur | Écartée du WP (HZ-907) |
| Écran d'administration de segmentation | Écarté du WP |
| Migration intégrale de `lessonPremium.ts` | ~70 % reste en dur (HZ-908) |

## Dette connue

| Sujet | Constat |
|---|---|
| **Arrêt non strict** | `end` arrête la lecture mais ne verrouille pas la barre de progression : une relance manuelle depuis les contrôles YouTube dépasse la borne. **Point de recette obligatoire SC-05** — à documenter tel qu'observé |
| Contrainte `CHECK` | Un nouveau type de section exigera une migration |
| `lessonPremium.ts` | ~70 % du contenu premium reste dans le code (HZ-908) |
| Vérification connectée | Non réalisée : authentification requise, saisie d'identifiants interdite au Lead Full Stack |

## Vérifications

| Contrôle | Résultat |
|---|---|
| Tests unitaires | **338 verts / 38 fichiers** (283 avant, **+55**) |
| Build | **Vert** |
| Lint | **0 erreur ajoutée** |
| Migration | Appliquée, additive — les 3 ressources existantes inchangées |
