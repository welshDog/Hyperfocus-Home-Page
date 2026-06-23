import type { Metadata } from 'next'
import { Sparkles, Box, PenLine, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { ogImage } from '@/lib/og'

export const metadata: Metadata = {
  title: 'About',
  description:
    'WelshDog Designs is built by Lyndon Williams — a dyslexic, ADHD, autistic maker and AI agent architect from South Wales. The story, the mission, and why it exists.',
  openGraph: {
    title: 'About · WelshDog Designs',
    description: 'Built by a neurodivergent mind, for neurodivergent minds.',
    images: [ogImage('Built for brains that don’t switch off', 'About')],
  },
}

const builds = [
  { Icon: Box, title: '3D-printed originals', body: 'Coasters, stands, personalised gifts — designed and made to order in South Wales.' },
  { Icon: PenLine, title: 'Honest writing', body: 'Years of posts on ADHD, dyslexia, autism, tech, and the creative life.' },
  { Icon: Cpu, title: 'AI + tools', body: 'Agent systems and software built for the way neurodivergent brains actually work.' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Badge>
        <Sparkles className="mr-1 h-3 w-3" /> The story
      </Badge>
      <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
        Built by a neurodivergent mind, for{' '}
        <span className="text-brand dark:text-brand-200">neurodivergent minds</span>.
      </h1>

      <div className="mt-8 space-y-5 text-lg text-neutral-700 dark:text-neutral-300">
        <p>
          I&apos;m <strong>Lyndon Williams</strong> — WelshDog. I&apos;m dyslexic,
          I have ADHD, and I&apos;m autistic. For most of my life that was framed
          as a list of things I couldn&apos;t do. Turns out it&apos;s the opposite:
          it&apos;s a different operating system, and once you build for it
          instead of against it, it&apos;s a superpower.
        </p>
        <p>
          WelshDog Designs is where that energy goes. Original 3D-printed gear and
          personalised gifts, honest writing about the neurodivergent experience,
          and the software engine that powers the whole shop — which you can own
          too. Three lanes, one brand, zero apologies.
        </p>
        <p>
          Everything here is mine, made from a small workshop in South Wales. No
          corporate fluff, no pretending. Just a maker who doesn&apos;t have an
          off switch, building things for people who think like I do.
        </p>
      </div>

      {/* The code */}
      <Card className="mt-10 p-8">
        <h2 className="font-heading text-xl font-bold">The Hyperfocus code</h2>
        <ul className="mt-4 space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>→ Different isn&apos;t less. It&apos;s an advantage waiting for the right tools.</li>
          <li>→ Clear beats clever. Short paragraphs, real hierarchy, no walls of text.</li>
          <li>→ Make the thing. Ship it. Improve it. Repeat.</li>
          <li>→ Built for the hyperfocused — not the perfect.</li>
        </ul>
      </Card>

      {/* What I build */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">What I build</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {builds.map(({ Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand-300/15 dark:text-brand-200">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-heading font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/shop" size="lg">Browse the shop</ButtonLink>
        <ButtonLink href="/blog" size="lg" variant="outline">Read the blog</ButtonLink>
      </div>
    </div>
  )
}
