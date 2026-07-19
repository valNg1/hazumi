-- Une ressource du catalogue peut etre retiree de la Bibliotheque sans etre
-- supprimee : elle reste utilisable dans les parcours et les lecons.
-- Reversible : il suffit de repasser le drapeau a true.
alter table public.catalogue_hazumi
  add column if not exists visible_bibliotheque boolean not null default true;

create index if not exists catalogue_hazumi_visible_idx
  on public.catalogue_hazumi (visible_bibliotheque);
