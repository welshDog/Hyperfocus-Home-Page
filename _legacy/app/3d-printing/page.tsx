import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Printing3D() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-orange mb-4">3D Printing Zone 🖨️</h1>
        <p className="text-xl leading-nd mb-8">Hyperfocus Zone 3D prints — ND-inspired designs straight from the lab.</p>
        <div className="nd-card"><p className="text-hf-comment">3D print showcase coming soon 🔄</p></div>
      </section>
      <Footer />
    </main>
  )
}
