import { createServerClient } from '@/lib/supabase'
import type { TrackPublicStats } from '@/types'

export type HomepagePlaylistTrack = {
  id: string
  title: string
  artist: string
  audioUrl: string
  durationSeconds: number | null
  likeCount: number
}

type PlaylistTrackRow = {
  id: string
  title: string
  artist: string
  audio_path: string
  duration_seconds: number | null
}

export async function getHomepagePlaylistTracks(
  limit = 3,
): Promise<HomepagePlaylistTrack[]> {
  const supabase = createServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('id,title,artist,audio_path,duration_seconds')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  const ids = (data as PlaylistTrackRow[]).map((row) => row.id)
  const likeCounts = new Map<string, number>()
  if (ids.length) {
    const { data: stats } = await supabase
      .from('track_public_stats')
      .select('track_id,like_count')
      .in('track_id', ids)
    for (const s of (stats ?? []) as Pick<
      TrackPublicStats,
      'track_id' | 'like_count'
    >[]) {
      likeCounts.set(s.track_id, s.like_count)
    }
  }

  return (data as PlaylistTrackRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    audioUrl: supabase.storage.from('music').getPublicUrl(row.audio_path).data
      .publicUrl,
    durationSeconds: row.duration_seconds,
    likeCount: likeCounts.get(row.id) ?? 0,
  }))
}
