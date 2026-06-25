'use client'

import { useState } from 'react'
import {
  Globe,
  ShoppingBag,
  Store,
  Shirt,
  Package,
  Boxes,
  Rss,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { previewProducts, runProductImport } from '@/tools/hyper-import/actions'
import type { ImportedProduct } from '@/tools/hyper-import/lib/mapper'
import type { ImportResult } from '@/tools/hyper-import/lib/uploader'

const STEPS = ['Source', 'Connect', 'Preview', 'Import']

type Kind = 'url' | 'teemill' | 'key' | 'file'
type Source = {
  id: string // adapter id, or 'auto'
  label: string
  hint: string
  Icon: LucideIcon
  kind: Kind
  inputLabel?: string
  placeholder?: string
  helpText?: string
  helpUrl?: string
}

const SOURCES: Source[] = [
  {
    id: 'auto',
    label: 'Any store URL',
    hint: 'Paste a link — auto-detects Shopify, Woo, Squarespace & more.',
    Icon: Globe,
    kind: 'url',
    placeholder: 'https://yourstore.com',
  },
  {
    id: 'shopify',
    label: 'Shopify',
    hint: 'Any Shopify store URL.',
    Icon: ShoppingBag,
    kind: 'url',
    placeholder: 'https://store.myshopify.com',
  },
  {
    id: 'etsy',
    label: 'Etsy',
    hint: 'An Etsy shop URL or shop name.',
    Icon: Store,
    kind: 'url',
    inputLabel: 'Etsy shop URL or shop name',
    placeholder: 'https://etsy.com/shop/YourShopName',
  },
  {
    id: 'printful',
    label: 'Printful',
    hint: 'Your Printful products (paste your API key).',
    Icon: Package,
    kind: 'key',
    inputLabel: 'Printful API Key',
    placeholder: 'paste your Printful API key',
    helpText: 'Find it at Dashboard → Settings → API:',
    helpUrl: 'https://www.printful.com/dashboard/settings/api',
  },
  {
    id: 'printify',
    label: 'Printify',
    hint: 'Your Printify products (paste your API key).',
    Icon: Boxes,
    kind: 'key',
    inputLabel: 'Printify API Key',
    placeholder: 'paste your Printify API key',
    helpText: 'Find it at Account → Connections → API:',
    helpUrl: 'https://printify.com/app/account/api',
  },
  {
    id: 'teemill',
    label: 'Teemill',
    hint: 'Your configured Teemill store (or paste a feed URL).',
    Icon: Shirt,
    kind: 'teemill',
    placeholder: 'optional feed URL',
  },
  {
    id: 'feed',
    label: 'Product feed (XML)',
    hint: 'Google Shopping / RSS feed URL.',
    Icon: Rss,
    kind: 'url',
    placeholder: 'https://yourstore.com/feed.xml',
  },
  {
    id: 'csv',
    label: 'CSV file',
    hint: 'name, description, price, image_url, external_url',
    Icon: FileSpreadsheet,
    kind: 'file',
  },
]

export function ImportWizard({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(1)
  const [source, setSource] = useState<Source | null>(null)
  const [text, setText] = useState('')
  const [csvText, setCsvText] = useState('')
  const [csvName, setCsvName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detected, setDetected] = useState('')
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [ownsRights, setOwnsRights] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)

  function pick(s: Source) {
    setSource(s)
    setError(null)
    setText('')
    setCsvText('')
    setCsvName('')
    setStep(2)
  }

  function onCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvName(file.name)
    const reader = new FileReader()
    reader.onload = () => setCsvText(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  async function connect() {
    if (!source) return
    setLoading(true)
    setError(null)
    try {
      const res = await previewProducts({
        adapterId: source.id === 'auto' ? undefined : source.id,
        url: source.kind === 'url' ? text : undefined,
        apiKey:
          source.kind === 'key' || source.id === 'teemill'
            ? text || undefined
            : undefined,
        csv: source.id === 'csv' ? csvText : undefined,
      })
      if (!res.products.length) {
        setError('No products found — check the source and try again.')
        setLoading(false)
        return
      }
      setDetected(res.label)
      setProducts(res.products)
      setSelected(new Set(res.products.map((_, i) => i)))
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === products.length
        ? new Set()
        : new Set(products.map((_, i) => i)),
    )
  }

  async function doImport() {
    const chosen = products.filter((_, i) => selected.has(i))
    if (!chosen.length || !ownsRights) return
    setStep(4)
    setProgress(0)
    const agg: ImportResult = { imported: 0, skipped: 0, failed: [] }
    const size = 4
    for (let i = 0; i < chosen.length; i += size) {
      const r = await runProductImport(chosen.slice(i, i + size), ownsRights)
      agg.imported += r.imported
      agg.skipped += r.skipped
      agg.failed.push(...r.failed)
      setProgress(
        Math.round((Math.min(i + size, chosen.length) / chosen.length) * 100),
      )
    }
    setResult(agg)
    onDone?.()
  }

  const canConnect =
    source?.kind === 'teemill' ||
    ((source?.kind === 'url' || source?.kind === 'key') &&
      text.trim().length > 0) ||
    (source?.kind === 'file' && csvText.length > 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Stepper */}
      <ol className="flex items-center gap-2 text-xs">
        {STEPS.map((label, i) => {
          const n = i + 1
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full font-semibold',
                  n === step
                    ? 'bg-brand text-white'
                    : n < step
                      ? 'bg-brand/20 text-brand-200'
                      : 'bg-white/10 text-neutral-500',
                )}
              >
                {n}
              </span>
              <span className={n === step ? 'text-neutral-200' : 'text-neutral-500'}>
                {label}
              </span>
              {n < STEPS.length && <span className="text-neutral-700">›</span>}
            </li>
          )
        })}
      </ol>

      {/* Step 1 — source */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s)}
              className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-card p-5 text-left transition-colors hover:border-brand-300"
            >
              <s.Icon className="h-6 w-6 text-brand-200" />
              <span className="font-heading font-semibold">{s.label}</span>
              <span className="text-sm text-neutral-400">{s.hint}</span>
            </button>
          ))}
          <p className="text-xs text-neutral-500 sm:col-span-2">
            Gumroad, WooCommerce & Squarespace coming next.
          </p>
        </div>
      )}

      {/* Step 2 — connect */}
      {step === 2 && source && (
        <div className="flex flex-col gap-4">
          {source.kind === 'file' ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-card px-3 py-8 text-sm text-neutral-400 hover:border-brand-300 hover:text-neutral-200">
              <FileSpreadsheet className="h-6 w-6" />
              {csvName ? `Selected: ${csvName}` : 'Choose a CSV file to upload'}
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onCsvFile}
                className="sr-only"
              />
            </label>
          ) : (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-300">
                {source.inputLabel ?? source.label}
                {source.kind === 'teemill' && (
                  <span className="font-normal text-neutral-500">
                    {' '}
                    (optional — leave blank to use your configured store)
                  </span>
                )}
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={source.placeholder}
                  type={source.kind === 'key' ? 'password' : 'text'}
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:border-brand-300 focus-visible:outline-none"
                />
              </label>
              {source.helpText && (
                <p className="text-xs text-neutral-500">
                  {source.helpText}{' '}
                  {source.helpUrl && (
                    <a
                      href={source.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-200 hover:underline"
                    >
                      {source.helpUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </p>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <Button onClick={connect} disabled={loading || !canConnect}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Find products'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — preview */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">
              {detected && (
                <span className="mr-2 rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand-200">
                  {detected}
                </span>
              )}
              <button
                type="button"
                onClick={toggleAll}
                className="text-brand-200 hover:text-brand-100"
              >
                {selected.size === products.length ? 'Deselect all' : 'Select all'}
              </button>
            </span>
            <span className="text-neutral-400">
              {selected.size} of {products.length} selected
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-2 font-medium"> </th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Imgs</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggle(i)}
                        className="h-4 w-4 rounded border-white/20 bg-card accent-brand"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-neutral-200">
                      {p.name}
                    </td>
                    <td className="px-3 py-2 text-neutral-400">
                      £{p.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-neutral-400">
                      {p.images.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ownership confirmation — required */}
          <label className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={ownsRights}
              onChange={(e) => setOwnsRights(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-card accent-brand"
            />
            I own these products or have the right to sell them. They&apos;ll be
            imported as <strong>drafts</strong> to review before going live.
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <Button onClick={doImport} disabled={selected.size === 0 || !ownsRights}>
              Import {selected.size} product{selected.size === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — import */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          {!result ? (
            <>
              <p className="text-sm text-neutral-300">
                Importing &amp; uploading images… {progress}%
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <p className="font-heading text-lg font-semibold">
                Imported {result.imported} product
                {result.imported === 1 ? '' : 's'}
              </p>
              <p className="text-sm text-neutral-400">
                {result.skipped > 0 &&
                  `${result.skipped} skipped (already in shop). `}
                {result.failed.length > 0 && (
                  <span className="text-amber-300">
                    <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                    {result.failed.length} failed.
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                Find them under the Drafts filter in Products.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
