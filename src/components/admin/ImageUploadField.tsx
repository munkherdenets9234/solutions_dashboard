'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadImageAction } from '@/lib/uploads'
import { inputClass, labelClass } from './form'

export function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.set('file', file)

    startTransition(async () => {
      const result = await uploadImageAction(formData)
      if (result.error) setError(result.error)
      else if (result.url) setUrl(result.url)
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          <Image
            src={url}
            alt=""
            width={56}
            height={56}
            className="rounded-md object-cover border border-hairline shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-14 h-14 rounded-md border border-dashed border-input-border shrink-0" />
        )}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={isPending} className="text-xs" />
          <input
            type="text"
            placeholder="or paste an image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`${inputClass} text-xs hidden`}
          />
        </div>
      </div>
      {isPending ? <p className="text-xs text-muted">Uploading…</p> : null}
      {error ? <p className="text-xs text-status-cancelled-text">{error}</p> : null}
    </div>
  )
}
