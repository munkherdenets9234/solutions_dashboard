'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Blog } from '@/lib/types'

export interface FormState {
  error?: string
}

function bodyFromForm(formData: FormData) {
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()

  return {
    title: String(formData.get('title') ?? ''),
    category: String(formData.get('category') ?? ''),
    read_time: Number(formData.get('read_time') ?? 0) || undefined,
    featured: formData.get('featured') === 'on',
    excerpt: String(formData.get('excerpt') ?? ''),
    content: String(formData.get('content') ?? ''),
    tags,
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
  }
}

export async function createBlogAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const slug = String(formData.get('slug') ?? '').trim()
  if (!slug) return { error: 'Slug is required.' }

  let created: Blog
  try {
    const res = await apiPost<Blog>('/admin/blogs', { ...bodyFromForm(formData), slug }, token)
    created = res.data
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create blog post.' }
  }

  revalidatePath('/blog')
  // Posts are always created as drafts, and there's no admin list endpoint
  // that includes drafts — carry the id through so the edit page can still
  // publish it even if a lookup-by-slug 404s before it's published.
  redirect(`/blog/${created.slug}/edit?id=${created.id}&justCreated=1`)
}

export async function updateBlogAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()

  try {
    await apiPut<Blog>(`/admin/blogs/${id}`, bodyFromForm(formData), token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update blog post.' }
  }

  revalidatePath('/blog')
  redirect('/blog')
}

export async function publishBlogAction(id: string) {
  const token = await requireToken()
  await apiPost(`/admin/blogs/${id}/publish`, {}, token)
  revalidatePath('/blog')
  redirect('/blog')
}
