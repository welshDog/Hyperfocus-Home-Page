import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { createServerClient } from '@/lib/supabase'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let anonId: unknown
  try {
    ;({ anonId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!UUID_RE.test(id) || typeof anonId !== 'string' || !UUID_RE.test(anonId)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!(await checkRateLimit(`like:${anonId}`, 30, 60_000))) {
    return NextResponse.json(
      { error: 'Slow down a little — try again in a minute.' },
      { status: 429 },
    )
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Likes are unavailable right now.' },
      { status: 503 },
    )
  }

  const { data, error } = await supabase
    .rpc('toggle_track_like', { p_track_id: id, p_anon_id: anonId })
    .single()

  if (error) {
    if (error.code === 'P0002') {
      return NextResponse.json({ error: 'Track not found.' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Could not save your like. Please try again.' },
      { status: 500 },
    )
  }

  const row = data as { liked: boolean; like_count: number }
  return NextResponse.json({ liked: row.liked, likeCount: row.like_count })
}
