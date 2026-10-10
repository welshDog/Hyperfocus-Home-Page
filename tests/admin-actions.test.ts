import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  result: { error: null } as { error: Record<string, unknown> | null },
  inserted: [] as unknown[],
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`)
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: h.redirect }))
vi.mock('@/lib/admin', () => ({ requireAdmin: vi.fn().mockResolvedValue({}) }))
vi.mock('@/lib/supabase', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: (row: unknown) => {
        h.inserted.push(row)
        return Promise.resolve(h.result)
      },
      update: () => ({ eq: () => Promise.resolve(h.result) }),
    }),
    storage: {},
  }),
}))

import { createDraft, saveProduct, saveTrack } from '@/app/(admin)/admin/(dashboard)/actions'

const fd = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}
const product = { name: 'Mug', slug: 'mug', price: '5', stock: '2', category: 'Gifts' }

let errSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  vi.clearAllMocks()
  h.inserted.length = 0
  h.result = { error: null }
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('saveProduct', () => {
  it('saves and redirects on success', async () => {
    await expect(saveProduct(undefined, fd(product))).rejects.toThrow('NEXT_REDIRECT:/admin/products')
    expect(h.inserted[0]).toMatchObject({ name: 'Mug', slug: 'mug', price: 5, stock: 2, active: false })
  })

  it('keeps the friendly message for a duplicate slug', async () => {
    h.result = { error: { code: '23505', message: 'duplicate key' } }
    expect(await saveProduct(undefined, fd(product))).toEqual({ error: 'That slug is already taken.' })
  })

  it('explains and logs an unexpected database error instead of hiding it', async () => {
    h.result = { error: { code: '22P02', message: 'invalid input syntax for type integer: "1.5"', details: 'd', hint: 'h' } }
    const res = await saveProduct(undefined, fd({ ...product, stock: '1.5' }))
    expect(res?.error).toContain('Could not save product')
    expect(res?.error).toContain('wrong format')
    expect(res?.error).toContain('code 22P02')
    expect(errSpy).toHaveBeenCalledWith(
      '[admin] saveProduct failed',
      expect.objectContaining({ code: '22P02', message: expect.stringContaining('invalid input') }),
    )
  })

  it('still says something useful when the error has no code', async () => {
    h.result = { error: { message: 'fetch failed' } }
    expect((await saveProduct(undefined, fd(product)))?.error).toBe('Could not save product (code unknown)')
  })

  it('surfaces a permission failure clearly', async () => {
    h.result = { error: { code: '42501', message: 'permission denied for table products' } }
    expect((await saveProduct(undefined, fd(product)))?.error).toContain('refused permission')
  })

  it('validation errors never reach the database', async () => {
    expect(await saveProduct(undefined, fd({ ...product, name: ' ' }))).toEqual({ error: 'Name is required.' })
    expect(await saveProduct(undefined, fd({ ...product, price: '-1' }))).toEqual({ error: 'Price must be 0 or more.' })
    expect(h.inserted).toHaveLength(0)
  })
})

describe('createDraft / saveTrack use the same reporting', () => {
  it('createDraft', async () => {
    h.result = { error: { code: '23502', message: 'null value' } }
    const res = await createDraft(undefined, fd({ title: 'Hello' }))
    expect(res?.error).toContain('Could not save draft')
    expect(res?.error).toContain('code 23502')
    expect(errSpy).toHaveBeenCalledWith('[admin] createDraft failed', expect.anything())
  })

  it('saveTrack', async () => {
    h.result = { error: { code: '23514', message: 'check violated' } }
    const res = await saveTrack(undefined, fd({ title: 'T', artist: 'A', audio_path: 'a.mp3', sort_order: '1' }))
    expect(res?.error).toContain('Could not save the track')
    expect(res?.error).toContain('code 23514')
  })
})
