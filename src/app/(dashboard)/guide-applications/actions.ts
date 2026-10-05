'use server'

import { revalidatePath } from 'next/cache'
import { apiPatch, apiPost } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { guideFileLink } from '@/lib/data/guide-applications'

export async function setGuideStatusAction(id: string, status: string) {
  const token = await requireToken()
  await apiPatch(`/admin/guide-applications/${encodeURIComponent(id)}/status`, { status }, token)
  revalidatePath('/guide-applications')
  revalidatePath(`/guide-applications/${id}`)
}

export async function addGuideNoteAction(id: string, text: string) {
  const token = await requireToken()
  await apiPost(`/admin/guide-applications/${encodeURIComponent(id)}/notes`, { text }, token)
  revalidatePath(`/guide-applications/${id}`)
}

// Returns the short-lived signed URL to the caller; never redirects.
export async function openGuideFileAction(id: string, fileId: string): Promise<{ url: string }> {
  const token = await requireToken()
  const link = await guideFileLink(token, id, fileId)
  return { url: link.url }
}
