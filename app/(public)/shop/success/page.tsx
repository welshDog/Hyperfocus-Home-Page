import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

// Depends on the live Stripe session — never cache.
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Order confirmed' }

/** Record the paid order. Idempotent via the unique stripe_session_id,
 *  so a refresh of this page never double-writes. */
async function recordOrder(sessionId: string): Promise<string | null> {
  if (!stripe) return null

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') return null

  const email = session.customer_details?.email ?? 'unknown@welshdog.designs'
  const productId = (session.metadata?.product_id as string | undefined) ?? null

  try {
    const admin = createAdminClient()
    await admin.from('orders').upsert(
      {
        product_id: productId,
        customer_email: email,
        status: 'paid',
        stripe_session_id: session.id,
      },
      { onConflict: 'stripe_session_id', ignoreDuplicates: true },
    )
  } catch {
    // Admin client unconfigured — confirmation still shows; webhook can backfill.
  }

  return email
}

export default async function SuccessPage(
  props: {
    searchParams: Promise<{ session_id?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id
  const email = sessionId ? await recordOrder(sessionId).catch(() => null) : null

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20">
      <Card className="flex flex-col items-center gap-5 p-10 text-center sm:p-14">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand-300/15 dark:text-brand-200">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order confirmed</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Diolch! Your order&apos;s in.
            {email
              ? ` A receipt is on its way to ${email}.`
              : ' A receipt is on its way to your email.'}{' '}
            It&apos;s made to order in South Wales — we&apos;ll be in touch with
            shipping details.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/shop">Keep shopping</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back home
          </ButtonLink>
        </div>
      </Card>
    </div>
  )
}
