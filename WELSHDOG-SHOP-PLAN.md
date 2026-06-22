# 🐕 WelshDog Designs — New Shop Master Plan
**Version 1.0 | June 2026 | Hyperfocus Zone Ltd**

---

## Overview

WelshDog Designs is a neurodivergent-first creator commerce brand built by Lyndon Williams (S. Wales) combining 3D printed originals, custom gifting, a white-label shop service, and a Hyperfocus Zone creator lab — all on a modern stack with a hidden Mission Control admin panel. This document is the master build plan for the new version of the shop, taking the best ideas from the IPFS prototype and rebuilding them into a proper production system.

---

## 🎯 Core Mission

> "Built for brains that don't switch off."

Sell original products, share the story, and sell the engine too. Three revenue lanes. One distinctive brand.

---

## 🗺️ Site Map

### Public Pages

| Page | Route | Purpose |
|---|---|---|
| Homepage | `/` | Brand hero, featured products, white-label teaser, manifesto hook |
| Shop | `/shop` | Full product catalogue with filters |
| Product Detail | `/shop/[slug]` | Individual product with buy CTA |
| White-Label Shop | `/white-label` | Service pitch + "Buy Your Shop" + "Book a Demo" |
| About / Manifesto | `/about` | Brand story, hyperfocus code, creator background |
| Blog | `/blog` | 26 backed-up posts + new content hub |
| Blog Post | `/blog/[slug]` | Individual post with related content |
| Contact | `/contact` | General enquiries |

### Private Pages

| Page | Route | Purpose |
|---|---|---|
| Mission Control | `/admin` | Hidden via footer easter egg ("Made with") |
| Admin Login | `/admin/login` | Supabase auth, local allowlist only |
| Products Manager | `/admin/products` | Add, edit, manage inventory |
| Orders | `/admin/orders` | Order tracking and fulfilment |
| Leads / Demos | `/admin/leads` | White-label demo bookings from form |
| Blog Manager | `/admin/blog` | Draft, publish, schedule posts |
| Agents Lab | `/admin/agents` | BROski agent activations + Command Deck |
| Subscribers | `/admin/subscribers` | Email list management |
| Settings | `/admin/settings` | Store config, keys, integrations |

---

## 🛍️ Revenue Lanes

### Lane 1 — Physical Products
Your own 3D printed artifacts, custom drinkware, laser-engraved gifts, and personalised items. Core catalogue already live on the IPFS prototype:

- WD Coaster Stack of 4
- WD Headphone Stand
- Princess Vanity Trio / Crown Stand
- Personalised Drip Wall Plate
- Rosette Cuddle Bears
- Dyslexia / ADHD Mug Range
- Name & Text Gift Range
- Bundles

**Action:** Migrate all 19 active products + descriptions from IPFS prototype into new Supabase products table.

### Lane 2 — White-Label Shop Service
Sell the shop engine itself. Customer pays → receives auto setup info, intake pack, and access details → Mission Control logs the lead.

**Tiers to build:**

| Tier | What They Get | Price Range |
|---|---|---|
| Starter | Template clone, basic branding, setup guide | Lower |
| Pro | Branded setup, wallet/payment config, product import | Mid |
| Done For You | Full launch with personal support | Premium |

**Action:** Add "Buy Your Shop" CTA alongside "Book a Demo" on white-label page.

### Lane 3 — Content & Community
Blog system for 26 backed-up posts + new content. Builds audience, drives SEO, supports subscriber list. Connects to Hyperfocus Zone Dev School longer term.

**Action:** Import all 26 `.md` files from teemill-backup into blog system.

---

## 🏗️ Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js (TypeScript) | Already in Hyperfocus-Home-Page repo |
| Database / Auth | Supabase | Already live and working with shop |
| Styling | Tailwind CSS | Clean, fast, ADHD-friendly design tokens |
| Payments | Stripe + Crypto option | Card + Web3 both supported |
| Blog | MDX + Supabase | 26 backed-up `.md` files drop straight in |
| Hosting | Vercel | Instant deploys, built for Next.js |
| IPFS | Pinata (archive only) | Keep as preservation layer, not primary host |
| Admin | Custom Mission Control | Hidden route + Supabase auth + allowlist |

---

## 🎨 Design System

### Brand Identity
- **Name:** WelshDog Designs / Hyperfocus Web3 Lab
- **Tagline:** "Built for brains that don't switch off"
- **Voice:** Playful broski energy + clean professional visuals
- **Vibe:** Fun, modern, giftable, affordable, neurodivergent-friendly

### Design Tokens
- **Primary accent:** Hyperfocus teal (`#01696f`)
- **Dark surfaces:** Deep charcoal/near-black for Mission Control
- **Typography:** Distinctive loaded fonts — not system defaults
- **Spacing:** 4px grid system throughout
- **Light + Dark mode:** Both supported with system preference toggle

