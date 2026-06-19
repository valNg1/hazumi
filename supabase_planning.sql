-- Planning des cours
create table if not exists cours (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  jour text not null, -- 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'
  heure_debut time not null,
  heure_fin time not null,
  intervenant text,
  categorie text, -- 'enfants','ados','adultes','tous'
  lieu text,
  created_at timestamptz default now()
);

alter table cours enable row level security;
create policy "Lecture cours" on cours for select using (true);
create policy "Gestion cours" on cours for all using (auth.role() = 'authenticated');

-- Séances d'entraînement (espace élève)
create table if not exists entrainements (
  id uuid primary key default gen_random_uuid(),
  judoka_id uuid references judokas(id) on delete cascade,
  date date not null,
  duree_minutes integer not null default 60,
  objectif text,
  feedback text,
  niveau_effort integer check (niveau_effort between 1 and 5),
  created_at timestamptz default now()
);

alter table entrainements enable row level security;
create policy "Lecture entrainements" on entrainements for select using (true);
create policy "Gestion entrainements" on entrainements for all using (auth.role() = 'authenticated');
