'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPut, apiDelete, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { Destination, Departure, ItineraryDay, Image, LocaleMap, LocaleListMap } from '@/lib/types'

export interface FormState {
  error?: string
}

function listField(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
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

// Like localeField, but each locale's text block is split into a list
// (newline-delimited) — for Highlights/Activities/Inclusions/Exclusions.
function localeListField(formData: FormData, name: string): LocaleListMap {
  const raw = localeField(formData, name)
  const out: LocaleListMap = {}
  for (const locale of Object.keys(raw) as (keyof LocaleMap)[]) {
    const items = (raw[locale] ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (items.length) out[locale] = items
  }
  return out
}

function bodyFromForm(formData: FormData) {
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()

  const departures = (jsonField<Departure[]>(formData, 'departures_json') ?? []).map((d) => ({
    start_date: d.start_date ? new Date(d.start_date).toISOString() : undefined,
    end_date: d.end_date ? new Date(d.end_date).toISOString() : undefined,
    available: d.available,
  }))

  const prices = (
    jsonField<{ min_people: string; max_people: string; price_usd: string }[]>(formData, 'prices_json') ?? []
  ).map((p) => ({
    min_people: Number(p.min_people) || 0,
    max_people: Number(p.max_people) || 0,
    price_usd: Number(p.price_usd) || 0,
  }))

  const images = (jsonField<Image[]>(formData, 'images_json') ?? []).map((img) => ({
    url: img.url,
    caption: img.caption || undefined,
  }))

  return {
    name: String(formData.get('name') ?? ''),
    overview: localeField(formData, 'overview'),
    region: String(formData.get('region') ?? ''),
    duration_days: Number(formData.get('duration_days') ?? 0) || undefined,
    featured: formData.get('featured') === 'on',
    is_active: formData.get('is_active') === 'on',
    categories: listField(formData, 'categories'),
    tags: listField(formData, 'tags'),
    best_seasons: listField(formData, 'best_seasons'),
    highlights: localeListField(formData, 'highlights'),
    activities: localeListField(formData, 'activities'),
    inclusions: localeListField(formData, 'inclusions'),
    exclusions: localeListField(formData, 'exclusions'),
    accommodation: localeField(formData, 'accommodation'),
    meal_plan: localeField(formData, 'meal_plan'),
    difficulty: localeField(formData, 'difficulty'),
    departures,
    itinerary: jsonField<ItineraryDay[]>(formData, 'itinerary_json') ?? [],
    cover_image: coverImageUrl ? { url: coverImageUrl } : undefined,
    prices,
    images,
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
