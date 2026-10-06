'use client'

import { useState, useTransition } from 'react'
import { addGuideNoteAction } from '@/app/(dashboard)/guide-applications/actions'
import { buttonClass, errorClass, labelClass, textareaClass } from './form'

const MAX_NOTE = 2000

export function GuideNoteForm({ id }: { id: string }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const count = [...text].length
  const tooLong = count > MAX_NOTE
  const blank = text.trim().length === 0

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blank || tooLong || pending) return
    setError(null)
    startTransition(async () => {
      try {
        await addGuideNoteAction(id, text.trim())
        setText('')
      } catch {
        setError('Could not save the note. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <label className={labelClass} htmlFor="guide-note">
        Add a note
      </label>
      <textarea
        id="guide-note"
        value={text}
        rows={3}
        onChange={(e) => setText(e.target.value)}
        className={textareaClass}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={tooLong ? 'text-[11px] font-semibold text-status-cancelled-text' : 'text-[11px] text-muted'}>
          {count}/{MAX_NOTE}
        </span>
        <button type="submit" disabled={blank || tooLong || pending} className={buttonClass}>
          {pending ? 'Saving…' : 'Add note'}
        </button>
      </div>
      {error ? <p className={errorClass}>{error}</p> : null}
    </form>
  )
}
