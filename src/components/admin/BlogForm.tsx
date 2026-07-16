'use client'

import { useActionState } from 'react'
import type { Blog } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/blog/actions'
import { inputClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'
import { MultiLangField } from './MultiLangField'
import { MultiLangRichTextEditor } from './MultiLangRichTextEditor'

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
      <MultiLangField name="title" label="Title" defaultValue={defaultValues?.title} />
      {!isEdit ? <p className="text-xs text-body">The URL slug will be generated automatically from the English title.</p> : null}

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

      <MultiLangField name="excerpt" label="Excerpt" multiline rows={3} defaultValue={defaultValues?.excerpt} />

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input id="tags" name="tags" defaultValue={defaultValues?.tags?.join(', ')} className={inputClass} />
      </div>

      <MultiLangRichTextEditor name="content" label="Content" defaultValue={defaultValues?.content} />

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
