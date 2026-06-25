import {
  Store,
  Package,
  Boxes,
  Tag,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  LayoutGrid,
  FileSpreadsheet,
  Globe,
  type LucideIcon,
} from 'lucide-react'

type SourceInfo = { name: string; desc: string; Icon: LucideIcon }

const SOURCES: SourceInfo[] = [
  { name: 'Etsy', desc: 'All your active listings — images + tags.', Icon: Store },
  { name: 'Printful', desc: 'Your full product catalogue + variants.', Icon: Package },
  { name: 'Printify', desc: 'Every synced product + print options.', Icon: Boxes },
  { name: 'Gumroad', desc: 'Digital products, keeping your download links.', Icon: Tag },
  { name: 'Teemill', desc: 'Full apparel range + variants.', Icon: Shirt },
  { name: 'Shopify', desc: 'Any Shopify store URL — zero setup.', Icon: ShoppingBag },
  { name: 'WooCommerce', desc: 'Any WooCommerce site — just the URL.', Icon: ShoppingCart },
  { name: 'Squarespace', desc: 'Any Squarespace shop page.', Icon: LayoutGrid },
  { name: 'CSV', desc: 'Export from anywhere, import here.', Icon: FileSpreadsheet },
  { name: 'Any store URL', desc: "Paste a link — we'll figure it out.", Icon: Globe },
]

/** Marketing panel for the white-label page: the platforms HyperImport pulls
 *  a shop across from. */
export function HyperImportSources() {
  return (
    <section className="mt-16">
      <div className="rounded-2xl border border-brand/15 bg-brand/5 p-6 dark:border-brand-300/15 dark:bg-brand-300/5 sm:p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            🚀 We migrate your existing shop for you
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Paste your store URL — we pull everything across automatically. No
            tedious copy-paste, no starting from scratch.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => (
            <div
              key={s.name}
              className="flex items-start gap-3 rounded-xl border border-black/5 bg-white/60 p-4 dark:border-white/5 dark:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand-300/15 dark:text-brand-200">
                <s.Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading font-semibold leading-tight">
                  {s.name}
                </h3>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
          Everything lands as <strong>drafts</strong> — you review, activate, go
          live. No data loss. No overwrites.{' '}
          <span className="font-medium text-brand dark:text-brand-200">
            Your products, your shop.
          </span>
        </p>
      </div>
    </section>
  )
}
