import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { SubscribeForm } from '@/components/blog/SubscribeForm'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { formatDate } from '@/lib/utils'

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, post.category)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-brand dark:text-neutral-400 dark:hover:text-brand-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Article */}
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{post.category}</Badge>
            {post.date && (
              <time className="text-sm text-neutral-500" dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-2 text-sm text-neutral-500">By {post.author}</p>
          )}

          <div className="mt-6 border-y border-black/5 dark:border-white/5 py-3">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          <div
            className="prose prose-neutral dark:prose-invert mt-8 max-w-none prose-headings:font-heading prose-a:text-brand"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <div className="mt-10 border-t border-black/5 dark:border-white/5 pt-6">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {related.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Related posts
              </h2>
              <ul className="mt-4 space-y-4">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="group block"
                    >
                      <span className="block text-sm font-medium leading-snug group-hover:text-brand dark:group-hover:text-brand-200">
                        {r.title}
                      </span>
                      {r.date && (
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {formatDate(r.date)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Card className="p-5">
            <h2 className="font-heading text-base font-semibold">Subscribe</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              New posts to your inbox. No spam.
            </p>
            <div className="mt-4">
              <SubscribeForm />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
