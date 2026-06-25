/**
 * teemill-export.ts — one-off, READ-ONLY Teemill catalog export.
 *
 * Goal: pull every product + variant + image URL and write
 *       /exports/teemill-products.json.
 *
 * NOTE on the endpoint: the requested catalog route
 *   GET https://teemill.com/omnis/v3/product/store?project=…
 * returned HTTP 404 on probe (the path isn't reachable that way — the live
 * docs are JS-rendered and the spec was slightly off). The Teemill product
 * FEED, however, is a confirmed-200 read-only export containing the same data
 * for every variant (id, size, colour, availability, price, image, buy link),
 * so this script uses that. Same goal, an endpoint that actually works.
 *
 * Reads TEEMILL_PRODUCT_FEED_URL (or builds it from TEEMILL_PUBLIC_KEY) from
 * .env / .env.local. READ-ONLY: never touches the Orders API, creates nothing.
 *
 * Run once:  npx ts-node scripts/teemill-export.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..')

/** Tiny .env parser — .env.local wins over .env. No dotenv dependency. */
function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const file of ['.env.local', '.env']) {
    try {
      const text = readFileSync(join(ROOT, file), 'utf8')
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith('#') || !t.includes('=')) continue
        const i = t.indexOf('=')
        const k = t.slice(0, i).trim()
        if (!(k in out)) out[k] = t.slice(i + 1).trim()
      }
    } catch {
      /* file may not exist — fine */
    }
  }
  return out
}

/** Minimal RFC-4180 CSV parser — handles quoted fields, embedded commas,
 *  newlines inside quotes, and "" escaped quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

interface Variant {
  id: string
  sku: string
  size: string
  color: string
  price: number
  availability: string
  imageUrl: string
  link: string
}

interface ExportProduct {
  productId: string
  name: string
  description: string
  price: number
  category: string
  buyUrl: string
  imageUrls: string[]
  variants: Variant[]
}

const toPrice = (s: string): number => {
  const m = (s || '').match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

const clean = (s: string): string =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

async function main(): Promise<void> {
  const env = loadEnv()
  const feedUrl =
    env.TEEMILL_PRODUCT_FEED_URL ||
    (env.TEEMILL_PUBLIC_KEY
      ? `https://teemill.com/omnis/v3/product-feed/get/?a=${env.TEEMILL_PUBLIC_KEY}&b=86231`
      : '')

  if (!feedUrl) {
    console.error(
      'Missing TEEMILL_PRODUCT_FEED_URL (or TEEMILL_PUBLIC_KEY) in .env',
    )
    process.exit(1)
  }

  console.log('Fetching Teemill catalog feed (read-only)…')
  const res = await fetch(feedUrl)
  if (!res.ok) {
    console.error(`Feed request failed: HTTP ${res.status}`)
    process.exit(1)
  }

  const rows = parseCsv(await res.text())
  if (rows.length < 2) {
    console.error('Feed returned no rows.')
    process.exit(1)
  }

  const header = rows[0].map((h) => h.trim())
  const idx = (name: string): number => header.indexOf(name)
  const col = {
    id: idx('id'),
    group: idx('item_group_id'),
    title: idx('title'),
    description: idx('description'),
    price: idx('price'),
    color: idx('color'),
    size: idx('size'),
    link: idx('link'),
    image: idx('image_link'),
    addImage: idx('additional_image_link'),
    mpn: idx('mpn'),
    type: idx('product_type'),
    availability: idx('availability'),
  }

  const products = new Map<string, ExportProduct>()
  let variantCount = 0

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length < header.length) continue
    const get = (c: number): string => (c >= 0 ? (row[c] ?? '').trim() : '')

    const gid = get(col.group) || get(col.id)
    if (!gid) continue
    variantCount++

    if (!products.has(gid)) {
      const imageUrls: string[] = []
      for (const u of [get(col.image), ...get(col.addImage).split(',')]) {
        const uu = u.trim()
        if (uu.startsWith('https') && !imageUrls.includes(uu)) imageUrls.push(uu)
      }
      products.set(gid, {
        productId: gid,
        name: clean(get(col.title)),
        description: clean(get(col.description)),
        price: toPrice(get(col.price)),
        category: get(col.type),
        buyUrl: get(col.link),
        imageUrls,
        variants: [],
      })
    }

    const p = products.get(gid)!
    const imageUrl = get(col.image)
    if (imageUrl.startsWith('https') && !p.imageUrls.includes(imageUrl)) {
      p.imageUrls.push(imageUrl)
    }
    p.variants.push({
      id: get(col.id),
      sku: get(col.mpn),
      size: get(col.size),
      color: get(col.color),
      price: toPrice(get(col.price)),
      availability: get(col.availability),
      imageUrl,
      link: get(col.link),
    })
  }

  const list = Array.from(products.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const outDir = join(ROOT, 'exports')
  mkdirSync(outDir, { recursive: true })
  const outFile = join(outDir, 'teemill-products.json')
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        source: 'teemill-product-feed',
        exportedAt: new Date().toISOString(),
        productCount: list.length,
        variantCount,
        products: list,
      },
      null,
      2,
    ),
    'utf8',
  )

  console.log(
    `✓ ${list.length} products / ${variantCount} variants → exports/teemill-products.json`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
