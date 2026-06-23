import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getProducts } from '@/lib/products'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://welshdog.designs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/shop', '/blog', '/white-label', '/about', '/contact'].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  )

  const posts = getAllPosts().map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const products = (await getProducts()).map((p) => ({
    url: `${siteUrl}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...posts, ...products]
}
