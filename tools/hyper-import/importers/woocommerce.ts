/**
 * WooCommerce adapter — uses the public Store API
 * ({store}/wp-json/wc/store/v1/products), which is readable without API keys
 * (it powers the storefront blocks). Paste any WooCommerce store URL.
 *
 * Migration intent: products import as self-fulfilled drafts (no external_url).
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

interface WooImage {
  src?: string
}
interface WooPrices {
  price?: string
  currency_minor_unit?: number
}
interface WooProduct {
  name?: string
  description?: string
  prices?: WooPrices
  images?: WooImage[]
}

function storeBase(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return `${u.protocol}//${u.host}`
  } catch {
    return ''
  }
}

/** Store API prices are integer minor units (e.g. "2000" + minor_unit 2). */
function wooPrice(prices?: WooPrices): number {
  if (!prices?.price) return 0
  const minor = prices.currency_minor_unit ?? 2
  return Number(prices.price) / Math.pow(10, minor)
}

export function mapWooProducts(products: WooProduct[]): ImportedProduct[] {
  return products
    .filter((p) => p.name)
    .map((p) =>
      normalise({
        name: p.name,
        description: p.description || '',
        price: wooPrice(p.prices),
        images: (p.images ?? []).map((i) => i.src ?? '').filter(Boolean),
      }),
    )
}

export async function importFromWoo(url: string): Promise<ImportedProduct[]> {
  const base = storeBase(url)
  if (!base) throw new Error('Invalid WooCommerce store URL.')

  const out: ImportedProduct[] = []
  for (let page = 1; page <= 50; page++) {
    const res = await fetch(
      `${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`,
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) {
      if (page === 1) {
        throw new Error(`WooCommerce Store API unavailable (HTTP ${res.status}).`)
      }
      break
    }
    const products = (await res.json()) as WooProduct[]
    if (!Array.isArray(products) || !products.length) break
    out.push(...mapWooProducts(products))
    if (products.length < 100) break
  }
  return out
}

export const woocommerceAdapter: ImportAdapter = {
  id: 'woocommerce',
  label: 'WooCommerce',
  async detect(input) {
    if (!input.url) return 0
    const base = storeBase(input.url)
    if (!base) return 0
    const lower = input.url.toLowerCase()
    if (lower.includes('wp-json') || lower.includes('woocommerce')) return 0.8
    try {
      const res = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=1`, {
        headers: { accept: 'application/json' },
      })
      if (res.ok) {
        const d = (await res.json()) as unknown
        if (Array.isArray(d)) return 0.8
      }
    } catch {
      /* not WooCommerce */
    }
    return 0
  },
  async connect(input) {
    return importFromWoo(input.url ?? '')
  },
}
