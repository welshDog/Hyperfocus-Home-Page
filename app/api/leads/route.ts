import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendLeadConfirmation } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIERS = ['Starter', 'Pro', 'Done For You', 'Not sure yet']

export async function POST(req: Request) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const tier = typeof payload.tier === 'string' ? payload.tier : null
  const message =
    typeof payload.message === 'string' ? payload.message.trim() : null

  if (!name) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Demo bookings are unavailable right now.' },
      { status: 503 },
    )
  }

  const { error } = await supabase.from('leads').insert({
    name,
    email: email.toLowerCase(),
    tier: tier && TIERS.includes(tier) ? tier : null,
    message,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Could not submit. Please try again.' },
      { status: 500 },
    )
  }

  // Fire-and-forget confirmation; never block the 200 on email delivery.
  const emailResult = await sendLeadConfirmation({ to: email, name, tier })

  return NextResponse.json({ ok: true, emailed: emailResult.sent })
}
