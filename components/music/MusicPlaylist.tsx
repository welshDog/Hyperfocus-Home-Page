'use client'

import { MessageSquare, Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CommentSection } from '@/components/music/CommentSection'
import { LikeButton } from '@/components/music/LikeButton'
import type { PublicTrack } from '@/lib/music'
import { firePlayBeacon } from '@/lib/playBeacon'
import { cn } from '@/lib/utils'

function formatTime(totalSeconds: number | null): string {
  if (totalSeconds === null || !Number.isFinite(totalSeconds)) return '–:––'
  const s = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function MusicPlaylist({ tracks }: { tracks: PublicTrack[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  // Local bump so the visible count updates when someone posts.
  const [commentBumps, setCommentBumps] = useState<Record<string, number>>({})

  const active = useMemo(
    () => tracks.find((t) => t.id === activeId) ?? null,
    [tracks, activeId],
  )

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onTimeUpdate = () => setTime(el.currentTime || 0)
    const onLoaded = () => setDuration(el.duration || 0)
    const onPlay = () => {
      setIsPlaying(true)
      if (activeId) firePlayBeacon(activeId)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      const i = tracks.findIndex((t) => t.id === activeId)
      if (i === -1 || tracks.length < 2) {
        setIsPlaying(false)
        return
      }
      setActiveId(tracks[(i + 1) % tracks.length].id)
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [tracks, activeId])

  // Load + autoplay whenever the active track changes.
  useEffect(() => {
    const el = audioRef.current
    if (!el || !active) return
    setTime(0)
    setDuration(0)
    el.src = active.audioUrl
    el.load()
    void el.play().catch(() => setIsPlaying(false))
  }, [active?.audioUrl, active])

  function toggleTrack(track: PublicTrack) {
    const el = audioRef.current
    if (!el) return
    if (track.id === activeId) {
      if (isPlaying) el.pause()
      else void el.play().catch(() => setIsPlaying(false))
      return
    }
    setActiveId(track.id)
  }

  function toggleComments(trackId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  const percent =
    duration > 0 ? Math.min(100, Math.max(0, (time / duration) * 100)) : 0

  return (
    <div className="space-y-3">
      {tracks.map((track) => {
        const isActive = track.id === activeId
        const commentsOpen = openComments.has(track.id)
        const commentCount =
          track.commentCount + (commentBumps[track.id] ?? 0)

        return (
          <div
            key={track.id}
            className={cn(
              'rounded-xl border bg-white/60 p-4 dark:bg-white/5 sm:p-5',
              'transition-colors duration-200',
              isActive
                ? 'border-brand/40 dark:border-brand-300/30'
                : 'border-black/5 dark:border-white/5',
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                aria-label={
                  isActive && isPlaying
                    ? `Pause ${track.title}`
                    : `Play ${track.title}`
                }
                onClick={() => toggleTrack(track)}
                className={cn(
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                  'active:scale-[0.96] transition-[transform,background-color] duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
                  isActive && isPlaying
                    ? 'bg-brand text-white hover:bg-brand-700'
                    : 'border border-black/10 text-neutral-700 hover:border-brand hover:text-brand dark:border-white/10 dark:text-neutral-200 dark:hover:text-brand-200',
                )}
              >
                {isActive && isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-[1px]" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold sm:text-base">
                  {track.title}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                  {track.artist}
                  <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  {track.playCount === 1
                    ? '1 play'
                    : `${track.playCount} plays`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <span className="hidden text-xs tabular-nums text-neutral-400 sm:block">
                  {isActive
                    ? `${formatTime(time)} / ${formatTime(duration || track.durationSeconds)}`
                    : formatTime(track.durationSeconds)}
                </span>
                <LikeButton
                  trackId={track.id}
                  initialCount={track.likeCount}
                />
                <button
                  type="button"
                  onClick={() => toggleComments(track.id)}
                  aria-expanded={commentsOpen}
                  aria-label={`${commentsOpen ? 'Hide' : 'Show'} comments for ${track.title}`}
                  className={cn(
                    'inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium tabular-nums',
                    'text-neutral-500 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200',
                    'active:scale-[0.96] transition-[transform,color] duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
                    commentsOpen && 'text-brand dark:text-brand-200',
                  )}
                >
                  <MessageSquare className="h-5 w-5" aria-hidden />
                  <span>{commentCount}</span>
                </button>
              </div>
            </div>

            {isActive && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full bg-brand transition-[width] dark:bg-brand-200"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}

            {commentsOpen && (
              <div className="mt-4">
                <CommentSection
                  trackId={track.id}
                  onPosted={() =>
                    setCommentBumps((prev) => ({
                      ...prev,
                      [track.id]: (prev[track.id] ?? 0) + 1,
                    }))
                  }
                />
              </div>
            )}
          </div>
        )
      })}

      <audio ref={audioRef} preload="metadata" />
    </div>
  )
}
