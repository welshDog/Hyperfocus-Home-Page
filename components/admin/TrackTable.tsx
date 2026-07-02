'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { toggleTrackPublished } from '@/app/(admin)/admin/(dashboard)/actions'
import { TrackForm } from '@/components/admin/TrackForm'
import { Button } from '@/components/ui/Button'
import type { AdminPlaylistTrack } from '@/types'

function StorageBadge({ exists }: { exists: boolean }) {
  return (
    <span
      className={
        exists
          ? 'inline-flex rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-200'
          : 'inline-flex rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-300'
      }
    >
      {exists ? 'OK' : 'Missing'}
    </span>
  )
}

export function TrackTable({ tracks }: { tracks: AdminPlaylistTrack[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setAdding(true); setEditingId(null) }}>
          <Plus className="h-4 w-4" /> Add track
        </Button>
      </div>

      {adding && <TrackForm onDone={() => setAdding(false)} />}

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Artist</th>
              <th className="px-5 py-3 font-medium">Audio path</th>
              <th className="px-5 py-3 font-medium">Sort</th>
              <th className="px-5 py-3 font-medium">Published</th>
              <th className="px-5 py-3 font-medium">Storage</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                  No tracks added yet. Add a few here, then publish the ones
                  you want in the footer player.
                </td>
              </tr>
            )}
            {tracks.map((t) =>
              editingId === t.id ? (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td colSpan={7} className="px-5 py-4">
                    <TrackForm track={t} onDone={() => setEditingId(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{t.title}</td>
                  <td className="px-5 py-3 text-neutral-400">{t.artist}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-400">
                    {t.audio_path}
                  </td>
                  <td className="px-5 py-3 text-neutral-400">{t.sort_order}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        t.is_published
                          ? 'inline-flex rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-200'
                          : 'inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-neutral-400'
                      }
                    >
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StorageBadge exists={t.storage_exists} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingId(t.id); setAdding(false) }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/5 hover:text-brand-200"
                        aria-label={`Edit ${t.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <form action={toggleTrackPublished}>
                        <input type="hidden" name="id" value={t.id} />
                        <input
                          type="hidden"
                          name="next"
                          value={(!t.is_published).toString()}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/20 hover:text-neutral-100"
                        >
                          {t.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
