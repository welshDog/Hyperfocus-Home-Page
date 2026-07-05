/** Best-effort in-memory rate limiter (sliding window).
 *
 *  On Vercel this Map is per-instance and resets on cold start, so it is a
 *  cheap first gate only — never the sole defence. Comment posting also does
 *  an authoritative DB count in its route. */

const hits = new Map<string, number[]>()

/** Returns true when the call is allowed, false when over the limit. */
export function checkRateLimit(
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
