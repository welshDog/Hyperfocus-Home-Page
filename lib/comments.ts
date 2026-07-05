import { createAdminClient } from '@/lib/supabase'
import type { AdminTrackComment, TrackComment } from '@/types'

type AdminCommentRow = TrackComment & {
  playlist_tracks: { title: string } | null
}

/** All comments (hidden included) with their track titles. Admin-only. */
export async function getAdminComments(): Promise<AdminTrackComment[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('track_comments')
    .select('*, playlist_tracks(title)')
    .order('created_at', { ascending: false })
    .limit(200)

  return ((data ?? []) as AdminCommentRow[]).map(
    ({ playlist_tracks, ...comment }) => ({
      ...comment,
      track_title: playlist_tracks?.title ?? 'Unknown track',
    }),
  )
}
