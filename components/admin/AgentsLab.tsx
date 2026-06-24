'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  Compass,
  Code2,
  Search,
  Workflow,
  BookOpen,
  FlaskConical,
  PackageSearch,
  CheckCircle2,
  AlertTriangle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { checkProductHealth } from '@/lib/agent-actions'

interface Agent {
  key: string
  name: string
  description: string
  Icon: LucideIcon
}

const AGENTS: Agent[] = [
  { key: 'architect', name: 'Architect', description: 'Plans structure & systems', Icon: Compass },
  { key: 'code', name: 'Code', description: 'Builds & refactors features', Icon: Code2 },
  { key: 'research', name: 'Research', description: 'Gathers & summarises intel', Icon: Search },
  { key: 'uxflow', name: 'UX / Flow', description: 'Maps journeys & interactions', Icon: Workflow },
  { key: 'narrator', name: 'Narrator', description: 'Drafts copy & blog posts', Icon: BookOpen },
  { key: 'experiment', name: 'Experiment', description: 'Runs spikes & prototypes', Icon: FlaskConical },
]

// Status badge colours — green (live/ok), grey (idle), red (alert).
type Status = 'idle' | 'active' | 'alert'
const STATUS: Record<Status, { dot: string; chip: string }> = {
  active: { dot: 'bg-emerald-400', chip: 'bg-emerald-500/15 text-emerald-300' },
  idle: { dot: 'bg-neutral-500', chip: 'bg-white/10 text-neutral-400' },
  alert: { dot: 'bg-red-400', chip: 'bg-red-500/15 text-red-300' },
}

function StatusBadge({ status, label }: { status: Status; label: string }) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.chip,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          s.dot,
          status === 'active' && 'animate-pulse',
        )}
      />
      {label}
    </span>
  )
}

interface LogLine {
  t: string
  text: string
}

type Toast = { kind: 'ok' | 'warn'; msg: string }

function timestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

