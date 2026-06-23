'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type State = 'idle' | 'loading' | 'done' | 'error'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setState('error')
        setMessage(data.error ?? 'Something went wrong. Try again.')
        return
      }
      setState('done')
      setEmail('')
    } catch {
      setState('error')
      setMessage('Could not reach the server. Try again.')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-brand/10 p-4 text-brand-700 dark:bg-brand-300/15 dark:text-brand-200">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          You&apos;re in! Diolch for subscribing. 🐕
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:border-brand focus-visible:outline-none dark:border-white/10 dark:bg-card dark:text-neutral-100"
          />
        </div>
        <Button type="submit" disabled={state === 'loading'}>
          {state === 'loading' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </form>
  )
}
