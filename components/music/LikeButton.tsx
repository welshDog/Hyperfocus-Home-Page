'use client'

import { Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getDeviceId, getLikedSet, setLiked } from '@/lib/deviceId'
import { cn } from '@/lib/utils'

/** Ephemeral fallback when localStorage is unavailable (private mode) —
 *  likes still work for the session, they just won't persist. */
let sessionFallbackId: string | null = null
function deviceOrSessionId(): string {
  const stored = getDeviceId()
  if (stored) return stored
  if (!sessionFallbackId) sessionFallbackId = crypto.randomUUID()
  return sessionFallbackId
}

export function LikeButton({
  trackId,
  initialCount,
  compact = false,
}: {
  trackId: string
  initialCount: number
  compact?: boolean
}) {
  // liked starts false and syncs from localStorage after mount so the
  // server-rendered HTML never mismatches.
  const [liked, setLikedState] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [justLiked, setJustLiked] = useState(false)
  const busyRef = useRef(false)

  useEffect(() => {
    setLikedState(getLikedSet().has(trackId))
  }, [trackId])

  async function toggle() {
    if (busyRef.current) return
    busyRef.current = true

    const nextLiked = !liked
    // Optimistic flip; the server response is the source of truth for count.
    setLikedState(nextLiked)
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))
    if (nextLiked) {
      setJustLiked(true)
      window.setTimeout(() => setJustLiked(false), 350)
    }

    try {
      const res = await fetch(`/api/tracks/${trackId}/like`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ anonId: deviceOrSessionId() }),
      })
      if (!res.ok) throw new Error('like failed')
      const data = (await res.json()) as { liked: boolean; likeCount: number }
      setLikedState(data.liked)
      setCount(data.likeCount)
      setLiked(trackId, data.liked)
    } catch {
      // Revert the optimistic flip.
      setLikedState(liked)
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)))
    } finally {
      busyRef.current = false
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this track' : 'Like this track'}
      className={cn(
        'group inline-flex items-center justify-center gap-1.5 rounded-lg font-medium tabular-nums',
        'text-neutral-500 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200',
        'transition-colors active:scale-[0.94]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
        liked && 'text-brand dark:text-brand-200',
        compact ? 'h-9 px-2 text-xs' : 'h-11 px-3 text-sm',
      )}
      style={{
        transition:
          'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), color 150ms',
      }}
    >
      <Heart
        aria-hidden
        className={cn(
          compact ? 'h-4 w-4' : 'h-5 w-5',
          'transition-transform duration-300',
          liked && 'fill-current',
          justLiked && 'scale-125',
        )}
      />
      <span>{count}</span>
    </button>
  )
}
