'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, X } from 'lucide-react'
import { ImportWizard } from './ImportWizard'

export function ImportProductsButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function close() {
    setOpen(false)
    router.refresh() // pick up any newly imported drafts
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition-colors hover:border-brand-300 hover:text-brand-200"
      >
        <Download className="h-4 w-4" /> Import Products
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8">
          <div className="relative my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-ink p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">
                HyperImport — add products
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ImportWizard onDone={() => router.refresh()} />
          </div>
        </div>
      )}
    </>
  )
}
