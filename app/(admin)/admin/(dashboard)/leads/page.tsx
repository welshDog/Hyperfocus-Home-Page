import { createAdminClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Lead } from '@/types'

async function getLeads(): Promise<Lead[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as Lead[]
  } catch {
    return []
  }
}

export default async function AdminLeads() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Leads</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {leads.length} demo {leads.length === 1 ? 'request' : 'requests'}
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="px-5 py-3 font-medium">Message</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                  No leads yet.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-white/5 last:border-0 align-top">
                <td className="px-5 py-3 font-medium">{l.name}</td>
                <td className="px-5 py-3 text-neutral-400">{l.email}</td>
                <td className="px-5 py-3 text-neutral-400">{l.tier ?? '—'}</td>
                <td className="px-5 py-3 max-w-xs text-neutral-400">
                  {l.message ? (
                    <span className="line-clamp-3">{l.message}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-neutral-400">
                  {formatDate(l.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
