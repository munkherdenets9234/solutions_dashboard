'use server'

import { revalidatePath } from 'next/cache'
import { apiPut } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

export async function updateContactMessageStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPut(`/admin/contact-messages/${id}/status`, { status }, token)
  revalidatePath('/contact-messages')
}
