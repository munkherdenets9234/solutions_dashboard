'use client'

import { useState, useTransition } from 'react'
import { openSignedLink } from '@/lib/open-signed-link.mjs'
import { isPreviewableMime } from '@/lib/guide-files.mjs'
import { openGuideFileAction } from '@/app/(dashboard)/guide-applications/actions'
import { GuideFilePreview } from './GuideFilePreview'
import { buttonClass, secondaryButtonClass } from './form'

interface Props {
  id: string
  fileId: string
  label: string
  name: string
  size: string
  mime: string
  // The CV is the document reviewers want most, so its Download is primary.
  primary?: boolean
}

export function GuideFileLink({ id, fileId, label, name, size, mime, primary }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function download() {
    setError(null)
    startTransition(async () => {
      try {
        const { url } = await openGuideFileAction(id, fileId, 'attachment')
        if (openSignedLink(url, (u, t) => window.open(u, t)) === 'blocked') setError('Your browser blocked the new tab. Allow pop-ups for this site and try again.')
      } catch {
        setError('Could not open this file. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-full items-center gap-3 rounded-md border border-hairline px-3 py-2 text-sm">
        {isPreviewableMime(mime) ? (
          <GuideFilePreview id={id} fileId={fileId} label={`${label} — ${name}`} />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-hairline bg-hairline-soft text-[11px] font-semibold text-muted"
            aria-hidden="true"
          >
            {mime.toLowerCase().includes('pdf') ? 'PDF' : 'FILE'}
          </div>
        )}
        <span className="min-w-0 flex-1">
          <span className="font-semibold">{label}</span>
          <span className="text-muted"> · </span>
          <span className="break-all">{name}</span>
          <span className="block text-xs text-muted">{size}</span>
        </span>
        <button
          type="button"
          onClick={download}
          disabled={pending}
          className={`${primary ? buttonClass : secondaryButtonClass} shrink-0 disabled:opacity-60`}
        >
          {pending ? 'Opening…' : 'Download'}
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-status-cancelled-text">{error}</p> : null}
    </div>
  )
}
