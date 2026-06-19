-- Playlists du judoka
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  judoka_id uuid references judokas(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table playlists enable row level security;
create policy "Lecture propre" on playlists for select using (
  judoka_id in (select id from judokas where user_id = auth.uid())
);
create policy "Insertion propre" on playlists for insert with check (
  judoka_id in (select id from judokas where user_id = auth.uid())
);
create policy "Mise à jour propre" on playlists for update using (
  judoka_id in (select id from judokas where user_id = auth.uid())
);
create policy "Suppression propre" on playlists for delete using (
  judoka_id in (select id from judokas where user_id = auth.uid())
);

-- Items d'une playlist (vidéo du club OU URL externe)
create table if not exists playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  video_id uuid references videos(id) on delete set null,
  external_url text,
  external_title text,
  position int not null default 0,
  created_at timestamptz default now()
);

alter table playlist_items enable row level security;
create policy "Lecture propre" on playlist_items for select using (
  playlist_id in (
    select p.id from playlists p
    join judokas j on j.id = p.judoka_id
    where j.user_id = auth.uid()
  )
);
create policy "Insertion propre" on playlist_items for insert with check (
  playlist_id in (
    select p.id from playlists p
    join judokas j on j.id = p.judoka_id
    where j.user_id = auth.uid()
  )
);
create policy "Suppression propre" on playlist_items for delete using (
  playlist_id in (
    select p.id from playlists p
    join judokas j on j.id = p.judoka_id
    where j.user_id = auth.uid()
  )
);
