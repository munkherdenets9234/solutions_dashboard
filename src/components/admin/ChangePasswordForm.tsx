'use client'

import { useActionState } from 'react'
import { changePasswordAction } from '@/app/(dashboard)/settings/actions'
import { inputClass, labelClass, buttonClass, errorClass } from './form'

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="current_password">
          Current password
        </label>
        <input id="current_password" name="current_password" type="password" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="new_password">
          New password
        </label>
        <input id="new_password" name="new_password" type="password" required minLength={8} className={inputClass} />
      </div>

      {state.error ? <p className={errorClass}>{state.error}</p> : null}
      {state.success ? (
        <p className="text-xs font-medium text-status-success-text bg-status-success-bg rounded-md px-3 py-2">
          Password updated.
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  )
}
