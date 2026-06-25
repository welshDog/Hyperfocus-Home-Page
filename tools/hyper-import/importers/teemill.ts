/**
 * Teemill importer — adapts scripts/teemill-export.ts.
 *
 * Uses the Teemill product FEED (returns every product + variant reliably).
 * The Catalog API's list pagination is unreliable, so the feed is the source.
 * `teemill_variant_id` is intentionally NOT set here — the feed's numeric id is
 * not the Orders-API `variantRef` (that comes from the Catalog API), so imported
 * apparel defaults to link-out / self-fulfilment, which is the safe behaviour.
 */

import { type ImportedProduct, normalise, parseCsvRows } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

function feedUrl(apiKey?: string): string {
  // Allow pasting a full feed URL; otherwise use the configured store feed.
  if (apiKey && apiKey.startsWith('http')) return apiKey
  if (process.env.TEEMILL_PRODUCT_FEED_URL) {
    return process.env.TEEMILL_PRODUCT_FEED_URL
  }
  if (process.env.TEEMILL_PUBLIC_KEY) {
    return `https://teemill.com/omnis/v3/product-feed/get/?a=${process.env.TEEMILL_PUBLIC_KEY}&b=86231`
  }
  return ''
}

export async function importFromTeemill(
  opts: { apiKey?: string } = {},
): Promise<ImportedProduct[]> {
  const url = feedUrl(opts.apiKey)
  if (!url) {
    throw new Error(
      'Teemill feed not configured — set TEEMILL_PRODUCT_FEED_URL or TEEMILL_PUBLIC_KEY, or paste a feed URL.',
    )
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Teemill feed request failed: HTTP ${res.status}`)

  const rows = parseCsvRows(await res.text())
  if (rows.length < 2) return []

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
  }

  const byGroup = new Map<string, ImportedProduct>()
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length < header.length) continue
    const get = (c: number): string => (c >= 0 ? (row[c] ?? '').trim() : '')

    const gid = get(col.group) || get(col.id)
    if (!gid) continue

    if (!byGroup.has(gid)) {
      const images = [get(col.image), ...get(col.addImage).split(',')]
      byGroup.set(
        gid,
        normalise({
          name: get(col.title),
          description: get(col.description),
          price: get(col.price),
          images,
          external_url: get(col.link),
          variants: [],
        }),
      )
    }

    const p = byGroup.get(gid)!
    const img = get(col.image)
    if (/^https?:\/\//.test(img) && !p.images.includes(img)) p.images.push(img)

    const variantName = [get(col.size), get(col.color)].filter(Boolean).join(' / ')
    if (variantName) {
      p.variants = p.variants ?? []
      if (!p.variants.some((v) => v.name === variantName)) {
        p.variants.push({ name: variantName })
      }
    }
  }

  return Array.from(byGroup.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export const teemillAdapter: ImportAdapter = {
  id: 'teemill',
  label: 'Teemill',
  async detect(input) {
    const hay = `${input.url ?? ''} ${input.apiKey ?? ''}`.toLowerCase()
    return hay.includes('teemill') ? 0.95 : 0
  },
  async connect(input) {
    return importFromTeemill({ apiKey: input.apiKey || input.url })
  },
}
