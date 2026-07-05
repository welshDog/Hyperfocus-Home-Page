'use client'

import { Pause, Play, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LikeButton } from '@/components/music/LikeButton'
import { firePlayBeacon } from '@/lib/playBeacon'
import type { HomepagePlaylistTrack } from '@/lib/playlist'

export function ListenWhileBrowse({
  tracks,
}: {
  tracks: HomepagePlaylistTrack[]
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const current = tracks[index] ?? null
  const percent = useMemo(() => {
    if (!duration || duration <= 0) return 0
    return Math.min(100, Math.max(0, (time / duration) * 100))
  }, [time, duration])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onTimeUpdate = () => setTime(el.currentTime || 0)
    const onLoaded = () => setDuration(el.duration || 0)
    const onPlay = () => {
      const track = tracks[index]
      if (track) firePlayBeacon(track.id)
    }
    const onEnded = () => {
      if (!tracks.length) return
      setIndex((v) => (v + 1) % tracks.length)
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('play', onPlay)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('ended', onEnded)
    }
  }, [tracks, index])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    setTime(0)
    setDuration(0)
    if (!current) return
    el.src = current.audioUrl
    el.load()
    if (isPlaying) {
      void el.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [current?.audioUrl, isPlaying, current])

  function togglePlay() {
    const el = audioRef.current
    if (!el || !current) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
      return
    }
    void el.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    )
  }

  function nextTrack() {
    if (!tracks.length) return
    setIndex((v) => (v + 1) % tracks.length)
  }

  return (
    <div className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold">
            Listen while you browse
          </p>
          {current ? (
            <>
              <p className="mt-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                {current.title}
              </p>
              <div className="flex items-center gap-1">
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {current.artist}
                </p>
                <LikeButton
                  key={current.id}
                  trackId={current.id}
                  initialCount={current.likeCount}
                  compact
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              No tracks published yet — I’ll add a few soon.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={togglePlay}
            disabled={!current}
            className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand active:scale-[0.98] transition"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next track"
            onClick={nextTrack}
            disabled={!current || tracks.length < 2}
            className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-neutral-700 hover:text-brand dark:text-neutral-200 dark:hover:text-brand-200 disabled:opacity-50 disabled:hover:text-neutral-700 active:scale-[0.98] transition"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full bg-brand dark:bg-brand-200 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  )
}
