'use client'

import { useEffect, useState } from 'react'
import { getDeviceId } from '@/lib/deviceId'
import { cn } from '@/lib/utils'

type PublicComment = {
  id: string
  displayName: string
  body: string
  createdAt: string
}

const NAME_KEY = 'wd_comment_name'
const BODY_MAX = 1000

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function CommentSection({
  trackId,
  onPosted,
}: {
  trackId: string
  /** Lets the parent bump its visible comment count. */
  onPosted?: () => void
}) {
  const [comments, setComments] = useState<PublicComment[] | null>(null)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setName(window.localStorage.getItem(NAME_KEY) ?? '')
    } catch {
      // storage unavailable — start blank
    }
    let cancelled = false
    fetch(`/api/tracks/${trackId}/comments`)
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data: { comments?: PublicComment[] }) => {
        if (!cancelled) setComments(data.comments ?? [])
      })
      .catch(() => {
        if (!cancelled) setComments([])
      })
    return () => {
      cancelled = true
    }
  }, [trackId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setError(null)

    const anonId = getDeviceId() ?? crypto.randomUUID()
    setSending(true)
    try {
      const res = await fetch(`/api/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ anonId, displayName: name, body }),
      })
      const data = (await res.json()) as {
        comment?: PublicComment
        error?: string
      }
      if (!res.ok || !data.comment) {
        setError(data.error ?? 'Could not post your comment. Please try again.')
        return
      }
      setComments((prev) => [data.comment as PublicComment, ...(prev ?? [])])
      setBody('')
      onPosted?.()
      try {
        window.localStorage.setItem(NAME_KEY, name.trim())
      } catch {
        // fine — name just won't be remembered
      }
    } catch {
      setError('Could not post your comment. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-black/5 dark:border-white/5 pt-4">
      <form onSubmit={submit} className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            required
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 sm:max-w-[200px]"
          />
          <div className="relative flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Say something about this track…"
              maxLength={BODY_MAX}
              required
              rows={2}
              className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
            />
            {body.length > BODY_MAX - 100 && (
              <span className="absolute bottom-2 right-2 text-[10px] tabular-nums text-neutral-400">
                {BODY_MAX - body.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : (
            <span className="text-xs text-neutral-400">
              Be sound — no links, keep it friendly.
            </span>
          )}
          <button
            type="submit"
            disabled={sending || !name.trim() || !body.trim()}
            className={cn(
              'h-11 shrink-0 rounded-xl bg-brand px-5 font-heading text-sm font-semibold text-white',
              'hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
              'transition-[transform,background-color] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
            )}
          >
            {sending ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-4">
        {comments === null ? (
          <div className="space-y-3" aria-hidden>
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-black/5 dark:bg-white/10" />
                <div className="h-3 w-3/4 rounded bg-black/5 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No comments yet — be the first to say something.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id}>
              <p className="text-sm">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {c.displayName}
                </span>{' '}
                <span className="text-xs text-neutral-400">
                  · {timeAgo(c.createdAt)}
                </span>
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-neutral-700 dark:text-neutral-300">
                {c.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
