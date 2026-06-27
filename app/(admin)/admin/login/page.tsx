import type { Metadata } from 'next'
import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Mission Control — Sign in',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage(
  props: {
    searchParams: Promise<{ error?: string }>
  }
) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand-200">
            <Terminal className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold">Mission Control</h1>
          <p className="mt-1 text-sm text-neutral-400">
            WelshDog Designs — admin access only
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-card p-6 shadow-card">
          <LoginForm notAllowed={searchParams.error === 'not-allowed'} />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-brand-200">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
