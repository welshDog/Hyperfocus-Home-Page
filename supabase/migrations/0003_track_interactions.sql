-- 0003_track_interactions: public likes, comments, and play counts for playlist tracks.
-- Strictly additive — only FKs touch existing tables.

-- ── track_likes: reads public, writes ONLY via toggle_track_like() ──
create table if not exists public.track_likes (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.playlist_tracks(id) on delete cascade,
  anon_id uuid not null,
  created_at timestamptz not null default now(),
  unique (track_id, anon_id)
);

alter table public.track_likes enable row level security;

drop policy if exists "track_likes: public read" on public.track_likes;
create policy "track_likes: public read"
  on public.track_likes for select
  to anon, authenticated
  using (true);
-- No insert/update/delete policies: all writes go through toggle_track_like().

-- ── track_comments: public read non-hidden; anon insert on published tracks ──
create table if not exists public.track_comments (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.playlist_tracks(id) on delete cascade,
  anon_id uuid not null,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 1 and 1000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists track_comments_track_idx
  on public.track_comments (track_id, created_at desc);
create index if not exists track_comments_anon_idx
  on public.track_comments (anon_id, created_at desc);

alter table public.track_comments enable row level security;

drop policy if exists "track_comments: public read visible" on public.track_comments;
create policy "track_comments: public read visible"
  on public.track_comments for select
  to anon, authenticated
  using (is_hidden = false);

drop policy if exists "track_comments: anon insert" on public.track_comments;
create policy "track_comments: anon insert"
  on public.track_comments for insert
  to anon, authenticated
  with check (
    is_hidden = false
    and exists (
      select 1 from public.playlist_tracks t
      where t.id = track_id and t.is_published = true
    )
  );
-- No update/delete policies for anon; admin moderation uses the service role.

-- ── track_stats: play counts; writes ONLY via increment_track_play() ──
create table if not exists public.track_stats (
  track_id uuid primary key references public.playlist_tracks(id) on delete cascade,
  play_count bigint not null default 0
);

alter table public.track_stats enable row level security;

drop policy if exists "track_stats: public read" on public.track_stats;
create policy "track_stats: public read"
  on public.track_stats for select
  to anon, authenticated
  using (true);

-- ── RPCs ──
create or replace function public.toggle_track_like(p_track_id uuid, p_anon_id uuid)
returns table (liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted int;
begin
  if not exists (
    select 1 from public.playlist_tracks
    where id = p_track_id and is_published = true
  ) then
    raise exception 'track not found' using errcode = 'P0002';
  end if;

  delete from public.track_likes
    where track_id = p_track_id and anon_id = p_anon_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    insert into public.track_likes (track_id, anon_id)
      values (p_track_id, p_anon_id)
      on conflict (track_id, anon_id) do nothing;
    liked := true;
  else
    liked := false;
  end if;

  select count(*) into like_count
    from public.track_likes where track_id = p_track_id;
  return next;
end;
$$;

create or replace function public.increment_track_play(p_track_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.track_stats (track_id, play_count)
  select id, 1 from public.playlist_tracks
    where id = p_track_id and is_published = true
  on conflict (track_id) do update
    set play_count = public.track_stats.play_count + 1;
$$;

revoke execute on function public.toggle_track_like(uuid, uuid) from public;
revoke execute on function public.increment_track_play(uuid) from public;
grant execute on function public.toggle_track_like(uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.increment_track_play(uuid) to anon, authenticated, service_role;

-- ── aggregate view for public pages (runs under the caller's RLS) ──
create or replace view public.track_public_stats
with (security_invoker = true) as
select
  t.id as track_id,
  coalesce(l.cnt, 0)::bigint as like_count,
  coalesce(c.cnt, 0)::bigint as comment_count,
  coalesce(s.play_count, 0)  as play_count
from public.playlist_tracks t
left join (
  select track_id, count(*) cnt from public.track_likes group by 1
) l on l.track_id = t.id
left join (
  select track_id, count(*) cnt from public.track_comments
  where is_hidden = false group by 1
) c on c.track_id = t.id
left join public.track_stats s on s.track_id = t.id
where t.is_published = true;

grant select on public.track_public_stats to anon, authenticated;
