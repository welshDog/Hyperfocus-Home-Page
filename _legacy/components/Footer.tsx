import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-hf-text text-gray-300 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">⚡ Hyperfocus Zone</h3>
            <p className="text-sm leading-relaxed">Built by a neurodivergent mind, for neurodivergent minds. 🏴󠁧󠁢󠁷󠁬󠁳󠁿</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hyperfocus-zone" className="hover:text-white transition-colors">Hyperfocus Zone</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/neurovariance" className="hover:text-white transition-colors">Neurovariance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">More</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/welsh-zone" className="hover:text-white transition-colors">Welsh Zone 🏴󠁧󠁢󠁷󠁬󠁳󠁿</Link></li>
              <li><Link href="/3d-printing" className="hover:text-white transition-colors">3D Printing</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/welshDog" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="https://linkr.bio/WelshDog" className="hover:text-white transition-colors">Linkr</a></li>
              <li><a href="https://discord.gg/broski" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="https://opensea.io/WelshDogNFT" className="hover:text-white transition-colors">OpenSea</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 Hyperfocus Zone — Lyndon Williams (WelshDog). All rights reserved.</p>
          <p className="text-sm text-hf-blue font-semibold">Your unique way of thinking is your greatest strength. 💪</p>
        </div>
      </div>
    </footer>
  )
}
