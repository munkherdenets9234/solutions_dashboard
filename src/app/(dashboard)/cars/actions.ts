'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Car } from '@/lib/types'

export interface FormState {
  error?: string
}

function bodyFromForm(formData: FormData) {
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    name: String(formData.get('name') ?? ''),
    type: String(formData.get('type') ?? ''),
    fuel: String(formData.get('fuel') ?? ''),
    seats: Number(formData.get('seats') ?? 0) || undefined,
    price_per_day_usd: Number(formData.get('price_per_day_usd') ?? 0) || undefined,
    tags,
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export async function createCarAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const slug = String(formData.get('slug') ?? '').trim()
  if (!slug) return { error: 'Slug is required.' }
  if (!SLUG_PATTERN.test(slug)) {
    return { error: 'Slug must be lowercase letters, numbers and hyphens only (e.g. "land-cruiser-70") — no spaces or slashes.' }
  }

  try {
    await apiPost<Car>('/admin/cars', { ...bodyFromForm(formData), slug }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create car.' }
  }

  revalidatePath('/cars')
  redirect('/cars')
}

export async function updateCarAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()

  try {
    await apiPut<Car>(`/admin/cars/${id}`, bodyFromForm(formData), token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update car.' }
  }

  revalidatePath('/cars')
  redirect('/cars')
}

export async function deleteCarAction(id: string) {
  const token = await requireToken()
  await apiDelete(`/admin/cars/${id}`, token)
  revalidatePath('/cars')
  redirect('/cars')
}
