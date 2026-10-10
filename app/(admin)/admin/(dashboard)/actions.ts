'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase'

export type FormState = { error?: string } | undefined

type DbError = { code?: string; message?: string; details?: string; hint?: string }

const DB_HINTS: Record<string, string> = {
  '22P02': 'a value is in the wrong format',
  '22003': 'a number is out of range',
  '23502': 'a required field is empty',
  '23514': "a value breaks a rule (price and stock can't be negative)",
  '42501': 'the database refused permission (check the service-role key)',
}

/** Logs the real database error (so it shows up in Vercel logs) and returns an
 *  admin-facing message that says why, with the code — instead of a bare
 *  "Could not save". Admin-only UI, so showing the code is fine. */
function dbFailure(where: string, error: DbError, fallback: string): string {
  console.error(`[admin] ${where} failed`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  })
  const why = error.code ? DB_HINTS[error.code] : undefined
  return `${fallback}${why ? ` — ${why}` : ''} (code ${error.code ?? 'unknown'})`
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ───────────────────────── Products ─────────────────────────
export async function saveProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()
  const admin = createAdminClient()

  const id = (formData.get('id') as string) || null
  const name = (formData.get('name') as string)?.trim()
  let slug = (formData.get('slug') as string)?.trim()
  const description = ((formData.get('description') as string) || '').trim()
  const category = (formData.get('category') as string) || 'Gifts'
  const price = Number(formData.get('price') ?? 0)
  const stock = Number(formData.get('stock') ?? 0)
  const active = formData.get('active') === 'on'
  const externalUrl = ((formData.get('external_url') as string) || '').trim() || null

  if (!name) return { error: 'Name is required.' }
  if (!slug) slug = slugify(name)
  if (Number.isNaN(price) || price < 0) return { error: 'Price must be 0 or more.' }
  if (Number.isNaN(stock) || stock < 0) return { error: 'Stock must be 0 or more.' }

  // ── Images: keep the ones not removed, upload any newly chosen files ──
  const kept = formData
    .getAll('existing_images')
    .filter((v): v is string => typeof v === 'string' && v.length > 0)

  const files = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)

  const uploaded: string[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return { error: 'Images must be image files (PNG, JPG, or WebP).' }
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: `"${file.name}" is over 5MB — please use a smaller image.` }
    }
    const ext =
      file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: upErr } = await admin.storage
      .from('product-images')
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      })
    if (upErr) {
      console.error('[saveProduct] image upload failed:', upErr.message)
      return { error: 'Image upload failed. Please try again.' }
    }
    uploaded.push(
      admin.storage.from('product-images').getPublicUrl(path).data.publicUrl,
    )
  }

  const images = [...kept, ...uploaded]

  const row = {
    name,
    slug,
    description,
    category,
    price,
    stock,
    active,
    images,
    external_url: externalUrl,
  }

  const { error } = id
    ? await admin.from('products').update(row).eq('id', id)
    : await admin.from('products').insert(row)

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'That slug is already taken.'
          : dbFailure('saveProduct', error, 'Could not save product'),
    }
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  redirect('/admin/products')
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  const next = formData.get('next') === 'true'
  if (!id) return
  const admin = createAdminClient()
  await admin.from('products').update({ active: next }).eq('id', id)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
}

// ───────────────────────── Orders ─────────────────────────
export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const allowed = [
    'pending',
    'paid',
    'needs_fulfilment',
    'fulfilled',
    'cancelled',
    'refunded',
  ]
  if (!id || !allowed.includes(status)) return
  const admin = createAdminClient()
  await admin.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin/orders')
}

// ───────────────────────── Blog (DB drafts) ─────────────────────────
export async function createDraft(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()
  const admin = createAdminClient()

  const title = (formData.get('title') as string)?.trim()
  let slug = (formData.get('slug') as string)?.trim()
  const category = (formData.get('category') as string) || 'Personal'
  const excerpt = ((formData.get('excerpt') as string) || '').trim()
  const published = formData.get('published') === 'on'
  const scheduled = (formData.get('published_at') as string) || null

  if (!title) return { error: 'Title is required.' }
  if (!slug) slug = slugify(title)

  const { error } = await admin.from('blog_posts').insert({
    title,
    slug,
    category,
    excerpt,
    published,
    published_at: published ? new Date().toISOString() : scheduled || null,
  })

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'That slug already exists.'
          : dbFailure('createDraft', error, 'Could not save draft'),
    }
  }

  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function togglePostPublished(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  const next = formData.get('next') === 'true'
  if (!id) return
  const admin = createAdminClient()
  await admin
    .from('blog_posts')
    .update({
      published: next,
      published_at: next ? new Date().toISOString() : null,
    })
    .eq('id', id)
  revalidatePath('/admin/blog')
}

// ───────────────────────── Playlist tracks ─────────────────────────
export type TrackFormState = { error?: string; ok?: boolean } | undefined

export async function saveTrack(
  _prev: TrackFormState,
  formData: FormData,
): Promise<TrackFormState> {
  await requireAdmin()
  const admin = createAdminClient()

  const id = (formData.get('id') as string) || null
  const title = (formData.get('title') as string)?.trim()
  const artist = (formData.get('artist') as string)?.trim()
  // Paths must exactly match storage.objects.name — a leading slash is
  // never valid there, so strip it rather than let playback silently break.
  const audioPath = ((formData.get('audio_path') as string) || '')
    .trim()
    .replace(/^\/+/, '')
  const sortOrder = Number(formData.get('sort_order') ?? 0)
  const isPublished = formData.get('is_published') === 'on'

  if (!title) return { error: 'Title is required.' }
  if (!artist) return { error: 'Artist is required.' }
  if (!audioPath) return { error: 'Audio path is required — the exact file name in the music bucket.' }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { error: 'Sort order must be a whole number, 0 or more.' }
  }

  const row = {
    title,
    artist,
    audio_path: audioPath,
    sort_order: sortOrder,
    is_published: isPublished,
  }

  const { error } = id
    ? await admin.from('playlist_tracks').update(row).eq('id', id)
    : await admin.from('playlist_tracks').insert(row)

  if (error) return { error: dbFailure('saveTrack', error, 'Could not save the track') }

  revalidatePath('/admin/tracks')
  revalidatePath('/', 'layout') // footer player lives in the shared layout
  return { ok: true }
}

export async function toggleTrackPublished(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  const next = formData.get('next') === 'true'
  if (!id) return
  const admin = createAdminClient()
  await admin.from('playlist_tracks').update({ is_published: next }).eq('id', id)
  revalidatePath('/admin/tracks')
  revalidatePath('/', 'layout')
}

// ───────────────────────── Track comments ─────────────────────────
export async function toggleCommentHidden(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  const next = formData.get('next') === 'true'
  if (!id) return
  const admin = createAdminClient()
  await admin.from('track_comments').update({ is_hidden: next }).eq('id', id)
  revalidatePath('/admin/comments')
  revalidatePath('/music')
}

export async function deleteComment(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id') as string
  if (!id) return
  const admin = createAdminClient()
  await admin.from('track_comments').delete().eq('id', id)
  revalidatePath('/admin/comments')
  revalidatePath('/music')
}
