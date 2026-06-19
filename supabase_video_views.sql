create table if not exists video_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  video_id uuid references videos(id) on delete cascade,
  viewed_at timestamptz default now(),
  unique(user_id, video_id)
);

alter table video_views enable row level security;
create policy "Lecture propre" on video_views for select using (auth.uid() = user_id);
create policy "Insertion propre" on video_views for insert with check (auth.uid() = user_id);
create policy "Suppression propre" on video_views for delete using (auth.uid() = user_id);
