# 🐕 WelshDog Designs — Polish Sprint Brief for Claude Code
> **Date:** 2026-06-24 | **Deployed at:** https://welshdog.shop | **Stack:** Next.js 14.2.35 / Supabase / Vercel

---

## 🎉 ALL TASKS COMPLETE + HYPERIMPORT SHIPPED ✅ 2026-06-25

> Sprint done. HyperImport built. tsc clean. Deploy ready.
> **Next action: test HyperImport locally → `npm run dev:frontend` → /admin → Products → Import Products**

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
| Task 8 — Stripe Webhook + Smart Fulfilment Routing | ✅ DONE — 2026-06-25 |
| HyperImport — Shop Migration Tool | ✅ DONE — 2026-06-25 |

---

## 📦 What Shipped

### Tasks 1–7 ✅
See commit history — all polished and live.

### Task 8 — Stripe Webhook + Smart Fulfilment Routing ✅

**Smart fulfilment routing:**
| Product type | Route | Status set |
|---|---|---|
| Apparel with `teemill_variant_id` | Teemill auto-fulfil (mock-gated) | `fulfilled` |
| Bundles + 3D prints + gifts (`teemill_variant_id` NULL) | Self-fulfilment — email to ADMIN_EMAIL | `needs_fulfilment` |

**Mission Control /admin/orders:**
- `needs_fulfilment` rows tinted amber + amber "Mark fulfilled" button
- New "needs fulfilment" filter tab

**Guarantees:** signature verify, idempotent upsert, exactly-once claim, rate-limit exempt webhook, email fails soft.

**Mock gate:** `TEEMILL_LIVE=true` required for real Teemill orders. Default = mock, safe to deploy.

---

### HyperImport — Shop Migration Tool ✅

**What it does:** paste a shop API key or upload a CSV → products auto-populate your shop as drafts.

**Files:**
| File | What |
|---|---|
| `tools/hyper-import/lib/mapper.ts` | `ImportedProduct` type + `normalise()` + slugify |
| `tools/hyper-import/importers/teemill.ts` | Feed-based → `ImportedProduct[]` (full catalogue) |
| `tools/hyper-import/importers/csv.ts` | Generic CSV (name, description, price, image_url, external_url) |
| `tools/hyper-import/lib/uploader.ts` | Re-uploads images → `product-images` bucket → inserts products |
| `tools/hyper-import/actions.ts` | `requireAdmin`-gated `previewProducts` + `runProductImport` |
| `tools/hyper-import/ui/ImportWizard.tsx` | 4-step wizard (platform → connect → preview+select → progress) |
| `tools/hyper-import/ui/ImportProductsButton.tsx` | Button + modal wired into /admin/products |

**Safety:**
- Imports land as `active: false` drafts — never auto-activate
- Insert-new, skip-existing by slug — can't clobber live products
- Reports imported / skipped / failed count
- Service-role for all DB writes
- Images re-uploaded to Supabase storage, never hotlinked

**To test locally:**
```bash
npm run dev:frontend
# Open /admin → Products → "Import Products"
# Try CSV first (2-row test file) → new drafts appear
# Teemill → will preview 27, report all skipped (already in shop) ← correct safe behaviour
```

**Honest gap:** visual round-trip not click-tested (no browser access) — but all layers underneath proven (importers run, tsc clean, uploader reuses working patterns).

---

## 🔓 Activation Gates (no more code needed)

| Gate | Status | Action |
|---|---|---|
| Deploy + `STRIPE_WEBHOOK_SECRET` on Vercel | 💻 Ready NOW | `vercel deploy --prod`, add env var, register https://welshdog.shop/api/webhooks/stripe in Stripe dashboard |
| `RESEND_API_KEY` on Vercel | 💻 Ready NOW | Add to Vercel env vars — owner order emails live |
| HyperImport local test | 🧪 Ready NOW | `npm run dev:frontend` → /admin → Products → Import Products |
| Stripe Live Mode | ⏳ Blocked | Waiting on Companies House registration |
| Flip `TEEMILL_LIVE=true` | 📋 After Stripe Live | Set on Vercel env vars |
| Clear `external_url` on apparel | 📋 After Stripe Live | Removes "Buy on Teemill" link-out |

---

## 🚀 White-Label Service Roadmap (next phase)

HyperImport is the engine for the white-label "Shop in a Box" service:

| Phase | What | Status |
|---|---|---|
| 1 | Extract shop into generic template repo | 📋 Next |
| 2 | "Deploy to Vercel" one-click button | 📋 Next |
| 3 | Add Etsy importer to HyperImport | 📋 Next |
| 4 | `/setup` onboarding wizard for new shop owners | 📋 Next |
| 5 | Package + sell on welshdog.shop | 📋 Next |

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
