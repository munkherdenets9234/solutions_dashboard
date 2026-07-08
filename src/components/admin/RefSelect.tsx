'use client'

import type { RefOption } from '@/lib/data/reviews'
import { inputClass, labelClass } from './form'

// Dropdown for free-form reference fields. Falls back to a free-text input
// when there are no options to offer (e.g. a staff token can't list
// customers). A saved value that isn't in the options (legacy free-form
// entry) is kept selectable so editing doesn't silently clear it.
export function RefSelect({
  id,
  name,
  label,
  options,
  defaultValue,
}: {
  id: string
  name: string
  label: string
  options: RefOption[]
  defaultValue?: string
}) {
  const legacyValue = defaultValue && !options.some((o) => o.value === defaultValue) ? defaultValue : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {options.length === 0 && !legacyValue ? (
        <input id={id} name={name} defaultValue={defaultValue} className={inputClass} />
      ) : (
        <select id={id} name={name} defaultValue={defaultValue ?? ''} className={inputClass}>
          <option value="">—</option>
          {legacyValue ? <option value={legacyValue}>{legacyValue}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
