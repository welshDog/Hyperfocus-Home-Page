import { createAdminClient } from '@/lib/supabase'

/** Rate limiting for public API routes.
 *
 *  Primary gate: `check_rate_limit()` in Supabase (migration 0004) — an atomic
 *  fixed-window counter shared by every serverless instance.
 *
 *  Fallback: a best-effort in-memory sliding window. It is per-instance and
 *  resets on cold start, so it only matters when the shared store is
 *  unavailable (migration not applied, service key missing, DB error). We fail
 *  SOFT to it rather than open, so a database blip never takes the site's
 *  forms down and never removes the limit entirely. */

const hits = new Map<string, number[]>()

/** In-memory sliding window. Returns true when allowed. */
export function checkRateLimitLocal(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  const cutoff = now - windowMs
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  // Opportunistic prune so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (v.every((t) => t <= cutoff)) hits.delete(k)
    })
  }
  return true
}

let warned = false

/** Shared limiter. Returns true when the call is allowed. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    })
    if (error) throw error
    if (typeof data !== 'boolean') throw new Error('unexpected rpc result')
    return data
  } catch (err) {
    if (!warned) {
      warned = true
      console.error(
        '[rateLimit] shared store unavailable, using in-memory fallback:',
        err instanceof Error ? err.message : err,
      )
    }
    return checkRateLimitLocal(key, limit, windowMs)
  }
}

/** Best-effort client IP behind Vercel's proxy. Never trusted for auth —
 *  only used as a rate-limit bucket. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim()
  return ip && ip.length <= 64 ? ip : 'unknown'
}
