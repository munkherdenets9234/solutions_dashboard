'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

const DEFAULT_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function StatusActions({
  status,
  action,
  flow,
}: {
  status: string
  action: (status: string) => Promise<void>
  flow?: Record<string, string[]>
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const next = (flow ?? DEFAULT_FLOW)[status.toLowerCase()] ?? []

  if (next.length === 0) return null

  return (
    <div className="flex gap-2">
      {next.map((s) => (
        <button
          key={s}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await action(s)
              router.refresh()
            })
          }
          className="h-8 px-3 rounded-md border border-hairline text-xs font-semibold text-body hover:bg-hairline-soft disabled:opacity-60 capitalize"
        >
          Mark {s}
        </button>
      ))}
    </div>
  )
}
