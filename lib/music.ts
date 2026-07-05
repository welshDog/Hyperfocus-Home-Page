import { createServerClient } from '@/lib/supabase'
import type { TrackPublicStats } from '@/types'

export type PublicTrack = {
  id: string
  title: string
  artist: string
  audioUrl: string
  durationSeconds: number | null
  likeCount: number
  commentCount: number
  playCount: number
}

type PlaylistTrackRow = {
  id: string
  title: string
  artist: string
  audio_path: string
  duration_seconds: number | null
}

/** Every published track with its public like/comment/play counts.
 *  Two anon queries (tracks + `track_public_stats` view) merged by id. */
export async function getPublicTracksWithStats(): Promise<PublicTrack[]> {
  const supabase = createServerClient()
  if (!supabase) return []

  const [tracksRes, statsRes] = await Promise.all([
    supabase
      .from('playlist_tracks')
      .select('id,title,artist,audio_path,duration_seconds')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('track_public_stats')
      .select('track_id,like_count,comment_count,play_count'),
  ])

  if (tracksRes.error || !tracksRes.data) return []

  const stats = new Map(
    ((statsRes.data ?? []) as TrackPublicStats[]).map((s) => [s.track_id, s]),
  )

  return (tracksRes.data as PlaylistTrackRow[]).map((row) => {
    const s = stats.get(row.id)
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      audioUrl: supabase.storage.from('music').getPublicUrl(row.audio_path)
        .data.publicUrl,
      durationSeconds: row.duration_seconds,
      likeCount: s?.like_count ?? 0,
      commentCount: s?.comment_count ?? 0,
      playCount: s?.play_count ?? 0,
    }
  })
}
