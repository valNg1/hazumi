# Validation d'architecture — plusieurs médias pour une même ressource

- **Auteur :** Lead Full Stack — Claude Code
- **Date :** 2026-07-19
- **Objet :** vérifier que le modèle livré en phase 1 supporte *1 ressource → N médias*
- **Demande :** validation d'architecture uniquement, **aucune implémentation**

## Réponse directe

**Non. Le modèle livré ne le permet pas en l'état.**

Les colonnes de segment sont portées **par la ressource elle-même** :

```sql
alter table public.catalogue_hazumi
  add column source_id       uuid references media_sources(id),
  add column segment_start_s integer,
  add column segment_end_s   integer;
```

Une ligne de `catalogue_hazumi` ne peut donc porter **qu'un seul** couple
(source, bornes). Le rapport *1 ressource → 1 segment* n'est pas une convention
d'usage : il est **inscrit dans la structure**.

Votre intuition est exacte, et c'est bien une limitation.

## Ce qui rend cette limitation peu coûteuse aujourd'hui

C'est le point déterminant : **rien n'utilise encore ces colonnes en production.**

| Table | Lignes |
|---|---|
| `media_sources` | **0** |
| `asset_sections` | **0** |
| `catalogue_hazumi` avec un segment | **0** sur 3 ressources |

La phase 1 a livré le socle sans créer la moindre donnée. Corriger la structure
**maintenant** ne demande aucune migration de données, aucune reprise, aucun
risque de régression.

**Cette fenêtre se referme dès que les neuf clips seront créés.** À partir de
là, la même correction exigera de migrer neuf lignes et de réécrire le script
de seed. Ce n'est pas dramatique — mais c'est gratuit aujourd'hui, et payant
demain.

## Modèle cible

Une table de liaison, qui remplace les trois colonnes :

```sql
create table public.asset_media (
  id              uuid primary key default gen_random_uuid(),
  asset_id        uuid not null references public.catalogue_hazumi(id) on delete cascade,
  source_id       uuid not null references public.media_sources(id)    on delete restrict,
  role            text not null check (role in (
                    'demonstration', 'ralenti', 'vue_arriere',
                    'analyse', 'erreur_frequente', 'complet')),
  segment_start_s integer,
  segment_end_s   integer,
  ordre           integer not null default 0,
  titre           text,
  created_at      timestamptz not null default now(),
  constraint asset_media_segment_coherent check (
    segment_end_s is null or segment_start_s is null
    or (segment_start_s >= 0 and segment_end_s > segment_start_s)
  ),
  constraint asset_media_role_unique unique (asset_id, role)
);

create index on public.asset_media (asset_id, ordre);
```

Ce que cela donne :

```
Uki-otoshi  (1 Learning Asset — la technique)
  ├── média · démonstration     source A, 01:23 → 01:41
  ├── média · ralenti           source B, 00:12 → 00:38
  ├── média · vue arrière       source C, 00:04 → 00:29
  └── média · erreur fréquente  source D, 02:10 → 02:31
  │
  └── asset_sections            fiche · points d'attention · erreurs
```

La fiche, les points d'attention et les erreurs restent attachés **une seule
fois**, à la technique. Seuls les angles de vue se multiplient.

## Ce que cela ne remet pas en cause

Les principes que vous aviez validés tiennent intégralement :

| Principe validé | Statut |
|---|---|
| Un clip est une ressource Hazumi | **Tient** — la ressource devient la *technique*, ses médias en sont les vues |
| Séparation `media_sources` / catalogue | **Tient** — elle devient même plus utile : quatre vidéos, quatre sources, un asset |
| Aucune duplication de vidéo | **Tient** — segmentation toujours logique |
| Migration additive | **Tient** — `asset_media` est une création, pas une refonte |
| `asset_sections` | **Inchangée** — elle pointe déjà sur l'asset, pas sur le média |
| Réutilisation N-N via `parcours_ressources` | **Inchangée** |

Le code applicatif est peu touché : `src/lib/segments.ts` opère sur des bornes,
pas sur leur emplacement de stockage. Seule la lecture change — `Lecon.tsx`
choisirait le média de rôle `demonstration` par défaut, les autres devenant des
vues alternatives.

## La vraie question de conception, que je préfère poser

Un ralenti d'Uki-otoshi est-il :

- **(a)** un **média** de la ressource « Uki-otoshi » — c'est le modèle ci-dessus ;
- **(b)** une **ressource distincte**, cherchable et ajoutable à une playlist indépendamment ?

**Je recommande (a)**, pour une raison pédagogique : la fiche, les points
d'attention et les erreurs fréquentes appartiennent à la **technique**, pas à un
angle de caméra. En choisissant (b), il faudrait soit dupliquer ce contenu sur
chaque angle, soit inventer un lien entre eux — ce qui reviendrait à (a) par un
chemin plus long.

(a) n'interdit rien : un `asset_media` porte un `titre` et un `role`, donc reste
adressable et affichable individuellement si le besoin apparaît.

## Ce que je recommande

**Créer `asset_media` avant le seed des neuf clips**, et retirer les trois
colonnes de segment de `catalogue_hazumi`.

C'est une migration additive de quelques lignes, sans donnée à reprendre, qui
supprime définitivement la limitation que vous avez identifiée. Le script de
seed sera écrit directement contre le bon modèle.

Si vous préférez livrer les neuf clips d'abord et corriger ensuite, c'est
tenable — la dette est modeste et je la documenterais. Mais l'ordre inverse
coûte moins cher.

**Aucune implémentation n'a été faite. J'attends votre décision.**
