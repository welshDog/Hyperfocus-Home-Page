import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Neurovariance() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-purple mb-4">Neurovariance 🌈</h1>
        <p className="text-xl leading-nd mb-6">Champion neurodiversity. Express yourself, embrace diverse minds, activate hyperfocus mode.</p>
        <p className="text-lg leading-nd mb-8">Neurovariance isn&apos;t just a word; it&apos;s a celebration of diverse minds coming together.</p>
        <div className="nd-card">
          <p className="text-hf-comment">Designs and content coming soon 🎨</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
