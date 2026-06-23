import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Designs() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-purple mb-4">Design Gallery 🎨</h1>
        <p className="text-xl leading-nd mb-8">80+ original designs — all created by WelshDog. Every single one.</p>
        <div className="nd-card"><p className="text-hf-comment">Full design gallery loading after Teemill migration 🔄</p></div>
      </section>
      <Footer />
    </main>
  )
}
