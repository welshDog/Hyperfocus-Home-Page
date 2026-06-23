import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { PostMeta } from '@/lib/blog'

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl focus-visible:outline-none"
    >
      <Card interactive className="flex h-full flex-col p-6">
        <div className="flex items-center gap-3">
          <Badge>{post.category}</Badge>
          {post.date && (
            <time className="text-xs text-neutral-500" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          )}
        </div>
        <h3 className="mt-3 font-heading text-lg font-semibold leading-snug group-hover:text-brand dark:group-hover:text-brand-200">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
          {post.excerpt}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand dark:text-brand-200">
          Read more <ArrowRight className="h-4 w-4" />
        </span>
      </Card>
    </Link>
  )
}
