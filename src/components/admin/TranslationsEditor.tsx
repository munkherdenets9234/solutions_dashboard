'use client'

import { useActionState, useMemo, useState } from 'react'
import type { TranslationsFormState } from '@/app/(dashboard)/translations/actions'
import { LOCALES, type Locale, type TranslationEntry, type TranslationValue } from '@/lib/types'
import { inputClass, textareaClass, labelClass, buttonClass, secondaryButtonClass, errorClass } from './form'

type Kind = 'string' | 'strings' | 'objects'
type Values = Partial<Record<Locale, TranslationValue>>
type Item = Record<string, string>

const localeLabel: Record<Locale, string> = { en: 'EN', mn: 'MN', ko: 'KO' }

// Mirrors the server limits so an over-size payload is refused here with a
// message instead of failing at the transport.
const MAX_ENTRIES = 1000
const MAX_BODY_BYTES = 512 * 1024

function kindOf(value: TranslationValue | undefined): Kind | undefined {
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value) && value.length > 0) return typeof value[0] === 'string' ? 'strings' : 'objects'
  return undefined
}

// An entry's shape is set by the first language that has a non-empty value.
function entryKind(values: Values): Kind {
  for (const locale of LOCALES) {
    const k = kindOf(values[locale])
    if (k) return k
  }
  return 'string'
}

// Keys of an object list come from the first item that exists in any language.
function entryKeys(values: Values): string[] {
  for (const locale of LOCALES) {
    const v = values[locale]
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return Object.keys(v[0])
  }
  return []
}

function asStrings(v: TranslationValue | undefined): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function asItems(v: TranslationValue | undefined): Item[] {
  return Array.isArray(v) ? v.filter((x): x is Item => typeof x === 'object' && x !== null) : []
}

// Returns the value to send, or undefined when the language is blank (the
// server drops blank languages, so they are simply not sent).
function cleanValue(kind: Kind, v: TranslationValue | undefined): TranslationValue | undefined {
  if (kind === 'string') {
    return typeof v === 'string' && v.trim() !== '' ? v : undefined
  }
  if (kind === 'strings') {
    const items = asStrings(v).filter((s) => s.trim() !== '')
    return items.length > 0 ? items : undefined
  }
  const items = asItems(v).filter((it) => Object.values(it).some((s) => String(s).trim() !== ''))
  return items.length > 0 ? items : undefined
}

function serialize(entries: TranslationEntry[], kinds: Kind[]): TranslationEntry[] {
  const out: TranslationEntry[] = []
  entries.forEach((entry, i) => {
    const values: Values = {}
    for (const locale of LOCALES) {
      const v = cleanValue(kinds[i], entry.values[locale])
      if (v !== undefined) values[locale] = v
    }
    if (Object.keys(values).length > 0) out.push({ path: entry.path, values })
  })
  return out
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

const smallButton = 'text-xs font-semibold text-body hover:underline disabled:opacity-30 disabled:no-underline'

function StringListCell({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <textarea
            rows={2}
            value={item}
            onChange={(e) => onChange(items.map((s, idx) => (idx === i ? e.target.value : s)))}
            className={textareaClass}
          />
          <div className="flex flex-col gap-0.5 pt-0.5">
            <button type="button" className={smallButton} disabled={i === 0} onClick={() => onChange(move(items, i, -1))} aria-label="Move up">
              ↑
            </button>
            <button type="button" className={smallButton} disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} aria-label="Move down">
              ↓
            </button>
            <button type="button" className="text-xs text-status-cancelled-text" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="Remove">
              ✕
            </button>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className={secondaryButtonClass} onClick={() => onChange([...items, ''])}>
          + Add item
        </button>
      </div>
    </div>
  )
}

