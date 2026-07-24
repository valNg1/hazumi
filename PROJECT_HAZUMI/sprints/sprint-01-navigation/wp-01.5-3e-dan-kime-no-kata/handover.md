# Handover — MVP parcours 3e Dan · UV1 Kime-no-kata

- **Date :** 2026-07-23
- **Périmètre :** structure MVP uniquement. Ni contenu éditorial, ni quiz, ni sous-titres français.

## Livré

| Élément | État |
|---|---|
| Parcours « Préparer le 3e Dan » | Créé, publié, univers `kyu` — visible dans l'application |
| UV1 « Kime-no-kata » | Ressource créée, rattachée au parcours, visible en Bibliothèque |
| Vidéo Kodokan `1-YAOozPQNU` | Intégrée : `media_sources` + `asset_media` rôle `complet` (média principal) |
| Leçon | Publiée, lecteur alimenté par la vidéo intégrale |
| Chapitres | 3 chapitres, dont **2 marqués « ⚠ Borne à valider »** |

Architecture strictement identique au parcours 1er Dan. Aucune table, aucun composant,
aucun motif nouveau.

## Résultat de l'extraction de chapitres

Pipeline `scripts/extract-video-chapters.ts` exécuté sur la vidéo.

| Signal | Résultat |
|---|---|
| Chapitrage YouTube structuré | **Absent** (0 chapitre) |
| Timestamps en description | **Absents** |
| Transcription automatique EN | Récupérée (2 548 lignes) |
| Inférence par mots-clés (13 noms de techniques) | **0 détection** |

**Cause :** l'ASR anglaise ne restitue pas les noms japonais — « Kime-no-kata » est transcrit
« Kimino cutter », « Ryote-dori » n'apparaît jamais. L'artefact généré porte donc
`"chapters": []` et `needsValidation: true`, ce qui est le résultat honnête du pipeline.

**Ce qui a pu être dérivé malgré tout**, à partir des marqueurs structurels de la narration :

| Chapitre | Borne | Fiabilité |
|---|---|---|
| Introduction et salut | 00:00 | Certaine (début de vidéo) |
| Idori — 8 techniques à genoux | 00:00 | **À valider** — début réel inconnu |
| Tachi-ai — 12 techniques debout | **27:16** | **À valider** — transcription : « Now tachi, the uke and tori stand together », juste après la repose du poignard qui clôt Idori |

> Le passage à 06:49 (« Having finished the eight Idori techniques ») est un **résumé narré
> d'introduction**, pas la transition réelle. Il a été écarté après vérification du contexte.

## Reste à faire

1. **Valider les 2 bornes de section** (début Idori, début Tachi-ai) — Product Owner.
2. **Borner les 20 techniques individuelles** — non extractibles automatiquement sur cette
   source ; même chemin que pour le Nage-no-kata (relevé manuel dans un fichier de données).
3. Contenu éditorial des techniques, quiz, sous-titres français — hors périmètre MVP.
4. Segmentation en clips (`asset_media` par technique) — après validation des bornes.

## Limite connue de l'extraction sur ce kata

7 des 20 techniques portent le **même nom** dans Idori et Tachi-ai (Ryote-dori, Tsukkake,
Suri-age, Yokouchi, Ushiro-dori, Tsukkomi, Kirikomi). Une inférence par mot-clé ne pourrait de
toute façon retourner qu'une occurrence par nom : le découpage des 20 techniques exigera
nécessairement une validation humaine, quel que soit l'outillage.

## Rejouer le seed

```bash
npx tsx scripts/seed-parcours-3e-dan.ts
```

Idempotent. Les bornes se corrigent dans `scripts/data/chapitres-kime-no-kata.ts`.
