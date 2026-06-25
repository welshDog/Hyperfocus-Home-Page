'use server'

import { requireAdmin } from '@/lib/admin'
import { getAdapter, detectAdapter } from './lib/registry'
import { importProducts, type ImportResult } from './lib/uploader'
import type { ImportedProduct } from './lib/mapper'
import type { ConnectInput } from './lib/types'

/** Step 2/3: fetch + normalise products. If adapterId is omitted, auto-detect
 *  the platform from the input. No writes. */
export async function previewProducts(input: {
  adapterId?: string
  url?: string
  apiKey?: string
  csv?: string
}): Promise<{ adapterId: string; label: string; products: ImportedProduct[] }> {
  await requireAdmin()
  const connectInput: ConnectInput = {
    url: input.url,
    apiKey: input.apiKey,
    csv: input.csv,
  }
  const adapter = input.adapterId
    ? getAdapter(input.adapterId)
    : await detectAdapter(connectInput)
  if (!adapter) {
    throw new Error('Could not work out which platform that is — try picking one.')
  }
  const products = await adapter.connect(connectInput)
  return { adapterId: adapter.id, label: adapter.label, products }
}

/** Step 4: upload images + insert the selected products as drafts.
 *  `ownsRights` is the ownership confirmation — enforced server-side too. */
export async function runProductImport(
  products: ImportedProduct[],
  ownsRights: boolean,
): Promise<ImportResult> {
  await requireAdmin()
  if (!ownsRights) {
    throw new Error('Ownership must be confirmed before importing.')
  }
  if (!products.length) return { imported: 0, skipped: 0, failed: [] }
  return importProducts(products)
}
