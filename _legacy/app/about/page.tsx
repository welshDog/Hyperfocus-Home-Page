import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function About() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-blue mb-6">About WelshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁿</h1>
        <p className="text-xl leading-nd mb-6">
          Built by a dyslexic Welsh dev with ADHD. 88 repos. One ecosystem. Zero apologies.
        </p>
        <p className="text-lg leading-nd mb-6">
          Hi, I&apos;m Lyndon Williams — aka WelshDog — from Llanelli, Wales. I&apos;m neurodivergent: 
          dyslexic, ADHD, and autistic. For years I was told I wasn&apos;t smart enough, 
          wasn&apos;t focused enough, wasn&apos;t &quot;normal&quot; enough.
        </p>
        <p className="text-lg leading-nd mb-6">
          So I built my own world. Hyperfocus Zone is an entire ecosystem — AI agents, 
          coding courses, community, art, merch — all built by a neurodivergent mind, 
          for neurodivergent minds.
        </p>
        <p className="text-lg leading-nd font-semibold text-hf-blue">
          Your unique way of thinking is your greatest strength. 💪
        </p>
      </section>
      <Footer />
    </main>
  )
}
