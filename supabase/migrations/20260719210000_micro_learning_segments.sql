-- WP 1.4 — Micro-learning : segments video logiques et socle Learning Asset.
--
-- Entierement additif. Aucune donnee existante n'est modifiee : une ressource
-- dont source_id est NULL conserve exactement son comportement actuel.

-- ── 1. La video maitresse ───────────────────────────────────────────────────
-- Une seule ligne par video source. Si son URL change, une ligne a corriger,
-- pas une par clip.
create table if not exists public.media_sources (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  titre         text not null,
  fournisseur   text not null default 'youtube',
  duree_seconds integer check (duree_seconds is null or duree_seconds > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.media_sources enable row level security;

drop policy if exists media_sources_lecture on public.media_sources;
create policy media_sources_lecture on public.media_sources
  for select using (auth.role() = 'authenticated');

drop policy if exists media_sources_admin on public.media_sources;
create policy media_sources_admin on public.media_sources
  for all using (
    exists (select 1 from public.judokas where user_id = auth.uid() and role = 'admin')
  );

-- ── 2. Le segment porte par la ressource ────────────────────────────────────
alter table public.catalogue_hazumi
  add column if not exists source_id       uuid references public.media_sources(id) on delete set null,
  add column if not exists segment_start_s integer,
  add column if not exists segment_end_s   integer,
  add column if not exists ordre           integer,
  -- Variantes orthographiques, pour que la recherche trouve la ressource sans
  -- creer de doublon : le nom affiche reste unique et canonique.
  add column if not exists aliases         text[];

alter table public.catalogue_hazumi
  drop constraint if exists catalogue_segment_coherent;

alter table public.catalogue_hazumi
  add constraint catalogue_segment_coherent
  check (
    segment_end_s is null
    or segment_start_s is null
    or (segment_start_s >= 0 and segment_end_s > segment_start_s)
  );

create index if not exists catalogue_source_idx
  on public.catalogue_hazumi (source_id, segment_start_s);

-- ── 3. Socle Learning Asset, reduit au necessaire ───────────────────────────
-- Trois types seulement, contraints en base. Volontairement du texte, pas du
-- JSONB : ce WP ne construit pas de moteur generique.
--
-- ATTENTION : ajouter un type exigera une migration modifiant ce CHECK.
-- C'est un compromis assume pour ce socle minimal.
create table if not exists public.asset_sections (
  id         uuid primary key default gen_random_uuid(),
  asset_id   uuid not null references public.catalogue_hazumi(id) on delete cascade,
  type       text not null check (type in ('fiche', 'points_attention', 'erreurs')),
  ordre      integer not null check (ordre >= 0),
  titre      text,
  contenu    text not null check (length(trim(contenu)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Ordre deterministe et pas de doublon de position au sein d'un type.
  constraint asset_sections_position_unique unique (asset_id, type, ordre)
);

create index if not exists asset_sections_asset_idx
  on public.asset_sections (asset_id, type, ordre);

alter table public.asset_sections enable row level security;

drop policy if exists asset_sections_lecture on public.asset_sections;
create policy asset_sections_lecture on public.asset_sections
  for select using (auth.role() = 'authenticated');

drop policy if exists asset_sections_admin on public.asset_sections;
create policy asset_sections_admin on public.asset_sections
  for all using (
    exists (select 1 from public.judokas where user_id = auth.uid() and role = 'admin')
  );

comment on table public.asset_sections is
  'Sections pedagogiques d''une ressource. ON DELETE CASCADE : aucune section orpheline.';
comment on column public.catalogue_hazumi.segment_start_s is
  'Debut du segment en secondes. NULL = ressource non segmentee.';
comment on column public.catalogue_hazumi.aliases is
  'Variantes orthographiques pour la recherche. Le titre reste le nom canonique.';
