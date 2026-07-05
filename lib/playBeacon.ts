import { getDeviceId } from '@/lib/deviceId'

/** Fire-and-forget play count beacon: at most one per track per browser
 *  session (sessionStorage flag). Client-only; errors are swallowed. */
export function firePlayBeacon(trackId: string): void {
  if (typeof window === 'undefined' || !trackId) return
  const flag = `wd_played:${trackId}`
  try {
    if (window.sessionStorage.getItem(flag)) return
    window.sessionStorage.setItem(flag, '1')
  } catch {
    // no sessionStorage — still send, worst case an extra count
  }
  void fetch(`/api/tracks/${trackId}/play`, {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ anonId: getDeviceId() }),
  }).catch(() => {})
}
