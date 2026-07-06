'use client'

import { usePathname } from 'next/navigation'
import { navLabelForPath } from '@/lib/nav'

export function Topbar({ email }: { email: string }) {
  const pathname = usePathname()
  const label = navLabelForPath(pathname)

  return (
    <div className="flex items-center justify-between gap-4 px-7 py-3 border-b border-hairline bg-panel">
      <div className="text-[12.5px] font-medium text-muted">
        Admin <span className="text-input-border mx-1">/</span>
        <span className="text-ink font-semibold">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-6 w-[300px] h-[34px] px-2.5 border border-input-border rounded-md bg-panel">
        <span className="text-[12.5px] font-medium text-muted truncate">Search tours, bookings, travelers…</span>
        <span className="text-[10px] font-medium font-mono text-muted border border-input-border rounded px-1 py-px bg-sidebar shrink-0">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        <div className="w-8 h-8 rounded-md border border-input-border flex items-center justify-center relative">
          <span className="text-[13px]">🔔</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-input-border" />
          <span className="text-[12.5px] font-semibold truncate max-w-[120px]">{email}</span>
        </div>
      </div>
    </div>
  )
}
