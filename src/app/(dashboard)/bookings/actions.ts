'use server'

import { revalidatePath } from 'next/cache'
import { apiPut } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

export async function updateBookingStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPut(`/admin/bookings/${id}/status`, { status }, token)
  revalidatePath('/bookings')
  revalidatePath(`/bookings/${id}`)
}
