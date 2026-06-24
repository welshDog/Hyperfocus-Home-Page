# 🐕 AGENT-START.md — WelshDog Designs
## Boot file for Claude Code & all AI agents

**Repo:** welshDog/Hyperfocus-Home-Page  
**Live site:** https://welshdog.shop  
**Stack:** Next.js 14.2.35 / Supabase / Vercel  
**Branch:** main  
**Owner:** Lyndon Williams — Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁥  
**Tone:** Neurodivergent-first. Playful. Honest. Zero corporate fluff.

---

## 🧠 What This Repo Is

WelshDog Designs — a neurodivergent-first shop, blog, and white-label 
service platform. Built for brains that don't switch off.

Three lanes:
1. Shop — 3D prints, mugs, gifts, bundles (Supabase products)
2. Blog — honest writing on ADHD, dyslexia, creativity, tech
3. White-label — the full shop engine, available for others to own

Admin lives at /admin — Mission Control with Products, Orders, Leads,
Blog, Agents Lab, Subscribers.

---

## ✅ SESSION HANDOFF — 2026-06-24

> **Read this before POLISH_SPRINT.md. This is ground truth.**

### Task 1 — COMPLETE ✅
- All 19 products priced, stocked, and active = true in Supabase
- DB column is `active` (NOT `is_active` — the sprint doc is wrong, code is correct)
- Categories in DB: `3D Prints`, `Mugs`, `Gifts`, `Bundles` (plural, mind the spelling)
- Mug names have surrounding quotes in DB e.g. `"Hyperfocus Mode On" Mug`
- Checkout queries `.eq('active', true)` — correct, no code change needed

### Bundle Pricing Fixed ✅
- Desk Setup Bundle: £31.99 (was £44.99 — was more expensive than parts separately)
- Princess Vanity Bundle: £32.99 (was £39.99 — same issue)
- Mug of Tee Bundle: mug + **t-shirt** (Teemill), NOT tea

### Supabase Security Hardened ✅
- `orders` RLS: public INSERT (status = 'pending' only), no SELECT for anon
- `leads` RLS: public INSERT with email validation (not null, length > 3)
- `subscribers` RLS: public INSERT with email validation (not null, length > 3)
- `rls_auto_enable()` SECURITY DEFINER: EXECUTE revoked from anon + authenticated
- FK index added on `orders.product_id`
- Security advisors: 6 warnings → 1 remaining (leaked password protection — toggle in Auth dashboard)

### Checkout / Orders Gap ⚠️
- `app/api/checkout/route.ts` creates a Stripe session but does NOT insert into `orders`
- There is no Stripe webhook yet — orders table will stay empty after real payments
- Task 8 (below) covers this — do NOT attempt to fix in this sprint

### Sprint Status
- Task 1 ✅ DONE
- Tasks 2–7 ⏳ NOT STARTED — ready to run
- Task 8 📋 QUEUED — post-sprint

---

## 🚦 Current Mission

READ POLISH_SPRINT.md NEXT. That is the active task brief.
Task 1 is done — start from **Task 2 (Homepage Featured Products Strip)**.
Do not re-run Task 1. Do not touch products table pricing or activation.

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
- Only then mark the task done in POLISH_SPRINT.md

### Scope hook (always)
- If a task would touch more than 3 files not listed in POLISH_SPRINT.md — STOP
- Ask the human before proceeding (TRIM LORD, HS-110)

---

## 🚫 Hard Rules — Never Break These

- Next.js stays at 14.2.35 — NO upgrades ever
- gray-matter stays at 4.0.3 — NO changes
- Never commit .env files — not even .env.example with real values
- Never drop or recreate Supabase tables — use existing schema + RLS
- Never push directly to main without running the pre-commit hook
- Never activate a product or change a price without explicit human mapping
- Never redesign layouts — polish only, no rewrites
- showcase-web is a DIFFERENT repo — do not confuse the two
- `active` is the correct column name — NEVER use `is_active`

---

## 📁 Key Files & Folders

| Path | What it is |
|---|---|
| POLISH_SPRINT.md | Active sprint brief — read this second |
| app/ | Next.js 14 app router pages |
| components/ | Shared UI components |
| content/ | Blog MDX/markdown files |
| lib/ | Supabase client + helpers |
| supabase/ | DB types + migrations |
| types/ | TypeScript types |
| public/ | Static assets |
| .env.local.example | Env var template — never commit real values |

---

## 🐕 Agent Identity

You are working on a project built by a neurodivergent maker in South Wales.
The voice is warm, honest, direct, and real.
Every message a user sees — empty states, errors, toasts, copy — must feel 
like it was written by a human who gets it, not a corporate chatbot.

When in doubt: be kind, be clear, be useful. That's the WelshDog way.
