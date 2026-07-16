'use client'

import { useState } from 'react'
import { LOCALES, DEFAULT_LOCALE, type Locale, type LocaleMap } from '@/lib/types'
import { inputClass, textareaClass, labelClass } from './form'

const localeLabel: Record<Locale, string> = { en: 'EN', mn: 'MN', ko: 'KO' }

// Controlled locale-tabbed input/textarea, with no hidden input of its own —
// for embedding inside components that own their own serialization (e.g.
// ItineraryEditor's per-day rows, which serialize the whole array as one
// hidden JSON input). Top-level form fields should use `MultiLangField`
// below instead.
export function MultiLangFieldBase({
  label,
  values,
  onChange,
  multiline,
  rows = 3,
  placeholder,
}: {
  label?: string
  values: LocaleMap
  onChange: (values: LocaleMap) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}) {
  const [active, setActive] = useState<Locale>(DEFAULT_LOCALE)

  function update(locale: Locale, value: string) {
    onChange({ ...values, [locale]: value })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label ? <label className={labelClass}>{label}</label> : <span />}
        <div className="flex gap-1">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActive(locale)}
              className={`h-6 px-2 rounded text-[11px] font-semibold uppercase ${
                active === locale ? 'bg-ink text-ink-contrast' : 'text-body hover:bg-hairline-soft'
              }`}
            >
              {localeLabel[locale]}
              {!values[locale] ? <span className="ml-1 text-status-cancelled-text">•</span> : null}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={values[active] ?? ''}
          onChange={(e) => update(active, e.target.value)}
          className={textareaClass}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={values[active] ?? ''}
          onChange={(e) => update(active, e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  )
}

// A single translatable form field (input or textarea) with locale tabs,
// serializing to one hidden JSON input — same pattern as RichTextEditor's
// hidden HTML input, so actions.ts only needs
// `jsonField<Record<Locale,string>>` instead of `String(...)`.
export function MultiLangField({
  name,
  label,
  defaultValue,
  multiline,
  rows,
  placeholder,
}: {
  name: string
  label: string
  defaultValue?: LocaleMap
  multiline?: boolean
  rows?: number
  placeholder?: string
}) {
  const [values, setValues] = useState<LocaleMap>(defaultValue ?? {})

  return (
    <div className="flex flex-col gap-1.5">
      <MultiLangFieldBase label={label} values={values} onChange={setValues} multiline={multiline} rows={rows} placeholder={placeholder} />
      <input type="hidden" name={name} value={JSON.stringify(values)} readOnly />
    </div>
  )
}
