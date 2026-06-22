import Hero from '@/components/Hero'
import EcosystemTicker from '@/components/EcosystemTicker'
import ZoneGrid from '@/components/ZoneGrid'
import BlogPreview from '@/components/BlogPreview'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <EcosystemTicker />
      <ZoneGrid />
      <BlogPreview />
      <Footer />
    </main>
  )
}
