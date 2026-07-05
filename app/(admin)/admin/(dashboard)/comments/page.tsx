import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { deleteComment, toggleCommentHidden } from '@/app/(admin)/admin/(dashboard)/actions'
import { getAdminComments } from '@/lib/comments'
import { cn } from '@/lib/utils'
import type { AdminTrackComment } from '@/types'

async function getComments(): Promise<AdminTrackComment[]> {
  try {
    return await getAdminComments()
  } catch {
    return []
  }
}

export default async function AdminComments() {
  const comments = await getComments()
  const hidden = comments.filter((c) => c.is_hidden).length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Comments</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {comments.length} comment{comments.length === 1 ? '' : 's'} on
          playlist tracks
          {hidden > 0 && <span className="text-amber-300"> — {hidden} hidden</span>}
        </p>
      </header>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-card p-8 text-center text-sm text-neutral-400">
          No comments yet — they&apos;ll land here as soon as listeners start
          talking.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Track</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    'border-b border-white/5 last:border-b-0',
                    c.is_hidden && 'opacity-60',
                  )}
                >
                  <td className="max-w-[160px] truncate px-4 py-3 font-medium text-neutral-200">
                    {c.track_title}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-neutral-300">
                    {c.display_name}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-neutral-300">
                    <span className="line-clamp-2 break-words">{c.body}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                    {new Date(c.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        c.is_hidden
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-300',
                      )}
                    >
                      {c.is_hidden ? 'Hidden' : 'Live'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <form action={toggleCommentHidden}>
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="next"
                          value={c.is_hidden ? 'false' : 'true'}
                        />
                        <button
                          type="submit"
                          title={c.is_hidden ? 'Unhide comment' : 'Hide comment'}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
                        >
                          {c.is_hidden ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          title="Delete comment"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
