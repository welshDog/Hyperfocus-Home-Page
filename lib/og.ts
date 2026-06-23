const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://welshdog.designs'

/** Absolute URL for a dynamic OG share card. */
export function ogImage(title: string, tag?: string): string {
  const params = new URLSearchParams({ title })
  if (tag) params.set('tag', tag)
  return `${siteUrl}/api/og?${params.toString()}`
}
