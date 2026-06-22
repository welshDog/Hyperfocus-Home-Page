import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-hf-blue via-blue-700 to-hf-purple text-white py-24 px-4" aria-label="Hero section">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-blue-200 font-semibold tracking-wide uppercase text-sm mb-4">🏴󠁧󠁢󠁷󠁬󠁳󠁿 Built in Wales. Built for every ND brain on the planet.</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Hyperfocus Zone
        </h1>
        <p className="text-xl sm:text-2xl text-blue-100 mb-4 font-medium">
          Built by a neurodivergent mind, for neurodivergent minds.
        </p>
        <p className="text-lg text-blue-200 mb-10 italic">
          It can be Anything and I mean Anything...
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/hyperfocus-zone" className="bg-white text-hf-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
            Enter the Zone ⚡
          </Link>
          <Link href="/blog" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-hf-blue transition-colors text-lg">
            Read the Blog 📝
          </Link>
        </div>
        <p className="mt-10 text-blue-300 text-sm">
          Built by a dyslexic Welsh dev with ADHD &bull; 88 repos &bull; One ecosystem &bull; Zero apologies
        </p>
      </div>
    </section>
  )
}
