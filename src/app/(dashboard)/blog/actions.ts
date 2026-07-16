'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { slugify } from '@/lib/slug'
import type { Blog, LocaleMap } from '@/lib/types'

export interface FormState {
  error?: string
}

function jsonField<T>(formData: FormData, name: string): T | undefined {
  const raw = String(formData.get(name) ?? '').trim()
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

// Reads a MultiLangField/MultiLangRichTextEditor's serialized `Record<Locale,string>`.
function localeField(formData: FormData, name: string): LocaleMap {
  return jsonField<LocaleMap>(formData, name) ?? {}
}

function bodyFromForm(formData: FormData) {
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()

  return {
    title: localeField(formData, 'title'),
    category: String(formData.get('category') ?? ''),
    read_time: Number(formData.get('read_time') ?? 0) || undefined,
    featured: formData.get('featured') === 'on',
    excerpt: localeField(formData, 'excerpt'),
    content: localeField(formData, 'content'),
    tags,
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
  }
}

export async function createBlogAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const title = localeField(formData, 'title')
  const titleText = title.en || Object.values(title).find(Boolean) || ''
  const slug = slugify(titleText)
  if (!slug) return { error: 'A title is required to generate a slug.' }

  let created: Blog
  try {
    const res = await apiPost<Blog>('/admin/blogs', { ...bodyFromForm(formData), slug }, token)
    created = res.data
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create blog post.' }
  }

  revalidatePath('/blog')
  redirect(`/blog/${created.id}/edit?justCreated=1`)
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
