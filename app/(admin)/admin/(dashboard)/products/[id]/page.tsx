import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Product } from '@/types'

async function getProduct(id: string): Promise<Product | null> {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('*').eq('id', id).maybeSingle()
    return (data as Product) ?? null
  } catch {
    return null
  }
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-heading text-2xl font-bold">Edit · {product.name}</h1>
      <ProductForm product={product} />
    </div>
  )
}
