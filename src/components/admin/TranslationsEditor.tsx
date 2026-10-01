'use client'

import { useActionState, useState } from 'react'
import type { TranslationsFormState } from '@/app/(dashboard)/translations/actions'
import { LOCALES, type Locale, type TranslationEntry, type TranslationValue } from '@/lib/types'
import { entryKeys, entryKind, isIdentifierKey, matchesKind, serialize, type TranslationKind } from '@/lib/translations-edit.mjs'
import { inputClass, textareaClass, labelClass, buttonClass, secondaryButtonClass, errorClass } from './form'

type Values = Partial<Record<Locale, TranslationValue>>
type Item = Record<string, string>
// Kind and keys are fixed per row when the editor mounts and travel with the
// row, so a re-render with fresh server data can never misalign them.
interface Row {
  path: string
  values: Values
  kind: TranslationKind
  keys: string[]
}

const localeLabel: Record<Locale, string> = { en: 'EN', mn: 'MN', ko: 'KO' }

// Mirrors the server limits so an over-size payload is refused here with a
// message instead of failing at the transport.
const MAX_ENTRIES = 1000
const MAX_BODY_BYTES = 512 * 1024

function toRows(entries: TranslationEntry[]): Row[] {
  return entries.map((e) => ({
    path: e.path,
    values: e.values,
    kind: entryKind(e.values, LOCALES),
    keys: entryKeys(e.values, LOCALES),
  }))
}

function asStrings(v: TranslationValue | undefined): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function asItems(v: TranslationValue | undefined): Item[] {
  return Array.isArray(v) ? v.filter((x): x is Item => typeof x === 'object' && x !== null) : []
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

// Items added with "+ Add item" in this session. Identifier fields (key, id,
// icon) are read-only on stored items but typeable here, so a new item is
// usable. Keyed by object identity; update() carries the mark to the copy.
const addedItems = new WeakSet<Item>()

function ObjectListCell({ items, keys, onChange }: { items: Item[]; keys: string[]; onChange: (items: Item[]) => void }) {
  function update(i: number, key: string, value: string) {
    onChange(
      items.map((it, idx) => {
        if (idx !== i) return it
        const next = { ...it, [key]: value }
        if (addedItems.has(it)) addedItems.add(next)
        return next
      }),
    )
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
          {keys.map((key) => {
            const locked = isIdentifierKey(key) && !addedItems.has(item)
            return (
              <label key={key} className="flex flex-col gap-1">
                <span className={labelClass}>
                  {key}
                  {locked && <span className="ml-2 text-[11px] font-normal text-muted">identifier — change in code</span>}
                </span>
                <input
                  type="text"
                  value={item[key] ?? ''}
                  readOnly={locked}
                  onChange={(e) => update(i, key, e.target.value)}
                  className={locked ? `${inputClass} opacity-60 cursor-not-allowed` : inputClass}
                />
              </label>
            )
          })}
        </div>
      ))}
      <div>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            const fresh: Item = Object.fromEntries(keys.map((k) => [k, '']))
            addedItems.add(fresh)
            onChange([...items, fresh])
          }}
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
  const [rows, setRows] = useState<Row[]>(() => toRows(initialEntries))
  const [state, formAction, pending] = useActionState(action, {})

  function setValue(i: number, locale: Locale, value: TranslationValue) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, values: { ...r.values, [locale]: value } } : r)))
  }

  const payload = serialize(rows, LOCALES)
  const json = JSON.stringify(payload)
  const tooMany = payload.length > MAX_ENTRIES
  const tooBig = new Blob([JSON.stringify({ entries: payload })]).size > MAX_BODY_BYTES
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
        {rows.map((entry, i) => (
          <div
            key={entry.path}
            className="grid grid-cols-1 md:grid-cols-[180px_repeat(3,minmax(0,1fr))] gap-3 border border-hairline rounded-[10px] bg-panel p-3"
          >
            <div className="text-xs font-semibold text-body break-all pt-1">{entry.path}</div>
            {LOCALES.map((locale) => {
              const v = entry.values[locale]
              if (!matchesKind(entry.kind, v)) {
                return (
                  <div key={locale} className="flex flex-col gap-1 min-w-0">
                    <span className="md:hidden text-[11px] font-semibold text-muted uppercase">{localeLabel[locale]}</span>
                    <p className="text-xs text-muted border border-hairline rounded-md px-3 py-2">
                      Unsupported shape, kept as is.
                    </p>
                  </div>
                )
              }
              return (
                <div key={locale} className="flex flex-col gap-1 min-w-0">
                  <span className="md:hidden text-[11px] font-semibold text-muted uppercase">{localeLabel[locale]}</span>
                  {entry.kind === 'string' ? (
                    <textarea
                      rows={3}
                      value={typeof v === 'string' ? v : ''}
                      onChange={(e) => setValue(i, locale, e.target.value)}
                      className={textareaClass}
                    />
                  ) : entry.kind === 'strings' ? (
                    <StringListCell items={asStrings(v)} onChange={(items) => setValue(i, locale, items)} />
                  ) : (
                    <ObjectListCell items={asItems(v)} keys={entry.keys} onChange={(items) => setValue(i, locale, items)} />
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
