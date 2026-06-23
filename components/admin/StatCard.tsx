import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  Icon,
  href,
  hint,
}: {
  label: string
  value: string | number
  Icon: LucideIcon
  href?: string
  hint?: string
}) {
  const body = (
    <div className="rounded-2xl border border-white/5 bg-card p-5 transition-colors hover:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">{label}</span>
        <Icon className="h-4 w-4 text-brand-200" />
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
