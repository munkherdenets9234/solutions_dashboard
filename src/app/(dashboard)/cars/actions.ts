'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { slugify } from '@/lib/slug'
import type { Car } from '@/lib/types'

export interface FormState {
  error?: string
}

// Sent as-is for the backend to validate; empty means no value.
function dateOrNull(value: FormDataEntryValue | null) {
  const s = String(value ?? '').trim()
  return s || null
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
    rental_modes: formData.getAll('rental_modes').map(String),
    self_drive_from: dateOrNull(formData.get('self_drive_from')),
    self_drive_to: dateOrNull(formData.get('self_drive_to')),
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
  }
}

export async function createCarAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const name = String(formData.get('name') ?? '').trim()
  const slug = slugify(name)
  if (!slug) return { error: 'Name is required to generate a slug.' }

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

export async function setCarVisibilityAction(id: string, visible: boolean): Promise<void> {
  const token = await requireToken()
  await apiPut<Car>(`/admin/cars/${id}`, { is_visible: visible }, token)
  revalidatePath('/cars')
}
