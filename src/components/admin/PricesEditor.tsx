'use client'

import { useState } from 'react'
import { inputClass, labelClass, secondaryButtonClass } from './form'

export interface PriceInput {
  min_people: string
  max_people: string
  price_usd: string
}

export function PricesEditor({ name, defaultValue }: { name: string; defaultValue?: PriceInput[] }) {
  const [rows, setRows] = useState<PriceInput[]>(defaultValue ?? [])

  function update(i: number, patch: Partial<PriceInput>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((prev) => [...prev, { min_people: '', max_people: '', price_usd: '' }])
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>Prices (by group size)</label>
        <button type="button" onClick={addRow} className={secondaryButtonClass}>
          + Add price tier
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
      {rows.length === 0 ? <p className="text-xs text-muted">No price tiers added.</p> : null}
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border border-hairline rounded-md p-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted">Min people</label>
              <input
                type="number"
                min={1}
                value={row.min_people}
                onChange={(e) => update(i, { min_people: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted">Max people</label>
              <input
                type="number"
                min={1}
                value={row.max_people}
                onChange={(e) => update(i, { max_people: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted">Price (USD)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={row.price_usd}
                onChange={(e) => update(i, { price_usd: e.target.value })}
                className={inputClass}
              />
            </div>
            <button type="button" onClick={() => removeRow(i)} className="text-xs text-status-cancelled-text pb-2">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
