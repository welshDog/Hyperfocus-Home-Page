import Link from 'next/link'

interface BlogCardProps {
  slug: string
  title: string
  category: string
  date: string
}

export default function BlogCard({ slug, title, category, date }: BlogCardProps) {
  const categoryColors: Record<string, string> = {
    'ND Journey': 'bg-purple-100 text-purple-700',
    'Tech & AI': 'bg-blue-100 text-blue-700',
    'Crypto': 'bg-orange-100 text-orange-700',
  }

  return (
    <Link href={`/blog/${slug}`} className="nd-card block group hover:border-hf-blue hover:border-2">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-600'}`}>
        {category}
      </span>
      <h3 className="font-bold mt-3 mb-2 leading-snug group-hover:text-hf-blue transition-colors">{title}</h3>
      <p className="text-xs text-hf-comment">{date}</p>
    </Link>
  )
}
