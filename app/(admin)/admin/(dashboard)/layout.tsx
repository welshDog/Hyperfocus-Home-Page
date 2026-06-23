import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase'
import { Sidebar } from '@/components/admin/Sidebar'

// Admin data must never be cached.
export const dynamic = 'force-dynamic'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  let leadsBadge = 0
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - WEEK_MS).toISOString()
    const { count } = await admin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
    leadsBadge = count ?? 0
  } catch {
    /* service role unconfigured — badge stays 0 */
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar email={user.email ?? ''} leadsBadge={leadsBadge} />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  )
}
