'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SubscribersExport({
  rows,
}: {
  rows: { email: string; created_at: string }[]
}) {
  function exportCsv() {
    const header = 'email,subscribed_at\n'
    const body = rows
      .map((r) => `${r.email},${r.created_at}`)
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `welshdog-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={exportCsv} variant="outline" disabled={rows.length === 0}>
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  )
}
