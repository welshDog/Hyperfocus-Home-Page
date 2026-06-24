'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Loader2, X, ImagePlus } from 'lucide-react'
import { saveProduct, type FormState } from '@/app/(admin)/admin/(dashboard)/actions'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

const CATEGORIES = ['3D Prints', 'Mugs', 'Gifts', 'Bundles']
const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:border-brand-300 focus-visible:outline-none'
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-neutral-300'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save product'}
    </Button>
  )
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useFormState<FormState, FormData>(saveProduct, undefined)
  const [keptImages, setKeptImages] = useState<string[]>(product?.images ?? [])
  const [newCount, setNewCount] = useState(0)

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={product?.name} className={inputClass} />
      </label>

      <label className={labelClass}>
        Slug <span className="font-normal text-neutral-500">(leave blank to auto-generate)</span>
        <input name="slug" defaultValue={product?.slug} placeholder="auto from name" className={inputClass} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          Category
          <select name="category" defaultValue={product?.category ?? 'Gifts'} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Price (£)
          <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? 0} className={inputClass} />
        </label>
        <label className={labelClass}>
          Stock
          <input name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Description
        <textarea name="description" rows={5} defaultValue={product?.description ?? ''} className={`${inputClass} h-auto py-2`} />
      </label>

      {/* Images */}
      <div className={labelClass}>
        Images
        {keptImages.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-3">
            {keptImages.map((url, i) => (
              <div
                key={url}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[10px] font-medium text-brand-200">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setKeptImages((p) => p.filter((u) => u !== url))}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-neutral-200 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <input type="hidden" name="existing_images" value={url} />
              </div>
            ))}
          </div>
        )}
        <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 bg-card px-3 py-3 text-sm font-normal text-neutral-400 transition-colors hover:border-brand-300 hover:text-neutral-200">
          <ImagePlus className="h-4 w-4 shrink-0" />
          {newCount > 0
            ? `${newCount} new image${newCount === 1 ? '' : 's'} ready to upload`
            : 'Choose images to upload'}
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={(e) => setNewCount(e.target.files?.length ?? 0)}
            className="sr-only"
          />
        </label>
        <span className="text-xs font-normal text-neutral-500">
          PNG, JPG or WebP · up to 5MB each. The first image is the shop cover.
        </span>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-neutral-300">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? false}
          className="h-4 w-4 rounded border-white/20 bg-card accent-brand"
        />
        Active (visible in shop)
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="mt-2">
        <SubmitButton />
      </div>
    </form>
  )
}
