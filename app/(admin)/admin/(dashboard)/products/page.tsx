import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/Button'
import { toggleProductActive } from '../actions'
import type { Product } from '@/types'

async function getProducts(): Promise<Product[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as Product[]
  } catch {
    return []
  }
}

export default async function AdminProducts() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-neutral-400">{products.length} total</p>
        </div>
        <ButtonLink href="/admin/products/new">
          <Plus className="h-4 w-4" /> Add product
        </ButtonLink>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                  No products yet. Add your first, or run the seed.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 text-neutral-400">{p.category}</td>
                <td className="px-5 py-3">{formatPrice(p.price)}</td>
                <td className="px-5 py-3 text-neutral-400">{p.stock}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      p.active
                        ? 'inline-flex rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-200'
                        : 'inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-neutral-400'
                    }
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/5 hover:text-brand-200"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={(!p.active).toString()} />
                      <button
                        type="submit"
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/20 hover:text-neutral-100"
                      >
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
