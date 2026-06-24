import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

/** Per-card accent colours so each stat reads at a glance. */
export type StatAccent = 'teal' | 'green' | 'amber' | 'violet'

const ACCENTS: Record<StatAccent, string> = {
  teal: 'bg-brand/15 text-brand-200',
  green: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  violet: 'bg-violet-500/15 text-violet-300',
}

export function StatCard({
  label,
  value,
  Icon,
  href,
  hint,
  accent = 'teal',
}: {
  label: string
  value: string | number
  Icon: LucideIcon
  href?: string
  hint?: string
  accent?: StatAccent
}) {
  const body = (
    <div className="rounded-2xl border border-white/5 bg-card p-5 transition-colors hover:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${ACCENTS[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  )
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  )
}
