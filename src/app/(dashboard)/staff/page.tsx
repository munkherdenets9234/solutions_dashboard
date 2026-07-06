import { listTenantUsers } from '@/lib/data/tenant-users'
import { updateStaffStatusAction, resetStaffPasswordAction } from './actions'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusActions } from '@/components/admin/StatusActions'
import { ResetPasswordButton } from '@/components/admin/ResetPasswordButton'
import { CreateStaffForm } from '@/components/admin/CreateStaffForm'
import type { TenantUser } from '@/lib/types'

const STAFF_FLOW: Record<string, string[]> = {
  active: ['suspended'],
  suspended: ['active'],
}

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { data, meta } = await listTenantUsers(page, 20)

  const columns: Column<TenantUser>[] = [
    { header: 'Name', render: (u) => <span className="font-semibold">{u.name}</span> },
    { header: 'Email', render: (u) => u.email },
    { header: 'Role', render: (u) => <StatusBadge status={u.role} /> },
    { header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    {
      header: '',
      render: (u) => (
        <div className="flex items-center gap-3">
          <StatusActions status={u.status} action={updateStaffStatusAction.bind(null, u.id)} flow={STAFF_FLOW} />
          <ResetPasswordButton action={resetStaffPasswordAction.bind(null, u.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Staff</h1>
        <p className="text-[13px] text-body mt-1">Login profiles for this tenant — one admin, plus any number of staff.</p>
      </div>

      <CreateStaffForm />

      <DataTable columns={columns} rows={data} getRowKey={(u) => u.id} meta={meta} basePath="/staff" emptyMessage="No staff users yet." />
    </div>
  )
}
