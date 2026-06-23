import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  let email: unknown
  try {
    ;({ email } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Subscriptions are unavailable right now.' },
      { status: 503 },
    )
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({ email: email.toLowerCase().trim() })

  // 23505 = unique violation → already subscribed; treat as success.
  if (error && error.code !== '23505') {
    return NextResponse.json(
      { error: 'Could not subscribe. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
