# Impact Report — WP 1.4 · Micro-learning : bibliothèque de clips

- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Statut :** Proposition d'architecture — **aucune implémentation réalisée**
- **Recommandation :** **GO SOUS CONDITION** (voir §7)

## 1. Compréhension du besoin

Remplacer l'expérience « une longue vidéo » par des **clips courts et ciblés**, un par mouvement,
réutilisables entre leçons et parcours. La vidéo intégrale reste disponible comme
« Démonstration complète ».

Contrainte structurante posée par le Product Owner : **ne pas dupliquer les fichiers vidéo** si un
découpage par métadonnées suffit.

## 2. État actuel

| Élément | Constat |
|---|---|
| Vidéo maîtresse | `lesson.youtube_url` = `bkhBZzE2HpM` (Nage-no-kata, Kodokan) |
| Chapitrage | `lesson_chapters` — 12 entrées, colonnes `ordre, titre, timestamp_seconds, description` |
| Lecteur | `youtubeEmbedUrl(url, startSeconds)` — gère `start`, **pas `end`** |
| Réutilisation N-N | `parcours_ressources`, `UNIQUE(parcours_id, ressource_id)` — déjà en place |
| Techniques décrites | 9 (3 séries × 3) dans `src/lib/lessonPremium.ts` |

### Constat déterminant

**Les 12 chapitres existants découpent la vidéo par *série*, pas par *technique*** :

```
01:20  Techniques de bras (Te-waza)       ← 3 techniques dans ce seul segment
03:13  Techniques de hanche (Koshi-waza)  ← 3 techniques
04:21  Techniques de jambe (Ashi-waza)    ← 3 techniques
```

Il n'existe donc **aucun horodatage par mouvement**, ni dans le dépôt, ni en base. C'est le point
bloquant du WP — développé en §7.

## 3. Architecture proposée

### Principe : segmentation non destructive

Un clip n'est **pas un fichier**. C'est un triplet :

```
(source vidéo, début en secondes, fin en secondes)
```

Le lecteur YouTube accepte nativement `start` et `end` sur un même identifiant : une seule vidéo
hébergée, N clips logiques. Aucune duplication, aucun ré-encodage, aucun stockage supplémentaire.

### Le choix central : un clip est une ressource

Trois options ont été considérées.

| Option | Description | Verdict |
|---|---|---|
| **A** | Table `video_clips` autonome, séparée du catalogue | **Rejetée** — un clip aurait besoin de son propre système de tags, de progression, de vignettes et de réutilisation N-N. Duplication de tout le socle existant |
| **B** | Un clip **est** une ligne de `catalogue_hazumi`, enrichie de colonnes de segment | **Retenue** — hérite immédiatement de `parcours_ressources`, des playlists, de `user_parcours`, des vignettes et de la recherche |
| **C** | Ajouter `end_seconds` à `lesson_chapters` | **Rejetée** — un chapitre appartient à une leçon. Il ne serait pas réutilisable ailleurs, ce qui est précisément l'objectif du WP |

L'option B respecte le principe directeur « le nombre de concepts visibles doit rester limité » :
côté judoka, **un clip est une ressource comme une autre**.

### Normalisation de la source

Pour éviter de répéter l'URL sur chaque clip, une table `media_sources` porte la vidéo maîtresse :

```sql
create table media_sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,               -- https://www.youtube.com/watch?v=bkhBZzE2HpM
  titre text not null,             -- "Nage-no-kata — Kodokan"
  fournisseur text not null default 'youtube',
  duree_seconds integer,
  created_at timestamptz default now()
);

alter table catalogue_hazumi
  add column source_id uuid references media_sources(id) on delete set null,
  add column segment_start_s integer,
  add column segment_end_s integer,
  add constraint segment_coherent
    check (segment_end_s is null or segment_start_s is null or segment_end_s > segment_start_s);
```

Une seule ligne à modifier si l'URL de la vidéo maîtresse change. `source_id NULL` = ressource
classique : **l'existant n'est pas affecté**.

### Modèle résultant

```
media_sources  (1 vidéo maîtresse)
      ▲
      │ source_id
catalogue_hazumi
  ├── Nage-no-kata — Démonstration complète   (aucun segment)
  ├── Uki-otoshi                              (start, end)
  ├── Seoi-nage                               (start, end)
  └── … un clip par mouvement
      ▲
      │ parcours_ressources  (N-N, déjà existant)
  parcours · leçons · playlists
```

### Impact applicatif

