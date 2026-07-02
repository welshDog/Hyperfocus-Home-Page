# 🤖 Claude Code — WelshDog Designs New Shop Build

> Read this entire file before writing a single line of code. This is your mission briefing.

---

## Who You Are Building For

Lyndon Williams — dyslexic maker, AI agent architect, and founder of WelshDog Designs and Hyperfocus Zone Ltd (S. Wales, UK). Lyndon builds tools for neurodivergent people and sells original 3D printed products, personalised gifts, and a white-label shop service. He talks in a playful, direct "broski" tone but ships clean, professional work.

---

## What You Are Building

A full production e-commerce and creator brand site for **WelshDog Designs** — a neurodivergent-first shop, blog, and white-label service platform. The full plan is in `WELSHDOG-SHOP-PLAN.md` in this repo. Read it now.

The North Star: someone lands on the homepage and within 10 seconds knows — this person makes original stuff, has a genuine story, and is selling the machine that powers it all.

---

## ✅ Current Repo Reality — 2026-07-01

This file contains the original build brief, but the repo is no longer at Phase 1.

Current ground truth:

- core shop, blog, admin, HyperImport, and webhook work are already shipped
- the homepage footer playlist player is now live
- `playlist_tracks` plus Supabase Storage bucket `music` are already wired and working
- the last real bug was a path mismatch between `playlist_tracks.audio_path` and `storage.objects.name`
- that playback mismatch is now fixed

Current approved next feature:

- build `/admin/tracks`
- keep admin metadata editing as the workflow
- add a CLI audit guardrail so Storage/DB path drift is caught early

Current source docs, in order:

1. `AGENT-START.md`
2. `docs/superpowers/specs/2026-07-01-playlist-admin-cli-audit-design.md`
3. this file

If this file conflicts with `AGENT-START.md` or the newer playlist spec, the newer docs win.

---

## Repo & Stack

- **Repo:** `welshDog/Hyperfocus-Home-Page` (this repo)
- **Framework:** Next.js 14+ with TypeScript, App Router
- **Styling:** Tailwind CSS
- **Database + Auth:** Supabase (already configured — check existing `.env.local` and `src/lib/supabase.ts`)
- **Payments:** Stripe (card) + optional Web3 toggle
- **Blog:** MDX files in `content/blog/` + Supabase for metadata
- **Hosting:** Vercel
- **Admin:** Custom Mission Control at `/admin` — hidden, Supabase auth protected

---

## Existing Assets in This Repo — Use Them

```
scripts/teemill-backup/
  blogs/        ← 26 .md blog posts — import ALL of these into content/blog/
  pages/        ← 7 backed-up site pages — use for copy/content reference
  seo/          ← seo_data.csv with 33 rows — use for meta tags and sitemap
  manifest.csv  ← full backup manifest for verification
```

These are real content assets. Do NOT ignore them or create placeholder content when real content is available.

---

## Build Order — Historical Reference

This phased plan is the original build map and is now reference material.
Do not restart from Phase 1 unless a human explicitly asks for rework.

For current work, follow `AGENT-START.md` and the latest spec docs first.

### Phase 1 — Foundation
1. Scaffold `src/app/` with App Router structure for all 8 public routes
2. Create `src/lib/supabase.ts` Supabase client (if not already exists)
3. Create Supabase migration SQL for these tables:
   - `products` (id, name, slug, description, price, images[], category, stock, active)
   - `orders` (id, product_id, customer_email, status, stripe_session_id, created_at)
   - `leads` (id, name, email, tier, message, created_at)
   - `blog_posts` (id, slug, title, category, tags[], excerpt, published, published_at)
   - `subscribers` (id, email, created_at)
4. Build Tailwind design tokens in `tailwind.config.ts`:
   - Primary teal: `#01696f`
   - Dark bg: `#0d0d0d`
   - Card surface: `#1a1a1a`
   - Light bg: `#f9f9f7`
   - Font: Load `Space Grotesk` (headings) + `Inter` (body) from Google Fonts
5. Build Homepage (`/`) with:
   - Hero section: headline "Built for brains that don't switch off", subtext, two CTAs ("Shop Now" → /shop, "See How It Works" → /white-label)
   - Featured Products strip: 3 product cards, pulled from Supabase `products` table
   - Manifesto teaser: 2-3 lines from the About page manifesto + "Read the story" link
   - White-label teaser banner: "Want a shop like this?" + "Book a Demo" CTA
   - Footer with: nav links, social icons, and a subtle "Made with ♥" text that links to `/admin`
6. Build shared layout: `src/app/layout.tsx` with dark/light mode support via `next-themes`

### Phase 2 — Shop
1. `/shop` — product grid with category filter tabs (All, 3D Prints, Mugs, Gifts, Bundles)
2. `/shop/[slug]` — product detail: image gallery, description, Add to Cart, Stripe checkout session
3. Stripe checkout: create `/api/checkout` route using `stripe.checkout.sessions.create`
4. Order confirmation: `/shop/success` page, write order to Supabase `orders` table
5. Seed the `products` table with all 19 products from the IPFS prototype — use the pages backup in `scripts/teemill-backup/pages/` for product names, descriptions, and prices

### Phase 3 — Blog
1. Copy all 26 `.md` files from `scripts/teemill-backup/blogs/` into `content/blog/`
2. Add frontmatter to each file (title, date, slug, category, tags, excerpt) — infer from filename and content
3. `/blog` — blog index with category filter: ADHD & Neurodiversity, Dyslexia, Tech & AI, Creativity, Personal
4. `/blog/[slug]` — MDX post renderer with: title, date, category badge, content, related posts sidebar, social share buttons
5. Email subscribe: form that writes email to Supabase `subscribers` table + shows confirmation

