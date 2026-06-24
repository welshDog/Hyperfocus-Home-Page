'use server'

import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase'

export interface ProductHealth {
  ok: boolean
  flagged: number
  sample: string[]
}

/** Products Watcher: flags any ACTIVE product missing a price or stock —
 *  i.e. live on the public shop but unsellable. Admin-only. */
export async function checkProductHealth(): Promise<ProductHealth> {
  await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('name, price, stock')
    .eq('active', true)

  const bad = (data ?? []).filter(
    (p) => Number(p.price) === 0 || Number(p.stock) === 0,
  )
  return {
    ok: bad.length === 0,
    flagged: bad.length,
    sample: bad.slice(0, 3).map((p) => p.name as string),
  }
}
