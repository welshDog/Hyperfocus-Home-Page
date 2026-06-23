import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlogCard from '@/components/BlogCard'

const blogs = [
  { slug: 'welcome-to-hyperfocus-mode', title: 'Welcome to Hyperfocus Mode: Unique Minds, Creative Paths', category: 'ND Journey', date: '2024-01-01' },
  { slug: 'the-power-of-hyperfocus', title: 'The Power of Hyperfocus', category: 'ND Journey', date: '2024-01-02' },
  { slug: 'family-friendship-mental-health', title: 'Family, Friendship, and Mental Health', category: 'ND Journey', date: '2024-01-03' },
  { slug: 'overcoming-adversity', title: 'Overcoming Adversity and Redefining My Path', category: 'ND Journey', date: '2024-01-04' },
  { slug: 'childhood-of-wonder', title: 'A Childhood of Wonder and Exploration', category: 'ND Journey', date: '2024-01-05' },
  { slug: 'realities-of-dyslexia-adhd', title: 'The Realities of Living with Dyslexia and ADHD', category: 'ND Journey', date: '2024-01-06' },
  { slug: 'living-undiagnosed', title: 'Living Undiagnosed – My Journey to Understanding ADHD in Adulthood', category: 'ND Journey', date: '2024-01-07' },
  { slug: 'raising-adhd-awareness', title: 'Raising ADHD Awareness – Why I Create Content About Neurodiversity', category: 'ND Journey', date: '2024-01-08' },
  { slug: 'coping-mechanisms-self-discovery', title: 'Coping Mechanisms and Self-Discovery', category: 'ND Journey', date: '2024-01-09' },
  { slug: 'finding-my-voice', title: 'Finding My Voice Through Creativity', category: 'ND Journey', date: '2024-01-10' },
  { slug: 'looking-to-the-future', title: 'Looking to the Future', category: 'ND Journey', date: '2024-01-11' },
  { slug: 'reflections-on-life', title: 'Reflections on Life and Society', category: 'ND Journey', date: '2024-01-12' },
  { slug: 'joy-of-learning', title: 'The Joy of Learning and Reinvention', category: 'ND Journey', date: '2024-01-13' },
  { slug: 'creativity-game-design', title: 'Creativity and the World of Game Design', category: 'ND Journey', date: '2024-01-14' },
  { slug: 'breaking-myths-dyslexia', title: 'Breaking the Myths: What Dyslexia Really Is', category: 'ND Journey', date: '2024-01-15' },
  { slug: 'dyslexia-strengths', title: 'Dyslexia: Understanding the Strengths Behind the Struggles', category: 'ND Journey', date: '2024-01-16' },
  { slug: 'dyslexia-types', title: 'The Importance of Understanding Dyslexia Types', category: 'ND Journey', date: '2024-01-17' },
  { slug: 'neurodiversity-celebration', title: 'Neurodiversity: A Celebration of Different Minds', category: 'ND Journey', date: '2024-01-18' },
  { slug: 'ai-tools-neurodivergent', title: 'AI Tools for Neurodivergent Developers', category: 'Tech & AI', date: '2024-02-01' },
  { slug: 'vibe-coding', title: 'Vibe Coding?', category: 'Tech & AI', date: '2024-02-02' },
  { slug: 'hyper-coding', title: 'Hyper Coding?', category: 'Tech & AI', date: '2024-02-03' },
  { slug: 'best-free-ai-coding-tools-2025', title: 'Best Free AI Coding Tools in 2025', category: 'Tech & AI', date: '2024-02-04' },
  { slug: 'openai-new-stuff', title: "OpenAI's New Stuff", category: 'Tech & AI', date: '2024-02-05' },
  { slug: 'nfts-next-generation', title: "NFT's The Next Tech Generation", category: 'Crypto', date: '2024-03-01' },
  { slug: 'what-is-cryptocurrencies', title: 'What is Cryptocurrencies (Do You Really Know)', category: 'Crypto', date: '2024-03-02' },
  { slug: 'lets-talk-crypto', title: 'Lets Talk about Crypto', category: 'Crypto', date: '2024-03-03' },
]

export default function BlogIndex() {
  return (
    <main>
      <Nav />
      <section className="nd-section">
        <h1 className="text-4xl font-bold text-hf-blue mb-4">Blog 📝</h1>
        <p className="text-xl mb-10 text-hf-comment">All written by WelshDog — real stories, real tech, real neurodivergent life.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <BlogCard key={blog.slug} {...blog} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
