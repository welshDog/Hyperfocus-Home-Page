/**
 * HyperImport adapter registry + auto-detection.
 * To add a platform: write an adapter, import it, add it to ADAPTERS.
 */

import type { ImportAdapter, ConnectInput } from './types'
import { teemillAdapter } from '../importers/teemill'
import { shopifyAdapter } from '../importers/shopify'
import { etsyAdapter } from '../importers/etsy'
import { printfulAdapter } from '../importers/printful'
import { printifyAdapter } from '../importers/printify'
import { feedAdapter } from '../importers/feed'
import { csvAdapter } from '../importers/csv'
import { jsonLdAdapter } from '../importers/jsonld'

// Order matters only as a tie-break; detection is by confidence score.
export const ADAPTERS: ImportAdapter[] = [
  teemillAdapter,
  shopifyAdapter,
  etsyAdapter,
  printfulAdapter,
  printifyAdapter,
  feedAdapter,
  csvAdapter,
  jsonLdAdapter,
]

export function getAdapter(id: string): ImportAdapter | undefined {
  return ADAPTERS.find((a) => a.id === id)
}

/** Pick the highest-confidence adapter for the given input, or null. */
export async function detectAdapter(
  input: ConnectInput,
): Promise<ImportAdapter | null> {
  const scored = await Promise.all(
    ADAPTERS.map(async (a) => ({
      a,
      score: await a.detect(input).catch(() => 0),
    })),
  )
  scored.sort((x, y) => y.score - x.score)
  return scored[0] && scored[0].score > 0 ? scored[0].a : null
}
