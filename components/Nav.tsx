import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="bg-hf-bg border-b border-gray-200 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-hf-blue hover:opacity-80 transition-opacity">
            ⚡ Hyperfocus Zone
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/hyperfocus-zone" className="hover:text-hf-blue transition-colors">Zone</Link>
            <Link href="/blog" className="hover:text-hf-blue transition-colors">Blog</Link>
            <Link href="/shop" className="hover:text-hf-blue transition-colors">Shop</Link>
            <Link href="/neurovariance" className="hover:text-hf-blue transition-colors">ND</Link>
            <Link href="/welsh-zone" className="hover:text-hf-blue transition-colors">🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh</Link>
            <Link href="/community" className="hover:text-hf-blue transition-colors">Community</Link>
            <Link href="/about" className="nd-btn-primary text-sm py-2">About</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
