/**
 * HyperImport — shared product shape + normalisation.
 *
 * Platform importers (teemill.ts, csv.ts) all emit ImportedProduct[]; the
 * uploader consumes it. Keeping one shape means adding a new platform only
 * needs a new importer, nothing else.
 */

export type ImportedProduct = {
  name: string
  description: string
  price: number
  images: string[]
  variants?: { name: string; price?: number }[]
  external_url?: string
  teemill_variant_id?: string
  tags?: string[]
}

/** Coerce a string/number into a non-negative price. */
export function toNumber(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : 0
  const m = String(v ?? '').match(/[\d]+(\.[\d]+)?/)
  return m ? parseFloat(m[0]) : 0
}

/** URL-safe slug from a product name. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Tidy any raw shape into a clean ImportedProduct. */
export function normalise(raw: {
  name?: unknown
  description?: unknown
  price?: unknown
  images?: unknown
  variants?: { name: string; price?: number }[]
  external_url?: unknown
  teemill_variant_id?: unknown
  tags?: string[]
}): ImportedProduct {
  const images = Array.isArray(raw.images)
    ? raw.images
        .map((u) => String(u).trim())
        .filter((u, i, a) => /^https?:\/\//.test(u) && a.indexOf(u) === i)
    : []

  const out: ImportedProduct = {
    name: String(raw.name ?? '').replace(/\s+/g, ' ').trim(),
    description: String(raw.description ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    price: toNumber(raw.price),
    images,
  }
  if (raw.variants?.length) out.variants = raw.variants
  if (raw.external_url) out.external_url = String(raw.external_url).trim()
  if (raw.teemill_variant_id) {
    out.teemill_variant_id = String(raw.teemill_variant_id).trim()
  }
  if (raw.tags?.length) out.tags = raw.tags
  return out
}

/** Minimal RFC-4180 CSV parser — handles quoted fields, embedded commas,
 *  newlines inside quotes, and "" escaped quotes. Shared by importers. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}
