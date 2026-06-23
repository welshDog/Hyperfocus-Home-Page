'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-neutral-100 transition-colors"
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  )
}
