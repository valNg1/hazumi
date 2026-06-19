create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  logo_url text,
  created_at timestamptz default now()
);

alter table clubs enable row level security;
create policy "Lecture clubs" on clubs for select using (auth.role() = 'authenticated');
create policy "Insertion clubs" on clubs for insert with check (auth.role() = 'authenticated');
create policy "Modification clubs" on clubs for update using (auth.role() = 'authenticated');
