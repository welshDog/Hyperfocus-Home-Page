import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Allowlisted admin emails from ADMIN_EMAILS (comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  return !!email && adminEmails().includes(email.toLowerCase())
}

/** Server-side gate: returns the user if an allowlisted admin, else redirects
 *  to login. Call at the top of every protected admin layout/page. */
export async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')
  if (!isAdminEmail(user.email)) redirect('/admin/login?error=not-allowed')
  return user
}
