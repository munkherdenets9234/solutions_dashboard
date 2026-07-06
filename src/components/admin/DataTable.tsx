import Link from 'next/link'

export interface Column<T> {
  header: string
  align?: 'left' | 'right'
  render: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  meta?: { total: number; page: number; limit: number }
  basePath?: string
  emptyMessage?: string
}

export function DataTable<T>({ columns, rows, getRowKey, meta, basePath, emptyMessage }: DataTableProps<T>) {
  const page = meta?.page ?? 1
  const limit = meta?.limit ?? rows.length
  const total = meta?.total ?? rows.length
  const lastPage = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1

  return (
    <div className="border border-hairline rounded-[10px] bg-panel overflow-hidden">
      <div
        className="grid px-[18px] py-2.5 border-b border-hairline bg-canvas"
        style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}
      >
        {columns.map((col) => (
          <span
            key={col.header}
            className={`text-[10.5px] font-semibold text-muted uppercase tracking-wider ${col.align === 'right' ? 'text-right' : ''}`}
          >
            {col.header}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="px-[18px] py-10 text-center text-sm text-muted">{emptyMessage ?? 'No records found.'}</div>
      ) : (
        rows.map((row) => (
          <div
            key={getRowKey(row)}
            className="grid px-[18px] py-3 border-b border-hairline-soft last:border-b-0 items-center"
            style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}
          >
            {columns.map((col) => (
              <div key={col.header} className={`text-[12.5px] ${col.align === 'right' ? 'text-right' : ''}`}>
                {col.render(row)}
              </div>
            ))}
          </div>
        ))
      )}

      {meta ? (
        <div className="flex items-center justify-between px-[18px] py-3">
          <span className="text-xs font-medium text-muted">
            {total} record{total === 1 ? '' : 's'} total
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-body">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-1">
              <Link
                href={`${basePath}?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
                className={`w-7 h-7 border border-input-border rounded-md flex items-center justify-center text-xs ${
                  page <= 1 ? 'pointer-events-none text-input-border' : 'text-body hover:bg-hairline-soft'
                }`}
              >
                ‹
              </Link>
              <Link
                href={`${basePath}?page=${Math.min(lastPage, page + 1)}`}
                aria-disabled={page >= lastPage}
                className={`w-7 h-7 border border-input-border rounded-md flex items-center justify-center text-xs ${
                  page >= lastPage ? 'pointer-events-none text-input-border' : 'text-body hover:bg-hairline-soft'
                }`}
              >
                ›
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
