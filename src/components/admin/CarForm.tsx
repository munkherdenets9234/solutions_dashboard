'use client'

import { useActionState, useState } from 'react'
import type { Car } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/cars/actions'
import { slugify } from '@/lib/slug'
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
  const [name, setName] = useState(defaultValues?.name ?? '')
  // Missing or empty stored modes mean both are offered.
  const storedModes = defaultValues?.rental_modes?.length ? defaultValues.rental_modes : ['with_driver', 'self_drive']
  const [selfDrive, setSelfDrive] = useState(storedModes.includes('self_drive'))

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        {!isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="slug-preview">
              Slug (auto-generated)
            </label>
            <input id="slug-preview" disabled value={slugify(name)} className={`${inputClass} opacity-60`} />
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

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>Rental modes</legend>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="rental_modes" value="with_driver" defaultChecked={storedModes.includes('with_driver')} />
          With driver
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            name="rental_modes"
            value="self_drive"
            checked={selfDrive}
            onChange={(e) => setSelfDrive(e.target.checked)}
          />
          Driverless
        </label>
      </fieldset>

      {selfDrive ? (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="self_drive_from">
              Driverless available from
            </label>
            <input
              id="self_drive_from"
              name="self_drive_from"
              type="date"
              defaultValue={defaultValues?.self_drive_from ?? ''}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="self_drive_to">
              Driverless available to
            </label>
            <input
              id="self_drive_to"
              name="self_drive_to"
              type="date"
              defaultValue={defaultValues?.self_drive_to ?? ''}
              className={inputClass}
            />
          </div>
        </div>
      ) : null}

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
