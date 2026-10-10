import { NextResponse } from 'next/server'
import { checkRateLimit, clientIp } from '@/lib/rateLimit'
import { createServerClient } from '@/lib/supabase'
import type { TrackComment } from '@/types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LINK_RE = /(https?:\/\/|www\.)/i
const BLOCKED_WORDS = [
  'fuck',
  'shit',
  'cunt',
  'bitch',
  'wanker',
  'twat',
  'nigger',
  'faggot',
  'retard',
]
const BLOCKED_RE = new RegExp(`\\b(${BLOCKED_WORDS.join('|')})\\b`, 'i')

const NAME_MAX = 40
const BODY_MAX = 1000
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

type PublicComment = {
  id: string
  displayName: string
  body: string
  createdAt: string
}

function toPublic(row: Pick<TrackComment, 'id' | 'display_name' | 'body' | 'created_at'>): PublicComment {
  return {
    id: row.id,
    displayName: row.display_name,
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) return NextResponse.json({ comments: [] })

  const { data, error } = await supabase
    .from('track_comments')
    .select('id,display_name,body,created_at')
    .eq('track_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) {
    return NextResponse.json(
      { error: 'Could not load comments.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    comments: (data as TrackComment[]).map(toPublic),
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let anonId: unknown
  let displayName: unknown
  let body: unknown
  try {
    ;({ anonId, displayName, body } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!UUID_RE.test(id) || typeof anonId !== 'string' || !UUID_RE.test(anonId)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = typeof displayName === 'string' ? displayName.trim() : ''
  const text = typeof body === 'string' ? body.trim() : ''

  if (!name || name.length > NAME_MAX) {
    return NextResponse.json(
      { error: `Please add a name (up to ${NAME_MAX} characters).` },
      { status: 400 },
    )
  }
  if (!text || text.length > BODY_MAX) {
    return NextResponse.json(
      { error: `Comments need to be 1–${BODY_MAX} characters.` },
      { status: 400 },
    )
  }
  if (LINK_RE.test(text) || LINK_RE.test(name)) {
    return NextResponse.json(
      { error: "Links aren't allowed in comments." },
      { status: 400 },
    )
  }
  if (BLOCKED_RE.test(text) || BLOCKED_RE.test(name)) {
    return NextResponse.json(
      { error: 'Keep it friendly, please.' },
      { status: 400 },
    )
  }

  // anonId is client-chosen, so also bucket by IP (3x headroom for shared NATs).
  const allowed =
    (await checkRateLimit(`comment:${anonId}`, MAX_PER_WINDOW, WINDOW_MS)) &&
    (await checkRateLimit(`comment-ip:${clientIp(req)}`, MAX_PER_WINDOW * 3, WINDOW_MS))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Slow down a little — try again in a few minutes.' },
      { status: 429 },
    )
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Comments are unavailable right now.' },
      { status: 503 },
    )
  }

  // Authoritative rate check (the in-memory limiter resets on cold starts).
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('track_comments')
    .select('id', { count: 'exact', head: true })
    .eq('anon_id', anonId)
    .gte('created_at', since)
  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { error: 'Slow down a little — try again in a few minutes.' },
      { status: 429 },
    )
  }

  const { data, error } = await supabase
    .from('track_comments')
    .insert({ track_id: id, anon_id: anonId, display_name: name, body: text })
    .select('id,display_name,body,created_at')
    .single()

  if (error || !data) {
    // RLS with-check rejects unpublished/unknown tracks.
    return NextResponse.json(
      { error: 'Could not post your comment. Please try again.' },
      { status: 400 },
    )
  }

  return NextResponse.json(
    { comment: toPublic(data as TrackComment) },
    { status: 201 },
  )
}
