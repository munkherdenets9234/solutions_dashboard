'use server'

import { revalidatePath } from 'next/cache'
import { apiPost, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { assertGuideId } from '@/lib/guide-ids.mjs'

// Resets a failed row so the worker picks it up again. Admin role only; the
// backend enforces that and a non-failed row is refused.
export async function retryMailAction(id: string): Promise<{ error?: string }> {
  const safeId = assertGuideId(id)
  const token = await requireToken()
  try {
    await apiPost(`/admin/mail-outbox/${safeId}/retry`, {}, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Could not retry. Please try again.' }
  }
  revalidatePath('/mail-log')
  return {}
}
