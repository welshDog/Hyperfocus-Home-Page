# 🐕 WelshDog Designs — Polish Sprint Brief for Claude Code
> **Date:** 2026-06-24 | **Deployed at:** https://welshdog.shop | **Stack:** Next.js 14.2.35 / Supabase / Vercel

---

## 🎉 SPRINT COMPLETE — SITE LIVE ✅ 2026-06-24

> All tasks done. tsc clean. Deployed and confirmed live at welshdog.shop.
> **Next session: Task 8 — Stripe Webhook + Teemill Orders API fulfilment**

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
| Product Image Upload | ⏳ WIRED — needs deploy + round-trip test |
| Teemill Catalog Export | ✅ DONE — 2026-06-25 |
| Task 8 — Stripe Webhook + Teemill Fulfilment | 📋 Next session |

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
- **Contact:** Human copy added; fake socials hidden; footer → "Made in South Wales, with care ♥"
- **White-label:** Tier table live with real prices, CTAs: "Book a demo" + "Explore pricing"

#### White-label Tier Prices ✅ (confirmed by Lyndz)
| Tier | Price | What they get | Timeline | Support |
|---|---|---|---|---|
| **Starter** | **£297 one-off** | Shop + blog, self-managed | 1–2 weeks | Email |
| **Pro** | **£597 one-off** | Full setup + custom branding + 30 days support | 2–3 weeks | Priority email |
| **Done For You** | **£1,497 one-off** | Everything built, launched, handed over | 3–4 weeks | 30-day handholding |

### Task 5 — Admin UX ✅
- Colour-coded stat cards: Products=teal, Orders=green, Leads=amber, Blog=violet
- Recent Activity placeholder section
- Products hint banner + filter tabs: All / Live / Drafts / Out of Stock
- Friendly empty states: Orders, Leads, Subscribers

### Task 6 — Agents Lab ✅
- Products Watcher: `checkProductHealth()` server action, real DB check
- Status badges: green pulse / grey / red
- Descriptions + Health/Network legend + tooltips

### Task 7 — Analytics ✅
- `@vercel/analytics@^2.0.1` + `<Analytics />` in root layout
- Error logging on `/api/leads` + `/api/checkout`

### Footer Links ✅
- 🐙 GitHub → https://github.com/welshDog
- 🚀 WelshDog Showcase → https://showcase-web-omega.vercel.app/
- 🪐 WelshDog Socials → https://bafybeibcz6tx64yd3cyq5jh747mwzdr45yvzvrzaam4lvfsda7wxlvjljy.ipfs.inbrowser.link/
- All new tab, aria-labels, muted grey → teal on hover

### Product Image Upload ⏳ Wired — Needs Deploy + Test
- Supabase Storage bucket `product-images` — public, 5MB cap, images only (already live)
- Upload via service-role admin client (requireAdmin-gated)
- Mission Control product form: thumbnails, ✕ remove, Cover badge, multi-file picker
- `saveProduct` merges kept + new URLs into `images[]`
- `next.config.js` body limit raised to 10MB
- **To confirm:** `vercel deploy --prod` → edit product → add image → check /shop card

### Teemill Catalog Export ✅ — 2026-06-25
> **Purpose:** Archive all products before leaving Teemill. Variant IDs also used for Task 8 fulfilment.

- Script: `scripts/teemill-export.ts` (read-only, never touches Orders API)
- Run: `npx ts-node scripts/teemill-export.ts`
- Output: `exports/teemill-products.json` (add `exports/` to `.gitignore`)
- **Result: 27 products / 169 variants exported and verified**
- Each product has: `name`, `description`, `price`, `category`, `buyUrl`, `imageUrls[]` (4 colourway images), `variants[]` with `id`, `sku`, `size`, `color`, `price`, `availability`, `imageUrl`, `link`
- Example: "Beware I'm DYSEXIC Cap" → £33, 4 images, variants in Black/Oat/Navy/Evergreen
- `variant.id` (e.g. `89199724`) = the identifier the Orders API needs for fulfilment → feeds into Task 8
- Bonus: 4 colourway images per product → can enrich Supabase apparel with multiple images
- `tsconfig.json` ts-node override added (commonjs/node/es2020) — Next build unaffected

---

## 📋 Task 8 — Stripe Webhook + Teemill Fulfilment (Next Session)

> **Start here next session. Teemill variant IDs are ready in exports/teemill-products.json.**
> **NOTE: Build + mock only until Stripe Live Mode is unlocked (blocked on Companies House reg).**

### The flow
```
Customer buys on welshdog.shop (Stripe checkout)
  ↓
Stripe fires checkout.session.completed webhook
  ↓
/api/webhooks/stripe/route.ts catches it
  ↓
Inserts order row in Supabase orders table
  ↓
For Teemill products: calls Teemill Create Order API → Confirm Order API
  ↓
Teemill prints + ships direct to customer (white-label)
```

### Build steps
1. Create `/api/webhooks/stripe/route.ts`
2. Verify Stripe signature (`STRIPE_WEBHOOK_SECRET` from env)
3. Insert into `orders`: `product_id`, `status`, `amount`, `stripe_session_id`
4. For apparel/Teemill products: POST to Teemill Orders API with `variant.id` from catalog export
5. Auth: `Authorization: TEEMILL_PRIVATE_KEY` header + `?project=TEEMILL_PROJECT_NAME` param
6. Decrement `stock` on the product by 1 in Supabase
7. Register in Stripe dashboard: `https://welshdog.shop/api/webhooks/stripe`
8. **DO NOT call Confirm Order in real until Stripe Live is active**

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
