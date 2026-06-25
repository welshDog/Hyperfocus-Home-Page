/**
 * Shopify adapter — uses the public /products.json endpoint, which most
 * Shopify storefronts expose with no auth. Paste any Shopify store URL.
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

type ShopifyVariant = { title?: string; price?: string | number }
type ShopifyImage = { src?: string }
type ShopifyProduct = {
  title?: string
  body_html?: string
  handle?: string
  variants?: ShopifyVariant[]
  images?: ShopifyImage[]
}

function shopBase(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return `${u.protocol}//${u.host}`
  } catch {
    return ''
  }
}

export async function importFromShopify(url: string): Promise<ImportedProduct[]> {
  const base = shopBase(url)
  if (!base) throw new Error('Invalid Shopify store URL.')

  const out: ImportedProduct[] = []
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${base}/products.json?limit=250&page=${page}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      if (page === 1) {
        throw new Error(`Shopify products.json unavailable (HTTP ${res.status}).`)
      }
      break
    }
    const data = (await res.json()) as { products?: ShopifyProduct[] }
    const products = data.products ?? []
    if (!products.length) break

    for (const p of products) {
      const variants = p.variants ?? []
      out.push(
        normalise({
          name: p.title,
          description: p.body_html,
          price: variants[0]?.price,
          images: (p.images ?? []).map((im) => im.src ?? '').filter(Boolean),
          variants: variants.map((v) => ({
            name: v.title ?? '',
            price: Number(v.price) || undefined,
          })),
          external_url: p.handle ? `${base}/products/${p.handle}` : undefined,
        }),
      )
    }
    if (products.length < 250) break
  }
  return out
}

export const shopifyAdapter: ImportAdapter = {
  id: 'shopify',
  label: 'Shopify',
  async detect(input) {
    if (!input.url) return 0
    const base = shopBase(input.url)
    if (!base) return 0
    if (base.includes('myshopify.com')) return 0.9
    try {
      const res = await fetch(`${base}/products.json?limit=1`, {
        headers: { accept: 'application/json' },
      })
      if (res.ok) {
        const d = (await res.json()) as { products?: unknown }
        if (Array.isArray(d.products)) return 0.85
      }
    } catch {
      /* not Shopify */
    }
    return 0
  },
  async connect(input) {
    return importFromShopify(input.url ?? '')
  },
}
