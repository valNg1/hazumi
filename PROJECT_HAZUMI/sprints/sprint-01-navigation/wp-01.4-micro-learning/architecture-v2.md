# Architecture V2 — Learning Assets & segmentation assistée

- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Statut :** Proposition — **aucune implémentation**
- **Remplace :** la conclusion §7 de l'[Impact Report V1](impact-report.md) sur les horodatages

## Ce qui reste acquis de la V1

Validé par le Product Owner, non remis en cause : un clip est une ressource Hazumi ; séparation
`media_sources` / catalogue ; aucune duplication de vidéo ; migration additive.

La V2 ne change pas ces choix — elle les **généralise** et répond aux quatre objections.

---

# 1. Découpage assisté

## Ce que j'ai vérifié sur la vidéo source

Mesures faites sur `bkhBZzE2HpM`, pas des hypothèses :

| Signal | Constat |
|---|---|
| Chapitrage structuré YouTube | **Absent** — 0 `chapterRenderer` dans la page |
| Timestamps dans la description | **Absents** — les timestamps trouvés viennent des recommandations |
| Piste de sous-titres | **1 piste anglaise auto-générée** (ASR) déclarée |
| Récupération de la transcription | **Échec** — l'endpoint `timedtext` renvoie 0 octet sans outillage authentifié |
| Storyboards (frames servies par YouTube) | **Présents** — 3 niveaux, niveau 2 = 120×90 px. **URL signée non reconstituée** (403) |
| Durée | 1765 s (29:25) |
| Outils locaux | `ffmpeg`, `yt-dlp`, `tesseract` : **absents** |

## Le retournement du problème

L'objection du Product Owner est fondée, et voici pourquoi : **je posais mal le problème**.

Je le formulais comme « identifier quelle technique se trouve à quel instant » — un problème de
reconnaissance, difficile. Or **nous connaissons déjà la liste ordonnée des 9 techniques**
(`src/lib/lessonPremium.ts`). Le vrai problème est donc :

> trouver **9 frontières**, dans un ordre **déjà connu**, à l'intérieur d'un segment de série
> lui-même **déjà borné** par les 12 chapitres existants.

C'est un problème d'**alignement**, radicalement plus simple. Et il se décompose : les chapitres
actuels bornent déjà chaque série. Te-waza occupe `01:20 → 03:13`, soit 113 secondes pour
3 techniques. Il ne reste qu'à placer 2 frontières internes par série.

**On passe de « mesurer 18 bornes sur 29 minutes » à « placer 2 coupures dans une fenêtre de
2 minutes, six fois ».**

## Échelle des signaux automatiques

Du moins coûteux au plus lourd, chacun produisant des **candidats** à valider :

| Niveau | Signal | Coût | Fiabilité ici | Réutilisable demain |
|---|---|---|---|---|
| **0** | Timestamps de description → `parseTimestampChapters` (**déjà écrit**) | Nul | Inapplicable — absents | **Oui**, pour tout contenu bien publié |
| **1** | Métadonnées via `yt-dlp` : chapitres + sous-titres | Faible | Piste ASR anglaise disponible | Oui |
| **2** | Alignement de la transcription sur les noms de techniques | Moyen | **Faible** — un ASR anglais transcrit mal « Uki-otoshi » | Oui pour interviews et masterclass |
| **3** | OCR des cartons de titre à l'écran | Élevé | **Forte** pour un kata filmé — ces vidéos affichent le nom de chaque technique | Oui pour les kata |
| **4** | Détection de plans `ffmpeg` + alignement sur la liste ordonnée | Moyen | **Forte** — chaque technique est un plan distinct | Oui, générique |

**Le meilleur rapport effort/résultat ici est le niveau 4 combiné à la connaissance de l'ordre** :
détecter les ruptures de plan dans la fenêtre d'une série, en retenir 2, proposer les 3 clips.

## L'obstacle que je dois signaler

Les niveaux 3 et 4 exigent de **télécharger la vidéo** pour en extraire images ou plans.

