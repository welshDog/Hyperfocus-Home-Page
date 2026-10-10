import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { createServerClient } from '@/lib/supabase'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Play count beacon — never errors loudly; the player must not care. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let anonId: unknown
  try {
    ;({ anonId } = await req.json())
  } catch {
    return NextResponse.json({ ok: true })
  }

  if (!UUID_RE.test(id)) return NextResponse.json({ ok: true })

  const limiterKey =
    typeof anonId === 'string' && UUID_RE.test(anonId) ? anonId : 'unknown'
  if (!(await checkRateLimit(`play:${limiterKey}`, 60, 60_000))) {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServerClient()
  if (supabase) {
    await supabase.rpc('increment_track_play', { p_track_id: id })
  }
  return NextResponse.json({ ok: true })
}
