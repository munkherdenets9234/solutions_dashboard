'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadImageAction } from '@/lib/uploads'
import { inputClass, labelClass } from './form'

export interface GalleryImageInput {
  url: string
  caption: string
}

export function GalleryUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: GalleryImageInput[]
}) {
  const [images, setImages] = useState<GalleryImageInput[]>(defaultValue ?? [])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    setError(null)
    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData()
        formData.set('file', file)
        const result = await uploadImageAction(formData)
        if (result.error) setError(result.error)
        else if (result.url) setImages((prev) => [...prev, { url: result.url!, caption: '' }])
      }
    })
  }

  function updateCaption(i: number, caption: string) {
    setImages((prev) => prev.map((img, idx) => (idx === i ? { ...img, caption } : img)))
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(images)} readOnly />
      <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={isPending} className="text-xs" />
      {isPending ? <p className="text-xs text-muted">Uploading…</p> : null}
      {error ? <p className="text-xs text-status-cancelled-text">{error}</p> : null}
      {images.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 mt-1">
          {images.map((img, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="relative">
                <Image
                  src={img.url}
                  alt=""
                  width={100}
                  height={100}
                  className="rounded-md object-cover border border-hairline w-full h-[100px]"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 flex items-center justify-center bg-ink/80 text-ink-contrast rounded-full w-5 h-5 text-xs leading-none"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Caption"
                value={img.caption}
                onChange={(e) => updateCaption(i, e.target.value)}
                className={`${inputClass} text-xs`}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