Cette vidéo appartient au **Kodokan**, pas à Hazumi. La télécharger contrevient aux conditions
d'utilisation de YouTube, et en extraire des images pour les héberger produit une reproduction
d'une œuvre que nous ne détenons pas. Le même raisonnement que pour le contenu éditorial de
judopourtous s'applique.

**Ce n'est pas un obstacle technique mais juridique, et il ne se contourne pas par l'outillage.**

Il disparaît entièrement pour les contenus produits par Hazumi — ce qui sera le cas de la majorité
du catalogue futur (préparation physique, arbitrage, interviews, masterclass).

## Ce que je recommande : un écran de segmentation assistée

Plutôt qu'une automatisation fragile sur du contenu tiers, un **outil d'administration** qui rend
le travail manuel marginal :

```
┌─────────────────────────────────────────────────────┐
│  ▶ Lecteur         Série : Te-waza  (01:20 → 03:13) │
│                                                     │
│  Techniques attendues, dans l'ordre :               │
│    1. Uki-otoshi      [ Début ] [ Fin ]  01:20→01:5x│
│    2. Seoi-nage       [ Début ] [ Fin ]             │
│    3. Kata-guruma     [ Début ] [ Fin ]             │
│                                                     │
│  ⌨  I = début · O = fin · ← → = ±1 s · Espace       │
│  Pré-remplissage : découpage égal de la fenêtre     │
└─────────────────────────────────────────────────────┘
```

Ce que cet écran apporte :

- **Aucun relevé manuel de timecode** — on regarde et on appuie sur une touche.
- **Pré-remplissage** par découpage égal de la fenêtre de série, ou par détection de plans quand
  le contenu nous appartient.
- **Validation humaine systématique** — aucun horodatage n'entre en base sans avoir été vu.
- **Réutilisable pour tout le catalogue futur**, quelle que soit la source.

Estimation : **environ 10 minutes pour les 9 techniques**, contre plusieurs heures de relevé
manuel. C'est la réduction importante demandée, sans dépendance fragile ni risque juridique.

---

# 2. Passage à l'échelle — plusieurs milliers de clips

## Le blocage actuel, à corriger avant toute montée en charge

`src/pages/eleve/Bibliotheque.tsx` charge **l'intégralité du catalogue et des vidéos côté client**,
puis filtre en mémoire. Avec 48 ressources, c'est indolore. À 3 000 clips, la page devient
inutilisable sur mobile.

**C'est le seul vrai obstacle à l'échelle, et il est applicatif, pas structurel.**

## Le schéma tient l'échelle, moyennant des index

PostgreSQL gère des millions de lignes sans difficulté. Ce qui manque aujourd'hui :

```sql
-- Recherche plein texte (titre, famille, grade)
alter table catalogue_hazumi add column recherche tsvector
  generated always as (
    to_tsvector('french', coalesce(titre,'') || ' ' ||
                          coalesce(famille,'') || ' ' || coalesce(grade,''))
  ) stored;
create index on catalogue_hazumi using gin (recherche);

-- Tags : TEXT[] sans index = balayage complet a chaque filtre
create index on catalogue_hazumi using gin (tags);

-- Clips d'une meme source
create index on catalogue_hazumi (source_id, segment_start_s);

-- Discriminant : clip, video, fiche, kata, arbitrage, masterclass, interview
alter table catalogue_hazumi add column kind text not null default 'ressource';
create index on catalogue_hazumi (kind, visible_bibliotheque);
```

## Ce que le passage à l'échelle impose côté application

| Sujet | Aujourd'hui | Cible |
|---|---|---|
| Chargement | Catalogue entier côté client | **Pagination serveur** (`range`), 30 par page |
| Recherche | `filter()` JavaScript | `websearch_to_tsquery` côté PostgreSQL |
| Filtres | En mémoire | `.eq()` / `.overlaps()` côté serveur |
| Playlists | Filtre par tags recalculé à chaque rendu | Vue matérialisée si la lenteur se confirme |
| URLs | UUID | `slug` stable et lisible |

