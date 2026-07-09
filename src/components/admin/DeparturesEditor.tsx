'use client'

import { useState } from 'react'
import { inputClass, labelClass, secondaryButtonClass } from './form'

export interface DepartureInput {
  start_date: string
  end_date: string
  available: boolean
}

export function DeparturesEditor({ name, defaultValue }: { name: string; defaultValue?: DepartureInput[] }) {
  const [rows, setRows] = useState<DepartureInput[]>(defaultValue ?? [])

  function update(i: number, patch: Partial<DepartureInput>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((prev) => [...prev, { start_date: '', end_date: '', available: true }])
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>Departures</label>
        <button type="button" onClick={addRow} className={secondaryButtonClass}>
          + Add departure
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.length === 0 ? <p className="text-xs text-muted">No departures added.</p> : null}
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end border border-hairline rounded-md p-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted">Start date</label>
              <input
                type="date"
                value={row.start_date}
                onChange={(e) => update(i, { start_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted">End date</label>
              <input
                type="date"
                value={row.end_date}
                onChange={(e) => update(i, { end_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-body pb-2">
              <input type="checkbox" checked={row.available} onChange={(e) => update(i, { available: e.target.checked })} />
              Available
            </label>
            <button type="button" onClick={() => removeRow(i)} className="text-xs text-status-cancelled-text pb-2">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
