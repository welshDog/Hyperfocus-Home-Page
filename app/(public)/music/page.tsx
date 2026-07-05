import type { Metadata } from 'next'
import { Music } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MusicPlaylist } from '@/components/music/MusicPlaylist'
import { getPublicTracksWithStats } from '@/lib/music'
import { ogImage } from '@/lib/og'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Music',
  description:
    'Original tracks from the WelshDog workshop — press play, leave a like, drop a comment. No account needed.',
  openGraph: {
    title: 'Music · WelshDog Designs',
    description:
      'Original tracks from the WelshDog workshop — press play, leave a like, drop a comment.',
    images: [ogImage('Sounds from the workshop', 'Music')],
  },
}

export default async function MusicPage() {
  const tracks = await getPublicTracksWithStats()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Badge>
        <Music className="mr-1 h-3 w-3" /> The playlist
      </Badge>
      <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
        Sounds from the{' '}
        <span className="text-brand dark:text-brand-200">workshop</span>.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
        Tracks made in hyperfocus. Press play, tap the heart if one lands, and
        say hello in the comments — no account needed.
      </p>

      <div className="mt-10">
        {tracks.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white/60 p-8 text-center dark:border-white/5 dark:bg-white/5">
            <p className="font-heading font-semibold">
              No tracks published yet
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              I&apos;ll add a few soon — check back shortly.
            </p>
          </div>
        ) : (
          <MusicPlaylist tracks={tracks} />
        )}
      </div>
    </div>
  )
}
