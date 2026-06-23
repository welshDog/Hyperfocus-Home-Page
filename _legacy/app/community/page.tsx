import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Community() {
  return (
    <main>
      <Nav />
      <section className="nd-section text-center">
        <h1 className="text-4xl font-bold text-hf-blue mb-4">Community 👊</h1>
        <p className="text-xl leading-nd mb-8">Join the BROski Discord z0ne — ADHD-first AI + BROski$ economy</p>
        <a href="https://discord.gg/broski" className="nd-btn-primary text-lg inline-block">Join the Discord 🎮</a>
      </section>
      <Footer />
    </main>
  )
}
