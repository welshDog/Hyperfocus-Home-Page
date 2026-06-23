'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:border-brand-300 focus-visible:outline-none'

export function LoginForm({ notAllowed }: { notAllowed?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    notAllowed ? 'That account is not on the admin allowlist.' : '',
  )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Wrong email or password.')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-300">Email</span>
        <input name="email" type="email" required placeholder="you@email.com" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-300">Password</span>
        <input name="password" type="password" required placeholder="••••••••" className={inputClass} />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            <Lock className="h-4 w-4" /> Sign in
          </>
        )}
      </Button>
    </form>
  )
}
