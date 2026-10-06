'use client'

import { useState, useTransition } from 'react'
import { openSignedLink } from '@/lib/open-signed-link.mjs'
import { openGuideFileAction } from '@/app/(dashboard)/guide-applications/actions'

interface Props {
  id: string
  fileId: string
  label: string
  name: string
  size: string
}

export function GuideFileLink({ id, fileId, label, name, size }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function open() {
    setError(null)
    startTransition(async () => {
      try {
        const { url } = await openGuideFileAction(id, fileId)
        if (openSignedLink(url, (u, t) => window.open(u, t)) === 'blocked') setError('Your browser blocked the new tab. Allow pop-ups for this site and try again.')
      } catch {
        setError('Could not open this file. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-hairline px-3 py-2 text-left text-sm hover:bg-hairline-soft disabled:opacity-60"
      >
        <span className="min-w-0">
          <span className="font-semibold">{label}</span>
          <span className="text-muted"> · </span>
          <span className="break-all">{name}</span>
        </span>
        <span className="shrink-0 text-xs text-muted">{pending ? 'Opening…' : size}</span>
      </button>
      {error ? <p className="text-xs font-medium text-status-cancelled-text">{error}</p> : null}
    </div>
  )
}
