/**
 * Universal URL adapter — the "paste any store URL" fallback.
 *
 * Reads schema.org JSON-LD Product data embedded in the page (Shopify,
 * WooCommerce, Squarespace, BigCommerce and most modern stores emit it).
 * Best-effort: returns whatever Product schema is present. Lowest detect
 * confidence so it only wins when nothing more specific matches.
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
function collectProducts(node: any, acc: any[]): void {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const n of node) collectProducts(n, acc)
    return
  }
  const type = node['@type']
  if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
    acc.push(node)
  }
  if (node['@graph']) collectProducts(node['@graph'], acc)
  if (node.itemListElement) collectProducts(node.itemListElement, acc)
  if (node.item) collectProducts(node.item, acc)
}

function priceOf(offers: any): number {
  if (!offers) return 0
  const o = Array.isArray(offers) ? offers[0] : offers
  return Number(o?.price ?? o?.lowPrice ?? 0) || 0
}

function imagesOf(image: any): string[] {
  if (!image) return []
  if (typeof image === 'string') return [image]
  if (Array.isArray(image)) {
    return image.map((i) => (typeof i === 'string' ? i : i?.url)).filter(Boolean)
  }
  if (image.url) return [image.url]
  return []
}

export async function importFromUrl(url: string): Promise<ImportedProduct[]> {
  const target = url.startsWith('http') ? url : `https://${url}`
  const res = await fetch(target, { headers: { 'user-agent': 'HyperImport/1.0' } })
  if (!res.ok) throw new Error(`Could not fetch ${target} (HTTP ${res.status}).`)
  return extractProductsFromHtml(await res.text(), target)
}

/** Pure: pull schema.org Product data out of page HTML. */
export function extractProductsFromHtml(
  html: string,
  fallbackUrl = '',
): ImportedProduct[] {
  const target = fallbackUrl
  const scripts =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ) || []

  const raw: any[] = []
  for (const s of scripts) {
    const json = s
      .replace(/<script[^>]*>/i, '')
      .replace(/<\/script>/i, '')
      .trim()
    try {
      collectProducts(JSON.parse(json), raw)
    } catch {
      /* skip malformed JSON-LD block */
    }
  }

  const out: ImportedProduct[] = []
  for (const p of raw) {
    if (!p.name) continue
    out.push(
      normalise({
        name: p.name,
        description: typeof p.description === 'string' ? p.description : '',
        price: priceOf(p.offers),
        images: imagesOf(p.image),
        external_url: typeof p.url === 'string' ? p.url : target,
      }),
    )
  }
  return out
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const jsonLdAdapter: ImportAdapter = {
  id: 'jsonld',
  label: 'Any store URL',
  async detect() {
    return 0.2 // universal fallback
  },
  async connect(input) {
    return importFromUrl(input.url ?? '')
  },
}
