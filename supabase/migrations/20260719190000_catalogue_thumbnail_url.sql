-- Vignette explicite d'une ressource.
--
-- Le pipeline derive normalement la vignette de l'URL (YouTube, Vimeo, Drive,
-- Docs) ou, a defaut, de la video de la lecon rattachee. Cette colonne offre le
-- dernier maillon qui manquait : pouvoir fixer manuellement une vignette quand
-- aucune derivation n'est possible (PDF, document, ressource sans media).
--
-- NULL = derivation automatique. Renseignee = priorite absolue.
alter table public.catalogue_hazumi
  add column if not exists thumbnail_url text;

comment on column public.catalogue_hazumi.thumbnail_url is
  'Vignette explicite. NULL = derivee automatiquement par src/lib/thumbnails.ts';
