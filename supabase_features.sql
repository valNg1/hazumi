-- Compétitions
create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  date date not null,
  lieu text,
  categorie text,
  niveau text,
  notes text,
  created_at timestamptz default now()
);
alter table competitions enable row level security;
create policy "Lecture competitions" on competitions for select using (true);
create policy "Gestion competitions" on competitions for all using (auth.role() = 'authenticated');

-- Bureau (CR, AG)
create table if not exists bureau_cr (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  date date not null,
  type text not null default 'Réunion de bureau',
  contenu text,
  created_at timestamptz default now()
);
alter table bureau_cr enable row level security;
create policy "Lecture bureau" on bureau_cr for select using (auth.role() = 'authenticated');
create policy "Gestion bureau" on bureau_cr for all using (auth.role() = 'authenticated');

-- Séances d'entraînement
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

-- Planning des cours
create table if not exists cours (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  jour text not null,
  heure_debut time not null,
  heure_fin time not null,
  intervenant text,
  categorie text,
  lieu text,
  created_at timestamptz default now()
);
alter table cours enable row level security;
create policy "Lecture cours" on cours for select using (true);
create policy "Gestion cours" on cours for all using (auth.role() = 'authenticated');
