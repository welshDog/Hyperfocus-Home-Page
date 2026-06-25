/**
 * Product-feed adapter — Google Shopping / RSS (<item>) and Atom (<entry>)
 * XML feeds. Covers a big long tail of platforms that expose a product feed.
 * (Plain CSV feeds are handled by the CSV adapter.)
 */

import { type ImportedProduct, normalise } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

/** Read a (possibly g:-namespaced, possibly CDATA-wrapped) tag from a block. */
function tag(block: string, name: string): string {
  const re = new RegExp(`<(?:g:)?${name}[^>]*>([\\s\\S]*?)</(?:g:)?${name}>`, 'i')
  const m = block.match(re)
  if (!m) return ''
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

export function parseProductFeedXml(xml: string): ImportedProduct[] {
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ||
    []

  const out: ImportedProduct[] = []
  for (const b of blocks) {
    const name = tag(b, 'title')
    if (!name) continue
    out.push(
      normalise({
        name,
        description: tag(b, 'description'),
        price: tag(b, 'price'),
        images: [tag(b, 'image_link'), tag(b, 'additional_image_link')].filter(
          Boolean,
        ),
        external_url: tag(b, 'link'),
      }),
    )
  }
  return out
}

export async function importFromFeed(url: string): Promise<ImportedProduct[]> {
  const res = await fetch(url.startsWith('http') ? url : `https://${url}`)
  if (!res.ok) throw new Error(`Feed request failed: HTTP ${res.status}`)
  return parseProductFeedXml(await res.text())
}

export const feedAdapter: ImportAdapter = {
  id: 'feed',
  label: 'Product feed (XML)',
  async detect(input) {
    const u = (input.url ?? '').toLowerCase()
    if (!u) return 0
    if (u.endsWith('.xml') || u.includes('feed') || u.includes('rss')) return 0.6
    return 0
  },
  async connect(input) {
    return importFromFeed(input.url ?? '')
  },
}
