'use client'

import { useState, useTransition } from 'react'
import { setReceiveEmailsAction } from '@/app/(dashboard)/staff/actions'

export function ReceiveEmailsToggle({ id, name, initial }: { id: string; name: string; initial: boolean }) {
  const [checked, setChecked] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(next: boolean) {
    const previous = checked
    setChecked(next)
    setError(null)
    startTransition(async () => {
      try {
        const res = await setReceiveEmailsAction(id, next)
        if (res.error) {
          setChecked(previous)
          setError(res.error)
        }
      } catch {
        setChecked(previous)
        setError('Could not save. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        disabled={pending}
        aria-label={`${name} receives request emails`}
        onChange={(e) => onChange(e.target.checked)}
      />
      {error ? <span className="text-[11px] font-medium text-status-cancelled-text">{error}</span> : null}
    </div>
  )
}
