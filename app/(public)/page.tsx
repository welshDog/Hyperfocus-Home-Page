import Link from 'next/link'
import { ArrowRight, Package, Sparkles } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProductCard } from '@/components/shop/ProductCard'
import { getFeaturedProducts } from '@/lib/products'
import { SponsorSection } from '@/components/SponsorSection'

// Re-fetch featured products at most once a minute.
export const revalidate = 60

export default async function HomePage() {
  const featured = await getFeaturedProducts(3)

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs sm:text-sm font-medium text-brand-700 dark:bg-brand-300/15 dark:text-brand-200">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Neurodivergent-first maker brand · South Wales
            </span>
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Built for brains that{' '}
            <span className="text-brand dark:text-brand-200">
              don't switch off
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
            Original 3D-printed gear, personalised gifts, and honest writing —
            plus the shop engine that powers it all, ready for you to own.
          </p>
          <p className="mt-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            3D prints, mugs, gifts, and bundles made in South Wales.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" size="lg">
              Shop Now
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/white-label" size="lg" variant="outline">
              See How It Works
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ────────────────── Featured products ────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured</h2>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              A few of the originals from the workshop.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-700 dark:text-brand-200"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          // Graceful empty state until the products table is seeded (Phase 2).
          <Card className="mt-8 flex flex-col items-center gap-4 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand-300/15 dark:text-brand-200">
              <Package className="h-6 w-6" />
            </span>
            <div>
              <p className="font-heading text-lg font-semibold">
                First drops coming soon
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                New originals from the workshop are on the way — check back
                shortly.
              </p>
            </div>
            <ButtonLink href="/shop" variant="outline" size="sm">
              Browse the shop
            </ButtonLink>
          </Card>
        )}
      </section>

      {/* ───────────────────── Manifesto teaser ───────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-12">
          <p className="text-xl font-medium leading-relaxed sm:text-2xl">
            I'm a dyslexic maker with ADHD. I don't do “off
            switches.” WelshDog is where that energy goes — real products,
            real story, no corporate fluff.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-1 font-medium text-brand hover:text-brand-700 dark:text-brand-200"
          >
            Read the story <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </section>

      {/* ─────────────────── Sponsor / Support ─────────────────── */}
      <SponsorSection />

      {/* ─────────────────── White-label teaser ─────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-2xl bg-brand px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Want a shop like this?
              </h2>
              <p className="mt-2 text-white/85">
                Own the engine. We'll set you up with the same stack —
                branded, wired for payments, and ready to sell.
              </p>
            </div>
            <ButtonLink
              href="/white-label"
              size="lg"
              className="bg-white text-brand-700 hover:bg-white/90 active:bg-white/80 shrink-0"
            >
              Book a Demo
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