### Key UI Rules
- Neurodivergent-friendly: clear hierarchy, no overwhelming walls of text
- No generic AI-aesthetic: no gradient buttons, no icon-in-coloured-circles giveaways
- Product cards: surface elevation, not coloured side borders
- Mobile first: touch targets 44x44px minimum, bottom-anchored CTAs

---

## 🤖 Mission Control Features

The hidden admin panel accessed via footer easter egg ("Made with" → `/admin`).

### Agents Lab
- Architect, Code, Research, UX/Flow, Narrator, Experiment
- Toggle IDLE/ACTIVE state with round-trip button labels
- Command Deck terminal logs all actions in real time
- System vitals: Health %, Hyperfocus status, Network, CPU, MEM

### Real Workflows to Wire Up
| Agent | Real action when activated |
|---|---|
| Research | Opens topic input → logs research task |
| Narrator | Creates new draft blog post |
| Code | Opens GitHub repo link / triggers backup |
| UX/Flow | Opens design system / Figma |

### Lead Pipeline
- "Book a Demo" form on white-label page → Supabase `leads` table → visible in `/admin/leads`
- Auto email confirmation to customer on form submission
- Mission Control shows new leads with notification badge

---

## 📝 Blog System

### Import Plan
1. Copy all 26 `.md` files from `scripts/teemill-backup/blogs/` into `content/blog/`
2. Add frontmatter to each file: title, date, slug, category, tags, excerpt
3. Build blog index page with filter by category: ADHD, Dyslexia, Tech, Neurodiversity, Creativity
4. Set up MDX rendering for rich content
5. Add related posts + social share per post

### Categories from existing 26 posts
- ADHD & Neurodiversity (8 posts)
- Dyslexia (5 posts)
- Tech & AI (5 posts)
- Creativity & Game Design (4 posts)
- Personal & Life (4 posts)

---

## 🚀 Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] Set up Next.js project structure in `Hyperfocus-Home-Page` repo
- [ ] Configure Supabase tables: products, orders, leads, blogs, subscribers
- [ ] Build design system: tokens, fonts, base CSS, dark mode
- [ ] Homepage skeleton: hero, featured products, white-label teaser

### Phase 2 — Shop (Week 2)
- [ ] Product catalogue page with filters
- [ ] Product detail pages with Stripe checkout
- [ ] Crypto payment option (card + Web3 toggle)
- [ ] Migrate 19 products from IPFS prototype

### Phase 3 — Blog (Week 3)
- [ ] Blog index page with categories
- [ ] Import all 26 backed-up `.md` files with frontmatter
- [ ] Individual blog post pages
- [ ] Subscribe / email capture integrated

### Phase 4 — White-Label & Admin (Week 4)
- [ ] White-label page: "Book a Demo" + "Buy Your Shop" CTAs
- [ ] Lead auto-delivery: form → Supabase → confirmation email
- [ ] Mission Control rebuild: clean, wired to real Supabase data
- [ ] Agents Lab with real action triggers
- [ ] Hidden footer easter egg → `/admin` route

### Phase 5 — Polish & Launch (Week 5)
- [ ] Full mobile audit (375px)
- [ ] SEO: meta tags, OG images, sitemap (33 rows from seo_data.csv)
- [ ] Dark/light mode toggle
- [ ] Performance audit: LCP < 2s, no layout shift
- [ ] Deploy to Vercel + custom domain

---

## 🔑 Key Files in Repo

```
Hyperfocus-Home-Page/
├── scripts/
│   ├── teemill-backup/
│   │   ├── blogs/          ← 26 .md files ready to import
│   │   ├── pages/          ← 7 page backups
│   │   ├── seo/            ← seo_data.csv (33 rows)
│   │   └── manifest.csv    ← full verification
│   └── teemill_backup.py
├── content/
│   └── blog/               ← 26 posts land here in Phase 3
├── src/
│   ├── app/                ← Next.js app router pages
│   ├── components/         ← Reusable UI components
│   └── lib/                ← Supabase client, helpers
└── WELSHDOG-SHOP-PLAN.md   ← This document
```

---

## 🏆 North Star

The new WelshDog Designs shop should feel like a **creator-built operating system for a neurodivergent maker brand** — not just another merch store. Someone lands on the homepage and within 10 seconds they know: this person makes original stuff, has a genuine story, and is also selling the machine that powers it all.

The IPFS prototype proved the concept and voice. The new build proves it at scale.

> "Built for the hyperfocused. Not the perfect." 🐕🏴󠁧󠁢󠁷󠁬󠁳󠁡
