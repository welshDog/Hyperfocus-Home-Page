'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { createDraft, type FormState } from '@/app/(admin)/admin/(dashboard)/actions'
import { Button } from '@/components/ui/Button'

const CATEGORIES = ['ADHD & Neurodiversity', 'Dyslexia', 'Tech & AI', 'Creativity', 'Personal']
const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:border-brand-300 focus-visible:outline-none'
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-neutral-300'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create draft'}
    </Button>
  )
}

export function DraftForm() {
  const [state, action] = useFormState<FormState, FormData>(createDraft, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Title
          <input name="title" required placeholder="Post title" className={inputClass} />
        </label>
        <label className={labelClass}>
          Slug <span className="font-normal text-neutral-500">(optional)</span>
          <input name="slug" placeholder="auto from title" className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Category
          <select name="category" defaultValue="Personal" className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Schedule for <span className="font-normal text-neutral-500">(optional)</span>
          <input name="published_at" type="date" className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Excerpt
        <textarea name="excerpt" rows={2} className={`${inputClass} h-auto py-2`} />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium text-neutral-300">
        <input type="checkbox" name="published" className="h-4 w-4 rounded border-white/20 bg-card accent-brand" />
        Publish immediately
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
