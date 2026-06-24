import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Inbox,
  FileText,
  Activity,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { getAllPosts } from '@/lib/blog'
import { formatDate } from '@/lib/utils'
import { StatCard } from '@/components/admin/StatCard'
import type { Lead } from '@/types'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

async function getStats() {
  const postsCount = getAllPosts().length
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - WEEK_MS).toISOString()
    const [products, orders, leads7, recent] = await Promise.all([
      admin.from('products').select('*', { count: 'exact', head: true }),
      admin.from('orders').select('*', { count: 'exact', head: true }),
      admin
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since),
      admin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ])
    return {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      leads7: leads7.count ?? 0,
      posts: postsCount,
      recentLeads: (recent.data ?? []) as Lead[],
      configured: true,
    }
  } catch {
    return {
      products: 0,
      orders: 0,
      leads7: 0,
      posts: postsCount,
      recentLeads: [] as Lead[],
      configured: false,
    }
  }
}

const quickLinks = [
  { href: '/admin/products', label: 'Manage products' },
  { href: '/admin/orders', label: 'View orders' },
  { href: '/admin/leads', label: 'Review leads' },
  { href: '/admin/blog', label: 'Manage blog' },
  { href: '/admin/agents', label: 'Agents Lab' },
  { href: '/admin/subscribers', label: 'Subscribers' },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Welcome back to Mission Control.
        </p>
      </header>

      {/* System vitals */}
      <section className="rounded-2xl border border-white/5 bg-card p-5">
        <h2 className="text-sm font-medium text-neutral-400">System vitals</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand-200">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-neutral-500">Health</p>
              <p className="font-heading text-lg font-bold text-brand-200">
                {stats.configured ? '100%' : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand-200">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-neutral-500">Hyperfocus</p>
              <p className="font-heading text-lg font-bold">ACTIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand-200">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-neutral-500">Status</p>
              <p className="font-heading text-lg font-bold">
                {stats.configured ? 'Online' : 'Degraded'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Products" value={stats.products} Icon={Package} href="/admin/products" accent="teal" />
        <StatCard label="Orders" value={stats.orders} Icon={ShoppingCart} href="/admin/orders" accent="green" />
        <StatCard
          label="New leads"
          value={stats.leads7}
          Icon={Inbox}
          href="/admin/leads"
          hint="Last 7 days"
          accent="amber"
        />
        <StatCard label="Blog posts" value={stats.posts} Icon={FileText} href="/admin/blog" accent="violet" />
      </section>

      {/* Recent leads */}
      <section className="rounded-2xl border border-white/5 bg-card">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-heading text-base font-semibold">Recent leads</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm text-brand-200 hover:text-brand-100"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {stats.recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 font-medium">{lead.name}</td>
                    <td className="px-5 py-3 text-neutral-400">{lead.email}</td>
                    <td className="px-5 py-3 text-neutral-400">{lead.tier ?? '—'}</td>
                    <td className="px-5 py-3 text-neutral-400">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">
            No leads yet. They&apos;ll appear here when someone books a demo.
          </p>
        )}
      </section>

      {/* Recent activity (placeholder until an activity feed exists) */}
      <section className="rounded-2xl border border-white/5 bg-card">
        <div className="px-5 py-4">
          <h2 className="font-heading text-base font-semibold">
            Recent activity
          </h2>
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-white/5 px-5 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-neutral-400">
            <Activity className="h-5 w-5" />
          </span>
          <p className="text-sm text-neutral-400">
            No activity yet. Orders, new leads, and signups will show up here as
            they happen.
          </p>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-400">Quick links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-card px-4 py-3 text-sm font-medium hover:border-white/10 hover:text-brand-200"
            >
              {q.label}
              <ArrowRight className="h-4 w-4 text-neutral-500" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
