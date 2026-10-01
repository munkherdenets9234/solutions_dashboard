'use server'

import { revalidatePath } from 'next/cache'
import { apiPut, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { TranslationEntry } from '@/lib/types'

export interface TranslationsFormState {
  error?: string
  saved?: number
}

export async function saveTranslationsAction(
  page: string,
  _prevState: TranslationsFormState,
  formData: FormData
): Promise<TranslationsFormState> {
  const token = await requireToken()

  let entries: TranslationEntry[]
  try {
    const parsed: unknown = JSON.parse(String(formData.get('entries') ?? ''))
    if (!Array.isArray(parsed)) return { error: 'The wording could not be read. Reload the page and try again.' }
    entries = parsed as TranslationEntry[]
  } catch {
    return { error: 'The wording could not be read. Reload the page and try again.' }
  }

  try {
    const res = await apiPut<{ saved: boolean; entries: number }>(
      '/admin/translations/' + encodeURIComponent(page),
      { entries },
      token
    )
    revalidatePath('/translations')
    revalidatePath('/translations/' + page)
    return { saved: res.data.entries }
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to save the wording.' }
  }
}
