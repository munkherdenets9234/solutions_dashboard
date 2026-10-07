'use server'

import { revalidatePath } from 'next/cache'
import { apiPost, apiPut, ApiError } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import type { TenantUser } from '@/lib/types'

export interface FormState {
  error?: string
}

export interface ResetPasswordState {
  password?: string
  error?: string
}

export async function createStaffAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const role = String(formData.get('role') ?? 'staff')

  if (!name || !email) return { error: 'Name and email are required.' }

  try {
    const receive_emails = formData.get('receive_emails') === 'on'
    await apiPost<TenantUser>('/admin/users', { name, email, role, receive_emails }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create user.' }
  }

  revalidatePath('/staff')
  return {}
}

export async function updateStaffStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPut(`/admin/users/${id}/status`, { status }, token)
  revalidatePath('/staff')
}

export async function setReceiveEmailsAction(id: string, receiveEmails: boolean): Promise<{ error?: string }> {
  const token = await requireToken()
  try {
    await apiPut(`/admin/users/${encodeURIComponent(id)}`, { receive_emails: receiveEmails }, token)
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update.' }
  }
  revalidatePath('/staff')
  return {}
}

export async function resetStaffPasswordAction(id: string): Promise<ResetPasswordState> {
  const token = await requireToken()
  try {
    const { data } = await apiPut<{ password?: string }>(`/admin/users/${id}/password`, { new_password: '' }, token)
    return { password: data.password }
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to reset password.' }
  }
}
