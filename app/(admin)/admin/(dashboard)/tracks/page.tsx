import { Info } from 'lucide-react'
import { getAdminTracks } from '@/lib/tracks'
import { TrackTable } from '@/components/admin/TrackTable'
import type { AdminPlaylistTrack } from '@/types'

async function getTracks(): Promise<AdminPlaylistTrack[]> {
  try {
    return await getAdminTracks()
  } catch {
    return []
  }
}

export default async function AdminTracks() {
  const tracks = await getTracks()
  const missing = tracks.filter((t) => !t.storage_exists).length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Tracks</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {tracks.length} track{tracks.length === 1 ? '' : 's'} in the footer
          playlist
          {missing > 0 && (
            <span className="text-red-300"> — {missing} missing in storage</span>
          )}
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" />
        <p>
          The <strong>Storage</strong> badge checks each audio path against the
          real files in the music bucket. A <strong>Missing</strong> track will
          render in the player but won&apos;t play — fix the path here, or run{' '}
          <code className="font-mono text-xs">npm run audit:playlist</code> for
          a full report.
        </p>
      </div>

      <TrackTable tracks={tracks} />
    </div>
  )
}
