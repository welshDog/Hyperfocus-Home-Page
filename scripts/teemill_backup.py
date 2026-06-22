#!/usr/bin/env python3
"""
🔥 TEEMILL BACKUP SCRIPT — Hyperfocus Zone
Author: WelshDog (Lyndon Williams)
Usage: python teemill_backup.py --token YOUR_TOKEN --store hyperfocus-mode
       python teemill_backup.py --store hyperfocus-mode --dry-run

What this does:
  1. Scrapes all 26 blog posts → saves as .md files
  2. Scrapes all 17 store pages → saves as .md files
  3. Pulls product data via Teemill API → saves CSV + JSON
  4. Downloads ALL images (blogs, pages, products)
  5. Extracts SEO metadata from every page
  6. Generates manifest.csv + missing-items.txt
  7. Prints final summary + coloured status
"""

import argparse
import csv
import json
import logging
import os
import re
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

try:
    from markdownify import markdownify as md
except ImportError:
    def md(html, **kwargs):
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator='\n')

try:
    from tqdm import tqdm
except ImportError:
    def tqdm(iterable, **kwargs):
        return iterable

# ── Colour helpers ───────────────────────────────────────────────────────────
def ok(msg):    print(f"✅ {msg}")
def info(msg):  print(f"ℹ️  {msg}")
def warn(msg):  print(f"⚠️  {msg}")
def err(msg):   print(f"❌ {msg}")
def head(msg):  print(f"\n🔥 {msg}\n{'─'*50}")

# ── Config ───────────────────────────────────────────────────────────────────
BASE_DIR     = Path("teemill-backup")
BLOGS_DIR    = BASE_DIR / "blogs"
PAGES_DIR    = BASE_DIR / "pages"
PRODUCTS_DIR = BASE_DIR / "products"
IMAGES_DIR   = BASE_DIR / "images"
SEO_DIR      = BASE_DIR / "seo"
LOG_FILE     = BASE_DIR / "backup_run.log"
MANIFEST     = BASE_DIR / "manifest.csv"
MISSING      = BASE_DIR / "missing-items.txt"

for d in [BLOGS_DIR, PAGES_DIR, PRODUCTS_DIR,
          IMAGES_DIR/"blogs", IMAGES_DIR/"pages", IMAGES_DIR/"products", SEO_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("teemill_backup")

# ── All 26 blogs (slug → title) ──────────────────────────────────────────────
BLOGS = [
    ("welcome-to-hyperfocus-mode",      "Welcome to Hyperfocus Mode: Unique Minds, Creative Paths"),
    ("the-power-of-hyperfocus",         "The Power of Hyperfocus"),
    ("family-friendship-mental-health", "Family, Friendship, and Mental Health"),
    ("overcoming-adversity",            "Overcoming Adversity and Redefining My Path"),
    ("childhood-of-wonder",             "A Childhood of Wonder and Exploration"),
    ("realities-of-dyslexia-adhd",      "The Realities of Living with Dyslexia and ADHD"),
    ("living-undiagnosed",              "Living Undiagnosed – My Journey to Understanding ADHD in Adulthood"),
    ("raising-adhd-awareness",          "Raising ADHD Awareness – Why I Create Content About Neurodiversity"),
    ("coping-mechanisms-self-discovery","Coping Mechanisms and Self-Discovery"),
    ("finding-my-voice",                "Finding My Voice Through Creativity"),
    ("looking-to-the-future",           "Looking to the Future"),
    ("reflections-on-life",             "Reflections on Life and Society"),
    ("joy-of-learning",                 "The Joy of Learning and Reinvention"),
    ("creativity-game-design",          "Creativity and the World of Game Design"),
    ("breaking-myths-dyslexia",         "Breaking the Myths: What Dyslexia Really Is"),
    ("dyslexia-strengths",              "Dyslexia: Understanding the Strengths Behind the Struggles"),
    ("dyslexia-types",                  "The Importance of Understanding Dyslexia Types"),
    ("neurodiversity-celebration",      "Neurodiversity: A Celebration of Different Minds"),
    ("ai-tools-neurodivergent",         "AI Tools for Neurodivergent Developers"),
    ("vibe-coding",                     "Vibe Coding?"),
    ("hyper-coding",                    "Hyper Coding?"),
    ("best-free-ai-coding-tools-2025",  "Best Free AI Coding Tools in 2025"),
    ("openai-new-stuff",                "OpenAI's New Stuff"),
    ("nfts-next-generation",            "NFT's The Next Tech Generation"),
    ("what-is-cryptocurrencies",        "What is Cryptocurrencies (Do You Really Know)"),
    ("lets-talk-crypto",               "Lets Talk about Crypto"),
]

# ── All 17 pages (path → label) ──────────────────────────────────────────────
PAGES = [
    ("/",                                    "homepage"),
    ("/collection/hyperfocus-mode-zone/",    "hyperfocus-mode-zone"),
    ("/collection/neurovariance/",           "neurovariance"),
    ("/collection/broski-clan-wear/",        "broski-clan-wear"),
    ("/collection/pi-network-nft-zone/",     "pi-network-nft-zone"),
    ("/collection/hyperfocus-mode-nft-zone/","hyperfocus-mode-nft-zone"),
    ("/collection/welshdog-referrals/",      "welshdog-referrals"),
    ("/collection/xdwelshdog-wear/",         "xdwelshdog-wear"),
    ("/collection/planting-trees/",          "planting-trees"),
    ("/collection/hyperfocus-studio-dream/", "hyperfocus-studio-dream"),
    ("/collection/the-funny-side-of-welsh/", "the-funny-side-of-welsh"),
    ("/collection/neurovariance-zone/",      "neurovariance-zone"),
    ("/collection/hyperfocus-mode-stickers/","hyperfocus-mode-stickers"),
    ("/collection/gen-x-rules/",             "gen-x-rules"),
    ("/blog/",                               "blog-index"),
    ("/collection/hyperfocus-3d-printing-zone/",  "3d-printing-zone"),
    ("/collection/hyperfocus-mode-crypto-zone/",  "crypto-zone"),
]

# ── HTTP helpers ─────────────────────────────────────────────────────────────
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (WelshDog-Backup/1.0) HyperfocusZone"
})

