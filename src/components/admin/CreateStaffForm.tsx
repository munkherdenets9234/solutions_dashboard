'use client'

import { useActionState } from 'react'
import { createStaffAction } from '@/app/(dashboard)/staff/actions'
import { inputClass, labelClass, buttonClass, errorClass } from './form'

export function CreateStaffForm() {
  const [state, formAction, pending] = useActionState(createStaffAction, {})

  return (
    <form action={formAction} className="border border-hairline rounded-[10px] bg-panel p-4 flex items-end gap-3 flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" required className={`${inputClass} w-48`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className={`${inputClass} w-56`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="role">
          Role
        </label>
        <select id="role" name="role" defaultValue="staff" className={`${inputClass} w-32`}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Adding…' : '+ Add user'}
      </button>
      {state.error ? <p className={errorClass}>{state.error}</p> : null}
    </form>
  )
}
