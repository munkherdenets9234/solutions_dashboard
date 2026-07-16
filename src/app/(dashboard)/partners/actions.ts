'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { slugify } from '@/lib/slug'
import type { Partner, LocaleMap } from '@/lib/types'

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
  const image = String(formData.get('image_url') ?? '').trim()
  const webUrl = String(formData.get('web_url') ?? '').trim()
  const relatedReview = String(formData.get('related_review') ?? '').trim()

  // Product rows repeat the same three input names; getAll keeps them aligned
  // by index. Rows without a name are treated as empty and dropped.
  const productNames = formData.getAll('product_name').map(String)
  const productImages = formData.getAll('product_image').map(String)
  const productDescriptions = formData.getAll('product_description').map(String)
  const products = productNames
    .map((name, i) => ({
      name: name.trim(),
      image: productImages[i]?.trim() || undefined,
      description: productDescriptions[i]?.trim() || undefined,
    }))
    .filter((p) => p.name)

  return {
    name: String(formData.get('name') ?? ''),
    tag: String(formData.get('tag') ?? ''),
    title: localeField(formData, 'title'),
    description: localeField(formData, 'description'),
    image: image || undefined,
    web_url: webUrl || undefined,
    products,
    related_review: relatedReview || undefined,
  }
}

export async function createPartnerAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const name = String(formData.get('name') ?? '').trim()
  const slug = slugify(name)
  if (!slug) return { error: 'Name is required to generate a slug.' }

  try {
    await apiPost<Partner>('/admin/partners', { ...bodyFromForm(formData), slug }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create partner.' }
  }

  revalidatePath('/partners')
  redirect('/partners')
}

export async function updatePartnerAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()

  try {
    await apiPut<Partner>(`/admin/partners/${id}`, bodyFromForm(formData), token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update partner.' }
  }

  revalidatePath('/partners')
  redirect('/partners')
}

// Soft delete — the API sets is_active to false, so the partner drops out of
// the (active-only) list but the record survives.
export async function deletePartnerAction(id: string) {
  const token = await requireToken()
  await apiDelete(`/admin/partners/${id}`, token)
  revalidatePath('/partners')
  redirect('/partners')
}
