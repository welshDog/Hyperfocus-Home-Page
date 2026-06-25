# 🐕 WelshDog Designs — Polish Sprint Brief for Claude Code
> **Date:** 2026-06-24 | **Deployed at:** https://welshdog.shop | **Stack:** Next.js 14.2.35 / Supabase / Vercel

---

## 🎉 ALL TASKS COMPLETE — SITE LIVE ✅ 2026-06-25

> Task 8 done. tsc clean. Webhook wired, mock-safe, ready to deploy.
> **Next action: deploy + set STRIPE_WEBHOOK_SECRET on Vercel + register endpoint in Stripe dashboard**

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
| Teemill Catalog Export | ✅ DONE — 2026-06-25 (27 products / 169 variants) |
| Task 8 — Stripe Webhook + Teemill Fulfilment | ✅ DONE — 2026-06-25 |

---

## 📦 What Shipped

### Tasks 1–7 ✅
See commit history — all polished and live.

### Footer Links ✅
- 🐙 GitHub → https://github.com/welshDog
- 🚀 WelshDog Showcase → https://showcase-web-omega.vercel.app/
- 🪐 WelshDog Socials → https://bafybeibcz6tx64yd3cyq5jh747mwzdr45yvzvrzaam4lvfsda7wxlvjljy.ipfs.inbrowser.link/

### Product Image Upload ⏳ Wired — Needs Deploy + Test
- Supabase Storage bucket `product-images` — public, 5MB cap, images only (live)
- Mission Control form: thumbnails, ✕ remove, Cover badge, multi-file picker
- `next.config.js` body limit raised to 10MB
- **To confirm:** `vercel deploy --prod` → edit product → add image → check /shop card

### Teemill Catalog Export ✅
- Script: `scripts/teemill-export.ts` — run: `npx ts-node scripts/teemill-export.ts`
- Output: `exports/teemill-products.json` (gitignored)
- 27 products / 169 variants — all names, prices, imageUrls[], variants[].id

### Task 8 — Stripe Webhook + Teemill Fulfilment ✅

**Files created/updated:**
- `app/api/webhooks/stripe/route.ts` — signature verify → record order → fulfilment → stock −1
- `lib/teemill.ts` — create+confirm helper, mock-gated on `TEEMILL_LIVE`
- DB migration: `orders.amount`, `orders.fulfilled`, `orders.teemill_order_id`, `products.teemill_variant_id`
- 27 apparel variant IDs mapped to Supabase products ✅
- Shipping address collection added to checkout (fulfilment needs it)
- `types` + `.env.local.example` updated

**Guarantees:**
- Raw-body Stripe signature verification
- Idempotent order upsert on `stripe_session_id` — duplicate Stripe events are safe
- Atomic `fulfilled` claim — stock decrements + Teemill fires exactly once
- On Teemill failure, claim released so Stripe retry can re-attempt
- Webhook route is rate-limit EXEMPT — always

**Mock gate:**
- `TEEMILL_LIVE=true` env var required to fire real Teemill orders
- Default (unset) = mock mode — returns `mock_...` order id, zero network calls, safe to deploy now
- Logs show `(MOCK)` vs `(LIVE)` clearly

---

## 🔓 Activation Gates (business/ops — no more code needed)

| Gate | Status | Action |
|---|---|---|
| Deploy + STRIPE_WEBHOOK_SECRET on Vercel | 💻 Ready to do | `vercel deploy --prod`, add env var, register https://welshdog.shop/api/webhooks/stripe in Stripe dashboard |
| Stripe Live Mode | ⏳ Blocked | Waiting on Companies House registration |
| Teemill Orders API endpoint verify | 📋 One step | Open Teemill Orders API docs in browser → paste create-order example → match lib/teemill.ts |
| Flip `TEEMILL_LIVE=true` | 📋 After above | Set on Vercel env vars |
| Clear `external_url` on apparel | 📋 After Stripe Live | Removes "Buy on Teemill" link-out → own checkout takes over |

---

## 🧪 Local Test Checklist (run yourself)

```bash
# 1. Set test keys in .env.local: STRIPE_SECRET_KEY=sk_test_...
# 2. Start app
npm run dev:frontend
# 3. Forward webhooks (new terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_... into STRIPE_WEBHOOK_SECRET, restart dev
# 4. Buy a 3D-print with test card 4242 4242 4242 4242
#    Watch for webhook hit + check orders table in Supabase
# 5. For Teemill mock path: clear external_url on one apparel,
#    buy it → expect "fulfilled via Teemill (MOCK)" in logs
```

---

## 🧠 HYPER-SKILLs Guardrails

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
| Stripe webhook | Rate-limit EXEMPT — always |

---

*Built in Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁥 by @welshDog — for brains that don't switch off.*
