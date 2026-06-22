import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hyperfocus Zone — Built by a neurodivergent mind, for neurodivergent minds',
  description: 'Dive into a world where passions come alive and creativity knows no bounds. Built by a dyslexic Welsh dev with ADHD. 88 repos. One ecosystem. Zero apologies.',
  keywords: ['neurodivergent', 'ADHD', 'dyslexia', 'hyperfocus', 'AI', 'coding', 'Welsh', 'WelshDog'],
  openGraph: {
    title: 'Hyperfocus Zone',
    description: 'Built by a neurodivergent mind, for neurodivergent minds',
    url: 'https://hyperfocuszone.com',
    siteName: 'Hyperfocus Zone',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hyperfocus Zone',
    description: 'Built by a neurodivergent mind, for neurodivergent minds',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-hf-bg text-hf-text font-body leading-nd antialiased">
        {children}
      </body>
    </html>
  )
}
