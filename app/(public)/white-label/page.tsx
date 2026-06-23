import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { DemoForm } from '@/components/whitelabel/DemoForm'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'White-Label Shop',
  description:
    'Own the engine. Get the same neurodivergent-first shop stack — branded, wired for payments, ready to sell.',
}

const tiers = [
  {
    name: 'Starter',
    tagline: 'Get going fast',
    features: [
      'Template clone of this shop',
      'Basic branding (logo + colours)',
      'Setup guide + handover',
      'Stripe-ready checkout',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    tagline: 'Branded & wired',
    features: [
      'Everything in Starter',
      'Full branded setup',
      'Wallet / payment configuration',
      'Product import done for you',
      'Blog + email capture',
    ],
    featured: true,
  },
  {
    name: 'Done For You',
    tagline: 'Full launch',
    features: [
      'Everything in Pro',
      'Full launch, end to end',
      'Personal 1:1 support',
      'Content + SEO setup',
      'Priority changes',
    ],
    featured: false,
  },
]

export default function WhiteLabelPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Hero */}
      <section className="max-w-2xl">
        <Badge>White-Label Service</Badge>
        <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Want a shop like this?{' '}
          <span className="text-brand dark:text-brand-200">Own the engine.</span>
        </h1>
        <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
          The same stack that powers WelshDog Designs — neurodivergent-first,
          fast, and built to sell. Branded for you, wired for payments, and
          handed over ready to go.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#book" size="lg">
            Book a Demo
          </ButtonLink>
          {/* TODO: replace with real Stripe payment link */}
          <ButtonLink href="#book" size="lg" variant="outline">
            Buy Your Shop
          </ButtonLink>
        </div>
      </section>

      {/* Tiers */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Pick your tier</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                'flex flex-col p-6',
                tier.featured && 'ring-2 ring-brand',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold">{tier.name}</h3>
                {tier.featured && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-1 text-sm text-neutral-500">{tier.tagline}</p>

              {/* Price intentionally TBD — Lyndon to fill in */}
              <p className="mt-5 text-3xl font-bold text-brand dark:text-brand-200">
                TBD
              </p>
              <p className="text-xs text-neutral-500">Pricing coming soon</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand dark:text-brand-200" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href="#book"
                variant={tier.featured ? 'solid' : 'outline'}
                className="mt-8 w-full"
              >
                Get {tier.name}
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      {/* Book a Demo */}
      <section id="book" className="mt-20 scroll-mt-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Book a demo</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Tell me what you want to build and I&apos;ll walk you through the
              engine — no pressure, no jargon. You&apos;ll get a confirmation
              by email, then we&apos;ll set up a time.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              {[
                'Neurodivergent-first design, out of the box',
                'Stripe payments + Supabase backend',
                'Your branding, your products, your store',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand dark:text-brand-200" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-6 sm:p-8">
            <DemoForm />
          </Card>
        </div>
      </section>
    </div>
  )
}
