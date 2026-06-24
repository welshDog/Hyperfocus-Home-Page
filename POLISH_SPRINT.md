# 🐕 WelshDog Designs — Polish Sprint Brief for Claude Code
> **Date:** 2026-06-24 | **Deployed at:** https://welshdog.shop | **Stack:** Next.js 14.2.35 / Supabase / Vercel

---

## 🧠 HYPER-SKILLs Guardrails — Read These First

> These are mandatory behaviour constraints from the [HYPER-SKILLs vault](https://github.com/welshDog/HYPER-SILLs-By-WelshDog).
> Read each file **before** writing a single line of code.
> Apply them throughout the entire sprint — no exceptions.

| Skill | File | Apply When |
|---|---|---|
| 💚 **MERCY MESSAGE** (HS-069) | [`broski/ND_FIRST_ERROR_MESSAGES_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/broski/ND_FIRST_ERROR_MESSAGES_v1.md) | Every empty state, error message, and toast |
| 📐 **THE STYLE CODEX** (HS-084) | [`dev/CODE_STYLE_STANDARDS_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/CODE_STYLE_STANDARDS_v1.md) | All TS/React components — no exceptions |
| ✅ **THE GATEKEEPER** (HS-076) | [`dev/PRE_COMMIT_TESTING_CHECKLIST_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/PRE_COMMIT_TESTING_CHECKLIST_v1.md) | Before every single commit |
| ⚔️ **TRIM LORD** (HS-110) | [`dev/LEAN_RAID_DISCIPLINE_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/LEAN_RAID_DISCIPLINE_v1.md) | Entire sprint — no scope creep |
| 🐕 **GREP HOUND** (HS-109) | [`dev/CROSS_REFERENCE_BEFORE_WRITING_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/CROSS_REFERENCE_BEFORE_WRITING_v1.md) | Before writing any new component or function |
| 📊 **THE METRICS OATH** (HS-105) | [`dev/CORE_AGENT_METRICS_CONTRACT_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/CORE_AGENT_METRICS_CONTRACT_v1.md) | Admin vitals cards and stat displays |
| 🌱 **THE BIRTH RITE** (HS-106) | [`dev/NEW_AGENT_BUILD_CHECKLIST_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/NEW_AGENT_BUILD_CHECKLIST_v1.md) | Task 6 — Agents Lab wiring |
| 🔱 **REALITY ANCHOR** (HS-108) | [`dev/TRUTH_VS_CLAIM_AUDIT_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/dev/TRUTH_VS_CLAIM_AUDIT_v1.md) | After each task — verify you did what you said |
| 🪞 **THE MIRROR OATH** (HS-088) | [`agents/AGENT_FINAL_SELF_AUDIT_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/agents/AGENT_FINAL_SELF_AUDIT_v1.md) | Before calling any task "done" |
| 👁️ **THE ALL-SEEING** (HS-070) | [`agents/OBSERVABLE_AGENT_OPERATIONS_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/agents/OBSERVABLE_AGENT_OPERATIONS_v1.md) | Products Watcher visible action |
| 🪂 **SOFT LANDING** (HS-071) | [`agents/FAIL_GRACEFULLY_FALLBACK_CHAIN_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/agents/FAIL_GRACEFULLY_FALLBACK_CHAIN_v1.md) | Any agent error handling |
| 🚧 **THE FIVE WARDS** (HS-085) | [`agents/FIVE_MANDATORY_AGENT_GUARDRAILS_v1.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/agents/FIVE_MANDATORY_AGENT_GUARDRAILS_v1.md) | All Agents Lab wiring |

---

## ✅ Task Status

| Task | Status |
|---|---|
| Task 1 — Pricing & Product Activation | ✅ DONE — 2026-06-24 |
| Task 2 — Homepage Featured Products Strip | ✅ DONE — 2026-06-24 |
| Task 3 — Shop Page Polish | ✅ DONE — 2026-06-24 |
| Task 4 — Content Polish Pass | ⏳ UP NEXT |
| Task 5 — Admin UX Improvements | ⏳ Queued |
| Task 6 — Agents Lab Wiring | ⏳ Queued |
| Task 7 — Analytics & Error Monitoring | ⏳ Queued |
| Task 8 — Stripe Webhook + Orders | 📋 Post-sprint |

---

## 🎯 Context

You are Claude Code, working on a live Next.js 14 / Supabase / Vercel project called **WelshDog Designs**, deployed at https://welshdog.shop.

It's a **neurodivergent-first shop and blog** built for brains that don't switch off.

### What's live:
- Home, Shop, Blog, About, White-label, Contact pages
- Mission Control admin with Products, Orders, Leads, Blog, Agents Lab, Subscribers
- Dedicated Supabase project with 5 tables and RLS
- **All 19 products are now live** — priced, stocked, active = true

---

## 🚦 Current State

| Area | Status |
|---|---|
| Home | ✅ Hero strong, ✅ Featured products strip live |
| Shop `/shop` | ✅ 19 active products, sticky filters, ND-first empty states |
| Blog `/blog` | ⚠️ Needs featured strip + content polish |
| About `/about` | ⚠️ Long paragraphs, minor grammar bumps |
| White-label `/white-label` | ❌ Real prices now confirmed — replace TBD + build tier table |
| Contact `/contact` | ⚠️ Missing "reply in 1–2 days" line + footer cleanup |
| Mission Control `/admin` | ⚠️ Stray debug text, stats could be richer |
| Orders/Leads/Subscribers | ❌ Empty states are bare |
| Agents Lab `/admin/agents` | ❌ No agent triggers a visible action |

---

## ⚠️ DB Column Name — CRITICAL

The column is **`active`** (boolean) — NOT `is_active`.
The app code already uses `active` correctly. Don't change the code.

---

## ~~Task 1 — Pricing & Product Activation~~ ✅ DONE

All 19 products updated directly in Supabase on 2026-06-24.
Prices, stock, descriptions, and active = true all set. Do not re-run.

---

## ~~Task 2 — Homepage Featured Products Strip~~ ✅ DONE

Featured products strip live under hero. "3D prints, mugs, gifts, and bundles made in South Wales." line added.

---

## ~~Task 3 — Shop Page Polish~~ ✅ DONE

- Persistent "View →" cue on cards (brand-teal on hover, touch-friendly)
- Sticky category filters at top-16, clears navbar, mobile + desktop
- ND-first empty states: "No products yet — they'll appear here once activated in Mission Control."
- Category nudge: friendly "try another category" copy
- Default-to-All / never-empty logic confirmed correct from Phase 1

---

## Task 4 — Content Polish Pass ⏳ UP NEXT

### Blog `/blog`
- 3–5 card "Featured Posts" strip at top.
- Clean up rough titles/snippets.
- Subscribe copy: *"Get behind-the-scenes shop updates, new drops, and Hyperfocus experiments."*

### About `/about`
- Break long paragraphs into shorter chunks (especially "different operating system" section).
- Fix: *"Made with in South Wales"* → *"Made in South Wales, with care."*

### White-label `/white-label`

> ✅ **Prices confirmed by Lyndz on 2026-06-24 — use these exactly:**

| Tier | Price | What they get | Timeline | Support |
|---|---|---|---|---|
| **Starter** | **£297 one-off** | Shop + blog, self-managed, you set it up | 1–2 weeks | Email |
| **Pro** | **£597 one-off** | Full setup + custom branding + 30 days support | 2–3 weeks | Priority email |
| **Done For You** | **£1,497 one-off** | Everything built, launched, handed over | 3–4 weeks | 30-day handholding |

- Replace ALL instances of "TBD" with real prices from the table above.
- Build the tier comparison table using the data above.
- CTAs: **"Book a demo"** (primary) + **"Explore pricing"** (secondary).
- Do NOT invent any other prices — these are the only confirmed ones.

### Contact `/contact`
- Add: *"I'll read this personally and usually reply within 1–2 working days."*
- Hide social links that don't point to real accounts.
- Fix footer wording.

---

## Task 5 — Admin UX Improvements

### Mission Control `/admin`
- Remove stray debug text (e.g. `TracingVercel Toolbar`).
- Add icon + colour per stat card.
- Add "Recent Activity" placeholder (shows once data exists).

### Products `/admin/products`
- Hint banner: *"Set prices, stock and mark products Active to appear on the public shop."*
- Quick filter tabs: **Drafts / Live / Out of Stock**

### Orders `/admin/orders`
- Empty state: *"No orders yet — once a customer checks out, orders appear here."*

### Leads `/admin/leads`
- Empty state: *"No demo requests yet — white-label form submissions show here."*

### Subscribers `/admin/subscribers`
- Empty state: *"Newsletter signups appear here. Export CSV when ready for email tools."*

---

## Task 6 — Agents Lab Wiring `/admin/agents`

1. Wire **"Products Watcher"** agent to a real action:
   - Check for `active = true` products with `price = 0` or `stock = 0`.
   - Show a toast in admin: *"⚠️ Active products have missing prices."*
2. Add one-sentence description under each agent card.
3. Replace "IDLE" text with coloured status badges (green/grey/red).
4. Add brief explanation of what "health" and "network" vitals mean.

---

## Task 7 — Analytics & Error Monitoring (Optional)

1. Add `@vercel/analytics` to `app/layout.tsx`.
2. Add lightweight error logging to:
   - `/api/leads`
   - `/api/contact`
   - Checkout flow

---

## Task 8 — Stripe Webhook + Orders Recording 📋 POST-SPRINT

> **Do not attempt this during the polish sprint. Queue for next session.**

Currently `app/api/checkout/route.ts` creates a Stripe session but never writes to the `orders` table.
Orders only get recorded if a webhook catches `checkout.session.completed`.

**What needs building:**
1. Create `/api/webhooks/stripe/route.ts`
2. Listen for `checkout.session.completed` event
3. Verify Stripe webhook signature (use `STRIPE_WEBHOOK_SECRET` from env)
4. Insert into `orders` with:
   - `product_id` from `session.metadata.product_id`
   - `status = 'pending'`
   - `amount` from `session.amount_total / 100`
   - `stripe_session_id` from `session.id`
5. Decrement `stock` on the product by 1
6. RLS already allows public INSERT with `status = 'pending'` — use service role for the webhook
7. Register webhook URL in Stripe dashboard: `https://welshdog.shop/api/webhooks/stripe`

---

## ⚠️ Hard Constraints — NEVER BREAK

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

## ✅ Done When...

- [x] `/shop` shows active products with real prices + categories ✅
- [x] Homepage has a featured products strip ✅
- [ ] White-label has real tier prices + comparison table
- [ ] All admin empty states have helpful, friendly copy
- [ ] At least one Agents Lab agent does something visible
- [ ] Debug artefacts removed from Mission Control
- [ ] About/Contact/Blog copy is clean and scannable
- [ ] Vercel Analytics added

---

*Built in Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁥 by @welshDog — for brains that don't switch off.*
