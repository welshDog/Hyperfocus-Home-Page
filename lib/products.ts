import { createServerClient } from '@/lib/supabase'
import type { Product } from '@/types'

/** Category filter tabs for the shop. 'All' is a UI-only pseudo-category. */
export const SHOP_CATEGORIES = [
  'All',
  '3D Prints',
  'Mugs',
  'Gifts',
  'Bundles',
] as const

export type ShopCategory = (typeof SHOP_CATEGORIES)[number]

/** Active products, newest first. Returns [] when Supabase is
 *  unconfigured or the query fails — callers render an empty state. */
export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const supabase = createServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as Product[]
}

/** All active products, optionally filtered by category. */
export async function getProducts(category?: string): Promise<Product[]> {
  const supabase = createServerClient()
  if (!supabase) return []

  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as Product[]
}

/** Single active product by slug, or null if not found. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createServerClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error || !data) return null
  return data as Product
}
