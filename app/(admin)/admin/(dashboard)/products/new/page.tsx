import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-heading text-2xl font-bold">Add product</h1>
      <ProductForm />
    </div>
  )
}
