'use client'

import { useActionState } from 'react'
import type { Destination } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/tours/actions'
import { inputClass, textareaClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'

export function DestinationForm({
  action,
  defaultValues,
  submitLabel,
  isEdit,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Destination>
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
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="region">
              Region
            </label>
            <input id="region" name="region" defaultValue={defaultValues?.region} className={inputClass} />
          </div>
        )}
      </div>

      {!isEdit ? (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="region">
            Region
          </label>
          <input id="region" name="region" defaultValue={defaultValues?.region} className={inputClass} />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="overview">
          Overview
        </label>
        <textarea id="overview" name="overview" rows={3} defaultValue={defaultValues?.overview} className={textareaClass} />
      </div>

      <div className="flex flex-col gap-1.5 max-w-[200px]">
        <label className={labelClass} htmlFor="duration_days">
          Duration (days)
        </label>
        <input
          id="duration_days"
          name="duration_days"
          type="number"
          min={1}
          defaultValue={defaultValues?.duration_days}
          className={inputClass}
        />
      </div>

      <ImageUploadField name="cover_image_url" label="Cover image" defaultValue={defaultValues?.cover_image?.url} />

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="categories">
            Categories (comma-separated)
          </label>
          <input
            id="categories"
            name="categories"
            defaultValue={defaultValues?.categories?.join(', ')}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input id="tags" name="tags" defaultValue={defaultValues?.tags?.join(', ')} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="best_seasons">
            Best seasons (comma-separated)
          </label>
          <input
            id="best_seasons"
            name="best_seasons"
            defaultValue={defaultValues?.best_seasons?.join(', ')}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-body">
          <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} />
          Featured
        </label>
        {isEdit ? (
          <label className="flex items-center gap-2 text-sm font-medium text-body">
            <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true} />
            Active
          </label>
        ) : null}
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
