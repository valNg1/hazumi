# Plan d'implémentation — WP 1.4 · Micro-learning Nage-no-kata

- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Statut :** Plan soumis à validation — **aucune implémentation**
- **Cadre :** décisions du Product Owner du 2026-07-19 (V2 validée, périmètre resserré)

## Périmètre retenu

**Dans ce WP :** modèle de segment minimal, 9 Learning Assets Nage-no-kata, clips logiques
YouTube, intégration aux leçons, 9 cartes typographiques, vidéo complète conservée en référence.

**Hors de ce WP, par décision du PO :** pagination serveur, écran d'administration de
segmentation, moteur générique de blocs en JSONB, migration intégrale de `lessonPremium.ts`.

---

# 1. Schéma de données minimal

Trois changements. Tous **additifs**, aucun destructif.

## 1.1 `media_sources` — la vidéo maîtresse

```sql
create table public.media_sources (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  titre         text not null,
  fournisseur   text not null default 'youtube',
  duree_seconds integer,
  created_at    timestamptz not null default now()
);
```

Une seule ligne au démarrage : la vidéo Kodokan (`bkhBZzE2HpM`, 1765 s). Si son URL change un
jour, **une ligne à corriger, pas neuf**.

## 1.2 Segment sur `catalogue_hazumi`

```sql
alter table public.catalogue_hazumi
  add column if not exists source_id        uuid references public.media_sources(id) on delete set null,
  add column if not exists segment_start_s  integer,
  add column if not exists segment_end_s    integer,
  add column if not exists ordre            integer;

alter table public.catalogue_hazumi
  add constraint catalogue_segment_coherent
  check (
    segment_end_s is null
    or segment_start_s is null
    or (segment_start_s >= 0 and segment_end_s > segment_start_s)
  );

create index if not exists catalogue_source_idx
  on public.catalogue_hazumi (source_id, segment_start_s);
```

`source_id NULL` = ressource classique. **Les 3 ressources existantes ne sont pas affectées.**

`ordre` sert la carte typographique — « 1ʳᵉ technique de la série ».

## 1.3 `asset_sections` — le socle Learning Asset, réduit au nécessaire

Le PO a validé le principe du Learning Asset mais exclu un moteur générique en JSONB. Le socle
minimal servant les 9 techniques est **une table étroite, en texte** :

```sql
create table public.asset_sections (
  id         uuid primary key default gen_random_uuid(),
  asset_id   uuid not null references public.catalogue_hazumi(id) on delete cascade,
  type       text not null check (type in ('fiche', 'points_attention', 'erreurs')),
  ordre      integer not null,
  titre      text,
  contenu    text not null,
  created_at timestamptz not null default now(),
  unique (asset_id, type, ordre)
);

create index if not exists asset_sections_asset_idx on public.asset_sections (asset_id, ordre);
```

**Trois types seulement**, contraints en base. Pas de JSONB, pas de moteur de rendu générique.

**Extensibilité sans refonte :** ajouter demain « variante de compétition » ou « échauffement »
demande une ligne de plus dans le `check`, pas une migration de structure.

**Ce qui n'est pas dupliqué :** le quiz reste dans `lesson_quiz`, les ressources associées dans
`parcours_ressources`. Les deux existent et fonctionnent.

## 1.4 Ce que le modèle donne

```
media_sources ── "Nage-no-kata — Kodokan" (bkhBZzE2HpM, 1765 s)
      ▲
      │ source_id
catalogue_hazumi
  ├── Nage-no-kata  (démonstration complète — aucun segment)   ← conservée
  ├── Uki-otoshi    (segment 1, ordre 1, Te-waza)   ─┐
  ├── Seoi-nage     (segment 2, ordre 2, Te-waza)    │  9 Learning Assets
  ├── …                                              │
  └── Uchi-mata     (segment 9, ordre 3, Ashi-waza) ─┘
        ▲
        │ asset_id
  asset_sections   fiche · points_attention · erreurs
```

---

# 2. Fichiers qui seront modifiés

## 2.1 Créés

