'use client'

import { useState } from 'react'
import { LOCALES, type LocaleMap, type LocaleListMap } from '@/lib/types'
import { inputClass, labelClass, secondaryButtonClass } from './form'
import { MultiLangFieldBase } from './MultiLangField'

export interface ItineraryDayInput {
  day: number
  title: LocaleMap
  description: LocaleMap
  activities: LocaleMap // comma-separated text per locale, split into a list per locale at submit
  overnight: LocaleMap
  meals: LocaleMap // comma-separated text per locale
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitLocaleList(value: LocaleMap): LocaleListMap {
  const out: LocaleListMap = {}
  for (const locale of LOCALES) {
    const v = value[locale]
    if (v) out[locale] = splitList(v)
  }
  return out
}

export function ItineraryEditor({ name, defaultValue }: { name: string; defaultValue?: ItineraryDayInput[] }) {
  const [rows, setRows] = useState<ItineraryDayInput[]>(defaultValue ?? [])

  function update(i: number, patch: Partial<ItineraryDayInput>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((prev) => [...prev, { day: prev.length + 1, title: {}, description: {}, activities: {}, overnight: {}, meals: {} }])
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const serialized = rows.map((r) => ({
    day: r.day,
    title: r.title,
    description: r.description,
    activities: splitLocaleList(r.activities),
    overnight: r.overnight,
    meals: splitLocaleList(r.meals),
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>Itinerary</label>
        <button type="button" onClick={addRow} className={secondaryButtonClass}>
          + Add day
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} readOnly />
      {rows.length === 0 ? <p className="text-xs text-muted">No itinerary days added.</p> : null}
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 border border-hairline rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-body">Day</span>
                <input
                  type="number"
                  min={1}
                  value={row.day}
                  onChange={(e) => update(i, { day: Number(e.target.value) || 1 })}
                  className={`${inputClass} w-16`}
                />
              </div>
              <button type="button" onClick={() => removeRow(i)} className="text-xs text-status-cancelled-text">
                Remove
              </button>
            </div>
            <MultiLangFieldBase
              label="Title"
              values={row.title}
              onChange={(v) => update(i, { title: v })}
              placeholder="Title"
            />
            <MultiLangFieldBase
              label="Description"
              values={row.description}
              onChange={(v) => update(i, { description: v })}
              multiline
              rows={2}
              placeholder="Description"
            />
            <div className="grid grid-cols-2 gap-2">
              <MultiLangFieldBase
                label="Activities (comma-separated)"
                values={row.activities}
                onChange={(v) => update(i, { activities: v })}
                placeholder="Hiking, Wildlife spotting"
              />
              <MultiLangFieldBase
                label="Overnight"
                values={row.overnight}
                onChange={(v) => update(i, { overnight: v })}
                placeholder="Ger Camp"
              />
            </div>
            <MultiLangFieldBase
              label="Meals (comma-separated)"
              values={row.meals}
              onChange={(v) => update(i, { meals: v })}
              placeholder="breakfast, lunch, dinner"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
