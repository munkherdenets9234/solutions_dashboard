'use client'

import { useActionState } from 'react'
import type { ResetPasswordState } from '@/app/(dashboard)/staff/actions'

export function ResetPasswordButton({
  action,
}: {
  action: (prevState: ResetPasswordState, formData: FormData) => Promise<ResetPasswordState>
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <div>
      <form action={formAction}>
        <button type="submit" disabled={pending} className="text-xs font-semibold text-body hover:underline disabled:opacity-60">
          {pending ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
      {state.password ? (
        <p className="text-[11px] font-mono mt-1 bg-status-pending-bg rounded px-2 py-1">{state.password}</p>
      ) : null}
      {state.error ? <p className="text-[11px] text-status-cancelled-text mt-1">{state.error}</p> : null}
    </div>
  )
}