def fetch(url, retries=3, delay=2):
    for attempt in range(retries):
        try:
            r = SESSION.get(url, timeout=15)
            if r.status_code == 200:
                return r
            warn(f"HTTP {r.status_code} → {url}")
            log.warning(f"HTTP {r.status_code} → {url}")
            return None
        except Exception as e:
            warn(f"Attempt {attempt+1} failed for {url}: {e}")
            time.sleep(delay)
    err(f"FAILED after {retries} attempts: {url}")
    log.error(f"FAILED: {url}")
    return None

def download_image(img_url, dest_dir, dry_run=False):
    """Download an image and return local filename or None."""
    try:
        parsed = urlparse(img_url)
        filename = Path(parsed.path).name or "image.jpg"
        filename = re.sub(r'[^\w\-\.]+', '_', filename)[:80]
        dest = Path(dest_dir) / filename
        if dest.exists():
            return filename
        if dry_run:
            return f"[DRY-RUN] {filename}"
        r = SESSION.get(img_url, timeout=20, stream=True)
        if r.status_code == 200:
            with open(dest, 'wb') as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            return filename
    except Exception as e:
        log.warning(f"Image download failed {img_url}: {e}")
    return None

def extract_seo(soup, url):
    """Extract meta title, description, og:image, canonical."""
    def meta(name=None, prop=None):
        tag = soup.find('meta', attrs={'name': name} if name else {'property': prop})
        return tag.get('content', '').strip() if tag else ''
    canonical_tag = soup.find('link', rel='canonical')
    return {
        'url':         url,
        'meta_title':  soup.title.string.strip() if soup.title else '',
        'meta_desc':   meta(name='description'),
        'og_image':    meta(prop='og:image'),
        'canonical':   canonical_tag.get('href', '') if canonical_tag else '',
    }

