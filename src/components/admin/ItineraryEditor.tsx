'use client'

import { useState } from 'react'
import { inputClass, textareaClass, labelClass, secondaryButtonClass } from './form'

export interface ItineraryDayInput {
  day: number
  title: string
  description: string
  activities: string
  overnight: string
  meals: string
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ItineraryEditor({ name, defaultValue }: { name: string; defaultValue?: ItineraryDayInput[] }) {
  const [rows, setRows] = useState<ItineraryDayInput[]>(defaultValue ?? [])

  function update(i: number, patch: Partial<ItineraryDayInput>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((prev) => [...prev, { day: prev.length + 1, title: '', description: '', activities: '', overnight: '', meals: '' }])
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const serialized = rows.map((r) => ({
    day: r.day,
    title: r.title,
    description: r.description,
    activities: splitList(r.activities),
    overnight: r.overnight,
    meals: splitList(r.meals),
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>Itinerary</label>
        <button type="button" onClick={addRow} className={secondaryButtonClass}>
          + Add day
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />
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
            <input
              placeholder="Title"
              value={row.title}
              onChange={(e) => update(i, { title: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder="Description"
              rows={2}
              value={row.description}
              onChange={(e) => update(i, { description: e.target.value })}
              className={textareaClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Activities (comma-separated)"
                value={row.activities}
                onChange={(e) => update(i, { activities: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Overnight (e.g. Ger Camp)"
                value={row.overnight}
                onChange={(e) => update(i, { overnight: e.target.value })}
                className={inputClass}
              />
            </div>
            <input
              placeholder="Meals (comma-separated, e.g. breakfast, lunch)"
              value={row.meals}
              onChange={(e) => update(i, { meals: e.target.value })}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
