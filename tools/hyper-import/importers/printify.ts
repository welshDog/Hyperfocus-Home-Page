/**
 * Printify adapter — Printify API v1 (https://developers.printify.com/).
 *
 * Reads the first shop's products with a Bearer API key the user pastes in the
 * wizard. Self/Printify-fulfilled, so no link-out — imported as drafts.
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

const API = 'https://api.printify.com/v1'

interface PrintifyVariant {
  title?: string
  price?: number
}
interface PrintifyImage {
  src?: string
  is_default?: boolean
}
interface PrintifyProduct {
  title?: string
  description?: string
  tags?: string[]
  variants?: PrintifyVariant[]
  images?: PrintifyImage[]
}

export async function importFromPrintify(
  apiKey: string,
): Promise<ImportedProduct[]> {
  if (!apiKey) {
    throw new Error('Printify API key required — paste it in the connect step')
  }
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    accept: 'application/json',
  }

  // 1) first shop
  const shopsRes = await fetch(`${API}/shops.json`, { headers })
  if (!shopsRes.ok) {
    if (shopsRes.status === 401) {
      throw new Error(
        'Invalid Printify API key — check Account → Connections → API',
      )
    }
    throw new Error('No Printify shops found on this account')
  }
  const shops = (await shopsRes.json()) as { id?: number }[]
  const shopId = Array.isArray(shops) ? shops[0]?.id : undefined
  if (!shopId) throw new Error('No Printify shops found on this account')

  // 2) products (Laravel-style pagination)
  const out: ImportedProduct[] = []
  for (let page = 1; page <= 50; page++) {
    const res = await fetch(
      `${API}/shops/${shopId}/products.json?limit=100&page=${page}`,
      { headers },
    )
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          'Invalid Printify API key — check Account → Connections → API',
        )
      }
      break
    }
    const body = (await res.json()) as {
      data?: PrintifyProduct[]
      last_page?: number
    }
    const products = body.data ?? []
    if (!products.length) break

    for (const p of products) {
      const variants = p.variants ?? []
      // Default image first.
      const images = [...(p.images ?? [])].sort(
        (a, b) => Number(b.is_default) - Number(a.is_default),
      )
      out.push(
        normalise({
          name: p.title,
          description: p.description, // normalise() strips HTML
          price: variants[0]?.price != null ? variants[0].price / 100 : 0,
          images: images.map((i) => i.src ?? '').filter(Boolean),
          variants: variants.map((v) => ({
            name: v.title ?? '',
            price: v.price != null ? v.price / 100 : undefined,
          })),
          tags: p.tags ?? [],
        }),
      )
    }

    if (body.last_page && page >= body.last_page) break
    if (products.length < 100) break
  }
  return out
}

export const printifyAdapter: ImportAdapter = {
  id: 'printify',
  label: 'Printify',
  async detect(input) {
    const u = (input.url ?? '').toLowerCase()
    return u.includes('printify.com') ? 0.9 : 0
  },
  async connect(input) {
    return importFromPrintify(input.apiKey ?? '')
  },
}
