'use client'

import { useActionState } from 'react'
import type { Review } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/reviews/actions'
import type { RefOption } from '@/lib/data/reviews'
import { inputClass, labelClass, buttonClass, errorClass } from './form'
import { RefSelect } from './RefSelect'
import { MultiLangField } from './MultiLangField'

export function ReviewForm({
  action,
  defaultValues,
  submitLabel,
  customerOptions,
  tourOptions,
  partnerOptions,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Review>
  submitLabel: string
  customerOptions: RefOption[]
  tourOptions: RefOption[]
  partnerOptions: RefOption[]
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-1.5 max-w-[200px]">
        <label className={labelClass} htmlFor="star">
          Star rating (1–5)
        </label>
        <input
          id="star"
          name="star"
          type="number"
          min={1}
          max={5}
          required
          defaultValue={defaultValues?.star}
          className={inputClass}
        />
      </div>

      <MultiLangField name="review" label="Review" multiline rows={4} defaultValue={defaultValues?.review} />

      <div className="grid grid-cols-3 gap-4">
        <RefSelect
          id="related_customer"
          name="related_customer"
          label="Customer"
          options={customerOptions}
          defaultValue={defaultValues?.related_customer}
        />
        <RefSelect
          id="related_tour"
          name="related_tour"
          label="Tour"
          options={tourOptions}
          defaultValue={defaultValues?.related_tour}
        />
        <RefSelect
          id="related_partner"
          name="related_partner"
          label="Partner"
          options={partnerOptions}
          defaultValue={defaultValues?.related_partner}
        />
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