| Fichier | Rôle |
|---|---|
| `supabase/migrations/2026…_micro_learning_segments.sql` | Les trois changements du §1 |
| `src/lib/segments.ts` | Résolution d'un clip : bornes → URL de lecture, durée, validation |
| `src/lib/__tests__/segments.test.ts` | TDD — bornes, cas limites |
| `src/lib/techniqueCards.ts` | Carte typographique : nom, famille, ordre, identité Hazumi |
| `src/lib/__tests__/techniqueCards.test.ts` | TDD — rendu déterministe, échappement |
| `scripts/seed-clips-nage-no-kata.ts` | Crée les 9 assets **à partir du tableau d'horodatages** |
| `PROJECT_HAZUMI/…/horodatages.md` | Tableau à remplir par le PO (§4) |

## 2.2 Modifiés

| Fichier | Modification | Risque |
|---|---|---|
| `src/lib/youtube.ts` | `youtubeEmbedUrl(url, start?, **end?**)` — paramètre optionnel ajouté | **Faible** — rétrocompatible, les appels existants ne changent pas |
| `src/lib/thumbnails.ts` | Un niveau inséré dans la chaîne : un clip utilise sa carte typographique | **Faible** — les autres niveaux sont inchangés |
| `src/pages/eleve/Lecon.tsx` | Si la ressource porte un segment, le lecteur démarre et s'arrête dessus | **Moyen** — c'est le seul changement de comportement du lecteur |
| `src/components/lesson/SeriesCard.tsx` | Le bouton « Comprendre cette technique » ouvre le clip | **Faible** |
| `PROJECT_HAZUMI/CURRENT_STATE.md`, `BACKLOG.md`, `domains/*` | Documentation | Nul |

## 2.3 Non touchés — explicitement

`src/pages/eleve/Bibliotheque.tsx` (pas de pagination), `Parcours.tsx`, `Progression.tsx`,
`Layout.tsx`, `App.tsx`, toute la messagerie, l'agenda et les entraînements.

**Aucun écran d'administration n'est créé.**

---

# 3. Impacts sur l'existant

| Sujet | Impact | Traitement |
|---|---|---|
| **3 ressources actuelles** | Aucun — `source_id NULL` = comportement inchangé | — |
| **Leçon Nage-no-kata** | La vidéo complète reste la ressource de référence, avec ses 12 chapitres et ses 15 questions | Conservée telle quelle |
| **283 tests existants** | Doivent rester verts | Vérifié à chaque étape |
| **`lessonPremium.ts`** | **Reste en place.** Les 9 `detail` alimenteront les `asset_sections` par le script de seed, mais **le fichier n'est pas supprimé** | Voir §5 — dette documentée |
| **Vignettes** | Un clip prend sa carte typographique ; les autres ressources gardent la chaîne du WP 1.3 | Non régressif |
| **Playlists** | Un clip est une ressource : il entre dans une playlist sans code supplémentaire | Aucun |
| **Bibliothèque** | Les 9 clips y apparaîtront comme ressources. **Décision requise** — voir §6 | À trancher |
| **Service worker** | Rafraîchissement forcé nécessaire après déploiement | Rappel en recette |

## Point de vigilance technique

Le paramètre `end` de l'iframe YouTube **arrête la lecture mais n'empêche pas de continuer
manuellement**. Le judoka verra le clip s'arrêter à la bonne seconde ; s'il relance, il poursuit
au-delà. Un arrêt strict demanderait l'API JavaScript YouTube — hors périmètre. À valider en
recette.

---

# 4. Tableau des neuf techniques

Fichier prévu : `PROJECT_HAZUMI/…/wp-01.4-micro-learning/horodatages.md`

**Aucune borne n'est préremplie**, conformément à la consigne.

