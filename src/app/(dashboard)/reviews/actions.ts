'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPostForm, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Review, LocaleMap, Customer } from '@/lib/types'

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

// Reads a MultiLangField's serialized `Record<Locale,string>` hidden input.
function localeField(formData: FormData, name: string): LocaleMap {
  return jsonField<LocaleMap>(formData, name) ?? {}
}

function bodyFromForm(formData: FormData) {
  const relatedCustomer = String(formData.get('related_customer') ?? '').trim()
  const relatedTour = String(formData.get('related_tour') ?? '').trim()
  const relatedPartner = String(formData.get('related_partner') ?? '').trim()

  return {
    star: Number(formData.get('star') ?? 0),
    review: localeField(formData, 'review'),
    related_customer: relatedCustomer || undefined,
    related_tour: relatedTour || undefined,
    related_partner: relatedPartner || undefined,
  }
}

const AVATAR_TYPES = ['image/jpeg', 'image/png']
const MAX_AVATAR_BYTES = 10 * 1024 * 1024

// Creates a customer through the multipart endpoint. Reads the `customer_*`
// fields written by NewCustomerFields. Validation here is a convenience; the
// backend validates again and is the authority.
async function createCustomerWithAvatar(token: string, formData: FormData): Promise<{ id: string; name: string }> {
  const name = String(formData.get('customer_name') ?? '').trim()
  const email = String(formData.get('customer_email') ?? '').trim()
  if (!name || !email) throw new ApiError(400, 'Customer name and email are required.')

  const out = new FormData()
  out.set('name', name)
  out.set('email', email)
  out.set('phone', String(formData.get('customer_phone') ?? '').trim())
  out.set('nationality', String(formData.get('customer_nationality') ?? '').trim())

  const avatar = formData.get('customer_avatar')
  if (avatar instanceof File && avatar.size > 0) {
    if (!AVATAR_TYPES.includes(avatar.type)) throw new ApiError(400, 'Customer photo must be a JPEG or PNG image.')
    if (avatar.size > MAX_AVATAR_BYTES) throw new ApiError(400, 'Customer photo must be under 10 MB.')
    out.set('avatar', avatar, avatar.name)
  }

  const { data } = await apiPostForm<Customer>('/admin/customers', out, token)
  return { id: data.id, name: data.name }
}

// Exposed for callers that only need the customer. Throws ApiError with a
// short message on failure.
export async function createCustomerWithAvatarAction(formData: FormData): Promise<{ id: string; name: string }> {
  const token = await requireToken()
  return createCustomerWithAvatar(token, formData)
}

export async function createReviewAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const body: ReturnType<typeof bodyFromForm> & { customer_id?: string } = bodyFromForm(formData)
  if (body.star < 1 || body.star > 5) return { error: 'Star rating must be between 1 and 5.' }

  let createdCustomer = false
  if (formData.get('new_customer')) {
    try {
      const customer = await createCustomerWithAvatar(token, formData)
      body.customer_id = customer.id
      // related_customer is filled server-side from the customer's name.
      body.related_customer = undefined
      createdCustomer = true
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Failed to create customer. The review was not created.' }
    }
  }

  try {
    await apiPost<Review>('/admin/reviews', body, token)
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to create review.'
    return {
      error: createdCustomer
        ? `The customer was created, but the review was not: ${message} Pick the customer from the list and try again.`
        : message,
    }
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
