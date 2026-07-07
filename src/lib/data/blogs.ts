import { apiGet } from '@/lib/api/client'
import type { Blog } from '@/lib/types'

// GET /blogs only ever returns published posts — there is no admin list
// endpoint that includes drafts. A freshly created (draft) post is only
// reachable via the id returned from its create response until it's published.
export function listPublishedBlogs(page: number, limit = 10) {
  return apiGet<Blog[]>('/admin/blogs', { page, limit })
}

// /admin/blogs/:id takes the Mongo id, not the slug (a slug 400s with
// "invalid id") — and unlike the published-only list, it returns drafts too.
export function getBlogById(id: string) {
  return apiGet<Blog>(`/admin/blogs/${id}`)
}
