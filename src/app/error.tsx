'use client'

import { useEffect } from 'react'
import { buttonClass } from '@/components/admin/form'

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm border border-hairline rounded-[10px] bg-status-cancelled-bg p-6 flex flex-col gap-3">
        <div>
          <div className="font-bold text-[15px] text-status-cancelled-text">Something went wrong</div>
          <p className="text-[13px] text-status-cancelled-text mt-1">
            {error.digest ? `Reference: ${error.digest}` : 'Please try again.'}
          </p>
        </div>
        <button onClick={() => unstable_retry()} className={`${buttonClass} self-start`}>
          Try again
        </button>
      </div>
    </main>
  )
}
