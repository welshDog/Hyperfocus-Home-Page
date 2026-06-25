'use client'

import { updateOrderStatus } from '@/app/(admin)/admin/(dashboard)/actions'

const STATUSES = [
  'pending',
  'paid',
  'needs_fulfilment',
  'fulfilled',
  'cancelled',
  'refunded',
]

export function OrderStatusControl({
  id,
  status,
}: {
  id: string
  status: string
}) {
  return (
    <form action={updateOrderStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-white/10 bg-card px-2 py-1 text-xs text-neutral-200 focus-visible:border-brand-300 focus-visible:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  )
}
