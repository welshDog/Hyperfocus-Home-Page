'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Inbox,
  FileText,
  Bot,
  Mail,
  MessageSquare,
  Music,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/admin/LogoutButton'

const nav = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingCart },
  { href: '/admin/leads', label: 'Leads', Icon: Inbox, badgeKey: 'leads' },
  { href: '/admin/blog', label: 'Blog', Icon: FileText },
  { href: '/admin/tracks', label: 'Tracks', Icon: Music },
  { href: '/admin/comments', label: 'Comments', Icon: MessageSquare },
  { href: '/admin/agents', label: 'Agents Lab', Icon: Bot },
  { href: '/admin/subscribers', label: 'Subscribers', Icon: Mail },
]

export function Sidebar({
  email,
  leadsBadge,
}: {
  email: string
  leadsBadge: number
}) {
  const pathname = usePathname()

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/5 bg-card md:h-dvh md:w-60 md:border-b-0 md:border-r md:sticky md:top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand-200">
          <Terminal className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold">Mission Control</p>
          <p className="text-[11px] text-neutral-500">WelshDog Designs</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-3">
        {nav.map(({ href, label, Icon, badgeKey }) => {
          const active =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)
          const badge = badgeKey === 'leads' ? leadsBadge : 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/15 text-brand-200'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-100',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <p className="truncate px-3 pb-2 text-xs text-neutral-500" title={email}>
          {email}
        </p>
        <LogoutButton />
      </div>
    </aside>
  )
}
