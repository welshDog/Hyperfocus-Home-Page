'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Compass,
  Code2,
  Search,
  Workflow,
  BookOpen,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface LogLine {
  t: string
  text: string
}

function timestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

export function AgentsLab() {
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<LogLine[]>([])
  const [vitals, setVitals] = useState({ health: 100, network: 100, cpu: 18, mem: 42 })
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

  function toggle(agent: Agent) {
    setActive((prev) => {
      const next = !prev[agent.key]
      setLogs((l) => [
        ...l,
        {
          t: timestamp(),
          text: `${agent.name} ${next ? 'ACTIVATED' : 'set to IDLE'}.`,
        },
      ])
      return { ...prev, [agent.key]: next }
    })
  }

  const activeCount = Object.values(active).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Vitals strip */}
      <section className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-card p-4 sm:grid-cols-5">
        <Vital label="Health" value={`${vitals.health}%`} good />
        <Vital label="Hyperfocus" value={activeCount > 0 ? 'ENGAGED' : 'IDLE'} good={activeCount > 0} />
        <Vital label="Network" value={`${vitals.network}%`} />
        <Vital label="CPU" value={`${vitals.cpu}%`} />
        <Vital label="MEM" value={`${vitals.mem}%`} />
      </section>

      {/* Agent cards */}
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
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    on
                      ? 'bg-brand/15 text-brand-200'
                      : 'bg-white/10 text-neutral-400',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      on ? 'animate-pulse bg-brand-200' : 'bg-neutral-500',
                    )}
                  />
                  {on ? 'ACTIVE' : 'IDLE'}
                </span>
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
    </div>
  )
}

function Vital({
  label,
  value,
  good,
}: {
  label: string
  value: string
  good?: boolean
}) {
  return (
    <div>
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
