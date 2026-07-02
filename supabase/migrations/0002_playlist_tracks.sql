create table if not exists public.playlist_tracks (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  artist           text not null,
  audio_path       text not null,
  duration_seconds integer,
  sort_order       integer not null default 0,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists playlist_tracks_published_idx on public.playlist_tracks (is_published);
create index if not exists playlist_tracks_sort_idx on public.playlist_tracks (sort_order, created_at);

alter table public.playlist_tracks enable row level security;

drop policy if exists "playlist_tracks: public read published" on public.playlist_tracks;
create policy "playlist_tracks: public read published"
  on public.playlist_tracks for select
  to anon, authenticated
  using (is_published = true);

insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('music', 'music', true, array['audio/mpeg', 'audio/mp3', 'audio/wav'], 20971520)
on conflict (id) do update
set public = excluded.public,
    allowed_mime_types = excluded.allowed_mime_types,
    file_size_limit = excluded.file_size_limit;