# ── 1. BLOG BACKUP ───────────────────────────────────────────────────────────
def backup_blogs(store_url, dry_run, manifest_rows, missing):
    head("PHASE 1 — Blog Backup (26 posts)")
    seo_rows = []

    for slug, title in tqdm(BLOGS, desc="Blogs"):
        url = f"{store_url}/blog/{slug}/"
        info(f"Fetching: {url}")
        r = fetch(url)

        if not r:
            warn(f"MISSING blog: {slug}")
            missing.append(f"BLOG\t{slug}\t{url}")
            manifest_rows.append(['blog', title, slug, url, '', 0, 'MISSING'])
            continue

        soup = BeautifulSoup(r.text, 'html.parser')
        seo_rows.append(extract_seo(soup, url))

        # Try common blog content selectors
        content_el = (
            soup.find('article') or
            soup.find(class_=re.compile(r'blog.?content|post.?content|entry.?content', re.I)) or
            soup.find('main')
        )
        body_html = str(content_el) if content_el else r.text
        body_md   = md(body_html, heading_style='ATX', bullets='-')

        # Download images
        imgs_saved = 0
        if not dry_run:
            for img in soup.find_all('img', src=True):
                img_url = urljoin(url, img['src'])
                if download_image(img_url, IMAGES_DIR/"blogs"):
                    imgs_saved += 1

        # Write markdown file
        frontmatter = (
            f"---\n"
            f"title: \"{title}\"\n"
            f"slug: {slug}\n"
            f"source_url: {url}\n"
            f"migrated: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"author: WelshDog (Lyndon Williams)\n"
            f"---\n\n"
        )
        out_file = BLOGS_DIR / f"{slug}.md"
        if not dry_run:
            out_file.write_text(frontmatter + body_md, encoding='utf-8')
            ok(f"Saved: {out_file}")
        else:
            ok(f"[DRY-RUN] Would save: {out_file}")

        manifest_rows.append(['blog', title, slug, url, str(out_file), imgs_saved, 'OK'])
        log.info(f"Blog saved: {slug}")

    return seo_rows

# ── 2. PAGE BACKUP ───────────────────────────────────────────────────────────
def backup_pages(store_url, dry_run, manifest_rows, missing):
    head("PHASE 2 — Page Backup (17 pages)")
    seo_rows = []

    for path, label in tqdm(PAGES, desc="Pages"):
        url = f"{store_url}{path}"
        info(f"Fetching: {url}")
        r = fetch(url)

        if not r:
            warn(f"MISSING page: {label}")
            missing.append(f"PAGE\t{label}\t{url}")
            manifest_rows.append(['page', label, label, url, '', 0, 'MISSING'])
            continue

        soup = BeautifulSoup(r.text, 'html.parser')
        seo_rows.append(extract_seo(soup, url))

        main_el = soup.find('main') or soup.find('body')
        body_md = md(str(main_el), heading_style='ATX', bullets='-') if main_el else ''

        imgs_saved = 0
        if not dry_run:
            for img in soup.find_all('img', src=True):
                img_url = urljoin(url, img['src'])
                if download_image(img_url, IMAGES_DIR/"pages"):
                    imgs_saved += 1

        frontmatter = (
            f"---\n"
            f"page: \"{label}\"\n"
            f"source_url: {url}\n"
            f"migrated: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"---\n\n"
        )
        out_file = PAGES_DIR / f"{label}.md"
        if not dry_run:
            out_file.write_text(frontmatter + body_md, encoding='utf-8')
            ok(f"Saved: {out_file}")
        else:
            ok(f"[DRY-RUN] Would save: {out_file}")

        manifest_rows.append(['page', label, label, url, str(out_file), imgs_saved, 'OK'])
        log.info(f"Page saved: {label}")

    return seo_rows

# ── 3. PRODUCT BACKUP ────────────────────────────────────────────────────────
def backup_products(store_url, token, dry_run, manifest_rows, missing):
    head("PHASE 3 — Product Backup (API)")

    if not token:
        warn("No API token — skipping product API. Add --token to enable.")
        return

    api_url = f"{store_url}/api/v1/product/"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        r = SESSION.get(api_url, headers=headers, timeout=15)
        if r.status_code != 200:
            warn(f"Product API returned {r.status_code}. Check your token.")
            return

        products = r.json()
        if isinstance(products, dict):
            products = products.get('results', products.get('products', [products]))

        ok(f"Found {len(products)} products via API")

        if not dry_run:
            # Save JSON
            json_file = PRODUCTS_DIR / "products.json"
            json_file.write_text(json.dumps(products, indent=2), encoding='utf-8')
            ok(f"Saved: {json_file}")

            # Save CSV
            csv_file = PRODUCTS_DIR / "products.csv"
            if products:
                keys = list(products[0].keys())
                with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                    w = csv.DictWriter(f, fieldnames=keys, extrasaction='ignore')
                    w.writeheader()
                    w.writerows(products)
                ok(f"Saved: {csv_file}")

            # Download product images
            imgs_saved = 0
            for p in tqdm(products, desc="Product images"):
                for key in ['image', 'image_url', 'thumbnail', 'photo']:
                    img_url = p.get(key)
                    if img_url:
                        if download_image(img_url, IMAGES_DIR/"products"):
                            imgs_saved += 1
                        break

            for p in products:
                manifest_rows.append([
                    'product',
                    p.get('name', p.get('title', 'Unknown')),
                    p.get('slug', p.get('id', '')),
                    api_url,
                    str(PRODUCTS_DIR / 'products.json'),
                    imgs_saved,
                    'OK'
                ])
        else:
            ok(f"[DRY-RUN] Would save {len(products)} products")

    except Exception as e:
        err(f"Product backup failed: {e}")
        log.error(f"Product backup: {e}")

