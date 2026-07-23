'use server'

import { revalidatePath } from 'next/cache'
import { apiDelete } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'

// Unsubscribes/removes the subscriber — requires an admin-role Bearer token.
export async function deleteNewsletterSubscriberAction(id: string) {
  const token = await requireToken()
  await apiDelete(`/admin/newsletter/${id}`, token)
  revalidatePath('/newsletter')
}
