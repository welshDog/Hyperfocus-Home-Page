/**
 * Etsy adapter — Etsy Open API v3 (https://developers.etsy.com/documentation).
 *
 * Reads a shop's ACTIVE listings using an app-level API key (x-api-key header).
 * Public listings need no OAuth. Accepts a shop name or a full Etsy shop URL.
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

const API = 'https://openapi.etsy.com/v3/application'

/** Extract the shop name from a full URL, or pass through a bare name. */
export function etsyShopName(identifier: string): string {
  const m = identifier.match(/etsy\.com\/shop\/([^/?#]+)/i)
  return (m ? decodeURIComponent(m[1]) : identifier).trim()
}

interface EtsyListing {
  title?: string
  description?: string
  price?: { amount?: number; divisor?: number }
  url?: string
  tags?: string[]
  images?: { url_fullxfull?: string }[]
}

export async function importFromEtsy(
  shopIdentifier: string,
): Promise<ImportedProduct[]> {
  const key = process.env.ETSY_API_KEY
  if (!key) throw new Error('ETSY_API_KEY not set — see .env.local.example')

  const name = etsyShopName(shopIdentifier)
  if (!name) throw new Error('Etsy shop not found — check the shop name')

  const headers = { 'x-api-key': key, accept: 'application/json' }

  // 1) shop name → shop_id
  const shopRes = await fetch(
    `${API}/shops?shop_name=${encodeURIComponent(name)}`,
    { headers },
  )
  if (!shopRes.ok) throw new Error('Etsy shop not found — check the shop name')
  const shopData = (await shopRes.json()) as {
    results?: { shop_id?: number }[]
  }
  const shopId = shopData.results?.[0]?.shop_id
  if (!shopId) throw new Error('Etsy shop not found — check the shop name')

  // 2) active listings (paged), with images
  const out: ImportedProduct[] = []
  let offset = 0
  for (let page = 0; page < 50; page++) {
    const res = await fetch(
      `${API}/shops/${shopId}/listings/active?limit=100&offset=${offset}&includes[]=Images&includes[]=MainImage`,
      { headers },
    )
    if (!res.ok) {
      if (page === 0 && res.status === 404) return [] // no listings is not an error
      break
    }
    const data = (await res.json()) as { results?: EtsyListing[] }
    const results = data.results ?? []
    if (!results.length) break

    for (const l of results) {
      const divisor = l.price?.divisor || 100
      const amount = l.price?.amount ?? 0
      out.push(
        normalise({
          name: l.title,
          description: l.description, // normalise() strips HTML
          price: divisor ? amount / divisor : amount,
          images: (l.images ?? [])
            .map((im) => im.url_fullxfull ?? '')
            .filter(Boolean),
          external_url: l.url,
          tags: l.tags,
        }),
      )
    }

    if (results.length < 100) break
    offset += 100
  }
  return out
}

export const etsyAdapter: ImportAdapter = {
  id: 'etsy',
  label: 'Etsy',
  async detect(input) {
    const u = (input.url ?? input.apiKey ?? '').toLowerCase()
    return u.includes('etsy.com/shop/') ? 0.95 : 0
  },
  async connect(input) {
    return importFromEtsy(input.url ?? input.apiKey ?? '')
  },
}
