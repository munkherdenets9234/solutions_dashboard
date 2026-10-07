'use client'

import { useState, useTransition } from 'react'
import { retryMailAction } from '@/app/(dashboard)/mail-log/actions'
import { secondaryButtonClass } from './form'

export function RetryMailButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function retry() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await retryMailAction(id)
        if (res.error) setError(res.error)
      } catch {
        setError('Could not retry. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={retry} disabled={pending} className={`${secondaryButtonClass} h-7 px-2.5 text-xs disabled:opacity-60`}>
        {pending ? 'Retrying…' : 'Retry'}
      </button>
      {error ? <span className="text-[11px] font-medium text-status-cancelled-text">{error}</span> : null}
    </div>
  )
}
