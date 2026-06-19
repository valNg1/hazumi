-- Judokas (profil élève)
create table if not exists judokas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null default '',
  belt text not null default 'blanche',
  club text,
  birth_date date,
  license_number text,
  license_expiry date,
  objectif text,
  created_at timestamptz default now(),
  unique(user_id)
);

alter table judokas enable row level security;

create policy "Lecture propre" on judokas for select using (auth.uid() = user_id);
create policy "Insertion propre" on judokas for insert with check (auth.uid() = user_id);
create policy "Mise à jour propre" on judokas for update using (auth.uid() = user_id);

-- Vue club : les membres du bureau peuvent lire tous les judokas
-- (à affiner avec une table clubs plus tard)
create policy "Club lecture tous" on judokas for select using (true);
