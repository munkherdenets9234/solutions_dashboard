'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Destination } from '@/lib/types'

export interface FormState {
  error?: string
}

function listField(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function bodyFromForm(formData: FormData) {
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()
  return {
    name: String(formData.get('name') ?? ''),
    overview: String(formData.get('overview') ?? ''),
    region: String(formData.get('region') ?? ''),
    duration_days: Number(formData.get('duration_days') ?? 0) || undefined,
    featured: formData.get('featured') === 'on',
    is_active: formData.get('is_active') === 'on',
    categories: listField(formData, 'categories'),
    tags: listField(formData, 'tags'),
    best_seasons: listField(formData, 'best_seasons'),
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
  }
}

export async function createDestinationAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const slug = String(formData.get('slug') ?? '').trim()
  if (!slug) return { error: 'Slug is required.' }

  try {
    await apiPost<Destination>('/admin/destinations', { ...bodyFromForm(formData), slug }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create tour.' }
  }

  revalidatePath('/tours')
  redirect('/tours')
}

export async function updateDestinationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = await requireToken()

  try {
    await apiPut<Destination>(`/admin/destinations/${id}`, bodyFromForm(formData), token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update tour.' }
  }

  revalidatePath('/tours')
  redirect('/tours')
}

export async function deleteDestinationAction(id: string) {
  const token = await requireToken()
  await apiDelete(`/admin/destinations/${id}`, token)
  revalidatePath('/tours')
  redirect('/tours')
}
