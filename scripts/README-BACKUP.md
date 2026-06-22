# 🔥 Teemill Backup Script

> Fully automated backup of all Teemill content before closing the account.

## What it saves

| Content | Where saved | Format |
|---------|-------------|--------|
| 26 blog posts | `teemill-backup/blogs/` | `.md` with frontmatter |
| 17 store pages | `teemill-backup/pages/` | `.md` |
| Products (via API) | `teemill-backup/products/` | `.json` + `.csv` |
| All images | `teemill-backup/images/` | Original format |
| SEO metadata | `teemill-backup/seo/` | `.csv` |
| Run log | `teemill-backup/backup_run.log` | Text |
| Manifest | `teemill-backup/manifest.csv` | CSV |
| Missing items | `teemill-backup/missing-items.txt` | Text |

## Setup

```bash
# 1. Go into scripts folder
cd scripts

# 2. Install dependencies
pip install -r requirements-backup.txt

# 3. Run dry-run first (no downloads, preview only)
python teemill_backup.py --store hyperfocus-mode --dry-run

# 4. Run the real backup (no token = blogs + pages + images only)
python teemill_backup.py --store hyperfocus-mode

# 5. Run with API token for product data too
python teemill_backup.py --store hyperfocus-mode --token YOUR_TOKEN_HERE
```

## After backup

1. Check `teemill-backup/manifest.csv` — verify all 26 blogs + 17 pages are `OK`
2. Check `teemill-backup/missing-items.txt` — if empty, you're good!
3. Copy `teemill-backup/blogs/*.md` into `content/blogs/` in this repo
4. Copy `teemill-backup/images/` into `public/` in this repo
5. Cancel Teemill Pro — never look back 💀

## Output folder structure

```
teemill-backup/
  blogs/          ← 26 .md files
  pages/          ← 17 .md files
  products/       ← products.json + products.csv
  images/
    blogs/        ← blog hero images
    pages/        ← page images
    products/     ← product mockups
  seo/
    seo_data.csv  ← all meta titles, descriptions, og:images
  manifest.csv    ← full inventory
  missing-items.txt
  backup_run.log
```
