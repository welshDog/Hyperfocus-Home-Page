/**
 * Generic CSV importer — fallback for any platform that can export CSV.
 *
 * Expected headers (case-insensitive): name, description, price, image_url,
 * external_url. `name` is required; everything else is optional. Pure function,
 * safe to run on server or client.
 */

import { type ImportedProduct, normalise, parseCsvRows } from '../lib/mapper'
import type { ImportAdapter } from '../lib/types'

export function importFromCsv(csvText: string): ImportedProduct[] {
  const rows = parseCsvRows(csvText)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string): number => header.indexOf(name)
  const col = {
    name: idx('name'),
    description: idx('description'),
    price: idx('price'),
    image: idx('image_url'),
    external: idx('external_url'),
  }

  const out: ImportedProduct[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || !row.some((c) => c.trim())) continue
    const get = (c: number): string => (c >= 0 ? (row[c] ?? '').trim() : '')

    const name = get(col.name)
    if (!name) continue

    const image = get(col.image)
    out.push(
      normalise({
        name,
        description: get(col.description),
        price: get(col.price),
        images: image ? [image] : [],
        external_url: get(col.external) || undefined,
      }),
    )
  }
  return out
}

export const csvAdapter: ImportAdapter = {
  id: 'csv',
  label: 'CSV file',
  async detect(input) {
    return input.csv ? 1 : 0
  },
  async connect(input) {
    return importFromCsv(input.csv ?? '')
  },
}
