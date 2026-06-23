import type { Metadata } from 'next'
import { Mail, MapPin, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ContactForm } from '@/components/ContactForm'
import { ogImage } from '@/lib/og'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with WelshDog Designs — product questions, custom commissions, white-label enquiries, or just to say hello.',
  openGraph: {
    title: 'Contact · WelshDog Designs',
    description: 'Product questions, commissions, or just to say hello.',
    images: [ogImage('Get in touch', 'Contact')],
  },
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
      <p className="mt-3 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
        Product questions, a custom commission, a white-label shop, or just a
        hello — drop me a line and I&apos;ll come back to you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-brand dark:text-brand-200" />
            <span>South Wales, UK 🏴󠁧󠁢󠁷󠁬󠁳󠁿<br />Made to order, shipped worldwide.</span>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 text-brand dark:text-brand-200" />
            <span>Want a shop like this? See the{' '}
              <a href="/white-label" className="text-brand hover:underline dark:text-brand-200">white-label service</a>.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-brand dark:text-brand-200" />
            <span>Prefer email? Use the form — it lands straight in my inbox.</span>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <ContactForm />
        </Card>
      </div>
    </div>
  )
}