function ObjectListCell({ items, keys, onChange }: { items: Item[]; keys: string[]; onChange: (items: Item[]) => void }) {
  function update(i: number, key: string, value: string) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)))
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1.5 border border-hairline rounded-md p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-muted">#{i + 1}</span>
            <div className="flex gap-2">
              <button type="button" className={smallButton} disabled={i === 0} onClick={() => onChange(move(items, i, -1))}>
                ↑
              </button>
              <button type="button" className={smallButton} disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}>
                ↓
              </button>
              <button type="button" className="text-xs text-status-cancelled-text" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                Remove
              </button>
            </div>
          </div>
          {keys.map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className={labelClass}>{key}</span>
              <input type="text" value={item[key] ?? ''} onChange={(e) => update(i, key, e.target.value)} className={inputClass} />
            </label>
          ))}
        </div>
      ))}
      <div>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onChange([...items, Object.fromEntries(keys.map((k) => [k, '']))])}
        >
          + Add item
        </button>
      </div>
    </div>
  )
}

export function TranslationsEditor({
  action,
  initialEntries,
}: {
  action: (prev: TranslationsFormState, formData: FormData) => Promise<TranslationsFormState>
  initialEntries: TranslationEntry[]
}) {
  const [entries, setEntries] = useState<TranslationEntry[]>(initialEntries)
  const [state, formAction, pending] = useActionState(action, {})

  // Shapes are fixed from what was loaded, so clearing a field never changes
  // which editor the row uses.
  const kinds = useMemo(() => initialEntries.map((e) => entryKind(e.values)), [initialEntries])
  const keys = useMemo(() => initialEntries.map((e) => entryKeys(e.values)), [initialEntries])

  function setValue(i: number, locale: Locale, value: TranslationValue) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, values: { ...e.values, [locale]: value } } : e)))
  }

  const json = JSON.stringify(serialize(entries, kinds))
  const tooMany = entries.length > MAX_ENTRIES
  const tooBig = new Blob([json]).size > MAX_BODY_BYTES
  const blocked = tooMany || tooBig

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="entries" value={json} readOnly />

      <div className="hidden md:grid grid-cols-[180px_repeat(3,minmax(0,1fr))] gap-3 px-1">
        <span />
        {LOCALES.map((locale) => (
          <span key={locale} className="text-[10.5px] font-semibold text-muted uppercase tracking-wider">
            {localeLabel[locale]}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <div
            key={entry.path}
            className="grid grid-cols-1 md:grid-cols-[180px_repeat(3,minmax(0,1fr))] gap-3 border border-hairline rounded-[10px] bg-panel p-3"
          >
            <div className="text-xs font-semibold text-body break-all pt-1">{entry.path}</div>
            {LOCALES.map((locale) => {
              const v = entry.values[locale]
              return (
                <div key={locale} className="flex flex-col gap-1 min-w-0">
                  <span className="md:hidden text-[11px] font-semibold text-muted uppercase">{localeLabel[locale]}</span>
                  {kinds[i] === 'string' ? (
                    <textarea
                      rows={3}
                      value={typeof v === 'string' ? v : ''}
                      onChange={(e) => setValue(i, locale, e.target.value)}
                      className={textareaClass}
                    />
                  ) : kinds[i] === 'strings' ? (
                    <StringListCell items={asStrings(v)} onChange={(items) => setValue(i, locale, items)} />
                  ) : (
                    <ObjectListCell items={asItems(v)} keys={keys[i]} onChange={(items) => setValue(i, locale, items)} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {tooMany ? <p className={errorClass}>A page can hold at most {MAX_ENTRIES} entries.</p> : null}
      {tooBig && !tooMany ? <p className={errorClass}>This page is too large to save (limit 512 KB). Shorten some wording.</p> : null}
      {state.error ? <p className={errorClass}>{state.error}</p> : null}
      {state.saved !== undefined ? (
        <p className="text-xs font-medium text-status-success-text bg-status-success-bg rounded-md px-3 py-2">
          Saved {state.saved} {state.saved === 1 ? 'entry' : 'entries'}.
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={pending || blocked} className={buttonClass}>
          {pending ? 'Saving…' : 'Save wording'}
        </button>
      </div>
    </form>
  )
}
