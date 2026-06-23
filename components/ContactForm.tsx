'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type State = 'idle' | 'loading' | 'done' | 'error'

const inputClass =
  'h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:border-brand focus-visible:outline-none dark:border-white/10 dark:bg-card dark:text-neutral-100'

export function ContactForm() {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setState('error')
        setError(data.error ?? 'Something went wrong. Try again.')
        return
      }
      setState('done')
    } catch {
      setState('error')
      setError('Could not reach the server. Try again.')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-brand/10 p-5 text-brand-700 dark:bg-brand-300/15 dark:text-brand-200">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="font-heading font-semibold">Message sent — diolch! 🐕</p>
          <p className="mt-1 text-sm">I&apos;ll get back to you as soon as I can.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Name</span>
          <input name="name" required placeholder="Your name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required placeholder="you@email.com" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Message</span>
        <textarea name="message" required rows={5} placeholder="What's on your mind?" className={`${inputClass} h-auto py-2`} />
      </label>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" size="lg" disabled={state === 'loading'} className="self-start">
        {state === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send message'}
      </Button>
    </form>
  )
}
