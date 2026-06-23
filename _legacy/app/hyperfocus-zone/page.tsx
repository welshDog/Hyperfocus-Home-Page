import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function HyperfocusZone() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-blue mb-4">Hyperfocus Zone 🧠⚡</h1>
        <p className="text-xl leading-nd mb-8">The main mission — ND-first AI infrastructure, courses, and tools.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="nd-card">
            <h2 className="text-xl font-bold mb-2">🤖 HyperCode V2.4</h2>
            <p>32-agent swarm, FastAPI, Docker, Prometheus. Your AI empire engine.</p>
          </div>
          <div className="nd-card">
            <h2 className="text-xl font-bold mb-2">📦 HyperAgent SDK</h2>
            <p>npm package for AI agent orchestration v0.1.7</p>
          </div>
          <div className="nd-card">
            <h2 className="text-xl font-bold mb-2">🎓 Hyper-Vibe Coding Course</h2>
            <p>ND-first AI course — 10 modules, BROski$ tokens, Stripe payments</p>
          </div>
          <div className="nd-card">
            <h2 className="text-xl font-bold mb-2">🧠 BROski-Obsidian-Brain</h2>
            <p>Persistent AI knowledge base — Obsidian + Python</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
