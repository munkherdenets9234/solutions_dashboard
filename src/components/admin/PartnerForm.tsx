'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import type { Partner, PartnerProduct } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/partners/actions'
import type { RefOption } from '@/lib/data/reviews'
import { inputClass, textareaClass, labelClass, buttonClass, secondaryButtonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'
import { RefSelect } from './RefSelect'

export function PartnerForm({
  action,
  defaultValues,
  submitLabel,
  isEdit,
  reviewOptions,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Partner>
  submitLabel: string
  isEdit?: boolean
  reviewOptions: RefOption[]
}) {
  const [state, formAction, pending] = useActionState(action, {})
  // Rows carry a stable client-side key (not index) because ImageUploadField
  // is uncontrolled after mount — an index key would let a removed row's
  // upload state "stick" to whichever row shifts into its position.
  const [products, setProducts] = useState<(PartnerProduct & { key: string })[]>(
    () => (defaultValues?.products ?? []).map((p) => ({ ...p, key: crypto.randomUUID() }))
  )

  function updateProduct(key: string, patch: Partial<PartnerProduct>) {
    setProducts(products.map((p) => (p.key === key ? { ...p, ...patch } : p)))
  }

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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="tag">
            Tag
          </label>
          <input id="tag" name="tag" placeholder="accommodation, dining…" defaultValue={defaultValues?.tag} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input id="title" name="title" defaultValue={defaultValues?.title} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" rows={4} defaultValue={defaultValues?.description} className={textareaClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="web_url">
            Website URL
          </label>
          <input id="web_url" name="web_url" type="url" placeholder="https://…" defaultValue={defaultValues?.web_url} className={inputClass} />
        </div>
        <RefSelect
          id="related_review"
          name="related_review"
          label="Featured review"
          options={reviewOptions}
          defaultValue={defaultValues?.related_review}
        />
      </div>

      <ImageUploadField name="image_url" label="Image" defaultValue={defaultValues?.image} />

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Products</span>
        {products.map((product, index) => (
          <div key={product.key} className="flex flex-col gap-3 border border-hairline rounded-md p-3">
            <input
              name="product_name"
              placeholder="Product name"
              value={product.name}
              onChange={(e) => updateProduct(product.key, { name: e.target.value })}
              className={inputClass}
              aria-label={`Product ${index + 1} name`}
            />
            <ImageUploadField name="product_image" label={`Product ${index + 1} image`} defaultValue={product.image} />
            <div className="flex gap-3">
              <input
                name="product_description"
                placeholder="Description"
                value={product.description ?? ''}
                onChange={(e) => updateProduct(product.key, { description: e.target.value })}
                className={inputClass}
                aria-label={`Product ${index + 1} description`}
              />
              <button
                type="button"
                onClick={() => setProducts(products.filter((p) => p.key !== product.key))}
                className={secondaryButtonClass}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div>
          <button
            type="button"
            onClick={() => setProducts([...products, { name: '', key: crypto.randomUUID() }])}
            className={secondaryButtonClass}
          >
            + Add product
          </button>
        </div>
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
