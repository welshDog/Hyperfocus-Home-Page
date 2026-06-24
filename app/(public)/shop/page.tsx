import type { Metadata } from 'next'
import { PackageOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { ProductCard } from '@/components/shop/ProductCard'
import { CategoryTabs } from '@/components/shop/CategoryTabs'
import { getProducts, SHOP_CATEGORIES } from '@/lib/products'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Original 3D-printed gear, mugs, and personalised gifts from WelshDog Designs.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const requested = searchParams.category
  const active = SHOP_CATEGORIES.includes(requested as never)
    ? (requested as string)
    : 'All'

  const products = await getProducts(active)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Shop</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Original gear from the workshop — made for brains that don&apos;t
          switch off.
        </p>
      </header>

      {/* Sticky filters — stay reachable while scrolling on mobile + desktop.
          top-16 clears the sticky navbar (h-16); tokens match it. */}
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-black/5 bg-paper/80 px-4 py-3 backdrop-blur-md dark:border-white/5 dark:bg-ink/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <CategoryTabs active={active} />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand-300/15 dark:text-brand-200">
            <PackageOpen className="h-6 w-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold">
              {active === 'All'
                ? 'No products yet'
                : `Nothing in ${active} yet`}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {active === 'All'
                ? "No products yet — they'll appear here once activated in Mission Control."
                : `Nothing in ${active} right now — try another category or view all.`}
            </p>
          </div>
          {active !== 'All' && (
            <ButtonLink href="/shop" variant="outline" size="sm">
              View all products
            </ButtonLink>
          )}
        </Card>
      )}
    </div>
  )
}
