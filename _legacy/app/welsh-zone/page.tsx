import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function WelshZone() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-green mb-4">Welsh Zone 🏴󠁧󠁢󠁷󠁬󠁳󠁿🐉</h1>
        <p className="text-xl leading-nd mb-8">The funny side of Welsh — I&apos;m Welsh Not Stupid, It&apos;s in My DNA, Eat Sleep Rugby Repeat.</p>
        <div className="nd-card">
          <p className="text-hf-comment">Welsh content and designs coming soon 🎨</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
