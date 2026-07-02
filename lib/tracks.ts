import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase'
import type { AdminPlaylistTrack, PlaylistTrack } from '@/types'

export const MUSIC_BUCKET = 'music'

/** Recursively list every object path in the music bucket.
 *  Storage `list()` only returns one level, so walk folders (id === null). */
export async function listMusicObjectPaths(
  admin: SupabaseClient,
  prefix = '',
): Promise<string[]> {
  const { data, error } = await admin.storage
    .from(MUSIC_BUCKET)
    .list(prefix, { limit: 1000 })
  if (error || !data) return []

  const paths: string[] = []
  for (const entry of data) {
    if (entry.name === '.emptyFolderPlaceholder') continue
    const full = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.id === null) {
      paths.push(...(await listMusicObjectPaths(admin, full)))
    } else {
      paths.push(full)
    }
  }
  return paths
}

/** All playlist rows (published or not) with a `storage_exists` flag
 *  computed against the real bucket contents. Admin-only. */
export async function getAdminTracks(): Promise<AdminPlaylistTrack[]> {
  const admin = createAdminClient()

  const [{ data }, objectPaths] = await Promise.all([
    admin
      .from('playlist_tracks')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    listMusicObjectPaths(admin),
  ])

  const existing = new Set(objectPaths)
  return ((data ?? []) as PlaylistTrack[]).map((track) => ({
    ...track,
    storage_exists: existing.has(track.audio_path),
  }))
}
