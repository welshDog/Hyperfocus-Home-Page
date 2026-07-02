'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { saveTrack, type TrackFormState } from '@/app/(admin)/admin/(dashboard)/actions'
import { Button } from '@/components/ui/Button'
import type { PlaylistTrack } from '@/types'

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:border-brand-300 focus-visible:outline-none'
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-neutral-300'

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : isNew ? 'Add track' : 'Save track'}
    </Button>
  )
}

/** Inline add/edit form for a playlist track. Calls `onDone` after a
 *  successful save (or when cancelled) so the parent can close it. */
export function TrackForm({
  track,
  onDone,
}: {
  track?: PlaylistTrack
  onDone: () => void
}) {
  const [state, action] = useFormState<TrackFormState, FormData>(saveTrack, undefined)

  useEffect(() => {
    if (state?.ok) onDone()
  }, [state, onDone])

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      {track && <input type="hidden" name="id" value={track.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Title
          <input
            name="title"
            required
            defaultValue={track?.title ?? ''}
            placeholder="Track title"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Artist
          <input
            name="artist"
            required
            defaultValue={track?.artist ?? ''}
            placeholder="Artist name"
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Audio path
        <input
          name="audio_path"
          required
          defaultValue={track?.audio_path ?? ''}
          placeholder="exact-file-name.mp3"
          className={`${inputClass} font-mono text-sm`}
        />
        <span className="text-xs font-normal text-neutral-500">
          Must match the file name in the music bucket exactly — the audit
          badge will tell you if it doesn&apos;t.
        </span>
      </label>

      <div className="flex flex-wrap items-end gap-4">
        <label className={`${labelClass} w-32`}>
          Sort order
          <input
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={track?.sort_order ?? 0}
            className={inputClass}
          />
        </label>
        <label className="flex h-11 items-center gap-3 text-sm font-medium text-neutral-300">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={track?.is_published ?? false}
            className="h-4 w-4 rounded border-white/20 bg-card accent-brand"
          />
          Published in footer player
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <SubmitButton isNew={!track} />
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
