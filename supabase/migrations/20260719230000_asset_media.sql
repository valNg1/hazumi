-- WP 1.4 phase 2 — modele Learning Asset -> N medias.
--
-- Une ressource pedagogique (la technique) peut porter plusieurs medias :
-- demonstration, ralenti, vue arriere, analyse, erreur frequente, video complete.
-- Chaque media est un segment logique d'une source, avec son propre role.
--
-- Les trois colonnes de segment portees par catalogue_hazumi (phase 1) sont
-- supprimees : elles imposaient 1 ressource = 1 media. Aucune donnee n'est
-- perdue — elles n'ont jamais ete alimentees (0 ressource segmentee en prod).

create table if not exists public.asset_media (
  id              uuid primary key default gen_random_uuid(),
  asset_id        uuid not null references public.catalogue_hazumi(id) on delete cascade,
  source_id       uuid not null references public.media_sources(id)    on delete restrict,
  role            text not null check (role in (
                    'demonstration', 'ralenti', 'vue_arriere',
                    'analyse', 'erreur_frequente', 'complet')),
  segment_start_s integer,
  segment_end_s   integer,
  -- Un media principal par asset : celui que le lecteur ouvre par defaut.
  est_principal   boolean not null default false,
  ordre           integer not null default 0,
  titre           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint asset_media_segment_coherent check (
    segment_end_s is null or segment_start_s is null
    or (segment_start_s >= 0 and segment_end_s > segment_start_s)
  ),
  -- Un role donne n'apparait qu'une fois par asset.
  constraint asset_media_role_unique unique (asset_id, role)
);

-- Au plus un media principal par asset. L'index partiel garantit l'unicite
-- sans empecher un asset de n'avoir aucun principal explicite.
create unique index if not exists asset_media_principal_unique
  on public.asset_media (asset_id) where est_principal;

create index if not exists asset_media_asset_idx
  on public.asset_media (asset_id, ordre);

alter table public.asset_media enable row level security;

drop policy if exists asset_media_lecture on public.asset_media;
create policy asset_media_lecture on public.asset_media
  for select using (auth.role() = 'authenticated');

drop policy if exists asset_media_admin on public.asset_media;
create policy asset_media_admin on public.asset_media
  for all using (
    exists (select 1 from public.judokas where user_id = auth.uid() and role = 'admin')
  );

comment on table public.asset_media is
  'Medias d''une ressource pedagogique. Une technique -> N medias (roles). ON DELETE CASCADE.';
comment on column public.asset_media.est_principal is
  'Media ouvert par defaut par le lecteur. Au plus un par asset (index partiel).';

-- Retrait des colonnes de segment de la phase 1, desormais portees par asset_media.
alter table public.catalogue_hazumi drop constraint if exists catalogue_segment_coherent;
drop index if exists public.catalogue_source_idx;

alter table public.catalogue_hazumi
  drop column if exists source_id,
  drop column if exists segment_start_s,
  drop column if exists segment_end_s;

-- Conservees : `ordre` (rang de la technique dans sa serie) et `aliases`
-- (variantes de recherche) sont des proprietes de l'asset, pas du media.
