'use client'

import { useEffect, useState } from 'react'
import { inputClass, labelClass } from './form'

const MAX_AVATAR_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png']

// Fields for creating a customer inline. Names are prefixed `customer_` so they
// cannot clash with the review's own fields; the server action reads them.
// Client-side checks are convenience only — the server validates again.
export function NewCustomerFields() {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setFileError(null)
    setPreview(null)
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setFileError('Only JPEG or PNG images are accepted.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFileError('Image must be under 10 MB.')
      e.target.value = ''
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  return (
    <fieldset className="grid grid-cols-2 gap-4 rounded-md border border-hairline p-4">
      <legend className="px-1 text-xs font-semibold text-muted">New customer</legend>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="customer_name">
          Name
        </label>
        <input id="customer_name" name="customer_name" required maxLength={200} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="customer_email">
          Email
        </label>
        <input id="customer_email" name="customer_email" type="email" required maxLength={254} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="customer_phone">
          Phone
        </label>
        <input id="customer_phone" name="customer_phone" maxLength={50} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="customer_nationality">
          Nationality
        </label>
        <input id="customer_nationality" name="customer_nationality" maxLength={100} className={inputClass} />
      </div>
      <div className="col-span-2 flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="customer_avatar">
          Photo (JPEG or PNG, optional)
        </label>
        <input
          id="customer_avatar"
          name="customer_avatar"
          type="file"
          accept="image/jpeg,image/png"
          onChange={onFile}
          className="text-sm"
        />
        {fileError ? <p className="text-xs font-medium text-status-cancelled-text">{fileError}</p> : null}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable
          <img src={preview} alt="Selected customer photo preview" className="mt-1 h-20 w-20 rounded-full object-cover" />
        ) : null}
      </div>
    </fieldset>
  )
}