export function AgentsLab() {
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<LogLine[]>([])
  const [vitals, setVitals] = useState({ health: 100, network: 100, cpu: 18, mem: 42 })
  const [watcher, setWatcher] = useState<Status>('idle')
  const [toast, setToast] = useState<Toast | null>(null)
  const [pending, startTransition] = useTransition()
  const deckRef = useRef<HTMLDivElement>(null)

  // Seed the opening line on the client only — timestamp() would otherwise
  // differ between SSR and hydration and cause a mismatch.
  useEffect(() => {
    setLogs([
      { t: timestamp(), text: 'Command Deck online. Awaiting orders, Bro.' },
    ])
  }, [])

  // Live-ish vitals (decorative).
  useEffect(() => {
    const id = setInterval(() => {
      setVitals({
        health: 97 + Math.floor(Math.random() * 4),
        network: 92 + Math.floor(Math.random() * 9),
        cpu: 12 + Math.floor(Math.random() * 30),
        mem: 38 + Math.floor(Math.random() * 18),
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll the deck to the newest line.
  useEffect(() => {
    deckRef.current?.scrollTo({ top: deckRef.current.scrollHeight })
  }, [logs])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(id)
  }, [toast])

  function log(text: string) {
    setLogs((l) => [...l, { t: timestamp(), text }])
  }

  function toggle(agent: Agent) {
    setActive((prev) => {
      const next = !prev[agent.key]
      log(`${agent.name} ${next ? 'ACTIVATED' : 'set to IDLE'}.`)
      return { ...prev, [agent.key]: next }
    })
  }

  // Products Watcher — runs a real DB check via the server action.
  function runWatcher() {
    log('Products Watcher scanning active products…')
    startTransition(async () => {
      try {
        const res = await checkProductHealth()
        if (res.ok) {
          setWatcher('active')
          setToast({ kind: 'ok', msg: 'All active products have a price & stock. ✓' })
          log('Products Watcher: all active products look healthy.')
        } else {
          setWatcher('alert')
          const names = res.sample.join(', ')
          setToast({
            kind: 'warn',
            msg: `⚠️ ${res.flagged} active product${res.flagged === 1 ? '' : 's'} have missing prices.`,
          })
          log(
            `Products Watcher: ${res.flagged} flagged${names ? ` (e.g. ${names})` : ''}.`,
          )
        }
      } catch {
        setWatcher('alert')
        setToast({ kind: 'warn', msg: 'Products Watcher could not reach the database.' })
        log('Products Watcher: check failed — database unreachable.')
      }
    })
  }

  const activeCount = Object.values(active).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Vitals strip */}
      <section className="rounded-2xl border border-white/5 bg-card p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Vital label="Health" value={`${vitals.health}%`} good title="Share of admin services responding" />
          <Vital label="Hyperfocus" value={activeCount > 0 ? 'ENGAGED' : 'IDLE'} good={activeCount > 0} title="Whether any agent is currently activated" />
          <Vital label="Network" value={`${vitals.network}%`} title="Supabase / API reachability" />
          <Vital label="CPU" value={`${vitals.cpu}%`} title="Simulated compute load" />
          <Vital label="MEM" value={`${vitals.mem}%`} title="Simulated memory use" />
        </div>
        <p className="mt-3 border-t border-white/5 pt-3 text-xs text-neutral-500">
          <strong className="text-neutral-400">Health</strong> = admin services
          responding · <strong className="text-neutral-400">Network</strong> =
          Supabase / API reachability. CPU &amp; MEM are illustrative.
        </p>
      </section>

      {/* Products Watcher — the one agent wired to a real action */}
      <section className="rounded-2xl border border-brand/30 bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-brand-200">
              <PackageSearch className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold">Products Watcher</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Flags active products that are missing a price or stock — live
                on the shop but unsellable.
              </p>
            </div>
          </div>
          <StatusBadge
            status={watcher}
            label={
              watcher === 'active' ? 'HEALTHY' : watcher === 'alert' ? 'ALERT' : 'IDLE'
            }
          />
        </div>
        <button
          type="button"
          onClick={runWatcher}
          disabled={pending}
          className="mt-5 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? 'Scanning…' : 'Run check'}
        </button>
      </section>

      {/* Decorative agent cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const on = !!active[agent.key]
          return (
            <div
              key={agent.key}
              className={cn(
                'rounded-2xl border bg-card p-5 transition-colors',
                on ? 'border-brand/50' : 'border-white/5',
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    on ? 'bg-brand/20 text-brand-200' : 'bg-white/5 text-neutral-400',
                  )}
                >
                  <agent.Icon className="h-5 w-5" />
                </span>
                <StatusBadge status={on ? 'active' : 'idle'} label={on ? 'ACTIVE' : 'IDLE'} />
              </div>

              <h3 className="mt-4 font-heading text-lg font-semibold">{agent.name}</h3>
              <p className="mt-1 text-sm text-neutral-400">{agent.description}</p>

              <button
                type="button"
                onClick={() => toggle(agent)}
                className={cn(
                  'mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  on
                    ? 'border-2 border-brand text-brand-200 hover:bg-brand/10'
                    : 'bg-brand text-white hover:bg-brand-600',
                )}
              >
                {on ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )
        })}
      </section>

      {/* Command Deck */}
      <section className="rounded-2xl border border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-2 font-mono text-xs text-neutral-500">
            command-deck — {activeCount} active
          </span>
        </div>
        <div
          ref={deckRef}
          className="h-56 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
        >
          {logs.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 text-neutral-600">{line.t}</span>
              <span className="text-brand-200">›</span>
              <span className="text-neutral-300">{line.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            'fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg',
            toast.kind === 'ok'
              ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100'
              : 'border-amber-500/30 bg-amber-950/90 text-amber-100',
          )}
        >
          {toast.kind === 'ok' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          )}
          <p className="flex-1">{toast.msg}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="shrink-0 text-neutral-400 hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function Vital({
  label,
  value,
  good,
  title,
}: {
  label: string
  value: string
  good?: boolean
  title?: string
}) {
  return (
    <div title={title}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p
        className={cn(
          'mt-1 font-heading text-lg font-bold tabular-nums',
          good ? 'text-brand-200' : 'text-neutral-100',
        )}
      >
        {value}
      </p>
    </div>
  )
}
