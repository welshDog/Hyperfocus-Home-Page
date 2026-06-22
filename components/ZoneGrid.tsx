import Link from 'next/link'

const zones = [
  { href: '/hyperfocus-zone', emoji: '🧠', title: 'Hyperfocus Zone', desc: '32-agent AI swarm, courses, SDK — the full engine', color: 'hf-blue' },
  { href: '/blog', emoji: '📝', title: 'Blog', desc: '26 posts on ND life, AI, crypto, tech — all by WelshDog', color: 'hf-green' },
  { href: '/shop', emoji: '🛍️', title: 'Shop', desc: '80+ original designs — ND pride, Welsh, Gen X', color: 'hf-orange' },
  { href: '/neurovariance', emoji: '🌈', title: 'Neurovariance', desc: 'Celebrate diverse minds, activate hyperfocus mode', color: 'hf-purple' },
  { href: '/welsh-zone', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', title: 'Welsh Zone', desc: 'The funny side of Welsh life, rugby, and culture', color: 'hf-green' },
  { href: '/3d-printing', emoji: '🖨️', title: '3D Printing', desc: 'ND-inspired 3D prints straight from the lab', color: 'hf-orange' },
  { href: '/community', emoji: '👊', title: 'Community', desc: 'BROski Discord z0ne — ADHD-first AI + BROski$ economy', color: 'hf-blue' },
  { href: '/about', emoji: '🐉', title: 'About WelshDog', desc: 'The origin story — built by a dyslexic Welsh dev', color: 'hf-purple' },
]

export default function ZoneGrid() {
  return (
    <section className="nd-section">
      <h2 className="text-3xl font-bold text-hf-text mb-2">Explore the Ecosystem</h2>
      <p className="text-hf-comment mb-8">Dive into a world where passions come alive and creativity knows no bounds 🚀</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {zones.map(zone => (
          <Link key={zone.href} href={zone.href} className="nd-card group hover:border-hf-blue hover:border-2 block">
            <p className="text-3xl mb-3">{zone.emoji}</p>
            <h3 className="font-bold text-lg mb-2 group-hover:text-hf-blue transition-colors">{zone.title}</h3>
            <p className="text-sm text-hf-comment leading-relaxed">{zone.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
