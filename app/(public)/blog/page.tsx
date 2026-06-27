import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { PostCard } from '@/components/blog/PostCard'
import { BlogCategoryTabs } from '@/components/blog/BlogCategoryTabs'
import { SubscribeForm } from '@/components/blog/SubscribeForm'
import { getAllPosts, getPostsByCategory, BLOG_CATEGORIES } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Honest writing on ADHD, dyslexia, neurodiversity, tech, and the creative life — by Lyndon Williams (WelshDog).',
}

export default async function BlogIndex(
  props: {
    searchParams: Promise<{ category?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const requested = searchParams.category
  const active = BLOG_CATEGORIES.includes(requested as never)
    ? (requested as string)
    : 'All'

  const posts = getPostsByCategory(active)
  // Featured strip: the 3 newest posts, shown only on the unfiltered view
  // so it complements (rather than duplicates) a filtered category grid.
  const featured = active === 'All' ? getAllPosts().slice(0, 3) : []

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Blog</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Honest writing on ADHD, dyslexia, neurodiversity, tech, and the
          creative life — straight from a brain that doesn&apos;t switch off.
        </p>
      </header>

      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold sm:text-2xl">Featured posts</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((post) => (
              <PostCard key={`featured-${post.slug}`} post={post} />
            ))}
          </div>
        </section>
      )}

      <div className="mb-8">
        <BlogCategoryTabs active={active} />
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="font-heading text-lg font-semibold">
            Nothing in {active} yet
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Try another category.
          </p>
        </Card>
      )}

      {/* Subscribe CTA */}
      <Card className="mt-16 p-8 sm:p-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold">Never miss a post</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Get behind-the-scenes shop updates, new drops, and Hyperfocus
            experiments — straight to your inbox. No spam, ever.
          </p>
          <div className="mt-6 text-left">
            <SubscribeForm />
          </div>
        </div>
      </Card>
    </div>
  )
}
