'use server'

import { revalidatePath } from 'next/cache'
import { apiPut } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

export async function updateTransferStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPut(`/admin/airport-transfers/${id}/status`, { status }, token)
  revalidatePath('/airport-transfers')
  revalidatePath(`/airport-transfers/${id}`)
}
