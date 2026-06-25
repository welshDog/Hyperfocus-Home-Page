/**
 * Squarespace adapter — uses the public `?format=json` endpoint that any
 * Squarespace page returns. Point it at a shop/store/collection URL and it
 * reads the products out of the page JSON (no API key needed).
 *
 * Migration intent: products import as self-fulfilled drafts (no external_url).
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

interface SqMoney {
  value?: string
}
interface SqVariant {
  priceMoney?: SqMoney
  attributes?: Record<string, string>
}
interface SqStructured {
  variants?: SqVariant[]
  priceMoney?: SqMoney
}
interface SqItem {
  title?: string
  body?: string
  excerpt?: string
  assetUrl?: string
  items?: { assetUrl?: string }[]
  structuredContent?: SqStructured
  tags?: string[]
}

function sqPrice(s?: SqStructured): number {
  const v = s?.variants?.[0]?.priceMoney?.value ?? s?.priceMoney?.value
  return v ? Number(v) || 0 : 0
}

export function mapSquarespaceItems(items: SqItem[]): ImportedProduct[] {
  return items
    .filter((it) => it.title && it.structuredContent) // products carry structuredContent
    .map((it) => {
      const images = [it.assetUrl, ...(it.items ?? []).map((i) => i.assetUrl)].filter(
        (u): u is string => Boolean(u),
      )
      return normalise({
        name: it.title,
        description: it.body || it.excerpt || '',
        price: sqPrice(it.structuredContent),
        images,
        variants: (it.structuredContent?.variants ?? []).map((v) => ({
          name: Object.values(v.attributes ?? {}).join(' / '),
          price: v.priceMoney?.value ? Number(v.priceMoney.value) || undefined : undefined,
        })),
        tags: it.tags ?? [],
      })
    })
}

export async function importFromSquarespace(
  url: string,
): Promise<ImportedProduct[]> {
  const target = url.startsWith('http') ? url : `https://${url}`
  const sep = target.includes('?') ? '&' : '?'
  const res = await fetch(`${target}${sep}format=json`, {
    headers: { accept: 'application/json', 'user-agent': 'HyperImport/1.0' },
  })
  if (!res.ok) {
    throw new Error(`Could not fetch Squarespace data (HTTP ${res.status}).`)
  }
  const data = (await res.json().catch(() => null)) as { items?: SqItem[] } | null
  if (!data?.items) {
    throw new Error(
      'No Squarespace products found — link to your shop/store page.',
    )
  }
  return mapSquarespaceItems(data.items)
}

export const squarespaceAdapter: ImportAdapter = {
  id: 'squarespace',
  label: 'Squarespace',
  async detect(input) {
    const u = (input.url ?? '').toLowerCase()
    return u.includes('squarespace.com') ? 0.85 : 0
  },
  async connect(input) {
    return importFromSquarespace(input.url ?? '')
  },
}
