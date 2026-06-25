/**
 * Gumroad adapter — Gumroad API v2 (https://app.gumroad.com/api).
 *
 * Reads all products on the account with the user's access token. Gumroad
 * delivers digitally, so external_url (short_url) is KEPT — these import as
 * link-out products (buy on Gumroad).
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

const API = 'https://api.gumroad.com/v2'

interface GumroadOption {
  name?: string
  price_difference?: number
}
interface GumroadProduct {
  name?: string
  description?: string
  price?: number
  preview_url?: string
  short_url?: string
  tags?: string[]
  variants?: { options?: GumroadOption[] }[]
}

export async function importFromGumroad(
  apiKey: string,
): Promise<ImportedProduct[]> {
  if (!apiKey) {
    throw new Error('Gumroad access token required — paste it in the connect step')
  }

  const res = await fetch(
    `${API}/products?access_token=${encodeURIComponent(apiKey)}`,
    { headers: { accept: 'application/json' } },
  )
  const body = (await res.json().catch(() => null)) as {
    success?: boolean
    products?: GumroadProduct[]
  } | null

  if (!res.ok || !body || body.success !== true) {
    throw new Error('Gumroad API error — check your access token')
  }

  const out: ImportedProduct[] = []
  for (const p of body.products ?? []) {
    const options = (p.variants ?? []).flatMap((v) => v.options ?? [])
    out.push(
      normalise({
        name: p.name,
        description: p.description || '', // normalise() strips HTML
        price: p.price != null ? p.price / 100 : 0,
        images: p.preview_url ? [p.preview_url] : [],
        variants: options.map((o) => ({
          name: o.name ?? '',
          price: (o.price_difference || 0) / 100,
        })),
        external_url: p.short_url, // digital delivery — keep the link
        tags: p.tags ?? [],
      }),
    )
  }
  return out
}

export const gumroadAdapter: ImportAdapter = {
  id: 'gumroad',
  label: 'Gumroad',
  async detect(input) {
    const u = (input.url ?? '').toLowerCase()
    return u.includes('gumroad.com') ? 0.9 : 0
  },
  async connect(input) {
    return importFromGumroad(input.apiKey ?? '')
  },
}
