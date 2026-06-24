# 🐕 WelshDog Designs — Polish Sprint Brief for Claude Code
> **Date:** 2026-06-24 | **Deployed at:** https://welshdog.shop | **Stack:** Next.js 14.2.35 / Supabase / Vercel

---

## 🎉 SPRINT COMPLETE — SITE LIVE ✅ 2026-06-24

> All 7 tasks done + footer links added. tsc clean. Deployed and confirmed live at welshdog.shop.
> **Next session: Task 8 — Stripe Webhook + Orders**

---

## ✅ Task Status

| Task | Status |
|---|---|
| Task 1 — Pricing & Product Activation | ✅ DONE — 2026-06-24 |
| Task 2 — Homepage Featured Products Strip | ✅ DONE — 2026-06-24 |
| Task 3 — Shop Page Polish | ✅ DONE — 2026-06-24 |
| Task 4 — Content Polish Pass | ✅ DONE — 2026-06-24 |
| Task 5 — Admin UX Improvements | ✅ DONE — 2026-06-24 |
| Task 6 — Agents Lab Wiring | ✅ DONE — 2026-06-24 |
| Task 7 — Analytics & Error Monitoring | ✅ DONE — 2026-06-24 |
| Footer Links — Showcase + Socials | ✅ DONE — 2026-06-25 |
| Task 8 — Stripe Webhook + Orders | 📋 POST-SPRINT — next session |

---

## 📦 What Shipped

### Task 1 — Products ✅
- 19 products: priced, stocked, active = true in Supabase
- DB column is `active` (NOT `is_active` — code correct, brief was wrong)
- Bundle prices fixed: Desk Setup £31.99, Princess Vanity £32.99
- Mug of Tee Bundle = mug + t-shirt (Teemill)

### Task 2 — Homepage ✅
- Featured products strip under hero (3–4 cards, active products)
- "3D prints, mugs, gifts, and bundles made in South Wales." hero line
- ND-first empty state if no active products

### Task 3 — Shop ✅
- Persistent "View →" cue on cards (brand-teal on hover, touch-friendly)
- Sticky category filters (top-16, clears navbar, mobile + desktop)
- ND-first empty states per category
- Default-to-All / never-empty logic confirmed correct

### Task 4 — Content ✅
- **Blog:** Featured posts strip (3 newest), subscribe copy updated
- **About:** Long paragraphs broken into scannable chunks
- **Contact:** "I'll read this personally and usually reply within 1–2 working days." added; fake socials hidden (only github.com/welshDog remains); footer fixed to "Made in South Wales, with care ♥"
- **White-label:** Tier table live with real prices (below), CTAs: "Book a demo" + "Explore pricing"

#### White-label Tier Prices ✅ (confirmed by Lyndz)
| Tier | Price | What they get | Timeline | Support |
|---|---|---|---|---|
| **Starter** | **£297 one-off** | Shop + blog, self-managed | 1–2 weeks | Email |
| **Pro** | **£597 one-off** | Full setup + custom branding + 30 days support | 2–3 weeks | Priority email |
| **Done For You** | **£1,497 one-off** | Everything built, launched, handed over | 3–4 weeks | 30-day handholding |

### Task 5 — Admin UX ✅
- Colour-coded stat cards: Products=teal, Orders=green, Leads=amber, Blog=violet
- Recent Activity placeholder section
- Products hint banner: "Set prices, stock and mark products Active to appear on the public shop."
- Filter tabs: All / Live / Drafts / Out of Stock (with counts)
- Friendly empty states: Orders, Leads, Subscribers all done
- Vercel Toolbar: platform overlay only — disable at Vercel → Project → Settings → Toolbar

### Task 6 — Agents Lab ✅
- Products Watcher wired to real DB check via `checkProductHealth()` server action
- Toast: green "✓ All active products have a price & stock" or amber "⚠️ N active products have missing prices."
- Status badges: green pulse (live) / grey (idle) / red (alert)
- One-sentence descriptions on all agent cards
- Health/Network explained with legend + hover tooltips

### Task 7 — Analytics ✅
- `@vercel/analytics@^2.0.1` installed, `<Analytics />` in root layout
- Error logging on `/api/leads` (DB failure + guarded email send)
- Error logging on `/api/checkout` (Stripe call wrapped → logs + 502 instead of unlogged throw)

### Footer Links ✅
- 🐙 GitHub → https://github.com/welshDog (unchanged)
- 🚀 WelshDog Showcase → https://showcase-web-omega.vercel.app/
- 🪐 WelshDog Socials → https://bafybeibcz6tx64yd3cyq5jh747mwzdr45yvzvrzaam4lvfsda7wxlvjljy.ipfs.inbrowser.link/
- All open in new tab, aria-labels set, muted grey → teal on hover
- Images to be added manually by Lyndz

---

## 📋 Task 8 — Stripe Webhook + Orders (Next Session)

> **Start here next session. Site is live and confirmed working.**

1. Create `/api/webhooks/stripe/route.ts`
2. Listen for `checkout.session.completed`
3. Verify Stripe webhook signature (`STRIPE_WEBHOOK_SECRET` from env)
4. Insert into `orders`: `product_id`, `status = 'pending'`, `amount`, `stripe_session_id`
5. Decrement `stock` on the product by 1
6. Use service role for the webhook (RLS allows public INSERT with `status = 'pending'`)
7. Register in Stripe dashboard: `https://welshdog.shop/api/webhooks/stripe`

---

## 🧠 HYPER-SKILLs Guardrails

Vault: github.com/welshDog/HYPER-SILLs-By-WelshDog

| Skill | File | When |
|---|---|---|
| MERCY MESSAGE (HS-069) | broski/ND_FIRST_ERROR_MESSAGES_v1.md | All empty states + errors |
| THE STYLE CODEX (HS-084) | dev/CODE_STYLE_STANDARDS_v1.md | Every component |
| THE GATEKEEPER (HS-076) | dev/PRE_COMMIT_TESTING_CHECKLIST_v1.md | Before every commit |
| TRIM LORD (HS-110) | dev/LEAN_RAID_DISCIPLINE_v1.md | Whole sprint |
| GREP HOUND (HS-109) | dev/CROSS_REFERENCE_BEFORE_WRITING_v1.md | Before new code |
| REALITY ANCHOR (HS-108) | dev/TRUTH_VS_CLAIM_AUDIT_v1.md | After each task |
| THE MIRROR OATH (HS-088) | agents/AGENT_FINAL_SELF_AUDIT_v1.md | Before marking done |

---

## ⚠️ Hard Constraints — Never Break

| Rule | Detail |
|---|---|
| Next.js | Stay at **14.2.35** — do NOT upgrade |
| gray-matter | Stay at **4.0.3** — do NOT downgrade |
| Tone | Playful, honest, zero corporate fluff |
| Design | Polish only — no big layout rewrites |
| `.env` files | NEVER commit |
| Supabase | Use existing tables/RLS — do NOT drop or recreate |
| Column name | `active` — NEVER `is_active` |

---

*Built in Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁥 by @welshDog — for brains that don't switch off.*
