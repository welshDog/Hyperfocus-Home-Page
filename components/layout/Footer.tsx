import Link from 'next/link'
import { Github, Heart, Rocket, Orbit } from 'lucide-react'
import { ListenWhileBrowse } from '@/components/layout/ListenWhileBrowse'
import { getHomepagePlaylistTracks } from '@/lib/playlist'

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/white-label', label: 'White-Label' },
  { href: '/contact', label: 'Contact' },
]

// External WelshDog links. All open in a new tab and only point to real,
// verified destinations (add Instagram / X back when they're real profiles).
const socials = [
  { href: 'https://github.com/welshDog', label: 'GitHub', Icon: Github },
  {
    href: 'https://showcase-web-omega.vercel.app/',
    label: 'WelshDog Showcase',
    Icon: Rocket,
  },
  {
    href: 'https://bafybeibcz6tx64yd3cyq5jh747mwzdr45yvzvrzaam4lvfsda7wxlvjljy.ipfs.inbrowser.link/',
    label: 'WelshDog Socials',
    Icon: Orbit,
  },
]

export async function Footer() {
  const tracks = await getHomepagePlaylistTracks(3)
  return (
    <footer className="border-t border-black/5 dark:border-white/5 bg-paper dark:bg-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="font-heading text-lg font-bold">
              WelshDog<span className="text-brand">.</span>
            </Link>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Original 3D-printed gear, honest writing, and a shop engine you
              can own. Built for brains that don&apos;t switch off.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-neutral-600 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200 transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <ListenWhileBrowse tracks={tracks} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black/5 dark:border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} WelshDog Designs · Hyperfocus Zone Ltd
          </p>
          {/* Easter egg: "Made with ♥" links to hidden Mission Control */}
          <Link
            href="/admin"
            className="group inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-brand transition-colors"
          >
            Made in South Wales, with care
            <Heart className="h-3 w-3 group-hover:fill-brand group-hover:text-brand transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
