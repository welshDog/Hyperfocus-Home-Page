/** Anonymous per-device identity for likes/comments.
 *  Client-only: every function is a safe no-op on the server. */

const DEVICE_KEY = 'wd_device_id'
const LIKED_KEY = 'wd_liked_tracks'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Stable device UUID, created on first use. Null on the server or when
 *  storage is unavailable (private mode). */
export function getDeviceId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY)
    if (existing && UUID_RE.test(existing)) return existing
    const id = window.crypto.randomUUID()
    window.localStorage.setItem(DEVICE_KEY, id)
    return id
  } catch {
    return null
  }
}

/** Track ids this device has liked (device is the source of truth for
 *  per-device liked state; the server response re-syncs drift). */
export function getLikedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(LIKED_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  } catch {
    return new Set()
  }
}

export function setLiked(trackId: string, liked: boolean): void {
  if (typeof window === 'undefined') return
  try {
    const set = getLikedSet()
    if (liked) set.add(trackId)
    else set.delete(trackId)
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // storage unavailable — liked state just won't persist
  }
}
