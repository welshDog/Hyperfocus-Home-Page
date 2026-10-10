import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Fakes ───────────────────────────────────────────────────────────────
type Call = { table: string; op: string; args: unknown[] }
const h = vi.hoisted(() => ({
  calls: [] as { table: string; op: string; args: unknown[] }[],
  state: {} as {
    upsertError: { message: string } | null
    claim: { id: string } | null
    product: Record<string, unknown> | null
  },
  constructEvent: vi.fn(),
  fulfil: vi.fn(),
  notify: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: h.constructEvent } },
}))
vi.mock('@/lib/teemill', () => ({ fulfilViaTeemill: h.fulfil }))
vi.mock('@/lib/email', () => ({ sendOrderNotification: h.notify }))
vi.mock('@/lib/supabase', () => ({
  createAdminClient: () => ({
    from(table: string) {
      let op = ''
      const b: Record<string, unknown> = {}
      const rec =
        (name: string) =>
        (...args: unknown[]) => {
          if (!op) op = name
          h.calls.push({ table, op: name, args })
          return b
        }
      for (const m of ['upsert', 'update', 'select', 'eq']) b[m] = rec(m)
      b.maybeSingle = () => {
        if (table === 'orders') return Promise.resolve({ data: h.state.claim })
        return Promise.resolve({ data: h.state.product })
      }
      // `await builder` (no maybeSingle) resolves with an error slot.
      b.then = (res: (v: unknown) => unknown) =>
        res({ error: op === 'upsert' ? h.state.upsertError : null })
      return b
    },
  }),
}))

import { POST } from '@/app/api/webhooks/stripe/route'

// ── Helpers ─────────────────────────────────────────────────────────────
const req = (sig: string | null = 'sig') =>
  new Request('http://x/api/webhooks/stripe', {
    method: 'POST',
    body: '{}',
    headers: sig ? { 'stripe-signature': sig } : {},
  })

const session = (over: Record<string, unknown> = {}) => ({
  id: 'cs_1',
  payment_status: 'paid',
  amount_total: 2500,
  metadata: { product_id: 'p1' },
  customer_details: { email: 'a@b.com', name: 'A' },
  ...over,
})
const event = (obj: unknown, type = 'checkout.session.completed') => ({
  type,
  data: { object: obj },
})
const updates = (table: string): Call[] =>
  h.calls.filter((c) => c.table === table && c.op === 'update')
const hasUpdate = (table: string, payload: unknown) =>
  updates(table).some((c) => JSON.stringify(c.args[0]) === JSON.stringify(payload))

beforeEach(() => {
  vi.clearAllMocks()
  h.calls.length = 0
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  h.state.upsertError = null
  h.state.claim = { id: 'o1' }
  h.state.product = { name: 'Mug', teemill_variant_id: null, stock: 5 }
  h.constructEvent.mockReturnValue(event(session()))
  h.fulfil.mockResolvedValue({ ok: true, orderId: 'tm_1', mock: true })
  h.notify.mockResolvedValue({ sent: true })
})

describe('stripe webhook', () => {
  it('503s when the webhook secret is missing', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    expect((await POST(req())).status).toBe(503)
  })

  it('400s without a signature header', async () => {
    expect((await POST(req(null))).status).toBe(400)
    expect(h.constructEvent).not.toHaveBeenCalled()
  })

  it('400s on an invalid signature and writes nothing', async () => {
    h.constructEvent.mockImplementation(() => {
      throw new Error('bad sig')
    })
    expect((await POST(req())).status).toBe(400)
    expect(h.calls).toHaveLength(0)
  })

  it('acks unrelated event types without touching the DB', async () => {
    h.constructEvent.mockReturnValue(event({}, 'charge.refunded'))
    const res = await POST(req())
    expect(await res.json()).toEqual({ received: true })
    expect(h.calls).toHaveLength(0)
  })

  it('upserts the order idempotently on stripe_session_id', async () => {
    await POST(req())
    const up = h.calls.find((c) => c.op === 'upsert')!
    expect(up.args[1]).toEqual({ onConflict: 'stripe_session_id' })
    expect(up.args[0]).toMatchObject({
      stripe_session_id: 'cs_1',
      status: 'paid',
      amount: 25,
      customer_email: 'a@b.com',
    })
  })

  it('500s (so Stripe retries) when the order write fails', async () => {
    h.state.upsertError = { message: 'boom' }
    expect((await POST(req())).status).toBe(500)
    expect(h.fulfil).not.toHaveBeenCalled()
  })

  it('records unpaid sessions as pending and does not fulfil', async () => {
    h.constructEvent.mockReturnValue(event(session({ payment_status: 'unpaid' })))
    const res = await POST(req())
    expect(await res.json()).toEqual({ received: true, unpaid: true })
    expect(h.calls.find((c) => c.op === 'upsert')!.args[0]).toMatchObject({
      status: 'pending',
    })
    expect(h.fulfil).not.toHaveBeenCalled()
    expect(h.notify).not.toHaveBeenCalled()
  })

  it('treats a duplicate delivery as a no-op', async () => {
    h.state.claim = null
    const res = await POST(req())
    expect(await res.json()).toEqual({ received: true, duplicate: true })
    expect(h.fulfil).not.toHaveBeenCalled()
    expect(h.notify).not.toHaveBeenCalled()
    expect(updates('products')).toHaveLength(0)
  })

  it('self-fulfils products with no Teemill variant: flags order, emails owner', async () => {
    const res = await POST(req())
    expect(res.status).toBe(200)
    expect(h.fulfil).not.toHaveBeenCalled()
    expect(h.notify).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'o1', productName: 'Mug' }),
    )
    expect(hasUpdate('orders', { status: 'needs_fulfilment' })).toBe(true)
  })

  it('auto-fulfils Teemill products and marks the order fulfilled', async () => {
    h.state.product = { name: 'Tee', teemill_variant_id: 'v9', stock: 2 }
    const res = await POST(req())
    expect(res.status).toBe(200)
    expect(h.fulfil).toHaveBeenCalledWith(
      expect.objectContaining({ variantRef: 'v9', reference: 'cs_1' }),
    )
    expect(h.notify).not.toHaveBeenCalled()
    expect(
      hasUpdate('orders', { teemill_order_id: 'tm_1', status: 'fulfilled' }),
    ).toBe(true)
  })

  it('releases the fulfilment claim and 500s when Teemill fails', async () => {
    h.state.product = { name: 'Tee', teemill_variant_id: 'v9', stock: 2 }
    h.fulfil.mockResolvedValue({ ok: false, error: 'down' })
    const res = await POST(req())
    expect(res.status).toBe(500)
    expect(hasUpdate('orders', { fulfilled: false })).toBe(true)
    expect(updates('products')).toHaveLength(0)
  })

  it('decrements stock by 1 and never below 0', async () => {
    await POST(req())
    expect(updates('products')[0].args[0]).toEqual({ stock: 4 })

    h.calls.length = 0
    h.state.product = { name: 'Mug', teemill_variant_id: null, stock: 0 }
    await POST(req())
    expect(updates('products')[0].args[0]).toEqual({ stock: 0 })
  })
})
