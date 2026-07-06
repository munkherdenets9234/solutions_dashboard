import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { Sidebar } from '@/components/admin/Sidebar'
import { Topbar } from '@/components/admin/Topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.email} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar email={session.email} />
        <div className="flex-1 overflow-auto px-7 py-6">{children}</div>
      </div>
    </div>
  )
}