## Sur la typologie annoncée

Techniques, kata, arbitrage, préparation physique, interviews, masterclass : **une seule colonne
`kind` suffit**. Ces catégories diffèrent par leurs métadonnées, pas par leur nature — toutes sont
des ressources consultables, rattachables à un parcours, plaçables dans une playlist.

Créer une table par type reproduirait sept fois le socle (tags, progression, vignettes,
réutilisation) pour un bénéfice nul. Le principe « limiter le nombre de concepts » vaut aussi pour
le modèle de données.

---

# 3. Miniatures — une image par clip

Votre objection est juste : partager une miniature entre tous les clips d'une même source est
indigne d'un produit premium.

## Quatre voies étudiées

| Voie | Principe | Verdict |
|---|---|---|
| **A** | **Storyboards YouTube** — sprites de frames servis par `i.ytimg.com` | **Vérifié présent** (niveau 2 : 120×90 px). Mais URL signée, non documentée, **reconstruction échouée (403)**. Dépendance fragile : YouTube peut la casser sans préavis |
| **B** | **Extraction de frame** `ffmpeg` à `début + 2 s` → Supabase Storage | **Techniquement idéal.** Impossible sur contenu tiers (voir §1). **Parfait pour le contenu Hazumi** |
| **C** | **Miniature générée** — nom de la technique et série, N&B, identité premium | Immédiat, déterministe, aucun risque. Chaque clip est **identifiable** |
| **D** | `thumbnail_url` manuel — **déjà livré au WP 1.3** | Filet de sécurité, ne passe pas à l'échelle seul |

## Recommandation : chaîne selon la provenance

```
1. thumbnail_url explicite                      (override, existe déjà)
2. Contenu Hazumi  → frame extraite a start+2s  (ffmpeg, Storage)
3. Contenu tiers   → miniature generee premium  (technique + serie, N&B)
4. Dernier recours → miniature generee du titre (existe deja, WP 1.3)
```

La voie A reste intéressante et je propose de la **maquetter séparément** — si la reconstruction
d'URL s'avère stable, elle s'insère au niveau 2 sans rien changer d'autre. Mais je ne bâtirais pas
le produit premium sur une URL non documentée.

La voie C mérite d'être prise au sérieux : une carte typographique portant *Uki-otoshi · Te-waza ·
1re série*, en noir et blanc dans le style du WP 1.3, est **plus identifiable** qu'une frame floue
prise au hasard dans un mouvement. Pour du micro-learning, savoir *ce qu'on va voir* prime sur
l'illustration.

---

# 4. Vision long terme — le Learning Asset

## Le constat

Vous avez raison de ne pas réduire le clip à un segment vidéo. Aujourd'hui, la richesse
pédagogique de Hazumi est **enfermée dans la table `lesson`**, en relation 1-1 avec une ressource.
La décomposition des 9 techniques du Nage-no-kata (mise en action, kuzushi, tsukuri, kake, rôle de
Uke, erreur fréquente) vit même **en dur dans `src/lib/lessonPremium.ts`** — du contenu dans du
code, non réutilisable et non éditable.

## Le modèle proposé

Un **Learning Asset** est l'unité pédagogique atomique : un média **et** ce qui permet de
l'apprendre.

```
learning_asset  (= catalogue_hazumi generalise)
  ├─ identite      titre, slug, kind, tags, grade, famille
  ├─ media         source_id + segment_start_s + segment_end_s   (ou aucun)
  ├─ vignette      thumbnail_url  (chaine de resolution)
  └─ blocs         asset_blocks[]  — ordonnes, typés
                     ├─ fiche              (markdown)
                     ├─ points_attention   (liste)
                     ├─ erreurs_frequentes (liste)
                     ├─ decomposition      (kuzushi / tsukuri / kake / uke)
                     ├─ quiz               (→ lesson_quiz)
                     └─ ressources_liees   (→ autres assets)
```

