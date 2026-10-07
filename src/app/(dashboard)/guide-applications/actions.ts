'use server'

import { revalidatePath } from 'next/cache'
import { apiPatch, apiPost } from '@/lib/api/client'
import { requireToken } from '@/lib/auth/session'
import { assertGuideId } from '@/lib/guide-ids.mjs'
import { guideFileLink, type GuideFileDisposition } from '@/lib/data/guide-applications'

export async function setGuideStatusAction(id: string, status: string) {
  const safeId = assertGuideId(id)
  const token = await requireToken()
  await apiPatch(`/admin/guide-applications/${safeId}/status`, { status }, token)
  revalidatePath('/guide-applications')
  revalidatePath(`/guide-applications/${safeId}`)
}

export async function addGuideNoteAction(id: string, text: string) {
  const safeId = assertGuideId(id)
  const token = await requireToken()
  await apiPost(`/admin/guide-applications/${safeId}/notes`, { text }, token)
  revalidatePath(`/guide-applications/${safeId}`)
}

// Returns the short-lived signed URL to the caller; never redirects.
// The URL is never logged.
export async function openGuideFileAction(
  id: string,
  fileId: string,
  disposition: GuideFileDisposition
): Promise<{ url: string }> {
  const safeId = assertGuideId(id)
  const safeFileId = assertGuideId(fileId)
  if (disposition !== 'inline' && disposition !== 'attachment') throw new Error('Invalid disposition')
  const token = await requireToken()
  const link = await guideFileLink(token, safeId, safeFileId, disposition)
  return { url: link.url }
}
