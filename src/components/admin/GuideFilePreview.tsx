'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { openGuideFileAction } from '@/app/(dashboard)/guide-applications/actions'

type State = { kind: 'loading' } | { kind: 'ready'; url: string } | { kind: 'error' }

// Thumbnail for a jpeg/png guide document. The short-lived signed URL is
// fetched through a server action on mount (never put in logs or the page
// source) and shown in an <img>; clicking opens a modal <dialog> lightbox.
// <dialog>.showModal gives Esc-to-close, a focus trap and focus return to the
// thumbnail button for free; a click on the backdrop closes it too.
export function GuideFilePreview({ id, fileId, label }: { id: string; fileId: string; label: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const dialogRef = useRef<HTMLDialogElement>(null)

  const load = useCallback(async () => {
    setState({ kind: 'loading' })
    try {
      const { url } = await openGuideFileAction(id, fileId, 'inline')
      setState({ kind: 'ready', url })
    } catch {
      setState({ kind: 'error' })
    }
  }, [id, fileId])

  useEffect(() => {
    // Fetching on mount is the point; the state updates happen after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  if (state.kind === 'loading') {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-hairline bg-hairline-soft text-[10px] text-muted"
        role="status"
        aria-label={`Loading preview of ${label}`}
      >
        …
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="flex w-24 shrink-0 flex-col items-start gap-1">
        <span className="text-[11px] text-muted">Preview unavailable</span>
        <button type="button" onClick={() => void load()} className="text-[11px] font-semibold text-body underline">
          Reload preview
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`Enlarge ${label}`}
        className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-hairline"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not optimizable */}
        <img src={state.url} alt={label} onError={() => setState({ kind: 'error' })} className="h-full w-full object-cover" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label={label}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close()
        }}
        className="m-auto max-h-[90vh] max-w-[90vw] rounded-md bg-panel p-2 backdrop:bg-black/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not optimizable */}
        <img src={state.url} alt={label} className="max-h-[85vh] max-w-[85vw] object-contain" />
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="mt-2 h-8 rounded-md border border-hairline px-3 text-xs font-semibold text-body hover:bg-hairline-soft"
        >
          Close
        </button>
      </dialog>
    </>
  )
}
