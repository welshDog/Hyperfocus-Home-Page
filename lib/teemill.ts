/**
 * Teemill print-on-demand fulfilment helper.
 *
 * MOCK GATE: a real, billable order is only confirmed when
 *   TEEMILL_LIVE === 'true'
 * In every other case (the default) this is a safe no-op that returns a mock
 * order id without any network call — so the whole checkout → order →
 * fulfilment chain can be built and tested before Stripe Live Mode and the
 * verified Teemill endpoints are in place.
 *
 * Endpoints (confirmed):
 *   POST https://api.teemill.com/v1/orders                    → create (draft)
 *   POST https://api.teemill.com/v1/orders/{orderId}/confirm  → confirm (billable)
 *   GET  https://api.teemill.com/v1/orders/{orderId}          → status
 * Auth: Authorization: <private key> header + ?project=<project> param.
 * Items require `variantRef` (the variant `ref` URL from the Catalog API).
 *
 * ⚠️ The create-order body (shipping field names) is best-effort and should be
 * confirmed against one real test order before TEEMILL_LIVE=true.
 */

export const TEEMILL_LIVE = process.env.TEEMILL_LIVE === 'true'

const API_BASE = 'https://api.teemill.com/v1'

export interface FulfilmentAddress {
  name: string
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface FulfilmentInput {
  /** Teemill catalog variant `ref` (URL). */
  variantRef: string
  quantity: number
  email: string
  address: FulfilmentAddress
  /** Our reference (e.g. Stripe session id) for cross-referencing. */
  reference?: string
}

export interface FulfilmentResult {
  ok: boolean
  orderId: string | null
  mock: boolean
  error?: string
}

/** Create + confirm a Teemill order. Mock unless TEEMILL_LIVE === 'true'. */
export async function fulfilViaTeemill(
  input: FulfilmentInput,
): Promise<FulfilmentResult> {
  // SACRED RULE: never confirm a real order in test / mock mode.
  if (!TEEMILL_LIVE) {
    return { ok: true, orderId: `mock_${Date.now()}`, mock: true }
  }

  const key = process.env.TEEMILL_PRIVATE_KEY ?? ''
  // The Orders API ?project= value is the store slug (e.g. welshdog-wear-86371).
  const project =
    process.env.TEEMILL_PROJECT_NAME ?? process.env.TEEMILL_STORE ?? ''
  if (!key || !project) {
    return {
      ok: false,
      orderId: null,
      mock: false,
      error: 'TEEMILL_PRIVATE_KEY / project not configured',
    }
  }
  const headers = { Authorization: key, 'Content-Type': 'application/json' }
  const q = `project=${encodeURIComponent(project)}`

  try {
    // 1) Create the order (draft).
    const createRes = await fetch(`${API_BASE}/orders?${q}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items: [{ variantRef: input.variantRef, quantity: input.quantity }],
        email: input.email,
        shipping_address: {
          name: input.address.name,
          line_1: input.address.line1,
          line_2: input.address.line2 ?? '',
          city: input.address.city,
          postcode: input.address.postcode,
          country: input.address.country,
        },
        reference: input.reference,
      }),
    })
    if (!createRes.ok) {
      return {
        ok: false,
        orderId: null,
        mock: false,
        error: `create failed: HTTP ${createRes.status}`,
      }
    }
    const created = (await createRes.json()) as {
      id?: string
      order_id?: string
    }
    const orderId = created.id ?? created.order_id ?? null
    if (!orderId) {
      return {
        ok: false,
        orderId: null,
        mock: false,
        error: 'create returned no order id',
      }
    }

    // 2) Confirm — the real, billable fulfilment step.
    const confirmRes = await fetch(
      `${API_BASE}/orders/${orderId}/confirm?${q}`,
      { method: 'POST', headers },
    )
    if (!confirmRes.ok) {
      return {
        ok: false,
        orderId,
        mock: false,
        error: `confirm failed: HTTP ${confirmRes.status}`,
      }
    }
    return { ok: true, orderId, mock: false }
  } catch (err) {
    return { ok: false, orderId: null, mock: false, error: String(err) }
  }
}
