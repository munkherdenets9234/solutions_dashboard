'use client'

import { useEffect } from 'react'
import { buttonClass } from '@/components/admin/form'

export default function DashboardError({
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
    <div className="border border-hairline rounded-[10px] bg-status-cancelled-bg p-5 flex flex-col gap-3 max-w-lg">
      <div>
        <div className="font-bold text-[15px] text-status-cancelled-text">Something went wrong</div>
        <p className="text-[13px] text-status-cancelled-text mt-1">
          This page failed to load{error.digest ? ` (ref: ${error.digest})` : ''}. The rest of the dashboard is
          still available from the sidebar.
        </p>
      </div>
      <button onClick={() => unstable_retry()} className={`${buttonClass} self-start`}>
        Try again
      </button>
    </div>
  )
}
