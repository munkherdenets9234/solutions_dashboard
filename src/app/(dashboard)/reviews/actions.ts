'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Review } from '@/lib/types'

export interface FormState {
  error?: string
}

function bodyFromForm(formData: FormData) {
  const relatedCustomer = String(formData.get('related_customer') ?? '').trim()
  const relatedTour = String(formData.get('related_tour') ?? '').trim()
  const relatedPartner = String(formData.get('related_partner') ?? '').trim()

  return {
    star: Number(formData.get('star') ?? 0),
    review: String(formData.get('review') ?? ''),
    related_customer: relatedCustomer || undefined,
    related_tour: relatedTour || undefined,
    related_partner: relatedPartner || undefined,
  }
}

export async function createReviewAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const body = bodyFromForm(formData)
  if (body.star < 1 || body.star > 5) return { error: 'Star rating must be between 1 and 5.' }

  try {
    await apiPost<Review>('/admin/reviews', body, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create review.' }
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}

export async function updateReviewAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const body = bodyFromForm(formData)
  if (body.star < 1 || body.star > 5) return { error: 'Star rating must be between 1 and 5.' }

  try {
    await apiPut<Review>(`/admin/reviews/${id}`, body, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update review.' }
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}

// Unlike partners, review deletion is a hard delete.
export async function deleteReviewAction(id: string) {
  const token = await requireToken()
  await apiDelete(`/admin/reviews/${id}`, token)
  revalidatePath('/reviews')
  redirect('/reviews')
}
