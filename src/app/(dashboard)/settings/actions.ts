'use server'

import { apiPut, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

export interface FormState {
  error?: string
  success?: boolean
}

export async function changePasswordAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const current_password = String(formData.get('current_password') ?? '')
  const new_password = String(formData.get('new_password') ?? '')

  if (new_password.length < 8) {
    return { error: 'New password must be at least 8 characters.' }
  }

  try {
    await apiPut('/account/password', { current_password, new_password }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to change password.' }
  }

  return { success: true }
}
