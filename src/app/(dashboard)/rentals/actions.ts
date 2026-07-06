'use server'

import { revalidatePath } from 'next/cache'
import { apiPut } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

export async function updateRentalStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPut(`/admin/rentals/${id}/status`, { status }, token)
  revalidatePath('/rentals')
  revalidatePath(`/rentals/${id}`)
}
