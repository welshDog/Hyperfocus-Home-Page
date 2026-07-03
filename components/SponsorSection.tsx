import Link from 'next/link'
import { Heart } from 'lucide-react'

const SPONSOR_LINKS = [
  {
    id: 'github',
    label: 'GitHub Sponsors',
    description: 'Zero fees — 100% goes to the Empire',
    href: 'https://github.com/sponsors/welshDog',
    emoji: '💙',
    tiers: '$5 · $15 · $50 · $100 /mo',
    cta: 'Sponsor on GitHub',
    accent: 'bg-[#24292e] hover:bg-[#2f363d] text-white',
    badge: 'No fees',
  },
  {
    id: 'kofi',
    label: 'Ko-fi',
    description: 'One-time tips or monthly — buy me a coffee!',
    href: 'https://ko-fi.com/hyperfocuszone',
    emoji: '☕',
    tiers: 'Any amount, anytime',
    cta: 'Support on Ko-fi',
    accent: 'bg-[#FF5E5B] hover:bg-[#e54e4b] text-white',
    badge: 'One-time OK',
  },
  {
    id: 'patreon',
    label: 'Patreon',
    description: 'Monthly membership with exclusive perks',
    href: 'https://www.patreon.com/c/u29188650',
    emoji: '🎨',
    tiers: '$3 · $8 · $20 · $50 /mo',
    cta: 'Join on Patreon',
    accent: 'bg-[#FF424D] hover:bg-[#e53a45] text-white',
    badge: 'Perks included',
  },
]

export function SponsorSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-300 mb-4">
          <Heart className="h-3.5 w-3.5" />
          Support the Empire
        </span>
        <h2 className="text-3xl font-bold sm:text-4xl">
          Fuel the BROski♾️ AI Empire
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-neutral-600 dark:text-neutral-300">
          I&apos;m a dyslexic ADHD builder from Llanelli, Wales, running a
          677+ AI agent army on a shoestring. Every sponsorship directly pays
          for servers, API credits, and new builds. No corporate backing —
          just you and me.
        </p>
      </div>

      {/* Sponsor Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {SPONSOR_LINKS.map((s) => (
          <div
            key={s.id}
            className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Top accent stripe */}
            <div className={`h-1.5 w-full ${s.accent.split(' ')[0]}`} />

            <div className="flex flex-col flex-1 p-6 gap-4">
              {/* Platform header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold text-lg">{s.label}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {s.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-1">
                {s.description}
              </p>

              {/* Tiers */}
              <p className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                {s.tiers}
              </p>

              {/* CTA Button */}
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${s.accent}`}
              >
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom message */}
      <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Every £/$ goes straight into keeping the machine running.
        Even a £3/month makes a real difference.
        <span className="ml-1">💪♾️</span>
      </p>
    </section>
  )
}
