import Link from 'next/link'
import BlogCard from './BlogCard'

const featuredBlogs = [
  { slug: 'the-power-of-hyperfocus', title: 'The Power of Hyperfocus', category: 'ND Journey', date: '2024-01-02' },
  { slug: 'ai-tools-neurodivergent', title: 'AI Tools for Neurodivergent Developers', category: 'Tech & AI', date: '2024-02-01' },
  { slug: 'realities-of-dyslexia-adhd', title: 'The Realities of Living with Dyslexia and ADHD', category: 'ND Journey', date: '2024-01-06' },
]

export default function BlogPreview() {
  return (
    <section className="nd-section bg-white rounded-3xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Latest from the Blog 📝</h2>
        <Link href="/blog" className="nd-btn-secondary text-sm">All 26 posts →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredBlogs.map(blog => (
          <BlogCard key={blog.slug} {...blog} />
        ))}
      </div>
    </section>
  )
}
