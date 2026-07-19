-- Un evenement personnel peut etre annule : il sort de l'agenda sans etre perdu,
-- et reste restaurable depuis l'option "Afficher les annules".
alter table public.evenements
  add column if not exists statut text not null default 'planifie';

alter table public.evenements
  drop constraint if exists evenements_statut_check;

alter table public.evenements
  add constraint evenements_statut_check
  check (statut in ('planifie', 'annule'));

create index if not exists evenements_judoka_statut_idx
  on public.evenements (judoka_id, statut);
