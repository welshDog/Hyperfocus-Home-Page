import { createAdminClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { SubscribersExport } from '@/components/admin/SubscribersExport'
import type { Subscriber } from '@/types'

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as Subscriber[]
  } catch {
    return []
  }
}

export default async function AdminSubscribers() {
  const subs = await getSubscribers()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscribers</h1>
          <p className="mt-1 text-sm text-neutral-400">{subs.length} total</p>
        </div>
        <SubscribersExport
          rows={subs.map((s) => ({ email: s.email, created_at: s.created_at }))}
        />
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-10 text-center text-neutral-500">
                  Newsletter signups appear here. Export CSV when ready for
                  email tools.
                </td>
              </tr>
            )}
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 font-medium">{s.email}</td>
                <td className="px-5 py-3 text-neutral-400">
                  {formatDate(s.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
