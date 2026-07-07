import Link from 'next/link'
import { listCustomers } from '@/lib/data/customers'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ErrorNotice } from '@/components/admin/ErrorNotice'
import { inputClass, buttonClass, secondaryButtonClass } from '@/components/admin/form'
import { ApiError } from '@/lib/api/client'
import { apiErrorMessage } from '@/lib/api/safe'
import type { Customer } from '@/lib/types'

const LIMIT = 10
// The API caps `limit` at 100 per request and has no search endpoint, so a
// query pages through up to this many records and filters in memory instead
// of paging server-side (mirrors the bookings page's approach).
const SEARCH_MAX_RECORDS = 500
const API_PAGE_SIZE = 100

async function fetchAllCustomersForSearch(): Promise<Customer[]> {
  const first = await listCustomers(1, API_PAGE_SIZE)
  const all = [...first.data]
  const total = Math.min(first.meta?.total ?? all.length, SEARCH_MAX_RECORDS)

  let page = 2
  while (all.length < total) {
    const next = await listCustomers(page, API_PAGE_SIZE)
    if (next.data.length === 0) break
    all.push(...next.data)
    page += 1
  }

  return all
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q: qParam } = await searchParams
  const q = qParam?.trim() ?? ''
  const page = Math.max(1, Number(pageParam) || 1)

  let data: Customer[]
  let meta: { total: number; page: number; limit: number } | undefined

  try {
    if (q) {
      const all = await fetchAllCustomersForSearch()
      const needle = q.toLowerCase()
      const filtered = all.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle) ||
          c.phone.toLowerCase().includes(needle)
      )
      meta = { total: filtered.length, page, limit: LIMIT }
      data = filtered.slice((page - 1) * LIMIT, page * LIMIT)
    } else {
      const result = await listCustomers(page, LIMIT)
      data = result.data
      meta = result.meta
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="flex flex-col gap-5">
          <h1 className="text-[26px] font-extrabold tracking-tight">Customers</h1>
          <p className="text-[13px] text-body mt-1">Only tenant admins can view customer records.</p>
        </div>
      )
    }
    return <ErrorNotice message={apiErrorMessage(err)} />
  }

  const columns: Column<Customer>[] = [
    {
      header: 'Name',
      render: (c) => (
        <Link href={`/customers/${c.id}`} className="font-semibold hover:underline">
          {c.name}
        </Link>
      ),
    },
    { header: 'Email', render: (c) => c.email },
    { header: 'Phone', render: (c) => c.phone || '—' },
    { header: 'Bookings', align: 'right', render: (c) => c.booking_count },
    { header: 'Rentals', align: 'right', render: (c) => c.rental_count },
    { header: 'Transfers', align: 'right', render: (c) => c.airport_transfer_count },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Customers</h1>
        <p className="text-[13px] text-body mt-1">
          {meta?.total ?? data.length} customers{q ? ' matching your search' : ' total'}.
        </p>
      </div>

      <form action="/customers" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or phone…"
          className={inputClass}
        />
        <button type="submit" className={buttonClass}>
          Search
        </button>
        {q ? (
          <Link href="/customers" className={`${secondaryButtonClass} flex items-center`}>
            Clear
          </Link>
        ) : null}
      </form>

      <DataTable
        columns={columns}
        rows={data}
        getRowKey={(c) => c.id}
        meta={meta}
        basePath="/customers"
        query={{ q: q || undefined }}
        emptyMessage={q ? 'No customers match your search.' : 'No customers yet.'}
      />
    </div>
  )
}
