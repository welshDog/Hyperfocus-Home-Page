import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Shop() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-orange mb-4">Shop 🛍️</h1>
        <p className="text-xl leading-nd mb-6">80+ original designs — ND pride, Welsh spirit, Gen X vibes.</p>
        <p className="text-lg mb-8">All designs created by WelshDog. Zero apologies. 100% original.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="nd-card text-center">
            <p className="text-3xl mb-2">🧢</p>
            <h3 className="font-bold mb-1">ND Designs</h3>
            <p className="text-sm text-hf-comment">Hyperfocus Mode Cap, Beware I&apos;m DYSLEXIC, Embrace Neurodiversity</p>
          </div>
          <div className="nd-card text-center">
            <p className="text-3xl mb-2">🏴󠁧󠁢󠁷󠁬󠁳󠁿</p>
            <h3 className="font-bold mb-1">Welsh Zone</h3>
            <p className="text-sm text-hf-comment">I&apos;m Welsh Not Stupid, It&apos;s in My DNA, Eat Sleep Rugby Repeat</p>
          </div>
          <div className="nd-card text-center">
            <p className="text-3xl mb-2">⚡</p>
            <h3 className="font-bold mb-1">Gen X Series</h3>
            <p className="text-sm text-hf-comment">20+ Gen X Council / No Fear / We Made It Cool variants</p>
          </div>
        </div>
        <div className="mt-10 nd-card text-center">
          <p className="font-semibold text-lg mb-2">🔄 Merch integration in progress</p>
          <p className="text-hf-comment">Moving from Teemill to Printful — full shop launching soon!</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
