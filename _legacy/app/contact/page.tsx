import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Contact() {
  return (
    <main>
      <Nav />
      <section className="nd-section max-w-2xl">
        <h1 className="text-4xl font-bold text-hf-blue mb-4">Contact 📬</h1>
        <p className="text-xl leading-nd mb-8">Got a collab idea? Sponsorship? Just want to say hi? Hit WelshDog up.</p>
        <div className="space-y-4">
          <div className="nd-card"><strong>TikTok:</strong> @XDWELSHDOG</div>
          <div className="nd-card"><strong>YouTube:</strong> XDWELSHDOG</div>
          <div className="nd-card"><strong>GitHub:</strong> <a href="https://github.com/welshDog" className="text-hf-blue hover:underline">github.com/welshDog</a></div>
          <div className="nd-card"><strong>OpenSea:</strong> WelshDogNFT</div>
          <div className="nd-card"><strong>Linkr:</strong> <a href="https://linkr.bio/WelshDog" className="text-hf-blue hover:underline">linkr.bio/WelshDog</a></div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
