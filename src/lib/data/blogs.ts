import { apiGet } from '@/lib/api/client'
import type { Blog } from '@/lib/types'

// GET /blogs only ever returns published posts — there is no admin list
// endpoint that includes drafts. A freshly created (draft) post is only
// reachable via the id returned from its create response until it's published.
export function listPublishedBlogs(page: number, limit = 10) {
  return apiGet<Blog[]>('/blogs', { page, limit })
}

export function getBlogBySlug(slug: string) {
  return apiGet<Blog>(`/blogs/${slug}`)
}