| Fichier | Évolution |
|---|---|
| `src/lib/youtube.ts` | `youtubeEmbedUrl(url, start?, end?)` — ajout du paramètre `end` |
| `src/lib/segments.ts` *(nouveau)* | Résolution d'un clip vers son URL de lecture, durée, validation des bornes |
| `src/pages/eleve/Lecon.tsx` | Lit le segment de la ressource ; le lecteur démarre et s'arrête sur le clip |
| `src/lib/thumbnails.ts` | Vignette d'un clip dérivée de sa source (voir R3) |
| Bibliothèque · Parcours | **Aucun changement** : un clip est une ressource |

## 4. Ce que cette architecture apporte

- **Réutilisation immédiate** — un clip d'Uchi-mata sert au 1er dan, au 2e dan et à une playlist
  personnelle, sans copie.
- **Aucune duplication** — une vidéo hébergée, N clips.
- **Fondation pour les Dan suivants** — le kata complet compte 15 techniques ; les 6 non couvertes
  au 1er dan s'ajouteront comme clips, sans refonte.
- **Correction sans propagation** — un horodatage erroné se corrige sur une ligne.
- **Réversibilité** — `source_id NULL` remet une ressource en mode classique.

## 5. Stratégie de tests (à l'implémentation)

TDD sur `src/lib/segments.ts` : bornes valides, `end` absent, `end ≤ start`, segment hors durée,
calcul de durée, génération d'URL avec `start` et `end`, clip sans source. Puis tests de rendu du
lecteur, et non-régression sur les 283 tests existants.

Commandes : `npm run test` puis `npm run build`.

## 6. Risques

| # | Risque | Prob. | Impact | Réduction |
|---|---|---|---|---|
| R1 | **Horodatages par technique inexistants** | **Certaine** | **Bloquant** | Voir §7 — décision du Product Owner requise |
| R2 | Le paramètre `end` de YouTube n'est pas strictement respecté selon les plateformes | Moyenne | Moyen | Arrêt applicatif complémentaire si besoin ; à vérifier en recette |
| R3 | Tous les clips d'une même source partagent sa vignette | **Certaine** | Moyen | `thumbnail_url`, livré au WP 1.3, permet une vignette par clip |
| R4 | Publicités YouTube en début de lecture | Faible | Faible | Hors de notre contrôle |
| R5 | Suppression de la vidéo source | Faible | Élevé | Tous les clips tombent ensemble ; `media_sources` centralise le remplacement |

## 7. Point bloquant — les horodatages

**Le WP ne peut pas être implémenté en l'état, pour une raison factuelle : les horodatages par
technique n'existent pas.**

Les 12 chapitres en base découpent la vidéo par **série** (Te-waza, Koshi-waza…), pas par
mouvement. Produire 9 clips exige 9 couples début/fin qui ne figurent nulle part.

**Je ne les inventerai pas.** Un horodatage fabriqué produirait un clip démarrant au milieu d'une
technique et s'arrêtant avant la chute — un défaut invisible en test automatisé, mais visible par
chaque judoka. Ce projet a déjà connu ce problème : des timestamps inventés avaient dû être
purgés.

### Trois façons de débloquer

| # | Voie | Ce qu'il faut | Suite |
|---|---|---|---|
| **1** | **Le Product Owner fournit les horodatages**, au format `Uki-otoshi 01:23 → 01:41` — 9 lignes | Un relevé sur la vidéo | Implémentation complète immédiate |
| **2** | **Découpage par série d'abord** — 3 clips au lieu de 9, à partir des chapitres **existants** | Rien | Immédiat, mais ne satisfait pas « un clip par mouvement » |
| **3** | **Chapitrage YouTube officiel** — si la chaîne Kodokan publie un découpage par technique | Vérification côté Product Owner | Selon disponibilité |

L'architecture est identique dans les trois cas : **seules les données changent**.

## 8. Recommandation

# GO SOUS CONDITION

L'architecture est prête et sans risque technique majeur : segmentation par métadonnées, aucune
duplication, réutilisation héritée du socle existant, migration purement additive et réversible.

**La condition est l'obtention des horodatages par technique.** Elle ne relève pas du Lead Full
Stack : il s'agit d'un relevé sur le contenu pédagogique.

**Recommandation : voie 1.** Neuf couples début/fin suffisent à livrer le WP complet. Si vous
préférez avancer sans attendre, la voie 2 livre l'architecture et 3 clips de série dès maintenant,
les 9 clips venant ensuite sans refonte.
