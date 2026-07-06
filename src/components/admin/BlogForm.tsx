'use client'

import { useActionState } from 'react'
import type { Blog } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/blog/actions'
import { inputClass, textareaClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'

export function BlogForm({
  action,
  defaultValues,
  submitLabel,
  isEdit,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Blog>
  submitLabel: string
  isEdit?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input id="title" name="title" required defaultValue={defaultValues?.title} className={inputClass} />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <input id="category" name="category" defaultValue={defaultValues?.category} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="read_time">
            Read time (minutes)
          </label>
          <input
            id="read_time"
            name="read_time"
            type="number"
            min={1}
            defaultValue={defaultValues?.read_time}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="excerpt">
          Excerpt
        </label>
        <textarea id="excerpt" name="excerpt" rows={3} defaultValue={defaultValues?.excerpt} className={textareaClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input id="tags" name="tags" defaultValue={defaultValues?.tags?.join(', ')} className={inputClass} />
      </div>

      <ImageUploadField name="cover_image_url" label="Cover image" defaultValue={defaultValues?.cover_image?.url} />

      <label className="flex items-center gap-2 text-sm font-medium text-body">
        <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} />
        Featured
      </label>

      {state.error ? <p className={errorClass}>{state.error}</p> : null}

      <div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
