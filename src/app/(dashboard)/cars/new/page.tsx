import { createCarAction } from '../actions'
import { CarForm } from '@/components/admin/CarForm'

export default function NewCarPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">New car</h1>
        <p className="text-[13px] text-body mt-1">Add a car to the rental fleet.</p>
      </div>
      <CarForm action={createCarAction} submitLabel="Create car" />
    </div>
  )
}
