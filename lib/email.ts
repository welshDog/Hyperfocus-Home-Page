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

/** Notify the store owner that a paid order needs self-fulfilment (made +
 *  shipped by hand — e.g. 3D prints, gifts, bundle apparel). Fails soft. */
export async function sendOrderNotification(opts: {
  orderId: string
  productName: string
  customerEmail: string
  amount: number | null
}): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false, reason: 'no-key' }

  const to =
    (process.env.ADMIN_EMAIL ?? '').trim() ||
    (process.env.ADMIN_EMAILS ?? '').split(',')[0]?.trim()
  if (!to) return { sent: false, reason: 'no-admin-email' }

  const amountLine = opts.amount != null ? `£${opts.amount.toFixed(2)}` : '—'
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <h1 style="color:#01696f;font-size:20px">New order needs fulfilment 🐕</h1>
      <p>A paid order needs you to make &amp; ship it.</p>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Product</td><td><strong>${escapeHtml(opts.productName)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Amount</td><td>${amountLine}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Customer</td><td>${escapeHtml(opts.customerEmail)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Order</td><td>${escapeHtml(opts.orderId)}</td></tr>
      </table>
      <p style="margin-top:16px">Open Mission Control → Orders and hit “Mark fulfilled” once it&apos;s shipped.</p>
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
        to: [to],
        subject: `🛠️ Order needs fulfilment — ${opts.productName}`,
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