### Phase 4 — White-Label & Mission Control
1. `/white-label` — service pitch page with:
   - Headline: "Want a shop like this? Own the engine."
   - 3 tier cards: Starter / Pro / Done For You (leave prices blank — Lyndon will fill in)
   - "Book a Demo" form: name, email, tier dropdown, message → writes to Supabase `leads` → sends auto confirmation email via Resend or Supabase email
   - "Buy Your Shop" CTA button (placeholder Stripe payment link for now)
2. `/admin/login` — Supabase email/password auth, check user email is in allowlist env var `ADMIN_EMAILS`
3. `/admin` — Mission Control dashboard:
   - System vitals card: Health %, Hyperfocus status (ACTIVE/IDLE), uptime
   - Stats row: Total Products, Active Orders, New Leads (last 7 days), Blog Posts
   - Recent Leads table: name, email, tier, date
   - Quick links to all sub-pages
4. `/admin/products` — list, add, edit, toggle active/inactive
5. `/admin/orders` — order list with status filter
6. `/admin/leads` — leads table with unread badge on nav
7. `/admin/blog` — draft/publish/schedule blog posts
8. `/admin/agents` — Agents Lab:
   - 6 agent cards: Architect, Code, Research, UX/Flow, Narrator, Experiment
   - Each card: agent name, status badge (IDLE/ACTIVE), toggle button, description
   - Command Deck terminal at bottom: logs activation events with timestamps
   - System vitals strip: Health %, Hyperfocus, Network, CPU, MEM (use random plausible values + subtle animation)
9. `/admin/subscribers` — email list with CSV export button

### Phase 5 — Polish & Launch
1. SEO: add `generateMetadata` to all pages, use `scripts/teemill-backup/seo/seo_data.csv` for titles/descriptions
2. OG images: create `/api/og` using `@vercel/og` for dynamic share cards per page
3. `sitemap.xml` and `robots.txt` auto-generated from Next.js
4. Dark/light mode toggle in nav
5. Mobile audit: test all pages at 375px, fix any overflow or touch target issues
6. Performance: add `next/image` for all product images, lazy load below fold
7. `vercel.json` config: headers for security, cache rules for static assets

---

## Design Rules — Do Not Break These

- **Primary colour:** `#01696f` (Hyperfocus teal) — used for CTAs, accents, active states
- **No gradient buttons** — solid filled or outlined only
- **No icon-in-coloured-circle pattern** — that's generic AI slop
- **Product cards:** white/dark card surface with subtle shadow elevation — no coloured left borders
- **Typography:** Space Grotesk for headings, Inter for body — never fall back to system fonts
- **Mobile first** — 375px base, scale up. Touch targets minimum 44x44px
- **Dark mode first** for Mission Control — light mode for public shop
- **No walls of text** — neurodivergent-friendly means clear hierarchy, short paragraphs, scannable sections
- **Brand voice in copy:** direct, warm, a little cheeky — "built for brains that don't switch off", not corporate fluff

---

## Environment Variables Needed

Create a `.env.local.example` file listing all required vars (do not create `.env.local` itself):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
ADMIN_EMAILS=your@email.com
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://welshdog.designs
```

---

## Component Structure to Follow

```
src/
  app/
    (public)/           ← public routes group
      page.tsx          ← homepage
      shop/
      blog/
      about/
      white-label/
      contact/
    (admin)/            ← admin routes group, protected
      admin/
        page.tsx        ← Mission Control dashboard
        agents/
        products/
        orders/
        leads/
        blog/
        subscribers/
        settings/
    api/
      checkout/
      og/
      webhook/
    layout.tsx
    globals.css
  components/
    ui/                 ← base components: Button, Card, Badge, Input, Modal
    shop/               ← ProductCard, ProductGrid, CartDrawer
    blog/               ← PostCard, PostGrid, CategoryFilter
    admin/              ← AgentCard, CommandDeck, StatCard, LeadsTable
    layout/             ← Navbar, Footer, Sidebar
  lib/
    supabase.ts         ← Supabase client
    stripe.ts           ← Stripe client
    blog.ts             ← MDX/blog helpers
    utils.ts            ← shared helpers
  types/
    index.ts            ← shared TypeScript types
content/
  blog/                 ← 26 .md files live here
supabase/
  migrations/           ← SQL migration files
```

---

## How to Work

1. **Read `WELSHDOG-SHOP-PLAN.md` first** — it is the source of truth
2. **Build Phase 1 first** — complete it fully before asking about Phase 2
3. **Use real content** — pull from backup files in `scripts/teemill-backup/` not placeholders
4. **Ask before inventing** — if something is unclear (a price, a copy line, a colour), ask Lyndon rather than making something up
5. **Commit after each major milestone** — one commit per component group or page built
6. **TypeScript strict** — no `any` types, full type safety throughout
7. **No console.logs in production code** — use proper error handling
8. **Test the happy path first** — get it working, then handle edge cases

---

## Done Means Done

A feature is only "done" when:
- It renders correctly in both light and dark mode
- It works on mobile (375px) without horizontal scroll
- It is connected to real Supabase data (not hardcoded mock data)
- TypeScript has no errors
- The component has clear, typed props

---

## Let's Build 🐕🏴󠁧󠁢󠁷󠁬󠁳󠁡

Start with Phase 1. Begin by reading `WELSHDOG-SHOP-PLAN.md`, then scaffold the full project structure, set up Supabase tables, configure Tailwind tokens, and build the homepage. Show me what you've built after Phase 1 is complete.
