# 🐕 AGENT-START.md — WelshDog Designs

## Boot file for Claude Code & all AI agents

**Repo:** welshDog/Hyperfocus-Home-Page
**Live site:** https://welshdog.shop
**Stack:** Next.js 15.5.19 (App Router) / Supabase / Vercel / Docker (standalone)
**Branch:** main
**Owner:** Lyndon Williams — Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁥
**Tone:** Neurodivergent-first. Playful. Honest. Zero corporate fluff.

---

## 🧠 What This Repo Is

WelshDog Designs — a neurodivergent-first shop, blog, music page, and
white-label service platform. Built for brains that don't switch off.

Four lanes:

1. **Shop** — 3D prints, mugs, gifts, bundles, apparel (Supabase `products`)
2. **Blog** — honest writing on ADHD, dyslexia, creativity, tech
3. **Music** — `/music` page: footer player + likes / comments / play counts
4. **White-label** — the full shop engine, available for others to own

Admin ("Mission Control") lives under the `(admin)` route group — see
[Key Files](#-key-files--folders) for the real on-disk path.

---

## ✅ GROUND TRUTH — verified live 2026-09-06

> This replaces the old 2026-07 session handoff. Checked against the live
> Supabase project `jnrkrnzeqeupjumkvobz` and the deployed site.

### The shop is live and populated — it is NOT a placeholder

- **46 products in the DB** — 37 active, 9 inactive drafts
- All **27 apparel items** (caps, hoodies, tees, "Mug of Tee" range) are
  imported and active, priced £19–£45
- The original 19 lines (3D prints, mugs, gifts, bundles) are in with real
  £ prices (£4.99–£31.99)
- `supabase/seed.sql` is a **historical draft that was never run** — the real
  catalogue was built through Mission Control + the bulk importer. Do not
  treat `seed.sql` as the source of truth; the DB is.

### Mission Control works — you can add products through the UI

- Login: Supabase Auth (email + password). Admin = any email in the
  `ADMIN_EMAILS` env allowlist. `lyndzwills@gmail.com` is set up, confirmed,
  and has signed in recently.
- Add a product: `/admin/products` → **Add product** → fill the form → Save.
  The `saveProduct` server action inserts the row and uploads images to the
  `product-images` Storage bucket (exists, 5MB/image, PNG/JPG/WebP/AVIF/GIF).
- Bulk import: `/admin/products` → **Import** button → `ImportWizard`.
  Backed by `tools/hyper-import/` — 11 platform importers (CSV, Etsy, product
  feed, Gumroad, JSON-LD, Printful, Printify, Shopify, Squarespace, Teemill,
  WooCommerce).
- New products default to `active = false`. Set price + stock, then flip
  **Active** to publish to the shop.

### Schema drift — the live DB is AHEAD of `supabase/migrations/`

Migrations stop at `0003`. The live DB additionally has (added via the
Supabase dashboard, never captured as a migration):

- `products.external_url` — external buy link (e.g. Teemill); when set, the
  shop links out instead of running Stripe checkout
- `products.teemill_variant_id` — variant to fulfil when sold via our Stripe
- `orders.amount`, `orders.fulfilled`, `orders.teemill_order_id`
- `orders.status` CHECK also allows `needs_fulfilment`
- Storage buckets `product-images` and `music`

If you ever rebuild this DB from `supabase/migrations/`, it will be missing
all of the above and Mission Control will break. Capture these as `0004_*`
before any rebuild. **Do not rebuild the live DB** — it is healthy and
holds real orders/catalogue.

### Other current state

- **Next.js:** 15.5.19. Commit `ed58dd1` tried v16 — rolled back, we are on
  15.x. (`next.config.js` has a duplicate `output: 'standalone'` line —
  harmless, worth tidying.)
- **Docker:** `Dockerfile` + `.dockerignore` + `output: 'standalone'` — prod
  image ~140MB.
- **Blog:** 32 markdown files in `content/`, 2 rows in `blog_posts` (DB
  drafts). File-based posts are the main content path.
- **Music:** 8 rows in `playlist_tracks`, `music` bucket live. Managed at
  `/admin/tracks`; comment moderation at `/admin/comments`.
- **Sponsorship:** `SponsorSection` component + `FUNDING.yml`.
- `.hyperfocus.yml` ecosystem manifest added 2026-07-18.

---

## 🚦 What To Build Next

**No approved next feature. Ask Lyndz before starting anything new.**

Known loose ends (NOT approved — flag, don't just do):

- Capture the schema drift above as `supabase/migrations/0004_*.sql`
- `README.md` is badly stale (wrong routes, "Printful shop", old blog count)
- `.env.local.example` says `welshdog.designs` — the live site is
  `welshdog.shop` (`NEXT_PUBLIC_SITE_URL` is already correct in `.env.local`)
- `supabase/seed.sql` header still says "NOT YET RUN / 19 products" — either
  delete it or rewrite it to reflect the 46 live rows

---

## 🛡️ HYPER-SKILLs — Load These Guardrails First

Vault: github.com/welshDog/HYPER-SILLs-By-WelshDog

| Skill | File | When |
|---|---|---|
| MERCY MESSAGE (HS-069) | broski/ND_FIRST_ERROR_MESSAGES_v1.md | All empty states + errors |
| THE STYLE CODEX (HS-084) | dev/CODE_STYLE_STANDARDS_v1.md | Every component |
| THE GATEKEEPER (HS-076) | dev/PRE_COMMIT_TESTING_CHECKLIST_v1.md | Before every commit |
| TRIM LORD (HS-110) | dev/LEAN_RAID_DISCIPLINE_v1.md | Whole sprint |
| GREP HOUND (HS-109) | dev/CROSS_REFERENCE_BEFORE_WRITING_v1.md | Before new code |
| THE METRICS OATH (HS-105) | dev/CORE_AGENT_METRICS_CONTRACT_v1.md | Admin vitals |
| THE BIRTH RITE (HS-106) | dev/NEW_AGENT_BUILD_CHECKLIST_v1.md | Agents Lab tasks |
| REALITY ANCHOR (HS-108) | dev/TRUTH_VS_CLAIM_AUDIT_v1.md | After each task |
| THE MIRROR OATH (HS-088) | dev/EIGHT_POINT_SELF_AUDIT_v1.md | Before marking done |
| THE ALL-SEEING (HS-070) | dev/OBSERVABLE_AGENT_OPS_v1.md | Products Watcher |
| SOFT LANDING (HS-071) | dev/FAIL_GRACEFULLY_v1.md | Agent error handling |
| THE FIVE WARDS (HS-085) | dev/FIVE_AGENT_GUARDRAILS_v1.md | All Agents Lab wiring |

---

## 🔁 Agent Loops

### Loop 1 — Product Health Check (runs on demand)
- Check all products in Supabase for: price = 0, stock = 0, active = true
- Flag any active product with missing price or zero stock
- Log result to Agents Lab console
- Never auto-fix — report only, await human decision

### Loop 2 — Blog Integrity Check (runs on demand)
- Check all blog posts for: missing slug, empty content, duplicate titles
- Report findings as a clean list
- Never delete or edit posts — report only

### Loop 3 — Admin Empty State Audit (runs on demand)
- Visit Orders, Leads, Subscribers pages
- Confirm each has a friendly, ND-first empty state message
- Flag any that still say raw "No X yet." without context

---

## 🪝 Hooks

### Pre-commit hook (always)
- Run THE GATEKEEPER checklist (HS-076) before every commit
- No commit ships without passing it

### Post-task hook (always)
- Run REALITY ANCHOR (HS-108) — verify task actually did what it claimed
- Run THE MIRROR OATH (HS-088) — 8-point self-audit
- Only then mark the task done

### Scope hook (always)
- If a task would touch more than 3 files beyond the agreed scope — STOP
- Ask the human before proceeding (TRIM LORD, HS-110)

---

## 🚫 Hard Rules — Never Break These

- Next.js stays on 15.x (currently 15.5.19, upgraded from 14 in the 2026-06
  security audit) — NO major upgrades without explicit human sign-off, and
  NEVER downgrade back to 14
- Frontmatter parsing uses the `yaml` package + local parser — gray-matter
  was REMOVED for security (unmaintained, js-yaml vulns). Never reintroduce it
- Never commit `.env` files — not even `.env.local.example` with real values
- Never drop or recreate Supabase tables — the live DB holds real orders and
  the 46-product catalogue. Additive `alter table … add column if not exists`
  only, plus RLS
- Never push directly to main without running the pre-commit hook
- Never activate a product or change a price without explicit human mapping
- Never redesign layouts — polish only, no rewrites
- `showcase-web` is a DIFFERENT repo — do not confuse the two
- `active` is the correct column name — NEVER use `is_active`

---

## 📁 Key Files & Folders

| Path | What it is |
|---|---|
| `app/(public)/` | Public pages: `/`, `shop`, `blog`, `music`, `about`, `contact`, `white-label` |
| `app/(admin)/admin/(dashboard)/` | Mission Control pages (products, orders, leads, blog, agents, tracks, comments, subscribers) |
| `app/(admin)/admin/(dashboard)/actions.ts` | Server actions — `saveProduct`, `toggleProductActive`, order/blog/track mutations |
| `app/(admin)/admin/login/` | Supabase Auth login (`LoginForm`) |
| `app/api/` | Route handlers: `checkout`, `webhooks/stripe`, `leads`, `subscribe`, `tracks/*`, `og` |
| `middleware.ts` | Refreshes Supabase session, blocks anon `/admin` access |
| `lib/supabase.ts` | `createServerClient` (anon reads) + `createAdminClient` (service role) |
| `lib/supabase/{client,server}.ts` | SSR auth clients |
| `lib/admin.ts` | `requireAdmin()` — allowlist gate via `ADMIN_EMAILS` |
| `lib/products.ts` | Public shop queries + `SHOP_CATEGORIES` |
| `components/admin/` | Admin UI — `ProductForm`, `Sidebar`, tables, `AgentsLab` |
| `tools/hyper-import/` | Bulk product importer — 11 platform adapters, `ImportWizard` |
| `supabase/migrations/` | `0001` init · `0002` playlist_tracks · `0003` track_interactions (⚠️ live DB is ahead — see Ground Truth) |
| `supabase/seed.sql` | Historical draft — NEVER run against live |
| `content/` | Blog markdown (32 files) |
| `exports/teemill-products.json` | 27-product Teemill feed snapshot (already imported) |
| `types/index.ts` | Shared domain types — mirrors the LIVE schema, not the migrations |
| `.env.local.example` | Env template — never commit real values |
| `WELSHDOG-SHOP-PLAN.md` | Original master plan — reference only |
| `POLISH_SPRINT.md` | 2026-06/07 sprint brief — historical, shipped |

### Categories (`SHOP_CATEGORIES` / `ProductCategory`)
`3D Prints` · `Mugs` · `Gifts` · `Bundles` · `Apparel`

---

## 🐕 Agent Identity

You are working on a project built by a neurodivergent maker in South Wales.
The voice is warm, honest, direct, and real.
Every message a user sees — empty states, errors, toasts, copy — must feel
like it was written by a human who gets it, not a corporate chatbot.

When in doubt: be kind, be clear, be useful. That's the WelshDog way.
