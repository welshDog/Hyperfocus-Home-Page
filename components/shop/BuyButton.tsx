'use client'

import { useState } from 'react'
import { Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function BuyButton({
  productId,
  inStock,
}: {
  productId: string
  inStock: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Could not reach checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        onClick={checkout}
        disabled={loading || !inStock}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ShoppingBag className="h-5 w-5" />
        )}
        {inStock ? 'Buy Now' : 'Out of stock'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
