import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://welshdog.designs'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'WelshDog Designs — Built for brains that don’t switch off',
    template: '%s · WelshDog Designs',
  },
  description:
    'Original 3D-printed gear, personalised gifts, honest neurodivergent writing, and a white-label shop engine you can own. By Lyndon Williams, South Wales.',
  keywords: [
    'WelshDog Designs',
    '3D printing',
    'neurodivergent',
    'ADHD',
    'dyslexia',
    'personalised gifts',
    'white-label shop',
    'Hyperfocus Zone',
  ],
  openGraph: {
    title: 'WelshDog Designs',
    description: 'Built for brains that don’t switch off.',
    url: siteUrl,
    siteName: 'WelshDog Designs',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WelshDog Designs',
    description: 'Built for brains that don’t switch off.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="font-body bg-paper text-neutral-900 dark:bg-ink dark:text-neutral-50 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
