import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { OrderStatusControl } from '@/components/admin/OrderStatusControl'
import { updateOrderStatus } from '../actions'

const FILTERS = [
  'all',
  'pending',
  'paid',
  'needs_fulfilment',
  'fulfilled',
  'cancelled',
  'refunded',
]

interface OrderRow {
  id: string
  customer_email: string
  status: string
  stripe_session_id: string | null
  created_at: string
  products: { name: string } | null
}

async function getOrders(status: string): Promise<OrderRow[]> {
  try {
    const admin = createAdminClient()
    let q = admin
      .from('orders')
      .select('id, customer_email, status, stripe_session_id, created_at, products(name)')
      .order('created_at', { ascending: false })
    if (status !== 'all') q = q.eq('status', status)
    const { data } = await q
    return (data ?? []) as unknown as OrderRow[]
  } catch {
    return []
  }
}

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const active = FILTERS.includes(searchParams.status ?? '')
    ? (searchParams.status as string)
    : 'all'
  const orders = await getOrders(active)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-neutral-400">{orders.length} shown</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/admin/orders' : `/admin/orders?status=${f}`}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              active === f
                ? 'bg-brand text-white'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10',
            )}
          >
            {f.replace('_', ' ')}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-neutral-500">
                  {active === 'all'
                    ? 'No orders yet — once a customer checks out, orders appear here.'
                    : `No orders with status “${active}” yet.`}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr
                key={o.id}
                className={cn(
                  'border-b border-white/5 last:border-0',
                  o.status === 'needs_fulfilment' && 'bg-amber-500/5',
                )}
              >
                <td className="px-5 py-3 font-medium">
                  {o.products?.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-neutral-400">{o.customer_email}</td>
                <td className="px-5 py-3 text-neutral-400">
                  {formatDate(o.created_at)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusControl id={o.id} status={o.status} />
                    {o.status === 'needs_fulfilment' && (
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value="fulfilled" />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/25"
                        >
                          Mark fulfilled
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
