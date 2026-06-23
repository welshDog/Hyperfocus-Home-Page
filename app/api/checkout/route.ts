import { NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: 'Payments are not configured yet. Check back soon!' },
      { status: 503 },
    )
  }

  let productId: unknown
  try {
    ;({ productId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (typeof productId !== 'string') {
    return NextResponse.json({ error: 'Missing product.' }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Store unavailable.' }, { status: 503 })
  }

  // Server is the source of truth for price — never trust a client amount.
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, price, images, stock, active')
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }
  if (product.stock <= 0) {
    return NextResponse.json({ error: 'Out of stock.' }, { status: 409 })
  }

  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  // Stripe only accepts publicly reachable image URLs.
  const images = (product.images ?? []).filter((u: string) =>
    /^https?:\/\//.test(u),
  )

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(Number(product.price) * 100),
          product_data: {
            name: product.name,
            ...(images.length ? { images: [images[0]] } : {}),
          },
        },
      },
    ],
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/${product.slug}`,
    metadata: { product_id: product.id },
  })

  return NextResponse.json({ url: session.url })
}