# ── 4. SEO EXPORT ────────────────────────────────────────────────────────────
def save_seo(all_seo):
    head("PHASE 4 — SEO Data Export")
    seo_file = SEO_DIR / "seo_data.csv"
    with open(seo_file, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['url','meta_title','meta_desc','og_image','canonical'])
        w.writeheader()
        w.writerows(all_seo)
    ok(f"SEO data saved: {seo_file} ({len(all_seo)} rows)")

# ── 5. MANIFEST ──────────────────────────────────────────────────────────────
def save_manifest(manifest_rows, missing):
    head("PHASE 5 — Manifest + Verification")
    with open(MANIFEST, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['type','title','slug','url','local_file','images_saved','status'])
        w.writerows(manifest_rows)
    ok(f"Manifest saved: {MANIFEST}")

    if missing:
        MISSING.write_text('\n'.join(missing), encoding='utf-8')
        warn(f"{len(missing)} missing items logged to {MISSING}")
    else:
        ok("No missing items! Full backup confirmed ✅")

# ── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description='🔥 WelshDog Teemill Backup — Hyperfocus Zone'
    )
    parser.add_argument('--store',   default='hyperfocus-mode', help='Teemill store slug')
    parser.add_argument('--token',   default='',                help='Teemill API token')
    parser.add_argument('--dry-run', action='store_true',       help='Preview without downloading')
    args = parser.parse_args()

    store_url = f"https://{args.store}.teemill.com"

    print("\n" + "="*55)
    print("  🔥 WELSHDOG TEEMILL BACKUP — HYPERFOCUS ZONE")
    print("  Built by a dyslexic Welsh dev. Zero apologies.")
    print("="*55)
    info(f"Store:   {store_url}")
    info(f"Output:  {BASE_DIR.resolve()}")
    info(f"Dry run: {args.dry_run}")
    print()

    log.info(f"Backup started — store={store_url} dry_run={args.dry_run}")

    manifest_rows = []
    missing       = []
    all_seo       = []

    # Run all phases
    all_seo += backup_blogs(store_url, args.dry_run, manifest_rows, missing)
    all_seo += backup_pages(store_url, args.dry_run, manifest_rows, missing)
    backup_products(store_url, args.token, args.dry_run, manifest_rows, missing)
    save_seo(all_seo)
    save_manifest(manifest_rows, missing)

    # ── Final summary ────────────────────────────────────────────────────────
    ok_count     = sum(1 for r in manifest_rows if r[-1] == 'OK')
    miss_count   = len(missing)
    blog_count   = sum(1 for r in manifest_rows if r[0]=='blog' and r[-1]=='OK')
    page_count   = sum(1 for r in manifest_rows if r[0]=='page' and r[-1]=='OK')
    prod_count   = sum(1 for r in manifest_rows if r[0]=='product' and r[-1]=='OK')
    total_imgs   = sum(int(r[5]) for r in manifest_rows if str(r[5]).isdigit())

    print("\n" + "="*55)
    print("  🏁 BACKUP COMPLETE — WELSHDOG OUT")
    print("="*55)
    print(f"  📝 Blogs saved:    {blog_count} / 26")
    print(f"  📄 Pages saved:    {page_count} / 17")
    print(f"  🛍️  Products saved: {prod_count}")
    print(f"  🖼️  Images saved:   {total_imgs}")
    print(f"  ✅ Total OK:       {ok_count}")
    print(f"  ❌ Missing:        {miss_count}")
    print(f"  📁 Output folder:  {BASE_DIR.resolve()}")
    if miss_count:
        print(f"  ⚠️  Check:         {MISSING}")
    print("="*55 + "\n")

    log.info(f"Backup complete — OK={ok_count} MISSING={miss_count}")

if __name__ == '__main__':
    main()
