import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { BuyButton } from '@/components/shop/BuyButton'
import { getProductBySlug } from '@/lib/products'
import { formatPrice } from '@/lib/utils'
import { ogImage } from '@/lib/og'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images?.length
        ? [product.images[0]]
        : [ogImage(product.name, product.category)],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const inStock = product.stock > 0

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="flex flex-col">
          <Badge className="self-start">{product.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-bold text-brand dark:text-brand-200">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="mt-6 space-y-3 text-neutral-700 dark:text-neutral-300">
              {product.description.split('\n').map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : null,
              )}
            </div>
          )}

          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-brand dark:text-brand-200">
                <Check className="h-4 w-4" /> In stock
              </span>
            ) : (
              <span className="text-neutral-500">Currently unavailable</span>
            )}
          </p>

          <div className="mt-6">
            <BuyButton productId={product.id} inStock={inStock} />
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-500">
            <Truck className="h-4 w-4" /> Made to order in South Wales · ships
            worldwide
          </p>
        </div>
      </div>
    </div>
  )
}
