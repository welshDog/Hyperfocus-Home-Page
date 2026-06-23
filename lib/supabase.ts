import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** True when the public Supabase env vars are present. Pages use this to
 *  render a graceful empty state instead of crashing when unconfigured. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/** Browser/client-side Supabase client (anon key, RLS-protected).
 *  Returns null when env is not configured. */
export function createBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
}

/** Server-side read client (anon key, no session persistence).
 *  Use in Server Components for public, RLS-protected reads. */
export function createServerClient(): SupabaseClient | null {
  if (!url || !anonKey) return null
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Privileged server client (service-role key — bypasses RLS).
 *  Server-only: never import into client components. */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    )
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
