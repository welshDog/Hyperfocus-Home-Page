import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  rpc: vi.fn(),
  admin: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({ createAdminClient: h.admin }))

import { checkRateLimit, checkRateLimitLocal, clientIp } from '@/lib/rateLimit'

let n = 0
const key = () => `k${++n}` // fresh key per test: the fallback map is module-global

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  h.admin.mockReturnValue({ rpc: h.rpc })
})

describe('checkRateLimit (shared store)', () => {
  it('calls the RPC with seconds-rounded-up and returns its verdict', async () => {
    h.rpc.mockResolvedValueOnce({ data: true, error: null })
    expect(await checkRateLimit('a', 5, 1500)).toBe(true)
    expect(h.rpc).toHaveBeenCalledWith('check_rate_limit', {
      p_key: 'a',
      p_limit: 5,
      p_window_seconds: 2,
    })

    h.rpc.mockResolvedValueOnce({ data: false, error: null })
    expect(await checkRateLimit('a', 5, 60_000)).toBe(false)
  })

  it('trusts the shared verdict over local state', async () => {
    const k = key()
    h.rpc.mockResolvedValue({ data: false, error: null })
    expect(await checkRateLimit(k, 100, 60_000)).toBe(false)
  })

  it('falls back to in-memory when the RPC errors (e.g. migration not applied)', async () => {
    const k = key()
    h.rpc.mockResolvedValue({ data: null, error: { message: 'function not found' } })
    expect(await checkRateLimit(k, 2, 60_000)).toBe(true)
    expect(await checkRateLimit(k, 2, 60_000)).toBe(true)
    expect(await checkRateLimit(k, 2, 60_000)).toBe(false) // still limited, not open
  })

  it('falls back when the admin client cannot be created (no service key)', async () => {
    const k = key()
    h.admin.mockImplementation(() => {
      throw new Error('requires SUPABASE_SERVICE_ROLE_KEY')
    })
    expect(await checkRateLimit(k, 1, 60_000)).toBe(true)
    expect(await checkRateLimit(k, 1, 60_000)).toBe(false)
  })

  it('falls back on a malformed RPC result instead of treating it as allow', async () => {
    const k = key()
    h.rpc.mockResolvedValue({ data: 'yes', error: null })
    expect(await checkRateLimit(k, 1, 60_000)).toBe(true)
    expect(await checkRateLimit(k, 1, 60_000)).toBe(false)
  })

  it('falls back when the RPC call itself rejects', async () => {
    const k = key()
    h.rpc.mockRejectedValue(new Error('network'))
    expect(await checkRateLimit(k, 1, 60_000)).toBe(true)
    expect(await checkRateLimit(k, 1, 60_000)).toBe(false)
  })
})

describe('checkRateLimitLocal', () => {
  it('slides: frees capacity after the window passes', () => {
    vi.useFakeTimers()
    const k = key()
    expect(checkRateLimitLocal(k, 1, 1000)).toBe(true)
    expect(checkRateLimitLocal(k, 1, 1000)).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(checkRateLimitLocal(k, 1, 1000)).toBe(true)
    vi.useRealTimers()
  })

  it('keeps keys independent', () => {
    const [a, b] = [key(), key()]
    expect(checkRateLimitLocal(a, 1, 60_000)).toBe(true)
    expect(checkRateLimitLocal(a, 1, 60_000)).toBe(false)
    expect(checkRateLimitLocal(b, 1, 60_000)).toBe(true)
  })
})

describe('clientIp', () => {
  const r = (headers: Record<string, string>) => new Request('http://x', { headers })

  it('uses the first x-forwarded-for hop', () => {
    expect(clientIp(r({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
  })
  it('falls back to x-real-ip, then unknown', () => {
    expect(clientIp(r({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
    expect(clientIp(r({}))).toBe('unknown')
  })
  it('rejects absurdly long values', () => {
    expect(clientIp(r({ 'x-forwarded-for': 'a'.repeat(100) }))).toBe('unknown')
  })
})
