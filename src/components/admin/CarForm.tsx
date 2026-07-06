'use client'

import { useActionState } from 'react'
import type { Car } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/cars/actions'
import { inputClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'

export function CarForm({
  action,
  defaultValues,
  submitLabel,
  isEdit,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Car>
  submitLabel: string
  isEdit?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
        </div>
        {!isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="slug">
              Slug
            </label>
            <input id="slug" name="slug" required defaultValue={defaultValues?.slug} className={inputClass} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <input id="type" name="type" placeholder="4x4, sedan, van…" defaultValue={defaultValues?.type} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="fuel">
            Fuel
          </label>
          <input id="fuel" name="fuel" placeholder="diesel, petrol…" defaultValue={defaultValues?.fuel} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="seats">
            Seats
          </label>
          <input id="seats" name="seats" type="number" min={1} defaultValue={defaultValues?.seats} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-w-[200px]">
        <label className={labelClass} htmlFor="price_per_day_usd">
          Price per day (USD)
        </label>
        <input
          id="price_per_day_usd"
          name="price_per_day_usd"
          type="number"
          min={0}
          defaultValue={defaultValues?.price_per_day_usd}
          className={inputClass}
        />
      </div>

      <ImageUploadField name="cover_image_url" label="Cover image" defaultValue={defaultValues?.cover_image?.url} />

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input id="tags" name="tags" defaultValue={defaultValues?.tags?.join(', ')} className={inputClass} />
      </div>

      {state.error ? <p className={errorClass}>{state.error}</p> : null}

      <div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
