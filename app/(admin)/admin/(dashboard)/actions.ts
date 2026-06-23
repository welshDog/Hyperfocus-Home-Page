'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase'

export type FormState = { error?: string } | undefined

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

  if (!name) return { error: 'Name is required.' }
  if (!slug) slug = slugify(name)
  if (Number.isNaN(price) || price < 0) return { error: 'Price must be 0 or more.' }
  if (Number.isNaN(stock) || stock < 0) return { error: 'Stock must be 0 or more.' }

  const row = { name, slug, description, category, price, stock, active }

  const { error } = id
    ? await admin.from('products').update(row).eq('id', id)
    : await admin.from('products').insert(row)

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'That slug is already taken.'
          : 'Could not save product.',
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
  const allowed = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded']
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
        error.code === '23505' ? 'That slug already exists.' : 'Could not save draft.',
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
