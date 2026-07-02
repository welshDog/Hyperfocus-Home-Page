import { createServerClient } from '@/lib/supabase'

export type HomepagePlaylistTrack = {
  id: string
  title: string
  artist: string
  audioUrl: string
  durationSeconds: number | null
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

  return (data as PlaylistTrackRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    audioUrl: supabase.storage.from('music').getPublicUrl(row.audio_path).data
      .publicUrl,
    durationSeconds: row.duration_seconds,
  }))
}
