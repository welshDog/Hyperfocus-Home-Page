import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return (
    <main>
      <Nav />
      <article className="nd-section max-w-3xl">
        <p className="text-hf-blue font-semibold mb-2">← <a href="/blog" className="hover:underline">Back to Blog</a></p>
        <h1 className="text-3xl font-bold mb-6 text-hf-text">{params.slug.replace(/-/g, ' ')}</h1>
        <div className="nd-card">
          <p className="text-hf-comment">Blog content coming soon — migration in progress 🔄</p>
          <p className="mt-4">This post is being migrated from Teemill. Check back soon!</p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
