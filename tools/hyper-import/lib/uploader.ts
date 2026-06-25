/**
 * HyperImport uploader — server-only.
 *
 * Takes ImportedProduct[], downloads each image and re-uploads it to the
 * Supabase 'product-images' bucket (never hotlinks), then inserts the product
 * into the existing `products` table.
 *
 * Safety:
 *  - Inserts as DRAFTS (active = false) — owner reviews + activates manually.
 *  - Insert-new only: skips any slug that already exists, so re-running never
 *    clobbers live products.
 *  - Uses the service-role admin client (server-side only).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase'
import { type ImportedProduct, slugify } from './mapper'

const BUCKET = 'product-images'

export interface ImportResult {
  imported: number
  skipped: number
  failed: { name: string; error: string }[]
}

/** Download one image URL and re-upload to storage; returns the public URL. */
async function reupload(
  admin: SupabaseClient,
  slug: string,
  url: string,
  index: number,
): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) return null

    const bytes = await res.arrayBuffer()
    if (bytes.byteLength > 8 * 1024 * 1024) return null // 8MB sanity cap

    const ext =
      (contentType.split('/')[1] ?? 'jpg').split(';')[0].replace(/[^a-z0-9]/g, '') ||
      'jpg'
    const path = `${slug || 'product'}/${Date.now()}-${index}.${ext}`

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType, upsert: false })
    if (error) return null

    return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  } catch {
    return null
  }
}

export async function importProducts(
  products: ImportedProduct[],
): Promise<ImportResult> {
  const admin = createAdminClient()
  const result: ImportResult = { imported: 0, skipped: 0, failed: [] }

  // Pre-load existing slugs so we never overwrite a live product.
  const { data: existing } = await admin.from('products').select('slug')
  const used = new Set<string>((existing ?? []).map((r) => r.slug as string))

  for (const p of products) {
    const slug = slugify(p.name)
    if (!slug) {
      result.failed.push({ name: p.name || '(no name)', error: 'invalid name' })
      continue
    }
    if (used.has(slug)) {
      result.skipped++
      continue
    }

    try {
      const uploaded: string[] = []
      for (let i = 0; i < p.images.length; i++) {
        const publicUrl = await reupload(admin, slug, p.images[i], i)
        if (publicUrl) uploaded.push(publicUrl)
      }

      const { error } = await admin.from('products').insert({
        name: p.name,
        slug,
        description: p.description || null,
        price: p.price,
        images: uploaded,
        category: 'Gifts', // safe default — owner re-categorises on review
        stock: 0,
        active: false, // DRAFT — never auto-activate (sacred rule)
        external_url: p.external_url ?? null,
        teemill_variant_id: p.teemill_variant_id ?? null,
      })
      if (error) {
        result.failed.push({ name: p.name, error: error.message })
        continue
      }
      used.add(slug)
      result.imported++
    } catch (err) {
      result.failed.push({ name: p.name, error: String(err) })
    }
  }

  return result
}
