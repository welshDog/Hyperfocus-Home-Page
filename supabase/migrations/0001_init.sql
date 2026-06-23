-- WelshDog Designs — Phase 1 schema
-- Tables: products, orders, leads, blog_posts, subscribers
-- RLS: public can read active products + published posts, and submit
--      leads/subscribers. Orders are writable by service-role only.

create extension if not exists pgcrypto;

-- ───────────────────────────── products ─────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  price       numeric(10,2) not null default 0 check (price >= 0),
  images      text[]      not null default '{}',
  category    text        not null default 'Gifts',
  stock       integer     not null default 0 check (stock >= 0),
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists products_active_idx on public.products (active);
create index if not exists products_category_idx on public.products (category);

-- ────────────────────────────── orders ──────────────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid references public.products (id) on delete set null,
  customer_email    text        not null,
  status            text        not null default 'pending'
                      check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  stripe_session_id text unique,
  created_at        timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders (status);

-- ────────────────────────────── leads ───────────────────────────────
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  tier       text,
  message    text,
  created_at timestamptz not null default now()
);

-- ──────────────────────────── blog_posts ────────────────────────────
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  title        text        not null,
  category     text,
  tags         text[]      not null default '{}',
  excerpt      text,
  published    boolean     not null default false,
  published_at timestamptz
);
create index if not exists blog_posts_published_idx on public.blog_posts (published);

-- ──────────────────────────── subscribers ───────────────────────────
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────── RLS ────────────────────────────────
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.leads      enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscribers enable row level security;

-- Public read of active products
drop policy if exists "products: public read active" on public.products;
create policy "products: public read active"
  on public.products for select
  using (active = true);

-- Public read of published posts
drop policy if exists "blog_posts: public read published" on public.blog_posts;
create policy "blog_posts: public read published"
  on public.blog_posts for select
  using (published = true);

-- Public can submit a white-label lead (insert only, no read-back)
drop policy if exists "leads: public insert" on public.leads;
create policy "leads: public insert"
  on public.leads for insert
  with check (true);

-- Public can subscribe (insert only)
drop policy if exists "subscribers: public insert" on public.subscribers;
create policy "subscribers: public insert"
  on public.subscribers for insert
  with check (true);

-- orders: no public policies — service-role key bypasses RLS for
-- checkout/fulfilment writes from server routes.
