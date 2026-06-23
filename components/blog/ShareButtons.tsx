'use client'

import { useState } from 'react'
import { Check, Link2, Linkedin, Twitter, Facebook } from 'lucide-react'

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  // Resolved on the client so it works across local/preview/prod domains.
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : `/blog/${slug}`
  const text = encodeURIComponent(title)
  const enc = encodeURIComponent(url)

  const links = [
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${enc}`,
      Icon: Twitter,
    },
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      Icon: Facebook,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
      Icon: Linkedin,
    },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm font-medium text-neutral-500">Share</span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-brand hover:bg-brand/10 dark:text-neutral-400 dark:hover:text-brand-200 dark:hover:bg-brand-300/10 transition-colors"
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="touch-target inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-brand hover:bg-brand/10 dark:text-neutral-400 dark:hover:text-brand-200 dark:hover:bg-brand-300/10 transition-colors"
      >
        {copied ? (
          <Check className="h-5 w-5 text-brand dark:text-brand-200" />
        ) : (
          <Link2 className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
