import { notFound } from 'next/navigation'
import { getCarBySlug } from '@/lib/data/cars'
import { updateCarAction, deleteCarAction } from '../../actions'
import { CarForm } from '@/components/admin/CarForm'
import { secondaryButtonClass } from '@/components/admin/form'
import { LastEditedBy } from '@/components/admin/LastEditedBy'
import { ApiError } from '@/lib/api/client'

export default async function EditCarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let car
  try {
    car = (await getCarBySlug(slug)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const boundUpdate = updateCarAction.bind(null, car.id)
  const boundDelete = deleteCarAction.bind(null, car.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Edit car</h1>
          <p className="text-[13px] text-body mt-1">{car.name}</p>
          <LastEditedBy lastEditedBy={car.lastEditedBy} />
        </div>
        <form action={boundDelete}>
          <button type="submit" className={secondaryButtonClass}>
            Delete
          </button>
        </form>
      </div>
      <CarForm action={boundUpdate} defaultValues={car} submitLabel="Save changes" isEdit />
    </div>
  )
}
