import { createDestinationAction } from '../actions'
import { DestinationForm } from '@/components/admin/DestinationForm'

export default function NewTourPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">New tour</h1>
        <p className="text-[13px] text-body mt-1">Create a new destination.</p>
      </div>
      <DestinationForm action={createDestinationAction} submitLabel="Create tour" />
    </div>
  )
}
