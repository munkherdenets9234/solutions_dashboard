'use server'

import { v2 as cloudinary } from 'cloudinary'
import { requireToken } from '@/lib/auth/session'

// Reuses the same Cloudinary account (via CLOUDINARY_URL) that already hosts
// existing destination/car/blog cover images. Credentials stay server-side —
// the browser only ever sees the resulting secure_url.
cloudinary.config({ secure: true })

const MAX_BYTES = 10 * 1024 * 1024

export interface UploadResult {
  url?: string
  error?: string
}

export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  await requireToken()

  if (!process.env.CLOUDINARY_URL) {
    return { error: 'CLOUDINARY_URL is not configured on the server.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file provided.' }
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are supported.' }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Images must be under 10MB.' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'travel-mongolia-admin' })
    return { url: result.secure_url }
  } catch {
    return { error: 'Upload failed. Please try again.' }
  }
}