| # | Technique | Série | Début | Fin |
|---|---|---|---:|---:|
| 1 | Uki-otoshi | Te-waza | à renseigner | à renseigner |
| 2 | Seoi-nage | Te-waza | à renseigner | à renseigner |
| 3 | Kata-guruma | Te-waza | à renseigner | à renseigner |
| 4 | Uki-goshi | Koshi-waza | à renseigner | à renseigner |
| 5 | Harai-goshi | Koshi-waza | à renseigner | à renseigner |
| 6 | Tsuri-komi-goshi | Koshi-waza | à renseigner | à renseigner |
| 7 | Okuri-ashi-harai | Ashi-waza | à renseigner | à renseigner |
| 8 | Sasae-tsurikomi-ashi | Ashi-waza | à renseigner | à renseigner |
| 9 | Uchi-mata | Ashi-waza | à renseigner | à renseigner |

**Format attendu :** `mm:ss` ou secondes. Contraintes contrôlées par le script de seed —
`fin > début`, bornes dans les 1765 s de la vidéo, pas de chevauchement entre techniques.

## Deux écarts de nommage à trancher

Le tableau du PO et `src/lib/lessonPremium.ts` divergent sur deux entrées :

| # | Tableau PO | `lessonPremium.ts` |
|---|---|---|
| 2 | **Seoi-nage** | **Ippon-seoi-nage** |
| 6 | **Tsuri-komi-goshi** | **Tsurikomi-goshi** |

Ces libellés serviront de titre de ressource et de carte typographique. **Je retiendrai
l'orthographe du tableau du PO**, sauf indication contraire — mais je le signale plutôt que de
choisir en silence.

---

# 5. Ce qui reste à migrer — dette documentée

Conformément à la décision « ne pas tout migrer », voici précisément ce qui **reste dans
`src/lib/lessonPremium.ts`** après ce WP :

| Contenu | Migré vers `asset_sections` ? |
|---|---|
| `detail.miseEnAction`, `kuzushi`, `tsukuri`, `kake` des 9 techniques | **Oui** — bloc `fiche` |
| `detail.uke` | **Oui** — bloc `points_attention` |
| `detail.erreur` | **Oui** — bloc `erreurs` |
| `pourquoi` (timeline, blocs historiques, principes illustrés) | **Non** — reste en dur |
| `jury` (7 critères) | **Non** |
| `reperes` (6 groupes) | **Non** |
| `regardExaminateur`, `aRetenir`, `conseilExpert` | **Non** |
| `meta`, `objectifs` | **Non** |

**Le fichier n'est donc pas supprimé.** Environ 70 % de son contenu reste en dur. À inscrire au
backlog : `HZ-907 — sortir le contenu premium restant du code`.

---

# 6. Décisions demandées avant implémentation

| # | Question | Défaut si vous ne tranchez pas |
|---|---|---|
| **D1** | Les 9 clips doivent-ils apparaître **dans la Bibliothèque** ? Ils y arriveraient en tant que ressources, portant le catalogue visible de 3 à 12 | **Oui, visibles** — ils sont des ressources d'apprentissage à part entière |
| **D2** | Orthographe retenue : **Seoi-nage** / **Tsuri-komi-goshi** (tableau PO) ou **Ippon-seoi-nage** / **Tsurikomi-goshi** (code actuel) ? | **Tableau du PO** |
| **D3** | La vidéo complète reste-t-elle **visible en Bibliothèque** en plus des clips ? | **Oui** — c'est la « démonstration complète » demandée |

---

# 7. Séquence d'exécution

Conforme à l'ordre retenu par le PO.

| Étape | Contenu | Dépend des horodatages |
|---|---|---|
| 1 | Migration : `media_sources`, colonnes de segment, `asset_sections` | Non |
| 2 | `src/lib/segments.ts` + tests (TDD) | Non |
| 3 | `src/lib/techniqueCards.ts` + tests (TDD) | Non |
| 4 | `youtubeEmbedUrl` : paramètre `end` | Non |
| 5 | Lecteur de leçon : lecture d'un segment | Non |
| 6 | **Seed des 9 clips** | **Oui** |
| 7 | Rattachement aux leçons et aux séries | Oui |
| 8 | Vérification mobile et desktop, recette | Oui |

**Les étapes 1 à 5 ne dépendent pas des horodatages.** Elles peuvent être livrées immédiatement
après votre validation de ce plan ; le seed des 9 clips suivra dès réception du tableau rempli.
