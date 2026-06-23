/** Transactional email via Resend. No SDK dependency — uses the REST API.
 *  Fails soft: when RESEND_API_KEY is unset, returns {sent:false} so callers
 *  can carry on (the lead is still saved). */

const FROM = process.env.RESEND_FROM ?? 'WelshDog Designs <onboarding@resend.dev>'

export async function sendLeadConfirmation(opts: {
  to: string
  name: string
  tier?: string | null
}): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false, reason: 'no-key' }

  const tierLine = opts.tier
    ? `<p>You're interested in the <strong>${escapeHtml(opts.tier)}</strong> tier — nice choice.</p>`
    : ''

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <h1 style="color:#01696f;font-size:22px">Diolch, ${escapeHtml(opts.name)}! 🐕</h1>
      <p>Thanks for booking a demo with <strong>WelshDog Designs</strong>. Your request is in — Lyndon will be in touch personally to set up a time.</p>
      ${tierLine}
      <p>In the meantime, have a look around the shop and blog.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">Built for brains that don't switch off. · Hyperfocus Zone Ltd, South Wales</p>
    </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: 'Your WelshDog demo request is in 🐕',
        html,
      }),
    })
    return { sent: res.ok, reason: res.ok ? undefined : `http-${res.status}` }
  } catch {
    return { sent: false, reason: 'fetch-failed' }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
