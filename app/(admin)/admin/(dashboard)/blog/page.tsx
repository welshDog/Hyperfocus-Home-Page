import { createAdminClient } from '@/lib/supabase'
import { getAllPosts } from '@/lib/blog'
import { formatDate } from '@/lib/utils'
import { DraftForm } from '@/components/admin/DraftForm'
import { togglePostPublished } from '../actions'
import type { BlogPost } from '@/types'

async function getDbPosts(): Promise<BlogPost[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: true })
    return (data ?? []) as BlogPost[]
  } catch {
    return []
  }
}

export default async function AdminBlog() {
  const [dbPosts, filePosts] = [await getDbPosts(), getAllPosts()]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Blog</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {filePosts.length} live posts · {dbPosts.length} DB drafts
        </p>
      </header>

      {/* New draft */}
      <section className="rounded-2xl border border-white/5 bg-card p-5 sm:p-6">
        <h2 className="font-heading text-base font-semibold">New draft</h2>
        <p className="mb-4 mt-1 text-xs text-neutral-500">
          Drafts &amp; scheduled posts are stored in the database. Existing live
          posts are file-based (in <code>content/blog</code>).
        </p>
        <DraftForm />
      </section>

      {/* DB drafts / scheduled */}
      {dbPosts.length > 0 && (
        <section className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
          <h2 className="px-5 pt-4 font-heading text-base font-semibold">
            Drafts &amp; scheduled
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {dbPosts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{p.title}</td>
                  <td className="px-5 py-3 text-neutral-400">{p.category ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        p.published
                          ? 'inline-flex rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-200'
                          : 'inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-neutral-400'
                      }
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={togglePostPublished} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={(!p.published).toString()} />
                      <button
                        type="submit"
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/20 hover:text-neutral-100"
                      >
                        {p.published ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Live (file-based) posts */}
      <section className="overflow-x-auto rounded-2xl border border-white/5 bg-card">
        <h2 className="px-5 pt-4 font-heading text-base font-semibold">
          Live posts
        </h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filePosts.map((p) => (
              <tr key={p.slug} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 font-medium">{p.title}</td>
                <td className="px-5 py-3 text-neutral-400">{p.category}</td>
                <td className="px-5 py-3 whitespace-nowrap text-neutral-400">
                  {formatDate(p.date)}
                  {p.dateInferred && (
                    <span className="ml-1 text-[10px] text-neutral-600">(inferred)</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-200">
                    Published
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
