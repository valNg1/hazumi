create table if not exists seances (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid references cours(id) on delete set null,
  titre text not null,
  date date not null,
  heure_debut time,
  heure_fin time,
  duree_minutes int not null default 90,
  categorie text,
  lieu text,
  intervenant text,
  notes text,
  created_at timestamptz default now()
);

alter table seances enable row level security;
create policy "Lecture seances" on seances for select using (auth.role() = 'authenticated');
create policy "Insertion seances" on seances for insert with check (auth.role() = 'authenticated');
create policy "Modification seances" on seances for update using (auth.role() = 'authenticated');
create policy "Suppression seances" on seances for delete using (auth.role() = 'authenticated');

create table if not exists presences (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid references seances(id) on delete cascade,
  judoka_id uuid references judokas(id) on delete cascade,
  confirme_a timestamptz default now(),
  unique(seance_id, judoka_id)
);

alter table presences enable row level security;
create policy "Lecture presences" on presences for select using (auth.role() = 'authenticated');
create policy "Insertion presences" on presences for insert with check (
  judoka_id in (select id from judokas where user_id = auth.uid())
);
create policy "Suppression presences" on presences for delete using (
  judoka_id in (select id from judokas where user_id = auth.uid())
);
