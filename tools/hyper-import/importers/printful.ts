/**
 * Printful adapter — Printful API v2 (https://developers.printful.com/docs/).
 *
 * Reads the store's sync products (the user's designs on Printful base
 * products) with a Bearer API key the user pastes in the wizard. Their files,
 * so no link-out — these are self/Printful-fulfilled, imported as drafts.
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

const API = 'https://api.printful.com'

interface PrintfulVariant {
  name?: string
  retail_price?: string | number
}
interface PrintfulProduct {
  name?: string
  description?: string
  thumbnail_url?: string
  variants?: PrintfulVariant[]
}

export async function importFromPrintful(
  apiKey: string,
): Promise<ImportedProduct[]> {
  if (!apiKey) {
    throw new Error('Printful API key required — paste it in the connect step')
  }
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    accept: 'application/json',
  }

  const out: ImportedProduct[] = []
  let offset = 0
  for (let page = 0; page < 50; page++) {
    const res = await fetch(`${API}/v2/products?limit=100&offset=${offset}`, {
      headers,
    })
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          'Invalid Printful API key — check Dashboard → Settings → API',
        )
      }
      if (page === 0 && res.status === 404) return [] // no products is not an error
      break
    }

    // v2 returns { data: [...] }; tolerate v1-style { result: [...] }.
    const data = (await res.json()) as {
      data?: PrintfulProduct[]
      result?: PrintfulProduct[]
    }
    const products = data.data ?? data.result ?? []
    if (!products.length) break

    for (const p of products) {
      const variants = p.variants ?? []
      out.push(
        normalise({
          name: p.name,
          description: p.description || '',
          price: variants[0]?.retail_price,
          images: p.thumbnail_url ? [p.thumbnail_url] : [],
          variants: variants.map((v) => ({
            name: v.name ?? '',
            price: Number(v.retail_price) || undefined,
          })),
          tags: [],
        }),
      )
    }

    if (products.length < 100) break
    offset += 100
  }
  return out
}

export const printfulAdapter: ImportAdapter = {
  id: 'printful',
  label: 'Printful',
  async detect(input) {
    const u = (input.url ?? '').toLowerCase()
    return u.includes('printful.com') ? 0.9 : 0
  },
  async connect(input) {
    return importFromPrintful(input.apiKey ?? '')
  },
}
