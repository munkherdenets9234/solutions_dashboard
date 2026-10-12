import { apiGet } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Blog } from '@/lib/types'

// GET /blogs only ever returns published posts — there is no admin list
// endpoint that includes drafts. A freshly created (draft) post is only
// reachable via the id returned from its create response until it's published.
// The Go backend serializes an empty result set as `null`, not `[]`.
export async function listPublishedBlogs(page: number, limit = 10) {
  const token = await requireToken()
  const res = await apiGet<Blog[] | null>('/admin/blogs', { page, limit }, token)
  return { ...res, data: res.data ?? [] }
}

// /admin/blogs/:id takes the Mongo id, not the slug (a slug 400s with
// "invalid id") — and unlike the published-only list, it returns drafts too.
export async function getBlogById(id: string) {
  const token = await requireToken()
  return apiGet<Blog>(`/admin/blogs/${id}`, undefined, token)
}
