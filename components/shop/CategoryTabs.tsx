import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SHOP_CATEGORIES } from '@/lib/products'

/** Filter tabs for the shop. Server-rendered links so filters are
 *  shareable/bookmarkable via the ?category= query param. */
export function CategoryTabs({ active }: { active: string }) {
  return (
    <nav
      aria-label="Product categories"
      className="flex flex-wrap gap-2"
    >
      {SHOP_CATEGORIES.map((cat) => {
        const href = cat === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(cat)}`
        const isActive = active === cat
        return (
          <Link
            key={cat}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand text-white'
                : 'bg-black/5 text-neutral-700 hover:bg-brand/10 hover:text-brand dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-brand-300/15 dark:hover:text-brand-200',
            )}
          >
            {cat}
          </Link>
        )
      })}
    </nav>
  )
}
