'use client'

import { useActionState, useState } from 'react'
import type { Review } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/reviews/actions'
import type { RefOption } from '@/lib/data/reviews'
import { inputClass, labelClass, buttonClass, errorClass } from './form'
import { RefSelect } from './RefSelect'
import { MultiLangField } from './MultiLangField'
import { NewCustomerFields } from './NewCustomerFields'

export function ReviewForm({
  action,
  defaultValues,
  submitLabel,
  customerOptions,
  tourOptions,
  allowNewCustomer = false,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Review>
  submitLabel: string
  customerOptions: RefOption[]
  tourOptions: RefOption[]
  // Only the create page offers inline customer creation.
  allowNewCustomer?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const [addNew, setAddNew] = useState(false)

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

      <div className="grid grid-cols-2 gap-4">
        {addNew ? (
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Customer</span>
            <p className="text-sm text-body">A new customer will be created with this review.</p>
          </div>
        ) : (
          <RefSelect
            id="related_customer"
            name="related_customer"
            label="Customer"
            options={customerOptions}
            defaultValue={defaultValues?.related_customer}
          />
        )}
        <RefSelect
          id="related_tour"
          name="related_tour"
          label="Tour"
          options={tourOptions}
          defaultValue={defaultValues?.related_tour}
        />
      </div>

      {allowNewCustomer ? (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-body">
            <input
              type="checkbox"
              name="new_customer"
              value="1"
              className="h-4 w-4"
              checked={addNew}
              onChange={(e) => setAddNew(e.target.checked)}
            />
            Add new customer
          </label>
          {addNew ? <NewCustomerFields /> : null}
        </div>
      ) : null}

      {state.error ? <p className={errorClass}>{state.error}</p> : null}

      <div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
