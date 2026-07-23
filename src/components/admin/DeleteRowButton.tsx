'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteRowButton({
  action,
  confirmMessage = 'Are you sure you want to delete this?',
}: {
  action: () => Promise<void>
  confirmMessage?: string
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return
        startTransition(async () => {
          await action()
          router.refresh()
        })
      }}
      className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold text-body hover:bg-hairline-soft disabled:opacity-60"
    >
      Delete
    </button>
  )
}
