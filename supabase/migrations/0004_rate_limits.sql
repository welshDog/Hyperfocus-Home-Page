-- 0004_rate_limits: shared, atomic rate-limit counters.
-- Strictly additive. Replaces the per-instance in-memory limiter as the primary
-- gate (lib/rateLimit.ts falls back to memory if this RPC is missing/erroring,
-- so the app can deploy before or after this migration is applied).
--
-- Fixed-window counter: one row per (key, window). The upsert is a single
-- atomic statement, so concurrent serverless instances cannot under-count.

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

-- Server-only table: RLS on, no policies, and no grants to API roles.
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from public, anon, authenticated;

-- Returns true when the call is allowed, false when over the limit.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200
     or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  -- Opportunistic cleanup (~1% of calls) keeps the table small.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

-- Callable ONLY with the service-role key. The anon key must not be able to
-- invoke it: otherwise anyone could burn another visitor's budget by guessing
-- their key. (REVOKE FROM PUBLIC is required: Postgres grants EXECUTE to
-- PUBLIC by default, which anon/authenticated inherit.)
revoke all on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
