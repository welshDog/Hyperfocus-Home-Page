import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const BLOG_DIR = join(process.cwd(), 'content', 'blog')

/** Category filter tabs for the blog. 'All' is a UI-only pseudo-category. */
export const BLOG_CATEGORIES = [
  'All',
  'ADHD & Neurodiversity',
  'Dyslexia',
  'Tech & AI',
  'Creativity',
  'Personal',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export interface PostMeta {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  author?: string
  dateInferred?: boolean
}

export interface Post extends PostMeta {
  contentHtml: string
}

function toMeta(file: string): PostMeta {
  const { data } = matter(readFileSync(join(BLOG_DIR, file), 'utf8'))
  return {
    slug: data.slug ?? file.replace(/\.md$/, ''),
    title: data.title ?? file.replace(/\.md$/, ''),
    date: data.date ?? '',
    category: data.category ?? 'Personal',
    tags: data.tags ?? [],
    excerpt: data.excerpt ?? '',
    author: data.author,
    dateInferred: data.date_inferred ?? false,
  }
}

/** All posts, newest first. */
export function getAllPosts(): PostMeta[] {
  if (!existsSync(BLOG_DIR)) return []
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(toMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** Posts filtered by category ('All' or undefined returns everything). */
export function getPostsByCategory(category?: string): PostMeta[] {
  const all = getAllPosts()
  if (!category || category === 'All') return all
  return all.filter((p) => p.category === category)
}

/** A single post with rendered HTML, or null if not found. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = join(BLOG_DIR, `${slug}.md`)
  if (!existsSync(file)) return null
  const { data, content } = matter(readFileSync(file, 'utf8'))
  const processed = await remark().use(html).process(content)
  return {
    ...toMeta(`${slug}.md`),
    slug: data.slug ?? slug,
    contentHtml: processed.toString(),
  }
}

/** Up to `limit` other posts in the same category. */
export function getRelatedPosts(
  slug: string,
  category: string,
  limit = 3,
): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, limit)
}
