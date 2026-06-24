import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0]

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block focus-visible:outline-none rounded-2xl"
    >
      <Card interactive className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge className="self-start">{product.category}</Badge>
          <h3 className="font-heading text-base font-semibold leading-snug">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="text-lg font-bold text-brand dark:text-brand-200">
              {formatPrice(product.price)}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors group-hover:text-brand dark:text-neutral-400 dark:group-hover:text-brand-200">
              View
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