```sql
create table asset_blocks (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references catalogue_hazumi(id) on delete cascade,
  type text not null,      -- fiche | points_attention | erreurs | decomposition | quiz | liens
  ordre integer not null,
  contenu jsonb not null,
  created_at timestamptz default now(),
  unique (asset_id, ordre)
);
create index on asset_blocks (asset_id, ordre);
```

## Pourquoi la composition plutôt que des colonnes

Ajouter demain un bloc « échauffement recommandé » ou « variante de compétition » ne coûte
**aucune refonte de structure** : un nouveau `type`. Avec la contrainte `CHECK` retenue au WP 1.4,
cela demande néanmoins **une migration** pour élargir la contrainte — compromis assumé, corrigé
ici après relecture du Product Owner. Une leçon devient la **composition** de blocs, pas une
ligne figée.

C'est ce qui garantit l'exigence posée : construire les futurs parcours **sans remettre en cause
le modèle de données**.

## Chemin de migration — sans rupture

Trois étapes, chacune livrable et réversible :

| Étape | Contenu | Effet sur l'existant |
|---|---|---|
| **1** | Créer `asset_blocks`. Migrer `lessonPremium.ts` vers des blocs `decomposition` | Aucun — le code peut lire les deux |
| **2** | Généraliser `lesson` : ses champs deviennent des blocs ; `lesson_quiz` devient un bloc `quiz` | `lesson` conservée en lecture le temps de la bascule |
| **3** | Segmentation (V1) + `kind` + index d'échelle | Additif |

L'ordre importe : **le Learning Asset avant les clips**. Un clip est alors un Learning Asset
portant un média segmenté — pas un objet à part qu'il faudrait réconcilier plus tard.

## Bénéfice immédiat, hors micro-learning

La décomposition des 9 techniques sort du code et devient éditable, versionnée, réutilisable. La
prochaine leçon premium ne demandera plus de développement — seulement du contenu.

---

# 5. Ce que je recommande

| # | Chantier | Priorité | Dépendance |
|---|---|---|---|
| **1** | **Pagination serveur de la Bibliothèque** | **P0** | Aucune — blocage réel avant toute montée en charge |
| **2** | **`asset_blocks`** + sortie de `lessonPremium.ts` du code | **P1** | Aucune |
| **3** | **Écran de segmentation assistée** (admin) | **P1** | Aucune |
| **4** | **Clips Nage-no-kata** via cet écran | **P2** | Chantier 3 |
| **5** | **Miniatures par clip** — cartes générées + frames pour contenu Hazumi | **P2** | Chantier 4 |
| **6** | **Index d'échelle** (`kind`, GIN, FTS) | **P2** | Aucune |
| **7** | Maquette storyboards YouTube | **P3** | Exploratoire |

**Le chantier 1 est celui que je ferais en premier**, avant même le micro-learning : c'est le seul
point qui casserait réellement à 3 000 clips, et il est indépendant de tout le reste.

## Réponse directe aux quatre objections

| Objection | Réponse |
|---|---|
| **Découpage assisté** | Possible, mais **assisté** plutôt qu'automatique. Le gain vient d'avoir retourné le problème — l'ordre des techniques est connu, les séries sont déjà bornées — plus d'un écran dédié. ~10 minutes au lieu de plusieurs heures. L'automatisation complète bute sur un obstacle **juridique**, pas technique |
| **Échelle** | Le schéma tient ; le blocage est applicatif (chargement intégral côté client) et se corrige indépendamment. Un `kind` suffit pour les sept typologies |
| **Miniatures** | Chaîne selon provenance : frame extraite pour le contenu Hazumi, carte générée identifiable pour le contenu tiers. Storyboards YouTube vérifiés présents mais trop fragiles pour en dépendre |
| **Learning Asset** | Adopté comme modèle central, par composition de blocs typés. À faire **avant** les clips, pour que le clip naisse déjà Learning Asset |
