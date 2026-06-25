import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import { fulfilViaTeemill } from '@/lib/teemill'

// Stripe needs the raw request body for signature verification — never cache
// or transform it.
export const dynamic = 'force-dynamic'

// NOTE: This route is intentionally RATE-LIMIT EXEMPT — Stripe must always be
// able to reach it. No rate limiting is applied here and middleware.ts only
// matches /admin, so the webhook is never throttled or auth-gated.

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    console.error(
      '[stripe webhook] Stripe or STRIPE_WEBHOOK_SECRET not configured',
    )
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  // Verify the Stripe signature against the raw body.
  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  // Acknowledge anything we don't act on so Stripe doesn't keep retrying.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const admin = createAdminClient()

  const email = session.customer_details?.email ?? 'unknown@welshdog.shop'
  const productId = (session.metadata?.product_id as string | undefined) ?? null
  const amount = session.amount_total != null ? session.amount_total / 100 : null
  const paid = session.payment_status === 'paid'

  // 1) Record the order — idempotent on the unique stripe_session_id.
  const { error: upsertErr } = await admin.from('orders').upsert(
    {
      product_id: productId,
      customer_email: email,
      status: paid ? 'paid' : 'pending',
      amount,
      stripe_session_id: session.id,
    },
    { onConflict: 'stripe_session_id' },
  )
  if (upsertErr) {
    console.error('[stripe webhook] order upsert failed:', upsertErr.message)
    return NextResponse.json({ error: 'DB write failed.' }, { status: 500 })
  }

  // 2) Claim fulfilment exactly once. The conditional update is atomic, so a
  //    duplicate delivery of this event flips nothing and is a no-op below.
  const { data: claimed } = await admin
    .from('orders')
    .update({ fulfilled: true })
    .eq('stripe_session_id', session.id)
    .eq('fulfilled', false)
    .select('id')
    .maybeSingle()

  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // 3) Fulfil + decrement stock — runs at most once per order.
  if (productId) {
    const { data: product } = await admin
      .from('products')
      .select('teemill_variant_id, stock')
      .eq('id', productId)
      .maybeSingle()

    // Apparel (has a Teemill variant) → request print-on-demand fulfilment.
    if (product?.teemill_variant_id) {
      const addr =
        session.shipping_details?.address ?? session.customer_details?.address
      const result = await fulfilViaTeemill({
        variantId: product.teemill_variant_id,
        quantity: 1,
        email,
        address: {
          name:
            session.shipping_details?.name ??
            session.customer_details?.name ??
            '',
          line1: addr?.line1 ?? '',
          line2: addr?.line2 ?? undefined,
          city: addr?.city ?? '',
          postcode: addr?.postal_code ?? '',
          country: addr?.country ?? '',
        },
        reference: session.id,
      })

      if (!result.ok) {
        // Release the claim so a Stripe retry can re-attempt fulfilment.
        await admin
          .from('orders')
          .update({ fulfilled: false })
          .eq('id', claimed.id)
        console.error('[stripe webhook] Teemill fulfilment failed:', result.error)
        return NextResponse.json({ error: 'Fulfilment failed.' }, { status: 500 })
      }

      await admin
        .from('orders')
        .update({ teemill_order_id: result.orderId, status: 'fulfilled' })
        .eq('id', claimed.id)

      console.log(
        `[stripe webhook] order ${claimed.id} fulfilled via Teemill ` +
          `(${result.mock ? 'MOCK' : 'LIVE'}) variant ${product.teemill_variant_id}`,
      )
    }

    // Decrement stock by 1, never below 0.
    if (typeof product?.stock === 'number') {
      await admin
        .from('products')
        .update({ stock: Math.max(product.stock - 1, 0) })
        .eq('id', productId)
    }
  }

  return NextResponse.json({ received: true })
}
