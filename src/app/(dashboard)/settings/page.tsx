import { getSession } from '@/lib/auth/session'
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm'

export default async function SettingsPage() {
  const session = await getSession()

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Settings</h1>
        <p className="text-[13px] text-body mt-1">Signed in as {session?.email}.</p>
      </div>

      <div className="border border-hairline rounded-[10px] bg-panel p-5">
        <div className="font-bold text-[15px] mb-4">Change password</div>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
