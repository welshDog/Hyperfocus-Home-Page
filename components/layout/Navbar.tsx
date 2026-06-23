'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ButtonLink } from '@/components/ui/Button'

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/white-label', label: 'White-Label' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 bg-paper/80 dark:bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight"
        >
          WelshDog<span className="text-brand">.</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-brand dark:text-neutral-200 dark:hover:text-brand-200 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/shop" size="sm" className="hidden sm:inline-flex">
            Shop Now
          </ButtonLink>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="touch-target md:hidden inline-flex items-center justify-center rounded-lg text-neutral-700 dark:text-neutral-200"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden border-t border-black/5 dark:border-white/5 transition-[max-height] duration-200',
          open ? 'max-h-80' : 'max-h-0',
        )}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand dark:text-neutral-100 dark:hover:bg-brand-300/10"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
